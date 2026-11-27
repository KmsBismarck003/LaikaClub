## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-038 | Fecha de ejecución | 2026-11-16 16:14:35 |
| Nombre de la prueba | verificacion_puertos_activos_oat | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | OAT / Infraestructura y Puertos de Red | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | OAT |
| Tipo de prueba | Operacional / Red |
| Técnica | Caja negra |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Audita mediante sockets TCP directos la disponibilidad de todos los servicios del ecosistema LaikaClub en sus puertos asignados. |
| Objetivo | Garantizar que ningún servicio crítico se encuentre apagado o con puerto bloqueado. |
| Precondiciones | Contenedores Docker desplegados. |
| Datos de prueba | Puertos: 3000 (React), 3306 (MySQL), 8000 (Gateway), 8101 (Auth), 8201 (Events), 8202 (Tickets), 8203 (Merch), 8301 (Achievements) |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Verificar socket TCP en puerto 3000 (React Frontend (SPA)) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 2 | Verificar socket TCP en puerto 3306 (MySQL Database Engine) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 3 | Verificar socket TCP en puerto 8000 (Pilgrim API Gateway) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 4 | Verificar socket TCP en puerto 8101 (Auth Microservice) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 5 | Verificar socket TCP en puerto 8201 (Events Microservice) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 6 | Verificar socket TCP en puerto 8202 (Tickets Microservice) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 7 | Verificar socket TCP en puerto 8203 (Merchandise Microservice) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |
| 8 | Verificar socket TCP en puerto 8301 (Achievements Microservice) | Puerto en estado LISTEN (Conexión TCP aceptada) | Abierto y escuchando | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-038_verificacion_puertos_activos_oat_evidence.json](evidencias/usuario/CP-038_verificacion_puertos_activos_oat_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones | Todos los puertos de servicio requeridos se encuentran escuchando activamente. |
