# Changelog

## [1.5.5] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- **Resolución Integral de Error 500 / 400 BAD REQUEST en Compra de Boletos (`/api/tickets/purchase`):**
  - **Causa Raíz:** El microservicio de tickets lanzaba `ResponseStatusException: 400 BAD_REQUEST "Debe especificar una función para el evento"` cuando los artículos del carrito no enviaban `functionId` (por ejemplo, al añadir boletos rápidamente desde la ficha del evento sin interactuar con el selector de funciones, o al comprar directamente).
  - **Estrategia Defensiva Multi-Capa:**
    - **Capa 1 - UI & Hook de Compra (`useTicketEngine.js`):** Se definió `effectiveFunction = selectedFunction || (event?.functions?.length > 0 ? event.functions[0] : null)` tanto para añadir al carrito como para compra directa instantánea.
    - **Capa 2 - Carrito Persistente (`CartContext.jsx`):** En `addToCart`, si `functionData` no viene definido, se resuelve automáticamente la primera función del evento para que ningún artículo de boleto se almacene en memoria o localStorage con `functionId` nulo.
    - **Capa 3 - Checkout Flow (`useCheckoutFlow.js`):** Antes de enviar el payload a `ticketAPI.purchase`, si algún boleto en el carrito no cuenta con `functionId`, se consulta el evento en tiempo real vía `eventAPI.getById(item.eventId)` y se asigna la función activa.
    - **Capa 4 - Backend Microservicio Tickets (`TicketService.java`):** Si `fid == null` y el evento tiene funciones asociadas, el microservicio asigna por defecto la primera función registrada en lugar de arrojar excepción 400/500.

- **Estabilización de Recomendaciones Big Data y Eliminación de `net::ERR_EMPTY_RESPONSE`:**
  - **Corrección de Puerto Arquitectónico (`microservices/analytics_bigdata/Dockerfile`):** Se unificó el puerto del microservicio PySpark/Uvicorn a `8303` (estándar para el bloque analítico 83xx) corrigiendo el desajuste con el mapeo `8303:8303` en `docker-compose.yml`.
  - **Manejo Amigable de Cold Start (`main.py` y `recommendations.py`):** Cuando un usuario recién registrado o sin compras previas consulta recomendaciones (`/api/analytics/ml/recommendations/{user_id}`), el motor retorna limpiamente `{"status": "cold_start", "recommendations": []}` con código `200 OK` en lugar de abortar con un error 500.
  - **Resiliencia en Frontend (`miscService.js`):** Validación previa de existencia de `userId` antes de invocar el endpoint ML.

## [1.5.4] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- **Resolución de Pantalla de Confirmación de Éxito en Checkout (`useCheckoutFlow.js` y `Step4_Success.jsx`):**
  - **Corrección de Redirección Prematura:**
    - Se solucionó el problema por el cual la pantalla de confirmación no se mostraba tras pagar; al vaciar el carrito (`clearCart()`) el hook redirigía inmediatamente a `/cart` antes de completar la transición de estado.
    - Se implementó un estado inmutable `completedOrder` con la instantánea completa de la transacción y se blindó el guardia de redirección: `cart.length === 0 && currentPhase !== 'success' && !completedOrder`.
  - **Rediseño Integral y Contextual de la Pantalla de Éxito (`Step4_Success.jsx` y `Checkout.css`):**
    - Interfaz moderna, estética dark cyber y cero emojis conforme a `skill.md`.
    - Adaptación visual y funcional según el tipo de compra:
      - **Solo Boletos (`digital_only`):** Indicador de Bóveda Digital, QR dinámico de acceso, desglose de asientos y botón directo *"VER MIS BOLETOS EN BÓVEDA"*.
      - **Solo Mercancía (`physical_only`):** Título *"¡TU PEDIDO DE LAIKA SHOP ESTÁ ASEGURADO!"*, instrucciones precisas de recolección en taquilla oficial presentando INE y número de orden (o detalles de paquetería a domicilio), y botón principal *"VER MIS PEDIDOS / COMPRAS"*.
      - **Compra Mixta (`mixed`):** Título *"¡COMPRA COMBINADA CONFIRMADA!"* con paneles divididos para boletos (Bóveda Digital) y mercancía (Taquilla/Envío), con accesos rápidos a ambas secciones.
    - Soporte integrado de voucher y guía paso a paso para pagos en efectivo con **OXXO Pay**.

