# Análisis Técnico y Documentación de Integración: LaikaClub, LaikaMobil y Pilgrim

---

## 1. Identificación y Ficha Técnica

### Ficha Técnica de Integración

- **Nombre del proyecto:** Ecosistema LAIKA Club (Integración de Cliente Móvil LaikaMobil, API Gateway Pilgrim y Servicios de Negocio LaikaClub).
- **Integrantes:**
  - Kms_Bismarck003 (`jreyes6458@gmail.com`)
  - Dayan (`al222310493@gmail.com`)  
  *(Datos obtenidos del historial de autoría técnica y documentación de configuración del repositorio. Nombres completos y matrículas institucionales formales: Pendiente de confirmar).*
- **Servicio utilizado (URL/API):**
  - **Puerta de enlace central (Pilgrim API Gateway):** `http://192.168.1.7:8000/api` (verificado en [LaikaMobil/.env](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/.env) y en los valores de contingencia de [src/api/config.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/api/config.ts)). Las URLs con prefijo HTTPS corresponden a esquemas de ejemplo comentados en el archivo `.env` (`# EXPO_PUBLIC_PILGRIM_API_URL=https://api.tu-dominio-laika.com/api`).
  - **Servicios internos enrutados por Pilgrim en red local (Spring Boot / Java 17):**
    - Microservicio de Autenticación (`auth`): `http://127.0.0.1:8101`
    - Microservicio de Eventos (`events`): `http://127.0.0.1:8201`
    - Microservicio de Tickets y Pagos (`tickets`): `http://127.0.0.1:8202`
- **Endpoint de consulta (método HTTP):**
  - `GET /api/events/public?limit=100` (Catálogo general de cartelera pública; enrutado internamente al microservicio de Eventos en `GET /public`).
  - `GET /api/events/{id}` (Consulta de detalle, funciones y mapa de zonas de un evento específico; enrutado a `GET /{event_id}`).
  - `GET /api/tickets/my-tickets` (Consulta de boletos emitidos y asociados al usuario autenticado; enrutado a `GET /my-tickets`).
  - `GET /api/auth/users/me` (Consulta y validación del perfil del usuario autenticado; enrutado a `GET /users/me`).
- **Endpoint de envío (método HTTP):**
  - `POST /api/auth/login` (Autenticación de credenciales de usuario; enrutado al microservicio de Autenticación en `POST /login`).
  - `POST /api/auth/register` (Registro de nuevo usuario; enrutado a `POST /register`).
  - `POST /api/payments/create-intent` (Creación de intención de pago; enrutado al microservicio de Tickets en `POST /payments/create-intent`).
  - `POST /api/payments/{reference}/confirm` (Confirmación del cargo financiero; enrutado a `POST /payments/{reference}/confirm`).
  - `POST /api/tickets/purchase` (Compra definitiva y emisión de boletos con código digital único; enrutado a `POST /purchase`).
  - `POST /api/tickets/lock` (Bloqueo temporal de butaca durante el proceso de selección; enrutado a `POST /lock`).
- **Mecanismo de autenticación:**
  - Autenticación remota basada en credenciales (correo electrónico y contraseña en texto plano enviados vía JSON).
  - Validación en backend mediante función de derivación de claves BCrypt (`BCryptPasswordEncoder`).
  - Generación de token criptográfico JSON Web Token (JWT) firmado con algoritmo simétrico HMAC-SHA256 (HS256).
  - Custodia en cliente móvil mediante almacenamiento seguro en hardware (`expo-secure-store` sobre Android Keystore / iOS Keychain).
  - Transmisión en solicitudes subsecuentes mediante cabecera HTTP estándar `Authorization: Bearer <token>`.
- **Mecanismos de seguridad utilizados:**
  - Cifrado de credenciales en reposo mediante algoritmo de dispersión unidireccional BCrypt en base de datos MySQL.
  - Almacenamiento seguro del token de sesión en el dispositivo móvil con `expo-secure-store`.
  - Validación de sintaxis de entradas en el cliente mediante expresiones regulares (`validateInputs` en `LoginScreen.tsx`).
  - Política de bloqueo temporal de cuenta ante ataques de fuerza bruta (bloqueo por 10 minutos tras 3 intentos fallidos consecutivos en `AuthService.java`).
  - Auditoría de accesos y persistencia de eventos de autenticación (`AuthLog` en MySQL con registro de IP de cliente, cabecera `User-Agent` y motivo de fallo o éxito).
  - Ocultamiento visual de contraseña mediante propiedad reactiva `secureTextEntry`.
  - *Limitación de seguridad constatada:* El canal de transporte activo opera bajo HTTP no cifrado en entorno de desarrollo local. La protección contra ataques de intermediario (Certificate Pinning) se encuentra estructurada como una clase abstracta sin soporte nativo compilado (`SSLPinningService.ts`).
- **Descripción breve de la integración:**
  Arquitectura desacoplada en la que la aplicación móvil React Native / Expo ([LaikaMobil](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/)) opera como interfaz cliente. Esta se conecta mediante peticiones HTTP asíncronas con el API Gateway [Pilgrim](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/) (FastAPI en Python), el cual centraliza el enrutamiento inverso y la distribución de carga hacia los microservicios de backend de [LaikaClub](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/) desarrollados en Java Spring Boot (`microservices2`). La integración comprende la sincronización de catálogos de eventos, la ejecución de transacciones de compra de boletos con llaves de idempotencia y el inicio de sesión remoto con persistencia de tokens de acceso.

