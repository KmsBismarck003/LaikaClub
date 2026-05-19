# AUDITORIA Y DOCUMENTACION ESTRUCTURAL DEL SISTEMA - LAIKA CLUB

> **Referencia Tecnica para Onboarding de Desarrolladores**  
> **Area:** Arquitectura Enterprise, Sistemas Distribuidos y Frontend Modular  
> **Estado del Proyecto:** Operativo con deuda tecnica identificada  

---

## VISTA GENERAL DE LA ARQUITECTURA

El sistema Laika Club esta disenado bajo un modelo hibrido que separa las responsabilidades del frontend y del backend mediante una arquitectura distribuida:

1. **Frontend (React)**: Una Single Page Application (SPA) construida sobre React, utilizando enrutamiento dinamico centralizado (`react-router-dom`), estado global a traves de React Context Providers, y una estructura modular orientada a dominios funcionales (Features).
2. **Backend (Microservicios FastAPI)**: Compuesto por 8 microservicios independientes programados en Python utilizando FastAPI, comunicados a traves de un API Gateway centralizado (`gateway.py`) que escucha en el puerto `8000` y gestiona el enrutamiento, almacenamiento en cache de peticiones publicas, y politicas de seguridad (CORS).
3. **Capa de Persistencia Hibrida**: 
   * Cada microservicio esta configurado con una arquitectura de base de datos dual con protocolo de autorecuperacion (Fallback). Intentan conectarse a una base de datos centralizada MySQL. Si la base de datos principal no esta accesible, conmutan de forma transparente e independiente a archivos locales SQLite (`auth.db`, `events.db`, etc.) ejecutando migraciones no destructivas en caliente.
   * Se integra un sistema de analisis offline sincronizando compras transaccionales en tiempo real hacia una base de datos NoSQL MongoDB Atlas.
4. **Motor de Big Data e Inteligencia Proactiva**: El servicio de analítica pesada (`analytics_bigdata`) corre un motor Apache Spark en segundo plano (no bloqueante) para realizar procesamiento paralelo (MapReduce), modelos predictivos de ventas (Ridge, Lasso, Regresion Lineal) y deteccion de anomalias en transacciones.

```
+--------------------------------------------------------------+
|                         Cliente Web                          |
+--------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                  API Gateway (gateway.py:8000)               |
+--------------------------------------------------------------+
                               |
       +-----------------------+-----------------------+
       | /api/auth             | /api/events           | /api/tickets
       v                       v                       v
+--------------+        +--------------+        +--------------+
|  Servicio    |        |  Servicio    |        |  Servicio    |
|  Auth (8001) |        |Events (8002) |        |Tickets (8003)|
+--------------+        +--------------+        +--------------+
       |                       |                       |
       +-----------+-----------+-----------+-----------+
                   | (Intento de conexion principal)
                   v
+--------------------------------------------------------------+
|                    Base de Datos MySQL                       |
+--------------------------------------------------------------+
                   | (Conmutacion local si MySQL falla)
                   +------------------------+
                   |                        |
                   v                        v
            SQLite (auth.db)         SQLite (events.db)
```

---

## GUIA RAPIDA: DONDE ESTA CADA FUNCIONALIDAD Y QUE ARCHIVOS EDITAR

Esta guia mapea los flujos esenciales del negocio con los archivos especificos que debes abrir, depurar o modificar:

### 1. Gestion y Visualizacion de Eventos
* **Que hace**: Carga el catalogo de eventos, filtros por categoria, buscador de eventos en tiempo real, formulario de creacion/edicion para organizadores, y logs de cancelaciones de eventos.
* **Componentes de Interfaz (Frontend)**:
  * `src/features/events/components/` -> Componentes especificos de la UI de eventos (tarjetas, rejillas, listas).
  * `src/pages/EventDetail/EventDetail.jsx` -> Wrappers de presentacion principal del detalle de un evento.
  * `src/pages/EventManagerDashboard/EventManagerDashboard.jsx` -> Panel principal donde el rol 'gestor' administra sus eventos creados.
