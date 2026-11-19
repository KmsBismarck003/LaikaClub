## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-038 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | operador_utf8_gate_notes_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad / Codificación |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar soporte y preservación de acentos y caracteres especiales en respuestas de acceso |
| Objetivo | Garantizar que títulos con tildes (PRÓXIMO, CÓDIGO) no sufran corrupción mojibake |
| Precondiciones | Mensajes de validación |
| Datos de prueba | EVENTO PRÓXIMO / PUERTAS CERRADAS |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar título con tildes | Preservación UTF-8 | statusTitle='EVENTO PRÓXIMO / PUERTAS CERRADAS' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-038_operador_utf8_gate_notes_ct_evidence.json](evidencias/operador/CP-OPE-038_operador_utf8_gate_notes_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
