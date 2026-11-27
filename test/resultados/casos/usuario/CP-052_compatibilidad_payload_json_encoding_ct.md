## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-052 | Fecha de ejecución | 2026-11-16 16:14:14 |
| Nombre de la prueba | compatibilidad_payload_json_encoding_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Compatibilidad / Codificación UTF-8 | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Evalúa la preservación de caracteres hispanos (á, é, í, ó, ú, ñ, ¿, ¡) al transmitir y persistir datos de usuario en la base de datos. |
| Objetivo | Garantizar que no existan problemas de corrupción de codificación (mojibake) en el ciclo de vida de los datos. |
| Precondiciones | Usuario autenticado con rol usuario. |
| Datos de prueba | Nombres: 'Íñigo', Apellido: 'Peña-Muñoz' |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Actualizar perfil con nombres conteniendo tildes y eñes ('Íñigo', 'Peña-Muñoz') | HTTP 200 OK con payload aceptado | HTTP 200 | ✓ |
| 2 | Validar que los caracteres no hayan sufrido corrupción (mojibake) | firstName='Íñigo', lastName='Peña-Muñoz' | firstName='Íñigo', lastName='Peña-Muñoz' | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-052_compatibilidad_payload_json_encoding_ct_evidence.json](evidencias/usuario/CP-052_compatibilidad_payload_json_encoding_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | El pipeline de serialización JSON y MySQL preserva la integridad del juego de caracteres UTF-8. |