---

## 2. Consumo de Datos

### 2.1. Servicio Remoto y Configuración de Conectividad
LaikaMobil obtiene el catálogo de eventos desde el API Gateway centralizado Pilgrim, el cual transfiere la consulta al microservicio especializado de eventos de LaikaClub (`microservices2/events`).

- **URL base configurada:** Obtenida dinámicamente mediante la función `getApiUrl` en [src/api/config.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/api/config.ts), la cual evalúa la variable de entorno `process.env.EXPO_PUBLIC_PILGRIM_API_URL`:
  - Valor configurado en [LaikaMobil/.env](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/.env): `http://192.168.1.7:8000/api`.
  - Valor de contingencia local en código para desarrollo: `http://192.168.1.7:8000/api`.
- **Endpoint de consulta:** `/events/public`.
- **URL final de petición:** `http://192.168.1.7:8000/api/events/public?limit=100`.
- **Método HTTP:** `GET`.

### 2.2. Origen de la Solicitud en LaikaMobil
La petición se desencadena dentro del ciclo de vida de la aplicación a través de la siguiente cadena de invocación:
1. El componente visual [EventsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventsScreen.tsx) inicializa el hook personalizado [useEvents.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/hooks/useEvents.ts).
2. La función `fetchEvents` en `useEvents.ts` es ejecutada dentro de un `useEffect` durante el montaje de la pantalla.
3. El hook delega la llamada en el servicio [EventService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/EventService.ts), invocando el método `EventService.getEvents()`.
4. `EventService` realiza la llamada utilizando el cliente Axios `pilgrimApi` configurado en [config.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/api/config.ts).

### 2.3. Parámetros Transmitidos e Información Solicitada
La petición solicita la cartelera pública general sin requerir cabeceras de autorización (`Bearer token`), al tratarse de un endpoint público.
- **Parámetros de consulta (Query Params):** `limit=100` (determina el número máximo de eventos a recuperar).

### 2.4. Flujo Real de Comunicación entre Componentes
1. **Cliente Móvil (`LaikaMobil`):** Genera una solicitud `GET /api/events/public?limit=100` hacia `192.168.1.7:8000`.
2. **API Gateway (`Pilgrim`):** Recibe la solicitud en [pilgrim/routers/public/events.py](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/routers/public/events.py), mapea el subfijo `/public`, evalúa la política de caché pública (`is_cacheable = "public" in sub_path`) y transfiere la llamada vía HTTP asíncrono (`httpx.AsyncClient`) a `SERVICES["events"]` (`http://127.0.0.1:8201/public?limit=100`).
3. **Microservicio Backend (`LaikaClub / events`):** Recibe la solicitud en [microservices2/events/.../EventController.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/events/src/main/java/com/laikaclub/events/controller/EventController.java) bajo la anotación `@GetMapping("/public")`. El controlador invoca a `EventQueryService.getPublicEvents(category, limit)`, ejecutando una consulta sobre la tabla de eventos en la base de datos MySQL `laika_club`.
4. **Retorno y Serialización:** El microservicio responde con HTTP 200 y una colección JSON. Pilgrim recibe la respuesta, almacena una copia en memoria si la caché está activa y entrega los datos al cliente móvil.

### 2.5. Procesamiento y Transformación de la Respuesta JSON
El cliente móvil recibe un arreglo de objetos JSON crudos y los procesa en `EventService.getEvents()`:
- **Normalización de identificadores:** Convierte `item.id` a cadena de texto.
- **Normalización de títulos y descripciones:** Asigna `title = item.name || item.title || 'Evento sin nombre'` y valida la descripción.
- **Resolución de codificación (Mojibake):** Aplica la función local `fixMojibake(str)` para reparar caracteres corruptos en nombres de municipios o estados generados por discordancias de codificación UTF-8 / ISO-8859-1 en la base de datos (por ejemplo, corrigiendo cadenas como `M├®xico` a `México`).
- **Construcción de URLs de imágenes:** Si `item.image_url` es una ruta relativa que inicia con `/`, se le antepone el dominio base del gateway (`${baseUrl}${imgUrl}`).
- **Asignación de precios y estado:** Mapea `minPrice = item.min_price || item.price || 0` y `status`.

Una vez normalizado el arreglo en objetos conformes a la interfaz TypeScript `Event`, `useEvents.ts` extrae las ubicaciones únicas (`uniqueLocs`) para poblar los selectores de filtrado y aplica filtros locales reactivos (por categoría, fecha o ubicación) si el usuario los ha seleccionado en la interfaz.

### 2.6. Presentación en Pantalla
Los datos obtenidos se renderizan en [EventsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventsScreen.tsx):
- Los primeros cinco eventos (`events.slice(0, 5)`) se suministran al carrusel superior [HeroCarousel](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/components/HeroCarousel.tsx).
- La totalidad del listado filtrado se procesa mediante un componente `FlatList`, renderizando tarjetas interactivas de eventos que permiten al usuario pulsar sobre un elemento para navegar a la pantalla de detalle (`EventDetailScreen`).

