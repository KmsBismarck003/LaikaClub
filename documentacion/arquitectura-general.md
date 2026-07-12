# Arquitectura Detallada del Sistema - LAIKA Club (Suite Java)

Este documento detalla de forma didáctica, clara y justificada la estructura de las capas de **LAIKA Club** utilizando la suite de microservicios en **Java / Spring Boot** (`microservices2`), explicando tanto el frontend como la separación física de base de datos de cada microservicio.

---

## 1. CAPA DE CLIENTE: ARQUITECTURA DEL FRONTEND (REACT SPA)

El frontend está estructurado como una **Single Page Application (SPA)** usando **React 19** y **React Router DOM 7**. Se organiza en base a **dominios funcionales (features)** y separación estricta de responsabilidades en carpetas:

### Carpetas en `src/` y su Justificación

1. **`src/core/` (Reglas del Negocio)**:
   * *Para qué sirve*: Alberga la configuración del sistema (`app.config.js`) y las definiciones de jerarquías de acceso (`roles.config.js`).
   * *Justificación*: Actúa como la fuente única de verdad para el sistema de control de acceso antes de pintar pantallas.
2. **`src/context/` (Estados Globales compartidos)**:
   * *Para qué sirve*: Estados del ciclo de vida que cruzan múltiples pantallas: `AuthContext` (tokens de sesión), `CartContext` (carrito, bloqueo de asientos por tiempo) y `UXContext` (densidad visual de layouts).
   * *Justificación*: Evita la inyección repetitiva de propiedades en cascada (prop-drilling).
3. **`src/components/` (UI Reutilizable y Guards)**:
   * *Para qué sirve*: Componentes visuales genéricos sin lógica de dominio (botones, inputs, modales, esqueletos) y protectores de enrutamiento (`ProtectedRoute.jsx`, `MaintenanceGuard.jsx`).
   * *Justificación*: Homogeneiza el aspecto visual del sitio y centraliza el bloqueo perimetral de rutas.
4. **`src/features/` (Módulos por Dominios de Negocio)**:
   * *Para qué sirve*: Carpetas aisladas para cada unidad de negocio (ej. `auth`, `events`, `admin`, `manager`, `staff`). Cada feature agrupa internamente sus propios hooks y sub-componentes.
   * *Justificación*: Encapsula el código funcional del negocio. Utiliza archivos barrel (`index.js`) de exportación pública para reducir el acoplamiento cruzado.
5. **`src/layouts/` (Esquemas / Plantillas)**:
   * *Para qué sirve*: Estructuras maestras del sitio (como `MainLayout` para la web pública y `DashboardLayout` para barras laterales operativas).
   * *Justificación*: Encapsula los contenedores y permite el renderizado dinámico de rutas hijas mediante `<Outlet />`.
6. **`src/pages/` (Páginas del Enrutador)**:
   * *Para qué sirve*: Componentes delgados que enlazan con rutas específicas y se cargan perezosamente con `React.lazy`.
   * *Justificación*: Actúan como pegamento entre los Layouts y las Features que se van a renderizar.
7. **`src/services/` (Llamadas de Red)**:
   * *Para qué sirve*: Clientes HTTP basados en Axios.
   * *Justificación*: Centraliza peticiones de red hacia el Gateway, inyectando de forma automatizada las cabeceras `Authorization: Bearer <JWT>` en peticiones protegidas.
8. **`src/styles/` y `src/utils/` (Aesthetics & Helpers)**:
   * *Para qué sirve*: Variables CSS de colores HSL/tipografías (`variables.css`), y funciones puras de JS (fechas, formateadores).
   * *Justificación*: Asegura consistencia de diseño visual y reutilización de lógica común no gráfica.

---

## 2. CAPA DE ENRUTAMIENTO: API GATEWAY (JAVA / SPRING BOOT)

### API Gateway (`microservices2/gateway` - Puerto 8000)
* **Tecnologías**: Java 17, Spring Boot 3.2.5, Spring Web, Spring JDBC.
* **Justificación**: Centraliza las conexiones provenientes de la SPA. Enruta peticiones REST hacia el microservicio adecuado de acuerdo al path base. Cuenta con drivers JDBC para MySQL y SQLite para realizar consultas directas y optimizar respuestas de caché rápida.

---

## 3. CAPA DE SERVICIOS: MICROSERVICIOS Y SUS BASES DE DATOS

La suite de backend `microservices2` utiliza **Java 17 y Spring Boot 3.2.5** con el patrón **Base de datos por Microservicio (Database-per-Service)**.

### ¿Por qué cada microservicio tiene su base de datos independiente?
1. **Aislamiento de Esquemas**: Evita que un cambio en las tablas de un servicio (como agregar campos de categorías de eventos) cause caídas en cascada o errores de compilación en otros servicios (como Autenticación).
2. **Seguridad y Transaccionalidad Aislada**: Los datos financieros y de tickets están encapsulados únicamente dentro del servicio que los procesa, reduciendo el área de superficie para vulnerabilidades.
3. **Escalabilidad de Lecto-Escritura**: Las bases de datos de microservicios con mucha demanda (como las transacciones de boletos o el catálogo de recintos) pueden escalarse de manera independiente en la nube sin afectar el rendimiento de bases de datos administrativas.