- **Diferenciación y Contextualización Total de Mensajes y Notificaciones:**
  - **Plantillas Push Contextuales (`PushPsychology.js` y `useCheckoutFlow.js`):**
    - Se incorporaron los tipos `MERCH_PURCHASE` y `MIXED_PURCHASE`, eliminando la notificación genérica fija de boletos cuando se compra mercancía de la tienda.
  - **Correos Electrónicos Adaptativos:**
    - El asunto y contenido HTML del correo se generan dinámicamente:
      - Boletos: Accesos digitales en Bóveda y QR de entrada.
      - Mercancía: Instrucciones oficiales de taquilla con INE o número de guía a domicilio.
      - Mixto: Desglose completo de accesos y logística física.

- **Resiliencia en Servicio de Correos y Errores 500 (`EmailController.java` y `useCheckoutFlow.js`):**
  - Se blindó `EmailController.java` para que cuando las credenciales SMTP no estén configuradas en entornos locales/Docker, registre la advertencia y retorne respuesta simulada con código `200 OK` en lugar de abortar con `500 Internal Server Error`.
  - En `useCheckoutFlow.js`, la notificación por correo se gestiona de forma no bloqueante, protegiendo la experiencia del comprador en caso de fallos externos de red o SMTP.

- **Navegación Fluida a Historial de Mercancía (`UserHistory.jsx`):**
  - Soporte de parámetro `?tab=merch` para abrir directamente la pestaña de pedidos de Laika Shop al hacer clic en los enlaces de confirmación.

## [1.5.3] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- **Corrección Crítica de Pasarela de Pago e Intención de Cobro (`useCheckoutFlow.js`):**
  - **Resolución de Error 500 / 400 BAD REQUEST ("El evento seleccionado ya ha concluido o no está disponible"):**
    - Se eliminó el envío erróneo de identificadores de evento alfanuméricos de mercancía (`merch_100_210`) al microservicio de tickets durante `createPaymentIntent`.
    - Al comprar mercancía de Laika Shop (sin boletos de concierto), la intención de cobro se genera limpiamente sin `event_id`, evitando que el validador de funciones de eventos rechace la transacción.
  - **Separación Total de Recolección en Taquilla vs. Envío a Domicilio (`PhaseDelivery.jsx` y `useCheckoutFlow.js`):**
    - `needsShippingForm` ahora es estrictamente falso cuando se selecciona "Recoger en Taquilla / Punto Oficial" (`deliveryType === 'tienda'`).
    - Se reemplazó la sección de captura y libreta de direcciones domiciliarias por una **Tarjeta Oficial de Recolección en Taquilla**: sin solicitar calle, número exterior, colonia ni código postal.
    - Se confirma de manera visual: *"Sin costo de envío · No requiere dirección a domicilio"*, mostrando únicamente el nombre del titular para cotejo con INE/Pasaporte y el correo de recepción de comprobante.
  - **Sincronización de Identidad de Usuario en Checkout:**
    - Mapeo automático de `user.firstName` y `user.lastName` en `shippingData` para evitar que el campo de nombre quede vacío por inconsistencia de esquemas.

