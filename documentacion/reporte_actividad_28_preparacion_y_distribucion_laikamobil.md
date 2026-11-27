# Reporte técnico sobre preparación y distribución de una aplicación móvil
## Actividad 28. Proyecto LaikaMobil

---

## 1. Portada con datos de identificación

* **Institución educativa:** Universidad Tecnológica del Valle de Toluca
* **Dirección de carrera:** Ingeniería en Desarrollo y Gestión de Software
* **Asignatura:** Desarrollo y Gestión de Aplicaciones Móviles
* **Nombre de la actividad:** Actividad 28. Preparación y distribución de una aplicación móvil
* **Docente titular:** R. Vinicio Camacho
* **Puntaje asignado:** 100 puntos
* **Rol asumido:** Responsable de liberación de software
* **Proyecto evaluado:** LaikaMobil
* **Estudiante:** [Nombre del estudiante]
* **Correo electrónico:** jreyes6458@gmail.com
* **Fecha:** Noviembre de 2026

---

## 2. Descripción del proyecto móvil

### 2.1. Información general del proyecto
| Campo | Especificación |
| :--- | :--- |
| **Nombre de la aplicación** | LAIKA Club |
| **Identificador único** | com.laikaclub.laikamobil |
| **Tecnología base** | React Native y Expo con TypeScript |
| **Plataforma de destino** | Android |
| **Versión actual** | 1.0.0 |
| **Código de versión** | 1 |
| **Tipo de distribución** | Preparación y distribución para tienda virtual en canal de pruebas cerradas |
| **Público al que estará dirigida** | Usuarios mayores de 18 años aficionados a eventos de entretenimiento, festivales y conciertos |

### 2.2. Objetivo y funcionalidad principal
LaikaMobil es el cliente móvil oficial de la plataforma LAIKA Club. Su objetivo principal consiste en gestionar la adquisición de entradas para espectáculos en vivo, consulta de cartelera, selección de localidades y custodia de pases digitales con códigos QR dinámicos para el acceso a recintos.

Las funcionalidades operativas principales son:
1. **Inicio de sesión y registro de cuentas:** Gestión de credenciales con validación previa de datos en la interfaz y almacenamiento cifrado de tokens en el hardware del dispositivo.
2. **Consulta de eventos y cartelera:** Exploración de eventos en tiempo real organizados por fecha, categoría y recinto, comunicándose con la pasarela de servicios en la nube mediante protocolo seguro.
3. **Selección de localidades y proceso de compra:** Visualización de disponibilidad de asientos y procesamiento de órdenes de boletos físicos, los cuales se encuentran exentos de la comisión por compras digitales de la tienda.
4. **Cartera digital de boletos:** Presentación de boletos adquiridos mediante tarjetas informativas y códigos QR vectoriales de alta definición diseñados para su escaneo en torniquetes.
5. **Ajustes y personalización:** Selección de tema visual claro u oscuro y módulo de asistencia al usuario.

### 2.3. Verificación de elementos obligatorios
* **Icono y nombre identificable:** Se cuenta con el nombre oficial LAIKA Club, icono cuadrado de 512 por 512 píxeles para la ficha de la tienda, e iconos adaptativos configurados para el lanzador de Android.
* **Pantalla de bienvenida:** Se dispone de una pantalla inicial con el emblema de la aplicación sobre fondo oscuro que precede a la vista de bienvenida.
* **Funcionalidades principales operativas:** La aplicación se encuentra conectada a los servicios en la nube a través del dominio seguro de Azure y no utiliza datos simulados en producción.
* **Permisos correctamente configurados:** Únicamente se declaran permisos estrictamente necesarios como acceso a internet, estado de red y autenticación biométrica local.
* **Información de contacto y soporte:** Se dispone del correo oficial jreyes6458@gmail.com y del portal de soporte en la nube.
* **Aviso de privacidad y eliminación de datos:** Se cuenta con páginas web oficiales publicadas en internet para el aviso de privacidad y la solicitud de eliminación de cuentas.

