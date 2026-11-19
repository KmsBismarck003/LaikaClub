# INFORME GENERAL DE QA AUTOMATION - CONSOLIDADO MULTI-ROL LAIKACLUB
**Módulos Evaluados:** USUARIO, ADMIN, GESTOR, OPERADOR y FLUJOS AVANZADOS  
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  

---

## 1. TABLERO MAESTRO DE CALIDAD

| Métrica Global | Rol USUARIO | Rol ADMIN | Rol GESTOR | Rol OPERADOR | FLUJOS AVANZADOS | Total Consolidado |
|---|---|---|---|---|---|---|
| **Casos Identificados / Generados** | 76 | 95 | 78 | 65 | 59 | **354** |
| **Casos Ejecutados** | 76 | 95 | 78 | 65 | 59 | **354** |
| **Casos Aprobados (PASS)** | 75 | 94 | 74 | 64 | 59 | **347** |
| **Casos Fallidos (FAIL)** | 1 | 1 | 4 | 1 | 0 | **7** |
| **Casos Bloqueados (BLOCKED)** | 0 | 0 | 0 | 0 | 0 | **0** |
| **Tasa de Aprobación** | 98.7% | 98.9% | 94.9% | 98.5% | 100.0% | **98.0%** |

**Tiempo de Ejecución Suite Completa:** 123.56 segundos

---

## 2. REPORTES ESPECÍFICOS POR ROL Y SUITE