* **Logica de Negocio y Hooks (Frontend)**:
  * `src/features/events/hooks/useEvents.js` -> Hook para peticiones del catalogo general, paginacion y filtros de busqueda.
  * `src/pages/EventDetail/hooks/useEventDetailData.js` -> Carga la informacion de un evento en base a su ID.
* **Llamadas a la API (Frontend)**:
  * `src/services/eventService.js` -> Objeto `eventAPI` que encapsula metodos como `getEvents()`, `getEventById(id)`, `createEvent(data)`, `updateEvent(id, data)` y `deleteEvent(id)`.
* **Endpoints y Rutas del Servidor (Backend)**:
  * `microservices/events/main.py` -> Enrutamiento FastAPI (ej. `@app.get("/")` para listar, `@app.post("/create")` para dar de alta).
* **Controladores y Persistencia (Backend)**:
  * `microservices/events/controller.py` -> Ejecuta queries SQLAlchemy directas para insertar o actualizar eventos en la base de datos MySQL/SQLite.
  * `microservices/events/database.py` -> Mapeo del esquema ORM (`Event` model) y logica de migracion automatica.

### 2. Compra y Validacion de Tickets (Boletos)
* **Que hace**: Procesa el carrito de compras, realiza el Checkout de boletos, efectua el cobro simulado, guarda tarjetas de credito, almacena el boleto con codigo QR en el perfil de usuario, y provee la terminal para que los operadores validen el boleto fisicamente en la puerta.
* **Componentes de Interfaz (Frontend)**:
  * `src/pages/Checkout/Checkout.jsx` -> Formulario central de compra, ingreso de tarjeta de credito y confirmacion de pago.
  * `src/pages/user/UserWallet.jsx` -> Seccion de la cuenta del usuario donde visualiza sus boletos activos.
  * `src/pages/staff/StaffTerminal.jsx` -> Interfaz de escaneo de codigos de entrada (canje) utilizada por operadores.
* **Logica de Negocio y Hooks (Frontend)**:
  * `src/context/CartContext.jsx` -> Gestiona la duracion del bloqueo de asientos y retiene los tickets agregados al carro.
* **Llamadas a la API (Frontend)**:
  * `src/services/ticketService.js` -> Objeto `ticketAPI` (metodos `purchaseTickets()`, `validateTicket()`) y `paymentAPI` (metodos `charge()`, `getSavedCards()`).
* **Endpoints y Rutas del Servidor (Backend)**:
  * `microservices/tickets/main.py` -> Enrutador FastAPI para compras (`/purchase`), canjes (`/validate`) e incidencias (`/incidents`).
* **Controladores y Persistencia (Backend)**:
  * `microservices/tickets/controller.py` -> Cambia el estado del ticket en base de datos (`active`, `used`, `refunded`), escribe registros de transacciones y genera codigos criptograficos unicos de boletos.

### 3. Recintos, Salas y Aforos (Venues & Rooms)
* **Que hace**: Administra los complejos fisicos (estadios, auditorios), la creacion de salas internas, configuracion de filas/columnas totales de asientos, y precios base por seccion.
* **Componentes de Interfaz (Frontend)**:
  * `src/pages/admin/Venues/Venues.jsx` -> Dashboard de creacion de recintos de nivel de administrador.
  * `src/pages/admin/VenueMap/AdminVenueMap.jsx` -> Panel editor interactivo para configurar distribucion de sillas y asignarles IDs visuales.
* **Llamadas a la API (Frontend)**:
  * `src/services/managerService.js` -> Objeto `venueAPI` (metodos `getVenues()`, `createVenue()`, `getRooms(venueId)`, `saveRoomMap(venueId, roomId, mapData)`).
* **Controladores y Persistencia del Servidor (Backend)**:
  * `microservices/events/venues_controller.py` -> Contiene las funciones de escritura SQL para crear salas (`create_room`), registrar asientos fisicos e interactuar con los aforos de eventos en `events.db`/MySQL.

