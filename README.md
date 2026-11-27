# LAIKA Club - Plataforma Integral de Gestion de Eventos y Boletos

Plataforma distribuida para la comercializacion, emision y control de acceso de boletos para espectaculos en vivo. Integra microservicios transaccionales en Java Spring Boot 3.2.5, procesamiento analitico y Machine Learning con Python/PySpark, un API Gateway perimetral asincrono en FastAPI (Pilgrim), una web publica en React, aplicaciones web desacopladas por rol (`laika-admin`, `laika-gestor`, `laika-operador`), un dashboard de inteligencia de negocios en SolidJS (`matis-solid`), aplicacion movil nativa en React Native/Expo (`LaikaMobil`) y suites de pruebas automatizadas.

---

## 1. Tabla de Contenidos

1. [Vision General del Sistema](#2-vision-general-del-sistema)
2. [Arquitectura Global y Mapeo de Puertos](#3-arquitectura-global-y-mapeo-de-puertos)
3. [Stack Tecnologico por Capas](#4-stack-tecnologico-por-capas)
4. [Estructura del Proyecto y Subproyectos](#5-estructura-del-proyecto-y-subproyectos)
5. [Modulos de Frontend Desacoplados](#6-modulos-de-frontend-desacoplados)
6. [Ecosistema de Microservicios Backend](#7-ecosistema-de-microservicios-backend)
7. [Aplicacion Movil (LaikaMobil)](#8-aplicacion-movil-laikamobil)
8. [Persistencia y Bases de Datos](#9-persistencia-y-bases-de-datos)
9. [Pruebas Automatizadas y Dashboard QA](#10-pruebas-automatizadas-y-dashboard-qa)
10. [Instalacion y Despliegue](#11-instalacion-y-despliegue)
11. [Variables de Entorno](#12-variables-de-entorno)
12. [Credenciales de Desarrollo](#13-credenciales-de-desarrollo)
13. [Integracion Continua, Entrega Continua y Documentacion](#14-integracion-continua-entrega-continua-y-documentacion)
14. [Licencia y Derechos](#15-licencia-y-derechos)

---

## 2. Vision General del Sistema

LAIKA Club opera bajo una arquitectura de microservicios con aislamiento de clientes por rol. La logica de negocio y persistencia transaccional residen en microservicios independientes detras de Pilgrim API Gateway (puerto 8000), que enruta el trafico de:

- **Web Publica (`src/`, puerto 3000)**: Catalogo de espectaculos, detalle de eventos, seleccion de asientos, Lucky Seat, tienda oficial, checkout, reclamo de cortesias y perfil de usuario.
- **Aplicaciones Web de Operacion Desacopladas**:
  - `laika-admin` (puerto 3010): Administracion global, usuarios, auditoria de autenticacion, aprobacion de mercancia, diseno de recintos con Konva, monitor de base de datos, contratos B2B, correos, notificaciones push y analitica Big Data.
  - `laika-gestor` (puerto 3020): Panel comercial para organizadores, gestion de eventos, metricas, transacciones, asistentes, publicidad y mercancia. Incluye ademas un backend local opcional en FastAPI + SQLite (`laika-gestor/backend/`) para pruebas aisladas.
  - `laika-operador` (puerto 3030): Terminal de campo en torniquetes con escaneo optico de QR (`html5-qrcode`), historial de validaciones, reporte de incidencias y asignaciones.
  - `matis-solid` (puerto 3040): Dashboard analitico en SolidJS con graficas ejecutivas y exportacion de reportes PDF mediante `jsPDF` y `jspdf-autotable`.
- **Aplicacion Movil (`LaikaMobil`)**: Aplicacion en React Native y Expo para Android e iOS con autenticacion biometrica, SSL pinning, boveda de boletos QR, transferencias, cortesias, cancelaciones, logros, notificaciones, accesibilidad y soporte offline.

---

## 3. Arquitectura Global y Mapeo de Puertos

```text
                                 [ CLIENTES WEB Y MOVIL ]
     +------------------+------------------+------------------+------------------+------------------+
     |                  |                  |                  |                  |                  |
[ Web Publica ]   [ laika-admin ]    [ laika-gestor ]  [ laika-operador ]  [ matis-solid ]   [ LaikaMobil ]
  Puerto 3000       Puerto 3010        Puerto 3020        Puerto 3030        Puerto 3040     Expo / Android-iOS
     |                  |                  |                  |                  |                  |
     +------------------+------------------+--------+---------+------------------+------------------+
                                                    |
                                                    | HTTP REST / JSON (Authorization: Bearer JWT)
                                                    v
                                      [ PILGRIM API GATEWAY ]
                                            Puerto 8000
                                                    |
               +------------------------------------+------------------------------------+
               |                                    |                                    |
               v                                    v                                    v
    [ BLOQUE 81xx: CORE ]                [ BLOQUE 82xx: OPERACIONES ]         [ BLOQUE 83xx: ANALITICA ]
    - 8101: laika_auth (Java)            - 8201: laika_events (Java)          - 8301: laika_achievements (Java)
    - 8102: laika_admin (Java)           - 8202: laika_tickets (Java)         - 8302: laika_analytics (Java)
    - 8103: laika_stats (Java)           - 8203: laika_merchandise (Java)     - 8303: analytics_bigdata (Python/PySpark)
                                                    |
                                                    v
                                         [ CAPA DE PERSISTENCIA ]
                                         - MySQL 8.0 (Puerto 3306)
                                         - MongoDB (Boveda/Snapshots en analytics_bigdata)
```

### Tabla Maestra de Puertos y Servicios

| Puerto | Componente | Tecnologia | Estado en Docker Compose | Descripcion Tecnica |
| :--- | :--- | :--- | :--- | :--- |
| **8000** | **Pilgrim Gateway** (`pilgrim/`) | Python / FastAPI / Uvicorn | Activo (`laika_gateway`) | API Gateway perimetral, proxy inverso HTTPX, logging dual en `tiradero/logpruebas/` y CORS. |
| **8101** | `laika_auth` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_auth`) | Autenticacion, emision y verificacion de JWT, hashing BCrypt, control de lockout y auditoria `auth_logs`. |
| **8102** | `laika_admin` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_admin`) | Administracion central, respaldos, configuracion, auditorias y correo SMTP. |
| **8103** | `laika_stats` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_stats`) | Metricas operativas, dashboards de gestor/staff y monitoreo de servicios. |
| **8201** | `laika_events` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_events`) | Ciclo de vida de eventos, funciones, recintos, salas y consultas agregadas de ingresos. |
| **8202** | `laika_tickets` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_tickets`) | Bloqueo concurrente (`ConcurrentHashMap` + `ReentrantLock`), compras, QR, canje, transferencias, cortesias y cancelaciones. |
| **8203** | `laika_merchandise` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_merchandise`) | Catalogo de mercancia oficial, variantes, inventario y ordenes. |
| **8301** | `laika_achievements` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_achievements`) | Gamificacion, logros e hitos de usuario. |
| **8302** | `laika_analytics` | Java 17 / Spring Boot 3.2.5 | Activo (`laika_analytics`) | Reportes financieros y analitica transaccional relacional. |
| **8303** | `analytics_bigdata` | Python / FastAPI / PySpark 3.5 | Activo (`laika_analytics_bigdata`) | Modelos ML, clustering, PCA, deteccion de anomalias, recomendaciones, saneamiento KDD, boveda NoSQL y API MATIS (`/api/analytics/matis/*`). |
| **3000** | Web Publica (`src/`) | React 19.2.3 / react-scripts 5.0.1 | Activo (`laika_frontend`) | Tienda publica, cartelera, seleccion de asientos, checkout y perfil. |
| **3010** | `laika-admin` | React 19.0.0 / Vite 6.0.0 | Local (Vite dev/build) | Panel administrativo desacoplado y editor de mapas Konva. |
| **3020** | `laika-gestor` | React 19.2.8 / Vite 8.2.2 | Local (Vite dev/build) | Panel comercial para promotores y gestores de eventos. |
| **3030** | `laika-operador` | React 19.2.8 / Vite 8.2.2 | Local (Vite dev/build) | Terminal de control de acceso y validacion QR en torniquetes. |
| **3040** | `matis-solid` | SolidJS 1.9.14 / Vite 8.2.0 | Activo (`laika_matis`) | Dashboard analitico reactivo y generacion de reportes PDF. |
| **5050** | Test Dashboard (`tests/dashboard/`) | Node.js HTTP nativo + SSE | Local (`node tests/dashboard/server.js`) | Panel web interactivo para ejecutar suites de `tests/` y monitorear puertos en tiempo real. |
| **3306** | MySQL Database | MySQL 8.0 | Activo (`laika_db`) | Persistencia relacional transaccional inicializada con `laika_db.sql`. |

**Nota sobre modulos parciales o alternativos presentes en el repositorio:**
- `microservices2/gateway/`: Contiene una implementacion alternativa de API Gateway en Spring Boot 3.2.5 (puerto 8000), pero el gateway activo en `docker-compose.yml` y `docker-compose.prod.yml` es Pilgrim (`pilgrim/`).
- `microservices/wearables_backend/`: Contiene archivos parciales en TypeScript (repositorio MySQL, Socket.IO, controlador y rutas de vinculacion por PIN para relojes) referenciados en configuracion por el puerto 8204, pero actualmente no incluye `package.json` ni punto de entrada `src/server.ts`, y no esta definido como servicio en `docker-compose.yml` ni `docker-compose.prod.yml`.

---

## 4. Stack Tecnologico por Capas

### Backend y Microservicios
- **Java 17 / Spring Boot 3.2.5**: Spring Data JPA, Hibernate ORM, Spring Security, Jakarta Validation, Maven Wrapper (`mvnw` / `mvnw.cmd`).
- **Python**: FastAPI, Uvicorn, HTTPX, PyMySQL, PyMongo, PySpark 3.5.0, Scikit-learn 1.3.1, Pandas 2.1.0, NumPy 1.25.2.
- **Node.js 18+**: Ejecucion de pruebas unitarias/integracion/rendimiento y servidor HTTP nativo SSE del dashboard QA.

### Frontend Web y Movil
- **Web Publica (`src/`)**: React 19.2.3, Create React App (`react-scripts` 5.0.1), React Router DOM 7.12.0, Axios, Recharts, Plotly.js, `html5-qrcode`, `qrcode.react`, jsPDF, html2canvas, Socket.IO Client, Styled-Components, `@react-oauth/google`.
- **SPAs por Rol**:
  - `laika-admin`: React 19.0.0, Vite 6.0.0, React Router DOM 7.1.0, Konva 10.5.0 / React-Konva 19.2.7, Plotly.js 3.0.0, jsPDF 2.5.2, Lucide React.
  - `laika-gestor`: React 19.2.8, Vite 8.2.2, React Router DOM 7.18.3, Recharts 3.10.1, Plotly.js 4.0.0, Socket.IO Client 4.8.3, Styled-Components 6.5.3, Oxlint 1.79.0.
  - `laika-operador`: React 19.2.8, Vite 8.2.2, `html5-qrcode` 2.3.8, React Router DOM 7.18.3, Recharts 3.10.1, Plotly.js 4.0.0, Socket.IO Client 4.8.3, Oxlint 1.79.0.
- **Dashboard BI (`matis-solid`)**: SolidJS 1.9.14, Vite 8.2.0, `vite-plugin-solid` 2.11.13, jsPDF 4.2.1, `jspdf-autotable` 5.0.8, html2canvas 1.4.1.
- **Movil (`LaikaMobil`)**: Expo 58.0.0, React Native 0.88.0, React 19.3.0, TypeScript 6.0.3, React Navigation 7.x, Reanimated 4.7.1, Expo SecureStore, Expo Local Authentication, Expo Notifications, `react-native-qrcode-svg`.

---

## 5. Estructura del Proyecto y Subproyectos

```text
LaikaClub/
├── pilgrim/                        # API Gateway central en FastAPI (Puerto 8000)
├── microservices2/                 # Microservicios Java Spring Boot 3.2.5
│   ├── auth/                       # Autenticacion y JWT (8101)
│   ├── admin/                      # Administracion y respaldos (8102)
│   ├── stats/                      # Estadisticas operativas (8103)
│   ├── events/                     # Eventos, funciones y recintos (8201)
│   ├── tickets/                    # Boletos, bloqueos concurrentes y torniquetes (8202)
│   ├── merchandise/                # Tienda oficial (8203)
│   ├── achievements/               # Logros y gamificacion (8301)
│   ├── analytics/                  # Analitica relacional (8302)
│   └── gateway/                    # Implementacion alternativa de gateway en Java (8000)
├── microservices/                  # Servicios especializados en Python y codigo parcial TS
│   ├── analytics_bigdata/          # Motor FastAPI + PySpark + ML + MATIS BI (8303)
│   └── wearables_backend/          # Modulo parcial en TypeScript (sin servicio Docker activo)
├── src/                            # Frontend web publico React (Puerto 3000)
├── laika-admin/                    # SPA de Administracion (Puerto 3010)
├── laika-gestor/                   # SPA de Gestor de Eventos (Puerto 3020) + backend/ opcional
├── laika-operador/                 # SPA de Operador de Acceso (Puerto 3030)
├── matis-solid/                    # Dashboard BI en SolidJS + exportador PDF (Puerto 3040)
├── LaikaMobil/                     # Aplicacion movil React Native + Expo
├── tests/                          # Suite Node.js (unitarias, integracion, ML, carga) y dashboard (5050)
├── test/                           # Suite QA multi-rol en Python (UT/IT/SIT/ST/UAT/OAT/RT/SECURITY)
├── test2/                          # Copia/variante de la suite QA multi-rol para entorno local
├── documentacion/                  # Reportes tecnicos y entregas CI/CD
├── .github/workflows/              # Pipelines CI (ci.yml) y CD (cd.yml)
├── docker-compose.yml              # Orquestador Docker para desarrollo
├── docker-compose.prod.yml         # Orquestador Docker para produccion (Azure VM)
├── deploy_remote.sh                # Script de despliegue remoto en produccion
├── iniciar_roles_desacoplados.bat  # Lanzador local para Windows (backend + admin/gestor/operador)
└── iniciar_tunel_pilgrim.bat       # Apertura de tunel para exponer Pilgrim localmente
```

Cada subproyecto principal dispone de su propio README detallado:
- [pilgrim/README.md](pilgrim/README.md)
- [microservices2/README.md](microservices2/README.md)
- [microservices/README.md](microservices/README.md)
- [laika-admin/README.md](laika-admin/README.md)
- [laika-gestor/README.md](laika-gestor/README.md) y [laika-gestor/backend/README.md](laika-gestor/backend/README.md)
- [laika-operador/README.md](laika-operador/README.md)
- [matis-solid/README.md](matis-solid/README.md)
- [LaikaMobil/README.md](LaikaMobil/README.md)
- [tests/README.md](tests/README.md) y [test/README.md](test/README.md)

---

## 6. Modulos de Frontend Desacoplados

1. **`laika-admin` (Puerto 3010)**: Gestion de usuarios y RBAC, auditoria de autenticacion, eventos e historial, B2B y contratos de gestores, reportes de ventas, editor de recintos y mapas Konva, aprobacion de mercancia, publicidad, correos, notificaciones push, news ticker, monitor de base de datos, logs, configuracion Lucky Seat, auditoria de restauraciones y analitica Big Data.
2. **`laika-gestor` (Puerto 3020)**: Gestion y creacion de eventos, detalle e historial, estadisticas y analiticas, auditoria de transacciones, asistentes, publicidad, diseno de salas y constructor de mercancia.
3. **`laika-operador` (Puerto 3030)**: Panel de staff, terminal de escaneo QR con `html5-qrcode`, registro historico de accesos, reporte de incidencias y vista de eventos asignados.
4. **`matis-solid` (Puerto 3040)**: Visualizacion de KPIs ejecutivos, rendimiento por categoria, comparativa de eventos, tendencia temporal, top de ingresos, ventas de tienda y exportacion ejecutiva a PDF.

---

## 7. Ecosistema de Microservicios Backend

### Integridad Transaccional y Concurrencia (`laika_tickets`)
`TicketService.java` mantiene un `ConcurrentHashMap<String, ReentrantLock>` indexado por evento, funcion y asiento (`getLockKey`). Cuando llegan solicitudes concurrentes sobre el mismo asiento, el primer hilo adquiere el bloqueo y procesa la operacion (`200 OK`), mientras que las solicitudes concurrentes reciben `409 Conflict` (`HttpStatus.CONFLICT`), evitando doble cobro y sobreventa.

### Consultas Financieras Agregadas (`laika_events`)
`EventQueryService.java` calcula en tiempo real metricas de ventas e ingresos a partir de los boletos persistidos, evitando desincronizacion por contadores estaticos.

---

## 8. Aplicacion Movil (LaikaMobil)

Desarrollada con Expo 58, React Native 0.88 y TypeScript:
- Autenticacion JWT persistida con `Expo SecureStore`, soporte biometrico (`BiometricService`) y SSL pinning (`SSLPinningService`).
- Navegacion principal en 4 pestanas (`Eventos`, `Carrito`, `MisBoletos`, `Perfil`) y pantallas secundarias de detalle, mapa de recinto, pase QR, logros, configuracion, accesibilidad y ayuda/soporte.
- Por defecto conecta a Pilgrim en produccion (`https://laikaclub-nzhwq8.southcentralus.cloudapp.azure.com/api`). En desarrollo soporta `EXPO_PUBLIC_PILGRIM_API_URL=auto` (autodeteccion de IP LAN de Metro) o una URL explicita.

---

## 9. Persistencia y Bases de Datos

- **MySQL 8.0 (`laika_db`, puerto 3306)**: En Docker Compose se asignan esquemas separados por servicio (`laika_auth`, `laika_admin`, `laika_stats`, `laika_events`, `laika_tickets`, `laika_merchandise`, `laika_achievements`, `laika_analytics`, `laika_gateway`), inicializados con `laika_db.sql`. En ejecucion local fuera de Docker, los archivos `application.yml` de `microservices2` usan por defecto `MYSQL_DATABASE=laika_club3_v2` e incluyen configuracion de fallback a SQLite.
- **MongoDB**: Utilizado por `analytics_bigdata` para almacenamiento de boveda/snapshots (`/api/analytics/vault/*`) mediante `MONGO_URI`.

---

## 10. Pruebas Automatizadas y Dashboard QA

La plataforma cuenta con dos marcos complementarios:

### Suite Node.js (`tests/`) y Dashboard Visual (`http://localhost:5050`)
- **Dashboard Interactivo**: `node tests/dashboard/server.js` (servidor nativo sin dependencias externas, streaming SSE, sondeo TCP de 11 servicios y simulador interactivo de concurrencia).
- **60 Pruebas Unitarias (CI)**:
  - `npm run test:unit` (`node tests/unit/run-unit-tests.js`): 35 casos de validacion, seguridad, Luhn, transferencias, bloqueos y ciclo de vida de boletos.
  - `npm run test:ml` (`node tests/unit/run-ml-unit-tests.js`): 25 casos de regresion lineal, arboles de decision, K-Means, deteccion de bots, churn, saneamiento KDD y reconciliacion MATIS.
  - `npm run test:ci`: ejecuta ambas suites unitarias en secuencia (60 casos totales).
- **Pruebas de Integracion en Vivo (Cero Mocks)**:
  - `node tests/integration/real_system_live_tests.js`: 36 escenarios contra Pilgrim y Docker.
  - `node tests/integration/ml_and_bigdata_live_tests.js`: 15 escenarios contra endpoints ML, Big Data y MATIS.
  - `node tests/integration/pilgrim_and_ports_audit.js`: auditoria de 12 puertos TCP y metodos HTTP.
- **Rendimiento, API y E2E**: `tests/performance/` (simulador de 200 usuarios concurrentes, carga ML y plan JMeter `.jmx`), `tests/api/` (coleccion Postman y `api-runner.js`), `tests/e2e/` (`auth_and_tickets.spec.js`).
- Plan formal de pruebas: [tests/docs/PLAN_DE_PRUEBAS_LAIKA_CLUB.md](tests/docs/PLAN_DE_PRUEBAS_LAIKA_CLUB.md).

### Suite Multi-Rol en Python (`test/`)
Framework independiente por niveles (UT, IT, SIT, ST, UAT, OAT, RT, SECURITY, API, DB) segregado por rol (`usuario`, `admin`, `gestor`, `operador`, `avanzados`) con generacion de evidencias y reportes en `test/resultados/`. Ver [test/README.md](test/README.md).

---

## 11. Instalacion y Despliegue

### Opcion A: Docker Compose (Desarrollo)
Levanta MySQL, Pilgrim Gateway, los 8 microservicios Java, `analytics_bigdata`, la web publica (`3000`) y `matis-solid` (`3040`):
```bash
docker compose up -d
```
Para produccion (sin contenedores de frontend de desarrollo):
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Opcion B: Script de Inicio Rapido en Windows
Inicia los microservicios Java, Pilgrim API Gateway y las tres SPAs de roles (`laika-admin`, `laika-gestor`, `laika-operador`), guardando logs en `tiradero/logpruebas/`:
```bat
iniciar_roles_desacoplados.bat
```

### Opcion C: Ejecucion Manual por Componente
```bash
# API Gateway Pilgrim (puerto 8000)
.venv\Scripts\python.exe pilgrim\run_pilgrim.py

# Web publica (puerto 3000)
npm start

# SPAs desacopladas
cd laika-admin && npm run dev      # http://localhost:3010
cd laika-gestor && npm run dev     # http://localhost:3020
cd laika-operador && npm run dev   # http://localhost:3030
cd matis-solid && npm run dev      # http://localhost:3040

# Dashboard de pruebas (puerto 5050)
node tests/dashboard/server.js
```

---

## 12. Variables de Entorno

### Web Publica (`.env.example` en raiz)
```ini
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_NAME=LAIKA Club
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### Pilgrim Gateway y Backend (`.env` / `.env.docker`)
```ini
PILGRIM_HOST=0.0.0.0
PILGRIM_PORT=8000
PILGRIM_PROXY_TIMEOUT=35.0
PILGRIM_CACHE_TTL=60

MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=laika_club

AUTH_SERVICE_URL=http://127.0.0.1:8101
ADMIN_SERVICE_URL=http://127.0.0.1:8102
STATS_SERVICE_URL=http://127.0.0.1:8103
EVENTS_SERVICE_URL=http://127.0.0.1:8201
TICKETS_SERVICE_URL=http://127.0.0.1:8202
MERCHANDISE_SERVICE_URL=http://127.0.0.1:8203
WEARABLES_SERVICE_URL=http://127.0.0.1:8204
ACHIEVEMENTS_SERVICE_URL=http://127.0.0.1:8301
ANALYTICS_SERVICE_URL=http://127.0.0.1:8302
ANALYTICS_BIGDATA_SERVICE_URL=http://127.0.0.1:8303
```

---

## 13. Credenciales de Desarrollo

Cuentas sembradas en la base de datos de pruebas (`laika_db.sql`):

| Rol | Correo Electronico | Contrasena | Aplicacion Sugerida |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@laikaclub.com` | `gearsof2` | `http://localhost:3010` (`laika-admin`) |
| **Gestor** | `gestor@laikaclub.com` | `gearsof2` | `http://localhost:3020` (`laika-gestor`) |
| **Operador** | `operador@laikaclub.com` | `gearsof2` | `http://localhost:3030` (`laika-operador`) |
| **Usuario General** | `usuario@laikaclub.com` | `gearsof2` | `http://localhost:3000` o `LaikaMobil` |

---

## 14. Integracion Continua, Entrega Continua y Documentacion

- **Guion de Sprint Review**: [00_GUION_DEMOSTRACION_SPRINT_REVIEW.md](documentacion/entregas/00_GUION_DEMOSTRACION_SPRINT_REVIEW.md)
- **Pipeline CI (`.github/workflows/ci.yml`)**: Ejecuta las 60 pruebas unitarias en Node.js 18, compila `auth` y prueba `CancellationServiceImplTest` en `tickets` con JDK 17/Maven, y valida la configuracion de Docker Compose.
- **Pipeline CD (`.github/workflows/cd.yml`)**: Ejecuta auditoria previa (60 pruebas unitarias y validacion de `docker-compose.prod.yml`) y despliega mediante SSH y `deploy_remote.sh` en la VM de produccion en Azure.
- **Documentos de Entregas**:
  - [01_PLAN_TRABAJO_INTEGRACION_CONTINUA.md](documentacion/entregas/01_PLAN_TRABAJO_INTEGRACION_CONTINUA.md)
  - [02_REPORTE_EJECUCION_CI.md](documentacion/entregas/02_REPORTE_EJECUCION_CI.md)
  - [03_PLAN_TRABAJO_ENTREGA_CONTINUA.md](documentacion/entregas/03_PLAN_TRABAJO_ENTREGA_CONTINUA.md)
  - [04_REPORTE_METRICAS_Y_RENDIMIENTO.md](documentacion/entregas/04_REPORTE_METRICAS_Y_RENDIMIENTO.md)
  - [05_PROPUESTA_DE_MEJORA_ARQUITECTURA.md](documentacion/entregas/05_PROPUESTA_DE_MEJORA_ARQUITECTURA.md)

---

## 15. Licencia y Derechos

Proyecto privado y confidencial - LAIKA Club 2026. Todos los derechos reservados.
