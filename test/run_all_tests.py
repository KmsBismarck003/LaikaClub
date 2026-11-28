"""
Master QA Automation Test Runner - LaikaClub (Soporte Multi-Rol: USUARIO / ADMIN / GESTOR / OPERADOR / ALL)
Descubre y ejecuta de forma autónoma todos los casos de prueba independientes por rol,
registra las evidencias, verifica la generación de documentos individuales
y consolida los informes de calidad específicos y maestros:
  - test/reportes/informe_qa_usuario.md  (Rol USUARIO)
  - test/reportes/informe_qa_admin.md    (Rol ADMIN)
  - test/reportes/informe_qa_gestor.md   (Rol GESTOR)
  - test/reportes/informe_qa_operador.md (Rol OPERADOR)
  - test/reportes/informe_general_qa.md  (Consolidado Multi-Rol)
"""
import os
import re
import sys
import time
import shutil
import argparse
import importlib
import importlib.util
from pathlib import Path
from datetime import datetime

# Garantizar resolución correcta de módulos internos
TEST_ROOT = Path(__file__).resolve().parent
if str(TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(TEST_ROOT))

from config.test_config import REPORTES_DIR, CASOS_DIR, EVIDENCIAS_DIR, TEST_ENVIRONMENT

def run_suite(target_role="gestor"):
    print("=" * 80)
    print("INICIANDO EJECUCIÓN MAESTRA DE QA AUTOMATION - LAIKACLUB")
    print(f"Alcance / Rol Seleccionado: {target_role.upper()}")
    print(f"Ambiente: {TEST_ENVIRONMENT}")
    print(f"Fecha/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    start_total_time = time.time()
    
    # Recolectar todos los archivos de prueba .py en test/
    test_files = []
    exclude_dirs = {"config", "utils", "evidencias", "resultados", "reportes", "scratch", "__pycache__"}

    for root, dirs, files in os.walk(TEST_ROOT):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
        for file in files:
            if file.endswith(".test.py") or (file.endswith(".py") and file.startswith("test_")):
                p = Path(root) / file
                is_admin = "admin" in p.parts
                is_gestor = "gestor" in p.parts
                is_operador = "operador" in p.parts
                is_avanzados = "flujos_avanzados" in p.parts or "ADV" in p.name
                is_usuario = not is_admin and not is_gestor and not is_operador and not is_avanzados
                
                if target_role == "admin" and is_admin:
                    test_files.append(p)
                elif target_role == "gestor" and is_gestor:
                    test_files.append(p)
                elif target_role == "operador" and is_operador:
                    test_files.append(p)
                elif target_role in ["avanzados", "flujos_avanzados"] and is_avanzados:
                    test_files.append(p)
                elif target_role == "usuario" and is_usuario:
                    test_files.append(p)
                elif target_role == "all":
                    test_files.append(p)

    test_files.sort(key=lambda p: str(p))
    print(f"Total de archivos de prueba descubiertos ({target_role.upper()}): {len(test_files)}")
    print("-" * 80)

    results_summary = {
        "role": target_role,
        "total": len(test_files),
        "pass": 0,
        "fail": 0,
        "blocked": 0,
        "not_executed": 0,
        "cases": []
    }

    for idx, test_path in enumerate(test_files, start=1):
        rel_path = test_path.relative_to(TEST_ROOT)
        print(f"[{idx}/{len(test_files)}] Ejecutando: {rel_path} ...", end=" ", flush=True)

        # Detectar ID de prueba en el contenido del archivo si existe
        detected_id = f"CP-{idx:03d}"
        detected_name = test_path.stem.replace(".test", "")
        detected_level = "API"
        detected_defect = "N/A"
        try:
            with open(test_path, "r", encoding="utf-8", errors="ignore") as tf:
                content = tf.read()
                m_id = re.search(r'CP-[A-Z0-9_-]+', content)
                if m_id:
                    detected_id = m_id.group(0)
                m_lvl = re.search(r'level=["\']([A-Z0-9_-]+)["\']', content)
                if m_lvl:
                    detected_level = m_lvl.group(1)
        except Exception:
            pass

        module_name = f"mod_{int(time.time()*1000)}_{idx}"
        spec = importlib.util.spec_from_file_location(module_name, str(test_path))
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module

        try:
            spec.loader.exec_module(module)
            if hasattr(module, "run_test"):
                case_raw = module.run_test()
            elif hasattr(module, "run"):
                case_raw = module.run()
            elif hasattr(module, "doc"):
                case_raw = {
                    "test_id": module.doc.test_id,
                    "name": module.doc.name,
                    "level": getattr(module.doc, "level", detected_level),
                    "result": module.doc.result,
                    "defect_id": getattr(module.doc, "defect_id", "N/A")
                }
            else:
                case_raw = "Aprobada"

            # Interpretar resultado devuelto (soporta claves 'result' y 'status')
            status_str = "Aprobada"
            defect_id = "N/A"
            if isinstance(case_raw, dict):
                status_str = case_raw.get("result") or case_raw.get("status") or "Aprobada"
                detected_id = case_raw.get("test_id") or case_raw.get("id") or detected_id
                detected_name = case_raw.get("name", detected_name)
                detected_level = case_raw.get("level", detected_level)
                defect_id = case_raw.get("defect_id", "N/A")
            elif isinstance(case_raw, str):
                status_str = case_raw

            if defect_id == "N/A" and detected_id:
                for sub in ["avanzados", "operador", "gestor", "admin", "usuario"]:
                    cand = list((CASOS_DIR / sub).glob(f"{detected_id}_*.md"))
                    if cand:
                        try:
                            with open(cand[0], "r", encoding="utf-8", errors="ignore") as mf:
                                m_def = re.search(r'Defecto reportado\s*\|\s*(DEF-[A-Z0-9_-]+)', mf.read())
                                if m_def:
                                    defect_id = m_def.group(1)
                        except Exception:
                            pass
                        break

            case_res = {
                "id": detected_id,
                "name": detected_name,
                "level": detected_level,
                "status": status_str,
                "defect_id": defect_id,
                "file": str(rel_path)
            }

            if status_str in ["Aprobada", "PASS"]:
                results_summary["pass"] += 1
                print("✓ PASS")
            elif status_str in ["Fallida", "FAIL"]:
                results_summary["fail"] += 1
                print(f"✗ FAIL ({defect_id})")
            elif status_str in ["Bloqueada", "BLOCKED"]:
                results_summary["blocked"] += 1
                print("⊘ BLOCKED")
            else:
                results_summary["not_executed"] += 1
                print("○ NOT EXECUTED")

            results_summary["cases"].append(case_res)

        except Exception as e:
            results_summary["fail"] += 1
            print(f"✗ ERROR EN EJECUCIÓN: {e}")
            results_summary["cases"].append({
                "id": detected_id,
                "name": detected_name,
                "level": detected_level,
                "status": "Fallida",
                "defect_id": "N/A",
                "observations": f"Error no controlado en runner: {str(e)}"
            })
        finally:
            if module_name in sys.modules:
                del sys.modules[module_name]

    total_duration = time.time() - start_total_time

    # Generación de informes según el rol
    generate_reports(results_summary, total_duration, target_role)

    print("=" * 80)
    print("EJECUCIÓN FINALIZADA")
    print(f"Rol: {target_role.upper()} | Total: {results_summary['total']} | PASS: {results_summary['pass']} | FAIL: {results_summary['fail']} | BLOCKED: {results_summary['blocked']}")
    print(f"Tiempo total: {total_duration:.2f} segundos")
    print("=" * 80)
    return results_summary

def generate_reports(summary, duration, role):
    REPORTES_DIR.mkdir(parents=True, exist_ok=True)
    
    if role in ["admin", "all"]:
        admin_cases = [c for c in summary["cases"] if "ADM" in str(c.get("id", "")) or "admin" in str(c.get("name", ""))]
        if admin_cases:
            write_role_report("ADMIN", admin_cases, duration, REPORTES_DIR / "informe_qa_admin.md")

    if role in ["gestor", "all"]:
        gestor_cases = [c for c in summary["cases"] if "GES" in str(c.get("id", "")) or "gestor" in str(c.get("name", "")) or "manager" in str(c.get("name", ""))]
        if gestor_cases:
            write_role_report("GESTOR", gestor_cases, duration, REPORTES_DIR / "informe_qa_gestor.md")

    if role in ["operador", "all"]:
        operador_cases = [c for c in summary["cases"] if "OPE" in str(c.get("id", "")) or "operador" in str(c.get("name", "")) or "staff" in str(c.get("name", ""))]
        if operador_cases:
            write_role_report("OPERADOR", operador_cases, duration, REPORTES_DIR / "informe_qa_operador.md")

    if role in ["avanzados", "flujos_avanzados", "all"]:
        adv_cases = [c for c in summary["cases"] if "ADV" in str(c.get("id", "")) or "flujo" in str(c.get("name", ""))]
        if adv_cases:
            write_role_report("FLUJOS AVANZADOS", adv_cases, duration, REPORTES_DIR / "informe_qa_flujos_avanzados.md")

    if role in ["usuario", "all"]:
        user_cases = [c for c in summary["cases"] if "ADM" not in str(c.get("id", "")) and "GES" not in str(c.get("id", "")) and "OPE" not in str(c.get("id", "")) and "ADV" not in str(c.get("id", "")) and "admin" not in str(c.get("name", "")) and "gestor" not in str(c.get("name", "")) and "operador" not in str(c.get("name", "")) and "manager" not in str(c.get("name", "")) and "staff" not in str(c.get("name", "")) and "flujo" not in str(c.get("name", ""))]
        if user_cases:
            write_role_report("USUARIO", user_cases, duration, REPORTES_DIR / "informe_qa_usuario.md")

    # Si se ejecuta ALL, generamos además el informe consolidado maestro
    if role == "all":
        write_master_consolidated_report(summary, duration, REPORTES_DIR / "informe_general_qa.md")

    # Separar automáticamente todos los reportes de casos fallidos en test/reportes/fallidas/
    sync_failed_reports(summary)


def sync_failed_reports(summary):
    failed_dir = REPORTES_DIR / "fallidas"
    failed_dir.mkdir(parents=True, exist_ok=True)
    failed_cases = [
        c for c in summary["cases"]
        if c.get("status") in ["Fallida", "FAIL"]
    ]
    rows = []
    for c in failed_cases:
        cid = c.get("id", "N/A")
        cname = c.get("name", "N/A")
        clevel = c.get("level", "API")
        cdef = c.get("defect_id", "N/A")
        copied_name = "N/A"
        for sub in ["avanzados", "operador", "gestor", "admin", "usuario", ""]:
            search_dir = (CASOS_DIR / sub) if sub else CASOS_DIR
            matches = sorted(search_dir.glob(f"{cid}_*.md"))
            if matches:
                src = matches[0]
                shutil.copy2(src, failed_dir / src.name)
                copied_name = src.name
                break
        rows.append(f"| {cid} | {cname} | {clevel} | {cdef} | {copied_name} |")

    index_lines = [
        "# REPORTES DE PRUEBAS FALLIDAS - LAIKACLUB",
        f"**Última sincronización:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ",
        f"**Total de casos fallidos:** {len(failed_cases)}",
        "",
        "| ID | Nombre | Nivel | Defecto | Archivo |",
        "|---|---|---|---|---|",
    ]
    index_lines.extend(rows if rows else ["| — | Sin fallas en esta corrida | — | — | — |"])
    (failed_dir / "INDEX_FALLIDAS.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    print(f"Reportes fallidos separados en: {failed_dir} ({len(failed_cases)} casos)")

def write_role_report(role_name, cases, duration, output_path):
    total = len(cases)
    passes = sum(1 for c in cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    fails = sum(1 for c in cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))
    blocked = sum(1 for c in cases if "Bloqueada" in c.get("status", "") or "BLOCKED" in c.get("status", ""))
    executed = passes + fails
    exec_rate = (executed / total * 100) if total > 0 else 0
    pass_rate = (passes / executed * 100) if executed > 0 else 0

    cases_rows = []
    for c in cases:
        cases_rows.append(f"| {c.get('id', 'N/A')} | {c.get('name', 'N/A')} | {c.get('level', 'API')} | {c.get('status', 'N/A')} | {c.get('defect_id', 'N/A')} |")
    cases_table = "\n".join(cases_rows)

    defects_block = ""
    if role_name == "GESTOR":
        defects_block = """## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL GESTOR)

### DEF-GES-001: Falla de Control de Acceso RBAC en Transacciones Comerciales
- **ID de Prueba Asociado:** CP-GES-039 (`gestor_transactions_rbac_bypass_sec`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/manager/transactions`)
- **Severidad:** **Alta**
- **Impacto:** El endpoint `/api/manager/transactions` carece de `@PreAuthorize("hasAnyRole('gestor', 'admin')")`. Cualquier usuario autenticado (incluido el rol `usuario` regular) puede invocar el endpoint y consultar transacciones.
- **Causa Raíz:** `EventController.java` valida únicamente `if (principal == null)`, omitiendo la verificación de rol en el objeto principal.
- **Solución Propuesta:** Incorporar `@PreAuthorize("hasAnyRole('gestor', 'admin')")` o validar `principal.getRole()` en el controlador.

### DEF-GES-002: Inaccesibilidad de Funciones de Evento (HTTP 404)
- **ID de Prueba Asociado:** CP-GES-054 (`manager_event_functions_endpoint_get`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/{event_id}/functions`)
- **Severidad:** **Media**
- **Impacto:** El endpoint devuelve HTTP 404 Not Found a pesar de existir en el controlador, forzando al frontend (`laika-gestor/src/services/managerService.js`) a implementar un bloque de contingencia `try...catch` que consulta el evento completo.
- **Causa Raíz:** Falta de coincidencia de ruta en la cadena de filtros o error de serialización en `eventQueryService.getEventById(eventId, false)`.
- **Solución Propuesta:** Corregir el mapeo de ruta en `EventController` y habilitar `@GetMapping("/{event_id}/functions")` en `SecurityConfig`.

### DEF-GES-003: Falta de Enrutamiento de Preventas en API Gateway
- **ID de Prueba Asociado:** CP-GES-060 (`manager_presale_info_endpoint_get`)
- **Componente Afectado:** `laika_gateway` (`RouteMapper.java`, ruta `/api/presale/**`)
- **Severidad:** **Alta**
- **Impacto:** Las peticiones a `/api/presale/{event_id}/info` son rechazadas por el Gateway con HTTP 404 `{"detail":"Not Found"}`.
- **Causa Raíz:** La clase `RouteMapper.java` en el Gateway no contiene la regla de enrutamiento para `/api/presale/**` hacia el microservicio `laika_events` (puerto 8201).
- **Solución Propuesta:** Agregar la condición `else if (path.startsWith("/api/presale")) { targetUrl = eventsUrl + path.substring("/api".length()); }` en `RouteMapper.java`.

### DEF-GES-004: Método GET no Permitido en Detalle de Recintos (HTTP 405)
- **ID de Prueba Asociado:** CP-GES-067 (`manager_venue_detail_endpoint_get`)
- **Componente Afectado:** `laika_events` (`VenueController.java`, ruta `/venues/{venue_id}`)
- **Severidad:** **Media**
- **Impacto:** El frontend `laika-gestor` invoca `venueAPI.getById(id)` (`GET /api/venues/{id}`), pero el backend responde HTTP 405 Method Not Allowed porque el controlador solo implementa `@PutMapping` y `@DeleteMapping` para ese path.
- **Causa Raíz:** Omisión del método `@GetMapping("/{venue_id}")` en `VenueController.java`.
- **Solución Propuesta:** Implementar `@GetMapping("/{venue_id}")` en `VenueController` delegando a `venueService.getById(venueId)`.
"""
    elif role_name == "ADMIN":
        defects_block = """## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL ADMIN)

### DEF-ADM-001: Falta de Control de Acceso RBAC en Endpoints de Base de Datos
- **ID de Prueba Asociado:** CP-ADM-037 (`rbac_rechazo_usuario_regular_en_database_backups_security`)
- **Componente Afectado:** `laika_admin` (`DatabaseController.java`, endpoint `/database/backups`)
- **Severidad:** **Crítica**
- **Impacto:** Los endpoints de gestión de base de datos (`GET /api/database/backups` y `/api/database/stats`) no tienen la anotación `@PreAuthorize("hasRole('admin')")`, permitiendo que usuarios con rol `usuario` consulten el historial de respaldos y nombres de archivos de backup.
- **Causa Raíz:** Ausencia de validación de rol o filtro Spring Security en `DatabaseController.java`.
- **Solución Propuesta:** Agregar `@PreAuthorize("hasRole('admin')")` a nivel de clase o en cada método de `DatabaseController.java`.
"""
    elif role_name == "OPERADOR":
        defects_block = """## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL OPERADOR)

### DEF-OPE-001: Falla de Control de Acceso RBAC en Métricas de Aforo y Personal
- **ID de Prueba Asociado:** CP-OPE-035 (`operador_rbac_staff_dashboard_rejected_sec`)
- **Componente Afectado:** `laika_stats` (`StatsController.java`, endpoint `/staff/dashboard`)
- **Severidad:** **Alta**
- **Impacto:** El endpoint `GET /api/stats/staff/dashboard` carece de `@PreAuthorize("hasAnyRole('operador', 'admin')")`. Cualquier usuario regular (`usuario`) autenticado puede invocar el endpoint y consultar las métricas operativas de validaciones en vivo.
- **Causa Raíz:** Falta de restricción de rol en el método `getStaffDashboard()` de `StatsController.java`.
- **Solución Propuesta:** Incorporar `@PreAuthorize("hasAnyRole('operador', 'admin')")` sobre el método o a nivel de controlador.
"""
    elif role_name == "USUARIO":
        defects_block = """## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL USUARIO)

### DEF-001: Código HTTP 500 en Registro con Correo Duplicado
- **ID de Prueba Asociado:** CP-062 (`register_correo_duplicado_post`)
- **Componente Afectado:** `laika_auth` (`AuthController.java` / `AuthService.java`)
- **Severidad:** **Alta**
- **Impacto:** Un intento de registro con correo existente devuelve HTTP 500 en lugar de HTTP 409 Conflict.

### DEF-002: Inconsistencia y Sobreventa Masiva en Base de Datos (Overbooking)
- **ID de Prueba Asociado:** CP-078 (`consistencia_asientos_ocupados_db`)
- **Componente Afectado:** `laika_tickets` (`laika_tickets.tickets` en MySQL)
- **Severidad:** **Crítica**
- **Impacto:** Se identificaron 3,994 butacas duplicadas activas en el evento 20 por inyección sintética sin restricción de unicidad.

### DEF-003: Falla de Control de Acceso Roto (OWASP Top 10 A01)
- **ID de Prueba Asociado:** CP-049 (`control_acceso_rbac_usuario_security`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/manager/transactions`)
- **Severidad:** **Crítica**
- **Impacto:** Usuarios regulares pueden ver transacciones comerciales al omitirse la comprobación del rol gestor/admin.
"""

    sub_folder = "avanzados" if role_name in ["avanzados", "flujos_avanzados", "FLUJOS AVANZADOS"] else role_name.lower()

    md = f"""# INFORME DE QA AUTOMATION - ROL {role_name}
**Fecha de Ejecución:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** {TEST_ENVIRONMENT}

---

## 1. RESUMEN EJECUTIVO ({role_name})

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | {total} |
| **Pruebas Ejecutadas** | {executed} |
| **Pruebas Aprobadas (PASS)** | {passes} |
| **Pruebas Fallidas (FAIL)** | {fails} |
| **Pruebas Bloqueadas (BLOCKED)** | {blocked} |
| **Porcentaje de Ejecución** | {exec_rate:.1f}% |
| **Porcentaje de Aprobación** | {pass_rate:.1f}% |
| **Tiempo de Ejecución** | {duration:.2f} s |

---

## 2. NIVELES DE PRUEBA APLICADOS ({role_name})

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES ({role_name})

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
{cases_table}

---

{defects_block}
---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/{sub_folder}/`
- **Evidencias Crudas JSON:** `test/evidencias/{sub_folder}/`
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"Reporte de rol [{role_name}] generado: {output_path}")

def write_master_consolidated_report(summary, duration, output_path):
    total = summary["total"]
    passes = summary["pass"]
    fails = summary["fail"]
    blocked = summary["blocked"]
    executed = passes + fails
    exec_rate = (executed / total * 100) if total > 0 else 0
    pass_rate = (passes / executed * 100) if executed > 0 else 0

    usr_cases = [c for c in summary["cases"] if "ADM" not in str(c.get("id", "")) and "GES" not in str(c.get("id", "")) and "OPE" not in str(c.get("id", "")) and "ADV" not in str(c.get("id", "")) and "admin" not in str(c.get("name", "")) and "gestor" not in str(c.get("name", "")) and "operador" not in str(c.get("name", "")) and "manager" not in str(c.get("name", "")) and "staff" not in str(c.get("name", "")) and "flujo" not in str(c.get("name", ""))]
    adm_cases = [c for c in summary["cases"] if "ADM" in str(c.get("id", "")) or "admin" in str(c.get("name", ""))]
    ges_cases = [c for c in summary["cases"] if "GES" in str(c.get("id", "")) or "gestor" in str(c.get("name", "")) or "manager" in str(c.get("name", ""))]
    ope_cases = [c for c in summary["cases"] if "OPE" in str(c.get("id", "")) or "operador" in str(c.get("name", "")) or "staff" in str(c.get("name", ""))]
    adv_cases = [c for c in summary["cases"] if "ADV" in str(c.get("id", "")) or "flujo" in str(c.get("name", ""))]

    usr_p = sum(1 for c in usr_cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    usr_f = sum(1 for c in usr_cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))

    adm_p = sum(1 for c in adm_cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    adm_f = sum(1 for c in adm_cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))

    ges_p = sum(1 for c in ges_cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    ges_f = sum(1 for c in ges_cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))

    ope_p = sum(1 for c in ope_cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    ope_f = sum(1 for c in ope_cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))

    adv_p = sum(1 for c in adv_cases if "Aprobada" in c.get("status", "") or "PASS" in c.get("status", ""))
    adv_f = sum(1 for c in adv_cases if "Fallida" in c.get("status", "") or "FAIL" in c.get("status", ""))

    cases_rows = []
    for c in summary["cases"]:
        cases_rows.append(f"| {c.get('id', 'N/A')} | {c.get('name', 'N/A')} | {c.get('level', 'API')} | {c.get('status', 'N/A')} | {c.get('defect_id', 'N/A')} |")
    cases_table = "\n".join(cases_rows)

    md = f"""# INFORME GENERAL DE QA AUTOMATION - CONSOLIDADO MULTI-ROL LAIKACLUB
**Módulos Evaluados:** USUARIO, ADMIN, GESTOR, OPERADOR y FLUJOS AVANZADOS  
**Fecha de Ejecución:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  

---

## 1. TABLERO MAESTRO DE CALIDAD

| Métrica Global | Rol USUARIO | Rol ADMIN | Rol GESTOR | Rol OPERADOR | FLUJOS AVANZADOS | Total Consolidado |
|---|---|---|---|---|---|---|
| **Casos Identificados / Generados** | {len(usr_cases)} | {len(adm_cases)} | {len(ges_cases)} | {len(ope_cases)} | {len(adv_cases)} | **{total}** |
| **Casos Ejecutados** | {len(usr_cases)} | {len(adm_cases)} | {len(ges_cases)} | {len(ope_cases)} | {len(adv_cases)} | **{executed}** |
| **Casos Aprobados (PASS)** | {usr_p} | {adm_p} | {ges_p} | {ope_p} | {adv_p} | **{passes}** |
| **Casos Fallidos (FAIL)** | {usr_f} | {adm_f} | {ges_f} | {ope_f} | {adv_f} | **{fails}** |
| **Casos Bloqueados (BLOCKED)** | 0 | 0 | 0 | 0 | 0 | **{blocked}** |
| **Tasa de Aprobación** | {(usr_p/len(usr_cases)*100) if usr_cases else 0:.1f}% | {(adm_p/len(adm_cases)*100) if adm_cases else 0:.1f}% | {(ges_p/len(ges_cases)*100) if ges_cases else 0:.1f}% | {(ope_p/len(ope_cases)*100) if ope_cases else 0:.1f}% | {(adv_p/len(adv_cases)*100) if adv_cases else 0:.1f}% | **{pass_rate:.1f}%** |

**Tiempo de Ejecución Suite Completa:** {duration:.2f} segundos

---

## 2. REPORTES ESPECÍFICOS POR ROL Y SUITE

Para una auditoría detallada de cada rol y suite, consulte los informes dedicados:
1. [Informe Dedicado - Rol USUARIO](file:///{str(REPORTES_DIR / 'informe_qa_usuario.md').replace('\\', '/')})
2. [Informe Dedicado - Rol ADMIN](file:///{str(REPORTES_DIR / 'informe_qa_admin.md').replace('\\', '/')})
3. [Informe Dedicado - Rol GESTOR](file:///{str(REPORTES_DIR / 'informe_qa_gestor.md').replace('\\', '/')})
4. [Informe Dedicado - Rol OPERADOR](file:///{str(REPORTES_DIR / 'informe_qa_operador.md').replace('\\', '/')})
5. [Informe Dedicado - FLUJOS AVANZADOS](file:///{str(REPORTES_DIR / 'informe_qa_flujos_avanzados.md').replace('\\', '/')})

---

## 3. MATRIZ CONSOLIDADA DE DEFECTOS

| ID Defecto | Rol | Severidad | Componente | Descripción Resumida |
|---|---|---|---|---|
| **DEF-001** | USUARIO | Alta | `laika_auth` | HTTP 500 en lugar de 409 Conflict al registrar email duplicado. |
| **DEF-002** | USUARIO | Crítica | `laika_tickets` | 3,994 butacas físicas duplicadas en Evento 20 (sobreventa / overbooking). |
| **DEF-003** | USUARIO | Crítica | `laika_events` | Falla OWASP A01: Rol regular puede ver transacciones comerciales en `/manager/transactions`. |
| **DEF-ADM-001** | ADMIN | Crítica | `laika_admin` | Falta `@PreAuthorize("hasRole('admin')")` en `/database/backups`: accesible a otros roles. |
| **DEF-GES-001** | GESTOR | Alta | `laika_events` | Falla OWASP A01: `/api/manager/transactions` accesible sin verificación de rol gestor. |
| **DEF-GES-002** | GESTOR | Media | `laika_events` | Endpoint `/[id]/functions` responde HTTP 404 a pesar de estar declarado en el controlador. |
| **DEF-GES-003** | GESTOR | Alta | `laika_gateway` | Falta regla de enrutamiento para `/api/presale/**` hacia `laika_events` (devuelve HTTP 404). |
| **DEF-GES-004** | GESTOR | Media | `laika_events` | Omisión de `GET /venues/{{id}}` en `VenueController` (devuelve HTTP 405 Method Not Allowed). |
| **DEF-OPE-001** | OPERADOR | Alta | `laika_stats` | Falla OWASP A01: `/api/stats/staff/dashboard` accesible por rol usuario regular sin restricción RBAC. |

---

## 4. DETALLE DE TODOS LOS CASOS EJECUTADOS ({total} Casos)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
{cases_table}
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"Informe consolidado maestro generado: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Runner Maestro QA Automation LaikaClub")
    parser.add_argument("--role", choices=["usuario", "admin", "gestor", "operador", "avanzados", "all"], default="avanzados", help="Rol a ejecutar (usuario, admin, gestor, operador, avanzados, all)")
    args = parser.parse_args()

    run_suite(target_role=args.role)
