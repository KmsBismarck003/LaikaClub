# Suite Integral de Automatizacion de Pruebas - LAIKA Club (tests)

Directorio centralizador de pruebas automatizadas para el ecosistema distribuido LAIKA Club: pruebas en caliente contra los microservicios reales en Docker (cero mocks), auditorias de infraestructura de red y pruebas algoritmicas en frio.

---

## 1. Descripcion General

El marco de pruebas de LAIKA Club garantiza la integridad transaccional, el control de acceso basado en roles (RBAC), la resistencia a la concurrencia masiva y la estabilidad de contratos entre el API Gateway Pilgrim y los microservicios de Spring Boot y Python.

Para la ejecucion y seguimiento de resultados se cuenta con dos modalidades:
1. **Ejecucion por Consola (CLI)**: Scripts nativos en Node.js de ejecucion instantanea con salida formateada.
2. **Dashboard Visual Interactivo**: Interfaz web reactiva que detecta en tiempo real el estado del Gateway y los puertos, permitiendo disparar suites individuales o masivas con transmision de logs en vivo via Server-Sent Events (SSE).

---

## 2. Dashboard Visual de Pruebas

- **URL Local**: `http://localhost:5050`
- **Comando de Inicio**: `node tests/dashboard/server.js` o `npm run test:dashboard`
- **Capacidades**:
  - Deteccion automatica del estado de salud del API Gateway (Pilgrim: 8000).
  - Ejecucion con un solo clic de las suites de integracion, unitarias, concurrencia y auditoria de puertos.
  - Consola de salida de logs en tiempo real mediante streaming SSE nativo.

---

## 3. Estructura del Directorio

```
tests/
├── dashboard/                   # Servidor y panel visual interactivo (Puerto 5050)
│   ├── server.js                # Servidor Node.js con soporte Server-Sent Events
│   └── public/                  # Frontend del panel (HTML, CSS y logica cliente)
│
├── integration/                 # Pruebas en caliente contra el sistema real (0 Mocks)
│   ├── real_system_live_tests.js    # 36 escenarios reales contra Pilgrim y Docker
│   ├── pilgrim_and_ports_audit.js  # Auditoria de 12 puertos TCP y metodos HTTP
│   └── README.md                # Documentacion detallada de cada escenario
│
├── unit/                        # Pruebas unitarias algoritmicas en frio
│   ├── authValidation.js        # Validadores matematicos de email, password y sanitizacion
│   ├── ticketBusinessLogic.js   # Maquina de estados, Luhn, transferencias y cortesias
│   ├── run-unit-tests.js        # Ejecutor autocontenido (35 pruebas unitarias)
│   └── README.md                # Documentacion de pruebas unitarias
│
├── api/                         # Validacion de contratos de API
│   ├── laika_postman_collection.json # Coleccion Postman v2.1.0 completa
│   ├── api-runner.js            # Verificador de contratos y estado del Gateway
│   └── README.md                # Guia de importacion para Newman y Postman
│
├── e2e/                         # Pruebas de extremo a extremo en navegador
│   ├── auth_and_tickets.spec.js # Flujos de compra, navegacion y validacion de acceso
│   └── README.md                # Guia de ejecucion con Playwright
│
├── performance/                 # Pruebas de estres y concurrencia
│   ├── simulate_concurrency_stress.js # Simulador de condiciones de carrera (50 y 200 usuarios)
│   ├── ticket_validation_load_test.jmx # Plan de carga para Apache JMeter
│   └── README.md                # Guia de ejecucion de carga
│
└── docs/
    └── PLAN_DE_PRUEBAS_LAIKA_CLUB.md # Documento maestro con plan formal y casos de prueba
```

---

## 4. Comandos de Ejecucion Rapida

| Suite de Prueba | Comando de Ejecucion | Requiere Docker / Sistema Activo | Tiempo Estimado |
| :--- | :--- | :--- | :--- |
| **Integracion en Vivo (36 Casos)** | `node tests/integration/real_system_live_tests.js` | **Si (Gateway 8000 y Docker)** | ~3.5 s |
| **Auditoria de 12 Puertos y Verbos HTTP** | `node tests/integration/pilgrim_and_ports_audit.js` | **Si (Puertos y Gateway)** | ~1.5 s |
| **Prueba Individual de Integracion** | `node tests/integration/real_system_live_tests.js --test=15` | **Si (Gateway 8000)** | ~300 ms |
| **Unitarias en Frio (35 Casos)** | `node tests/unit/run-unit-tests.js` | **No (Memoria)** | ~50 ms |
| **Simulador de Concurrencia** | `node tests/performance/simulate_concurrency_stress.js` | **No (Memoria)** | ~15 ms |
| **Verificacion de Contratos API** | `node tests/api/api-runner.js` | Opcional | ~120 ms |
| **Coleccion Postman via Newman** | `npx newman run tests/api/laika_postman_collection.json` | **Si (Gateway 8000)** | Variable |
| **JMeter (Pruebas de Carga Masiva)**| `jmeter -n -t tests/performance/ticket_validation_load_test.jmx` | **Si (Gateway 8000)** | Configurable |

---

## 5. Resumen de Cobertura de Integracion en Vivo (36 Escenarios)

1. **Autenticacion y Credenciales (Casos 1-5, 18, 36)**: Validacion de usuario inexistente, contrasena incorrecta, emision de JWT, login de operador, inyeccion SQL neutralizada, sesion activa y cierre de sesion con registro en `auth_logs`.
2. **Registro de Cuentas y Sanitizacion (Casos 6-9)**: Bloqueo de correos duplicados, formato malformado, contrasenas debiles y campos en blanco.
3. **Control de Acceso Basado en Roles - RBAC (Casos 10-12)**: Bloqueo de accesos anonimos a administracion, restriccion de operador en rutas de administrador y autorizacion valida de admin.
4. **Asientos, Compras y Prevencion de Doble Cobro (Casos 13-16, 30-31)**: Consulta de mapas en vivo, rechazo de asientos ocupados (`409 Conflict`), evaluacion de doble clic simultaneo (`ReentrantLock`), validacion de pasarela de pagos y bloqueo de compras para eventos vencidos.
5. **Control de Acceso y Torniquetes (Caso 17)**: Deteccion de codigos QR invalidos o inexistentes.
6. **Seguridad y Fuerza Bruta (Caso 19)**: Verificacion del contador de bloqueos preventivos (`/check-lockout`).
7. **Transferencia de Boletos (Casos 20-22)**: Prohibicion de transferencia a uno mismo, boletos inexistentes o transferencias anonimas sin JWT.
8. **Cortesias y Acreditaciones (Casos 23-26)**: Auditoria de cuotas en base de datos MySQL, rechazo de tokens inexistentes y validacion de campos requeridos.
9. **Cancelaciones y Reembolsos (Casos 27-29)**: Consulta de politica de devolucion (24 horas previas al evento), cotizacion de tickets y obligatoriedad de `ticketId`.
10. **Tienda Oficial de Mercancia (Casos 32-34)**: Estado del servicio `laika_merchandise`, catalogo en vivo y manejo de articulos inexistentes.
11. **Concurrencia Extrema de Asientos (Caso 35)**: Rafaga simultanea de 50 peticiones compitiendo por un unico asiento; exactamente 1 es aprobada (`200 OK`) y 49 son rechazadas (`409 Conflict`).
