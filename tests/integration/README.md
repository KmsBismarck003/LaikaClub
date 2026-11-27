# Pruebas de Integracion en Vivo (Cero Mocks)

Este directorio contiene las suites de pruebas de integracion en caliente que se ejecutan directamente contra Pilgrim API Gateway (`http://localhost:8000`), los microservicios activos en Docker y la base de datos MySQL (`laika_db`).

---

## 1. Suite Transaccional y de Seguridad (`real_system_live_tests.js` - 36 Escenarios)

Valida flujos reales contra `laika_auth` (8101), `laika_admin` (8102), `laika_events` (8201), `laika_tickets` (8202) y `laika_merchandise` (8203) via Pilgrim:

- **Autenticacion y Sesion (Casos 1-4, 18, 36)**: Usuario inexistente (401), contrasena incorrecta (401), login admin y operador con JWT, verificacion `/api/auth/verify` y cierre de sesion con registro en `auth_logs`.
- **Seguridad y Registro (Casos 5-9, 19)**: Inyeccion SQL en login, correo duplicado, formato invalido (422), contrasena corta (422), campos obligatorios vacios y `/check-lockout`.
- **RBAC (Casos 10-12)**: Bloqueo anonimo (401), bloqueo de operador en ruta admin y autorizacion legitima de admin (200).
- **Boletos, Asientos y Concurrencia (Casos 13-16, 30-31, 35)**: Mapa de asientos ocupados, rechazo de asiento ocupado (`409 Conflict`), prueba de doble clic simultaneo (1 `200 OK` y 1 `409 Conflict`), validacion de monto numerico en pagos, bloqueo de eventos concluidos/invalidos y rafaga concurrente de 50 compradores por 1 asiento (1 `200 OK`, 49 `409 Conflict`).
- **Torniquetes (Caso 17)**: Verificacion de QR inexistente (`INVALID_CODE`).
- **Transferencias (Casos 20-22)**: Rechazo de autotransferencia, boleto inexistente y solicitud anonima.
- **Cortesias (Casos 23-26)**: Cuotas en MySQL, token inexistente, canje falso y validacion de `recipientEmail`.
- **Cancelaciones y Reembolsos (Casos 27-29)**: Politica de devolucion (24h previas), cotizacion de boleto inexistente y obligatoriedad de `ticketId`.
- **Mercancia (Casos 32-34)**: Salud del servicio, catalogo en vivo y rechazo 404 para articulo inexistente.

Ejecucion:
```bash
# Suite completa (36 escenarios)
node tests/integration/real_system_live_tests.js

# Escenario individual (ejemplo: caso 15)
node tests/integration/real_system_live_tests.js --test=15
```

---

## 2. Suite de Machine Learning, Big Data y MATIS BI (`ml_and_bigdata_live_tests.js` - 15 Escenarios)

Audita los endpoints de `analytics_bigdata` a traves de Pilgrim (`LAIKA_GATEWAY_URL`, defecto `http://localhost:8000`) o directo (`ANALYTICS_SERVICE_URL`):

1. `GET /api/analytics/tables`
2. `GET /api/analytics/ml/regression`
3. `GET /api/analytics/ml/decision-tree`
4. `GET /api/analytics/ml/prospecting`
5. `GET /api/analytics/ml/anomaly`
6. `GET /api/analytics/ml/user-behavior`
7. `GET /api/analytics/ml/demand-prediction`
8. `GET /api/analytics/ml/elbow?max_k=6`
9. `GET /api/analytics/ml/pca?k=3`
10. `POST /api/analytics/clean?table=tickets`
11. `GET /api/analytics/merch/sales-insights`
12. `GET /api/analytics/3d?table=tickets`
13. `GET /api/analytics/matis/executive`
14. `GET /api/analytics/vault/status`
15. `GET /api/analytics/ml/recommendations/1`

Ejecucion:
```bash
node tests/integration/ml_and_bigdata_live_tests.js
node tests/integration/ml_and_bigdata_live_tests.js --test=3
```

---

## 3. Auditoria de Puertos y Metodos HTTP (`pilgrim_and_ports_audit.js`)

Verifica la disponibilidad de 12 puertos TCP (`8000`, `8101`, `8102`, `8103`, `8201`, `8202`, `8203`, `8301`, `8302`, `8303`, `3000`, `3306`), endpoints de salud de Pilgrim y verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` CORS).

Ejecucion:
```bash
node tests/integration/pilgrim_and_ports_audit.js
```
