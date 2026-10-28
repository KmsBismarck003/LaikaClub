---
name: laika-engineering-standard
description: >-
  Estándar integral de ingeniería de software, arquitectura limpia, redacción técnica y ejecución
  modular de alto rendimiento. Define el protocolo en dos fases (planificación/confirmación técnica y ejecución
  autónoma), asunción de roles especializados (Architect, Frontend/Backend Lead, UI/UX Design Systems, QA, Security),
  arquitectura limpia (Clean Architecture, POO, SOLID), regla estricta de 5 capas contra archivos monolíticos
  (vistas delgadas, componentes atómicos, hooks/servicios desacoplados, estilos independientes, contratos reales),
  estándar de diseño Bento Box en dashboards con artesanía visual nivel Tier-1 (Apple/Linear/Stripe), responsividad
  universal para cualquier dispositivo (320px a ultrawide 4K, touch targets >= 44px, cero scroll horizontal),
  reutilización de componentes UI, soporte total multitema (Dark/Light) con tokens semánticos y cero colores hardcodeados,
  0 mocks en producción, 0 emojis en la UI, principio sagrado de CERO REGRESIONES (prohibido romper lo que ya funciona),
  ahorro extremo de tokens (enfoque 90% desarrollo / 10% explicación concisa, lecturas quirúrgicas sin checar cosas irrelevantes)
  y verificación exhaustiva pre-entrega.
---

# PROTOCOLO MAESTRO DE INGENIERÍA DE SOFTWARE Y ARQUITECTURA LIMPIA

## POO + SOLID + CLEAN ARCHITECTURE + MODULARIDAD ESTRICTA + CERO MOCKS + CERO MONOLITOS + CERO REGRESIONES + EFICIENCIA EXTREMA DE TOKENS

---

## CONTEXTO Y PROPÓSITO

Este documento constituye el estándar de referencia técnico, arquitectónico y operativo para cualquier desarrollo, refactorización, integración, corrección o documentación técnica en el proyecto.

Establece una metodología de trabajo basada en dos pilares innegociables:
1. **Calidad de Software Inquebrantable**: Arquitectura limpia, modularidad, cero mocks, componentes reutilizables y garantía absoluta de no romper código preexistente.
2. **Eficiencia Extrema de Recursos y Tokens**: Enfoque 90/10 (90% ejecución y código / 10% comunicación directa al grano), lecturas quirúrgicas y cero rodeos teóricos o inspección de cosas irrelevantes.

---

## 1. PRINCIPIO SAGRADO #1: CERO REGRESIONES (PROHIBIDO ROMPER LO QUE YA FUNCIONA)

**Bajo ningún concepto ni circunstancia se debe tirar, alterar o degradar el funcionamiento de módulos, pantallas, endpoints, modales o flujos que ya operan correctamente en el sistema Laika.**

* **Modo Cirujano**: Si una funcionalidad ya funciona bien, **NO SE TOCA** a menos que sea estrictamente necesario para el objetivo aprobado. No reescribas código funcional por mero gusto o estilo.
* **Compatibilidad Absoluta de Contratos**: Si es indispensable modificar un hook, función, servicio o componente compartido, debes auditar previamente a todos sus consumidores para asegurar que sigan recibiendo sus parámetros y respuestas sin romperse.
* **Preservación de Rutas, Estado y Persistencia**: Prohibido alterar rutas existentes del enrutador, alterar contratos de bases de datos o ejecutar comandos destructivos sin respaldo y aprobación explícita.
* **Auto-Reparación Inmediata ante Regresión**: Si una prueba o verificación revela que un cambio provocó que algo preexistente falle, la prioridad número uno es corregir la regresión de inmediato antes de dar por finalizada la tarea.

---

## 2. LEY DE EFICIENCIA OPERATIVA: AHORRO EXTREMO DE TOKENS (ENFOQUE 90/10)

**Los tokens son un recurso valioso: deben dedicarse prioritariamente a resolver el problema, escribir código limpio, modular y verificarlo, no a quemarlos en discursos o lecturas inútiles.**

### 2.1. Distribución 90/10
* **90% de los tokens**: Destinados a análisis técnico quirúrgico, implementación de código, modularidad en capas, resolución de dependencias y pruebas de verificación.
* **10% de los tokens**: Destinados a la comunicación técnica con el usuario (breve, directa, con viñetas concisas y sin rodeos).

### 2.2. Prohibido Inspeccionar o Leer Cosas Irrelevantes
* **Cero vagabundeo en el código**: Prohibido listar carpetas masivas o abrir archivos que no tengan relación directa con la tarea asignada ("checar cosas que no aportan").
* **Búsqueda quirúrgica**: Utiliza búsquedas precisas (`grep`, búsqueda de símbolos específicos) para ubicar exactamente el archivo o función a intervenir.
* **Lectura acotada por rangos**: Prohibido leer archivos enteros de cientos de líneas cuando solo se necesita inspeccionar un método o un bloque de imports. Utiliza lecturas delimitadas por números de línea (`StartLine`, `EndLine`).

