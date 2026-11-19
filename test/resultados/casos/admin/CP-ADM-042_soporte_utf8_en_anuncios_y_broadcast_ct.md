## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-042 | Fecha de ejecución | 2026-11-16 16:14:14 |
| Nombre de la prueba | soporte_utf8_en_anuncios_y_broadcast_ct | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | CT / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | CT |
| Tipo de prueba | Compatibilidad / Encoding |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar soporte UTF-8 con caracteres multilingües y acentos en ticker |
| Objetivo | Garantizar que no se corrompan caracteres como á, é, í, ó, ú, ñ, ¿, ¡ en anuncios |
| Precondiciones | Admin autenticado |
| Datos de prueba | POST /api/config/ticker |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Guardar texto UTF-8 con caracteres especiales | Texto íntegro guardado | saved=¡Atención administradores! Éxito total en México con señal acústica 🚀 2026. | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-042_soporte_utf8_en_anuncios_y_broadcast_ct_evidence.json](evidencias/admin/CP-ADM-042_soporte_utf8_en_anuncios_y_broadcast_ct_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
