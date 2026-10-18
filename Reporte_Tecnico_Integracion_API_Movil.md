# UNIVERSIDAD TECNOLÓGICA DEL VALLE DE TOLUCA
## DIRECCIÓN DE CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN
### INGENIERÍA EN DESARROLLO Y GESTIÓN DE SOFTWARE

---

# REPORTE TÉCNICO DE AUDITORÍA Y EVALUACIÓN DE INTEGRACIÓN DE API REST EN APLICACIÓN MÓVIL
**Actividad:** Integración de servicios remotos, consumo de datos, envío de información y mecanismos de autenticación en LaikaMobil  

| Metadato Académico | Información Comprobada / Estado |
|---|---|
| **Proyecto Auditado:** | LaikaMobil (Cliente Móvil del Ecosistema LAIKA Club) |
| **Asignatura:** | `[PENDIENTE: Nombre oficial de la asignatura / Integración de Seguridad y Móvil]` |
| **Docente Evaluador:** | `[PENDIENTE: Nombre del docente evaluador]` |
| **Integrantes Identificados:** | Kms_Bismarck003 (`jreyes6458@gmail.com`)<br>Dayan (`al222310493@gmail.com`)<br>`[PENDIENTE: Confirmación formal de nombres completos y matrículas]` |
| **Grupo y Cuatrimestre:** | `[PENDIENTE: Grupo y cuatrimestre académico]` |
| **Rol del Auditor:** | Ingeniero de Software Senior, Auditor Técnico y Analista de Sistemas |
| **Fecha de Auditoría:** | Octubre de 2026 |

---

> [!NOTE]
> **DECLARACIÓN DE INTEGRIDAD TÉCNICA (HONESTIDAD TÉCNICA):**  
> El presente documento técnico ha sido elaborado exclusivamente a partir de la inspección directa del código fuente, dependencias reales (`package.json`, `pom.xml`, `requirements.txt`), archivos de configuración de red (`.env`, `src/api/config.ts`) y la arquitectura de microservicios alojada en el repositorio. No se inventaron endpoints, servicios en la nube, respuestas JSON ficticias, credenciales ni capturas de pantalla. Aquellas operaciones programadas pero cuyos servicios backend no se encontraban en ejecución durante la auditoría se catalogan rigurosamente como *Implementado en código, pendiente de verificación en ejecución*.

---

## 1. Introducción

En el desarrollo contemporáneo de soluciones de software móvil, la interacción con servicios remotos y arquitecturas distribuidas basadas en APIs REST representa uno de los pilares funcionales más críticos. Las aplicaciones cliente en dispositivos móviles no operan como silos aislados de información, sino como interfaces ricas de presentación y captura de datos que delegan el procesamiento transaccional, las reglas de negocio complejas y la persistencia a capas de backend especializadas.

El presente informe documenta la auditoría técnica exhaustiva practicada sobre el proyecto de software móvil **LaikaMobil**, el cual se encuentra alojado en el entorno de desarrollo como subsistema móvil de la plataforma integral **LAIKA Club**. LaikaMobil es una aplicación diseñada para la cartelera de espectáculos, adquisición de boletaje digital y custodia segura de accesos con códigos QR dinámicos, construida mediante el framework React Native y la plataforma Expo.

Bajo una perspectiva rigurosa de Ingeniería en Desarrollo y Gestión de Software, este documento analiza cómo el código fuente de LaikaMobil da cumplimiento a los requisitos académicos de integración con servicios remotos, abordando específicamente el consumo de datos mediante peticiones `GET`, el envío estructurado de cargas transaccionales mediante peticiones `POST` y la arquitectura de autenticación remota con emisión y almacenamiento seguro de credenciales JWT. Siguiendo un principio estricto de honestidad técnica, se documentan con precisión los componentes efectivamente programados, los puntos de conexión reales, las dependencias comprobables y las limitaciones operativas encontradas.

---

## 2. Objetivo

El objetivo primordial de esta actividad académica consiste en auditar, evaluar y documentar la integración técnica entre la aplicación móvil LaikaMobil y los servicios remotos del backend, evidenciando los flujos de consumo de datos, envío transaccional y autenticación segura.

Para lograr este propósito, se delimita claramente la diferencia entre el objetivo académico previsto y los resultados concretos obtenidos en la inspección del sistema:

- **Objetivo Académico Formativo:** Demostrar que el estudiante comprende e implementa el ciclo de vida completo de la comunicación cliente-servidor en una aplicación móvil, incluyendo la construcción de peticiones HTTP asíncronas, el tratamiento de códigos de estado, el manejo de respuestas en formato JSON, la gestión de sesiones mediante tokens criptográficos y la formulación de interfaces reactivas ante fallos de conectividad.
- **Resultados Comprobados en la Auditoría:** Se confirmó la existencia de una arquitectura de servicios desacoplada y modular (`src/api`, `src/services`, `src/store`). Las operaciones clave de consumo (catálogo de eventos), envío (compra de boletos e intenciones de pago) y autenticación (login con persistencia cifrada mediante `expo-secure-store`) están completamente programadas a nivel de código. No obstante, al momento de la auditoría, los servicios backend en el entorno local se encontraban en reposo (puertos 8000, 8101, 8201 y 8202 cerrados), por lo que el estado de los requisitos se clasifica con honestidad como **Implementado en código, pendiente de verificación en ejecución**.

---

## 3. Descripción general del sistema

### 3.1. Naturaleza y Propósito de la Aplicación
LaikaMobil es una aplicación móvil corporativa orientada al usuario final que permite explorar eventos masivos (conciertos, obras de teatro, festivales y deportes), consultar detalles de recintos, reservar y adquirir boletos mediante una pasarela de pagos integrada, y almacenar los pases digitales en un casillero virtual protegido por biometría para su posterior validación en taquilla.