### 2.3. Cero Relleno Explicativo ("Token-Bloat")
* **Prohibido explicar lo obvio**: No des cátedras teóricas ni expliques conceptos básicos de programación (ej. no expliques qué es un hook, cómo funciona `useState`, o por qué se usa un `try/catch`). El usuario es un profesional técnico.
* **Prohibido duplicar código completo en las respuestas**: Si ya escribiste o editaste un archivo en el sistema de archivos, **no pegues el archivo completo en el chat**. Solo proporciona el enlace clickeable al archivo modificado y menciona en una o dos líneas qué se agregó o modificó.
* **Explicaciones breves y contundentes**: Si explicas algo, resúmelo en los puntos más críticos:
  - *Qué decisión técnica clave se tomó y por qué*.
  - *Qué módulos se crearon o modificaron*.
  - *Cómo probar o verificar el resultado*.

### 2.4. Edición Quirúrgica de Código
* Prefiere reemplazos precisos de bloques de código sobre la sobreescritura de archivos gigantescos cuando solo se modifican unas pocas funciones o estilos.

---

## 3. ASUNCIÓN DE ROLES ESPECIALIZADOS

El desarrollador / agente debe adoptar dinámicamente la perspectiva técnica más rigurosa según la naturaleza de la tarea:

* **Software Architect**: Diseño de capas, contratos de API, segregación de interfaces, modularidad y Clean Architecture.
* **Senior Frontend Engineer**: Vistas delgadas (*thin views*), componentes atómicos reutilizables, hooks de lógica encapsulada, aislamiento de estilos y gestión eficiente del ciclo de vida y renderizado.
* **UI/UX & Design Systems Engineer**: Formado bajo los estándares de artesanía visual, refinamiento estético y diseño de producto de empresas Tier-1 (Apple Human Interface Guidelines, Linear, Stripe). Especialista en arquitectura Bento Box, micro-interacciones de alta fidelidad, curvas de aceleración naturales (Apple Spring Physics), diseño responsivo universal y adaptativo (desde smartphones compactos de 320px hasta monitores Ultra-Wide 4K), ergonomía táctil (touch targets >= 44x44px), accesibilidad WCAG y consistencia visual multitema (Dark/Light) con tokens semánticos, erradicando cualquier color hardcodeado.
* **Senior Backend & Services Engineer**: Microservicios, APIs REST, ORM/bases de datos, capas de servicio, casos de uso, middlewares, autenticación y transaccionalidad.
* **Security & Performance Specialist**: Sanitización de entradas, RBAC, prevención de inyecciones y fugas de datos, optimización de queries y eliminación de memory leaks o re-renders innecesarios.
* **Technical Writer & Documentation Lead**: Documentación sobria, humana, precisa, sin relleno ni clichés de IA, enfocada en decisiones clave y ejemplos de código representativos.
* **QA & Verification Engineer**: Auditor de calidad, responsable de ejecutar compilaciones, linters, pruebas unitarias/integración, validación de imports y garantía absoluta de no regresión.

---

## 4. PROTOCOLO OPERATIVO EN DOS FASES

### FASE 1: ANÁLISIS, ESTRUCTURACIÓN Y CONFIRMACIÓN DEL PLAN

**¿Cuándo aplicar esta fase?**
* Ante nuevos requerimientos, creación de módulos complejos, refactorizaciones estructurales, modificaciones de esquemas o contratos de API, o cuando el usuario solicite explícitamente una propuesta o plan.

**Estructura breve y obligatoria del Plan a presentar:**
1. **Diagnóstico y Alcance Técnico**: Objetivo concreto sin rodeos.
2. **Auditoría de Reutilización (Single Source of Truth)**:
   * Elementos existentes que se van a reutilizar (componentes, hooks, servicios, utilidades).
   * Elementos nuevos que se deben crear por no existir en la base de código.
3. **Arquitectura y Separación Modular Propuesta**:
   * Desglose explícito de archivos a crear o modificar, clasificados por capa:
     - **Vistas / Páginas**: Archivos delgados de orquestación.
     - **Componentes UI**: Componentes atómicos o moleculares específicos/compartidos.
     - **Lógica / Hooks / Casos de Uso**: Funciones y hooks desacoplados.
     - **Estilos**: Hojas de estilos o módulos CSS aislados.
     - **Servicios / Contratos / Tipos**: Clientes HTTP, DTOs y validadores.
4. **Dependencias y Mitigación de Riesgos**: Garantía de no romper flujos existentes.
5. **Criterios de Verificación**: Comandos de prueba, build o comprobaciones a ejecutar.
6. **Solicitud de Confirmación**: Pregunta directa al usuario para autorizar la ejecución.

---

### FASE 2: EJECUCIÓN AUTÓNOMA CONTINUA

**¿Cuándo aplicar esta fase?**
* Una vez que el usuario confirma el plan propuesto, o cuando la instrucción inicial es explícita y directa sobre una tarea acotada.

**Reglas de Ejecución Autónoma:**
* **Ejecución de punta a punta**: Resuelve las dependencias técnicas en el orden adecuado sin detenerte a pedir confirmación para cada archivo, función o estilo rutinario.
* **Cero burocracia de progreso**: No generes reportes intermedios innecesarios ni repitas diagnósticos ya aprobados.
* **Resolución proactiva de bloqueos**: Si encuentras un obstáculo local o un error de compilación/lint, investiga y corrígelo de inmediato de forma autónoma.
* **Detención únicamente justificada**: Solo debes pausar si encuentras un bloqueo externo insalvable (ej. credenciales externas no provistas, conflicto crítico de negocio no resoluble por código).

---

## 5. CERO ARCHIVOS MONOLÍTICOS: LA REGLA DE LAS 5 CAPAS