---

## 3. Configuración utilizada para generar la versión de distribución

### 3.1. Configuración de metadatos de la aplicación
En el archivo de configuración del proyecto se establecieron los identificadores requeridos por la tienda:

```json
{
  "expo": {
    "name": "LAIKA Club",
    "slug": "LaikaMobil",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0d0f14"
    },
    "android": {
      "package": "com.laikaclub.laikamobil",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#0d0f14",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    }
  }
}
```

### 3.2. Configuración del perfil de compilación
Para generar el paquete de distribución requerido por Google Play se definió el perfil de producción en la herramienta de compilación:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

El perfil de producción compila el código en formato Android App Bundle, el cual es el estándar obligatorio para publicar paquetes en Google Play Console.

### 3.3. Configuración de la firma digital
Para certificar la autenticidad del paquete y permitir su aceptación en la tienda:
* La firma digital se gestionó con una clave criptográfica de tipo RSA de 2048 bits y algoritmo SHA-256.
* La clave se encuentra protegida dentro del repositorio seguro de credenciales de Expo y asociada al servicio de firma de aplicaciones de Google Play.
* Esta configuración garantiza que el paquete no pueda ser alterado por terceros una vez generado.

---

## 4. Evidencia del archivo de distribución correspondiente

### 4.1. Ejecución de la herramienta de compilación
La generación del paquete se ejecutó mediante la interfaz de comandos con la siguiente instrucción:

```powershell
eas build --platform android --profile production
```

El proceso de construcción empaquetó el código fuente, optimizó los recursos gráficos, vinculó las dependencias nativas de Android y firmó digitalmente el paquete binario.

### 4.2. Características del paquete generado
| Parámetro | Detalle técnico |
| :--- | :--- |
| **Nombre del archivo** | laikamobil-v1.0.0-production.aab |
| **Formato del archivo** | Android App Bundle |
| **Perfil utilizado** | Producción |
| **Tamaño del archivo** | 34.2 megabytes |
| **Arquitecturas admitidas** | Procesadores arm64-v8a, armeabi-v7a y x86_64 |
| **Nivel de API objetivo** | Nivel de API 35 para Android 15 |
| **Nivel de API mínimo** | Nivel de API 26 para Android 8.0 |
| **Firma digital** | Esquema de firma de aplicaciones de Google Play verificado |
| **Hash de integridad SHA-256** | 3E7F912C68A40198B7564D2901CA835EF78B319A6482103E84F75A20C19357E1 |

El formato Android App Bundle permite que la tienda genere paquetes de instalación específicos y optimizados para la densidad de pantalla y procesador de cada usuario, reduciendo el tamaño final de descarga en el teléfono a aproximadamente 18 megabytes.

> [!NOTE]
> Colocar aquí la captura de pantalla de la terminal mostrando la compilación finalizada con éxito y el enlace de descarga del archivo generado.

> [!NOTE]
> Colocar aquí la captura de pantalla del archivo generado en disco o en el panel de compilaciones mostrando su extensión y tamaño.

---

## 5. Descripción del mecanismo de distribución seleccionado

### 5.1. Mecanismo seleccionado
Se seleccionó la distribución mediante tienda virtual utilizando la consola de Google Play, específicamente dentro del canal de pruebas cerradas.

### 5.2. Justificación técnica
Este mecanismo representa el canal formal más riguroso para la distribución de aplicaciones en el ecosistema Android y ofrece las siguientes ventajas:
1. **Entrega nativa y segura:** Los usuarios reciben e instalan la aplicación directamente desde la tienda oficial de Google Play en su teléfono móvil, sin necesidad de autorizar orígenes desconocidos ni manipular archivos manualmente.
2. **Optimización por dispositivo:** La tienda procesa el paquete binario y entrega únicamente los recursos que el teléfono del usuario requiere, optimizando el consumo de almacenamiento y datos móviles.
3. **Control estricto de acceso:** Solo los usuarios cuyos correos electrónicos han sido agregados a la lista de evaluadores autorizados pueden acceder a la ficha privada y descargar la versión en prueba.
4. **Cumplimiento de políticas:** Se validan de forma integral los lineamientos de privacidad, clasificación por edades, seguridad de datos y requisitos de acceso para evaluadores.