### 4. Mapeado de Asientos e Interactividad (Seat Maps)
* **Que hace**: Dibuja el mapa grafico interactivo del estadio o concierto en el navegador para que el usuario cliquee asientos especificos, verifique disponibilidad (colores verde/rojo) y los reserve de forma exclusiva.
* **Componentes de Interfaz (Frontend)**:
  * `src/components/VenueMapSVG/VenueMapSVG.jsx` -> Componente reusable que lee configuraciones matriciales de filas y renderiza etiquetas `<svg>` con elementos `<rect>` o `<circle>` interactivos.
  * `src/pages/EventDetail/components/VenueMap/VenueMap.jsx` -> Conecta el mapa visual con el componente principal de detalles del evento.
  * `src/pages/EventDetail/components/VenueMap/VenueMap.css` -> Define variables visuales y animaciones CSS de los asientos (hover, seleccionados, reservados).
* **Controladores y Persistencia (Backend)**:
  * `microservices/tickets/controller.py` -> En la funcion de compra (`purchase_tickets`), bloquea la fila y columna en la base de datos mediante transacciones SQL para evitar colisiones de doble compra simultanea en el mismo asiento.

---

## DESGLOSE DETALLADO POR CARPETAS (FRONTEND)

Estructura de la interfaz de usuario en `src/`.

### 1. `src/core`
* **Ruta**: `src/core`
* **Proposito**: Contiene la configuracion global del sistema y la definicion canonica de roles y permisos que actuan como la unica fuente de verdad.
* **Contenido importante**:
  * `config/app.config.js` -> Centraliza constantes, URL base de la API (con autodeteccion de host local/produccion), duraciones de loaders, estados de sesion y flags de funcionalidades activas (Feature Flags).
  * `config/roles.config.js` -> Define la jerarquia de roles (Admin, Gestor, Operador, Usuario), mapeo de permisos especificos por modulo y funciones helpers de autorizacion (`hasPermission`, `canAccess`).
* **Relacion con el sistema**: Importado por rutas protegidas, middlewares de navegacion, vistas administrativas y de staff para verificar accesos antes de renderizar componentes visuales.

### 2. `src/context`
* **Ruta**: `src/context`
* **Proposito**: Administra el estado global y de submodulos de la aplicacion mediante React Context Providers.
* **Contenido importante**:
  * `AuthContext.jsx` -> Estado de la sesion del usuario actual, persistencia del token de autenticacion y carga inicial.
  * `CartContext.jsx` -> Gestion del carrito de compras de boletos y seleccion interactiva de asientos.
  * `UXContext.jsx` -> Controla transiciones globales, modo motion reducido, niveles de densidad en interfaces (`compact`, `comfortable`, `spacious`) y colapso de barras laterales.
  * `SystemContext.jsx` -> Detecta configuraciones dinamicas del backend como activaciones de mantenimiento.
* **Relacion con el sistema**: Envuelve a toda la aplicacion (`App.jsx`) para que los hooks globales (ej: `useAuth()`, `useUX()`) expongan sus estados en cualquier ruta del arbol de componentes.

### 3. `src/components`
* **Ruta**: `src/components`
* **Proposito**: Almacena atomos, moleculas y componentes visuales puros reutilizables (sin logica de dominio especifica), ademas de protectores de navegacion.
* **Contenido importante**:
  * `Guards/` -> `ProtectedRoute.jsx` y `MaintenanceGuard.jsx` para bloqueos de seguridad y desvios de trafico a paginas especiales.
  * Componentes Genericos -> `Button/`, `Input/`, `Table/`, `Modal/`, `Badge/`, `Dropdown/`, `Skeleton/`.
  * `VenueMapSVG/` -> Renderizado de layouts de salas e interactividad SVG con las zonas de asientos.
  * `LaikaAgent/` -> Widget interactivo inteligente para ayuda al usuario en portales internos.
* **Relacion con el sistema**: Componentes consumidos por features y paginas para mantener consistencia visual y no duplicar codigo visual.

### 4. `src/features`
* **Ruta**: `src/features`
* **Proposito**: Modulos divididos por dominio funcional exclusivo que encapsulan componentes visuales, constantes y hooks especificos de cada negocio.
* **Contenido importante**:
  * `auth/` -> Logica interna de login corporativo y formularios de registro.
  * `events/` -> Componentes de renderizado de catalogos y fichas de eventos.
  * `admin/` -> Paneles internos de monitorizacion, control de usuarios y logs.
  * `manager/`, `staff/`, `user/` -> Modulos para los flujos operativos de organizadores, validadores de QR y perfiles de usuarios.