### 2.7. Manejo de Errores y Focos de Contingencia
- **En la capa de servicio (`EventService.ts`):** Cualquier error de red o de código HTTP es interceptado por un bloque `catch`, registrado mediante `console.error` y relanzado hacia el hook invocador.
- **En la capa de estado (`useEvents.ts`):** Se intercepta la excepción, asignando el mensaje al estado reactivo `setError(err.message || 'Error al conectar con Pilgrim API')` y desactivando el indicador de carga (`setLoading(false)`).
- **En la capa de interfaz (`EventsScreen.tsx`):**
  - Si el error contiene las palabras `'network error'` o `'conectar'`, el componente determina que el backend se encuentra inaccesible y monta la vista especializada `OfflineStateView` con un botón para reintentar la conexión (`refetch`).
  - Si ocurre un error de otra índole sin datos previos en memoria, despliega un contenedor de alerta con el texto `"Ocurrió un problema"`, el detalle de la excepción y el botón de reintento.

### 2.8. Comprobación del Origen de la Información (Remoto vs. Simulado)
- **Estado de la implementación:** **Implementado y verificado en código; verificado en registros de ejecución previa del sistema.**
- **Comprobación:** La función `EventService.getEvents()` **no utiliza arreglos locales, mocks embebidos ni datos simulados de respaldo**. La totalidad de los datos depende estrictamente de la respuesta HTTP del endpoint `/events/public`.
- **Evidencia operativa en logs:** En el archivo de registro [tiradero/logpruebas/api_gateway.log](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tiradero/logpruebas/api_gateway.log), líneas 11, 13, 17 y 47, se constatan ejecuciones reales previas de clientes móviles con peticiones `GET /api/events/public?limit=100 HTTP/1.1` respondiendo exitosamente con código `200 OK`.

---

## 3. Envío de Datos

### 3.1. Funcionalidad Seleccionada
La funcionalidad identificada para el envío de información es la **Adquisición Transaccional de Boletos Digitales** desde la pantalla del carrito de compras ([CartScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/CartScreen.tsx)).

### 3.2. Endpoint de Destino, Método y Transmisión
- **Endpoint final:** `/tickets/purchase`.
- **URL de destino:** `http://192.168.1.7:8000/api/tickets/purchase`.
- **Método HTTP:** `POST`.
- **Formato:** Carga útil en formato `application/json`.
- **Autenticación requerida:** Cabecera `Authorization: Bearer <token>`, agregada por el interceptor de Axios en `ticketApi` a partir de la sesión activa en [AuthStore.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/store/AuthStore.ts).

### 3.3. Construcción y Estructura de los Datos Enviados
En `CartScreen.tsx`, el método `handlePurchase()` construye la carga útil requerida por el backend:
1. Valida la sesión del usuario mediante `if (!user) throw new Error('Debes iniciar sesión para comprar.')`.
2. Genera una clave de idempotencia (`idempotencyKey.current = uuidv4()`) para prevenir cargos dobles en caso de reconexión de red.
3. Construye el arreglo `purchaseItems` iterando sobre la cantidad seleccionada:
   ```typescript
   const purchaseItems = [];
   for (let i = 0; i < eventPreview.quantity; i++) {
     purchaseItems.push({
       eventId: eventPreview.eventId,
       quantity: 1,
       functionId: eventPreview.functionId || null,
       sectionId: null,
       sectionName: 'General',
       price: eventPreview.price,
       seatId: null,
     });
   }
   ```
4. Invoca `TicketService.purchaseTicket(user.id, payload)` en [src/services/TicketService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/TicketService.ts):
   ```json
   {
     "user_id": 1,
     "items": [
       {
         "eventId": 19,
         "quantity": 1,
         "functionId": 5,
         "sectionId": null,
         "sectionName": "General",
         "price": 450.00,
         "seatId": null
       }
     ],
     "paymentMethod": "card",
     "paymentId": "pi_1729040000000",
     "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
     "shippingInfo": null,
     "shippingMethod": "digital"
   }
   ```

### 3.4. Recepción y Enrutamiento en Pilgrim API Gateway
El API Gateway Pilgrim recibe la petición en [pilgrim/routers/public/tickets.py](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/routers/public/tickets.py):
```python
@router.api_route("/api/tickets/{sub_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def tickets_proxy(request: Request, sub_path: str = "") -> Response:
    target_path = f"/{sub_path}" if sub_path else ""
    return await proxy_request(request, SERVICES["tickets"], target_path)
```
Pilgrim retransmite el método `POST`, los encabezados HTTP (incluyendo el token Bearer) y el cuerpo JSON sin alteración hacia `SERVICES["tickets"]` (`http://127.0.0.1:8202/purchase`).

### 3.5. Procesamiento Transaccional en el Backend
El microservicio de Tickets en Java Spring Boot procesa la solicitud en [microservices2/tickets/.../TicketController.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/tickets/src/main/java/com/laikaclub/tickets/controller/TicketController.java) y [microservices2/tickets/.../TicketService.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/tickets/src/main/java/com/laikaclub/tickets/service/TicketService.java):
1. **Validación de Identidad:** `JwtAuthenticationFilter` extrae el `UserPrincipal` del token Bearer validado criptográficamente.
2. **Validación de Evento y Función:** Verifica con el microservicio de eventos que el identificador `eventId` exista y que la función `functionId` esté disponible y no haya concluido.
3. **Control de Concurrencia y Bloqueo de Asientos:** Implementa un cerrojo en memoria `ReentrantLock` basado en la combinación de evento, función y asiento (`getLockKey(eid, fid, seat)`). Si el asiento se encuentra reservado o vendido (`"active"`, `"locked"`, `"used"`), arroja una excepción HTTP 409 Conflict: `"El asiento ya está ocupado."`.
4. **Generación de Código Digital Criptográfico:** Genera un identificador único con prefijo institucional:
   ```java
   String uniqueCode = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
   ```
