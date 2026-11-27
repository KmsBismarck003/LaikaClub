# INFORME DE QA AUTOMATION - ROL USUARIO
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** Microservicios en Vivo (Docker + Gateway + MySQL)

---

## 1. RESUMEN EJECUTIVO (USUARIO)

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | 76 |
| **Pruebas Ejecutadas** | 76 |
| **Pruebas Aprobadas (PASS)** | 75 |
| **Pruebas Fallidas (FAIL)** | 1 |
| **Pruebas Bloqueadas (BLOCKED)** | 0 |
| **Porcentaje de Ejecución** | 100.0% |
| **Porcentaje de Aprobación** | 98.7% |
| **Tiempo de Ejecución** | 123.56 s |

---

## 2. NIVELES DE PRUEBA APLICADOS (USUARIO)

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES (USUARIO)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
| CP-069 | bloqueo_asiento_endpoint_post | API | Aprobada | N/A |
| CP-074 | catalogo_mercancia_endpoint_get | API | Aprobada | N/A |
| CP-071 | compra_boleto_gratuito_endpoint_post | API | Aprobada | N/A |
| CP-073 | cupones_usuario_endpoint_get | API | Aprobada | N/A |
| CP-070 | desbloqueo_asiento_endpoint_delete | API | Aprobada | N/A |
| CP-066 | evento_detalle_endpoint_get | API | Aprobada | N/A |
| CP-067 | evento_inexistente_endpoint_get | API | Aprobada | N/A |
| CP-065 | eventos_publicos_endpoint_get | API | Aprobada | N/A |
| CP-060 | login_correo_vacio_post | API | Aprobada | N/A |
| CP-059 | login_credenciales_invalidas_post | API | Aprobada | N/A |
| CP-058 | login_endpoint_post | API | Aprobada | N/A |
| CP-068 | mis_boletos_endpoint_get | API | Aprobada | N/A |
| CP-072 | mis_reembolsos_endpoint_get | API | Aprobada | N/A |
| CP-062 | register_correo_duplicado_post | API | Aprobada | DEF-001 |
| CP-061 | register_endpoint_post | API | Aprobada | N/A |
| CP-064 | usuario_perfil_actualizacion_put | API | Aprobada | N/A |
| CP-063 | usuario_perfil_endpoint_get | API | Aprobada | N/A |
| CP-052 | compatibilidad_payload_json_encoding_ct | CT | Aprobada | N/A |
| CP-051 | compatibilidad_user_agent_headers_ct | CT | Aprobada | N/A |
| CP-078 | consistencia_asientos_ocupados_db | DATABASE | Aprobada | DEF-002 |
| CP-077 | integridad_transaccional_reembolso_db | DATABASE | Aprobada | N/A |
| CP-076 | persistencia_boleto_compra_db | DATABASE | Aprobada | N/A |
| CP-075 | persistencia_usuario_registro_db | DATABASE | Aprobada | N/A |
| CP-057 | ciclo_completo_usuario_e2e | E2E | Aprobada | N/A |
| CP-056 | exploratorio_bloqueo_asientos_concurrentes_et | ET | Aprobada | N/A |
| CP-055 | exploratorio_tokens_transferencia_inexistentes_et | ET | Aprobada | N/A |
| CP-013 | auth_service_mysql_it | IT | Aprobada | N/A |
| CP-015 | events_query_db_it | IT | Aprobada | N/A |
| CP-014 | ticket_persistence_it | IT | Aprobada | N/A |
| CP-016 | user_transactions_rollback_it | IT | Aprobada | N/A |
| CP-011 | api_client_auth_header | IT | Aprobada | N/A |
| CP-012 | api_client_error_parsing | IT | Aprobada | N/A |
| CP-038 | verificacion_puertos_activos_oat | OAT | Aprobada | N/A |
| CP-035 | salud_gateway_pilgrim_oat | OAT | Aprobada | N/A |
| CP-034 | salud_todos_microservicios_oat | OAT | Aprobada | N/A |
| CP-036 | generacion_logs_docker_oat | OAT | Aprobada | N/A |
| CP-037 | resiliencia_conexion_mysql_oat | OAT | Aprobada | N/A |
| CP-044 | concurrencia_consulta_boletos_pt | PT | Fallida | N/A |
| CP-045 | limite_peticiones_gateway_pt | PT | Aprobada | N/A |
| CP-042 | latencia_catalogo_eventos_pt | PT | Aprobada | N/A |
| CP-043 | latencia_login_usuario_pt | PT | Aprobada | N/A |
| CP-040 | regresion_calculo_totales_rt | RT | Aprobada | N/A |
| CP-039 | regresion_contrato_endpoints_usuario_rt | RT | Aprobada | N/A |
| CP-041 | regresion_estructura_perfil_rt | RT | Aprobada | N/A |
| CP-050 | bloqueo_fuerza_bruta_security | SECURITY | Aprobada | N/A |
| CP-049 | control_acceso_rbac_usuario_security | SECURITY | Aprobada | DEF-003 |
| CP-046 | inyeccion_sql_login_security | SECURITY | Aprobada | N/A |
| CP-048 | tampering_token_jwt_security | SECURITY | Aprobada | N/A |
| CP-047 | xss_payload_perfil_security | SECURITY | Aprobada | N/A |
| CP-017 | login_gateway_auth_sit | SIT | Aprobada | N/A |
| CP-018 | token_validation_gateway_sit | SIT | Aprobada | N/A |
| CP-022 | gateway_cors_headers_sit | SIT | Aprobada | N/A |
| CP-021 | comunicacion_achievements_tickets_sit | SIT | Aprobada | N/A |
| CP-020 | comunicacion_tickets_events_sit | SIT | Aprobada | N/A |
| CP-019 | perfil_usuario_gateway_sit | SIT | Aprobada | N/A |
| CP-025 | catalogo_eventos_filtro_categoria_st | ST | Aprobada | N/A |
| CP-026 | consulta_detalle_evento_st | ST | Aprobada | N/A |
| CP-024 | proteccion_ruta_usuario_st | ST | Aprobada | N/A |
| CP-023 | rutas_publicas_react_st | ST | Aprobada | N/A |
| CP-027 | registro_usuario_campos_obligatorios_st | ST | Aprobada | N/A |
| CP-033 | catalogo_tienda_mercancia_uat | UAT | Aprobada | N/A |
| CP-031 | reserva_y_consulta_wallet_uat | UAT | Aprobada | N/A |
| CP-032 | solicitud_reembolso_boleto_uat | UAT | Aprobada | N/A |
| CP-030 | actualizacion_datos_personales_uat | UAT | Aprobada | N/A |
| CP-053 | mensajes_error_login_usability | USABILITY | Aprobada | N/A |
| CP-054 | validacion_formulario_perfil_usability | USABILITY | Aprobada | N/A |
| CP-008 | cancellation_fee_calculator | UT | Aprobada | N/A |
| CP-009 | coupon_discount_calculator | UT | Aprobada | N/A |
| CP-007 | password_encoder_util | UT | Aprobada | N/A |
| CP-006 | token_jwt_generator | UT | Aprobada | N/A |
| CP-010 | schema_constraints_validation | UT | Aprobada | N/A |
| CP-003 | carrito_calculo_subtotal | UT | Aprobada | N/A |
| CP-005 | date_helpers | UT | Aprobada | N/A |
| CP-004 | formato_moneda_util | UT | Aprobada | N/A |
| CP-001 | login_validacion_correo | UT | Aprobada | N/A |
| CP-002 | registro_validacion_contrasena | UT | Aprobada | N/A |