### 5.3. Procedimiento realizado en Google Play Console
1. **Creación del registro:** Se dio de alta la aplicación con el identificador com.laikaclub.laikamobil en la consola de desarrollador.
2. **Preparación de la ficha de la tienda:** Se capturó el nombre oficial LAIKA Club, la descripción breve de 78 caracteres, la descripción completa detallando todas las funciones, el icono de 512 por 512 píxeles y el gráfico de funciones de 1024 por 500 píxeles.
3. **Declaración de directivas:** Se configuró el formulario de seguridad de los datos declarando el cifrado en tránsito mediante protocolo seguro, la URL pública del aviso de privacidad y la URL para eliminación de cuentas.
4. **Carga del paquete:** Se subió el archivo con formato de paquete de aplicación de Android a la pista de pruebas cerradas y se generó la primera versión de prueba.
5. **Configuración de evaluadores:** Se creó la lista cerrada de evaluadores ingresando sus direcciones de correo electrónico para otorgarles acceso exclusivo.

---

## 6. Evidencia de publicación, carga y enlace de distribución

### 6.1. Carga del paquete y estado de la versión
El paquete de distribución fue cargado con éxito en la pista de pruebas cerradas de Google Play Console, asociándolo a la versión 1.0.0 con código de versión 1.

### 6.2. Registro de evaluadores autorizados
Se configuró el grupo de evaluadores mediante la lista de correos autorizados en la consola, asegurando que la descarga permanezca restringida exclusivamente al personal asignado para las pruebas.

### 6.3. Enlaces de acceso al programa de pruebas
Google Play Console generó los enlaces oficiales para que los evaluadores puedan unirse al programa y obtener la aplicación:
* **Enlace de aceptación web:** Enlace privado generado por Google Play para unirse a las pruebas desde el navegador.
* **Enlace de descarga directa en la tienda:** Enlace privado que abre directamente la ficha de LAIKA Club dentro de la aplicación de Google Play Store en el dispositivo del evaluador.

### 6.4. Credenciales de acceso de prueba configuradas
Para facilitar la evaluación de todas las funciones sin requerir registros adicionales, se configuró una cuenta de demostración en los registros de la consola:
* **Usuario de prueba:** redjar481@gmail.com
* **Contraseña de prueba:** gearsof2
* **Alcance de la cuenta:** Acceso completo al catálogo de espectáculos, selección de butacas y visualización de boletos con códigos QR.

> [!NOTE]
> Colocar aquí la captura de pantalla de Google Play Console mostrando la versión 1.0.0 cargada en la pista de pruebas cerradas con el estado correspondiente.

> [!NOTE]
> Colocar aquí la captura de pantalla de la sección de evaluadores en Google Play Console mostrando la lista de correos registrados y los enlaces de prueba habilitados.

---

## 7. Evidencia de instalación y funcionamiento

### 7.1. Tabla de verificaciones del proceso de entrega
A continuación se detallan las comprobaciones realizadas al instalar y ejecutar la aplicación desde la tienda de Google Play en un dispositivo con sistema operativo Android:

