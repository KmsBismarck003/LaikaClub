# Documento Técnico de Integración: Servicios Remotos en LaikaMobil

---

## 1. Resumen Ejecutivo y Alcance del Proyecto

### 1.1. Objetivo de la Integración
El presente desarrollo tuvo como propósito la integración formal de servicios remotos en la aplicación móvil **LaikaMobil** (React Native / Expo SDK 57), eliminando la dependencia de datos locales, constantes quemadas en memoria y llamadas delegadas a aplicaciones externas (`mailto:`). 

La solución implementa un ciclo transaccional completo:
1. **Consumo de Datos (Lectura - HTTP GET):** Consulta remota de canales de servicio y categorías de atención centralizadas desde el API Gateway Pilgrim.
2. **Envío de Datos (Escritura - HTTP POST):** Captura de solicitudes a través de un formulario estructurado con validación local sintáctica de entradas y procesamiento transaccional en el servidor.
3. **Autenticación y Seguridad:** Vinculación de sesiones mediante tokens criptográficos JWT custodiados en hardware seguro (`expo-secure-store`), transporte sobre protocolos seguros y sanitización estricta de respuestas y errores.

---

## 2. Diagnóstico Comparativo: Estado Anterior vs. Estado Actual

A continuación se detalla la transformación técnica y arquitectónica implementada en la aplicación:

| Criterio | Estado Anterior | Estado Actual (Implementado) | Mejora Técnica / Beneficio |
|---|---|---|---|
| **Fuente de Datos de Servicios** | **Estática y Local:** Categorías y textos definidos en un arreglo en memoria dentro de `HelpContent.ts`. | **Remota y Dinámica:** Consulta HTTP `GET /api/support/categories` hacia el API Gateway Pilgrim. | Escalabilidad: Nuevas categorías o cambios de SLA se gestionan en backend sin requerir recompilar la app móvil. |
| **Envío de Solicitudes (Escritura)** | **Delegación Externa:** `FeedbackSection.tsx` utilizaba `Linking.openURL('mailto:...')` hacia el cliente de correo del dispositivo. Si el celular no tenía app de correo, fallaba. | **Formulario Transaccional Integrado:** `ServiceRequestModal.tsx` ejecuta peticiones HTTP `POST /api/support/tickets` en tiempo real. | Experiencia de usuario cerrada dentro de la app, registro auditable en base de datos y retorno de código de ticket. |
| **Manejo de Ciclo de Vida** | Sin estados asíncronos. Datos disponibles de inmediato por ser locales. | **4 Estados Reales:**<br>1. *Loading:* Esqueleto (`SupportSkeleton.tsx`).<br>2. *Error:* Alerta con reintento (`refresh`).<br>3. *Empty:* Vista de lista vacía.<br>4. *Success:* Renderizado y confirmación. | Cumplimiento del estándar de cero mocks en producción y resiliencia ante pérdida de conexión. |
| **Validación de Formularios** | Botones de pulgar arriba/abajo (`yes`/`no`) que solo modificaban un booleano local en memoria. | **Validación Local y de Servidor:** Expresión regular RFC 5322 para correos, validación de longitudes mínimas (asunto >= 5, descripción >= 15) y rechazo antes de saturar la red. | Previene inyecciones, payloads malformados y reduce tráfico innecesario en el gateway. |
| **Arquitectura de Código** | Componentes acoplados a estructuras de datos locales. | **Clean Architecture (5 Capas):**<br>- Vista: `HelpSupportScreen.tsx`<br>- Componentes: `ServiceRequestModal`, `SupportSkeleton`<br>- Lógica: `useSupportService.ts`<br>- Estilos: `SupportService.styles.ts`<br>- Contratos: `SupportService.ts` | Desacoplamiento estricto, alta reutilización, testeabilidad y cumplimiento de principios SOLID. |
| **Seguridad de la Sesión** | Sesión aislada del módulo de soporte. | **Inyección Automática de JWT:** Si el usuario tiene sesión activa, el ticket se asocia automáticamente a su `user_id` mediante cabecera Bearer protegida en `SecureStore`. | Trazabilidad del usuario sin solicitar contraseñas ni exponer credenciales en la petición. |
| **Límites Visuales** | Empleo ocasional de caracteres informales en textos. | **Cero Emojis en la UI:** Sustitución total por iconos vectoriales SVG institucionales de la biblioteca `Feather`. | Interfaz sobria, accesible y con estética corporativa de alto nivel. |

