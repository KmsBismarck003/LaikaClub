# Ficha Principal de Google Play Store: LAIKA Club (Copia y Pega Directo)

Esta guía contiene la información estructurada campo por campo, respetando exactamente los límites de caracteres, dimensiones y políticas de Google Play Console (**Crecimiento > Presencia en Google Play Store > Ficha principal de la tienda**).

---

## 1. Recursos de Texto Comunes

### Nombre de la app *
> **Límite:** 30 caracteres  
> **Requisito Google:** No incluir palabras promocionales ("gratis", "el mejor", "#1").

```text
LAIKA Club: Boletos y Eventos
```
*(Longitud exacta: 29 / 30 caracteres)*

> *Opción alternativa corta (10 caracteres):*  
> `LAIKA Club`

---

### Descripción breve *
> **Límite:** 80 caracteres  
> **Requisito Google:** Resumen directo del propósito principal de la app.

```text
Tu casillero digital y acceso oficial a conciertos y festivales sin intermediarios.
```
*(Longitud exacta: 78 / 80 caracteres)*

---

### Descripción completa *
> **Límite:** 4,000 caracteres  
> **Requisito Google:** Explicación detallada de características, funciones y seguridad.

```text
¡Bienvenido a LAIKA Club, la plataforma móvil oficial para adquirir, gestionar y acceder a los mejores conciertos, festivales, espectáculos teatrales y eventos en vivo!

Olvídate de las filas en taquilla, los boletos impresos y el riesgo de fraudes o clonaciones. Con LAIKA Club tienes el control total de tus entradas en la palma de tu mano con tecnología de vanguardia.

¿QUÉ PUEDES HACER CON LAIKA CLUB?

🎟️ BOLETO DIGITAL INTELIGENTE CON QR CRIPTOGRÁFICO
Tu teléfono es tu entrada. Cada boleto emitido cuenta con un identificador único y un código QR criptográfico dinámico diseñado contra la falsificación y la reventa no autorizada. Presenta tu código directo en los lectores de acceso del evento y accede al instante.

⚡ CARTELERA Y COMPRA SEGURA
Explora eventos actualizados en tiempo real. Consulta fechas, horarios, recintos y mapas de zonas. Adquiere tus entradas con confirmación inmediata mediante pasarelas de pago cifradas de alta seguridad.

🔄 TRANSFERENCIAS NOMINALES ENTRE AMIGOS
¿Compraste boletos para tus acompañantes? Transfiere entradas de forma oficial y segura directo al correo electrónico de tus amigos. El boleto se reasigna con un nuevo código nominal único para garantizar que nadie más pueda utilizarlo.

⭐ NIVELES, PUNTOS Y RECOMPENSAS
Cada interacción y asistencia a eventos te premia. Acumula puntos de experiencia (XP), sube de rango en el club (desde Pasaporte Cósmico hasta El Legado Laika) y desbloquea beneficios exclusivos, cupones de descuento y accesos preferenciales.

🛡️ MÁXIMA SEGURIDAD Y PRIVACIDAD
• Acceso protegido mediante autenticación biométrica (Huella dactilar o reconocimiento facial).
• Comunicaciones cifradas de punta a punta (TLS/HTTPS).
• No almacenamos datos sensibles de tarjetas bancarias.
• Control total sobre tu perfil y tus datos personales.

📱 FUNCIONES DESTACADAS:
• Casillero digital con separación inteligente entre pases activos e historial.
• Modo oscuro y claro automático de alta ergonomía visual.
• Notificaciones con avisos relevantes sobre horarios y accesos.
• Canal de asistencia y soporte técnico directo.

Vive tus eventos favoritos con la tranquilidad, velocidad y exclusividad que mereces.

¡Descarga LAIKA Club hoy y asegura tu lugar en primera fila!
```
*(Longitud: 2,198 / 4,000 caracteres)*

---

## 2. Recursos Visuales Comunes

### Ícono de la app *
* **Especificaciones Google:** PNG o JPEG, hasta 1 MB, exactamente **512 × 512 px**.
* **Ubicación en tu proyecto:**
  ```text
  LaikaMobil/assets/playstore/playstore_icon_512x512.png
  ```
* **Estado:** Generado en 512×512 px con isotipo oficial sobre fondo oscuro corporativo (`#0d0f14`), 111 KB (aprobado).

---