5. **Persistencia Transaccional:** Inicializa una entidad `Ticket` asignando `status = "active"`, `ticketCode = uniqueCode`, `qrData = uniqueCode`, `purchaseDate = LocalDateTime.now()` y ejecuta `ticketRepository.save(ticket)` en MySQL.
6. **Sincronización Asíncrona:** Despacha un evento hacia MongoDB (`mongoSyncService.syncPurchaseToMongo`) con fines de analítica y auditoría en segundo plano.

### 3.6. Respuesta del Servidor y Tratamiento en la Aplicación
- **Respuesta satisfactoria (HTTP 200 OK):** El servidor retorna una lista JSON con los códigos de los boletos creados:
  ```json
  [
    {
      "code": "TKT-A8F3C12D",
      "seat": null
    }
  ]
  ```
- **Procesamiento de éxito en el cliente:** La promesa en `CartScreen.tsx` concluye satisfactoriamente, se limpia el estado de carga y la aplicación ejecuta una transición de pantalla hacia `SuccessScreen`:
  ```typescript
  navigation.navigate('Success', {
    userName,
    eventTitle: eventPreview.title,
    eventDate: eventPreview.date,
    quantity: eventPreview.quantity
  });
  ```
- **Tratamiento y notificación de fallos:** Si el backend rechaza la compra (por ejemplo, fondos insuficientes, token revocado o asiento ocupado), la excepción entra al bloque `catch (error: any)`. El cliente extrae `error.response?.data?.detail || error.message` y despliega un diálogo nativo:
  ```typescript
  Alert.alert('Error', `Hubo un problema al procesar tu pago: ${detail}`);
  ```

---

## 4. Autenticación Remota y Seguridad de la Comunicación

### 4.1. Formulario de Acceso y Captura de Credenciales
La autenticación de usuarios se implementa en la pantalla [LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx).
- **Campos disponibles:**
  - Correo electrónico (`email`): Gestionado mediante `TextInput` con `keyboardType="email-address"`, `autoCapitalize="none"` y limpieza de espacios en blanco.
  - Contraseña (`password`): Gestionado mediante `TextInput` configurado con la propiedad nativa `secureTextEntry={!showPassword}`.
- **Mecanismo para evitar mostrar la contraseña:**
  - La propiedad `secureTextEntry` convierte de inmediato cada caracter ingresado en una máscara visual (`•`).
  - La interfaz incluye un botón interactivo con un icono de ojo (`Ionicons: 'eye' / 'eye-off'`) que permite conmutar la visibilidad de manera controlada por el usuario.
  - El valor de la contraseña reside únicamente en la memoria volátil del componente React (`useState('')`) y no se escribe en ningún registro de almacenamiento persistente (`AsyncStorage` o logs de depuración).

### 4.2. Validación en el Cliente Móvil
Antes de realizar la petición HTTP hacia el servidor, `LoginScreen.tsx` ejecuta la rutina local `validateInputs()`:
```typescript
const validateInputs = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setErrorMsg('Por favor, ingresa un correo electrónico válido.');
    return false;
  }
  if (password.length < 6) {
    setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
    return false;
  }
  return true;
};
```
Si alguna condición no se cumple, el envío se cancela localmente y se muestra el mensaje de error en la interfaz, evitando peticiones innecesarias hacia el gateway.

### 4.3. Endpoint de Autenticación, Método y Transmisión
- **Endpoint en cliente móvil:** `POST ${PILGRIM_API_URL}/auth/login` invocado en [src/services/AuthService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/AuthService.ts).
- **Enrutamiento:** [pilgrim/routers/auth/router.py](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/routers/auth/router.py) redirige a `SERVICES["auth"]` en `http://127.0.0.1:8101/login`.
- **Método HTTP:** `POST`.
- **Cuerpo transmitido:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "Password123"
  }
  ```

### 4.4. Validación y Lógica de Seguridad en el Servidor
La validación remota la ejecuta [microservices2/auth/.../AuthService.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/auth/src/main/java/com/laikaclub/auth/service/AuthService.java):
1. **Búsqueda del Usuario:** Consulta en la base de datos MySQL ignorando mayúsculas y minúsculas:
   ```java
   Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
   ```
   Si el usuario no existe, se registra un evento de auditoría con tipo `"INTENTO_FALLIDO"` y se arroja `InvalidCredentialsException("Credenciales inválidas")`.
2. **Evaluación de Bloqueo Temporal (Anti-Fuerza Bruta):**
   - El sistema evalúa el campo `lockoutUntil` de la entidad `User`.
   - Si el tiempo de bloqueo está vigente, se registra el evento y se interrumpe el flujo arrojando `AccountLockedException("Cuenta bloqueada temporalmente", remainingSeconds)`.
   - Si el tiempo ya expiró, restablece `failedAttempts = 0` y desbloquea el estado de la cuenta.
3. **Verificación Criptográfica de Contraseña:**
   - Se compara la contraseña enviada con el hash almacenado mediante el codificador BCrypt:
     ```java
     passwordEncoder.matches(password, user.getPasswordHash())
     ```
   - Si no coincide: Para cuentas que no son administradores raíz, incrementa el contador `failedAttempts`. Si alcanza 3 intentos consecutivos (`attempts >= MAX_FAILED_ATTEMPTS`), calcula un bloqueo temporal de 10 minutos (`LOCKOUT_DURATION_MINUTES = 10`), asigna `status = "blocked"` y registra el evento `"CUENTA_BLOQUEADA"`. Si es menor a 3, arroja `InvalidCredentialsException`.
4. **Emisión de Tokens en Autenticación Exitosa:**
   - Restablece los intentos fallidos a 0 y actualiza la marca de tiempo `lastLogin`.
   - Registra en la tabla de auditoría el evento `"LOGIN_EXITOSO"` con la IP del cliente y el User-Agent.
   - Invoca [TokenService.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/auth/src/main/java/com/laikaclub/auth/service/TokenService.java) para generar un token JWT con firma criptográfica HMAC-SHA256, conteniendo los reclamos `user_id`, `role` y como sujeto el correo electrónico.

### 4.5. Estructura de Respuesta del Servidor
El servidor responde con código HTTP 200 y una entidad `TokenResponse`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3VhcmlvQGVqZW1wbG8uY29tIiwidXNlcl9pZCI6MSwicm9sZSI6InVzdWFyaW8iLCJpYXQiOjE3Mjk0NDAwMDAsImV4cCI6MTcyOTUyNjQwMH0.signature...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "role": "usuario",
    "status": "active"
  }
}
```

