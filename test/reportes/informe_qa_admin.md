# INFORME DE QA AUTOMATION - ROL ADMIN
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** Microservicios en Vivo (Docker + Gateway + MySQL)

---

## 1. RESUMEN EJECUTIVO (ADMIN)

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | 95 |
| **Pruebas Ejecutadas** | 95 |
| **Pruebas Aprobadas (PASS)** | 94 |
| **Pruebas Fallidas (FAIL)** | 1 |
| **Pruebas Bloqueadas (BLOCKED)** | 0 |
| **Porcentaje de Ejecución** | 100.0% |
| **Porcentaje de Aprobación** | 98.9% |
| **Tiempo de Ejecución** | 123.56 s |

---

## 2. NIVELES DE PRUEBA APLICADOS (ADMIN)

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES (ADMIN)

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
| CP-ADM-041 | compatibilidad_user_agents_admin_ct | CT | Aprobada | N/A |
| CP-ADM-042 | soporte_utf8_en_anuncios_y_broadcast_ct | CT | Aprobada | N/A |
| CP-ADM-088 | admin_persistencia_ads_db | DATABASE | Aprobada | N/A |
| CP-ADM-086 | admin_persistencia_config_db | DATABASE | Aprobada | N/A |
| CP-ADM-087 | admin_persistencia_restore_event_db | DATABASE | Aprobada | N/A |
| CP-ADM-085 | admin_persistencia_usuario_creado_db | DATABASE | Aprobada | N/A |
| CP-ADM-047 | ciclo_completo_administrador_e2e | E2E | Aprobada | N/A |
| CP-ADM-046 | exploratorio_ids_inexistentes_en_usuarios_et | ET | Aprobada | N/A |
| CP-ADM-045 | exploratorio_paginacion_limites_extremos_et | ET | Aprobada | N/A |
| CP-ADM-009 | admin_auth_user_query_it | IT | Aprobada | N/A |
| CP-ADM-007 | admin_backup_history_persistence_it | IT | Aprobada | N/A |
| CP-ADM-008 | admin_restore_event_persistence_it | IT | Aprobada | N/A |
| CP-ADM-006 | admin_service_mysql_connection_it | IT | Aprobada | N/A |
| CP-ADM-027 | disponibilidad_tablas_admin_mysql_oat | OAT | Aprobada | N/A |
| CP-ADM-029 | limpieza_cache_admin_oat | OAT | Aprobada | N/A |
| CP-ADM-028 | optimizacion_tablas_admin_oat | OAT | Aprobada | N/A |
| CP-ADM-026 | salud_microservicio_admin_oat | OAT | Aprobada | N/A |
| CP-ADM-035 | latencia_admin_login_pt | PT | Aprobada | N/A |
| CP-ADM-033 | latencia_admin_users_list_pt | PT | Aprobada | N/A |
| CP-ADM-034 | latencia_database_tables_stats_pt | PT | Aprobada | N/A |
| CP-ADM-030 | regresion_contrato_admin_users_rt | RT | Aprobada | N/A |
| CP-ADM-031 | regresion_contrato_database_tables_rt | RT | Aprobada | N/A |
| CP-ADM-032 | regresion_contrato_system_config_rt | RT | Aprobada | N/A |
| CP-ADM-039 | inyeccion_sql_en_busqueda_usuarios_security | SECURITY | Aprobada | N/A |
| CP-ADM-036 | rbac_rechazo_usuario_regular_en_admin_users_security | SECURITY | Aprobada | N/A |
| CP-ADM-037 | rbac_rechazo_usuario_regular_en_database_backups_security | SECURITY | Aprobada | N/A |
| CP-ADM-038 | rechazo_peticion_sin_token_en_admin_security | SECURITY | Aprobada | N/A |
| CP-ADM-040 | sanitizacion_xss_en_configuracion_sistema_security | SECURITY | Aprobada | N/A |
| CP-GES-036 | gestor_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-032 | operador_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-ADM-013 | gateway_admin_b2b_sit | SIT | Aprobada | N/A |
| CP-ADM-012 | gateway_admin_config_sit | SIT | Aprobada | N/A |
| CP-ADM-011 | gateway_admin_database_tables_sit | SIT | Aprobada | N/A |
| CP-ADM-015 | gateway_admin_monitoring_sit | SIT | Aprobada | N/A |
| CP-ADM-014 | gateway_admin_stats_sit | SIT | Aprobada | N/A |
| CP-ADM-010 | gateway_admin_users_sit | SIT | Aprobada | N/A |
| CP-ADM-019 | admin_database_tables_count_st | ST | Aprobada | N/A |
| CP-ADM-016 | admin_panel_auth_guard_st | ST | Aprobada | N/A |
| CP-ADM-020 | admin_restore_audit_severity_filter_st | ST | Aprobada | N/A |
| CP-ADM-017 | admin_user_filtering_by_role_st | ST | Aprobada | N/A |
| CP-ADM-018 | admin_user_filtering_by_status_st | ST | Aprobada | N/A |
| CP-ADM-022 | flujo_administracion_ciclo_vida_usuario_uat | UAT | Aprobada | N/A |
| CP-ADM-025 | flujo_configuracion_global_plataforma_uat | UAT | Aprobada | N/A |
| CP-ADM-023 | flujo_gestion_campanas_publicidad_uat | UAT | Aprobada | N/A |
| CP-ADM-021 | flujo_login_admin_y_verificacion_permisos_uat | UAT | Aprobada | N/A |
| CP-ADM-024 | flujo_mantenimiento_base_datos_uat | UAT | Aprobada | N/A |
| CP-ADM-043 | validacion_campos_requeridos_crear_usuario_usability | USABILITY | Aprobada | N/A |
| CP-ADM-044 | validacion_id_invalido_borrado_backup_usability | USABILITY | Aprobada | N/A |
| CP-ADM-003 | admin_ad_status_filter_ut | UT | Aprobada | N/A |
| CP-ADM-004 | admin_b2b_contract_date_validator_ut | UT | Aprobada | N/A |
| CP-ADM-002 | admin_backup_schedule_calculator_ut | UT | Aprobada | N/A |
| CP-ADM-001 | admin_permissions_validator_ut | UT | Aprobada | N/A |
| CP-ADM-005 | admin_user_role_transition_ut | UT | Aprobada | N/A |
| CP-ADV-045 | flujo_auth_desbloqueo_cuenta_admin_patch | SECURITY | Aprobada | N/A |
| CP-ADV-052 | flujo_admin_email_envio_html_post | API | Aprobada | N/A |
| CP-ADV-018 | flujo_mercancia_cambio_estado_admin_put | API | Aprobada | N/A |
| CP-ADV-023 | flujo_auth_rol_cruzado_operador_a_admin_sec | SECURITY | Aprobada | N/A |
| CP-ADV-022 | flujo_auth_rol_cruzado_usuario_a_admin_sec | SECURITY | Aprobada | N/A |

---

## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL ADMIN)

### DEF-ADM-001: Falta de Control de Acceso RBAC en Endpoints de Base de Datos
- **ID de Prueba Asociado:** CP-ADM-037 (`rbac_rechazo_usuario_regular_en_database_backups_security`)
- **Componente Afectado:** `laika_admin` (`DatabaseController.java`, endpoint `/database/backups`)
- **Severidad:** **Crítica**
- **Impacto:** Los endpoints de gestión de base de datos (`GET /api/database/backups` y `/api/database/stats`) no tienen la anotación `@PreAuthorize("hasRole('admin')")`, permitiendo que usuarios con rol `usuario` consulten el historial de respaldos y nombres de archivos de backup.
- **Causa Raíz:** Ausencia de validación de rol o filtro Spring Security en `DatabaseController.java`.
- **Solución Propuesta:** Agregar `@PreAuthorize("hasRole('admin')")` a nivel de clase o en cada método de `DatabaseController.java`.

---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/admin/`
- **Evidencias Crudas JSON:** `test/evidencias/admin/`