### 3.2. Stack Tecnológico del Cliente Móvil
A través de la inspección de los archivos de manifiesto [package.json](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/package.json) y [app.json](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/app.json), se verificó la siguiente pila tecnológica activa en el cliente móvil:
- **Framework Base:** React Native v0.86.3 bajo Expo Managed Workflow v57.0.26.
- **Lenguaje de Programación:** TypeScript v6.0.3 con React v19.2.3.
- **Enrutamiento y Navegación:** React Navigation v7 (implementando `@react-navigation/native-stack` y `@react-navigation/bottom-tabs`).
- **Cliente de Comunicaciones HTTP:** Axios v1.20.0, complementado con interceptores personalizados de petición y respuesta.
- **Almacenamiento Local y Cifrado:** Dualidad de persistencia compuesta por `@react-native-async-storage/async-storage` (datos públicos y caché offline) y `expo-secure-store` (tokens de autenticación cifrados en Keystore/Keychain).
- **Seguridad Periférica y Biometría:** `expo-local-authentication` v57.0.3 para autenticación biométrica (FaceID/Fingerprint) y PIN nativo.

### 3.3. Arquitectura del Backend y Relación de Servicios
El ecosistema de LAIKA Club implementa una arquitectura orientada a microservicios con un API Gateway centralizado que sirve de punto único de entrada para todas las aplicaciones clientes (panel web de administración, terminal de gestores, terminal de operadores y la aplicación móvil LaikaMobil):

1. **API Gateway (Pilgrim):** Desarrollado en Python con el framework asíncrono FastAPI (v2.0.0), localizado en la carpeta [pilgrim/](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/pilgrim/). Escucha por defecto en el puerto `8000`. Actúa como proxy inverso asíncrono que recibe las peticiones de LaikaMobil bajo el prefijo `/api/` y las enruta internamente hacia los microservicios Java especializados.
2. **Microservicio de Autenticación (Auth Service):** Desarrollado en Java 17 con Spring Boot 3.2.5 (localizado en `microservices2/auth/`), operando en el puerto `8101`. Administra el registro, inicio de sesión, validación de credenciales en base de datos MySQL y emisión de tokens JWT.
3. **Microservicio de Eventos (Events Service):** Desarrollado en Spring Boot (localizado en `microservices2/events/`), operando en el puerto `8201`. Provee los endpoints de cartelera pública (`/public`), recintos (`/venues`) y detalle de eventos.
4. **Microservicio de Boletos y Pagos (Tickets Service):** Desarrollado en Spring Boot (localizado en `microservices2/tickets/`), operando en el puerto `8202`. Procesa la reserva de asientos (`/lock`), la compra definitiva (`/purchase`), las intenciones de pago (`/payments/create-intent`) y la consulta de boletos de usuario (`/my-tickets`).
5. **Persistencia Centralizada:** Base de datos relacional MySQL (`laika_club`).

```
+-------------------------------------------------------------------------+
|                    APLICACIÓN MÓVIL (LaikaMobil)                        |
|   [Screens: Events, Cart, Login] ---> [Services: Event, Ticket, Auth]   |
|                          | (Axios Client)                               |
+--------------------------|----------------------------------------------+
                           | HTTP (JSON / Bearer Token)
                           v Base URL: http://192.168.1.7:8000/api
+-------------------------------------------------------------------------+
|                     PILGRIM API GATEWAY (FastAPI)                       |
|                 Enrutamiento por Dominio y Políticas                    |
+--------------------+--------------------+-------------------------------+
                     |                    |                               |
        /api/auth/*  |      /api/events/* |           /api/tickets/*      |
                     v                    v           /api/payments/*     v
         +------------------+   +------------------+   +------------------+
         |   Auth Service   |   |  Events Service  |   | Tickets Service  |
         |   Spring Boot    |   |   Spring Boot    |   |   Spring Boot    |
         |   Puerto 8101    |   |   Puerto 8201    |   |   Puerto 8202    |
         +--------+---------+   +--------+---------+   +--------+---------+
                  |                      |                      |
                  +----------------------+----------------------+
                                         v
                            Base de Datos MySQL (laika_club)
```

### 3.4. Configuración de Red y Variables de Entorno
La configuración de conectividad se encuentra centralizada en el archivo [.env](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/.env) en la raíz de `LaikaMobil/` y es consumida por el módulo [config.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/api/config.ts):

```properties
EXPO_PUBLIC_PILGRIM_API_URL=http://192.168.1.7:8000/api
EXPO_PUBLIC_USER_API_URL=http://192.168.1.7:8101
```

En `src/api/config.ts`, la clase `HttpClient` inicializa las instancias de Axios (`pilgrimApiClient` y `userApiClient`), configurando un timeout de 10,000 ms, cabeceras estándar `'Content-Type': 'application/json'`, y un interceptor de peticiones que inyecta automáticamente el token de acceso obtenido desde `tokenService.getAccessToken()` como encabezado `Authorization: Bearer <token>`.

---

## 4. Parte 1: Consumo de datos remotos

### 4.1. Descripción de la Funcionalidad
El módulo de consumo de datos remotos permite a los usuarios consultar en tiempo real la cartelera de eventos disponibles, examinar la información detallada de cada función (título, descripción, fecha, ubicación, precio base y galería fotográfica) y, una vez autenticados, sincronizar su listado personal de boletos adquiridos.

### 4.2. Especificación del Endpoint y Servicio
- **API Utilizada:** Pilgrim API Gateway (enrutado hacia el microservicio `laika-events`).
- **URL Base:** `http://192.168.1.7:8000/api`
- **Endpoints de Consulta Identificados:**
  1. `GET /events/public?limit=100` (Consulta pública de cartelera de eventos).
  2. `GET /events/{id}` (Consulta detallada de un evento particular).
  3. `GET /tickets/my-tickets` (Consulta privada de boletos del usuario autenticado; requiere Bearer token).