### 4.6. Gestión de Sesión y Almacenamiento Seguro en el Cliente
En la aplicación móvil, [AuthStore.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/store/AuthStore.ts) implementa una arquitectura de persistencia segregada:
- **Token de acceso (Dato confidencial):** Se persiste exclusivamente en el hardware seguro del dispositivo mediante `expo-secure-store` ([src/services/security/TokenService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/security/TokenService.ts)):
  ```typescript
  await SecureStore.setItemAsync('token', currentToken);
  ```
  Esto garantiza que el token se encripte utilizando el Keystore en sistemas Android o el Keychain en sistemas iOS, evitando su lectura en texto plano.
- **Perfil de usuario (Dato público):** Se guarda en `AsyncStorage` para permitir una carga fluida de la interfaz de usuario:
  ```typescript
  await AsyncStorage.setItem('user', JSON.stringify(user));
  ```
- **Cierre de sesión (`logout`):** Destruye las referencias en memoria y elimina físicamente las claves en ambos motores de persistencia:
  ```typescript
  await AsyncStorage.removeItem('user');
  await SecureStore.deleteItemAsync('token');
  ```

### 4.7. Seguridad de la Comunicación y Limitaciones Identificadas
- **Protocolo de Transporte:** En el estado actual del repositorio, la comunicación entre LaikaMobil y Pilgrim opera bajo **HTTP en texto plano** (`http://192.168.1.7:8000/api`). Las referencias a HTTPS existen como plantillas comentadas en `.env` pero no están desplegadas en el entorno activo.
- **Protección de Credenciales en Tránsito:** Debido a la ausencia de TLS activo en el entorno local, las credenciales viajan sin cifrado de capa de transporte entre el dispositivo móvil y la puerta de enlace local, representando una vulnerabilidad ante captura de tráfico en la red de área local.
- **Certificate Pinning:** La clase [SSLPinningService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/security/SSLPinningService.ts) documenta la intención de validar la clave pública del servidor (`publicKeyHashes`), pero opera únicamente como un stub informativo sin enlace nativo debido a las limitaciones del flujo administrado de Expo sin precompilación.
- **Auditoría y Trazabilidad:** El microservicio backend registra de forma exhaustiva los intentos de acceso en la entidad relacional `AuthLog` (almacenando IP del cliente, identificador de usuario, rol, agente de usuario y marca de tiempo).
- **Protección contra Fuerza Bruta:** Se constata el funcionamiento del algoritmo de bloqueo progresivo (3 intentos / 10 minutos) a nivel de base de datos relacional.

---

## 5. Evidencias de Funcionamiento

A continuación se detallan las seis evidencias técnicas correspondientes a los flujos operativos de la integración. Para aquellas comprobaciones visuales que requieren la ejecución interactiva de la aplicación en el dispositivo móvil, se especifican las instrucciones concretas mediante las notas de captura requeridas.

---

### Evidencia 1: Pantalla de Autenticación

- **Descripción técnica:** Formulario de inicio de sesión de LaikaMobil donde el usuario captura sus credenciales con soporte de enmascaramiento visual de caracteres.
- **Comprobación de código:** Implementada en [src/screens/LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx), líneas 172–219, con campos `email` y `password` vinculados a `secureTextEntry`.
- **Procedimiento de verificación:**
  1. Ejecutar el entorno móvil con `npm run start` dentro del directorio `LaikaMobil/`.
  2. Abrir la aplicación en emulador Android o dispositivo móvil mediante Expo Go.
  3. Navegar a la pantalla de Login (pulsando el botón de perfil o intentando reservar boletos sin sesión activa).

```markdown
[CAPTURA PENDIENTE: 1. Pantalla de autenticación]
- **Qué capturar:** Pantalla de inicio de sesión (LoginScreen) de LaikaMobil.
- **Dónde obtenerla:** Interfaz gráfica de LaikaMobil en emulador o dispositivo móvil físico.
- **Qué debe verse:** Campos de texto "Email" y "Password", icono de enmascaramiento de contraseña (ojo), botón "Login" y fondo temático de la aplicación.
- **Qué debe comprobarse:** Existencia del formulario formal de acceso y presencia de la propiedad de enmascaramiento visual de caracteres en el campo de contraseña.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 1.
- **Nombre sugerido del archivo:** captura_01_pantalla_autenticacion.png
```