* **Relacion con el sistema**: Expone sus elementos al exterior unicamente mediante archivos barrel (`index.js`). El resto de la app tiene prohibido importar desde subcarpetas internas de un feature.

### 5. `src/layouts`
* **Ruta**: `src/layouts`
* **Proposito**: Plantillas o esquemas visuales globales que estructuran el diseno general de las pantallas.
* **Contenido importante**:
  * `MainLayout.jsx` -> Layout de la web publica (Nav, Main Wrapper, Footer).
  * `AuthLayout.jsx` -> Estructura de ventanas limpias para formularios de acceso.
  * `DashboardLayout.jsx` -> Contenedor con barra lateral colapsable responsiva para consolas operativas.
* **Relacion con el sistema**: Utilizados en `App.jsx` para envolver grupos de rutas y proveer la maquetacion a las vistas hijas (`<Outlet />`).

### 6. `src/pages`
* **Ruta**: `src/pages`
* **Proposito**: Vistas de paginas completas (wrappers delgados) que ensamblan componentes de caracteristicas (`features`) y los conectan al router.
* **Contenido importante**:
  * `admin/` -> Vistas consolidadas para administracion (`AdminUsers.jsx`, `BigDataAnalytics.jsx`, `Database/`).
  * `manager/` y `staff/` -> Dashboards operativos de eventos, canjes de boletos y registros de incidencias.
  * Publicos y Usuarios -> `Home/`, `EventDetail/`, `Checkout/`, `UserProfile/`.
* **Relacion con el sistema**: Son cargadas perezosamente (`React.lazy`) en `src/routes/index.js` y asignadas a las respectivas rutas del navegador.

### 7. `src/hooks`
* **Ruta**: `src/hooks`
* **Proposito**: Almacenar hooks universales que carecen de dependencias de negocio y sirven para interactividad basica.
* **Contenido importante**:
  * Hooks puros: `useClickOutside.js`, `useDebounce.js`, `useLocalStorage.js`, `useMediaQuery.js`, `usePagination.js`, `useToggle.js`.
  * **Anomalias detectadas**: `useAuth.js`, `useAdminUsers.js`, `useExternalBackup.js` y `useUserPermissions.js` se encuentran ubicados aqui provisionalmente (ver seccion de Zonas Criticas).
* **Relacion con el sistema**: Consumidos libremente por cualquier componente o feature para simplificar estados locales de la interfaz.

### 8. `src/services`
* **Ruta**: `src/services`
* **Proposito**: Capa cliente de red para llamadas HTTP hacia los endpoints del backend API Gateway.
* **Contenido importante**:
  * `apiClient.js` -> Envoltura orientada a objetos usando Axios para llamadas CRUD genericas, interceptores de cabeceras de autorizacion y gestor de subida de archivos (Multipart).
  * Consolidadores de API: `authService.js`, `eventService.js`, `ticketService.js`, `adminService.js`, `managerService.js`.
* **Relacion con el sistema**: Provee los endpoints necesarios a los hooks y features para actualizar o recuperar el estado remoto del servidor.

### 9. `src/styles`
* **Ruta**: `src/styles`
* **Proposito**: Almacen del sistema de diseno visual a base de CSS Vanilla.
* **Contenido importante**:
  * `variables.css` -> Mapa de colores HSL corporativos, tokens de tipografia, tamano de bordes y modificadores de densidad visual.
  * `globals.css` -> Configuracion global del cuerpo del DOM y reseteo basico de estilos.
* **Relacion con el sistema**: Importado desde el punto de entrada de la aplicacion (`index.js`) para afectar la presentacion de todos los componentes.