### Persistencia Híbrida y Fallback Dual (MySQL $\rightarrow$ SQLite)
Cada servicio de Spring Boot utiliza **Spring Data JPA e Hibernate** con configuración de doble origen:
* **Base de Datos MySQL Dedicada**: Cada servicio tiene asignado un esquema lógico exclusivo en el servidor MySQL (ej: `db_auth`, `db_events`, `db_tickets`, etc.).
* **Fallback SQLite Local**: En caso de que el servidor MySQL sufra una interrupción o desconexión, el microservicio conmuta en caliente a un archivo SQLite local (`auth.db`, `events.db`, etc.) ubicado dentro de su directorio local para garantizar la continuidad degradada del servicio.

---

### Detalles y Justificaciones de los 8 Microservicios

#### 1. Servicio Auth (Puerto 8001)
* **Propósito**: Registro de usuarios, autenticación y generación de tokens de seguridad firmados con JSON Web Token (JWT).
* **Justificación de DB (`db_auth` / `auth.db`)**: Contiene la tabla `users` y los logs de auditoría de accesos. Ningún otro servicio debe tener acceso de escritura a las credenciales de usuarios.
* **Tecnologías**: Spring Security (BCrypt), JWT, Spring Data JPA.

#### 2. Servicio Events (Puerto 8002)
* **Propósito**: Gestión del catálogo de espectáculos, locaciones físicas de recintos (Venues) y layouts SVG de aforo.
* **Justificación de DB (`db_events` / `events.db`)**: Gestiona la tabla `events`, configuraciones de aforo y zonas. Al aislar la base de datos se previene que las intensas consultas de lectura del público buscando eventos afecten el login del sistema.
* **Tecnologías**: Spring Data JPA, Hibernate Community Dialects (SQLite).

#### 3. Servicio Tickets (Puerto 8003)
* **Propósito**: Motor transaccional de compras de entradas, bloqueo de asientos y validaciones QR por operadores de staff.
* **Justificación de DB (`db_tickets` / `tickets.db`)**: Controla las tablas de tickets y pagos simulados. Necesita aislamiento absoluto para asegurar bloqueos y evitar la doble venta de un asiento.
* **Tecnologías**: Spring Data JPA, Spring Security Integration.

#### 4. Servicio Stats (Puerto 8004)
* **Propósito**: Registro de telemetría de hardware (procesador, uso de memoria) del nodo del backend y métricas generales del negocio.
* **Justificación de DB (`db_stats` / `stats.db`)**: Aísla las constantes escrituras de telemetría e historiales de rendimiento del servidor para no saturar las bases transaccionales de compra de tickets.
* **Tecnologías**: Spring Data JPA.

#### 5. Servicio Admin (Puerto 8005)
* **Propósito**: Configuraciones globales de mantenimiento del sistema, carga estática de banners y respaldos programados de base de datos.
* **Justificación de DB (`db_admin` / `admin.db`)**: Controla las banderas del sistema y configuraciones globales de TI de manera segura.
* **Tecnologías**: Spring Data JPA.

#### 6. Servicio Achievements (Puerto 8006)
* **Propósito**: Sistema de gamificación de recompensas, otorgando insignias y logros por la lealtad y compras de los usuarios.
* **Justificación de DB (`db_achievements` / `achievements.db`)**: Las medallas e insignias son características secundarias de gamificación. Su base de datos aislada garantiza que si el motor de logros falla, el usuario aún pueda comprar tickets sin inconvenientes.
* **Tecnologías**: Spring Data JPA.

#### 7. Servicio Analytics (Puerto 8007)
* **Propósito**: Análisis analítico del comportamiento de los usuarios, predicciones de ingresos de venta y detección de anomalías.
* **Justificación de DB (`db_analytics` y MongoDB Atlas)**: 
  * Consume réplicas de datos en la nube de **MongoDB Atlas** (Base de datos NoSQL para OLAP) alimentada de manera asíncrona ("fire-and-forget") por el servicio de Tickets.
  * Al separar las analíticas pesadas en MongoDB, los algoritmos de predicción no interfieren con la base de datos relacional de producción.
* **Tecnologías**: Spring Data MongoDB, Spring Data JPA.

#### 8. Servicio Merchandise (Puerto 8008)
* **Propósito**: Bazar de recuerdos de eventos y flujos de aprobación administrativa de productos oficiales.
* **Justificación de DB (`db_merchandise` / `merchandise.db`)**: Separa el control de stock físico comercial (playeras, tazas) del catálogo de aforo y venta de boletos del evento para evitar interbloqueos.
* **Tecnologías**: Spring Data JPA.
