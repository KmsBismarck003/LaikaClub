## DOCUMENTO DE CASO DE PRUEBA

### 1. Datos generales

| Campo | Valor | Campo | Valor |
|---|---|---|---|
| ID de la prueba | CP-OPE-005 | Fecha de ejecución | 2026-11-16 16:15:34 |
| Nombre de la prueba | operador_badge_color_mapper_ut | Responsable (tester) | QA Automation |
| Proyecto / Sistema | LaikaClub | Versión / Build | 3.0.0-PROD |
| Módulo / Funcionalidad | UT / Operador | Ambiente | QA / Docker Live Services |
| Requerimiento asociado | N/A | Prioridad | Alta |

### 2. Clasificación

| Campo | Valor |
|---|---|
| Nivel de prueba | UT |
| Tipo de prueba | Lógica / UI Semántica |
| Técnica | Caja blanca |
| Ejecución | Automatizada |

### 3. Descripción

| Campo | Detalle |
|---|---|
| Descripción | Validar mapeo de colores semánticos de la terminal de acceso |
| Objetivo | Garantizar contraste semántico para rápida lectura del operador |
| Precondiciones | Códigos de validación |
| Datos de prueba | VALID_ACCESS -> #22C55E |

### 4. Pasos de la prueba

| # | Acción | Resultado esperado | Resultado obtenido | ✓ / ✗ |
|---|---|---|---|---|
| 1 | Color para acceso válido | #22C55E (Verde) | #22C55E | ✓ |
| 2 | Color para boleto ya usado | #EF4444 (Rojo) | #EF4444 | ✓ |
| 3 | Color para evento futuro | #F59E0B (Ámbar) | #F59E0B | ✓ |

### 5. Resultado

| Campo | Detalle |
|---|---|
| Resultado final | Aprobada |
| Evidencias | [CP-OPE-005_operador_badge_color_mapper_ut_evidence.json](evidencias/operador/CP-OPE-005_operador_badge_color_mapper_ut_evidence.json) |
| Defecto reportado | N/A |
| Severidad del defecto | N/A |
| Observaciones |  |
