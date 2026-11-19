## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-042 | Fecha de ejecución | 2026-11-16 16:14:15 |
| Nombre de la prueba | gestor_utf8_encoding_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Gestor | Ambiente | QA / Docker Live Services |
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
| Descripción | Comprobar soporte y preservación de caracteres especiales UTF-8 |
| Objetivo | Garantizar que acentos y caracteres latinos en descripciones de eventos no se corrompan |
| Precondiciones | Texto con acentos y caracteres especiales |
| Datos de prueba | Laika Fest 2026: ¡Música, diseño y pasión! |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Comprobar caracteres especiales en evento | Preservación UTF-8 | Texto: Evento de validación de API para gestor... | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-042_gestor_utf8_encoding_ct_evidence.json](evidencias/gestor/CP-GES-042_gestor_utf8_encoding_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
