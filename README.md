# LAIKA Club - Plataforma Integral de Gestion de Eventos y Boletos

Plataforma distribuida para la comercializacion, emision y control de acceso de boletos para espectaculos en vivo, integrando microservicios transaccionales en Java Spring Boot, procesamiento analitico de datos con Apache Spark, un API Gateway perimetral asincrono (Pilgrim), modulos web desacoplados por roles administrativos, un dashboard reactivo en SolidJS, aplicacion movil nativa en Expo y suite de verificacion automatizada.

---

## 1. Tabla de Contenidos

1. [Vision General del Sistema](#2-vision-general-del-sistema)
2. [Arquitectura Global y Mapeo de Puertos](#3-arquitectura-global-y-mapeo-de-puertos)
3. [Stack Tecnologico por Capas](#4-stack-tecnologico-por-capas)
4. [Estructura del Proyecto y Repositorios](#5-estructura-del-proyecto-y-repositorios)
5. [Modulos de Frontend Desacoplados](#6-modulos-de-frontend-desacoplados)
6. [Ecosistema de Microservicios Backend](#7-ecosistema-de-microservicios-backend)
7. [Aplicacion Movil (LaikaMobil)](#8-aplicacion-movil-laikamobil)
8. [Persistencia y Bases de Datos](#9-persistencia-y-bases-de-datos)
9. [Suite Integral de Pruebas y Monitoreo](#10-suite-integral-de-pruebas-y-monitoreo)
10. [Instalacion y Despliegue](#11-instalacion-y-despliegue)
11. [Variables de Entorno](#12-variables-de-entorno)
12. [Credenciales de Desarrollo](#13-credenciales-de-desarrollo)

---

## 2. Vision General del Sistema

LAIKA Club opera bajo un esquema de arquitectura orientada a servicios (SOA) y desacoplamiento estricto de roles. La logica de negocio y persistencia transaccional residen en microservicios independientes, aislados detras de una compuerta central (Pilgrim API Gateway), la cual distribuye el trafico proveniente de:

- **Clientes Publicos**: Tienda web, seleccion de asientos interactiva, modo Lucky Seat, boveda de boletos digitales y checkout publico sin cuenta requerida.
- **Aplicaciones Web de Operacion Desacopladas**:
  - `laika-admin`: Centro de control administrativo, auditoria RBAC, diseno de recintos y SqlVault.
  - `laika-gestor`: Panel comercial para promotores, metricas financieras en tiempo real y mercancia.
  - `laika-operador`: Terminal de campo en torniquetes con escaneo optico de QR y control de acceso.
  - `matis-solid`: Motor de inteligencia de negocios (BI) y generacion de reportes ejecutivos en PDF sobre SolidJS.
- **Dispositivos Moviles (`LaikaMobil`)**: Aplicacion nativa para Android e iOS con biometria (FaceID/huella) y lectura de pases QR.

---

## 3. Arquitectura Global y Mapeo de Puertos

```
                                  [ INTERFAZ DE USUARIOS Y ROLES ]
      +--------------------+---------------------+--------------------+--------------------+
      |                    |                     |                    |                    |
[ laika-admin ]     [ laika-gestor ]      [ laika-operador ]     [ matis-solid ]     [ Web Publica ]
 Puerto 3010         Puerto 3020           Puerto 3030           Puerto 3040          Puerto 3000
      |                    |                     |                    |                    |
      +--------------------+----------+----------+--------------------+--------------------+
                                      |
                                      | HTTP REST / JSON (Cabeceras JWT)
                                      v
                        [ PILGRIM API GATEWAY ]
                             Puerto 8000
                                      |
       +------------------------------+------------------------------+
       |                                                             |
       v                                                             v
[ BLOQUE 81xx: GOBERNANZA ]                               [ BLOQUE 82xx: OPERACIONES ]
- 8101: laika_auth (Java)                                 - 8201: laika_events (Java)
- 8102: laika_admin (Java)                                - 8202: laika_tickets (Java)
- 8103: laika_stats (Java)                                - 8203: laika_merchandise (Java)
                                                          - 8204: wearables_backend (Node)
       |                                                             |
       +------------------------------+------------------------------+
                                      |
                                      v
                         [ BLOQUE 83xx: ANALITICA ]
                         - 8301: laika_achievements (Java)
                         - 8302: laika_analytics (Java)
                         - 8303: analytics_bigdata (PySpark/FastAPI)
                                      |
                                      v
                        [ CAPA DE PERSISTENCIA ]
                        - MySQL 8.0 (Puerto 3306)
                        - MongoDB Atlas (Analitica NoSQL)
```

### Tabla Maestra de Puertos y Servicios

| Puerto | Componente | Dominio / Tecnologia | Descripcion Tecnica |
| :--- | :--- | :--- | :--- |
| **8000** | **Pilgrim Gateway** | Python / FastAPI / Uvicorn | Puerta de enlace perimetral, proxy inverso HTTPX, logging dual y control CORS. |
| **8101** | `laika_auth` | Java 17 / Spring Boot | Autenticacion, emision y verificacion de JWT, hashing BCrypt y auditoria en `auth_logs`. |
| **8102** | `laika_admin` | Java 17 / Spring Boot | Gobernanza, SqlVault, aprobaciones, configuraciones y notificaciones SMTP. |
| **8103** | `laika_stats` | Java 17 / Spring Boot | Monitoreo operativo, metricas de latencia y registro de salud del sistema. |
| **8201** | `laika_events` | Java 17 / Spring Boot | CRUD de eventos, funciones, recintos y agregacion de ingresos en tiempo real. |
| **8202** | `laika_tickets` | Java 17 / Spring Boot | Bloqueo concurrente (`ReentrantLock`), emision de QR, compras, validacion y cortesias. |
| **8203** | `laika_merchandise`| Java 17 / Spring Boot | Catalogo de articulos oficiales, variantes de inventario y pedidos fisicos. |
| **8204** | `wearables` | Node.js / Express | Integracion con pulseras inteligentes (NFC/RFID) para eventos masivos. |
| **8301** | `laika_achievements`| Java 17 / Spring Boot | Motor de gamificacion, insignias, niveles y recompensas para usuarios. |
| **8302** | `laika_analytics` | Java 17 / Spring Boot | Reportes financieros y procesamiento analitico de ventas relacionales. |
| **8303** | `analytics_bigdata`| Python / PySpark / FastAPI | Modelos ML (Ridge, Lasso), recomendaciones con Cold Start y deteccion de anomalias. |
| **3000** | Web Publica | React 19 / Vite / CRA | Catalogo de espectaculos, seleccion de asientos y checkout publico. |
| **3010** | `laika-admin` | React 19 / Vite | Panel de control administrativo y disenador visual de mapas Konva. |
| **3020** | `laika-gestor` | React 19 / Vite | Panel para promotores, auditoria de ventas y administracion de mercancia. |
| **3030** | `laika-operador` | React 19 / Vite | Terminal de torniquete con escaneo optico continuo de boletos QR (`html5-qrcode`). |
| **3040** | `matis-solid` | SolidJS / Vite | Dashboard analitico de alta reactividad y generador de reportes PDF vectoriales. |
| **5050** | Test Dashboard | Node.js / Server-Sent Events | Panel visual web interactivo para ejecucion y monitoreo de pruebas de software. |
| **3306** | MySQL Database | MySQL 8.0 Server | Motor de persistencia relacional transaccional (bases de datos independientes por servicio). |

---

## 4. Stack Tecnologico por Capas

### Backend y Microservicios
- **Java Spring Boot 3.x**: Spring Data JPA, Spring Security, Hibernate ORM, Maven Wrapper.
- **Python 3.11 / 3.13**: FastAPI, Uvicorn, HTTPX, PySpark 3.5, Scikit-learn, PyMySQL.
- **Node.js 18+**: Express para el microservicio de wearables y servidor de streaming SSE del dashboard de pruebas.

### Frontend Web y Movil
- **React 19.x**: Empleado en `laika-admin`, `laika-gestor`, `laika-operador` y la web publica.
- **SolidJS 1.9.x**: Empleado en `matis-solid` para visualizacion de datos sin Virtual DOM.
- **React Native 0.88 + Expo 58**: Empleado en `LaikaMobil` con TypeScript y animaciones Reanimated.
- **Librerias Graficas**: Konva / React-Konva (canvas de recintos), Plotly.js, Recharts, `html5-qrcode`.
- **Exportacion de Documentos**: jsPDF, jspdf-autotable y html2canvas.

---

## 5. Estructura del Proyecto y Repositorios

```
LaikaClub/
├── pilgrim/                   # API Gateway central perimetral (Puerto 8000)
├── microservices2/            # Microservicios Java Spring Boot (Puertos 8101-8302)
│   ├── auth/                  # Servicio de autenticacion y JWT (8101)
│   ├── admin/                 # Servicio administrativo y respaldos (8102)
│   ├── stats/                 # Servicio de estadisticas de conexion (8103)
│   ├── events/                # Servicio de gestion de espectaculos (8201)
│   ├── tickets/               # Motor transaccional y torniquetes (8202)
│   ├── merchandise/           # Servicio de tienda oficial (8203)
│   ├── achievements/          # Servicio de gamificacion (8301)
│   └── analytics/             # Servicio de agregaciones financieras (8302)
├── microservices/             # Microservicios en Python y Node
│   ├── analytics_bigdata/     # Motor PySpark ML y recomendaciones (8303)
│   └── wearables_backend/     # Backend IoT de pulseras inteligentes (8204)
├── laika-admin/               # Modulo SPA del Administrador (Puerto 3010)
├── laika-gestor/              # Modulo SPA del Gestor de Eventos (Puerto 3020)
├── laika-operador/            # Modulo SPA del Operador de Acceso (Puerto 3030)
├── matis-solid/               # Dashboard BI y exportador PDF SolidJS (Puerto 3040)
├── LaikaMobil/                # Aplicacion movil React Native / Expo
├── src/                       # Frontend web publico (Puerto 3000)
├── tests/                     # Suite de pruebas automatizadas y dashboard visual (5050)
├── tiradero/logpruebas/       # Directorio de logs de peticiones y diagnostico
├── docker-compose.yml         # Orquestador Docker de todos los servicios
├── iniciar_roles_desacoplados.bat # Lanzador de entorno completo y navegador
└── iniciar_tunel_pilgrim.bat  # Apertura de tunel localtunnel para LaikaMobil
```

---

## 6. Modulos de Frontend Desacoplados

Cada aplicacion frontend cuenta con aislamiento completo en dependencias y puertos de desarrollo:

1. **`laika-admin` (Puerto 3010)**:
   - Administracion de usuarios y asignacion de roles.
   - Aprobacion o rechazo de articulos de mercancia creados por gestores.
   - Lienzo grafico Konva para trazar la geometria de recintos y numeracion de butacas.
   - Monitoreo en vivo de sentencias SQL y descarga de respaldos en SqlVault.

2. **`laika-gestor` (Puerto 3020)**:
   - Creacion, actualizacion y cancelacion de funciones de eventos.
   - Consulta de recaudacion e inventario de boletos cruzada con `laika_tickets.tickets`.
   - Consulta detallada de transacciones comerciales y listado de asistentes.

3. **`laika-operador` (Puerto 3030)**:
   - Lector de camara integrado con `html5-qrcode` para lectura continua en torniquetes.
   - Validacion contra la maquina de estados de `laika_tickets` (`VALID_ACCESS`, `ALREADY_REDEEMED`, `INVALID_CODE`).
   - Bitacora de incidencias operativas y contador de aforo por puerta.

4. **`matis-solid` (Puerto 3040)**:
   - Visualizacion de series de tiempo, comparacion de eventos y clasificacion por categorias.
   - Generacion de informes PDF ejecutivos vectoriales mediante `jspdf-autotable`.

---

## 7. Ecosistema de Microservicios Backend

### Integridad Transaccional y Concurrencia (`laika_tickets`)
El microservicio implementa bloqueos en memoria mediante `ReentrantLock`. Ante solicitudes concurrentes sobre el mismo asiento fisico, el primer hilo procesa la transaccion con `200 OK` mientras que las peticiones concurrentes son denegadas inmediatamente con codigo `409 Conflict`, erradicando el doble cobro o la sobreventa.

### Agregacion Financiera Precisa (`laika_events`)
El backend no mantiene campos estaticos de boletos vendidos; ejecuta una subconsulta agregada directa sobre la base de datos de boletos:
`COUNT(CASE WHEN status IN ('active', 'used') THEN 1 END)` y `SUM(price)`, asegurando coherencia contable inmediata.

---

## 8. Aplicacion Movil (LaikaMobil)

Desarrollada sobre **Expo SDK 58** y **React Native 0.88**:
- **Desbloqueo Biometrico**: Integracion con FaceID y lector de huellas para acceder a la boveda.
- **Boveda de Boletos Offline/Online**: Renderizado de codigos QR legibles mediante lectores opticos de torniquete.
- **Tunelizacion Remota**: Ejecutando `iniciar_tunel_pilgrim.bat` o `npm run tunnel` en `LaikaMobil`, la app interactua con el backend local desde dispositivos en redes celulares 4G/5G.

---

## 9. Persistencia y Bases de Datos

El sistema opera sobre un servidor **MySQL 8.0** en el puerto 3306 con bases de datos segregadas:

- `laika_auth`: Usuarios, contrasenas hash, roles y tabla de auditoria `auth_logs`.
- `laika_admin`: Parametros globales de sistema y anuncios publicitarios.
- `laika_stats`: Registros de latencia y estado de servicios.
- `laika_events`: Informacion de espectaculos, recintos, salas, funciones y zonas.
- `laika_tickets`: Boletos digitales, codigos criptograficos, pagos y cortesias.
- `laika_merchandise`: Articulos de catalogo, tallas, inventario y ordenes fisicas.
- `laika_achievements`: Definicion de hitos y registros de logros por usuario.
- `laika_analytics`: Agregaciones analiticas relacionales.
- **MongoDB Atlas**: Almacenamiento no estructurado para analisis OLAP y series de eventos.

---

## 10. Suite Integral de Pruebas y Monitoreo

La plataforma incluye una infraestructura formal de control de calidad documentada en [PLAN_DE_PRUEBAS_LAIKA_CLUB.md](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/docs/PLAN_DE_PRUEBAS_LAIKA_CLUB.md):

- **Panel Visual Interactivo (`http://localhost:5050`)**: Servidor nativo con Server-Sent Events para disparar pruebas y visualizar la consola en tiempo real.
- **36 Pruebas de Integracion en Vivo (Cero Mocks)**: Ejecutadas contra Docker y Pilgrim Gateway (`node tests/integration/real_system_live_tests.js`).
- **22 Comprobaciones de Red**: Verificacion de 12 puertos TCP y metodos HTTP (`node tests/integration/pilgrim_and_ports_audit.js`).
- **35 Pruebas Unitarias Algoritmicas**: Validacion de Luhn, RegEx RFC, sanitizacion y politicas de cancelacion (`node tests/unit/run-unit-tests.js`).
- **Simulador de Concurrencia**: Pruebas de estres simulando rafagas de 50 y 200 compradores concurrentes.

---

## 11. Instalacion y Despliegue

### Opcion A: Despliegue Automatizado con Docker Compose (Recomendado)
Levanta todos los microservicios Java, Python, Node, MySQL y el API Gateway en una red interna unificada:
```bash
docker-compose up -d
```

### Opcion B: Inicio Rapido del Entorno Desacoplado Local (Windows)
Ejecuta el script por lotes que inicializa los microservicios, el API Gateway, las tres aplicaciones web y abre las pestanas en el navegador:
```bash
iniciar_roles_desacoplados.bat
```

### Opcion C: Levantamiento Manual por Componente
1. **API Gateway**:
   ```bash
   .venv\Scripts\python.exe pilgrim\run_pilgrim.py
   ```
2. **Modulo Administrador**:
   ```bash
   cd laika-admin && npm run dev
   ```
3. **Modulo Gestor**:
   ```bash
   cd laika-gestor && npm run dev
   ```
4. **Modulo Operador**:
   ```bash
   cd laika-operador && npm run dev
   ```
5. **Dashboard Matis Solid**:
   ```bash
   cd matis-solid && npm run dev
   ```
6. **Dashboard de Pruebas**:
   ```bash
   node tests/dashboard/server.js
   ```

---

## 12. Variables de Entorno

Archivo base `.env` en la raiz del proyecto:
```ini
# Seguridad y Tokens
JWT_SECRET=super_secret_laika_club_2026

# Conexion a Base de Datos Central
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=laika_club

# API Gateway Pilgrim
PILGRIM_HOST=0.0.0.0
PILGRIM_PORT=8000
PILGRIM_PROXY_TIMEOUT=35.0

# Microservicios Java y Python
AUTH_SERVICE_URL=http://127.0.0.1:8101
ADMIN_SERVICE_URL=http://127.0.0.1:8102
STATS_SERVICE_URL=http://127.0.0.1:8103
EVENTS_SERVICE_URL=http://127.0.0.1:8201
TICKETS_SERVICE_URL=http://127.0.0.1:8202
MERCHANDISE_SERVICE_URL=http://127.0.0.1:8203
WEARABLES_SERVICE_URL=http://127.0.0.1:8204
ACHIEVEMENTS_SERVICE_URL=http://127.0.0.1:8301
ANALYTICS_SERVICE_URL=http://127.0.0.1:8302
ANALYTICS_BIGDATA_URL=http://127.0.0.1:8303
```

---

## 13. Credenciales de Desarrollo

Credenciales sembradas en la base de datos de pruebas:

| Rol | Correo Electronico | Contrasena | Aplicacion Sugerida |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@laikaclub.com` | `gearsof2` | `http://localhost:3010` (laika-admin) |
| **Gestor** | `gestor@laikaclub.com` | `gearsof2` | `http://localhost:3020` (laika-gestor) |
| **Operador** | `operador@laikaclub.com` | `gearsof2` | `http://localhost:3030` (laika-operador) |
| **Usuario General**| `usuario@laikaclub.com` | `gearsof2` | `http://localhost:3000` o LaikaMobil |

---

## 14. Licencia y Derechos

Proyecto privado y confidencial - LAIKA Club © 2026. Todos los derechos reservados. Prohibida su copia o redistribucion no autorizada.
