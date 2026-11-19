## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-ADM-085 | Fecha de ejecución | 2026-11-16 16:14:16 |
| Nombre de la prueba | admin_persistencia_usuario_creado_db | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | DATABASE / Admin | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | DATABASE |
| Tipo de prueba | Persistencia Relacional |
| Técnica | Caja gris |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Comprobar persistencia física en MySQL de usuario creado por el Administrador |
| Objetivo | Garantizar que la fila exista en la tabla users de la base laika_auth con el rol correcto |
| Precondiciones | MySQL 8.0 conexión directa |
| Datos de prueba | Tabla laika_auth.users |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Crear usuario vía API | user_id no nulo | user_id=30183 | ✓ |
| 2 | Verificar fila física en MySQL | Fila existe con role=='gestor' | Encontrado: [{'id': 30183, 'email': 'db_admin_create_1794867256@laikaclub.com', 'role': 'gestor', 'status': 'active'}] | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-ADM-085_admin_persistencia_usuario_creado_db_evidence.json](evidencias/admin/CP-ADM-085_admin_persistencia_usuario_creado_db_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