---

### Evidencia 2: Autenticación Exitosa

- **Descripción técnica:** Recepción del token JWT firmado por el backend y confirmación de la sesión activa en el cliente móvil.
- **Comprobación de código:** Procesada en [src/screens/LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx) (función `handleLogin`) y persistida en [src/store/AuthStore.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/store/AuthStore.ts) mediante `SecureStore.setItemAsync('token', ...)`.
- **Procedimiento de verificación:**
  1. Iniciar los servicios del backend (`pilgrim` y microservicio `auth`).
  2. Enviar credenciales válidas registradas en MySQL desde LaikaMobil.
  3. Comprobar la transición visual hacia la cartelera o carrito y la disponibilidad del nombre de usuario autenticado en la interfaz.

```markdown
[CAPTURA PENDIENTE: 2. Autenticación exitosa]
- **Qué capturar:** Interfaz de usuario de LaikaMobil inmediatamente después del inicio de sesión satisfactorio (o consola de depuración/inspección de red con código HTTP 200).
- **Dónde obtenerla:** Pantalla principal de LaikaMobil mostrando el perfil o carrito con el nombre del usuario autenticado, o panel Network de React Native DevTools.
- **Qué debe verse:** Confirmación del usuario autenticado en la barra superior o cabecera del carrito ("Carrito de [Nombre]"), y respuesta HTTP 200 con el token de acceso JWT en el tráfico de red.
- **Qué debe comprobarse:** Transición fluida tras validar credenciales y almacenamiento seguro de la sesión sin reaparición de la contraseña.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 2.
- **Nombre sugerido del archivo:** captura_02_autenticacion_exitosa.png
```

---

### Evidencia 3: Consumo de Datos

- **Descripción técnica:** Consulta HTTP `GET` al endpoint `/api/events/public?limit=100` y despliegue del catálogo de eventos en la pantalla principal.
- **Comprobación de código:** Definida en [src/services/EventService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/EventService.ts) y consumida en [src/screens/EventsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventsScreen.tsx).
- **Evidencia en registros existentes:** Confirmada en el log del gateway [tiradero/logpruebas/api_gateway.log](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tiradero/logpruebas/api_gateway.log):
  ```text
  INFO:     192.168.168.196:53856 - "GET /api/events/public?limit=100 HTTP/1.1" 200 OK
  ```
- **Procedimiento de verificación:**
  1. Con Pilgrim y el microservicio de eventos en ejecución, abrir LaikaMobil.
  2. La pantalla inicial cargará dinámicamente las tarjetas de eventos con títulos, recintos y precios procesados desde el JSON remoto.

```markdown
[CAPTURA PENDIENTE: 3. Consumo de datos]
- **Qué capturar:** Pantalla principal de cartelera (EventsScreen) de LaikaMobil mostrando los eventos obtenidos desde la API.
- **Dónde obtenerla:** Pantalla principal de LaikaMobil en dispositivo móvil o emulador.
- **Qué debe verse:** Carrusel superior de eventos destacados (HeroCarousel), tarjetas de eventos con imágenes, fechas, municipios corregidos por `fixMojibake` y precios mínimos.
- **Qué debe comprobarse:** Que los eventos desplegados corresponden a registros reales provistos por el endpoint remoto `/api/events/public` y no a valores fijos estáticos.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 3.
- **Nombre sugerido del archivo:** captura_03_consumo_datos_cartelera.png
```

---

### Evidencia 4: Envío de Datos

- **Descripción técnica:** Petición HTTP `POST` con la estructura transaccional de compra hacia `/api/tickets/purchase` desde el carrito de compras.
- **Comprobación de código:** Mapeada en [src/screens/CartScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/CartScreen.tsx) (función `handlePurchase`) y [src/services/TicketService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/TicketService.ts).
- **Procedimiento de verificación:**
  1. Con sesión activa, seleccionar un evento y cantidad de boletos en LaikaMobil.
  2. Acceder al carrito de compras (`CartScreen`).
  3. Pulsar el botón "Confirmar y Pagar", desencadenando la construcción del payload JSON y la transmisión HTTP.

```markdown
[CAPTURA PENDIENTE: 4. Envío de datos]
- **Qué capturar:** Pantalla del carrito de compras (CartScreen) en el momento de procesar la compra, o captura del panel de red/consola mostrando el payload POST hacia `/api/tickets/purchase`.
- **Dónde obtenerla:** Interfaz de LaikaMobil durante el checkout o consola de depuración de Axios / React Native Debugger.
- **Qué debe verse:** El resumen de la orden con el botón de procesamiento en estado de carga (`ActivityIndicator`), o la carga útil JSON conteniendo `items`, `paymentMethod`, `idempotencyKey` y la cabecera `Authorization: Bearer`.
- **Qué debe comprobarse:** La correcta construcción del cuerpo de la solicitud y el uso del método HTTP POST hacia el endpoint correspondiente.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 4.
- **Nombre sugerido del archivo:** captura_04_envio_datos_compra.png
```

---

### Evidencia 5: Resultado de la Operación

