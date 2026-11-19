## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADV-052 | Fecha de ejecución | 2026-11-16 16:15:49 |
| Nombre de la prueba | flujo_admin_email_envio_html_post | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | Mensajería / Correos | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | API |
| Tipo de prueba | Funcional / Notificaciones SMTP |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar procesamiento y despacho de correos electrónicos con formato HTML por administrador |
| Objetivo | Comprobar manejo controlado ante servidores SMTP locales y reporte de estatus |
| Precondiciones | Servicio laika_admin activo; credenciales admin |
| Datos de prueba | Ruta: POST /api/admin/emails/send |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Enviar correo HTML desde consola admin | HTTP 200 con estado success o simulated | HTTP 200 (simulated) | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADV-052_flujo_admin_email_envio_html_post_evidence.json](evidencias/admin/CP-ADV-052_flujo_admin_email_envio_html_post_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Envío de correos evaluado: HTTP 200 (Simulación en entorno local (SMTP offline): Authentication failed) |