## [1.5.2] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- **Resolución de Pasarela y Flujo de Compra Unificado (Boletos + Laika Shop):**
  - **Corrección en Validación de Recolección en Taquilla (`useCheckoutFlow.js`):**
    - Se desvincula la obligatoriedad de campos domiciliarios (`calle`, `codigoPostal`, `numeroExterior`, `ciudad`, `colonia`) cuando el usuario selecciona "Recoger en Taquilla / Punto Oficial" (`deliveryType === 'tienda'`).
    - Solo se solicita nombre y correo electrónico del titular para validación de identidad con identificación oficial (INE / Pasaporte) en el módulo físico del evento.
    - Se previene el guardado erróneo de direcciones domiciliarias vacías en la libreta del cliente cuando se elige recolección en taquilla.
  - **Resolución Exacta de Variantes de Mercancía (`CartContext.jsx` y `useCheckoutFlow.js`):**
    - Persistencia garantizada de `variantId`, `merchId`, `stock` y `isAvailable` en los ítems agregados al carrito, evitando referencias nulas que causaban errores `404 / 400` en el microservicio `laika_merchandise`.
    - Fallback resiliente al ID de variante real registrado en base de datos.
  - **Gestión Visual y Preventiva de Artículos Agotados en Carrito (`CartContent.jsx` & `Cart.css`):**
    - Verificación dinámica en tiempo real de disponibilidad e inventario contra la base de datos al abrir el carrito.
    - Difuminado y filtro escala de grises (`cart-item-ticket--unavailable`) para productos sin inventario o agotados.
    - Etiqueta de estado en rojo brillante `AGOTADO` y leyenda descriptiva de advertencia.
    - Banner de alerta superior indicando la presencia de artículos no disponibles.
    - Bloqueo preventivo del botón de pago ("CONTINUAR AL PAGO" -> "ARTÍCULOS AGOTADOS EN CARRITO") mientras existan artículos sin existencias, protegiendo al usuario de transacciones fallidas.
  - **Resiliencia en Recomendaciones ML / Big Data (`miscService.js`):**
    - Bloque `try/catch` con timeout estricto y fallback silencioso en `getUserRecommendations` para evitar errores `ERR_EMPTY_RESPONSE` en la consola del navegador cuando el motor de Big Data no responde.
  - **Limpieza de advertencias ESLint en `EventMerchSection.jsx`.**

## [1.5.1] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- **Rediseño Maestro de Laika Shop (Fusión Porto eCommerce + Cyber Bento Box Festival Hub):**
  - **Componente `ShopHero` (`src/pages/Shop/components/ShopHero/`):**
    - `ShopHeroSlider.jsx`: Banner principal dinámico (~65%) que destaca los drops oficiales con rotación automática, badges de exclusividad, precio formateado y CTAs rápidos.
    - `ShopQuickFinder.jsx`: Tarjeta Bento de búsqueda rápida con selectores dinámicos de categoría y evento/colección vinculados al catálogo en vivo.
    - `ShopPromoCard.jsx`: Widget Bento de beneficio para fans con código de descuento `LAIKACLUB10`, botón interactivo de copiado con feedback visual y bordes neón.
    - `ShopHero.css`: Estilos modulares con glassmorphism, temas oscuros de festival y diseño responsivo adaptativo.
  - **Componente `FeaturedCategories` (`src/pages/Shop/components/FeaturedCategories/`):**
    - `FeaturedCategories.jsx`: Cinta horizontal de categorías destacadas con conteo en vivo calculado dinámicamente de productos reales en base de datos.
    - Iconografía SVG vectorial exclusiva (Lucide React) sin emojis ni datos simulados (zero mocks).
  - **Integración Limpia en `Shop.jsx`:**
    - Erradicación de código monolítico; delegación completa a componentes modulares exclusivos bajo `src/pages/Shop/components/`.
    - Conexión del buscador rápido y cintillo de categorías con los filtros de eventos y categorías existentes.
  - **Corrección en Detalle de Evento (`EventDetail`):**
    - Ajuste dimensional en `EventPoster.css`: Reducción de `aspect-ratio` de 3/4 a 16/9 con `max-height: 420px` para prevenir que la imagen del póster crezca desproporcionadamente en la columna izquierda.
    - Reactivación y resolución de mercancía en `EventMerchSection.jsx`: Soporte universal para `imageUrl` y `image_url`, enlace a `getImageUrl` y visualización de productos cuando existan artículos aprobados para el evento.
    - Activación de `merch_enabled = 1` en la base de datos para eventos con catálogo activo.