### 10. `src/utils`
* **Ruta**: `src/utils`
* **Proposito**: Helpers y formateadores de codigo Javascript puro (sin logica de componentes React).
* **Contenido importante**:
  * `constants.js` -> Cadenas estaticas reutilizadas.
  * `validators.js` -> Validadores de expresiones regulares para correos electronicos y complejidad de contraseñas.
  * `date.js` y `format.js` -> Utilidades de fechas locales y formateo de monedas.
* **Relacion con el sistema**: Metodos auxiliares importados por componentes y hooks para asegurar coherencia en visualizacion de datos.

---

## DESGLOSE DETALLADO POR CARPETAS (BACKEND - MICROSERVICES)

Estructura de la suite de microservicios en Python ubicada en `microservices/`.

### 1. `microservices/auth`
* **Ruta**: `microservices/auth`
* **Proposito**: Gestionar credenciales de usuario, login social, seguridad de accesos (bloqueo por intentos) e historiales de sesion.
* **Contenido importante**:
  * `main.py` -> Rutas de control de usuarios.
  * `database.py` -> Conexiones SQL con fallback. Si levanta en SQLite local, inicializa `auth.db`.
  * `security.py` -> Hasheo de contraseñas mediante `bcrypt` y generacion de tokens JWT.
  * `notifier.py` -> Notificador integrado de inicio de sesion o intentos fallidos.
* **Relacion con el sistema**: Ejecuta el sembrado administrativo por defecto (`seed_admin_user()`) si la base de datos esta vacia. Es consumido por el Gateway en `/api/auth`.

### 2. `microservices/events`
* **Ruta**: `microservices/events`
* **Proposito**: Gestion del portafolio de espectaculos, recintos fisicos de los eventos, y configuraciones de distribucion de mapas.
* **Contenido importante**:
  * `venues_controller.py` y `venues_schemas.py` -> Permiten crear layouts personalizados de salas y controlar disponibilidad de zonas.
  * `init_db.py` -> Scripts para precarga de eventos de demostracion y catalogaciones.
* **Relacion con el sistema**: Provee la informacion de aforo y precios de boletos que posteriormente leera el servicio de tickets para compras.

### 3. `microservices/tickets`
* **Ruta**: `microservices/tickets`
* **Proposito**: Automatizar las solicitudes de reservas, confirmacion de pagos de boletos, y control de devoluciones (Refunds).
* **Contenido importante**:
  * `controller.py` -> Logica de validacion de codigos de boletos unicos (QR) y bloqueos transaccionales para evitar doble compra en asientos.
* **Relacion con el sistema**: Al concretarse un pago, consume `microservices/common/mongodb_sync.py` para respaldar la informacion de la transaccion en MongoDB Atlas.

### 4. `microservices/stats`
* **Ruta**: `microservices/stats`
* **Proposito**: Proveer metricas de ventas y monitorizar de manera proactiva el consumo de hardware de la infraestructura.
* **Contenido importante**:
  * `main.py` y `controller.py` -> Registran uso de CPU, uso de memoria virtual (`psutil`) y recuentan ventas diarias globales para dashboards corporativos.
* **Relacion con el sistema**: Consumido de forma exclusiva por las consolas de supervision de administradores y personal de TI.

### 5. `microservices/admin`
* **Ruta**: `microservices/admin`
* **Proposito**: Ejecucion de scripts de soporte de base de datos, enrutamiento de almacenamiento fisico y control de anuncios publicos.
* **Contenido importante**:
  * `automatic_backup.py` -> Realiza de forma automatica copias de seguridad de las bases de datos activas en formato `.sql`.
  * `main.py` -> Recibe uploads de imagenes y expone las rutas estaticas de banners publicitarios.
* **Relacion con el sistema**: Actua como repositorio central de archivos multimedia. Los microservicios de eventos y mercancia recurren a su almacenamiento.

### 6. `microservices/analytics_bigdata`
* **Ruta**: `microservices/analytics_bigdata`
* **Proposito**: Motor avanzado de procesamiento paralelo y analitica predictiva de negocio.
* **Contenido importante**:
  * `engine.py` -> Inicializa una sesion distribuida de Apache Spark en segundo plano. Si Spark aun no ha iniciado, opera automaticamente con consultas SQL nativas a MySQL para no interrumpir el flujo.
  * `main.py` -> Endpoints para MapReduce, anomalias y modelos de Machine Learning (comparativas de regresion Ridge, Lasso y arboles de decision).