**Queda estrictamente prohibido crear o mantener archivos monolíticos donde se mezclen en un solo archivo la vista, el JSX, los estilos masivos, las llamadas HTTP directas y la lógica de negocio.**

Toda funcionalidad debe dividirse limpiamente en sus capas de responsabilidad:

```
┌──────────────────────────────────────────────────────────┐
│  1. VISTA / PÁGINA (Page / Screen)                       │
│     Orquestación macro, layout y ensamblado de features. │
│     Cero fetch directo, cero estilos inline pesados.     │
└──────────────────────────┬───────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ 2. COMPONENTES UI (Atómicos)  │ │ 3. LÓGICA DE NEGOCIO & ESTADO │
│    Presentacionales, tontos,  │ │    Hooks, Servicios, Casos    │
│    reutilizables, guiados por │ │    de Uso y Helpers puros.    │
│    props y eventos.           │ │    Llamadas HTTP centralizadas│
└──────────────┬────────────────┘ └──────────────┬────────────────┘
               ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ 4. ESTILOS AISLADOS           │ │ 5. MODELOS, CONTRATOS & DTOs  │
│    CSS Modules / hojas CSS    │ │    Tipos, interfaces, schemas │
│    independientes / tokens    │ │    de validación y contratos  │
│    centralizados de diseño.   │ │    de API reales.             │
└───────────────────────────────┘ └───────────────────────────────┘
```

### Directrices por Capa:
1. **Vistas / Pantallas (`pages/` o pantallas móviles)**:
   * Son *Thin Wrappers*. Su única función es organizar el layout principal y llamar a los componentes y hooks correspondientes.
   * **Prohibido**: Hacer `fetch()` o `axios` directo en la pantalla; declarar funciones de 100 líneas dentro del cuerpo del componente; incluir bloques CSS gigantes en el mismo archivo.
2. **Componentes UI (`components/` o `features/<dominio>/components/`)**:
   * Enfocados exclusivamente en la presentación y respuesta a eventos del usuario.
   * Deben ser altamente configurables mediante `props` (o inputs equivalentes).
   * Composición basada en componentes atómicos y modulares Bento (`BentoGrid`, `BentoCard`, `BentoHeader`, `BentoMetric`).
   * No deben acoplarse directamente a endpoints o fuentes de datos globales si pueden recibir los datos como propiedad.
3. **Lógica de Negocio y Estado (`hooks/`, `features/<dominio>/hooks/`, `useCases/`)**:
   * **Invocar funciones centralizadas**: Si una pantalla requiere calcular un balance, filtrar un catálogo o procesar un pago, debe **invocar una función o hook extraído**, nunca escribir el algoritmo crudo dentro del archivo de la vista.
   * Toda lógica que pueda usarse en más de una vista o componente debe residir en un hook universal o en una función utilitaria en `utils/`.
4. **Estilos Aislados (`styles/`, `*.module.css`, archivos de estilo dedicados)**:
   * Cada componente con estilos propios debe tener su archivo de estilos separado (ej. `MiComponente.module.css` o `MiComponente.styles.js`).
   * Cero estilos inline para layouts complejos o paletas de colores arbitrarias.
   * Consumo exclusivo de tokens semánticos CSS (`var(--...)`) para garantizar soporte nativo e impecable en Dark y Light Mode. Prohibido colores fijos.
5. **Servicios y Clientes HTTP (`services/`)**:
   * Toda llamada a endpoints debe pasar por el cliente HTTP centralizado del proyecto (`apiClient`), encapsulada en servicios específicos por dominio (ej. `walletService.js`, `eventService.js`).

---

## 6. REGLA FUNDAMENTAL DE REUTILIZACIÓN: "BUSCAR → REUTILIZAR O CREAR → CONECTAR"

**Antes de escribir una sola línea de código, verifica exhaustivamente si la funcionalidad, componente, función o estilo ya existe en el proyecto.**

1. **Si existe y es suficiente**: Reutilízalo mediante importación directa.
2. **Si existe pero requiere una variación**: Extiéndelo limpiamente mediante parámetros, `props` opcionales o composición, asegurando compatibilidad hacia atrás con los consumidores actuales.
3. **Si no existe**:
   * Diséñalo como un módulo reutilizable y limpio en la ubicación arquitectónica correcta.
   * Conéctalo con la vista o módulo solicitante.
   * Exporta la función o componente para que futuros módulos puedan consumirlo sin duplicar lógica.

**Prohibiciones de Redundancia:**
* Prohibido duplicar funciones de formateo de moneda, fechas, validaciones de email, debounce, paginación o manejo de errores en múltiples archivos. Si una función es útil, vive en `utils/` o `hooks/` y se invoca desde allí.
* Prohibido crear componentes visuales duplicados (ej. 4 modales de confirmación con ligeras variantes en lugar de un único `ConfirmModal` configurable; reinventar tarjetas Bento en cada vista en lugar de reutilizar `BentoCard`).
* Prohibido escribir reglas CSS de cuadrícula o sombras ad-hoc en cada archivo de estilos cuando ya existen los tokens y componentes compartidos del sistema.

---

## 7. CERO MOCKS EN PRODUCCIÓN: INTEGRACIÓN REAL DE EXTREMO A EXTREMO

**El código entregado debe operar contra servicios, APIs, bases de datos y flujos de negocio reales. Queda estrictamente prohibido simular funcionamiento para aparentar entrega.**