- **Archivos de Origen:** [EventService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/EventService.ts), [useEvents.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/hooks/useEvents.ts), [TicketService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/TicketService.ts).
- **Pantallas de Presentación:** [EventsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventsScreen.tsx), [EventDetailScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/EventDetailScreen.tsx), [MyTicketsScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/MyTicketsScreen.tsx).

### 4.3. Flujo de Solicitud y Procesamiento de Datos
Al montarse el componente `EventsScreen`, se activa el hook personalizado `useEvents()` mediante un efecto `useEffect`. Este hook invoca de manera asíncrona la función `EventService.getEvents()`:

1. **Solicitud HTTP:** Se emite una petición GET hacia `http://192.168.1.7:8000/api/events/public?limit=100`.
2. **Transformación en Cliente:** La respuesta cruda en JSON es recibida y transformada en `EventService.ts`. El servicio ejecuta tres operaciones de normalización crítica:
   - **Resolución de URLs de imágenes relativas:** Si `item.image_url` inicia con `/`, se concatena automáticamente con la URL base del gateway para formar una URL absoluta accesible por los componentes `<Image>`.
   - **Saneamiento de Mojibake (`fixMojibake`):** Función preventiva que repara caracteres con problemas de codificación UTF-8 en nombres de municipios y estados mexicanos (por ejemplo, corrigiendo cadenas como `M├®xico` a `México`).
   - **Mapeo de campos flexibles:** Admite variaciones en la respuesta del backend como `item.name || item.title` y `item.min_price || item.price`.
3. **Filtrado y Estado Local:** El hook `useEvents` extrae el catálogo único de ubicaciones disponibles y aplica filtros reactivos en memoria (por categoría, fecha y ubicación) sin necesidad de saturar la red con peticiones redundantes.
4. **Caché Offline en Boletos:** En el caso de `TicketService.getMyTickets`, al completarse la petición GET `/tickets/my-tickets`, los datos son almacenados en `AsyncStorage` bajo la clave `@tickets_cache_{userId}`. Si el usuario pierde la conectividad posteriormente, la aplicación recupera y despliega automáticamente los boletos en caché.

### 4.4. Manejo de Errores y Estados de Interfaz
La interfaz en `EventsScreen.tsx` cuenta con un control integral de estados:
- **Estado de Carga:** Mientras `loading` es verdadero y no hay eventos en memoria, se presenta un `ActivityIndicator` centralizado.
- **Control de Refresco:** Se integra `RefreshControl` para permitir la actualización manual "pull-to-refresh" invocando `refetch()`.
- **Estado Sin Red / Servidor Caído:** Se evalúa si el error contiene `'Network Error'` o si `isOffline` es verdadero mediante el hook `useNetworkStatus()`. En dicho escenario, se renderiza la vista especializada `OfflineStateView`, evitando bloqueos indefinidos.
- **Estado Vacío:** Si la categoría seleccionada no arroja resultados, `ListEmptyComponent` muestra el mensaje *"No hay eventos disponibles en esta categoría."*

### 4.5. Fragmento de Código Real
```typescript
// src/services/EventService.ts (Líneas 34-59)
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
  // ...
```

> [!IMPORTANT]
> **Estado de Cumplimiento:** **Implementado en código, pendiente de verificación en ejecución.**  
> El código del cliente Axios, el mapeo de datos y el manejo de estados de interfaz están completamente implementados. La prueba en vivo requiere el arranque de los servicios backend.

---

## 5. Parte 2: Envío de datos al servicio remoto

### 5.1. Descripción de la Funcionalidad
El módulo de envío de datos gestiona el proceso transaccional de compra y reserva de boletos desde la pantalla del carrito ([CartScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/CartScreen.tsx)). La funcionalidad involucra la selección de métodos de pago, la generación de intenciones de cobro, la autorización mediante biometría y la confirmación final de la orden en el microservicio de tickets.

### 5.2. Especificación de Endpoints y Métodos HTTP
- **API Utilizada:** Pilgrim API Gateway (enrutado hacia el microservicio `laika-tickets`).
- **Operaciones Identificadas:**
  1. `POST /api/payments/create-intent` (Genera una referencia de pago con monto y moneda).
  2. `POST /api/payments/{paymentId}/confirm` (Confirma la transacción de cobro).
  3. `POST /api/tickets/purchase` (Registra formalmente los boletos a nombre del usuario en el sistema).
- **Archivos de Origen:** [PaymentService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/PaymentService.ts), [TicketService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/TicketService.ts), [CartScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/CartScreen.tsx).

### 5.3. Estructura Real del Payload Enviado
A partir de la inspección del método `handlePayment` en `CartScreen.tsx` (líneas 128-152) y del DTO `TicketPurchase` en el backend Java, se verificó la estructura real del cuerpo JSON emitido al endpoint `/tickets/purchase`:

```json
{
  "user_id": "usr_88291",
  "items": [
    {
      "eventId": "14",
      "quantity": 1,
      "functionId": null,
      "sectionId": null,
      "sectionName": "General",
      "price": 350.00,
      "seatId": null
    }
  ],
  "paymentMethod": "card",
  "paymentId": "pi_1728945612345",
  "idempotencyKey": "idem_1728945612000_k3x9q2p8m",
  "shippingInfo": null,
  "shippingMethod": "digital"
}
```

### 5.4. Validaciones Previas y Mecanismo Anti-Fallos
Antes de realizar cualquier transmisión por red, `CartScreen.tsx` ejecuta rigurosos controles client-side:
1. **Validación de Sesión:** Si no existe un usuario autenticado (`!user`), la pantalla sustituye el contenido por `UnauthenticatedView`, exigiendo iniciar sesión.
2. **Validación de Conectividad:** Si el hook `useNetworkStatus()` detecta que el dispositivo está sin red (`isOffline`), se bloquea el botón y se emite una alerta indicando que los lugares siguen en reserva temporal.
3. **Temporizador de Reserva (Lock Timeout):** Se inicializa una cuenta regresiva de 3 minutos (180 segundos). Si el temporizador expira antes de pagar, los lugares se liberan automáticamente y la pantalla redirige al usuario fuera del flujo.
4. **Clave de Idempotencia:** Se genera una clave única (`idempotencyKey`) calculada con marca de tiempo y cadena aleatoria en `useRef`, garantizando que ante interrupciones de red o reintentos no se efectúe un cobro duplicado.
5. **Autorización Biométrica Obligatoria:** Antes de enviar la transacción, se invoca `LocalAuthentication.authenticateAsync()`. Si el dispositivo cuenta con hardware biométrico, el usuario debe autorizar con su huella, rostro o PIN del sistema.

