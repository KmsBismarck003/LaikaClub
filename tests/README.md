# Suite Integral de Automatizacion de Pruebas - LAIKA Club (tests)

Suite automatizada en Node.js para el ecosistema LAIKA Club: pruebas unitarias en frio (logica de boletos, seguridad y algoritmos ML/Big Data), pruebas de integracion en vivo sin mocks contra Docker/Pilgrim, auditoria de puertos TCP, pruebas de carga/concurrencia, contratos API, especificacion E2E y dashboard visual interactivo.

---

## 1. Modalidades de Ejecucion

1. **Ejecucion por CLI (Node.js)**: Scripts autocontenidos ejecutables desde la raiz del repositorio o desde pipelines CI/CD (`.github/workflows/ci.yml` y `cd.yml`).
2. **Dashboard Visual Interactivo (`http://localhost:5050`)**: Servidor HTTP nativo (`tests/dashboard/server.js`) sin dependencias externas con streaming SSE (`/api/run`), estado de Pilgrim (`/api/gateway-status`), monitoreo TCP de 11 servicios (`/api/services-health`), metricas (`/api/system-metrics`) y prueba interactiva de concurrencia de 200 usuarios (`/api/run-stress-test`).

Inicio del dashboard:
```bash
node tests/dashboard/server.js
```

---

## 2. Estructura del Directorio

```text
tests/
├── dashboard/
│   ├── server.js                           # Servidor Node.js nativo con SSE (Puerto 5050)
│   └── public/                             # Interfaz web del dashboard (index.html, app.js, style.css)
├── unit/
│   ├── authValidation.js                   # Validadores de correo, contrasena, SQLi, XSS y sanitizacion
│   ├── ticketBusinessLogic.js              # Estados de boleto, SeatLockManager, Luhn, transferencias y cortesias
│   ├── mlAnalyticsAlgorithms.js            # Regresion lineal, arboles de decision, K-Means, bots, churn, KDD y MATIS
│   ├── run-unit-tests.js                   # 35 pruebas unitarias de seguridad y dominio de boletos
│   ├── run-ml-unit-tests.js                # 25 pruebas unitarias de algoritmos ML y Big Data
│   └── README.md
├── integration/
│   ├── real_system_live_tests.js           # 36 escenarios en vivo contra Pilgrim y Docker (0 mocks)
│   ├── ml_and_bigdata_live_tests.js        # 15 escenarios en vivo contra endpoints ML, Big Data y MATIS
│   ├── pilgrim_and_ports_audit.js          # Auditoria de 12 puertos TCP y verbos HTTP en Pilgrim
│   └── README.md
├── performance/
│   ├── simulate_concurrency_stress.js      # Simulador de 200 usuarios concurrentes por 1 asiento
│   ├── simulate_ml_analytics_load.js       # Simulador de 20 peticiones concurrentes a endpoints ML
│   ├── ticket_validation_load_test.jmx     # Plan de carga para Apache JMeter
│   └── README.md
├── api/
│   ├── laika_postman_collection.json       # Coleccion Postman v2.1.0
│   ├── api-runner.js                       # Verificador de contratos y estado del gateway
│   └── README.md
├── e2e/
│   ├── auth_and_tickets.spec.js            # Especificacion de flujos E2E
│   └── README.md
└── docs/
    └── PLAN_DE_PRUEBAS_LAIKA_CLUB.md       # Plan maestro de pruebas
```

---

## 3. Comandos de Ejecucion

| Suite | Comando | Requiere Sistema Activo | Cobertura |
| :--- | :--- | :--- | :--- |
| **CI Completo (Unitarias)** | `npm run test:ci` | No | 60 casos (35 negocio/seguridad + 25 ML/Big Data) |
| **Unitarias de Negocio** | `npm run test:unit` o `node tests/unit/run-unit-tests.js` | No | 35 casos |
| **Unitarias ML & Big Data** | `npm run test:ml` o `node tests/unit/run-ml-unit-tests.js` | No | 25 casos |
| **Integracion en Vivo** | `node tests/integration/real_system_live_tests.js` | Si (Pilgrim 8000 + Docker) | 36 escenarios (soporta `--test=N`) |
| **Integracion ML & MATIS** | `node tests/integration/ml_and_bigdata_live_tests.js` | Si (Pilgrim 8000 / 8303) | 15 escenarios (soporta `--test=N`) |
| **Auditoria de Puertos y HTTP** | `node tests/integration/pilgrim_and_ports_audit.js` | Si (Puertos y Pilgrim) | 12 puertos TCP + GET/POST/PUT/DELETE/OPTIONS |
| **Estres de Concurrencia** | `node tests/performance/simulate_concurrency_stress.js` | No | 200 usuarios compitiendo por `ZONA-VIP-01` |
| **Carga ML / Big Data** | `node tests/performance/simulate_ml_analytics_load.js` | Si (Pilgrim 8000 / 8007) | 20 consultas paralelas a 6 endpoints ML |
| **Contratos API** | `node tests/api/api-runner.js` | Opcional | Validacion de coleccion Postman |
| **Newman (Postman CLI)** | `npx newman run tests/api/laika_postman_collection.json` | Si (Pilgrim 8000) | Coleccion v2.1.0 |
| **JMeter** | `jmeter -n -t tests/performance/ticket_validation_load_test.jmx` | Si (Pilgrim 8000) | Validacion masiva en torniquetes |
| **Dashboard Visual QA** | `node tests/dashboard/server.js` | Opcional | Panel en `http://localhost:5050` |

---

## 4. Documentacion por Subcarpeta

- [tests/unit/README.md](unit/README.md)
- [tests/integration/README.md](integration/README.md)
- [tests/performance/README.md](performance/README.md)
- [tests/api/README.md](api/README.md)
- [tests/e2e/README.md](e2e/README.md)
- [tests/docs/PLAN_DE_PRUEBAS_LAIKA_CLUB.md](docs/PLAN_DE_PRUEBAS_LAIKA_CLUB.md)
