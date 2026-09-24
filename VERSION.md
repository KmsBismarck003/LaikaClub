# Changelog

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