- **Descripción técnica:** Confirmación de la compra con generación del boleto digital y navegación a la pantalla de éxito.
- **Comprobación de código:** Implementada en [src/screens/SuccessScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/SuccessScreen.tsx) tras la recepción del código `200 OK` del backend con el arreglo de boletos generados.
- **Procedimiento de verificación:**
  1. Completar la orden en `CartScreen`.
  2. Al resolver la promesa de `TicketService.purchaseTicket`, la aplicación navega a `SuccessScreen` mostrando el resumen de la compra.

```markdown
[CAPTURA PENDIENTE: 5. Resultado de la operación]
- **Qué capturar:** Pantalla de confirmación de compra (SuccessScreen) de LaikaMobil.
- **Dónde obtenerla:** Pantalla de confirmación de LaikaMobil inmediatamente después de una compra exitosa.
- **Qué debe verse:** Mensaje de compra exitosa, nombre del usuario, título del evento adquirido, fecha, cantidad de boletos procesados y acceso al casillero digital.
- **Qué debe comprobarse:** Notificación clara y transparente al usuario del éxito de la transacción tras la confirmación del servidor remoto.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 5.
- **Nombre sugerido del archivo:** captura_05_resultado_operacion_exito.png
```

---

### Evidencia 6: Manejo de un Error

- **Descripción técnica:** Captura y despliegue visual controlado de una condición de error en el cliente móvil ante indisponibilidad del servidor o rechazo de credenciales.
- **Comprobación de código:**
  - En autenticación: Banner de error en [LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx) ante credenciales inválidas (`errorMsg`).
  - En conectividad general: Vista `OfflineStateView` en [EventsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventsScreen.tsx) ante falla de conexión con el gateway.
- **Evidencia en registros existentes:** Verificada en [tiradero/logpruebas/errores_sistema.log](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tiradero/logpruebas/errores_sistema.log), donde las desconexiones generan códigos HTTP `502 Bad Gateway` y en el cliente se transforman en mensajes amigables.
- **Procedimiento de verificación:**
  1. Detener el gateway Pilgrim o ingresar una contraseña deliberadamente errónea en `LoginScreen`.
  2. Presionar "Login".
  3. Observar la aparición inmediata del mensaje de alerta sin caída abrupta (*crash*) de la aplicación.

```markdown
[CAPTURA PENDIENTE: 6. Manejo de un error]
- **Qué capturar:** Pantalla de LaikaMobil mostrando el mensaje de error controlado (banner de credenciales inválidas en LoginScreen o pantalla de reconexión `OfflineStateView`).
- **Dónde obtenerla:** Interfaz gráfica de LaikaMobil tras forzar un error de autenticación o con los servicios de backend desconectados.
- **Qué debe verse:** Banner de advertencia con texto explícito ("Contraseña incorrecta o verifica tus datos", "No existe una cuenta asociada a este correo" u "Ocurrió un problema / Reintentar").
- **Qué debe comprobarse:** Manejo seguro de excepciones que impide el bloqueo del sistema, evita la fuga de trazas técnicas al usuario y orienta sobre la acción a seguir.
- **Ubicación en el documento:** Sección 5, subapartado Evidencia 6.
- **Nombre sugerido del archivo:** captura_06_manejo_error_cliente.png
```

---

## 6. Referencias al Código Fuente Pertinente

A continuación se presentan los fragmentos de código fuente más significativos de los tres proyectos que respaldan técnicamente los apartados anteriores.

### 6.1. Código de Configuración de Clientes HTTP e Interceptores
- **Archivo de origen:** [LaikaMobil/src/api/config.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/api/config.ts)
- **Demuestra:** Centralización de las URLs base del servicio, configuración de tiempos de espera (`timeout: 10000`) e inyección automática del token Bearer obtenido desde el almacenamiento seguro mediante interceptores de Axios.

```typescript
// LaikaMobil/src/api/config.ts (Líneas 26-62)
export const PILGRIM_API_URL = getApiUrl(process.env.EXPO_PUBLIC_PILGRIM_API_URL, 'EXPO_PUBLIC_PILGRIM_API_URL');
export const USER_API_URL = getApiUrl(process.env.EXPO_PUBLIC_USER_API_URL, 'EXPO_PUBLIC_USER_API_URL');

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenService.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
}
```

### 6.2. Código de Consumo de Datos y Normalización de Respuestas
- **Archivo de origen:** [LaikaMobil/src/services/EventService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/EventService.ts)
- **Demuestra:** Petición HTTP `GET` al endpoint `/events/public`, resolución de rutas absolutas para imágenes y transformación de datos para corregir problemas de codificación mediante `fixMojibake`.

```typescript
// LaikaMobil/src/services/EventService.ts (Líneas 33-64)
export const EventService = {
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await pilgrimApi.get('/events/public', { params: { limit: 100 } });
      const baseUrl = PILGRIM_API_URL.replace('/api/v1', '').replace('/api', '');

      return response.data.map((item: any) => {
        let imgUrl = item.image_url || undefined;
        if (imgUrl && imgUrl.startsWith('/')) {
          imgUrl = `${baseUrl}${imgUrl}`;
        }

        return {
          id: item.id?.toString() || Math.random().toString(),
          title: item.name || item.title || 'Evento sin nombre',
          description: item.description || 'Sin descripción',
          date: item.event_date || item.date || '',
          location: fixMojibake((item.municipality_name && item.state_name) 
            ? `${item.municipality_name}, ${item.state_name}` 
            : (item.venue_name || item.location || 'Ubicación desconocida')),
          category: item.category || 'general',
          imageUrl: imgUrl,
          status: item.status || 'Activo',
          minPrice: item.min_price || item.price || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching events from Pilgrim API:', error);
      throw error;
    }
  },
};
```

