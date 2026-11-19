# INFORME DE QA AUTOMATION - ROL GESTOR
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** Microservicios en Vivo (Docker + Gateway + MySQL)

---

## 1. RESUMEN EJECUTIVO (GESTOR)

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | 78 |
| **Pruebas Ejecutadas** | 78 |
| **Pruebas Aprobadas (PASS)** | 74 |
| **Pruebas Fallidas (FAIL)** | 4 |
| **Pruebas Bloqueadas (BLOCKED)** | 0 |
| **Porcentaje de Ejecución** | 100.0% |
| **Porcentaje de Aprobación** | 94.9% |
| **Tiempo de Ejecución** | 123.56 s |

---

## 2. NIVELES DE PRUEBA APLICADOS (GESTOR)

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES (GESTOR)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
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
| CP-GES-041 | gestor_desktop_user_agents_ct | CT | Aprobada | N/A |
| CP-GES-042 | gestor_utf8_encoding_ct | CT | Aprobada | N/A |
| CP-GES-074 | gestor_courtesy_quotas_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-073 | gestor_events_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-075 | gestor_merchandise_persistence_db | DATABASE | Aprobada | N/A |
| CP-GES-076 | gestor_user_record_integrity_db | DATABASE | Aprobada | N/A |
| CP-GES-047 | gestor_complete_session_flow_e2e | E2E | Aprobada | N/A |
| CP-GES-045 | gestor_extreme_event_id_boundary_et | ET | Aprobada | N/A |
| CP-GES-046 | gestor_extreme_pagination_transactions_et | ET | Aprobada | N/A |
| CP-GES-007 | gestor_courtesy_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-006 | gestor_event_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-008 | gestor_merchandise_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-009 | gestor_venue_service_mysql_it | IT | Aprobada | N/A |
| CP-GES-026 | gestor_events_health_oat | OAT | Aprobada | N/A |
| CP-GES-028 | gestor_merchandise_health_oat | OAT | Aprobada | N/A |
| CP-GES-029 | gestor_stats_health_oat | OAT | Aprobada | N/A |
| CP-GES-027 | gestor_tickets_health_oat | OAT | Aprobada | N/A |
| CP-GES-035 | gestor_dashboard_latency_pt | PT | Aprobada | N/A |
| CP-GES-033 | gestor_events_latency_pt | PT | Aprobada | N/A |
| CP-GES-034 | gestor_transactions_latency_pt | PT | Aprobada | N/A |
| CP-GES-030 | gestor_events_schema_contract_rt | RT | Aprobada | N/A |
| CP-GES-031 | gestor_stats_schema_contract_rt | RT | Aprobada | N/A |
| CP-GES-032 | gestor_venues_schema_contract_rt | RT | Aprobada | N/A |
| CP-GES-036 | gestor_admin_routes_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-037 | gestor_db_optimize_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-038 | gestor_quota_creation_rejected_sec | SECURITY | Aprobada | N/A |
| CP-GES-039 | gestor_transactions_rbac_bypass_sec | SECURITY | Fallida | DEF-GES-001 |
| CP-GES-040 | gestor_unauthenticated_request_sec | SECURITY | Aprobada | N/A |
| CP-GES-013 | gestor_gateway_courtesy_quotas_sit | SIT | Aprobada | N/A |
| CP-GES-010 | gestor_gateway_events_sit | SIT | Aprobada | N/A |
| CP-GES-015 | gestor_gateway_merchandise_sit | SIT | Aprobada | N/A |
| CP-GES-012 | gestor_gateway_revenue_analytics_sit | SIT | Aprobada | N/A |
| CP-GES-014 | gestor_gateway_stats_dashboard_sit | SIT | Aprobada | N/A |
| CP-GES-011 | gestor_gateway_tickets_analytics_sit | SIT | Aprobada | N/A |
| CP-GES-017 | gestor_events_filtering_st | ST | Aprobada | N/A |
| CP-GES-018 | gestor_revenue_consistency_st | ST | Aprobada | N/A |
| CP-GES-020 | gestor_transactions_audit_st | ST | Aprobada | N/A |
| CP-GES-019 | gestor_venue_rooms_capacity_st | ST | Aprobada | N/A |
| CP-GES-016 | gestor_workspace_auth_guard_st | ST | Aprobada | N/A |
| CP-GES-025 | gestor_analytics_readiness_uat | UAT | Aprobada | N/A |
| CP-GES-023 | gestor_courtesy_audit_uat | UAT | Aprobada | N/A |
| CP-GES-022 | gestor_event_lifecycle_uat | UAT | Aprobada | N/A |
| CP-GES-021 | gestor_login_and_claims_uat | UAT | Aprobada | N/A |
| CP-GES-024 | gestor_merchandise_catalog_uat | UAT | Aprobada | N/A |
| CP-GES-044 | gestor_create_event_validation_feedback_us | USABILITY | Aprobada | N/A |
| CP-GES-043 | gestor_invalid_courtesy_token_feedback_us | USABILITY | Aprobada | N/A |
| CP-GES-002 | gestor_courtesy_quota_math_ut | UT | Aprobada | N/A |
| CP-GES-001 | gestor_event_duration_calculator_ut | UT | Aprobada | N/A |
| CP-GES-004 | gestor_event_status_transition_ut | UT | Aprobada | N/A |
| CP-GES-003 | gestor_merchandise_commission_calc_ut | UT | Aprobada | N/A |
| CP-GES-005 | gestor_seating_occupancy_calc_ut | UT | Aprobada | N/A |
| CP-ADV-021 | flujo_gestor_aislamiento_eventos_ajenos_sec | SECURITY | Aprobada | N/A |
| CP-ADV-020 | flujo_gestor_contratos_b2b_list_get | API | Aprobada | N/A |