---

## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL USUARIO)

### DEF-001: Código HTTP 500 en Registro con Correo Duplicado
- **ID de Prueba Asociado:** CP-062 (`register_correo_duplicado_post`)
- **Componente Afectado:** `laika_auth` (`AuthController.java` / `AuthService.java`)
- **Severidad:** **Alta**
- **Impacto:** Un intento de registro con correo existente devuelve HTTP 500 en lugar de HTTP 409 Conflict.

### DEF-002: Inconsistencia y Sobreventa Masiva en Base de Datos (Overbooking)
- **ID de Prueba Asociado:** CP-078 (`consistencia_asientos_ocupados_db`)
- **Componente Afectado:** `laika_tickets` (`laika_tickets.tickets` en MySQL)
- **Severidad:** **Crítica**
- **Impacto:** Se identificaron 3,994 butacas duplicadas activas en el evento 20 por inyección sintética sin restricción de unicidad.

### DEF-003: Falla de Control de Acceso Roto (OWASP Top 10 A01)
- **ID de Prueba Asociado:** CP-049 (`control_acceso_rbac_usuario_security`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/manager/transactions`)
- **Severidad:** **Crítica**
- **Impacto:** Usuarios regulares pueden ver transacciones comerciales al omitirse la comprobación del rol gestor/admin.

---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/usuario/`
- **Evidencias Crudas JSON:** `test/evidencias/usuario/`
