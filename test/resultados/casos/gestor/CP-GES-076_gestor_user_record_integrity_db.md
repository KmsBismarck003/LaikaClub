## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-GES-076 | Fecha de ejecución | 2026-11-16 16:14:17 |
| Nombre de la prueba | gestor_user_record_integrity_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Gestor | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Integridad / Base de datos |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar registro de usuario del gestor en laika_auth.users |
| Objetivo | Validar que el gestor oficial id=3 cuente con email gestor@laikaclub.com y role='gestor' |
| Precondiciones | Base de datos laika_auth |
| Datos de prueba | SELECT id, email, role, status FROM users WHERE id = 3 |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Validar integridad de cuenta del gestor | id=3, gestor@laikaclub.com, role='gestor', status='active' | Encontrado: (3, 'gestor@laikaclub.com', 'gestor', 'active') | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-GES-076_gestor_user_record_integrity_db_evidence.json](evidencias/gestor/CP-GES-076_gestor_user_record_integrity_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