---

## 5. MATRIZ DE DEFECTOS DETECTADOS (ROL GESTOR)

### DEF-GES-001: Falla de Control de Acceso RBAC en Transacciones Comerciales
- **ID de Prueba Asociado:** CP-GES-039 (`gestor_transactions_rbac_bypass_sec`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/manager/transactions`)
- **Severidad:** **Alta**
- **Impacto:** El endpoint `/api/manager/transactions` carece de `@PreAuthorize("hasAnyRole('gestor', 'admin')")`. Cualquier usuario autenticado (incluido el rol `usuario` regular) puede invocar el endpoint y consultar transacciones.
- **Causa Raíz:** `EventController.java` valida únicamente `if (principal == null)`, omitiendo la verificación de rol en el objeto principal.
- **Solución Propuesta:** Incorporar `@PreAuthorize("hasAnyRole('gestor', 'admin')")` o validar `principal.getRole()` en el controlador.

### DEF-GES-002: Inaccesibilidad de Funciones de Evento (HTTP 404)
- **ID de Prueba Asociado:** CP-GES-054 (`manager_event_functions_endpoint_get`)
- **Componente Afectado:** `laika_events` (`EventController.java`, endpoint `/{event_id}/functions`)
- **Severidad:** **Media**
- **Impacto:** El endpoint devuelve HTTP 404 Not Found a pesar de existir en el controlador, forzando al frontend (`laika-gestor/src/services/managerService.js`) a implementar un bloque de contingencia `try...catch` que consulta el evento completo.
- **Causa Raíz:** Falta de coincidencia de ruta en la cadena de filtros o error de serialización en `eventQueryService.getEventById(eventId, false)`.
- **Solución Propuesta:** Corregir el mapeo de ruta en `EventController` y habilitar `@GetMapping("/{event_id}/functions")` en `SecurityConfig`.

### DEF-GES-003: Falta de Enrutamiento de Preventas en API Gateway
- **ID de Prueba Asociado:** CP-GES-060 (`manager_presale_info_endpoint_get`)
- **Componente Afectado:** `laika_gateway` (`RouteMapper.java`, ruta `/api/presale/**`)
- **Severidad:** **Alta**
- **Impacto:** Las peticiones a `/api/presale/{event_id}/info` son rechazadas por el Gateway con HTTP 404 `{"detail":"Not Found"}`.
- **Causa Raíz:** La clase `RouteMapper.java` en el Gateway no contiene la regla de enrutamiento para `/api/presale/**` hacia el microservicio `laika_events` (puerto 8201).
- **Solución Propuesta:** Agregar la condición `else if (path.startsWith("/api/presale")) { targetUrl = eventsUrl + path.substring("/api".length()); }` en `RouteMapper.java`.

### DEF-GES-004: Método GET no Permitido en Detalle de Recintos (HTTP 405)
- **ID de Prueba Asociado:** CP-GES-067 (`manager_venue_detail_endpoint_get`)
- **Componente Afectado:** `laika_events` (`VenueController.java`, ruta `/venues/{venue_id}`)
- **Severidad:** **Media**
- **Impacto:** El frontend `laika-gestor` invoca `venueAPI.getById(id)` (`GET /api/venues/{id}`), pero el backend responde HTTP 405 Method Not Allowed porque el controlador solo implementa `@PutMapping` y `@DeleteMapping` para ese path.
- **Causa Raíz:** Omisión del método `@GetMapping("/{venue_id}")` en `VenueController.java`.
- **Solución Propuesta:** Implementar `@GetMapping("/{venue_id}")` en `VenueController` delegando a `venueService.getById(venueId)`.

---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/gestor/`
- **Evidencias Crudas JSON:** `test/evidencias/gestor/`