### 5.5. Manejo de Respuesta y Fallback Identificado
- **Flujo Exitoso:** Al recibir confirmación positiva del backend, `CartScreen.tsx` navega a `SuccessScreen.tsx`, pasando como parámetros el nombre del usuario, título del evento, fecha y cantidad de boletos emitidos.
- **Manejo de Errores:** En caso de rechazo del backend (por ejemplo, fondos insuficientes o asientos no disponibles), el bloque `catch` extrae el detalle con `error.response?.data?.detail || error.message` y presenta un cuadro de diálogo nativo mediante `Alert.alert('Error', ...)`.
- **Identificación Honesta de Comportamiento Simulado (Mock de Métodos de Pago):** La auditoría detectó que en `src/services/PaymentService.ts` (líneas 37-45), la función `getSavedMethods` intenta realizar una petición GET a `/users/${userId}/payment-methods`. Si esta llamada arroja un error de red o de endpoint inexistente, el código captura la excepción y retorna un arreglo estático de tarjetas simuladas (Visa terminada en 4242 y MasterCard en 5555). Esto asegura que la pasarela no se congele durante pruebas de desarrollo, pero constituye un mecanismo simulado que debe documentarse con total transparencia.

### 5.6. Fragmento de Código Real
```typescript
// src/screens/CartScreen.tsx (Líneas 141-166)
// REGISTRO REAL DEL BOLETO EN LA CUENTA DEL USUARIO
if (!user) {
  throw new Error('Debes iniciar sesión para comprar.');
}
await TicketService.purchaseTicket(user.id, {
  items: purchaseItems,
  paymentMethod: selectedMethodId === 'new' ? 'card' : 'card',
  paymentId: intentResponse.paymentId || `pi_${Date.now()}`,
  idempotencyKey: idempotencyKey.current, // Evitamos doble cobro si se reconecta
  shippingInfo: null,
  shippingMethod: 'digital'
});

navigation.navigate('Success', {
  userName,
  eventTitle: eventPreview.title,
  eventDate: eventPreview.date,
  quantity: eventPreview.quantity
});
} catch (error: any) {
  console.error(error);
  const detail = error.response?.data?.detail || error.message;
  Alert.alert('Error', `Hubo un problema al procesar tu pago: ${detail}`);
} finally {
  setLoading(false);
}
```

> [!WARNING]
> **Estado de Cumplimiento:** **Implementado en código, parcialmente simulado en métodos de pago (fallback), pendiente de verificación en ejecución.**  
> El flujo de envío POST hacia `/tickets/purchase` y `/payments` está completamente codificado, incorporando clave de idempotencia y biometría previa. Existe un fallback de métodos de pago simulados ante fallas del servidor.

---

## 6. Parte 3: Autenticación remota

### 6.1. Descripción del Mecanismo
El sistema de autenticación de LaikaMobil opera bajo un esquema de tokens desacoplados. La aplicación no valida contraseñas de forma local ni contra archivos estáticos; delega la verificación al microservicio de autenticación de LAIKA Club a través de peticiones HTTP POST, recibiendo un token de acceso criptográfico (JWT) y el perfil del usuario para inicializar la sesión.

### 6.2. Pantallas y Controles de Interfaz
La autenticación se realiza principalmente a través de [LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx) (con soporte complementario para alta de cuentas en [RegisterScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/RegisterScreen.tsx)). La pantalla de inicio de sesión provee:
- **Campo de Correo Electrónico:** `TextInput` con teclado `keyboardType='email-address'`, `autoCapitalize='none'` y texto de marcador de posición.
- **Campo de Contraseña:** `TextInput` configurado con la propiedad nativa `secureTextEntry={!showPassword}`.
- **Control de Visibilidad:** Un botón táctil con icono interactivo (`Ionicons` con estados `'eye'` y `'eye-off'`) que permite al usuario alternar entre ocultar y mostrar la contraseña introducida.
- **Botón de Envío:** Deshabilitado reactivamente si los campos están incompletos o mientras una solicitud de red se encuentra en curso (`loading`).

### 6.3. Especificación del Endpoint y Servicio de Autenticación
- **API Utilizada:** Pilgrim API Gateway (enrutado a `microservices2/auth`).
- **Endpoint de Autenticación:** `POST /api/auth/login`.
- **Endpoint de Registro:** `POST /api/auth/register`.
- **Endpoint de Verificación de Sesión:** `GET /api/auth/users/me` (o `/verify`).
- **Archivos de Origen:** [AuthService.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/services/AuthService.ts), [LoginScreen.tsx](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/screens/LoginScreen.tsx), [AuthStore.ts](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/LaikaMobil/src/store/AuthStore.ts).