* **Relacion con el sistema**: Conecta MySQL (origen de datos transaccional) y MongoDB (repositorio de instantaneas NoSQL).

### 7. `microservices/merchandise`
* **Ruta**: `microservices/merchandise`
* **Proposito**: Gestor de la tienda de recuerdos y aprobaciones de mercancia oficial de bandas o eventos.
* **Contenido importante**:
  * `merchandise.db` -> Archivo SQLite local precargado con items del bazar.
  * `seed_bazar.py` -> Script de sembrado de inventario inicial.
* **Relacion con el sistema**: Habilitado mediante Feature Flags. Es consultado para poblar las secciones comerciales de la web.

### 8. `microservices/achievements`
* **Ruta**: `microservices/achievements`
* **Proposito**: Reglas de gamificacion para premiar la fidelidad del usuario (badges por asistencias consecutivas, VIP, etc.).
* **Contenido importante**:
  * `achievements.py` y `achievements.db` -> Mantiene catalogo de medallas reclamables y vinculacion de logros desbloqueados por usuario.
* **Relacion con el sistema**: Escucha en segundo plano eventos de compra de tickets completados con exito para asignar medallas de forma asincrona.

### 9. `microservices/common`
* **Ruta**: `microservices/common`
* **Proposito**: Modulo compartido para evitar la duplicacion de integraciones externas complejas.
* **Contenido importante**:
  * `mongodb_sync.py` -> Conector de sincronizacion asincrona mediante el driver `motor` para volcar datos de compras en la nube (MongoDB Atlas).
* **Relacion con el sistema**: Importado y consumido directamente por los controladores de compras de tickets.

---

## MICROSERVICIOS Y MODULOS PRINCIPALES DEL SISTEMA

El ecosistema de backend se divide en los siguientes modulos distribuidos:

1. **Autenticacion y Sesiones (auth)**: Encargado de los tokens de seguridad y del bloqueo de seguridad en login.
2. **Eventos y Recintos (events)**: Responsable de gestionar locaciones, salas de espectaculos y la base de datos de eventos disponibles.
3. **Tickets y Pagos (tickets)**: Orquesta el flujo de compras de boletos, transacciones de tarjetas (incluyendo tarjetas guardadas), y solicitudes de reembolso.
4. **Dashboard y Configuracion (admin / stats)**: Permite monitorizar recursos del servidor (CPU/RAM) y automatizar backups de bases de datos relacionales en MySQL.
5. **Analiticas Avanzadas (analytics_bigdata)**: Ejecuta simulaciones transaccionales y compara modelos de regresion de ventas mediante Apache Spark.
6. **Tienda Oficial (merchandise)**: Marketplace integrado para que organizadores vendan mercancias relacionadas con eventos.
7. **Gamificacion (achievements)**: Asignador automatizado de insignias basados en la interaccion del usuario de Laika Club.
8. **Enrutador de Trafico (gateway.py)**: Gateway asincrono implementado en FastAPI que funciona como fachada unificada del sistema.

---

## ZONAS CRITICAS Y HALLAZGOS (DEUDA TECNICA)

Durante la auditoria del repositorio se han detectado los siguientes puntos criticos que requieren atencion o que representan malas practicas arquitectonicas:

### 1. Duplicidad y Falta de Estandar en Servicios de Frontend
* **Ruta**: `src/services/`
* **Hallazgo**: Coexisten archivos duplicados o casi identicos con nombres similares que siguen nomenclaturas mixtas (camelCase vs dot-notation kebab-case):
  * `adminService.js` y `admin.service.js` (Duplicados de 3997 bytes)
  * `authService.js` y `auth.service.js` (Practicamente identicos)
  * `eventService.js` y `event.service.js` (Duplicados de 2412 bytes)
  * `userService.js` y `user.service.js` (Duplicados de 2974 bytes)
  * `ticketService.js` y `ticket.service.js` (Duplicados casi exactos)
  * `managerService.js` y `manager.service.js` (Ligeras diferencias de logica)
