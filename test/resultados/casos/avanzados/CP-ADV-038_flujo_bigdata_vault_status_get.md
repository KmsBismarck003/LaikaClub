## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-038 | Fecha de ejecución | 2026-11-16 16:15:47 |
| Nombre de la prueba | flujo_bigdata_vault_status_get | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Big Data / Bóveda NoSQL | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Infraestructura / MongoDB Vault |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar estado de conexión de la Bóveda NoSQL MongoDB Atlas para snapshots históricos |
| Objetivo | Comprobar disponibilidad de persistencia documental para analítica predictiva |
| Precondiciones | Servicio laika_analytics_bigdata activo |
| Datos de prueba | Ruta: GET /api/analytics/vault/status |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Consultar estado de MongoDB Vault | HTTP 200 con status ready | HTTP 200 (ready) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-038_flujo_bigdata_vault_status_get_evidence.json](evidencias/avanzados/CP-ADV-038_flujo_bigdata_vault_status_get_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Bóveda MongoDB Atlas conectada y lista (database: laika_analytics) |