### 6.4. Validaciones en el Cliente (Client-Side)
En `LoginScreen.tsx`, antes de iniciar la llamada de red, se ejecuta la función `validateInputs()`:
- **Validación Sintáctica de Email:** Se evalúa mediante la expresión regular `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Si no cumple el patrón, se rechaza inmediatamente con el mensaje: *"Por favor, ingresa un correo electrónico válido."*
- **Longitud Mínima de Contraseña:** Se exige un mínimo de 6 caracteres (`password.length < 6`), alertando: *"La contraseña debe tener al menos 6 caracteres."*
- En `RegisterScreen.tsx`, se eleva la exigencia a 8 caracteres mínimos y se valida la coincidencia obligatoria entre `password` y `confirmPassword`.

### 6.5. Procesamiento de la Respuesta y Almacenamiento Seguro
Al emitirse la petición `AuthService.login(email, password)` hacia el backend Java:
1. **Respuesta Exitosa:** El backend retorna un objeto JSON correspondiente al DTO `TokenResponse` conteniendo `token` (o `access_token`) y el objeto `user` (con campos `id`, `email`, `role`, `username`).
2. **Persistencia en Almacenamiento Seguro:** Se invoca la función `setCurrentUser(user, token)` definida en `src/store/AuthStore.ts`. Aquí se implementa una distinción estricta de seguridad:
   - El **Token JWT** se almacena exclusivamente en `expo-secure-store` mediante `SecureStore.setItemAsync('token', currentToken)`, quedando cifrado a nivel de hardware por el Keystore de Android o el Keychain de iOS.
   - La información pública del perfil (nombre, correo) se persiste en `AsyncStorage.setItem('user', ...)` para rápida hidratación visual.
3. **Control de Acceso por Roles (RBAC):** `LoginScreen.tsx` comprueba que el rol del usuario corresponda a `'usuario'` o `'user'`. Si una cuenta con rol administrativo u operador intenta acceder por el cliente móvil, el sistema deniega el acceso con el mensaje: *"Tu cuenta no tiene permisos para comprar boletos."*

### 6.6. Manejo de Credenciales Incorrectas y Errores
En `AuthService.ts` (líneas 16-34), el bloque `catch` intercepta los errores del servidor y analiza el mensaje de detalle (`error.response?.data?.detail`):
- **Usuario Inexistente:** Si el detalle contiene `'not found'`, `'no user'` o `'does not exist'`, se mapea a un mensaje amigable: *"No existe una cuenta asociada a este correo. ¡Regístrate!"*
- **Contraseña Inválida:** Si el detalle contiene `'password'`, `'credential'` o `'incorrect'`, se notifica: *"Contraseña incorrecta o verifica tus datos."*
- **Error Genérico o Caída de Red:** Se devuelve el mensaje genérico o se captura la excepción en `LoginScreen.tsx` para mostrar un recuadro de alerta con fondo rojo tenue (`styles.errorContainer`).

### 6.7. Tratamiento del Campo de Contraseña Tras el Envío (Hallazgo de Auditoría)
Un requerimiento esencial de la práctica consiste en verificar el comportamiento del campo de contraseña tras el intento de autenticación:
- **Ocultamiento en Pantalla:** Cumple satisfactoriamente. El texto se oculta con viñetas nativas mediante `secureTextEntry={!showPassword}` durante toda la interacción del usuario.
- **Limpieza del Estado (Vulnerabilidad Menor Identificada):** La inspección del código fuente reveló que la función `handleLogin` en `LoginScreen.tsx` **NO** invoca `setPassword('')` tras producirse un error de autenticación ni tras el éxito. Por consiguiente, la cadena de la contraseña permanece en la variable de estado en memoria del componente hasta que la vista se desmonta o el usuario la borra manualmente. Se recomienda formalmente añadir la instrucción `setPassword('')` dentro del bloque `finally` o al detectar un fallo de credenciales para maximizar la privacidad en pantalla.

### 6.8. Fragmento de Código Real
```typescript
// src/services/AuthService.ts (Líneas 11-35)
export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.warn('Error in login');
      
      const detail = error.response?.data?.detail;
      let errorMessage = 'No cuentas con una cuenta registrada o verifica tus datos.';
      
      if (typeof detail === 'string') {
        const lowerDetail = detail.toLowerCase();
        if (lowerDetail.includes('not found') || lowerDetail.includes('no user') || lowerDetail.includes('does not exist')) {
          errorMessage = 'No existe una cuenta asociada a este correo. ¡Regístrate!';
        } else if (lowerDetail.includes('password') || lowerDetail.includes('credential') || lowerDetail.includes('incorrect')) {
          errorMessage = 'Contraseña incorrecta o verifica tus datos.';
        } else {
          errorMessage = detail;
        }
      }
      throw new Error(errorMessage);
    }
  },
  // ...
```

> [!IMPORTANT]
> **Estado de Cumplimiento:** **Implementado en código, pendiente de verificación en ejecución.**  
> El mecanismo de autenticación remota está completamente programado contra el endpoint real de autenticación. El token se protege con `expo-secure-store`. Se observó que el campo de contraseña no se borra automáticamente tras error.

---

## 7. Manejo de errores y seguridad

### 7.1. Medidas de Seguridad Comprobadas
A partir de la auditoría técnica exhaustiva del repositorio, se identificaron y verificaron las siguientes medidas de seguridad activas en el código:
1. **Almacenamiento Cifrado de Credenciales (`expo-secure-store`):** Se sustituyó el uso inseguro de `AsyncStorage` para tokens JWT. `TokenService.ts` y `AuthStore.ts` utilizan los métodos asíncronos de `expo-secure-store` que interactúan directamente con el Android Keystore y el Apple Keychain (CWE-922).
2. **Autenticación Biométrica y Protección en Profundidad:** Se comprobó en `CartScreen.tsx` (líneas 100-114) y en `MyTicketsScreen.tsx` (líneas 63-72) el uso de `expo-local-authentication` para exigir validación por huella, rostro o PIN antes de desplegar boletos adquiridos o autorizar cargos.
3. **Prevención de Fugas de Información en Logs (Privacy Hardening):** En `AuthService.ts` y `UserService.ts` se erradicaron las llamadas a `console.error(error.response?.data)`. En su lugar, se utilizan avisos estáticos genéricos (`console.warn('Error in login')`), evitando que payloads sensibles o estructuras internas del servidor queden expuestas en los volcados de depuración del dispositivo móvil.
4. **Validación de Entradas Client-Side:** En `LoginScreen.tsx` y `RegisterScreen.tsx`, las expresiones regulares y los controles de longitud filtran cadenas maliciosas o malformadas antes de emitir solicitudes a la red.
5. **Claves de Idempotencia:** Uso de identificadores únicos en transacciones financieras (`idempotencyKey`) para prevenir duplicación de compras ante reconexiones inestables.

### 7.2. Limitaciones de Seguridad y Riesgos Observados
Siguiendo el principio de rigor técnico, se documentan las siguientes limitaciones comprobadas en la configuración del proyecto:
1. **Ausencia de Cifrado en Tránsito (Protocolo HTTP en Texto Plano):** La variable `EXPO_PUBLIC_PILGRIM_API_URL` configurada en `.env` establece el protocolo inseguro `http://192.168.1.7:8000/api`. En una red Wi-Fi compartida, las credenciales y los tokens transmitidos sin TLS son vulnerables a intercepción por ataques de tipo Man-In-The-Middle (MitM).
2. **Certificate Pinning Simulado / No Operativo:** El archivo `src/services/security/SSLPinningService.ts` implementa únicamente una simulación conceptual con hashes ficticios (`sha256/XXXX...`) y una salida informativa por consola (`console.log('[Security] SSL Pinning configuration initialized...')`). No existe un enlace nativo que fuerce la validación de certificados X.509 en el stack de red.
3. **Exposición de IP de Red Local en Archivo de Entorno:** El archivo `.env` se encuentra rastreado en el repositorio con la IP privada de desarrollo (`192.168.1.7`), lo cual expone información sobre la topología de la red interna del equipo.
4. **Retención de Contraseña en Estado Local:** Tras un error en el inicio de sesión, el texto de la contraseña permanece en el hook `useState`, lo que podría permitir su extracción si la memoria del componente es inspeccionada en depuración.

