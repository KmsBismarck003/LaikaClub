## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-070 | Fecha de ejecución | 2026-11-16 16:13:52 |
| Nombre de la prueba | admin_ads_public_endpoint_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | API / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Publicidad |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar endpoint público GET /api/ads/public |
| Objetivo | Validar respuesta HTTP 200 con anuncios activos para portales de usuario |
| Precondiciones | Acceso anónimo |
| Datos de prueba | GET /api/ads/public |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | GET /api/ads/public | HTTP 200 | HTTP 200 | ✓ |
| 2 | Verificar lista de anuncios | Lista JSON devuelta | Elementos: 0 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-070_admin_ads_public_endpoint_get_evidence.json](evidencias/admin/CP-ADM-070_admin_ads_public_endpoint_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