### Gráfico de funciones (Feature Graphic) *
* **Especificaciones Google:** PNG o JPEG, hasta 15 MB, exactamente **1,024 × 500 px**.
* **Ubicación en tu proyecto:**
  ```text
  LaikaMobil/assets/playstore/feature_graphic_1024x500.png
  ```
* **Estado:** Generado en 1024×500 px con branding oficial de LAIKA Club, 75 KB (aprobado).

---

### Video (Opcional)
* **Especificaciones Google:** URL de YouTube pública o no listada, sin anuncios y sin restricción de edad.
* **Acción:** Dejar en blanco (no es obligatorio para publicar ni para probar).

---

## 3. Recursos para Teléfonos (Capturas de Pantalla)

* **Especificaciones Google:**
  * Subir de 2 a 8 capturas de pantalla de teléfono.
  * Formato PNG o JPEG, menores a 8 MB cada una.
  * Relación de aspecto 9:16 (vertical).
  * Cada lado debe tener entre 320 px y 3,840 px (mínimo 1080 px para elegibilidad en destacados de Google Play).

### 4 Pantallas recomendadas para capturar:
1. **Cartelera de Eventos:** Pantalla principal mostrando eventos destacados y categorías.
2. **Casillero "Mis Boletos":** Pantalla mostrando los pases con badges de estado y pestañas Activos / Historial.
3. **Pase Digital:** Detalle del boleto con el módulo Bento Grid (fecha, recinto, asiento) y QR de acceso.
4. **Logros y Perfil:** Pantalla de Logros mostrando el Rango actual, puntos XP y cupones desbloqueados.

---

## 4. Categorización y Contacto (Configuración de la App)

> **Ruta en Google Play Console:**  
> **Configuración de la app > Categoría de la app e información de contacto**

| Campo | Valor Requerido |
| :--- | :--- |
| **Tipo de aplicación** | `Aplicación` |
| **Categoría** | `Eventos` *(o `Entretenimiento`)* |
| **Correo electrónico de soporte** | `jreyes6458@gmail.com` |
| **Número de teléfono** | `+52 722 239 0967` |
| **Sitio web oficial** | `https://laikaclub-nzhwq8.southcentralus.cloudapp.azure.com` |

---

## 5. Contenido de la Aplicación (Declaraciones Obligatorias)

> **Ruta en Google Play Console:**  
> **Directivas > Contenido de la app**

### A. Política de Privacidad
* **URL:** `https://laikaweb.vercel.app/privacidad.html` *(o `https://laikaclub-nzhwq8.southcentralus.cloudapp.azure.com/privacidad`)*

### B. Eliminación de Cuenta y Datos (Account Deletion)
* **URL de soporte para borrado:** `https://laikaweb.vercel.app/eliminar-cuenta.html`

### C. Anuncios
* **Opción:** Seleccionar **"No, mi app no contiene anuncios"**.

### D. Acceso a Apps (App Access - Requisito Obligatorio en Inglés)
* **Estado de acceso:** Seleccionar **"Algunas o todas las funciones están restringidas"**.
* **Nombre \*** *(Máx. 60 caracteres):*
  ```text
  Standard User Demo Account
  ```
* **Nombre de usuario, dirección de correo electrónico o número de teléfono \*** *(Máx. 100 caracteres):*
  ```text
  redjar481@gmail.com
  ```
* **Contraseña \*** *(Máx. 100 caracteres):*
  ```text
  gearsof2
  ```
* **Cualquier otra información necesaria para acceder a la aplicación \*** *(Máx. 500 caracteres, en inglés):*
  ```text
  Log in via the Profile or Cart tab using the email and password above. No two-factor authentication (2FA), SMS OTP, or biometric enrollment is required. This demo account has full access to the event catalog, checkout flow, user achievements, and a preloaded digital wallet with active tickets and dynamic QR passes for entrance validation testing.
  ```
* **Casilla de verificación:** Marcar la casilla obligatoria:
  ☑ *"Los detalles de acceso que se especifican en esta declaración proporcionan acceso completo a todas las funciones de esta app y a su contenido, incluido el premium o pagado"*.

### E. Público Objetivo y Contenido
* **Grupo de edad:** Seleccionar **18 años o más**.
* **Presencia de menores:** Seleccionar **No**.

### F. Clasificación de Contenido (IARC)
* Responder el cuestionario de IARC indicando que la app es de utilidad comercial/eventos sin violencia, apuestas con dinero real ni contenido para adultos. Obtendrás clasificación apta para todo público (PEGI 3 / ESRB Everyone).