---

## 8. Ficha técnica de integración

| Campo | Información Comprobada |
|---|---|
| **Nombre del proyecto** | LaikaMobil (Subsistema Móvil de LAIKA Club) |
| **Integrantes** | Kms_Bismarck003 (`jreyes6458@gmail.com`)<br>Dayan (`al222310493@gmail.com`)<br>`[PENDIENTE: Nombres completos y matrículas oficiales]` |
| **Tecnología móvil** | React Native 0.86.3 / Expo 57.0.26 / TypeScript 6.0.3 |
| **Servicio utilizado (URL/API)** | Pilgrim API Gateway (FastAPI): `http://192.168.1.7:8000/api`<br>User API (Spring Boot): `http://192.168.1.7:8101` |
| **Endpoint de consulta (método HTTP)** | `GET /events/public?limit=100` (Cartelera pública)<br>`GET /events/{id}` (Detalle de evento)<br>`GET /tickets/my-tickets` (Boletos de usuario con Bearer token) |
| **Endpoint de envío (método HTTP)** | `POST /tickets/purchase` (Registro de boletos adquiridos)<br>`POST /payments/create-intent` (Creación de intención de cobro)<br>`POST /payments/{id}/confirm` (Confirmación de pago) |
| **Endpoint de autenticación** | `POST /auth/login` (Autenticación principal)<br>`POST /auth/register` (Alta de nuevos usuarios)<br>`GET /auth/users/me` (Sincronización de perfil de sesión) |
| **Mecanismo de autenticación** | Autenticación remota basada en Bearer Token (JWT), emitido por microservicio Java Auth y almacenado en `expo-secure-store` |
| **Mecanismos de seguridad utilizados** | • `expo-secure-store` (Cifrado de token en Keystore/Keychain)<br>• `expo-local-authentication` (Biometría nativa y PIN)<br>• Validación client-side con expresiones regulares<br>• Desinfección de logs en consola (sin volcado de JSON)<br>• Claves de idempotencia en transacciones |
| **Limitaciones de seguridad identificadas** | • Comunicación en HTTP no cifrado (red local privada)<br>• SSL Pinning simulado (mock conceptual)<br>• Fallback a métodos de pago simulados en `PaymentService`<br>• Retención de contraseña en estado del formulario tras error |
| **Descripción breve de la integración** | La aplicación móvil envía peticiones asíncronas vía Axios al Gateway Pilgrim (FastAPI), el cual enruta el tráfico por dominios hacia los microservicios Java Spring Boot (Auth, Events, Tickets) conectados a MySQL, gestionando sesiones seguras y persistencia offline. |

---

## 9. Evidencias de la actividad

Para acreditar cabalmente el cumplimiento de los tres apartados solicitados en la rúbrica universitaria, el alumno debe recopilar un conjunto de evidencias visuales directas de la aplicación ejecutándose en un dispositivo físico o emulador Android/iOS con los servicios de backend activos. Estas evidencias se estructuran formalmente en la Sección 13 (Plan de Capturas de Pantalla) de este reporte.

---

## 10. Resultados y cumplimiento (Matriz de trazabilidad)