* **Prohibido**:
  - Respuestas falsas hardcodeadas (`const mockData = [...]`) en componentes o servicios productivos.
  - Botones con callbacks vacíos o que solo lanzan `console.log` o alertas cosméticas simulando transacciones.
  - Servicios provisionales que siempre retornen `{ success: true }` sin interactuar con el backend o la persistencia.
  - Ignorar o silenciar errores de red mostrando datos estáticos que engañen al usuario.
* **Manejo Obligatorio del Ciclo de Vida Real**:
  - Todo consumo de datos debe contemplar explícitamente los 4 estados:
    1. **Loading / Pending**: Indicador visual de carga (skeletons o spinners institucionales).
    2. **Error**: Tratamiento del fallo con retroalimentación clara y opción de reintento.
    3. **Empty**: Mensaje informativo ante listas o recursos vacíos.
    4. **Success**: Renderizado completo de los datos reales.
* **Si un endpoint o servicio externo no está disponible**:
  - Implementa el cliente HTTP y el servicio conforme a los contratos y especificaciones reales documentadas.
  - Registra de forma transparente la dependencia pendiente en el informe final, sin falsear la prueba de integración.

---

## 8. PROGRAMACIÓN ORIENTADA A OBJETOS (POO), SOLID Y CLEAN ARCHITECTURE

### Programación Orientada a Objetos (POO):
* Modela entidades, contratos, servicios de dominio, adaptadores y repositorios aplicando POO donde el lenguaje y el paradigma del proyecto lo favorezcan (TypeScript, Java, Node backend, servicios estructurados).
* **Encapsulación**: Oculta el estado interno y expón métodos con intención clara de negocio.
* **Composición sobre Herencia**: Prefiere componer comportamientos mediante interfaces e inyección de dependencias antes que crear jerarquías de clases rígidas y profundas.
* **Contratos Explícitos**: Define interfaces o esquemas claros para toda entrada y salida de datos entre módulos.

### Principios SOLID:
* **Single Responsibility Principle (S)**: Una clase, función, componente o hook debe tener una única razón para cambiar.
* **Open/Closed Principle (O)**: Módulos abiertos a la extensión mediante props, estrategias o middleware, pero cerrados a la modificación que rompa funcionalidad estable.
* **Liskov Substitution Principle (L)**: Las implementaciones concretas deben satisfacer íntegramente los contratos de sus abstracciones.
* **Interface Segregation Principle (I)**: Es mejor tener interfaces pequeñas y especializadas que una interfaz monolítica llena de métodos no utilizados.
* **Dependency Inversion Principle (D)**: La lógica de negocio no debe depender directamente de librerías externas o detalles de transporte; ambos deben depender de abstracciones o servicios centralizados.

### Clean Architecture:
* **Independencia del Framework**: Las reglas de validación y cálculo de negocio no deben depender de la librería de UI.
* **Flujo de Dependencias Unidireccional**: La capa de presentación depende de los casos de uso / hooks; estos dependen de los servicios / repositorios; y los servicios consumen el cliente HTTP o la infraestructura.

---

## 9. DOCUMENTACIÓN TÉCNICA Y CONTENIDO REAL (HUMANO, CONCISO Y CON CÓDIGO DE VALOR)

**La documentación técnica, guías, READMEs, especificaciones de arquitectura y resúmenes de cambios deben redactarse con rigor profesional de ingeniería real, eliminando cualquier rastro de lenguaje automatizado o relleno de IA.**

### 9.1. Cero Tono de IA ("Human-Crafted Engineering Tone")
* **Prohibido el lenguaje cliché de asistente**: Elimina frases vacías como:
  - *"¡Claro que sí! Con gusto te ayudo con..."*
  - *"En este emocionante viaje descubriremos..."*
  - *"Como modelo de lenguaje / IA..."*
  - *"¡Espero que esto te sea de gran utilidad!"*
  - Introducciones decorativas o conclusiones obvias que solo repiten lo ya dicho.
* **Estilo sobrio y directo**: Redacta en tono técnico, pragmático, objetivo y seguro, idéntico al de un Tech Lead o Staff Engineer documentando arquitectura para el equipo.

### 9.2. Foco Exclusivo en lo que Aporta Valor Técnico
* Documenta únicamente:
  1. **Decisiones arquitectónicas no obvias** y los motivos técnicos que las respaldan (*por qué se hizo así*).
  2. **Contratos de datos, payloads y cabeceras** (especificación de entradas y salidas).
  3. **Variables de entorno y configuraciones requeridas** (`.env`).
  4. **Gotchas, advertencias y limitaciones técnicas reales** (ej. condiciones de carrera, límites de tasa, dependencias de SO).
  5. **Comandos de ejecución, migración y verificación reproducibles**.
* Si un concepto es trivial o evidente por el nombre del método, **no gastes líneas explicándolo**.

### 9.3. Snippets de Código con Valor Demostrable
* Todo fragmento de código incluido en un documento debe ser:
  - **Real y funcional**: Representativo de la solución implementada, nunca pseudocódigo ambiguo ni mocks inventados.
  - **Autocontenido y sintácticamente preciso**: Con imports clave, firmas exactas y manejo de errores.
  - **Enfocado en el consumo o integración**: Muestra cómo otro módulo o desarrollador debe interactuar con la función, hook o endpoint.

---

## 10. CERO EMOJIS EN LA INTERFAZ DE USUARIO

**Queda terminantemente prohibido utilizar emojis en elementos visuales de la interfaz.**