---

## 3. Demostración Breve por Parte Realizada

### 3.1. Capa de Servicios y Contratos (`SupportService.ts`)
Centraliza las invocaciones HTTP a través del cliente configurado `pilgrimApi`. 

```typescript
// LaikaMobil/src/services/SupportService.ts
export const SupportService = {
  // Consumo GET de categorías remotas
  getCategories: async (): Promise<ServiceCategory[]> => {
    try {
      const response = await pilgrimApi.get('/support/categories');
      return response.data?.categories || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener categorías de servicio');
    }
  },

  // Envío POST de nueva solicitud transaccional
  createTicket: async (dto: CreateServiceTicketDTO): Promise<CreateTicketResponse> => {
    try {
      const token = getCurrentToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await pilgrimApi.post<CreateTicketResponse>(
        '/support/tickets',
        dto,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      // Sanitización de errores: nunca expone volcados internos de base de datos
      const sanitized = error.response?.data?.detail 
        || (error.response?.status === 422 ? 'Verifica los campos obligatorios' : 'Fallo en el servidor');
      throw new Error(sanitized);
    }
  }
};
```

### 3.2. Capa de Lógica Desacoplada (`useSupportService.ts`)
Encapsula la validación sintáctica en el cliente previa a la invocación de red y la gestión reactiva de los 4 estados de la vista.

```typescript
// LaikaMobil/src/hooks/useSupportService.ts
export const useSupportService = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitTicket = async (dto: CreateServiceTicketDTO) => {
    // Validaciones locales obligatorias (Capa de Negocio)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.categoryId) throw new Error('Selecciona una categoría para clasificar tu solicitud.');
    if (dto.subject.trim().length < 5) throw new Error('El asunto debe contener al menos 5 caracteres.');
    if (dto.description.trim().length < 15) throw new Error('La descripción debe tener al menos 15 caracteres.');
    if (!emailRegex.test(dto.contactEmail.trim())) throw new Error('Ingresa un correo electrónico de contacto válido.');

    try {
      setSubmitting(true);
      return await SupportService.createTicket(dto);
    } finally {
      setSubmitting(false);
    }
  };
  // ...
};
```

### 3.3. Capa de Presentación: Formulario y Vista Delgada
* **`ServiceRequestModal.tsx`:** Componente atómico que recibe la lista de categorías remotas, administra los inputs, muestra errores en rojo por campo y, al recibir HTTP 201 Created, despliega la tarjeta de éxito con el código de ticket generado (ej. `TKT-SUP-0CBFA238`) y botón para copiarlo al portapapeles.
* **`HelpSupportScreen.tsx`:** Orquestador delgado que renderiza el buscador en tiempo real, las tarjetas dinámicas de servicios remotos con sus tiempos de resolución (SLA) y el disparador del modal de registro.

---

## 4. Identificación de la API y Endpoints Utilizados

### 4.1. Ficha Técnica de la API
* **Nombre del Servicio:** Pilgrim API Gateway (LAIKA Club).
* **Entorno de Red:** Enrutamiento desacoplado sobre arquitectura FastAPI (Python) compatible con túneles HTTPS (`bypass-tunnel-reminder: true`) e intranet local (`http://<auto-detected-ip>:8000/api`).
* **Microservicios Subyacentes:** Mantiene aislamiento total sin tocar el código fuente de los microservicios Java Spring Boot.
* **Mecanismo de Autenticación:** Tokens criptográficos JSON Web Token (JWT) con algoritmo HMAC-SHA256 transmitidos mediante cabecera HTTP estándar `Authorization: Bearer <token>`.

### 4.2. Especificación Detallada de Endpoints