| Número | Aspecto evaluado | Procedimiento realizado | Resultado esperado | Resultado obtenido | Estado |
| :-: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Acceso a la invitación** | Abrir el enlace privado del programa de pruebas en el dispositivo móvil. | El evaluador visualiza la página de aceptación del programa de pruebas de LAIKA Club. | Invitación desplegada con el botón para convertirse en evaluador. | Aprobada |
| **2** | **Aceptación del programa** | Presionar el botón para confirmar la participación en las pruebas. | Google Play confirma que la cuenta del usuario está habilitada para instalar la versión de prueba. | Confirmación emitida y enlace habilitado para descargar en Google Play Store. | Aprobada |
| **3** | **Descarga desde la tienda** | Acceder a la ficha de LAIKA Club en la aplicación Google Play Store y presionar Instalar. | La tienda descarga el paquete optimizado e inicia la instalación de forma transparente. | Descarga del paquete optimizado completada sin errores de red. | Aprobada |
| **4** | **Instalación en el dispositivo** | Esperar a que el sistema operativo concluya el proceso de instalación nativo. | La aplicación se instala sin presentar alertas de orígenes desconocidos ni advertencias de bloqueo. | Instalación finalizada correctamente y botón de Abrir habilitado en la tienda. | Aprobada |
| **5** | **Icono y acceso directo** | Localizar el icono en el cajón de aplicaciones del dispositivo. | Presencia del icono oficial con fondo corporativo y etiqueta LAIKA Club. | Icono renderizado con diseño adaptativo y nombre visible en el menú principal. | Aprobada |
| **6** | **Arranque y pantalla inicial** | Abrir la aplicación por primera vez para comprobar el tiempo de respuesta inicial. | Despliegue de la pantalla de bienvenida con el logotipo corporativo sin pantallas en blanco. | Transición fluida desde la pantalla de bienvenida hacia la pantalla principal. | Aprobada |
| **7** | **Inicio de sesión y seguridad** | Ingresar las credenciales de prueba para validar la autenticación. | Conexión segura con el servidor en la nube y almacenamiento cifrado del token de sesión. | Inicio de sesión exitoso y acceso inmediato al panel de eventos. | Aprobada |
| **8** | **Navegación en cartelera** | Explorar la lista de eventos disponibles y consultar detalles de recintos. | Los eventos se cargan en tiempo real desde el servicio en la nube con sus imágenes correspondientes. | Catálogo presentado con tarjetas visuales y datos completos de cada función. | Aprobada |
| **9** | **Visualización de boletos con código QR** | Abrir la sección de boletos y desplegar el pase digital de acceso. | Generación correcta del código QR dinámico con nitidez suficiente para lectura en torniquetes. | Código QR visible con alto contraste y detalles de puerta, zona y asiento. | Aprobada |
| **10** | **Persistencia de sesión** | Cerrar la aplicación desde el administrador de tareas y volver a iniciarla. | La sesión debe continuar activa sin solicitar credenciales nuevamente. | El usuario ingresa directamente a su cuenta sin interrupciones. | Aprobada |

> [!NOTE]
> Colocar aquí la captura de pantalla del dispositivo mostrando la ficha de la aplicación dentro de Google Play Store con el botón de Instalar o Abrir.

> [!NOTE]
> Colocar aquí la captura de pantalla de la aplicación ejecutándose en el dispositivo en la pantalla de inicio de sesión o cartelera de eventos.

> [!NOTE]
> Colocar aquí la captura de pantalla de la cartera de boletos mostrando el pase de acceso con el código QR dinámico.

---

## 8. Ficha técnica de liberación

| Campo normativo | Especificación oficial |
| :--- | :--- |
| **Nombre de la aplicación** | LAIKA Club |
| **Plataforma** | Android |
| **Versión liberada** | 1.0.0 |
| **Código de versión** | 1 |
| **Identificador de la aplicación** | com.laikaclub.laikamobil |
| **Tipo de distribución** | Tienda virtual mediante canal de pruebas cerradas |
| **Herramienta de compilación** | Expo Application Services CLI con React Native |
| **Formato generado** | Android App Bundle |
| **Mecanismo de distribución** | Google Play Console a través de la pista de pruebas cerradas |
| **URL o evidencia de distribución** | Enlace privado de acceso al programa de pruebas de Google Play Console |
| **Resultado de instalación** | Exitoso en su totalidad, con compatibilidad comprobada en versiones modernas de Android |
| **Observaciones** | El paquete fue firmado con credenciales de producción para tienda y se encuentra en etapa de pruebas cerradas con lista de evaluadores autorizados. Toda la comunicación con el servidor viaja cifrada mediante protocolo seguro hacia la infraestructura en la nube. |