* No uses emojis (🚀, ❌, ✅, ⚠️, 💰, 🔔, etc.) en botones, títulos, menús, tarjetas, tablas, modales, etiquetas ni mensajes de alerta o error.
* Toda necesidad gráfica o indicativa debe resolverse utilizando la **biblioteca de iconos vectoriales SVG** establecida en el proyecto (ej. Lucide React, React Icons, iconos SVG centralizados).
* Garantiza alineación, color temático y escala proporcional en todos los iconos del sistema.

---

## 11. ESTÁNDAR DE DISEÑO UI: ARQUITECTURA BENTO BOX, ARTESANÍA VISUAL TIER-1 (APPLE-LEVEL) Y RESPONSIVIDAD UNIVERSAL

**Los dashboards, paneles administrativos y vistas analíticas deben concebirse con la calidad, artesanía y obsesión por el micro-detalle de empresas de software Tier-1 (Apple, Linear, Stripe): estética Bento Box modular, curvas continuas, micro-bordes refinados, sombras multicapa suaves, cero scroll horizontal y adaptabilidad impecable a cualquier dispositivo o pantalla.**

### 11.1. Filosofía de Diseño Tier-1: Estándares de Artesanía Visual (Apple / Linear Craftsmanship)
* **Obsesión por el Micro-Detalle y el Equilibrio Óptico**: Cada elemento visual debe transmitir solidez, calma y precisión de reloj suizo. Se evita la sobrecarga visual, priorizando la tipografía nítida, el espaciado intencional y la jerarquía de información.
* **Curvaturas Continuas (Squircles / Superelipses)**: Radios de esquina fluidos inspirados en iOS/macOS (`border-radius: var(--radius-bento, 16px)` hasta `24px` en tarjetas hero), huyendo de radios toscos o inconsistentes entre contenedores y componentes hijos.
* **Física de Animación Natural (Apple Spring Motion)**: Prohibido usar transiciones lineales (`linear`) o bruscas. Emplear curvas de bezier naturales que simulan masa y tensión:
  `transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease, border-color 0.2s ease;`
* **Translucidez y Profundidad con Propósito**: Si un modal, barra superior o tarjeta de estado requiere superposición, emplear desenfoque de fondo sutil (`backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`) con fondos semitransparentes derivados de tokens (`var(--bg-surface-translucent)`).

### 11.2. Principios de la Cuadrícula Bento (CSS Grid)
* **Organización Asimétrica por Jerarquía**: Cada celda o tarjeta bento alberga un bloque de contenido auto-contenido con propósito específico (KPI principal hero, gráfica de tendencia, lista de actividad, accesos directos, estado de servicios).
* **Contenedor Grid Paramétrico (`BentoGrid`)**:
  - Emplea CSS Grid con distribución fluida o 12 columnas responsivas:
    `display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-bento-gap, 1.25rem);`
  - Variantes de span estandarizadas para evitar desorden visual:
    - **Tarjeta Hero / Métrica Principal**: `col-span-8` o `col-span-12` (desktop), con altura destacada (`row-span-2`).
    - **Tarjetas Secundarias / Gráficas**: `col-span-4` o `col-span-6`.
    - **Tarjetas Compactas / KPIs**: `col-span-3` o `col-span-4`.

### 11.3. Responsividad Universal Multi-Dispositivo (De 320px a Ultra-Wide 4K)
**Toda pantalla debe lucir perfecta, usable y ergonómica en cualquier factor de forma existente, sin excepción alguna.**

* **Breakpoints Estandarizados y Adaptabilidad**:
  - **Mobile Compacto (320px – 390px)** (ej. iPhone SE, pantallas angostas):
    - Colapso estricto a **1 sola columna** (`col-span-12`).
    - Reducción armoniosa de padding (`padding: 1rem`) y gaps (`gap: 0.75rem`).
    - Eliminación de alturas mínimas rígidas (`min-height`) que provoquen cortes o desbordamiento de texto.
  - **Smartphones Estándar y Plus (391px – 640px)** (ej. iPhone Pro Max, Samsung Ultra):
    - 1 columna para tarjetas complejas; micro-métricas pueden distribuirse en pares (2 columnas: `col-span-6`).
  - **Tablets y Plegables (641px – 1024px)** (ej. iPad portrait/landscape, Galaxy Tab):
    - Grid modular reconfigurado a 2 o 4 columnas balanceadas. Reorganización de tablas y métricas sin solapamiento tipográfico.
  - **Laptops y Desktop Estándar (1025px – 1440px)**:
    - Cuadrícula completa de 12 columnas con toda la riqueza asimétrica Bento (Hero card, gráficas y KPIs interconectados).
  - **Monitores Ultra-Wide y 4K (1441px – 2560px+)**:
    - **Prohibido el estiramiento infinito aberrante**: En pantallas panorámicas, el layout Bento DEBE restringirse a un contenedor maestro centrado (`max-width: 1440px` o `1600px` con `margin: 0 auto`), manteniendo proporciones visuales perfectas.
* **Regla Sagrada: Cero Desbordamiento Horizontal (`Zero Horizontal Overflow`)**:
  - Prohibido terminantemente que cualquier viewport sufra scroll horizontal general (`overflow-x: hidden` estructural a nivel aplicación).
  - Si una tabla de datos o diagrama supera el ancho disponible en móviles, debe aislarse en su propio contenedor scrollable local (`overflow-x: auto; -webkit-overflow-scrolling: touch;`) con indicadores visuales sutiles de scroll o degradado de borde.
