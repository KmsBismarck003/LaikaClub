## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-047 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | ciclo_completo_administrador_e2e | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | E2E / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | E2E |
| Tipo de prueba | End-to-End Flujo Completo |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Ciclo completo integral del rol Administrador |
| Objetivo | Login -> Inspección Dashboard -> Monitoreo Tablas -> Búsqueda Usuarios -> Configuración Global -> Logout |
| Precondiciones | Ambiente en vivo microservicios |
| Datos de prueba | Flujo E2E Admin |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Iniciar sesión Administrador | HTTP 200 y Token | HTTP 200 | ✓ |
| 2 | Consultar métricas ejecutivas en Dashboard | HTTP 200 | HTTP 200 | ✓ |
| 3 | Inspeccionar catálogo de tablas físicas | HTTP 200 | HTTP 200 | ✓ |
| 4 | Consultar directorio general de usuarios | HTTP 200 | HTTP 200 | ✓ |
| 5 | Verificar parámetros de configuración | HTTP 200 | HTTP 200 | ✓ |
| 6 | Cerrar sesión de Administrador | HTTP 200 | HTTP 200 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-047_ciclo_completo_administrador_e2e_evidence.json](evidencias/admin/CP-ADM-047_ciclo_completo_administrador_e2e_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