Para una auditoría detallada de cada rol y suite, consulte los informes dedicados:
1. [Informe Dedicado - Rol USUARIO](file:///C:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/test/reportes/informe_qa_usuario.md)
2. [Informe Dedicado - Rol ADMIN](file:///C:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/test/reportes/informe_qa_admin.md)
3. [Informe Dedicado - Rol GESTOR](file:///C:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/test/reportes/informe_qa_gestor.md)
4. [Informe Dedicado - Rol OPERADOR](file:///C:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/test/reportes/informe_qa_operador.md)
5. [Informe Dedicado - FLUJOS AVANZADOS](file:///C:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/test/reportes/informe_qa_flujos_avanzados.md)

---

## 3. MATRIZ CONSOLIDADA DE DEFECTOS

| ID Defecto | Rol | Severidad | Componente | Descripción Resumida |
|---|---|---|---|---|
| **DEF-001** | USUARIO | Alta | `laika_auth` | HTTP 500 en lugar de 409 Conflict al registrar email duplicado. |
| **DEF-002** | USUARIO | Crítica | `laika_tickets` | 3,994 butacas físicas duplicadas en Evento 20 (sobreventa / overbooking). |
| **DEF-003** | USUARIO | Crítica | `laika_events` | Falla OWASP A01: Rol regular puede ver transacciones comerciales en `/manager/transactions`. |
| **DEF-ADM-001** | ADMIN | Crítica | `laika_admin` | Falta `@PreAuthorize("hasRole('admin')")` en `/database/backups`: accesible a otros roles. |
| **DEF-GES-001** | GESTOR | Alta | `laika_events` | Falla OWASP A01: `/api/manager/transactions` accesible sin verificación de rol gestor. |
| **DEF-GES-002** | GESTOR | Media | `laika_events` | Endpoint `/[id]/functions` responde HTTP 404 a pesar de estar declarado en el controlador. |
| **DEF-GES-003** | GESTOR | Alta | `laika_gateway` | Falta regla de enrutamiento para `/api/presale/**` hacia `laika_events` (devuelve HTTP 404). |
| **DEF-GES-004** | GESTOR | Media | `laika_events` | Omisión de `GET /venues/{id}` en `VenueController` (devuelve HTTP 405 Method Not Allowed). |
| **DEF-OPE-001** | OPERADOR | Alta | `laika_stats` | Falla OWASP A01: `/api/stats/staff/dashboard` accesible por rol usuario regular sin restricción RBAC. |

---

## 4. DETALLE DE TODOS LOS CASOS EJECUTADOS (354 Casos)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
| CP-ADM-074 | admin_ads_click_endpoint_post | API | Aprobada | N/A |
| CP-ADM-072 | admin_ads_create_endpoint_post | API | Aprobada | N/A |
| CP-ADM-075 | admin_ads_delete_endpoint | API | Aprobada | N/A |
| CP-ADM-071 | admin_ads_list_endpoint_get | API | Aprobada | N/A |
| CP-ADM-070 | admin_ads_public_endpoint_get | API | Aprobada | N/A |
| CP-ADM-073 | admin_ads_update_endpoint_put | API | Aprobada | N/A |
| CP-ADM-060 | admin_audit_logs_endpoint_get | API | Aprobada | N/A |
| CP-ADM-082 | admin_b2b_organizations_endpoint_get | API | Aprobada | N/A |
| CP-ADM-058 | admin_broadcast_endpoint_post | API | Fallida | DEF-ADM-002 |
| CP-ADM-078 | admin_config_param_endpoint_get | API | Aprobada | N/A |
| CP-ADM-079 | admin_config_param_endpoint_post | API | Aprobada | N/A |
| CP-ADM-076 | admin_config_runtime_endpoint_get | API | Aprobada | N/A |
| CP-ADM-077 | admin_config_runtime_update_endpoint_put | API | Aprobada | N/A |
| CP-ADM-080 | admin_config_ticker_endpoint_get | API | Aprobada | N/A |
| CP-ADM-081 | admin_config_ticker_endpoint_post | API | Aprobada | N/A |
| CP-ADM-068 | admin_database_auto_backup_config_endpoint_get | API | Aprobada | N/A |
| CP-ADM-069 | admin_database_auto_backup_config_endpoint_put | API | Aprobada | N/A |
| CP-ADM-063 | admin_database_backups_list_endpoint_get | API | Aprobada | N/A |
| CP-ADM-067 | admin_database_clear_cache_endpoint_post | API | Aprobada | N/A |
| CP-ADM-064 | admin_database_export_json_endpoint_get | API | Aprobada | N/A |
| CP-ADM-065 | admin_database_export_svg_endpoint_get | API | Aprobada | N/A |
| CP-ADM-066 | admin_database_optimize_endpoint_post | API | Aprobada | N/A |
| CP-ADM-062 | admin_database_stats_endpoint_get | API | Aprobada | N/A |
| CP-ADM-061 | admin_database_tables_endpoint_get | API | Aprobada | N/A |
| CP-ADM-084 | admin_restore_audit_events_endpoint_get | API | Aprobada | N/A |
| CP-ADM-083 | admin_stats_dashboard_endpoint_get | API | Aprobada | N/A |
| CP-ADM-059 | admin_test_email_endpoint_post | API | Aprobada | N/A |
| CP-ADM-053 | admin_users_create_endpoint_post | API | Aprobada | N/A |
| CP-ADM-057 | admin_users_delete_endpoint | API | Aprobada | N/A |
| CP-ADM-050 | admin_users_filter_role_endpoint_get | API | Aprobada | N/A |
| CP-ADM-051 | admin_users_filter_status_endpoint_get | API | Aprobada | N/A |
| CP-ADM-049 | admin_users_list_endpoint_get | API | Aprobada | N/A |
| CP-ADM-055 | admin_users_password_reset_patch_endpoint | API | Aprobada | N/A |
| CP-ADM-052 | admin_users_search_endpoint_get | API | Aprobada | N/A |
| CP-ADM-054 | admin_users_status_patch_endpoint | API | Aprobada | N/A |
| CP-ADM-056 | admin_users_unlock_patch_endpoint | API | Aprobada | N/A |
| CP-ADM-048 | login_admin_endpoint_post | API | Aprobada | N/A |
| CP-069 | bloqueo_asiento_endpoint_post | API | Aprobada | N/A |
| CP-074 | catalogo_mercancia_endpoint_get | API | Aprobada | N/A |
| CP-071 | compra_boleto_gratuito_endpoint_post | API | Aprobada | N/A |
| CP-073 | cupones_usuario_endpoint_get | API | Aprobada | N/A |
| CP-070 | desbloqueo_asiento_endpoint_delete | API | Aprobada | N/A |
| CP-066 | evento_detalle_endpoint_get | API | Aprobada | N/A |
| CP-067 | evento_inexistente_endpoint_get | API | Aprobada | N/A |
| CP-065 | eventos_publicos_endpoint_get | API | Aprobada | N/A |
| CP-GES-065 | manager_courtesy_claim_endpoint_post | API | Aprobada | N/A |
| CP-GES-063 | manager_courtesy_event_dashboard_endpoint_get | API | Aprobada | N/A |
| CP-GES-062 | manager_courtesy_my_quotas_endpoint_get | API | Aprobada | N/A |
| CP-GES-064 | manager_courtesy_validate_token_endpoint_get | API | Aprobada | N/A |
| CP-GES-057 | manager_event_attendees_endpoint_get | API | Aprobada | N/A |
| CP-GES-050 | manager_event_detail_endpoint_get | API | Aprobada | N/A |
| CP-GES-054 | manager_event_functions_endpoint_get | API | Fallida | DEF-GES-002 |
| CP-GES-052 | manager_event_publish_patch_endpoint | API | Aprobada | N/A |
| CP-GES-056 | manager_event_revenue_endpoint_get | API | Aprobada | N/A |
| CP-GES-055 | manager_event_tickets_endpoint_get | API | Aprobada | N/A |
| CP-GES-053 | manager_event_unpublish_patch_endpoint | API | Aprobada | N/A |
| CP-GES-051 | manager_event_update_endpoint_put | API | Aprobada | N/A |
| CP-GES-049 | manager_events_create_endpoint_post | API | Aprobada | N/A |
| CP-GES-059 | manager_events_historical_endpoint_get | API | Aprobada | N/A |
| CP-GES-048 | manager_events_list_endpoint_get | API | Aprobada | N/A |
| CP-GES-072 | manager_merchandise_list_endpoint_get | API | Aprobada | N/A |
| CP-GES-060 | manager_presale_info_endpoint_get | API | Fallida | DEF-GES-003 |
| CP-GES-061 | manager_stats_dashboard_endpoint_get | API | Aprobada | N/A |
| CP-GES-058 | manager_transactions_endpoint_get | API | Aprobada | N/A |
| CP-GES-069 | manager_venue_countries_endpoint_get | API | Aprobada | N/A |
| CP-GES-067 | manager_venue_detail_endpoint_get | API | Fallida | DEF-GES-004 |
| CP-GES-071 | manager_venue_municipalities_endpoint_get | API | Aprobada | N/A |
| CP-GES-068 | manager_venue_seat_types_endpoint_get | API | Aprobada | N/A |
| CP-GES-070 | manager_venue_states_endpoint_get | API | Aprobada | N/A |
| CP-GES-066 | manager_venues_list_endpoint_get | API | Aprobada | N/A |
| CP-060 | login_correo_vacio_post | API | Aprobada | N/A |
| CP-059 | login_credenciales_invalidas_post | API | Aprobada | N/A |
| CP-058 | login_endpoint_post | API | Aprobada | N/A |
| CP-068 | mis_boletos_endpoint_get | API | Aprobada | N/A |
| CP-072 | mis_reembolsos_endpoint_get | API | Aprobada | N/A |
| CP-OPE-052 | staff_dashboard_stats_endpoint_get | API | Aprobada | N/A |
| CP-OPE-046 | staff_redeem_invalid_ticket_post | API | Aprobada | N/A |
| CP-OPE-050 | staff_ticket_history_endpoint_get | API | Aprobada | N/A |
| CP-OPE-048 | staff_validations_history_endpoint_get | API | Aprobada | N/A |
| CP-OPE-044 | staff_verify_endpoint_post | API | Aprobada | N/A |
| CP-OPE-053 | tickets_busy_seats_endpoint_get | API | Aprobada | N/A |
| CP-OPE-057 | tickets_free_courtesy_purchase_endpoint_post | API | Aprobada | N/A |
| CP-OPE-054 | tickets_health_endpoint_get | API | Aprobada | N/A |
| CP-OPE-055 | tickets_lock_seat_missing_param_post | API | Aprobada | N/A |
| CP-OPE-047 | tickets_redeem_invalid_ticket_post | API | Aprobada | N/A |
| CP-OPE-051 | tickets_ticket_history_endpoint_get | API | Aprobada | N/A |
| CP-OPE-056 | tickets_unlock_seat_missing_param_delete | API | Aprobada | N/A |
| CP-OPE-049 | tickets_validations_history_endpoint_get | API | Aprobada | N/A |
| CP-OPE-045 | tickets_verify_endpoint_post | API | Aprobada | N/A |
| CP-062 | register_correo_duplicado_post | API | Aprobada | DEF-001 |
| CP-061 | register_endpoint_post | API | Aprobada | N/A |
| CP-064 | usuario_perfil_actualizacion_put | API | Aprobada | N/A |
| CP-063 | usuario_perfil_endpoint_get | API | Aprobada | N/A |
| CP-ADM-041 | compatibilidad_user_agents_admin_ct | CT | Aprobada | N/A |
| CP-ADM-042 | soporte_utf8_en_anuncios_y_broadcast_ct | CT | Aprobada | N/A |
| CP-052 | compatibilidad_payload_json_encoding_ct | CT | Aprobada | N/A |
| CP-051 | compatibilidad_user_agent_headers_ct | CT | Aprobada | N/A |
| CP-GES-041 | gestor_desktop_user_agents_ct | CT | Aprobada | N/A |
| CP-GES-042 | gestor_utf8_encoding_ct | CT | Aprobada | N/A |
| CP-OPE-037 | operador_handheld_scanners_ct | CT | Aprobada | N/A |
| CP-OPE-038 | operador_utf8_gate_notes_ct | CT | Aprobada | N/A |
| CP-ADM-088 | admin_persistencia_ads_db | DATABASE | Aprobada | N/A |
| CP-ADM-086 | admin_persistencia_config_db | DATABASE | Aprobada | N/A |
| CP-ADM-087 | admin_persistencia_restore_event_db | DATABASE | Aprobada | N/A |
| CP-ADM-085 | admin_persistencia_usuario_creado_db | DATABASE | Aprobada | N/A |
| CP-078 | consistencia_asientos_ocupados_db | DATABASE | Aprobada | DEF-002 |
| CP-GES-074 | gestor_courtesy_quotas_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-073 | gestor_events_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-075 | gestor_merchandise_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-076 | gestor_user_record_integrity_db | DATABASE | Aprobada | N/A |
| CP-077 | integridad_transaccional_reembolso_db | DATABASE | Aprobada | N/A |
| CP-OPE-059 | operador_tickets_status_consistency_db | DATABASE | Aprobada | N/A |
| CP-OPE-060 | operador_user_account_integrity_db | DATABASE | Aprobada | N/A |
| CP-OPE-058 | operador_validation_logs_persistence_db | DATABASE | Aprobada | N/A |
| CP-076 | persistencia_boleto_compra_db | DATABASE | Aprobada | N/A |
| CP-075 | persistencia_usuario_registro_db | DATABASE | Aprobada | N/A |
| CP-ADM-047 | ciclo_completo_administrador_e2e | E2E | Aprobada | N/A |
| CP-057 | ciclo_completo_usuario_e2e | E2E | Aprobada | N/A |
| CP-GES-047 | gestor_complete_session_flow_e2e | E2E | Aprobada | N/A |
| CP-OPE-043 | operador_complete_terminal_shift_e2e | E2E | Aprobada | N/A |
| CP-ADM-046 | exploratorio_ids_inexistentes_en_usuarios_et | ET | Aprobada | N/A |
| CP-ADM-045 | exploratorio_paginacion_limites_extremos_et | ET | Aprobada | N/A |
| CP-056 | exploratorio_bloqueo_asientos_concurrentes_et | ET | Aprobada | N/A |
| CP-055 | exploratorio_tokens_transferencia_inexistentes_et | ET | Aprobada | N/A |
| CP-GES-045 | gestor_extreme_event_id_boundary_et | ET | Aprobada | N/A |
| CP-GES-046 | gestor_extreme_pagination_transactions_et | ET | Aprobada | N/A |
| CP-OPE-042 | operador_extreme_length_ticket_code_et | ET | Aprobada | N/A |
| CP-OPE-041 | operador_malformed_qr_payload_et | ET | Aprobada | N/A |
| CP-ADM-009 | admin_auth_user_query_it | IT | Aprobada | N/A |
| CP-ADM-007 | admin_backup_history_persistence_it | IT | Aprobada | N/A |
| CP-ADM-008 | admin_restore_event_persistence_it | IT | Aprobada | N/A |
| CP-ADM-006 | admin_service_mysql_connection_it | IT | Aprobada | N/A |
| CP-013 | auth_service_mysql_it | IT | Aprobada | N/A |
| CP-015 | events_query_db_it | IT | Aprobada | N/A |
| CP-014 | ticket_persistence_it | IT | Aprobada | N/A |
| CP-016 | user_transactions_rollback_it | IT | Aprobada | N/A |
| CP-011 | api_client_auth_header | IT | Aprobada | N/A |
| CP-012 | api_client_error_parsing | IT | Aprobada | N/A |
| CP-GES-007 | gestor_courtesy_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-006 | gestor_event_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-008 | gestor_merchandise_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-009 | gestor_venue_service_mysql_it | IT | Aprobada | N/A |
| CP-OPE-009 | operador_auth_user_query_it | IT | Aprobada | N/A |
| CP-OPE-007 | operador_ticket_service_mysql_it | IT | Aprobada | N/A |
| CP-OPE-008 | operador_validation_repo_mysql_it | IT | Aprobada | N/A |
| CP-OPE-006 | operador_validation_service_mysql_it | IT | Aprobada | N/A |
| CP-ADM-027 | disponibilidad_tablas_admin_mysql_oat | OAT | Aprobada | N/A |
| CP-ADM-029 | limpieza_cache_admin_oat | OAT | Aprobada | N/A |
| CP-ADM-028 | optimizacion_tablas_admin_oat | OAT | Aprobada | N/A |
| CP-ADM-026 | salud_microservicio_admin_oat | OAT | Aprobada | N/A |
| CP-038 | verificacion_puertos_activos_oat | OAT | Aprobada | N/A |
| CP-035 | salud_gateway_pilgrim_oat | OAT | Aprobada | N/A |
| CP-034 | salud_todos_microservicios_oat | OAT | Aprobada | N/A |
| CP-GES-026 | gestor_events_health_oat | OAT | Aprobada | N/A |
| CP-GES-028 | gestor_merchandise_health_oat | OAT | Aprobada | N/A |
| CP-GES-029 | gestor_stats_health_oat | OAT | Aprobada | N/A |
| CP-GES-027 | gestor_tickets_health_oat | OAT | Aprobada | N/A |
| CP-036 | generacion_logs_docker_oat | OAT | Aprobada | N/A |
| CP-OPE-024 | operador_stats_health_oat | OAT | Aprobada | N/A |
| CP-OPE-023 | operador_tickets_health_oat | OAT | Aprobada | N/A |
| CP-OPE-025 | operador_validation_table_availability_oat | OAT | Aprobada | N/A |
| CP-037 | resiliencia_conexion_mysql_oat | OAT | Aprobada | N/A |
| CP-ADM-035 | latencia_admin_login_pt | PT | Aprobada | N/A |
| CP-ADM-033 | latencia_admin_users_list_pt | PT | Aprobada | N/A |
| CP-ADM-034 | latencia_database_tables_stats_pt | PT | Aprobada | N/A |
| CP-044 | concurrencia_consulta_boletos_pt | PT | Fallida | N/A |
| CP-045 | limite_peticiones_gateway_pt | PT | Aprobada | N/A |
| CP-GES-035 | gestor_dashboard_latency_pt | PT | Aprobada | N/A |
| CP-GES-033 | gestor_events_latency_pt | PT | Aprobada | N/A |
| CP-GES-034 | gestor_transactions_latency_pt | PT | Aprobada | N/A |
| CP-OPE-029 | operador_gate_verification_latency_pt | PT | Aprobada | N/A |
| CP-OPE-031 | operador_staff_dashboard_latency_pt | PT | Aprobada | N/A |
| CP-OPE-030 | operador_validations_history_latency_pt | PT | Aprobada | N/A |
| CP-042 | latencia_catalogo_eventos_pt | PT | Aprobada | N/A |
| CP-043 | latencia_login_usuario_pt | PT | Aprobada | N/A |
| CP-ADM-030 | regresion_contrato_admin_users_rt | RT | Aprobada | N/A |
| CP-ADM-031 | regresion_contrato_database_tables_rt | RT | Aprobada | N/A |
| CP-ADM-032 | regresion_contrato_system_config_rt | RT | Aprobada | N/A |
| CP-GES-030 | gestor_events_schema_contract_rt | RT | Aprobada | N/A |
| CP-GES-031 | gestor_stats_schema_contract_rt | RT | Aprobada | N/A |
| CP-GES-032 | gestor_venues_schema_contract_rt | RT | Aprobada | N/A |
| CP-OPE-027 | operador_history_schema_contract_rt | RT | Aprobada | N/A |
| CP-OPE-028 | operador_staff_stats_contract_rt | RT | Aprobada | N/A |
| CP-OPE-026 | operador_verify_schema_contract_rt | RT | Aprobada | N/A |
| CP-040 | regresion_calculo_totales_rt | RT | Aprobada | N/A |
| CP-039 | regresion_contrato_endpoints_usuario_rt | RT | Aprobada | N/A |
| CP-041 | regresion_estructura_perfil_rt | RT | Aprobada | N/A |
| CP-ADM-039 | inyeccion_sql_en_busqueda_usuarios_security | SECURITY | Aprobada | N/A |
| CP-ADM-036 | rbac_rechazo_usuario_regular_en_admin_users_security | SECURITY | Aprobada | N/A |
| CP-ADM-037 | rbac_rechazo_usuario_regular_en_database_backups_security | SECURITY | Aprobada | N/A |
| CP-ADM-038 | rechazo_peticion_sin_token_en_admin_security | SECURITY | Aprobada | N/A |
| CP-ADM-040 | sanitizacion_xss_en_configuracion_sistema_security | SECURITY | Aprobada | N/A |
| CP-050 | bloqueo_fuerza_bruta_security | SECURITY | Aprobada | N/A |
| CP-049 | control_acceso_rbac_usuario_security | SECURITY | Aprobada | DEF-003 |
| CP-GES-036 | gestor_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-037 | gestor_db_optimize_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-038 | gestor_quota_creation_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-039 | gestor_transactions_rbac_bypass_sec | SECURITY | Fallida | DEF-GES-001 |
| CP-GES-040 | gestor_unauthenticated_request_sec | SECURITY | Aprobada | N/A |
| CP-046 | inyeccion_sql_login_security | SECURITY | Aprobada | N/A |
| CP-OPE-032 | operador_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-033 | operador_courtesy_quota_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-036 | operador_sqli_ticket_verify_sec | SECURITY | Aprobada | N/A |
| CP-OPE-035 | operador_staff_dashboard_rbac_bypass_sec | SECURITY | Fallida | DEF-OPE-001 |
| CP-OPE-034 | operador_unauthenticated_staff_rejected_sec | SECURITY | Aprobada | N/A |
| CP-048 | tampering_token_jwt_security | SECURITY | Aprobada | N/A |
| CP-047 | xss_payload_perfil_security | SECURITY | Aprobada | N/A |
| CP-ADM-013 | gateway_admin_b2b_sit | SIT | Aprobada | N/A |
| CP-ADM-012 | gateway_admin_config_sit | SIT | Aprobada | N/A |
| CP-ADM-011 | gateway_admin_database_tables_sit | SIT | Aprobada | N/A |
| CP-ADM-015 | gateway_admin_monitoring_sit | SIT | Aprobada | N/A |
| CP-ADM-014 | gateway_admin_stats_sit | SIT | Aprobada | N/A |
| CP-ADM-010 | gateway_admin_users_sit | SIT | Aprobada | N/A |
| CP-017 | login_gateway_auth_sit | SIT | Aprobada | N/A |
| CP-018 | token_validation_gateway_sit | SIT | Aprobada | N/A |
| CP-022 | gateway_cors_headers_sit | SIT | Aprobada | N/A |
| CP-GES-013 | gestor_gateway_courtesy_quotas_sit | SIT | Aprobada | N/A |
| CP-GES-010 | gestor_gateway_events_sit | SIT | Aprobada | N/A |
| CP-GES-015 | gestor_gateway_merchandise_sit | SIT | Aprobada | N/A |
| CP-GES-012 | gestor_gateway_revenue_analytics_sit | SIT | Aprobada | N/A |
| CP-GES-014 | gestor_gateway_stats_dashboard_sit | SIT | Aprobada | N/A |
| CP-GES-011 | gestor_gateway_tickets_analytics_sit | SIT | Aprobada | N/A |
| CP-021 | comunicacion_achievements_tickets_sit | SIT | Aprobada | N/A |
| CP-020 | comunicacion_tickets_events_sit | SIT | Aprobada | N/A |
| CP-OPE-014 | operador_gateway_busy_seats_sit | SIT | Aprobada | N/A |
| CP-OPE-013 | operador_gateway_staff_dashboard_sit | SIT | Aprobada | N/A |
| CP-OPE-011 | operador_gateway_staff_verify_sit | SIT | Aprobada | N/A |
| CP-OPE-010 | operador_gateway_tickets_verify_sit | SIT | Aprobada | N/A |
| CP-OPE-012 | operador_gateway_validations_history_sit | SIT | Aprobada | N/A |
| CP-019 | perfil_usuario_gateway_sit | SIT | Aprobada | N/A |
| CP-ADM-019 | admin_database_tables_count_st | ST | Aprobada | N/A |
| CP-ADM-016 | admin_panel_auth_guard_st | ST | Aprobada | N/A |
| CP-ADM-020 | admin_restore_audit_severity_filter_st | ST | Aprobada | N/A |
| CP-ADM-017 | admin_user_filtering_by_role_st | ST | Aprobada | N/A |
| CP-ADM-018 | admin_user_filtering_by_status_st | ST | Aprobada | N/A |
| CP-028 | flujo_reserva_bloqueo_asiento_st | ST | Aprobada | N/A |
| CP-025 | catalogo_eventos_filtro_categoria_st | ST | Aprobada | N/A |
| CP-026 | consulta_detalle_evento_st | ST | Aprobada | N/A |
| CP-GES-017 | gestor_events_filtering_st | ST | Aprobada | N/A |
| CP-GES-018 | gestor_revenue_consistency_st | ST | Aprobada | N/A |
| CP-GES-020 | gestor_transactions_audit_st | ST | Aprobada | N/A |
| CP-GES-019 | gestor_venue_rooms_capacity_st | ST | Aprobada | N/A |
| CP-GES-016 | gestor_workspace_auth_guard_st | ST | Aprobada | N/A |
| CP-024 | proteccion_ruta_usuario_st | ST | Aprobada | N/A |
| CP-023 | rutas_publicas_react_st | ST | Aprobada | N/A |
| CP-OPE-016 | operador_audit_trail_consistency_st | ST | Aprobada | N/A |
| CP-OPE-018 | operador_busy_seats_consistency_st | ST | Aprobada | N/A |
| CP-OPE-017 | operador_invalid_scan_logging_st | ST | Aprobada | N/A |
| CP-OPE-015 | operador_terminal_auth_guard_st | ST | Aprobada | N/A |
| CP-027 | registro_usuario_campos_obligatorios_st | ST | Aprobada | N/A |
| CP-ADM-022 | flujo_administracion_ciclo_vida_usuario_uat | UAT | Aprobada | N/A |
| CP-ADM-025 | flujo_configuracion_global_plataforma_uat | UAT | Aprobada | N/A |
| CP-ADM-023 | flujo_gestion_campanas_publicidad_uat | UAT | Aprobada | N/A |
| CP-ADM-021 | flujo_login_admin_y_verificacion_permisos_uat | UAT | Aprobada | N/A |
| CP-ADM-024 | flujo_mantenimiento_base_datos_uat | UAT | Aprobada | N/A |
| CP-029 | flujo_registro_e_inicio_sesion_uat | UAT | Aprobada | N/A |
| CP-033 | catalogo_tienda_mercancia_uat | UAT | Aprobada | N/A |
| CP-031 | reserva_y_consulta_wallet_uat | UAT | Aprobada | N/A |
| CP-032 | solicitud_reembolso_boleto_uat | UAT | Aprobada | N/A |
| CP-GES-025 | gestor_analytics_readiness_uat | UAT | Aprobada | N/A |
| CP-GES-023 | gestor_courtesy_audit_uat | UAT | Aprobada | N/A |
| CP-GES-022 | gestor_event_lifecycle_uat | UAT | Aprobada | N/A |
| CP-GES-021 | gestor_login_and_claims_uat | UAT | Aprobada | N/A |
| CP-GES-024 | gestor_merchandise_catalog_uat | UAT | Aprobada | N/A |
| CP-OPE-021 | operador_access_denial_feedback_uat | UAT | Aprobada | N/A |
| CP-OPE-019 | operador_login_and_claims_uat | UAT | Aprobada | N/A |
| CP-OPE-022 | operador_staff_analytics_readiness_uat | UAT | Aprobada | N/A |
| CP-OPE-020 | operador_ticket_verification_uat | UAT | Aprobada | N/A |
| CP-030 | actualizacion_datos_personales_uat | UAT | Aprobada | N/A |
| CP-ADM-043 | validacion_campos_requeridos_crear_usuario_usability | USABILITY | Aprobada | N/A |
| CP-ADM-044 | validacion_id_invalido_borrado_backup_usability | USABILITY | Aprobada | N/A |
| CP-GES-044 | gestor_create_event_validation_feedback_us | USABILITY | Aprobada | N/A |
| CP-GES-043 | gestor_invalid_courtesy_token_feedback_us | USABILITY | Aprobada | N/A |
| CP-053 | mensajes_error_login_usability | USABILITY | Aprobada | N/A |
| CP-OPE-039 | operador_future_event_feedback_us | USABILITY | Aprobada | N/A |
| CP-OPE-040 | operador_invalid_code_feedback_us | USABILITY | Aprobada | N/A |
| CP-054 | validacion_formulario_perfil_usability | USABILITY | Aprobada | N/A |
| CP-ADM-003 | admin_ad_status_filter_ut | UT | Aprobada | N/A |
| CP-ADM-004 | admin_b2b_contract_date_validator_ut | UT | Aprobada | N/A |
| CP-ADM-002 | admin_backup_schedule_calculator_ut | UT | Aprobada | N/A |
| CP-ADM-001 | admin_permissions_validator_ut | UT | Aprobada | N/A |
| CP-ADM-005 | admin_user_role_transition_ut | UT | Aprobada | N/A |
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
| CP-GES-002 | gestor_courtesy_quota_math_ut | UT | Aprobada | N/A |
| CP-GES-001 | gestor_event_duration_calculator_ut | UT | Aprobada | N/A |
| CP-GES-004 | gestor_event_status_transition_ut | UT | Aprobada | N/A |
| CP-GES-003 | gestor_merchandise_commission_calc_ut | UT | Aprobada | N/A |
| CP-GES-005 | gestor_seating_occupancy_calc_ut | UT | Aprobada | N/A |
| CP-OPE-005 | operador_badge_color_mapper_ut | UT | Aprobada | N/A |
| CP-OPE-004 | operador_device_header_extractor_ut | UT | Aprobada | N/A |
| CP-OPE-003 | operador_flow_rate_calc_ut | UT | Aprobada | N/A |
| CP-OPE-001 | operador_qr_parser_ut | UT | Aprobada | N/A |
| CP-OPE-002 | operador_status_code_evaluator_ut | UT | Aprobada | N/A |
| CP-ADV-037 | flujo_bigdata_ml_anomaly_detection_get | API | Aprobada | N/A |
| CP-ADV-034 | flujo_bigdata_ml_elbow_optimization_get | API | Aprobada | N/A |
| CP-ADV-035 | flujo_bigdata_ml_pca_clusters_get | API | Aprobada | N/A |
| CP-ADV-036 | flujo_bigdata_ml_prospecting_leads_get | API | Aprobada | N/A |
| CP-ADV-033 | flujo_bigdata_tables_catalogo_get | API | Aprobada | N/A |
| CP-ADV-038 | flujo_bigdata_vault_status_get | API | Aprobada | N/A |
| CP-ADV-044 | flujo_auth_bloqueo_cuenta_intentos_fallidos_post | SECURITY | Aprobada | N/A |
| CP-ADV-045 | flujo_auth_desbloqueo_cuenta_admin_patch | SECURITY | Aprobada | N/A |
| CP-ADV-008 | flujo_reembolso_cotizacion_ticket_ajeno_get | API | Aprobada | N/A |
| CP-ADV-007 | flujo_reembolso_cotizacion_ticket_propio_get | API | Aprobada | N/A |
| CP-ADV-006 | flujo_reembolso_politica_evento_get | API | Aprobada | N/A |
| CP-ADV-009 | flujo_reembolso_solicitud_ticket_invalido_post | API | Aprobada | N/A |
| CP-ADV-005 | flujo_compra_bloqueo_colision_asiento_post | API | Aprobada | N/A |
| CP-ADV-004 | flujo_compra_evento_caducado_post | API | Aprobada | N/A |
| CP-ADV-003 | flujo_compra_evento_inexistente_post | API | Aprobada | N/A |
| CP-ADV-001 | flujo_compra_tarjeta_create_intent_post | API | Aprobada | N/A |
| CP-ADV-002 | flujo_compra_tarjeta_monto_invalido_post | API | Aprobada | N/A |
| CP-ADV-021 | flujo_gestor_aislamiento_eventos_ajenos_sec | SECURITY | Aprobada | N/A |
| CP-ADV-020 | flujo_gestor_contratos_b2b_list_get | API | Aprobada | N/A |
| CP-ADV-052 | flujo_admin_email_envio_html_post | API | Aprobada | N/A |
| CP-ADV-048 | flujo_cortesia_canje_duplicado_rechazo_post | API | Aprobada | N/A |
| CP-ADV-046 | flujo_cortesia_emision_directa_post | API | Aprobada | N/A |
| CP-ADV-047 | flujo_cortesia_token_validacion_previa_get | API | Aprobada | N/A |
| CP-ADV-015 | flujo_creacion_evento_colision_recinto_horario_post | API | Aprobada | N/A |
| CP-ADV-014 | flujo_creacion_evento_con_funciones_post | API | Aprobada | N/A |
| CP-ADV-016 | flujo_publicacion_y_despublicacion_evento_patch | API | Aprobada | N/A |
| CP-ADV-030 | flujo_logros_beneficios_cupones_get | API | Aprobada | N/A |
| CP-ADV-032 | flujo_logros_cupon_invalido_post | API | Aprobada | N/A |
| CP-ADV-031 | flujo_logros_cupon_validate_post | API | Aprobada | N/A |
| CP-ADV-018 | flujo_mercancia_cambio_estado_admin_put | API | Aprobada | N/A |
| CP-ADV-017 | flujo_mercancia_catalogo_publico_get | API | Aprobada | N/A |
| CP-ADV-019 | flujo_mercancia_orden_compra_items_vacios_post | API | Aprobada | N/A |
| CP-ADV-028 | flujo_operador_canje_duplicado_post | API | Aprobada | N/A |
| CP-ADV-027 | flujo_operador_codigo_erroneo_y_falsificado_post | API | Aprobada | N/A |
| CP-ADV-026 | flujo_operador_qr_en_evento_diferente_sec | SECURITY | Aprobada | N/A |
| CP-ADV-029 | flujo_operador_ticket_transferido_post | API | Aprobada | N/A |
| CP-ADV-041 | flujo_recintos_creacion_y_consulta_post | API | Aprobada | N/A |
| CP-ADV-039 | flujo_recintos_locations_catalog_get | API | Aprobada | N/A |
| CP-ADV-040 | flujo_recintos_seat_types_catalog_get | API | Aprobada | N/A |
| CP-ADV-042 | flujo_salas_creacion_en_recinto_post | API | Aprobada | N/A |
| CP-ADV-043 | flujo_salas_mapa_asientos_builder_post | API | Aprobada | N/A |
| CP-ADV-051 | flujo_database_automatic_backup_config_put | API | Aprobada | N/A |
| CP-ADV-049 | flujo_database_backup_manual_trigger_post | API | Aprobada | N/A |
| CP-ADV-050 | flujo_database_export_formatos_json_svg_get | API | Aprobada | N/A |
| CP-ADV-024 | flujo_auth_password_incorrecta_rechazo_post | SECURITY | Aprobada | N/A |
| CP-ADV-023 | flujo_auth_rol_cruzado_operador_a_admin_sec | SECURITY | Aprobada | N/A |
| CP-ADV-022 | flujo_auth_rol_cruzado_usuario_a_admin_sec | SECURITY | Aprobada | N/A |
| CP-ADV-025 | flujo_auth_sqli_payload_login_post | SECURITY | Aprobada | N/A |
| CP-ADV-010 | flujo_transferencia_a_si_mismo_rechazo_post | API | Aprobada | N/A |
| CP-ADV-012 | flujo_transferencia_claim_info_token_inexistente_get | API | Aprobada | N/A |
| CP-ADV-013 | flujo_transferencia_incoming_list_get | API | Aprobada | N/A |
| CP-ADV-011 | flujo_transferencia_recipient_vacio_post | API | Aprobada | N/A |