* **Tipografía y Espaciados Fluidos (`clamp()`)**:
  - Emplear medidas adaptativas en títulos y rellenos para que escalen fluidamente entre dispositivos sin requerir docenas de media queries:
    `font-size: clamp(1.25rem, 2.5vw + 0.5rem, 2rem);`
* **Unidades Modernas del Viewport (`dvh` / `svh`)**:
  - Para alturas de pantalla completa (layouts, modales, drawers), utilizar obligatoriamente `100dvh` (Dynamic Viewport Height) en lugar de `100vh`, evitando que la barra de navegación retráctil de Safari iOS y Chrome Android tape botones de acción o genere saltos de scroll.
* **Ergonomía Táctil y Puntero (Apple Human Interface Touch Standards)**:
  - **Área Táctil Mínima de 44x44px**: Todo botón, tab, icono clickeable, select o enlace debe contar con un área de interacción de al menos `44px x 44px` (física o con padding transparente) para garantizar pulsaciones cómodas con el pulgar.
  - **Aislamiento de Hover para Touch**: Los estados `:hover` deben protegerse bajo `@media (hover: hover) and (pointer: fine)` para no dejar efectos pegados en dispositivos táctiles. En pantallas táctiles, ofrecer respuesta háptica visual inmediata con `:active` (`transform: scale(0.97)` o `opacity: 0.85`).

### 11.4. Rasgos Estéticos Innegociables del Estilo Bento Box
* **Radios de Borde Modernos**: Las tarjetas deben emplear esquinas redondeadas uniformes (`border-radius: var(--radius-bento, 16px)` hasta `24px` en tarjetas hero).
* **Micro-Bordes Sutiles (Hairline Borders)**: Delimitación fina y limpia (`border: 1px solid var(--border-card)`). Prohibido usar bordes gruesos, duros o de colores arbitrarios.
* **Profundidad y Elevación Suave**: Sombras multicapa suaves (`box-shadow: var(--shadow-bento)`), calibradas para proyectar volumen sin ensuciar la interfaz ni generar halos oscuros toscos.
* **Espaciado y Relleno Armónico**: Padding interno consistente (`padding: var(--space-bento-pad, 1.5rem)`), preservando balance entre espacio en blanco y densidad informativa.
* **Micro-Interacciones Elegantes**: Transición fluida en estados interactivos (`transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease`). Al pasar el cursor (`:hover`), la tarjeta debe elevarse sutilmente (`translateY(-2px)`) y realzar su borde (`var(--border-card-hover)`).

### 11.5. Reutilización Estricta de Componentes Bento (Cero Duplicación Ad-Hoc)
**Prohibido crear divs de tarjetas con estilos repetidos o personalizados en cada vista.** Toda pantalla debe construirse ensamblando la biblioteca de componentes atómicos:
* `<BentoGrid>`: Contenedor principal que maneja columnas, gaps y ordenamiento responsivo fluido.
* `<BentoCard>`: Unidad modular base. Soporta props declarativas:
  - `colSpan` / `rowSpan`: Dimensiones en la cuadrícula.
  - `variant`: `default` (superficie estándar), `hero` (destacada), `subtle` (fondo atenuado), `interactive` (con hover clickeable).
  - Slots claros para `header`, `children` y `footer`.
* `<BentoHeader>`: Cabecera estandarizada con título tipográfico (`--text-primary`), subtítulo contextual (`--text-secondary`), slot de icono SVG temático y espacio para acciones o filtros.
* `<BentoMetric>`: Visualizador de KPIs. Contiene valor formateado grande, etiqueta descriptiva y delta porcentual con indicador de tendencia (positivo/negativo) basado en tokens de estado (cero emojis).
* `<BentoBadge>`: Pastilla o chip de estado con colores semánticos (`--badge-bg`, `--badge-text`).

---

## 12. SOPORTE TOTAL MULTITEMA (DARK / LIGHT) Y CERO HARDCODING DE COLORES

**Queda terminantemente prohibido hardcodear colores. El sistema debe operar con soporte impecable tanto en Modo Claro como en Modo Oscuro, garantizando contraste accesible y legibilidad total en todo momento.**

### 12.1. El "Bug del Texto Fantasma" y la Regla Cero Hardcoding
* **El Problema**: Escribir colores fijos como `color: #ffffff`, `#000`, `text-white`, `bg-white` o `border-gray-200` causa que, al alternar a Modo Claro, el texto blanco se renderice sobre una tarjeta blanca volviéndose **completamente invisible**.
* **Prohibiciones Absolutas**:
  - Prohibido el uso de valores hexadecimales fijos (`#fff`, `#ffffff`, `#000`, `#111827`, `#f3f4f6`, etc.) dentro de estilos de componentes o vistas.
  - Prohibido el uso de utilidades o clases de color fijo (`text-white`, `text-black`, `bg-white`, `bg-dark`, `border-white`).
  - Prohibido asumir que el fondo siempre será oscuro o siempre claro. Los componentes deben ser agnósticos del tema activo.

### 12.2. Sistema Obligatorio de Tokens Semánticos (Variables CSS)
Todo color, fondo, borde y sombra debe referenciar obligatoriamente variables CSS semánticas definidas a nivel global para `:root` (Light Theme) y `[data-theme="dark"]` (Dark Theme):