| ID | Requisito Evaluado | Ubicación en Código | Evidencia de Ejecución | Estado | Observaciones Técnicas |
|---|---|---|---|---|---|
| **R01** | Identificar API y servicio remoto | `LaikaMobil/.env`<br>`src/api/config.ts` | Puertos 8000 y 8101 cerrados en auditoría | **Implementado en código, pendiente verificación** | Pilgrim Gateway (FastAPI) y microservicios Spring Boot configurados en 192.168.1.7. |
| **R02** | Realizar consulta HTTP (GET) | `src/services/EventService.ts:36`<br>`src/hooks/useEvents.ts:18` | Pendiente captura E03 | **Implementado en código, pendiente verificación** | Petición Axios GET a `/events/public` con límite de 100 y mapeo de datos. |
| **R03** | Procesar y mostrar datos remotos | `src/screens/EventsScreen.tsx`<br>`src/components/EventCard.tsx` | Pendiente captura E03 | **Implementado en código, pendiente verificación** | Renderizado reactivo en `FlatList`, soporte pull-to-refresh y pantalla `OfflineStateView`. |
| **R04** | Enviar información al servidor (POST) | `src/screens/CartScreen.tsx:145`<br>`src/services/TicketService.ts:78` | Pendiente captura E04 | **Implementado en código, pendiente verificación** | Transmisión de payload transaccional a `/tickets/purchase` con clave de idempotencia. |
| **R05** | Procesar respuesta del envío | `src/screens/CartScreen.tsx:154`<br>`src/screens/SuccessScreen.tsx` | Pendiente captura E05 | **Implementado en código, pendiente verificación** | Navegación a `SuccessScreen` con metadatos de compra; alerta `Alert.alert()` ante errores. |
| **R06** | Autenticación remota de usuarios | `src/services/AuthService.ts:14`<br>`src/store/AuthStore.ts:42` | Pendiente capturas E01 y E02 | **Implementado en código, pendiente verificación** | Petición POST a `/auth/login`, retorno de JWT y persistencia cifrada en `expo-secure-store`. |
| **R07** | Manejo de errores de red y backend | `src/services/AuthService.ts:19`<br>`src/components/ui/OfflineStateView.tsx` | Pendiente captura E06 | **Implementado en código, pendiente verificación** | Mapeo inteligente de mensajes ('no existe cuenta', 'contraseña errónea') y vista sin conexión. |
| **R08** | Proteger la contraseña en pantalla | `src/screens/LoginScreen.tsx:189`<br>`src/screens/RegisterScreen.tsx:194` | Pendiente captura E01 | **Implementado y verificado en código** | Uso de `secureTextEntry={!showPassword}`. Observación: Falta limpiar contraseña tras error. |
| **R09** | Almacenamiento seguro de tokens | `src/store/AuthStore.ts:49`<br>`src/services/security/TokenService.ts` | Verificado en código fuente | **Implementado y verificado en código** | Cifrado nativo de JWT en Keystore/Keychain vía `SecureStore.setItemAsync('token')`. |

---

## 11. Conclusiones

1. **Madurez Arquitectónica:** LaikaMobil exhibe una arquitectura móvil profesional, modular y bien estructurada. La separación en capas de configuración (`api`), servicios de red (`services`), gestión de estado de autenticación (`store`), ganchos reactivos (`hooks`) y vistas (`screens`) previene el acoplamiento y facilita el mantenimiento a largo plazo.
2. **Cumplimiento de Contratos de Integración:** Las tres partes exigidas en la actividad (Consumo GET, Envío POST y Autenticación Remota) se encuentran cabalmente desarrolladas en el código fuente. La integración con Pilgrim API Gateway y los microservicios Java de LAIKA Club demuestra una comprensión sólida de sistemas distribuidos y consumo asíncrono de APIs REST.
3. **Postura de Seguridad Positiva:** Se destaca positivamente la adopción de `expo-secure-store` para la protección cifrada del token JWT (mitigando CWE-922), la incorporación de biometría nativa mediante `expo-local-authentication` para la autorización de compras y acceso a boletos, y la desinfección de logs en consola.
4. **Limitaciones y Honestidad Técnica:** Dado que durante la auditoría técnica los servicios backend locales no se encontraban activos en los puertos correspondientes (8000, 8101, 8201, 8202), no es éticamente aceptable declarar los requisitos como "100% verificados en ejecución" sin las evidencias visuales del runtime. Asimismo, se identificaron áreas de oportunidad técnicas concretas: la necesidad de migrar de HTTP a HTTPS, la implementación de SSL Pinning nativo real (sustituyendo el mock actual), y la limpieza automática del estado de la contraseña tras intentos fallidos de acceso.

---

## 12. Pendientes

Para dar por concluida la entrega académica y alcanzar la calificación máxima, el equipo de estudiantes debe ejecutar exclusivamente las siguientes acciones puntuales:
1. **Levantar el Entorno Backend:** Iniciar el API Gateway Pilgrim (FastAPI en puerto 8000) y los microservicios de Auth (8101), Events (8201) y Tickets (8202) mediante Docker Compose o los scripts de arranque (`iniciar_roles_desacoplados.bat`).
2. **Iniciar el Servidor Expo Móvil:** Ejecutar `npx expo start -c` en `LaikaMobil/` y abrir la aplicación en un dispositivo físico o emulador.
3. **Recopilar las 6 Capturas del Plan de Evidencias (E01 a E06):** Tomar las capturas de pantalla siguiendo las instrucciones precisas descritas en la Sección 13 y pegarlas en los marcadores reservados de este documento.
4. **Completar los Datos Académicos de Portada:** Sustituir los marcadores `[PENDIENTE: ...]` con el nombre oficial de la asignatura, el nombre del docente evaluador, los nombres completos de los integrantes con sus respectivas matrículas universitarias y el grupo escolar.

---

## 13. Plan detallado de capturas de pantalla

Esta sección constituye la guía obligatoria paso a paso para que el alumno obtenga las seis evidencias visuales requeridas por la rúbrica académica. No se deben insertar capturas simuladas ni genéricas: cada evidencia debe capturarse en tiempo real siguiendo estas directrices:

### Evidencia E01: Pantalla de autenticación (Login)
- **Objetivo:** Demostrar que la aplicación presenta los campos de correo electrónico y contraseña, con esta última oculta y protegida en pantalla.
- **Qué ejecutar:** Abrir LaikaMobil y navegar a la pestaña de "Perfil" o presionar "Iniciar Sesión".
- **Qué debe verse:** Formulario con los campos "Email", "Password", botón "Login", enlace de recuperación y botones de inicio alternativo.
- **Qué debe comprobarse:** Comprobar que al escribir en el campo de contraseña los caracteres se enmascaran automáticamente con puntos/asteriscos (`secureTextEntry`).
- **Archivo sugerido:** `E01_pantalla_autenticacion.png`
- **Estado actual:** Pendiente de captura por el alumno en dispositivo/emulador.
- **Notas para el alumno:** Escribir un correo de prueba como `usuario@laikaclub.com`. No revelar contraseñas personales reales. Mantener el icono de ojo cerrado para constatar que el texto se mantiene protegido.

