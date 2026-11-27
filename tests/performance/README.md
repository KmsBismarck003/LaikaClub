# Pruebas de Rendimiento, Carga y Concurrencia (tests/performance)

Este directorio contiene simuladores de concurrencia en Node.js y un plan de carga en Apache JMeter para evaluar condiciones de carrera en compra de asientos y tiempos de respuesta bajo solicitudes paralelas.

---

## 1. Archivos Incluidos

1. **`simulate_concurrency_stress.js`**:
   - Simula **200 usuarios concurrentes** intentando apartar y comprar el mismo asiento (`ZONA-VIP-01`, Evento `#19`) usando `SeatLockManager` y `processPurchaseIntent` de `tests/unit/ticketBusinessLogic.js`.
   - Verifica que exactamente 1 usuario concreta la compra y los 199 restantes son bloqueados.
2. **`simulate_ml_analytics_load.js`**:
   - Lanza **20 solicitudes concurrentes** contra 6 endpoints analiticos y de Machine Learning (`/api/analytics/tables`, `/ml/regression`, `/ml/decision-tree`, `/ml/prospecting`, `/ml/user-behavior`, `/3d?table=tickets`) usando `LAIKA_GATEWAY_URL` (`http://localhost:8000`) o `ANALYTICS_SERVICE_URL`.
3. **`ticket_validation_load_test.jmx`**:
   - Plan de carga para Apache JMeter orientado a validacion y canje concurrente en torniquetes (`/tickets/verify` y `/tickets/redeem`).

---

## 2. Como Ejecutar

### Simulador de Concurrencia de Boletos (en memoria)
```bash
node tests/performance/simulate_concurrency_stress.js
```

### Simulador de Carga ML y Big Data (requiere backend activo)
```bash
node tests/performance/simulate_ml_analytics_load.js
```

### Plan de Carga Apache JMeter (requiere JMeter 5.0+ y backend activo)
```bash
jmeter -n -t tests/performance/ticket_validation_load_test.jmx -l tests/performance/resultados.jtl -e -o tests/performance/reporte_html
```