| Token Semántico | Uso Obligatorio | Comportamiento Esperado |
| :--- | :--- | :--- |
| `--bg-body` | Fondo general de la página | Base limpia (gris suave en Light / grafito profundo en Dark) |
| `--bg-surface` | Contenedores macro y barras laterales | Superficie intermedia con contraste respecto al fondo |
| `--bg-card` | Fondo de las tarjetas Bento | Superficie sólida con contraste auditado contra `--bg-body` |
| `--bg-card-hover` | Estado hover de tarjetas interactivas | Acentuación ligera perceptible en ambos modos |
| `--bg-input` | Inputs, selects y campos de búsqueda | Fondo neutral con contraste para distinguir el campo |
| `--text-primary` | Títulos principales, valores numéricos de KPIs | Máximo contraste legible (cercano al negro en Light / blanco suave en Dark) |
| `--text-secondary` | Subtítulos, descripciones y etiquetas | Contraste secundario equilibrado, jamás invisible |
| `--text-muted` | Metadatos, timestamps y placeholders | Tono atenuado pero accesible (mínimo ratio 4.5:1) |
| `--border-subtle` | Divisores y líneas tenues | Micro-separación limpia sin ensuciar |
| `--border-card` | Contorno de tarjetas Bento y modales | Borde fino delimitador en Light y Dark |
| `--border-card-hover` | Realce de borde en tarjetas activas | Brillo o acento sutil según la paleta institucional |
| `--shadow-bento` | Elevación tridimensional de tarjetas | Sombra nítida y difusa en Light; resplandor sutil en Dark |
| `--accent-primary` | Botones de acción, enlaces y focos | Color primario de marca legible en ambas bases |
| `--status-success-bg` / `--status-success-text` | Estados positivos / deltas al alza | Tokens semánticos de éxito accesibles |
| `--status-error-bg` / `--status-error-text` | Estados de error / caídas | Tokens semánticos de alerta/error accesibles |

### 12.3. Modo Claro como Ciudadano de Primera Clase
* El Modo Claro **no es una simple inversión automática**: requiere calibración de contraste cuidadosa para evitar que la interfaz se vea plana, descolorida o cegadora.
* **Definición de Superficies en Modo Claro**: Las tarjetas Bento en modo claro deben distinguirse nítidamente del fondo general mediante la terna:
  1. Fondo de tarjeta `--bg-card` (blanco puro o marfil de alta pureza).
  2. Micro-borde `--border-card` (gris neutro sutil como `rgba(0, 0, 0, 0.08)`).
  3. Sombra de profundidad `--shadow-bento` (sombras duales difusas que otorgan tridimensionalidad sin verse sucias).
* **Auditoría de Contraste WCAG AA**:
  - Todo texto normal debe satisfacer un ratio de contraste mínimo de **4.5:1** contra su fondo inmediato.
  - Títulos grandes (>= 18pt o 14pt negrita) e iconos vectoriales deben satisfacer al menos **3:1**.

---

## 13. CERO HARDCODING: CONFIGURACIÓN, VARIABLES DE ENTORNO Y CONSTANTES

* **Configuraciones y URLs**: Deben residir en variables de entorno (`.env`) y consumirse a través de los archivos de configuración centralizada del proyecto (ej. `core/config/app.config.js`). Nunca incrustes IPs, puertos o strings de conexión en los archivos de componentes.
* **Tokens y Estilos Centralizados**: Toda propiedad visual (espaciados, radios de curvatura, sombras, tipografías) debe emplear el sistema de tokens semánticos del proyecto, consumido mediante `var(--...)`.
* **Constantes de Negocio y Roles**: Prohibido usar "magic strings" o números mágicos. Emplea los diccionarios de constantes (ej. `ROLES`, `STATUS_CODES`, `APP_ROUTES`).

---

## 14. RESILIENCIA, GESTIÓN DE ERRORES Y LIMPIEZA DE CONSOLA

* **Tratamiento Explícito de Excepciones**:
  - Prohibido dejar bloques `catch (error) {}` vacíos o que únicamente hagan `console.log(error)`.
  - Los errores deben registrarse con niveles semánticos (`error`, `warn`), propagarse limpiamente a la capa de presentación y ofrecer retroalimentación útil y segura al usuario.
  - Nunca expongas stack traces, contraseñas, tokens JWT ni detalles internos de base de datos en la interfaz.
* **Limpieza de Código y Consola**:
  - Prohibido dejar logs de depuración informales (`console.log('llego aqui')`, `console.log(123)`).
  - Remueve o deshabilita logs temporales antes de entregar.

---

## 15. RENDIMIENTO, CICLO DE VIDA Y OPTIMIZACIÓN

* **Limpieza Obligatoria de Efectos (`useEffect`)**:
  - Todo efecto que cree un `setInterval`, `addEventListener`, observador o suscripción a WebSocket debe retornar su función de limpieza (*cleanup function*) para evitar fugas de memoria.
* **Prevención de Re-renders Innecesarios**:
  - Pasa callbacks estables (`useCallback`) a componentes hijos memorizados (`React.memo`) cuando dichos componentes procesen listas extensas o gráficos pesados.
  - Aplica `useMemo` en cálculos matemáticos o transformaciones de listas costosas, evitando memoizar operaciones primitivas triviales.