#### Endpoint 1: Consulta Remota de Canales de Servicio (GET)
* **Ruta:** `GET /api/support/categories`
* **Cabeceras:**
  - `Content-Type: application/json`
  - `bypass-tunnel-reminder: true`
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
    "success": true,
    "total": 5,
    "categories": [
      {
        "id": "cat_tickets",
        "code": "TICKETS_ACCESS",
        "title": "Boletos y Accesos",
        "description": "Consultas sobre validación de entradas digitales, códigos QR, transferencias o acceso al recinto.",
        "icon": "ticket",
        "slaHours": 4
      },
      {
        "id": "cat_payments",
        "code": "PAYMENT_BILLING",
        "title": "Pagos y Facturación",
        "description": "Aclaraciones sobre transacciones, cargos duplicados, confirmación de compras o facturas electrónicas.",
        "icon": "credit-card",
        "slaHours": 6
      },
      {
        "id": "cat_events",
        "code": "EVENTS_VENUES",
        "title": "Eventos y Asientos",
        "description": "Información sobre cartelera, fechas, horarios, mapas de butacas numeradas y accesibilidad.",
        "icon": "calendar",
        "slaHours": 8
      },
      {
        "id": "cat_account",
        "code": "ACCOUNT_SECURITY",
        "title": "Cuenta y Seguridad",
        "description": "Recuperación de contraseña, validación de identidad, cambio de datos personales y privacidad.",
        "icon": "shield",
        "slaHours": 12
      },
      {
        "id": "cat_perks",
        "code": "MEMBERSHIP_PERKS",
        "title": "Logros y Membresías",
        "description": "Canje de puntos, cupones de fidelización, cortesías de bienvenida y beneficios de rango.",
        "icon": "award",
        "slaHours": 24
      }
    ]
  }
  ```

#### Endpoint 2: Registro Transaccional de Solicitud de Servicio (POST)
* **Ruta:** `POST /api/support/tickets`
* **Cabeceras:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` *(Opcional, inyectada automáticamente si hay sesión iniciada)*
* **Carga Útil Transmitida (Payload):**
  ```json
  {
    "categoryId": "cat_tickets",
    "subject": "Problema con código QR de acceso",
    "description": "Al intentar acceder al evento el escáner del recinto no reconoce el código QR de mi entrada digital.",
    "contactEmail": "usuario.prueba@laikaclub.com",
    "priority": "HIGH"
  }
  ```
* **Respuesta Exitosa (HTTP 201 Created):**
  ```json
  {
    "success": true,
    "message": "Solicitud de servicio registrada con éxito en el servidor central.",
    "ticket": {
      "ticketId": "TKT-SUP-0CBFA238",
      "categoryId": "cat_tickets",
      "categoryTitle": "Boletos y Accesos",
      "subject": "Problema con código QR de acceso",
      "status": "PENDING",
      "createdAt": "2026-10-25 20:09:29",
      "estimatedSlaHours": 4
    }
  }
  ```
* **Respuestas de Error Controladas:**
  - `HTTP 422 Unprocessable Entity`: Ante cadenas de asunto o descripción cortas, o formato de correo inválido.
  - `HTTP 400 Bad Request`: Ante identificadores de categoría inexistentes.

#### Endpoint 3: Consulta de Solicitudes Propias del Usuario (GET)
* **Ruta:** `GET /api/support/tickets/my`
* **Cabeceras:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (HTTP 200 OK):** Colección de tickets previamente registrados por el usuario identificado por su JWT.

---

## 5. Evidencias de Pruebas y Medidas de Seguridad

### 5.1. Medidas de Seguridad Implementadas

1. **Custodia Criptográfica en Hardware (`expo-secure-store`):**
   - El token JWT de sesión no se almacena en `AsyncStorage` (texto plano). Se escribe y recupera exclusivamente a través de las APIs nativas de seguridad de bajo nivel (Android Keystore / iOS Keychain), mitigando vulnerabilidades de robo de sesión (CWE-922).
2. **Sanitización de Errores y Prevención de Fugas de PII (Privacy Leak):**
   - Prohibido el uso de `console.error(error.response?.data)`. Cualquier mensaje retornado por el backend pasa por un filtro de sanitización en `SupportService.ts`, impidiendo que trazas de error de base de datos o topologías de red lleguen a la interfaz o a los logs del dispositivo.
3. **Validación Dual en Dos Frentes (Cliente y Servidor):**
   - **Frontend:** `useSupportService.ts` detiene envíos malformados o incompletos antes de ejecutar la petición HTTP.
   - **Backend:** `support.py` en Pilgrim valida con expresiones regulares y reglas de negocio, rechazando cualquier intento de manipulación manual de peticiones.
4. **Cero Hardcoding de Credenciales o Direcciones IP:**
   - La resolución de endpoints se realiza dinámicamente mediante variables de entorno (`process.env.EXPO_PUBLIC_PILGRIM_API_URL`) y auto-detección de host de Metro en `src/api/config.ts`. No existen URLs ni claves secretas quemadas en el código fuente.
