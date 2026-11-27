# INFORME DE QA AUTOMATION - ROL OPERADOR
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** Microservicios en Vivo (Docker + Gateway + MySQL)

---

## 1. RESUMEN EJECUTIVO (OPERADOR)

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | 65 |
| **Pruebas Ejecutadas** | 65 |
| **Pruebas Aprobadas (PASS)** | 64 |
| **Pruebas Fallidas (FAIL)** | 1 |
| **Pruebas Bloqueadas (BLOCKED)** | 0 |
| **Porcentaje de Ejecución** | 100.0% |
| **Porcentaje de Aprobación** | 98.5% |
| **Tiempo de Ejecución** | 123.56 s |

---

## 2. NIVELES DE PRUEBA APLICADOS (OPERADOR)

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES (OPERADOR)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
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
| CP-OPE-037 | operador_handheld_scanners_ct | CT | Aprobada | N/A |
| CP-OPE-038 | operador_utf8_gate_notes_ct | CT | Aprobada | N/A |
| CP-OPE-059 | operador_tickets_status_consistency_db | DATABASE | Aprobada | N/A |
| CP-OPE-060 | operador_user_account_integrity_db | DATABASE | Aprobada | N/A |
| CP-OPE-058 | operador_validation_logs_persistence_db | DATABASE | Aprobada | N/A |
| CP-OPE-043 | operador_complete_terminal_shift_e2e | E2E | Aprobada | N/A |
| CP-OPE-042 | operador_extreme_length_ticket_code_et | ET | Aprobada | N/A |
| CP-OPE-041 | operador_malformed_qr_payload_et | ET | Aprobada | N/A |
| CP-OPE-009 | operador_auth_user_query_it | IT | Aprobada | N/A |
| CP-OPE-007 | operador_ticket_service_mysql_it | IT | Aprobada | N/A |
| CP-OPE-008 | operador_validation_repo_mysql_it | IT | Aprobada | N/A |
| CP-OPE-006 | operador_validation_service_mysql_it | IT | Aprobada | N/A |
| CP-OPE-024 | operador_stats_health_oat | OAT | Aprobada | N/A |
| CP-OPE-023 | operador_tickets_health_oat | OAT | Aprobada | N/A |
| CP-OPE-025 | operador_validation_table_availability_oat | OAT | Aprobada | N/A |
| CP-OPE-029 | operador_gate_verification_latency_pt | PT | Aprobada | N/A |
| CP-OPE-031 | operador_staff_dashboard_latency_pt | PT | Aprobada | N/A |
| CP-OPE-030 | operador_validations_history_latency_pt | PT | Aprobada | N/A |
| CP-OPE-027 | operador_history_schema_contract_rt | RT | Aprobada | N/A |
| CP-OPE-028 | operador_staff_stats_contract_rt | RT | Aprobada | N/A |
| CP-OPE-026 | operador_verify_schema_contract_rt | RT | Aprobada | N/A |
| CP-OPE-032 | operador_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-033 | operador_courtesy_quota_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-036 | operador_sqli_ticket_verify_sec | SECURITY | Aprobada | N/A |
| CP-OPE-035 | operador_staff_dashboard_rbac_bypass_sec | SECURITY | Fallida | DEF-OPE-001 |
| CP-OPE-034 | operador_unauthenticated_staff_rejected_sec | SECURITY | Aprobada | N/A |
| CP-OPE-014 | operador_gateway_busy_seats_sit | SIT | Aprobada | N/A |
| CP-OPE-013 | operador_gateway_staff_dashboard_sit | SIT | Aprobada | N/A |
| CP-OPE-011 | operador_gateway_staff_verify_sit | SIT | Aprobada | N/A |
| CP-OPE-010 | operador_gateway_tickets_verify_sit | SIT | Aprobada | N/A |
| CP-OPE-012 | operador_gateway_validations_history_sit | SIT | Aprobada | N/A |
| CP-OPE-016 | operador_audit_trail_consistency_st | ST | Aprobada | N/A |
| CP-OPE-018 | operador_busy_seats_consistency_st | ST | Aprobada | N/A |
| CP-OPE-017 | operador_invalid_scan_logging_st | ST | Aprobada | N/A |
| CP-OPE-015 | operador_terminal_auth_guard_st | ST | Aprobada | N/A |
| CP-OPE-021 | operador_access_denial_feedback_uat | UAT | Aprobada | N/A |
| CP-OPE-019 | operador_login_and_claims_uat | UAT | Aprobada | N/A |
| CP-OPE-022 | operador_staff_analytics_readiness_uat | UAT | Aprobada | N/A |
| CP-OPE-020 | operador_ticket_verification_uat | UAT | Aprobada | N/A |
| CP-OPE-039 | operador_future_event_feedback_us | USABILITY | Aprobada | N/A |
| CP-OPE-040 | operador_invalid_code_feedback_us | USABILITY | Aprobada | N/A |
| CP-OPE-005 | operador_badge_color_mapper_ut | UT | Aprobada | N/A |
| CP-OPE-004 | operador_device_header_extractor_ut | UT | Aprobada | N/A |
| CP-OPE-003 | operador_flow_rate_calc_ut | UT | Aprobada | N/A |
| CP-OPE-001 | operador_qr_parser_ut | UT | Aprobada | N/A |
| CP-OPE-002 | operador_status_code_evaluator_ut | UT | Aprobada | N/A |
| CP-ADV-028 | flujo_operador_canje_duplicado_post | API | Aprobada | N/A |
| CP-ADV-027 | flujo_operador_codigo_erroneo_y_falsificado_post | API | Aprobada | N/A |
| CP-ADV-026 | flujo_operador_qr_en_evento_diferente_sec | SECURITY | Aprobada | N/A |
| CP-ADV-029 | flujo_operador_ticket_transferido_post | API | Aprobada | N/A |
| CP-ADV-023 | flujo_auth_rol_cruzado_operador_a_admin_sec | SECURITY | Aprobada | N/A |

---

## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL OPERADOR)

### DEF-OPE-001: Falla de Control de Acceso RBAC en Métricas de Aforo y Personal
- **ID de Prueba Asociado:** CP-OPE-035 (`operador_rbac_staff_dashboard_rejected_sec`)
- **Componente Afectado:** `laika_stats` (`StatsController.java`, endpoint `/staff/dashboard`)
- **Severidad:** **Alta**
- **Impacto:** El endpoint `GET /api/stats/staff/dashboard` carece de `@PreAuthorize("hasAnyRole('operador', 'admin')")`. Cualquier usuario regular (`usuario`) autenticado puede invocar el endpoint y consultar las métricas operativas de validaciones en vivo.
- **Causa Raíz:** Falta de restricción de rol en el método `getStaffDashboard()` de `StatsController.java`.
- **Solución Propuesta:** Incorporar `@PreAuthorize("hasAnyRole('operador', 'admin')")` sobre el método o a nivel de controlador.

---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/operador/`
- **Evidencias Crudas JSON:** `test/evidencias/operador/`