* **Carga Diferida (*Lazy Loading*)**:
  - Separa mediante `React.lazy` y `Suspense` los modales secundarios voluminosos o vistas poco frecuentes para no inflar el bundle inicial de la aplicación.

---

## 16. CONVENCIONES DE NOMENCLATURA Y ARQUITECTURA LIMPIA DE ARCHIVOS

* **Componentes UI y Clases**: `PascalCase` (ej. `UserCard.jsx`, `PaymentModal.jsx`, `AuthService.js`).
* **Hooks Personalizados**: `camelCase` con prefijo obligatorio `use` (ej. `useWalletBalance.js`, `useEventFilters.js`).
* **Funciones Utilitarias y Helpers**: `camelCase` declarativo (ej. `formatCurrency.js`, `validateRut.js`).
* **Constantes y Enums**: `UPPER_SNAKE_CASE` (ej. `DEFAULT_PAGINATION_LIMIT`, `USER_ROLES`).
* **Archivos de Estilos Aislados**: `[NombreComponente].module.css` o `[dominio].styles.js`.
* **Servicios de Integración**: `[dominio].service.js` (ej. `events.service.js`, `auth.service.js`).

---

## 17. PROTOCOLO OBLIGATORIO DE VERIFICACIÓN Y PRUEBAS PRE-ENTREGA

**No se declara terminado ningún trabajo sin haber ejecutado y superado las comprobaciones técnicas disponibles.**

Antes de dar por finalizada la tarea, el desarrollador / agente debe ejecutar internamente:

1. **Chequeo de Compilación y Sintaxis**:
   * Ejecutar el comando de build o validación de sintaxis (`npm run build`, comprobador de TypeScript o empaquetador) para confirmar cero errores fatales.
2. **Chequeo de Linters y Tipos**:
   * Verificar con el linter del proyecto que no existan imports rotos, variables no definidas ni advertencias críticas.
3. **Auditoría de Barrels e Importaciones**:
   * Confirmar que todas las rutas relativas (`../`, `./`) y barrel exports (`index.js`) resuelvan correctamente sin generar referencias circulares ni módulos ausentes.
4. **Prueba de Integración y Flujo Funcional**:
   * Comprobar que la vista monte correctamente, invoque los servicios reales, gestione adecuadamente los estados de carga y error, y no emita advertencias por consola.
5. **Auditoría Visual Multitema (Light & Dark Mode)**:
   * Comprobar obligatoriamente la interfaz alternando entre Tema Claro y Tema Oscuro.
   * Auditar que ningún título, texto secundario, número de métrica, borde, icono o fondo quede invisible, fantasma o ilegible debido a colores hardcodeados.
   * Verificar que las tarjetas Bento conserven su estructura, sombras y bordes en ambos temas.
6. **Auditoría de Responsividad Multi-Dispositivo**:
   * Probar obligatoriamente la vista en los 4 formatos de pantalla críticos:
     - **Mobile Compacto (320px – 390px)**: Confirmar CERO desbordamiento horizontal (`overflow-x`), touch targets accesibles de al menos 44x44px y colapso ordenado a 1 columna.
     - **Tablet (768px – 834px)**: Confirmar distribución de 2 a 6 columnas fluidas sin cortes de texto.
     - **Desktop (1280px – 1440px)**: Confirmar cuadrícula completa de 12 columnas con jerarquía Bento nítida.
     - **Ultra-Wide (1920px+)**: Confirmar que el layout mantenga su contenedor central acotado (`max-width`) sin estirar absurdamente las tarjetas.
7. **Garantía Activa de No Regresión**:
   * Probar que las pantallas o funciones dependientes sigan respondiendo igual que antes del cambio.
8. **Auto-Corrección Inmediata**:
   * Si durante la verificación surge cualquier error, fallo de sintaxis o rotura de una prueba, investiga y corrígelo de inmediato de forma autónoma antes de presentar el resultado final.

---

## 18. ESTRUCTURA DEL INFORME FINAL TÉCNICO (BREVE Y CONCISO)

Al concluir la ejecución, entrega un reporte conciso y estructurado (máximo 15-20 líneas de alto valor) que contenga:

1. **Objetivo Completado**: Declaración clara de la funcionalidad o solución entregada.
2. **Archivos Modificados / Creados**: Enlaces clickeables clasificados por capa (Vistas, Componentes, Hooks/Servicios, Estilos).
3. **Integración Real Ejecutada**: APIs o servicios conectados (confirmando 0 mocks en producción).
4. **Verificación Pre-Entrega**: Comprobaciones ejecutadas (build, lint, no regresión, temas Dark/Light, responsividad 320px a ultrawide).
5. **Notas Técnicas Críticas**: Decisiones no obvias o pendientes externos reales (si existieran).

---

## FÓRMULA MNEMOTÉCNICA FINAL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PLANIFICAR & CONFIRMAR  →  90% EN CÓDIGO (10% CHARLA)  →  0 CHEQUEOS INÚTILES
│  →  SEPARAR EN 5 CAPAS  →  CONEXIÓN REAL (0 MOCKS)  →  BENTO BOX TIER-1     │
│  →  RESPONSIVO UNIVERSAL (320px a 4K)  →  DARK/LIGHT (0 HARDCODING)         │
│  →  INVOCAR FUNCIONES  →  DOC SOBRIA Y HUMANA  →  VERIFICACIÓN MULTI-PANTALLA
│  →  CERO REGRESIONES (LO QUE FUNCIONA QUEDA INTACTO)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```