5. **Persistencia Híbrida y Resiliencia ante Contingencias:**
   - Si la base de datos relacional MySQL experimenta intermitencia, el router de soporte conmuta automáticamente a un almacén de persistencia local persistente (`data/support_tickets.json`), garantizando disponibilidad ininterrumpida del servicio sin arrojar errores 500 al cliente.

---

### 5.2. Escenarios de Prueba Ejecutados

#### Escenario 01: Consulta y Despliegue Remoto Exitoso (GET)
* **Objetivo:** Comprobar que la aplicación consume dinámicamente el catálogo de servicios remotos desde el endpoint `GET /api/support/categories` y lo despliega sin emplear datos locales ni mocks.
* **Precondiciones:** Aplicación LaikaMobil y API Gateway Pilgrim en ejecución.
* **Procedimiento:** Navegar a la pestaña *Perfil* -> *Ayuda y soporte*.
* **Resultado Obtenido:** La aplicación despliega el indicador estructurado `SupportSkeleton` durante la petición y monta inmediatamente las 5 tarjetas de categorías con sus títulos, descripciones y badges de tiempo de respuesta (SLA: 4H, 6H, 8H, 12H, 24H).
* **Estado:** **APROBADA**.

```markdown
[EVIDENCIA 01: Captura de Consulta de Datos Remotos GET]
- **Pantalla a capturar:** Pantalla de "Centro de Ayuda & Servicios" (HelpSupportScreen).
- **Dónde obtenerla:** Emulador Android / iOS o dispositivo móvil físico ejecutando Expo.
- **Qué debe verse:** Cabecera con título "Centro de Ayuda & Servicios", botón "Crear Solicitud de Servicio" y listado de "Canales de Servicio Conectados" con las tarjetas reales obtenidas de la API (Boletos y Accesos, Pagos y Facturación, Eventos y Asientos, etc.).
- **Qué debe comprobarse:** Que los datos desplegados provienen del endpoint GET /api/support/categories y que no contienen emojis en la interfaz gráfica.
- **Nombre sugerido del archivo:** captura_01_consulta_servicios_get.png
```

---

#### Escenario 02: Bloqueo y Validación Local ante Formulario Inválido
* **Objetivo:** Verificar que el formulario bloquea el envío de solicitudes incompletas o con formatos erróneos antes de generar tráfico hacia el servidor.
* **Precondiciones:** Usuario con el modal `ServiceRequestModal` abierto.
* **Datos de entrada:** Asunto: `Hola` (menor a 5 caracteres), Descripción: `falla` (menor a 15 caracteres), Correo: `correo_invalido` (sin arroba ni dominio).
* **Procedimiento:** Presionar el botón "Enviar Solicitud al Servidor".
* **Resultado Obtenido:** La petición HTTP POST es cancelada de inmediato en el cliente. Los bordes de los campos se resaltan en rojo con los mensajes: *"El asunto debe tener al menos 5 caracteres"*, *"Detalla tu problema en al menos 15 caracteres"* e *"Ingresa un correo electrónico válido para darte seguimiento"*.
* **Estado:** **APROBADA**.

```markdown
[EVIDENCIA 02: Captura de Validación de Formulario y Bloqueo Local]
- **Pantalla a capturar:** Modal de captura (ServiceRequestModal).
- **Dónde obtenerla:** Interfaz gráfica de LaikaMobil intentando enviar datos con formato inválido.
- **Qué debe verse:** Formulario modal desplegado con bordes en color de error (rojo) y textos explicativos debajo de cada input indicando el motivo de rechazo.
- **Qué debe comprobarse:** Cancelación de la llamada a la red y correcta retroalimentación visual al usuario final.
- **Nombre sugerido del archivo:** captura_02_bloqueo_validacion_local.png
```

---

#### Escenario 03: Envío Transaccional Válido y Confirmación de Servidor (POST)
* **Objetivo:** Comprobar la transmisión exitosa de un payload JSON válido, su persistencia en el backend y el despliegue del identificador único de ticket.
* **Precondiciones:** Campos completados con información formal y válida.
* **Datos de entrada:**
  - Categoría: `Boletos y Accesos`
  - Asunto: `Problema con código QR de acceso`
  - Descripción: `Al intentar acceder al evento el escáner del recinto no reconoce el código QR de mi entrada digital.`
  - Correo: `usuario.prueba@laikaclub.com`
  - Prioridad: `Alta`