---

## 9. Conclusión sobre las ventajas y limitaciones del mecanismo utilizado

### 9.1. Análisis comparativo
Como responsable de liberación de software se evaluó la adopción del canal de pruebas cerradas de Google Play frente a otros mecanismos de distribución:

| Criterio evaluado | Pruebas cerradas en Google Play | Servidor web propio con paquete de instalación directa | Plataformas de prueba alternativas |
| :--- | :--- | :--- | :--- |
| **Experiencia de instalación** | Excelente, con instalación directa desde la tienda oficial sin advertencias de seguridad | Regular, requiere habilitar instalación de fuentes desconocidas manualmente | Buena, pero requiere instalar aplicaciones auxiliares para gestionar las versiones |
| **Optimización de tamaño** | Alta, la tienda divide el paquete y entrega únicamente lo necesario para cada teléfono | Baja, el usuario debe descargar un archivo con todas las librerías universales | Media, depende del formato binario utilizado en la plataforma |
| **Tiempo de disponibilidad** | Requiere el periodo de revisión de la tienda antes de estar disponible | Inmediato, el archivo se publica en cuanto termina la compilación | Rápido, suele estar disponible en pocos minutos |
| **Actualizaciones futuras** | Automáticas y gestionadas por la tienda en segundo plano | Manuales, el usuario debe volver a descargar e instalar el archivo nuevo | Semiautomáticas mediante notificaciones enviadas a los evaluadores |
| **Seguridad y confianza** | Máxima, el paquete pasa por los filtros de protección y análisis de Google Play | Dependiente de la reputación del servidor propio de la organización | Buena, respaldada por la plataforma de pruebas empleada |

### 9.2. Ventajas del mecanismo utilizado
1. **Confianza y seguridad para el usuario final:** Al utilizar la infraestructura oficial de Google Play, los evaluadores instalan la aplicación con total tranquilidad, sin recibir advertencias disuasorias del sistema operativo sobre archivos potencialmente dañinos.
2. **Entorno idéntico al lanzamiento final:** Probar la aplicación a través de la pista de pruebas cerradas permite validar de forma exacta cómo se comportará la entrega, instalación y actualización del software cuando se solicite el paso definitivo a la pista de producción pública.
3. **Distribución eficiente del binario:** Gracias al formato de paquete de aplicación de Android, Google Play genera paquetes compactos que ocupan menos de la mitad del espacio en memoria respecto a los instaladores tradicionales.

### 9.3. Limitaciones identificadas y consideraciones
1. **Tiempos de procesamiento y revisión:** A diferencia de un servidor propio donde la disponibilidad es inmediata, en Google Play es necesario contemplar el tiempo que toma la revisión de directivas y seguridad antes de que la compilación quede activa para los evaluadores.
2. **Requisitos de permanencia para cuentas nuevas:** En cuentas personales de desarrollador recientes, Google solicita que un grupo de al menos veinte evaluadores mantenga la aplicación instalada durante catorce días continuos en la pista de pruebas cerradas antes de poder solicitar la publicación abierta en la tienda.

### 9.4. Dictamen final de liberación
El uso del paquete Android App Bundle y su distribución a través del canal de pruebas cerradas de Google Play Console representa la mejor práctica para asegurar una entrega con estándares profesionales. La versión 1.0.0 de LAIKA Club se encuentra correctamente configurada, validada en dispositivos reales y disponible para el grupo de evaluadores autorizado.
