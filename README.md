# LAIKA Club - Sistema de Gestion de Eventos

> Plataforma completa de venta y gestion de boletos para eventos en vivo. Arquitectura de microservicios con frontend React + API Gateway FastAPI.

**Version: 3.0.0** - Actualizado: Mayo 2026

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Mapa de Microservicios y Rutas](#mapa-de-microservicios-y-rutas)
5. [Estructura de Directorios](#estructura-de-directorios)
6. [Instalacion y Configuracion](#instalacion-y-configuracion)
7. [Variables de Entorno](#variables-de-entorno)
8. [Base de Datos](#base-de-datos)
9. [Sistema de Roles y Seguridad](#sistema-de-roles-y-seguridad)
10. [Flujo de Compra](#flujo-de-compra)
11. [Modulo de Merchandising](#modulo-de-merchandising)
12. [Modulo de Big Data y Analisis Predictivo](#modulo-de-big-data-y-analisis-predictivo)
13. [Scripts de Utilidad y Herramientas Extra](#scripts-de-utilidad-y-herramientas-extra)
14. [Credenciales por Defecto](#credenciales-por-defecto)

---

## Vision General

LAIKA Club es una aplicacion full-stack para gestion y compra de entradas a eventos. Disenada con microservicios desacoplados donde cada dominio (autenticacion, eventos, tickets, estadisticas, administracion, logros, analitica Big Data, merchandising) es un servicio FastAPI independiente, gestionado a traves de un API Gateway central.

El frontend es una SPA en React 19 con diseno industrial premium (blanco/negro, tipografia uppercase, glassmorphism).

### Caracteristicas Principales

- **Compra de boletos** con o sin cuenta (modo invitado)
- **Carrito de compras** estilo AliExpress Industrial - layout de 2 columnas con panel lateral de confianza, logistica y seguridad
- **Checkout independiente** - no requiere navegacion al dashboard
- **Animacion tipo Impresora de Boletos** con efecto laser cinematico al comprar (25 seg sincronizados)
- **Lucky Seat Roulette** - modo de asiento sorpresa con animacion de ruleta cinematica
- **Seccion de Merchandising en Evento** - compra de merch directamente desde el detalle del evento, con modal de producto
- **Sistema de roles** de 4 niveles (admin, gestor, operador, usuario)
- **Panel de administracion** con monitoreo en tiempo real
- **Aprobacion de Merchandising** - flujo admin para aprobar/rechazar productos de gestores
- **Big Data Analytics** con visualizaciones 3D interactivas (Clustered Bar, Voxel Pie)
- **Busqueda tipo Spotlight** para filtrar por artista o evento
- **Sistema de Logros y Recompensas** (gamificacion) para usuarios
- **Modo Mantenimiento** controlado desde el panel admin
- **Monitoreo de BD en Tiempo Real** - consola visible con auto-reparacion integrada
- **Pantalla de carga industrial** con bloqueo minimo de 8 segundos y etiqueta dinamica de vista

---

## Stack Tecnologico

### Backend

| Componente            | Tecnologia                  | Version    |
| --------------------- | --------------------------- | ---------- |
| Framework API         | FastAPI                     | Latest     |
| Servidor ASGI         | Uvicorn                     | Latest     |
| ORM / Query           | SQLAlchemy                  | Latest     |
| Auth Tokens           | PyJWT                       | Latest     |
| Hashing               | Passlib (Bcrypt)            | Latest     |
| HTTP Client (Gateway) | HTTPX                       | Latest     |
| Base de Datos SQL     | MySQL 8.0+ (prod) / SQLite  | Latest     |
| Base de Datos NoSQL   | MongoDB Atlas               | Latest     |

### Frontend

| Componente               | Tecnologia                       | Version |
| ------------------------ | -------------------------------- | ------- |
| Framework UI             | React                            | 19.x    |
| Build Tool               | Create React App (react-scripts) | 5.0.1   |
| Enrutamiento             | React Router DOM                 | 7.x     |
| HTTP Client              | Axios                            | 1.x     |
| Iconos                   | Lucide React                     | 0.564.x |
| Generacion QR            | qrcode.react                     | 4.x     |
| Escaneo QR               | html5-qrcode                     | 2.x     |
| PDF Export               | jsPDF + html2canvas              | Latest  |
| OAuth Google             | @react-oauth/google              | 0.13.x  |

---

## Arquitectura del Sistema

```
┌──────────────────────────────────────────────┐
│           CLIENTE WEB                         │
│      React SPA (Puerto 3000)                  │
└──────────────┬───────────────────────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────────────────────┐
│           API GATEWAY                         │
│       FastAPI (Puerto 8000)                   │
│    microservices/gateway.py                   │
└──┬──────┬──────┬──────┬──────┬───────────────┘
   │      │      │      │      │      │      │
  :8001  :8002  :8003  :8004  :8005  :8006  :8007  :8008
  AUTH  EVENTS TICKETS STATS  ADMIN  LOGROS BIGDATA MERCH
```

### Servicios Activos

| Puerto | Servicio               | Archivo                                   |
| ------ | ---------------------- | ----------------------------------------- |
| 8000   | API Gateway            | `microservices/gateway.py`                |
| 8001   | Auth Service           | `microservices/auth/main.py`              |
| 8002   | Event Service          | `microservices/events/main.py`            |
| 8003   | Ticket Service         | `microservices/tickets/main.py`           |
| 8004   | Stats Service          | `microservices/stats/main.py`             |
| 8005   | Admin Service          | `microservices/admin/main.py`             |
| 8006   | Achievements Service   | `microservices/achievements/main.py`      |
| 8007   | Analytics BigData      | `microservices/analytics_bigdata/main.py` |
| 8008   | Merchandise Service    | `microservices/merchandise/main.py`       |

---

## Mapa de Microservicios y Rutas

| Ruta del Cliente       | Puerto Destino | Servicio       |
| ---------------------- | -------------- | -------------- |
| `/api/auth/*`          | **:8001**      | Auth Service   |
| `/api/events/*`        | **:8002**      | Event Service  |
| `/api/manager/*`       | **:8002**      | Event Service  |
| `/api/tickets/*`       | **:8003**      | Ticket Service |
| `/api/stats/*`         | **:8004**      | Stats Service  |
| `/api/monitoring/*`    | **:8004**      | Stats Service  |
| `/api/database/*`      | **:8005**      | Admin Service  |
| `/api/ads/*`           | **:8005**      | Admin Service  |
| `/api/config/*`        | **:8005**      | Admin Service  |
| `/api/admin/users/*`   | **:8001**      | Auth Service   |
| `/api/admin/*`         | **:8005**      | Admin Service  |
| `/api/achievements/*`  | **:8006**      | Achievements   |
| `/api/analytics/*`     | **:8007**      | BigData        |
| `/api/merchandise/*`   | **:8008**      | Merchandise    |

---

## Estructura de Directorios

```
LaikaClub/
│
├── src/                           # Frontend React
│   ├── pages/
│   │   ├── Home/                  # Pagina principal publica
│   │   ├── Login/ + Register/     # Autenticacion
│   │   ├── Shop/                  # Tienda publica de merchandising
│   │   ├── EventDetail/           # Detalle de evento + Compra directa
│   │   │   └── components/
│   │   │       ├── TicketSelection/   # Selector de zonas y asientos
│   │   │       ├── VenueMap/          # Mapa SVG interactivo del venue
│   │   │       ├── VenueZones/        # Selector de zonas visuales
│   │   │       ├── LuckySeatModal/    # Ruleta de asiento sorpresa
│   │   │       ├── MerchSection/      # Seccion de merch en evento + Modal producto
│   │   │       ├── PurchaseModal/     # Modal de pago con flujo cinematico
│   │   │       └── EventHero/         # Hero visual del evento
│   │   ├── Checkout/              # Pago publico (sin login requerido)
│   │   ├── Maintenance/           # Pantalla de mantenimiento
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── UserWallet.jsx     # Boveda de boletos
│   │   │   ├── UserHistory.jsx
│   │   │   ├── UserCart.jsx       # Carrito estilo AliExpress Industrial (2 columnas)
│   │   │   ├── UserCart/
│   │   │   │   └── TicketPrinterOverlay.jsx  # Animacion impresora con laser cinematico
│   │   │   ├── Achievements.jsx
│   │   │   └── RefundTracker.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard/         # Panel central + Big Data Visualizer
│   │   │   ├── Users/             # Gestion de usuarios
│   │   │   ├── Events/            # CRUD de eventos
│   │   │   ├── Sales/             # Ventas y reportes
│   │   │   ├── Database/          # Monitor de BD + SqlVault
│   │   │   ├── Ads/               # Anuncios y publicidad
│   │   │   ├── Monitoring/        # Monitoreo en tiempo real
│   │   │   ├── MerchandiseApproval/ # Aprobacion de merch de gestores
│   │   │   └── Merch/             # Gestion de merchandising admin
│   │   ├── manager/               # Panel del gestor de eventos
│   │   │   ├── MerchandiseManager # Gestion de merch por evento
│   │   │   ├── ManagerAnalytics
│   │   │   ├── ManagerTransactions
│   │   │   └── ManagerAttendees
│   │   └── staff/                 # Terminal de operador/staff
│   ├── components/
│   │   ├── Cart/                  # CartModal, CartContent, PaymentVoucher
│   │   │   └── CartContent.jsx    # Vista 2 columnas estilo AliExpress Industrial
│   │   ├── Navbar/                # Barra de navegacion global
│   │   ├── tickets/
│   │   │   └── TicketTemplate.jsx # Plantilla visual de boleto (con QR)
│   │   ├── LaikaAgent/            # Asistente IA integrado
│   │   ├── LoadingScreen/         # Pantalla de carga industrial (8 seg minimo)
│   │   ├── DatabaseMonitor.jsx    # Consola de BD en tiempo real
│   │   └── Notifications/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── SkeletonContext.jsx
│   │   └── SystemContext.jsx
│   └── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── DashboardLayout.jsx    # Sidebar con drag-and-drop de menu
│   │   └── UserLayout.jsx
│   └── ARCHITECTURE.md            # Manual de arquitectura y buenas practicas
│
├── microservices/                 # Backend (8 servicios FastAPI)
├── backups/                       # Respaldos de BD (.sql / .json)
├── tiradero/                      # Carpeta de soporte y scripts obsoletos
│
├── run_all.bat                    # Arranca todo el sistema (Frontend + Backend)
├── run_microservices.py           # Lanza todos los microservicios + monitoreo en tiempo real
├── run.py                         # Consola Maestra Interactiva de procesos
├── install_all.bat                # Instalador automatico de dependencias
├── subir.py                       # Asistente de Git interactivo para cambios
├── setup.py                       # Script completo de instalacion y sembrado inicial
├── plan_invierno_mysql.py         # Recuperacion ante desastres MySQL
└── plan_lia_mongo.py              # Recuperacion quirurgica MongoDB Atlas
```

---

## Instalacion y Configuracion

### Prerrequisitos

- **Python 3.10+**
- **Node.js 18+** con npm
- **MySQL 8.0+** con Xampp (o servidor MySQL activo en el puerto 3306)
- **MongoDB Atlas** (Configurar URI en el archivo `.env`)

### Proceso de Inicializacion en Equipos Nuevos

Para configurar la aplicacion en un sistema limpio por primera vez, el proyecto incluye un script de instalacion inteligente en Python:

```bash
# 1. Ejecutar el asistente de instalacion y configuracion inicial
python setup.py
```

Este script automatizara los siguientes pasos:
1. Verificara que tengas instalados en tu sistema Node.js, npm y Python.
2. Creara un archivo de variables de entorno `.env` local con valores preconfigurados en caso de no existir.
3. Instalara las dependencias de Python listadas en `requirements.txt`.
4. Instalara los paquetes frontend ejecutando `npm install`.
5. Buscara la instalacion local de MySQL (soporta rutas por defecto de XAMPP y WAMP) e importara la estructura inicial de base de datos desde `laika_club_database.sql`.
6. Creara los directorios necesarios para logs, cargas de imagenes y respaldos en la raiz.

### Actualizaciones Rapidas

Si estas trabajando en un entorno ya configurado y solo necesitas actualizar las librerias locales tras un pull:

```bash
# Ejecutar para sincronizar dependencias conda, pip y npm
install_all.bat
```

### Arranque del Sistema

Para levantar la aplicacion completa (Backend microservicios + Frontend React):

```bash
# Ejecutar la Consola Maestra Interactiva
python run.py
```

La aplicacion estara disponible en: **http://localhost:3000**

---

## Variables de Entorno

```ini
# Seguridad
JWT_SECRET=super_secret_laika_club_2026

# Base de datos MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=laika_club
MYSQLDUMP_PATH=C:\xampp\mysql\bin\mysqldump.exe
MYSQL_EXE_PATH=C:\xampp\mysql\bin\mysql.exe

# MongoDB Atlas
MONGO_URI="mongodb+srv://usuario:password@cluster.mongodb.net/?appName=App"
MONGO_DB="laika_analytics"

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
```

> **Nunca subas `.env` a Git.** Usa `.env.example` como plantilla.

---

## Base de Datos

### MySQL - Tablas Principales

| Tabla                 | Servicio   | Descripcion                           |
| --------------------- | ---------- | ------------------------------------- |
| `users`               | Auth       | Usuarios, roles y estado de cuenta    |
| `auth_logs`           | Auth       | Auditoria de accesos                  |
| `permission_requests` | Auth       | Solicitudes de permisos               |
| `events`              | Events     | Catalogo de eventos                   |
| `tickets`             | Tickets    | Entradas con codigo QR                |
| `payments`            | Tickets    | Registro de transacciones             |
| `achievements`        | Auth/Admin | Definicion de logros                  |
| `user_achievements`   | Auth/Admin | Logros por usuario                    |
| `merch_products`      | Events     | Productos de merchandising por evento |
| `merch_orders`        | Tickets    | Ordenes de merchandising              |

### MongoDB Atlas - Colecciones Principales

| Coleccion        | Descripcion                              |
| ---------------- | ---------------------------------------- |
| `analytics`      | Datos de visualizacion Big Data          |
| `event_clicks`   | Métricas de interaccion por evento       |
| `artist_sales`   | Ventas agrupadas por artista             |

---

## Sistema de Roles y Seguridad

| Rol          | Acceso                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| **admin**    | Total: usuarios, logs, BD, eventos, backups, email, analytics, merch     |
| **gestor**   | Crear/editar eventos, métricas, auditoria, Analytics BigData, merch propia|
| **operador** | Validar tickets QR, asistentes, incidencias                              |
| **usuario**  | Ver eventos, comprar, carrito, boveda de boletos, logros, perfil         |
| **invitado** | Ver eventos, carrito, comprar sin cuenta (Checkout público)              |

### Autenticacion

- Tokens JWT `HS256`, vida de **7 dias**
- Header: `Authorization: Bearer <token>`
- Contraseñas con **Bcrypt**
- Bloqueo tras **5 intentos fallidos**

---

## Flujo de Compra

El checkout es **completamente publico** - no se requiere cuenta.

```
1. Agrega boleto al carrito (btn "Agregar" en cualquier evento)
   - Alternativa: modo "Lucky Seat" - asiento sorpresa via ruleta
2. Abre CartModal desde el icono en la Navbar
3. Revisa articulos -> "Continuar al Pago"
   - Vista de carrito completa en /cart con recomendaciones de merch
4. /checkout -> rellena datos de contacto + método de pago
5. Confirma la compra
6. Animacion de impresora con efecto laser cinematico (25 seg sinc.)
7. Boleto enviado al correo + guardado en la Boveda de Boletos
```

### Lucky Seat Roulette

Modo especial disponible en el detalle de evento. En lugar de elegir asiento manualmente, el sistema:
1. Muestra una animacion de ruleta cinematica
2. Selecciona aleatoriamente un asiento disponible en la mejor zona
3. Presenta el asiento ganador con efecto de reveal premium
4. Permite confirmar o re-girar la ruleta

---

## Modulo de Merchandising

### Para Usuarios (Desde el Detalle de Evento)

La seccion **"MERCH DEL EVENTO"** aparece en la pagina de detalle de cada evento:
- Grid de productos con imagen, nombre y precio
- Modal de producto con selector de talla/color, cantidad y CTA de compra
- Añade merch al carrito junto con los boletos del evento

### Para Gestores (`/manager/merchandise`)

- Dashboard de gestion de productos por evento
- Crear, editar y eliminar productos de merchandising
- Productos quedan en estado **"Pendiente de aprobacion"** hasta revision admin

### Para Administradores (`/admin/merchandise-approval`)

- Vista de todos los productos pendientes de aprobacion
- Aprobar o rechazar productos con comentario
- Gestion global del catalogo de merch (`/admin/merch`)


---

## Modulo de Big Data y Analisis Predictivo

El sistema cuenta con un motor de analítica distribuida y procesamiento masivo de datos para soportar la toma de decisiones estratégicas.

### Arquitectura Analítica
- **Motor Central**: Apache Spark (inicializado en un hilo secundario en `microservices/analytics_bigdata/engine.py`).
- **Resiliencia Automática**: Si Spark está arrancando, el servicio conmuta automáticamente a **consultas SQL directas a MySQL/SQLite** para evitar caídas o pantallas de carga bloqueadas.
- **Sincronización (ETL)**: Sincronización asíncrona ("fire-and-forget") de compras de boletos hacia **MongoDB Atlas** mediante `mongodb_sync.py` para análisis OLAP sin bloquear el flujo transaccional de producción.

### Preparación y Limpieza de Datos (Saneamiento)
- **Relleno de nulos**: PySpark reemplaza valores nulos en columnas críticas por valores por defecto (`"STAND"`, `"ANÓNIMO"`, `0.0`).
- **Normalización**: Limpieza de cadenas de texto mediante `trim()` y conversión a minúsculas con `lower()`.
- **Casting**: Conversión de campos numéricos a tipo flotante (`double`) para evitar fallos matemáticos durante el MapReduce.

### Modelado Dimensional (Copo de Nieve)
Aunque el sistema lee bases de datos transaccionales, la estructura de entidades se modela lógicamente como un **Esquema de Copo de Nieve (Snowflake Schema)**:
- **Hechos (Fact Table)**: `tickets` (transacciones) y `payments` (pagos).
- **Dimensiones Directas**: `users` (compradores) y `events` (espectáculos).
- **Sub-dimensiones Normalizadas**: `events` $\rightarrow$ `venues` (recinto) $\rightarrow$ `venue_rooms` (sala) $\rightarrow$ `seating_zones` (zona de asientos) $\rightarrow$ `room_seats` (asiento individual).

### Modelos de Machine Learning
1. **Regresiones Predictivas**: Comparación de 6 modelos (Regresión Lineal, Polinomial, Ridge, Lasso) sobre las ventas históricas para estimar los ingresos de conciertos futuros.
2. **Clasificación (Árboles de Decisión)**: Clasifica la velocidad de compra y ocupación para recomendar la activación de **Tarifas Dinámicas**.
3. **Clustering (K-Means)**: Agrupamiento automático de usuarios en segmentos (ej. Súper Fans/Ballenas vs. Compradores casuales).


---

## Scripts de Utilidad y Herramientas Extra

El proyecto cuenta con varias herramientas automatizadas en la raiz para facilitar el desarrollo, despliegue y versionado:

### 1. `setup.py`
* **Que hace**: Script de preparacion del ecosistema LaikaClub. Revisa dependencias, crea las carpetas operativas (`uploads/`, `microservices_logs/`, `backups/`), crea el archivo `.env` base e importa de forma directa la base de datos estructurada a tu servidor MySQL.
* **Como usarlo**: Ejecuta `python setup.py` en tu terminal preferida antes de levantar los servicios por primera vez.

### 2. `install_all.bat`
* **Que hace**: Inicializa y actualiza el entorno completo del proyecto en Windows.
  * Llama a `conda env update` usando `environment.yml` para actualizar el entorno de Conda `laika`.
  * Ejecuta `npm install` para instalar las librerias y dependencias del frontend en Node.
  * Realiza `pip install` sobre `requirements.txt` para asegurar que el entorno de Conda cuente con todas las librerias de FastAPI, SQLAlchemy y PySpark necesarias.
* **Como usarlo**: Haz doble click en el archivo `install_all.bat` o ejecútalo desde cmd/powershell.

### 3. `run.py`
* **Que hace**: Consola Maestra Interactiva para gestionar los procesos locales en Windows. Levanta simultaneamente el frontend (enrutando a `npm start`) y la coleccion de backend microservicios (enrutando a `run_microservices.py`) en ventanas independientes de comando.
* **Control interactivo de procesos**: Permite controlar el estado de los servicios presionando teclas especificas en la terminal:
  * `1` -> Detener la suite de Backend
  * `A` -> Iniciar/Levantar la suite de Backend
  * `Q` -> Reiniciar la suite de Backend
  * `2` -> Detener el servidor de Frontend
  * `S` -> Iniciar/Levantar el servidor de Frontend
  * `W` -> Reiniciar el servidor de Frontend
  * `ESC` -> Detiene de forma segura todos los procesos y cierra la terminal interactiva.
* **Como usarlo**: Ejecuta `python run.py`.

### 4. `subir.py`
* **Que hace**: Asistente de Git interactivo disenado para acelerar el flujo de guardado y subida de cambios a ramas locales o remotas en GitHub sin necesidad de escribir comandos manuales repetitivos.
* **Modos de ejecucion**:
  * **Modo Interactivo (`python subir.py`)**: Analiza y lista de forma interactiva que archivos fueron modificados, creados o eliminados. Te permite decidir si deseas continuar en la rama actual o cambiarte/crear una nueva rama. Despues te sugiere un mensaje de commit inteligente basado en los nombres de los archivos modificados y finalmente te consulta si deseas realizar un `git push` a `origin/tu-rama`.
  * **Modo Rapido (`python subir.py "mensaje del commit"`)**: Agrega todos los cambios del directorio (`git add .`), realiza el commit con el mensaje ingresado y ejecuta inmediatamente un push a la rama de seguimiento remota activa.

### 5. Otros Scripts de Ejecucion
* `run_all.bat` -> Ejecuta tanto el backend como el frontend de forma directa en un solo click (iniciando `run_microservices.py` y `npm start` de forma paralela en segundo plano).
* `run_microservices.py` -> Arranca de manera secuencial los 9 microservicios de Python en sus respectivos puertos locales (puertos `8001` a `8008`) y el API Gateway (puerto `8000`), manteniendo un hilo de monitoreo continuo de recursos y salud de base de datos.

---

## Credenciales por Defecto

> **Solo para desarrollo.** Cambia estas contraseñas en produccion.

| Rol       | Correo                     | Contraseña  |
| --------- | -------------------------- | ----------- |
| Admin     | admin@laikaclub.com        | gearsof2    |
| Gestor    | gestor@laikaclub.com       | gearsof2    |
| Operador  | operador@laikaclub.com     | gearsof2    |
| Usuario   | usuario@laikaclub.com      | gearsof2    |

---

## Licencia

Proyecto privado - LAIKA Club © 2026. Todos los derechos reservados.