*(Espacio reservado para pegar la captura E01)*

---

### Evidencia E02: Autenticación remota exitosa
- **Objetivo:** Demostrar que el cliente móvil envía las credenciales al servicio remoto, recibe un token JWT y actualiza el estado de la aplicación mostrando la sesión activa del usuario.
- **Qué ejecutar:** Ingresar credenciales válidas registradas en la base de datos de LAIKA Club y presionar el botón "Login".
- **Qué debe verse:** Pantalla de "Mi Perfil" con el nombre del usuario autenticado, correo electrónico, rol asignado (`'usuario'`) y opciones de cuenta.
- **Qué debe comprobarse:** Verificar que la pantalla ya no muestra el formulario de login y que el token de acceso fue guardado en el dispositivo sin errores.
- **Archivo sugerido:** `E02_autenticacion_exitosa.png`
- **Estado actual:** Pendiente de captura por el alumno con backend en línea.
- **Notas para el alumno:** Asegurarse de que no aparezcan contraseñas ni tokens JWT completos en pantalla. El perfil debe reflejar datos reales obtenidos del endpoint `/auth/users/me`.

*(Espacio reservado para pegar la captura E02)*

---

### Evidencia E03: Consumo de datos remotos (Cartelera de eventos)
- **Objetivo:** Demostrar que la aplicación realiza una petición HTTP GET al endpoint `/events/public` y presenta la lista de eventos dinámicos en la interfaz.
- **Qué ejecutar:** Abrir la pestaña principal "Eventos" de la barra de navegación inferior.
- **Qué debe verse:** Carrusel superior (`HeroCarousel`) con eventos destacados, barra de filtros por categoría (Música, Deportes, Teatro, Festivales) y listado de tarjetas (`EventCard`) con imágenes, títulos, sedes y precios mínimos.
- **Qué debe comprobarse:** Verificar que la información mostrada coincide con los registros de la base de datos del microservicio de eventos y no con datos estáticos quemados.
- **Archivo sugerido:** `E03_consumo_datos_remotos.png`
- **Estado actual:** Pendiente de captura por el alumno con backend en línea.
- **Notas para el alumno:** Hacer un ligero deslizamiento hacia abajo (pull-to-refresh) para que se observe el indicador de refresco sincronizando los datos con el API Gateway.

*(Espacio reservado para pegar la captura E03)*

---

### Evidencia E04: Envío de información al servicio remoto (Formulario de Checkout)
- **Objetivo:** Demostrar la funcionalidad que permite seleccionar boletos, configurar la compra e iniciar el envío transaccional mediante petición POST.
- **Qué ejecutar:** Seleccionar un evento de la cartelera, elegir la cantidad de boletos y acceder a la pantalla del "Carrito" (`CartScreen`).
- **Qué debe verse:** Resumen del evento seleccionado (imagen, título, fecha, cantidad y total a pagar), selector de método de pago y temporizador de reserva activa (3 minutos).
- **Qué debe comprobarse:** Comprobar que el botón "Continuar al Pago" está habilitado y listo para invocar la compra hacia `/tickets/purchase`.
- **Archivo sugerido:** `E04_envio_datos_carrito.png`
- **Estado actual:** Pendiente de captura por el alumno.
- **Notas para el alumno:** Verificar que el usuario esté debidamente autenticado en la sesión para que aparezca "Carrito de [Nombre de Usuario]" en el encabezado.

*(Espacio reservado para pegar la captura E04)*

---

### Evidencia E05: Resultado de la operación de envío (Confirmación de compra / Boleto emitido)
- **Objetivo:** Demostrar el resultado exitoso retornado por el servidor remoto tras procesar la orden de compra y registrar el boleto.
- **Qué ejecutar:** Autorizar la compra mediante la confirmación biométrica o PIN en el Carrito y esperar la respuesta del servidor.
- **Qué debe verse:** Pantalla `SuccessScreen` confirmando la compra del evento, o la pantalla "Mis Boletos" mostrando el pase digital recién generado con su estado "Activo".
- **Qué debe comprobarse:** Verificar que el nuevo boleto cuenta con identificador único o código QR generado a partir del registro en el microservicio de tickets.
- **Archivo sugerido:** `E05_resultado_operacion_exitosa.png`
- **Estado actual:** Pendiente de captura por el alumno con backend en línea.
- **Notas para el alumno:** Si se captura en "Mis Boletos", debe apreciarse la tarjeta con el nombre del evento, fecha y ubicación confirmados por el backend.

*(Espacio reservado para pegar la captura E05)*

---

### Evidencia E06: Manejo de errores y respuestas no exitosas
- **Objetivo:** Demostrar la capacidad de la aplicación para interceptar y notificar errores controlados de validación o rechazo del servidor.
- **Qué ejecutar:**
  - *Escenario A (Validación local):* Escribir un correo malformado (ej. `correo-invalido`) en Login y presionar "Login".
  - *Escenario B (Error remoto):* Ingresar un correo inexistente o contraseña incorrecta con backend activo.
- **Qué debe verse:** Recuadro visual de error con fondo rojo tenue y texto descriptivo (*"Por favor, ingresa un correo electrónico válido"* o *"Contraseña incorrecta o verifica tus datos"*).
- **Qué debe comprobarse:** Comprobar que la aplicación no sufre cierres inesperados (crashes) y que el mensaje es completamente comprensible para el usuario final.
- **Archivo sugerido:** `E06_manejo_errores_controlados.png`
- **Estado actual:** Pendiente de captura por el alumno.
- **Notas para el alumno:** Se recomienda documentar el Escenario A (validación sintáctica de cliente) y complementarlo con el Escenario B (rechazo 401/404 del backend) para demostrar la robustez integral del manejo de fallos.

*(Espacio reservado para pegar la captura E06)*