* **Impacto**: Los desarrolladores nuevos pueden importar de forma inconsistente el archivo incorrecto. Esto duplica el esfuerzo de mantenimiento de endpoints y expone al sistema a bugs faciles de rastrear.

### 2. Perdida de Separacion de Capas en el API Gateway (Hotpatching)
* **Archivo**: `gateway.py` (Lineas 60 a 84)
* **Hallazgo**: El endpoint publico `/api/ads/public` no se redirige a un microservicio. En su lugar, el propio archivo `gateway.py` realiza una conexion SQL directa usando la libreria `pymysql` para consultar la tabla `ads` de la base de datos central en MySQL.
* **Impacto**: El API Gateway esta asumiendo responsabilidades de persistencia de datos (logica de negocio y base de datos) que deberian estar encapsuladas en un microservicio (como el servicio `admin`). Esto viola el principio de responsabilidad unica de los Gateways.

### 3. Incumplimiento de las Reglas Arquitectonicas de la SPA (Hooks de Dominio)
* **Ruta**: `src/hooks/`
* **Hallazgo**: Se encuentran hooks especificos de dominio (`useAdminUsers.js`, `useAuth.js`, `useExternalBackup.js`, `useUserPermissions.js`) en la raiz global de hooks.
* **Impacto**: Contradice directamente el manual de `src/ARCHITECTURE.md`, que establece que los hooks especificos de un dominio funcional deben colocarse en su carpeta correspondiente dentro de features (ej: `src/features/admin/hooks/useAdminUsers.js`). Esto reduce la portabilidad de los modulos funcionales.

### 4. Acumulacion de Clutter en Carpeta tiradero
* **Ruta**: `tiradero/`
* **Hallazgo**: Existe una carpeta llamada `tiradero` en la raiz del proyecto. Contiene 29 archivos y 8 subcarpetas con scripts descontinuados para corregir importaciones, backups locales de 2026, volcados de SQL antiguos (`laika_club3_v2.sql` de 43KB) e historiales de depuracion.
* **Impacto**: Ensucia la estructura del repositorio de Git y puede ser empaquetado por accidente en contenedores de Docker o transferencias de codigo.

### 5. Crecimiento Desordenado de Vistas Administrativas
* **Ruta**: `src/pages/admin/`
* **Hallazgo**: Cuenta con 18 subcarpetas distintas para vistas secundarias. Muchas paginas acumulan logica densa de UI que no esta modularizada.
* **Impacto**: Dificulta el mantenimiento y la reutilizacion de formularios o vistas de listados que comparten un patron similar.

---

## ESTADO ORGANIZACIONAL Y DIAGNOSTICO

El proyecto cuenta con una base solida pero muestra signos claros de un crecimiento acelerado donde las reglas de codificacion han sido omitidas de manera parcial:

| Criterio | Calificacion | Observaciones del Arquitecto |
| :--- | :---: | :--- |
| **Separacion de Responsabilidades** | **Aceptable** | El frontend tiene una division de capas clara (layouts, pages, features, services, contexts) y el backend separa sus funciones por contenedores/microservicios de FastAPI. |
| **Modularidad y Acoplamiento** | **Bueno** | La regla de barrels (`index.js`) mitiga el acoplamiento cruzado de componentes. No obstante, la fuga de hooks especificos a la carpeta global de hooks debilita esta modularidad. |
| **Resiliencia & Tolerancia a Fallos** | **Excelente** | El protocolo de conmutacion (MySQL -> SQLite fallback local) en cada microservicio es una excelente practica para entornos de desarrollo hibridos y servidores inestables. |
| **Consistencia de Nomenclatura** | **Bajo** | La convivencia de archivos de servicios con nomenclatura `xxxService.js` y `xxx.service.js` requiere una refactorizacion urgente de limpieza de archivos duplicados. |
| **Higiene del Repositorio** | **Medio** | Es necesario configurar reglas en `.gitignore` para carpetas como `tiradero/` e incorporar herramientas de formateo automatico y linters para evitar la degradacion estructural. |
