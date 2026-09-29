# Documentación Técnica: Sistema de Mapas y Asientos Interactivos en Laika Club

Este documento detalla el ciclo de vida completo de la funcionalidad de selección de asientos en la plataforma Laika Club, desde que un administrador crea un mapa, hasta que un usuario lo visualiza, interactúa con él, y el sistema bloquea los asientos adquiridos.

---

## 1. Creación de Salas y Mapas (Administración)

### 1.1 Modelado en Base de Datos
En el backend, los organizadores/administradores pueden registrar **Recintos** y sus correspondientes **Salas**.
Cuando se crea o configura una sala con mapa de asientos interactivo, el sistema permite dos modalidades principales:
- **Mapas SVG Legacy:** Gráficos de vectores donde cada nodo o etiqueta XML representa un asiento (ej. `<path id="A-1">`).
- **Mapas Estructurados v2:** Matrices JSON (`layout_json`) que incluyen coordenadas, tipo de asiento, sección, y estado base.

Esta información de la matriz geométrica o archivo gráfico se asocia directamente a los detalles del **Evento**. Por lo tanto, el objeto Evento expone una propiedad de mapa (ej. `seating_map` o `zones`) indicando al sistema que se requiere un plano interactivo.

---

## 2. Visualización en la Experiencia de Usuario (Frontend)

El flujo del cliente (usuario final) arranca cuando entra al `EventDetail.jsx`. 

### 2.1 Decisión del Renderizador
El componente envolvente `<InteractiveVenueMap />` recibe la configuración de asientos del evento. Su labor es analizar el modelo de datos y decidir qué componente de bajo nivel pintará la interfaz gráfica:
- Si detecta un mapa SVG o layout heredado, delega la UI a `<VenueMapSVG />`.
- Si detecta un modelo moderno, delega a `<SeatMapRenderer />`.

### 2.2 Normalización de Asientos
Para asegurar la estabilidad sistémica, independientemente del tipo de mapa o de lo que el administrador haya introducido, **`<VenueMapSVG />`** efectúa una capa de sanitización estricta: obliga a que la propiedad `id` de cada asiento interactuable sea un dato de tipo `String` y no un valor nulo u objeto. Si un diseñador generó un asiento con un ID numérico o sin ID definido explícitamente, la plataforma lo reasigna automáticamente a una cadena de texto utilizable (por ejemplo, `String(seat.id || "undefined-" + indice)`). Esto es fundamental para emparejar el asiento gráfico con los registros de la base de datos de transacciones.

---

## 3. Lógica de Interacción (El "Cerebro" Local)

El gancho de estado principal encargado de orquestar toda la selección es **`useTicketEngine.js`**. 

Este hook gestiona las siguientes listas maestras locales:
- `selectedSeats` (Los que el usuario en esta pestaña ha clickeado para comprar).
- `busySeats` (Los que el servidor reporta como comprados/bloqueados por *otros*).

### 3.1 Sincronización en Tiempo Real y Bloqueo Frontal
Cuando se carga el evento, el motor hace una petición HTTP GET al backend: `/api/tickets/busy-seats/{eventId}`.
1. El microservicio de Tickets lee la base de datos buscando todos los boletos vendidos o "enganchados" (`locked`, `active`, `payment_pending`).
2. Retorna un arreglo de IDs exactos. Ej: `["A-1", "B-4", "B-5"]`.
3. El frontend convierte esto en un objeto inmutable de alto rendimiento (Set), denominado `busySet`.
4. El mapa SVG reacciona a este cambio de estado: cualquier asiento cuyo ID coincida con un elemento en el `busySet` pierde automáticamente el puntero (no-clickeable) y es re-coloreado a un color "deshabilitado" (normalmente gris, rojo oscuro u opaco) dictado por el sistema de diseño.

De esta forma, visualmente se inhabilita el nodo impidiendo que el usuario pueda enviarlo en una petición de compra.

---

## 4. Transacción y Registro de Compra (Backend)

Una vez que el usuario presiona "Comprar" u "Obtener Entrada Gratis", entra en acción la máquina transaccional. En este ejemplo, desglosaremos el flujo de **Entrada Gratuita** (`/api/tickets/free`), que presentaba complejidad al omitir la pasarela de pagos.

### 4.1 Captura del Payload
El hook transaccional (`useFreeEventFlow.js`) reúne los datos. Empaqueta el objeto JSON incluyendo `eventId` y el arreglo crítico: `seats: ["A-1", "A-2"]`. Adicionalmente, incluye la variable `quantity` calculada en base al tamaño de la selección.

### 4.2 Controladores de Microservicios (`TicketController.java`)
La solicitud POST llega al ecosistema Spring Boot. El controlador deserializa el mapa HTTP y captura estrictamente la lista de tipos dinámicos (`List<String> seats`).

### 4.3 Servicio y Prevención de "Race Conditions" (`TicketService.java`)
Aquí ocurre el mapeo a la entidad Base de Datos:
1. El servicio valida con el ecosistema de Eventos que, en efecto, es un evento libre de costos.
2. Si el arreglo de `seats` viene provisto, se descarta la simple inserción por cantidad y se itera explícitamente **cada asiento seleccionado**.
3. Se inicializa el modelo `TicketItem`, inyectándole a cada uno su propio `seat_id`. 
4. El servicio llama a la función interna principal `purchaseTickets()`.

**El Candado Concurrente (`ReentrantLock`)**:
Para lidiar con el escenario donde **dos usuarios clican el mismo asiento en milisegundos**, la función genera un "lockKey" o llave única por asiento (`evento_ID + funcion_ID + asiento_ID`). 
El sistema aplica un candado a nivel de memoria RAM en el servidor, obligando a uno de los usuarios a esperar fracciones de segundo. El usuario A registra el asiento. Al soltar el candado, el usuario B procede, pero como el asiento A ya consta en la base de datos como "activo" u "ocupado", el backend detona un error conflictivo abortando la venta para el usuario B.

### 4.4 Persistencia
Se guarda el registro con el `seat_id` exacto en la tabla SQL (por ejemplo, MySQL). Esto asegura que:
1. El usuario reciba en su "Wallet" la tarjeta con el dato "A-1".
2. La próxima vez que cualquier persona entre al portal y el `useTicketEngine.js` solicite a `/api/tickets/busy-seats`, este nuevo ID forme parte de la matriz y el Frontend lo dibuje inaccesible de forma perpetua.

---

## 5. Resumen del Flujo Cíclico

1. **(Frontend) Map Render:** Pinta 100 Asientos → Consulta BD `busy-seats`.
2. **(Frontend) Interaction:** Pinta los ocupados. Usuario clica asiento "C-4" libre.
3. **(Frontend) Payload:** El hook envía `{ eventId: 10, seats: ["C-4"] }`.
4. **(Backend) Validation:** Controller y Service verifican candados de memoria para asegurar que nadie más está guardando "C-4" este milisegundo.
5. **(Backend) DB:** Se inserta fila: `ID:2001, seat_id: C-4, status: active`.
6. **(Frontend) Update:** Usuario se recarga. `busy-seats` retorna `["C-4"]`. El asiento ya no se puede seleccionar.

*Fin de la Especificación Técnica de Componentes Estructurales de Selección de Asiento.*
