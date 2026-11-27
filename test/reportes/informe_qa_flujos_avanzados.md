# INFORME DE QA AUTOMATION - ROL FLUJOS AVANZADOS
**Fecha de Ejecución:** 2026-11-16 16:15:54  
**Responsable:** QA Automation Architect Senior  
**Versión / Build:** 3.0.0-PROD  
**Ambiente:** Microservicios en Vivo (Docker + Gateway + MySQL)

---

## 1. RESUMEN EJECUTIVO (FLUJOS AVANZADOS)

| Métrica | Valor |
|---|---|
| **Total de Casos Identificados y Generados** | 59 |
| **Pruebas Ejecutadas** | 59 |
| **Pruebas Aprobadas (PASS)** | 59 |
| **Pruebas Fallidas (FAIL)** | 0 |
| **Pruebas Bloqueadas (BLOCKED)** | 0 |
| **Porcentaje de Ejecución** | 100.0% |
| **Porcentaje de Aprobación** | 100.0% |
| **Tiempo de Ejecución** | 123.56 s |

---

## 2. NIVELES DE PRUEBA APLICADOS (FLUJOS AVANZADOS)

Se evaluaron exhaustivamente los 15 niveles de prueba: UT, IT, SIT, ST, UAT, OAT, RT, PT, SECURITY, CT, USABILITY, ET, E2E, API y DATABASE.

---

## 3. DETALLE DE CASOS DE PRUEBA INDIVIDUALES (FLUJOS AVANZADOS)

| ID de Prueba | Nombre de la Prueba | Nivel | Resultado | Defecto |
|---|---|---|---|---|
| CP-028 | flujo_reserva_bloqueo_asiento_st | ST | Aprobada | N/A |
| CP-ADM-022 | flujo_administracion_ciclo_vida_usuario_uat | UAT | Aprobada | N/A |
| CP-ADM-025 | flujo_configuracion_global_plataforma_uat | UAT | Aprobada | N/A |
| CP-ADM-023 | flujo_gestion_campanas_publicidad_uat | UAT | Aprobada | N/A |
| CP-ADM-021 | flujo_login_admin_y_verificacion_permisos_uat | UAT | Aprobada | N/A |
| CP-ADM-024 | flujo_mantenimiento_base_datos_uat | UAT | Aprobada | N/A |
| CP-029 | flujo_registro_e_inicio_sesion_uat | UAT | Aprobada | N/A |
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

---


---

## 6. TRAZABILIDAD DE ARTEFACTOS

- **Casos en Markdown:** `test/resultados/casos/avanzados/`
- **Evidencias Crudas JSON:** `test/evidencias/avanzados/`