### 6.3. Código de Enrutamiento Asíncrono en API Gateway
- **Archivo de origen:** [pilgrim/routers/public/events.py](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/routers/public/events.py)
- **Demuestra:** Enrutamiento inverso transparente en FastAPI hacia el microservicio interno en Java, activando la política de caché pública para optimizar las consultas recurrentes.

```python
# pilgrim/routers/public/events.py (Líneas 11-17)
@router.api_route("/api/events", methods=["GET", "POST"])
@router.api_route("/api/events/{sub_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def events_proxy(request: Request, sub_path: str = "") -> Response:
    """Enruta eventos, activando caché pública cuando corresponda."""
    target_path = f"/{sub_path}" if sub_path else ""
    is_cacheable = "public" in sub_path
    return await proxy_request(request, SERVICES["events"], target_path, cacheable=is_cacheable)
```

### 6.4. Código de Envío Transaccional y Emisión de Boletos
- **Archivo de origen:** [microservices2/tickets/.../TicketController.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/tickets/src/main/java/com/laikaclub/tickets/controller/TicketController.java)
- **Demuestra:** Recepción de la solicitud `POST /purchase` en Spring Boot, validación del principal autenticado y delegación al servicio transaccional.

```java
// microservices2/tickets/src/main/java/com/laikaclub/tickets/controller/TicketController.java (Líneas 122-126)
@PostMapping("/purchase")
public List<Map<String, Object>> purchase(@RequestBody TicketPurchase data,
                                          @AuthenticationPrincipal UserPrincipal user) {
    return ticketService.purchaseTickets(user.getId(), data.getItems(), data.getPaymentMethod());
}
```

- **Archivo de origen:** [microservices2/tickets/.../TicketService.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/tickets/src/main/java/com/laikaclub/tickets/service/TicketService.java)
- **Demuestra:** Control de concurrencia para evitar doble asignación de butacas, generación de código criptográfico y persistencia en MySQL.

```java
// microservices2/tickets/src/main/java/com/laikaclub/tickets/service/TicketService.java (Líneas 248-265)
ticket = new Ticket();
ticket.setUserId(userId);
ticket.setEventId(eid);
ticket.setTicketCode(uniqueCode);
ticket.setQrData(uniqueCode);
ticket.setStatus("active");
ticket.setPurchaseDate(now);
ticket.setSeatId(seat);
ticket.setSectionName(section);
ticket.setPrice(price);
ticket.setPaymentMethod(paymentMethod);
ticket.setEventFunctionId(fid);

ticketRepository.save(ticket);
```

### 6.5. Código de Autenticación, Hashing BCrypt y Anti-Fuerza Bruta
- **Archivo de origen:** [microservices2/auth/.../AuthService.java](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/microservices2/auth/src/main/java/com/laikaclub/auth/service/AuthService.java)
- **Demuestra:** Comparación de contraseñas mediante `passwordEncoder.matches`, política de bloqueo tras 3 intentos fallidos y generación de token de acceso.

```java
// microservices2/auth/src/main/java/com/laikaclub/auth/service/AuthService.java (Líneas 98-150)
if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
    if (!"admin".equalsIgnoreCase(user.getRole())) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);
        
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            LocalDateTime lockoutEnd = LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES);
            user.setLockoutUntil(lockoutEnd.format(formatter));
            user.setStatus("blocked");
            userRepository.save(user);
            throw new AccountLockedException("Cuenta bloqueada temporalmente", LOCKOUT_DURATION_MINUTES * 60);
        } else {
            userRepository.save(user);
            throw new InvalidCredentialsException("Credenciales inválidas", attempts, MAX_FAILED_ATTEMPTS);
        }
    }
}

// Login Exitoso: Restablecimiento de contadores y generación de JWT
user.setFailedAttempts(0);
user.setLockoutUntil(null);
user.setLastLogin(LocalDateTime.now().format(formatter));
userRepository.save(user);

String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
return new TokenResponse(token, UserMapper.toLoginProfileResponse(user));
```

### 6.6. Código de Almacenamiento Cifrado de Credenciales en el Dispositivo
- **Archivo de origen:** [LaikaMobil/src/store/AuthStore.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/store/AuthStore.ts)
- **Demuestra:** Segregación de almacenamiento entre datos públicos (`AsyncStorage`) y credenciales confidenciales (`SecureStore`), así como el vaciado seguro en el cierre de sesión.

```typescript
// LaikaMobil/src/store/AuthStore.ts (Líneas 42-72)
export const setCurrentUser = async (user: any, token?: string) => {
  currentUser = user;
  if (token) currentToken = token;
  
  try {
    if (user && currentToken) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await SecureStore.setItemAsync('token', currentToken);
      NotificationService.setupPushToken(user.id);
    }
  } catch (e) {
    console.error('Error saving session', e);
  }
  listeners.forEach(l => l());
};

export const logout = async () => {
  currentUser = null;
  currentToken = null;
  try {
    await AsyncStorage.removeItem('user');
    await SecureStore.deleteItemAsync('token');
    await NotificationService.clearPushToken();
  } catch (e) {}
  listeners.forEach(l => l());
};
```