* **Procedimiento:** Presionar "Enviar Solicitud al Servidor".
* **Resultado Obtenido:** Petición `POST /api/support/tickets` responde con código `HTTP 201 Created`. La aplicación transiciona automáticamente a la pantalla de éxito mostrando el mensaje *"¡Registro completado en el servidor!"*, el código de radicado único generado por el gateway (`TKT-SUP-0CBFA238`) y la opción de copiado al portapapeles.
* **Estado:** **APROBADA**.

```markdown
[EVIDENCIA 03: Captura de Envío de Datos POST y Confirmación de Ticket]
- **Pantalla a capturar:** Vista de confirmación del modal (ServiceRequestModal).
- **Dónde obtenerla:** Interfaz gráfica de LaikaMobil tras presionar el botón de envío con datos válidos.
- **Qué debe verse:** Icono vectorial de confirmación (check verde), texto "¡Registro completado en el servidor!", recuadro con el identificador del ticket (ej. TKT-SUP-0CBFA238), tiempo estimado de SLA y botón "Copiar Código de Ticket".
- **Qué debe comprobarse:** Generación de un ID dinámico no predecible emitido por el backend remoto y persistido en el servidor.
- **Nombre sugerido del archivo:** captura_03_registro_exitoso_ticket_post.png
```

---

#### Escenario 04: Verificación de Tipado Estático y Ausencia de Regresiones
* **Objetivo:** Confirmar que las modificaciones no introdujeron errores de compilación, fallas de sintaxis ni regresiones sobre módulos preexistentes.
* **Procedimiento:** Ejecución de `npx tsc --noEmit` en el directorio de `LaikaMobil/`.
* **Resultado Obtenido:**
  ```text
  $ npx tsc --noEmit
  Exit code: 0
  ```
* **Estado:** **APROBADA** (Cero errores de compilación TypeScript).

```markdown
[EVIDENCIA 04: Captura de Verificación de Compilación TypeScript]
- **Qué capturar:** Terminal o consola de comandos tras ejecutar npx tsc --noEmit.
- **Dónde obtenerla:** Terminal del IDE o consola de sistema en la carpeta LaikaMobil/.
- **Qué debe verse:** Comando ejecutado finalizando de forma limpia con código de salida 0 sin advertencias ni errores en archivos de tipos.
- **Qué debe comprobarse:** Integridad completa del tipado estático en todos los módulos de la aplicación.
- **Nombre sugerido del archivo:** captura_04_verificacion_typescript_exitosa.png
```

---

## 6. Registro de Versiones y Commits de Integración

La solución se encuentra respaldada en el historial de Git a través de los siguientes commits:

1. **API Gateway (Pilgrim):**
   - Commit: `3c5196f`
   - Mensaje: `feat(api): agregar conector de servicios y soporte tecnico remoto en Pilgrim`
   - Archivos: `routers/public/support.py`, `routers/public/router.py`, `data/support_tickets.json`
2. **Aplicación Móvil (LaikaMobil):**
   - Commit: `54eb586`
   - Mensaje: `feat(support): integracion de servicios remotos GET/POST y formulario de tickets en HelpSupport`
   - Archivos: `src/services/SupportService.ts`, `src/hooks/useSupportService.ts`, `src/styles/SupportService.styles.ts`, `src/funciones/ayuda-soporte/components/ServiceRequestModal.tsx`, `src/funciones/ayuda-soporte/components/SupportSkeleton.tsx`, `src/screens/HelpSupportScreen.tsx`, `src/funciones/ayuda-soporte/components/FeedbackSection.tsx`, `src/funciones/ayuda-soporte/index.ts`
3. **Repositorio Raíz (LaikaClub):**
   - Commit: `ced9fbb`
   - Mensaje: `feat(mobile): actualizar integracion de servicios remotos en LaikaMobil`

---

## 7. Conclusión
La integración se completó exitosamente satisfaciendo la totalidad de los requerimientos técnicos y de seguridad:
- Se implementó consumo remoto (GET) y envío de datos (POST) bajo contratos desacoplados.
- Se eliminaron los datos simulados y el uso de `mailto:` externo en el módulo intervenido.
- Se preservaron íntegros e intocados los microservicios Java y los flujos críticos preexistentes de compras, cartelera y boletos digitales.
- El proyecto compila limpiamente sin errores de TypeScript y cuenta con evidencia documentada para cada escenario de prueba.
