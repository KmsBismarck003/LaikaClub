## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-025 | Fecha de ejecución | 2026-11-16 16:15:54 |
| Nombre de la prueba | flujo_auth_sqli_payload_login_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Seguridad / Inyección | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | SECURITY |
| Tipo de prueba | Seguridad / Inyección SQL |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar blindaje de validación: intercepción y rechazo ante inyección SQL en login |
| Objetivo | Comprobar que payloads maliciosos sean interceptados sin vulnerar la base de datos |
| Precondiciones | Servicio laika_gateway y laika_auth activos |
| Datos de prueba | Email: ' OR 1=1 -- |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar payload SQLi en login | HTTP 401 o 422 de intercepción | HTTP 422 | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-025_flujo_auth_sqli_payload_login_post_evidence.json](evidencias/avanzados/CP-ADV-025_flujo_auth_sqli_payload_login_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Intento de inyección interceptado de forma segura: HTTP 422 |
