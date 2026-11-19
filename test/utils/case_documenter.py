"""
Generador automático de documentos de caso de prueba en Markdown individual y evidencias.
Cumple estrictamente con la plantilla corporativa de QA Automation (Sección 8).
"""
import json
import os
import re
from datetime import datetime
from pathlib import Path

from config.test_config import TEST_ENVIRONMENT

# Configuración de rutas relativas seguras
UTILS_DIR = Path(__file__).resolve().parent
TEST_DIR = UTILS_DIR.parent
CASOS_DIR = TEST_DIR / "resultados" / "casos"
EVIDENCIAS_DIR = TEST_DIR / "evidencias"

class TestCaseDocumenter:
    def __init__(self, test_id, name, module, priority="Alta", req="N/A",
                 level="API", test_type="Funcional", technique="Caja negra", execution="Automatizada", role=None):
        self.test_id = test_id
        self.name = name
        self.module = module
        self.priority = priority
        self.req = req
        self.level = level
        self.test_type = test_type
        self.technique = technique
        self.execution = execution
        
        # Auto-detect role or use provided
        if role:
            self.role = role.lower()
        elif "ADM" in test_id.upper() or "admin" in name.lower():
            self.role = "admin"
        elif "GES" in test_id.upper() or "gestor" in name.lower() or "manager" in name.lower():
            self.role = "gestor"
        elif "OPE" in test_id.upper() or "operador" in name.lower() or "staff" in name.lower():
            self.role = "operador"
        elif "ADV" in test_id.upper() or "avanzado" in name.lower() or "flujo" in name.lower():
            self.role = "avanzados"
        else:
            self.role = "usuario"
        
        self.description = ""
        self.objective = ""
        self.preconditions = ""
        self.test_data = ""
        
        self.steps = []
        self.result = "No ejecutada"  # Aprobada / Fallida / Bloqueada / No ejecutada
        self.evidence_file = ""
        self.defect_id = "N/A"
        self.defect_severity = "N/A"
        self.observations = ""
        
        self.start_time = None
        self.end_time = None
        self.evidences_payload = {}

    def set_metadata(self, description, objective, preconditions, test_data):
        self.description = description
        self.objective = objective
        self.preconditions = preconditions
        self.test_data = test_data

    def set_preconditions(self, preconditions):
        self.preconditions = preconditions

    def set_objective(self, objective):
        self.objective = objective

    def set_defect(self, defect_id, severity="Media", observations=""):
        self.defect_id = defect_id
        self.defect_severity = severity
        self.observations = observations

    def start(self):
        self.start_time = datetime.now()

    def add_step(self, num, action, expected="Ejecución correcta", obtained=None, status_icon="✓"):
        """status_icon: ✓ o ✗"""
        if obtained is None and expected != "Ejecución correcta":
            obtained = str(expected)
            expected = "Ejecución correcta"
        self.steps.append({
            "num": num,
            "action": str(action),
            "expected": str(expected),
            "obtained": str(obtained if obtained is not None else "OK"),
            "status": str(status_icon)
        })

    def attach_evidence(self, key, value):
        self.evidences_payload[key] = value

    def finish(self, result_status="Aprobada", defect_id=None, defect_severity=None, observations=None, **kwargs):
        self.end_time = datetime.now()
        
        # Soportar status="PASSED" o status="FAILED"
        if "status" in kwargs:
            res_kw = kwargs["status"].upper()
            result_status = "Aprobada" if "PASS" in res_kw else "Fallida"
        elif str(result_status).upper() in ["PASSED", "PASS"]:
            result_status = "Aprobada"
        elif str(result_status).upper() in ["FAILED", "FAIL"]:
            result_status = "Fallida"
            
        self.result = result_status
        if defect_id is not None:
            self.defect_id = defect_id
        if defect_severity is not None:
            self.defect_severity = defect_severity
        if observations is not None:
            self.observations = observations
        elif "actual" in kwargs:
            self.observations = f"Esperado: {kwargs.get('expected', '')} | Obtenido: {kwargs.get('actual', '')}"

        # Guardar archivo de evidencia en directorio del rol
        slug = self._get_slug()
        evidence_filename = f"{self.test_id}_{slug}_evidence.json"
        
        role_evidencias_dir = EVIDENCIAS_DIR / self.role
        role_evidencias_dir.mkdir(parents=True, exist_ok=True)
        evidence_path = role_evidencias_dir / evidence_filename
        
        full_evidence = {
            "test_id": self.test_id,
            "role": self.role,
            "test_name": self.name,
            "timestamp": self.start_time.isoformat() if self.start_time else datetime.now().isoformat(),
            "execution_duration_sec": (self.end_time - self.start_time).total_seconds() if self.start_time and self.end_time else 0,
            "result": self.result,
            "defect_id": self.defect_id,
            "defect_severity": self.defect_severity,
            "observations": self.observations,
            "payloads": self.evidences_payload
        }
        
        with open(evidence_path, "w", encoding="utf-8") as f:
            json.dump(full_evidence, f, indent=2, ensure_ascii=False)
            
        self.evidence_file = str(evidence_path.relative_to(CASOS_DIR.parent.parent)).replace("\\", "/")

        # Generar documento Markdown individual en directorio del rol
        self._write_markdown_doc(slug)

    def _get_slug(self):
        clean = re.sub(r'[^\w\s-]', '', self.name.lower())
        return re.sub(r'[-\s]+', '_', clean).strip('_')

    def _write_markdown_doc(self, slug):
        doc_filename = f"{self.test_id}_{slug}.md"
        role_casos_dir = CASOS_DIR / self.role
        role_casos_dir.mkdir(parents=True, exist_ok=True)
        doc_path = role_casos_dir / doc_filename

        exec_date = self.start_time.strftime("%Y-%m-%d %H:%M:%S") if self.start_time else datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        steps_rows = []
        for s in self.steps:
            steps_rows.append(f"| {s['num']} | {s['action']} | {s['expected']} | {s['obtained']} | {s['status']} |")

        steps_table = "\n".join(steps_rows) if steps_rows else "| 1 | Ejecución de prueba | Resultado esperado | Resultado obtenido | ✓ |"

        md_content = f"""## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | {self.test_id} | Fecha de ejecución | {exec_date} |
| Nombre de la prueba | {self.name} | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | {self.module} | Ambiente | {TEST_ENVIRONMENT} |
| Requerimiento asociado | {self.req} | Prioridad | {self.priority} |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | {self.level} |
| Tipo de prueba | {self.test_type} |
| Técnica | {self.technique} |
| Ejecución | {self.execution} |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | {self.description} |
| Objetivo | {self.objective} |
| Precondiciones | {self.preconditions} |
| Datos de prueba | {self.test_data} |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
{steps_table}

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | {self.result} |
| Evidencias | [{Path(self.evidence_file).name}]({self.evidence_file}) |
| Defecto reportado | {self.defect_id} |
| Severidad del defecto | {self.defect_severity} |
| Observaciones | {self.observations} |
"""
        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(md_content)