## [1.5.0] - 2026-10-21
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Integración completa del ciclo de vida de mercancía oficial (Gestor -> Admin -> Laika Shop -> Event Detail).
- **Backend Merchandise (`microservices2/merchandise`):**
  - Implementación de endpoints de consulta de pedidos por usuario (`/orders/user/{userId}` y `/orders/my-orders`).
  - Enriquecimiento de DTOs (`OrderResponse`, `OrderItemResponse`) con soporte bivalente de nombres (camelCase y snake_case) para pasarelas y frontend.
  - Soporte de idempotencia y bloqueo pesimista en concurrencia verificado.
  - Ajuste en `SecurityConfig` para permitir consulta pública de estados de pedidos.
- **Frontend Laika Shop & Detalle de Evento:**
  - Enrutamiento y filtrado estricto en `Shop.jsx` para mostrar exclusivamente mercancía aprobada (`admin_status='approved'`).
  - Búsqueda expandida en catálogo por nombre de evento, artista, categoría y tags.
  - Visualización de mercancía oficial relacionada en la vista de detalle de evento (`EventMerchSection`).
  - Estandarización de `variantId` y `merchId` en el contexto del carrito (`CartContext`) y en el hook transaccional (`useCheckoutFlow`).
  - Incorporación de pestaña de "Pedidos Laika Shop" en el historial del usuario (`UserHistory.jsx`) para consulta de órdenes y estado de compras.
- **Gestión y Roles:**
  - Sincronización explícita de `admin_status: 'pending_review'` al crear mercancía desde los paneles de gestor.

## [1.4.0] - 2026-09-24
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Refactorización visual completa al estilo *Bento Box* en las interfaces de `laika-admin` (Ventas, Eventos, Usuarios, Recintos, Configuración y Push).
- Erradicación de archivos CSS monolíticos locales (`admin.css`, `UserManagement.css`, etc.) forzando un diseño apoyado totalmente en componentes estandarizados.
- Ajustes críticos en el componente maestro `<Table>` para asegurar legibilidad en tema oscuro y claro (`--text-primary`).
- Resolución del bug del *Sidebar* deslizante provocado por conflictos con `overflow-x: hidden` y `position: sticky`.
- Estandarización de elementos dinámicos sin el uso de macros hardcodeados.

## [1.3.2] - 2026-09-24
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Actualizaciones en el submódulo LaikaMobil y adición de archivos de pruebas y uploads.
- **laika-gestor:** Creación de la rama `estilo-alternativo` con rediseño y modificaciones de estilo para el dashboard y vistas de gestión.
- **laika-operador:** Actualización del componente `TicketInfo`.

---

## [1.3.1] - 2026-09-18
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Rediseño completo del login de laika-admin a un estilo premium (Glassmorphism), acatando estrictamente el estilo de tarjeta de cristal sin bordes de inputs.
- Refactorización de `Login.jsx` (monolito) dividiéndolo en componentes de UI independientes (`LoginLayout`, `LoginHeader`, `LoginForm`, `LoginFooter`).
- Reestructuración de colores, layout y variables estéticas priorizando una identidad corporativa limpia.
- **laika-gestor:** Rediseño completo del login a *Glassmorphism Premium* con temática Ámbar/Naranja y layout centralizado.
- **laika-operador:** Rediseño completo del login a *Glassmorphism Premium* con temática Verde/Cian y layout centralizado.

---
## [1.3.0] - 2026-09-18
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Integración oficial de API Gateway desacoplado en Python (Pilgrim) reemplazando al gateway de Java en la orquestación.
- Modificación de los archivos `docker-compose.yml` y `docker-compose.oracle.yml` para enrutar el tráfico principal hacia Pilgrim.
- Creación de `Dockerfile` específico para Pilgrim, optimizado para despliegues en producción (Oracle Cloud ARM) usando Uvicorn.

---

## [1.2.0] - 2026-09-14
### Autor
Kms_Bismarck003 <jreyes6458@gmail.com>

### Lo nuevo o lo que se añadio
- Implementación completa del sistema de mapeo interactivo 2D con Konva en el detalle de evento (VenueMapContainer y InteractiveVenueMap).
- Integración fullstack funcional de boletos y asientos con la base de datos (validación de estado de asientos a través del ticketService y el TicketController).
- Actualización de microservicio de Tickets para resolver ocupación de asientos en tiempo real (getBusySeats).
- Creación de script de simulación de datos masivos y eventos (simulate_event).
