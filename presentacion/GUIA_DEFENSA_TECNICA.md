# Guía de Defensa Técnica — LAIKA Club

Documento de consulta rápida para responder con seguridad, fundamento real y lenguaje profesional cualquier pregunta técnica sobre el desarrollo, la arquitectura, las bases de datos, Docker, Microsoft Azure con Terraform, buenas prácticas, Git, pruebas y deuda técnica.

Cada bloque incluye una **respuesta corta de 15 segundos** para contestar directo al punto y el **respaldo técnico completo** en caso de que pidan mayor profundidad.

---

## 1. Por qué elegimos cada lenguaje y framework

### Java 17 con Spring Boot 3.2.5 en los microservicios transaccionales
- **Respuesta corta:** Elegimos Java con Spring Boot para el núcleo de ventas, boletos y usuarios porque exige tipado estático estricto, manejo real de concurrencia multihilo sin bloqueo global y un ecosistema empresarial maduro para proteger operaciones críticas de dinero e inventario.
- **Por qué Java y no Python en el núcleo transaccional:**
  - En Python estándar existe el Global Interpreter Lock, que limita el paralelismo real de hilos dentro de un mismo proceso para lógica intensiva y hace más frágil el tipado en tiempo de ejecución.
  - En Java 17 con Spring Boot 3.2.5 contamos con compilación estricta, **hilos virtuales de Spring**, **Spring Security**, **Spring Data JPA** y control explícito de concurrencia en memoria mediante `ConcurrentHashMap` y `ReentrantLock`.
  - Cuando 200 usuarios intentan apartar el mismo asiento en `laika_tickets`, un solo hilo completa la operación con `200 OK` y las peticiones simultáneas reciben `409 Conflict`, evitando sobreventa y doble cobro.
- **Compromiso asumido y cómo se resolvió:** La máquina virtual de Java consume más memoria base que otros lenguajes; lo resolvimos configurando `JAVA_TOOL_OPTIONS` con `SerialGC`, `TieredStopAtLevel=1`, `Xss256k`, `Xms48m` y `Xmx150m`, logrando que los 8 microservicios Java convivan con estabilidad dentro de una sola máquina virtual.

### Python con FastAPI, HTTPX y PySpark en Pilgrim y analítica
- **Respuesta corta:** Usamos Python donde ofrece su mayor ventaja competitiva: en **Pilgrim API Gateway** por la ligereza asíncrona de FastAPI con HTTPX, y en **analytics_bigdata** porque concentra el ecosistema líder de ciencia de datos y Machine Learning.
- **Por qué FastAPI en Pilgrim y no un gateway en Java:**
  - Aunque existe un módulo alternativo `microservices2/gateway` en Spring Boot, Pilgrim en FastAPI consume mucha menos memoria, arranca en segundos, enruta peticiones de forma asíncrona con `httpx.AsyncClient`, aplica caché en memoria para consultas `GET` con TTL de 60 segundos y genera bitácoras automáticas de latencias y errores HTTP.
- **Por qué PySpark y Scikit-learn en el puerto 8303:**
  - Permite ejecutar clustering K-Means, PCA, detección de bots, análisis de abandono de usuarios, saneamiento KDD y servir la sub-API ejecutiva **MATIS** sin cargar lógica analítica pesada sobre los servicios transaccionales de Java.

### React 19, Vite, SolidJS y React Native con Expo en clientes
- **Respuesta corta:** Elegimos React porque el equipo ya tenía dominio previo sobre él y nos permitía cubrir cualquier tamaño de pantalla y dispositivo con rapidez, sumando SolidJS donde se requería máxima reactividad analítica y React Native con Expo para llegar a Android e iOS con capacidades nativas.
- **Desglose por cliente:**
  - **Web Pública `src/`:** React 19 con experiencia de compra directa en una sola vista mediante `EventDetail` y `useDirectPayment`, además de Caja Rápida adaptativa en `Checkout` que omite dirección y envío cuando la orden es solo digital.
  - **`laika-admin`, `laika-gestor` y `laika-operador`:** React 19 con **Vite** para compilaciones veloces y recarga instantánea, sumando **Konva** para el editor visual de recintos en admin y **`html5-qrcode`** para el escaneo óptico en torniquetes.
  - **`matis-solid`:** **SolidJS 1.9** con `jsPDF` y `jspdf-autotable` por su reactividad granular sin Virtual DOM, ideal para dashboards de métricas ejecutivas y exportación directa a PDF.
  - **`LaikaMobil`:** **React Native 0.88, Expo 58 y TypeScript 6**, aprovechando tipado estático, autenticación biométrica con `expo-local-authentication`, resguardo seguro de tokens en `expo-secure-store`, **SSL Pinning** y bóveda digital QR con soporte offline.

---

## 2. Por qué desacoplamos los roles y creamos Pilgrim API Gateway

- **Respuesta corta:** Separar cada rol en su propia aplicación evita interfaces saturadas, aísla permisos sensibles y permite desplegar mejoras en un módulo sin afectar a los compradores; Pilgrim actúa como puerta única para ocultar los 9 puertos internos del backend.
- **Beneficios concretos:**
  - **Menor superficie de fallo y seguridad:** El comprador en `laika-club.vercel.app` nunca carga código ni rutas de administración o torniquetes.
  - **Despliegue independiente:** Podemos actualizar `laikaoperador.vercel.app` o `laikagestor.vercel.app` sin recompilar la web pública.
  - **Desacoplamiento real en backend:** Los 6 clientes, incluida `LaikaMobil`, solo conocen un punto de entrada: **Pilgrim** detrás de Nginx. Si cambia el puerto interno o el host de un microservicio, se ajusta únicamente en las variables de entorno de Pilgrim sin tocar los frontends ni la app móvil.
  - **Control centralizado:** Pilgrim administra 5 routers por rol — `auth`, `admin`, `gestor`, `operador` y `public` —, filtra cabeceras hop-by-hop, maneja respuestas `502` controladas si un servicio interno no responde y expone `GET /api/health` para monitoreo.

---

## 3. Por qué MySQL 8.0 y MongoDB — Arquitectura de datos híbrida

- **Respuesta corta:** Usamos **MySQL 8.0** para todo lo transaccional porque exige integridad referencial y transacciones ACID en cada venta de boleto, y **MongoDB Atlas** como bóveda NoSQL complementaria para guardar instantáneas analíticas flexibles sin afectar la base operativa.
- **Por qué no usar solo NoSQL:**
  - La venta de boletos, asientos, funciones, pagos, reembolsos y cortesías tiene relaciones estrictas y requiere consistencia fuerte; un esquema relacional con claves foráneas y transacciones ACID en MySQL 8.0 previene inconsistencias financieras.
- **Por qué esquemas segregados en Docker:**
  - En `docker-compose.prod.yml` cada microservicio se conecta a su propio esquema — `laika_auth`, `laika_admin`, `laika_stats`, `laika_events`, `laika_tickets`, `laika_merchandise`, `laika_achievements` y `laika_analytics` — reduciendo acoplamiento directo entre tablas y manteniendo el motor MySQL protegido únicamente en el puerto interno `3306` de la red privada.
- **Persistencia física:**
  - Los datos no se pierden al reiniciar contenedores porque se montan en el volumen persistente `laika_db_data`, junto con volúmenes locales `/app/uploads` para multimedia y `/app/backups` para respaldos administrativos.
- **Por qué MongoDB Atlas M0:**
  - `analytics_bigdata` guarda snapshots e informes analíticos no estructurados en MongoDB sin costo adicional bajo nivel gratuito M0 y sin consumir disco ni RAM extra de la VM de Azure.

---

## 4. Por qué Docker y Docker Compose

- **Respuesta corta:** Docker eliminó los conflictos de versiones entre computadoras y servidores, garantizó que Java 17, Python 3 y MySQL 8 corran igual en desarrollo y producción, y permitió aislar los 11 servicios en una red privada interna.
- **Beneficios clave aplicados en LAIKA Club:**
  - **Cero problemas de entorno:** Cada microservicio incluye su propio `Dockerfile`, encapsulando sus dependencias exactas sin contaminar el sistema operativo host.
  - **Aislamiento de red:** Todos los servicios viven dentro de la red privada `laika_network`. Ningún microservicio Java ni MySQL queda expuesto directamente a Internet; solo Nginx conversa con `127.0.0.1:8000` hacia Pilgrim.
  - **Recuperación automática:** Todos los servicios en `docker-compose.prod.yml` tienen política `restart: always`, levantándose solos tras un fallo inesperado o reinicio del servidor.
  - **Control fino de memoria:** Permite asignar variables JVM específicas a cada contenedor y reconstruir todo el clúster en un solo comando desde `deploy_remote.sh`.

---

## 5. Por qué Microsoft Azure, por qué Terraform y por qué esas características exactas

### Por qué arquitectura híbrida Vercel + Azure + Play Store
- **Respuesta corta:** Dejamos los frontends estáticos en **Vercel CDN** para entregar velocidad global sin cargar nuestra máquina virtual, la app móvil en **Expo y Google Play Store**, y concentramos en **Microsoft Azure** únicamente lo que requiere cómputo persistente y red privada: Nginx, Pilgrim, los 9 microservicios y MySQL.
- **Beneficio de negocio:** Vercel entrega HTTPS automático y despliegue instantáneo al hacer push sin costo, mientras la VM de Azure dedica 100% de su CPU y RAM al backend y a **MATIS**.

### Por qué Terraform como Infraestructura como Código
- **Respuesta corta:** Terraform convierte toda la nube en código versionado y reproducible; si necesitamos migrar de región o de suscripción, reconstruimos la infraestructura completa en minutos sin configuraciones manuales propensas a error.
- **Qué recursos declara `terraform/main.tf`:**
  - `azurerm_resource_group` llamado `rg-laikaclub`.
  - `azurerm_virtual_network` llamada `vnet-laikaclub` en `10.0.0.0/16` y `azurerm_subnet` llamada `snet-app-prod` en `10.0.1.0/24`.
  - `azurerm_network_security_group` llamado `nsg-laikaclub` asociado a la subred, abriendo únicamente prioridad 100 HTTP `80`, prioridad 110 HTTPS `443` y prioridad 120 SSH `22`.
  - `azurerm_public_ip` estática `Standard` con sufijo aleatorio `yxdb1q` que genera el FQDN público `laikaclub-yxdb1q.northcentralus.cloudapp.azure.com`.
  - `tls_private_key` RSA de 4096 bits guardada localmente en `laikaclub_ssh_key.pem` con permisos estrictos `0600`.
  - `azurerm_linux_virtual_machine` llamada `vm-laikaclub-prod` aprovisionada desde el primer arranque con `scripts/cloud-init.sh`.
  - `azurerm_consumption_budget_resource_group` llamado `budget-laikaclub-protection` con límite mensual de 85 USD y alertas automáticas al 80% y 95%.

### Por qué esas características exactas de hardware y región
- **Por qué región `northcentralus`:** Ofrece baja latencia hacia México y disponibilidad real de cuotas para procesadores ARM64 dentro de las políticas del plan de Azure.
- **Por qué `Standard_B2ps_v2` ARM64 Ampere Altra con 2 vCPU y 8 GB RAM:** A diferencia de instancias x64 equivalentes que cuestan casi el doble, la arquitectura ARM64 brinda 8 GB completos de RAM por aproximadamente 28 USD al mes, permitiendo alojar los 11 contenedores operando las 24 horas dentro del presupuesto.
- **Por qué disco `osdisk-laikaclub` de 64 GB `StandardSSD_LRS`:** Un disco básico de 32 GB se saturaba al combinar imágenes Docker de 8 servicios Java, compilaciones, la base MySQL, respaldos y el archivo Swap de 8 GB; subir a 64 GB Standard SSD por ~4.80 USD al mes garantiza espacio holgado y buena lectura/escritura.
- **Por qué Swap de 8 GB con `vm.swappiness=10` en `cloud-init.sh`:** Actúa como colchón de seguridad ante picos temporales de compilación Docker o arranque simultáneo de servicios, evitando que el kernel Linux mate contenedores por falta de memoria, mientras `swappiness=10` asegura que el sistema priorice siempre la RAM física rápida.
- **Por qué Nginx frente a Pilgrim:** Termina el cifrado TLS con Certbot, aplica compresión Gzip nivel 6 para reducir peso de respuestas JSON y archivos estáticos, habilita cabeceras de WebSocket, sirve `/uploads/` con caché de 30 días y protege a Pilgrim evitando exponerlo directo al exterior.

---

## 6. Buenas prácticas de ingeniería y seguridad aplicadas

- **Principios SOLID y Clean Architecture:**
  - En Spring Boot cada microservicio separa `controller`, `service`, `repository`, `model`, `dto` y `config`, manteniendo una sola responsabilidad por clase.
  - En React y React Native las vistas actúan como orquestadores delgados que delegan toda la lógica a custom hooks y servicios HTTP desacoplados, por ejemplo `EventDetail.jsx` delegando en `useTicketEngine`, `useSeatLock`, `useSeatPolling` y `useDirectPayment`.
- **Integridad transaccional y anti-doble-cobro:**
  - Bloqueo por asiento en `laika_tickets` con `ConcurrentHashMap` y `ReentrantLock` que rechaza colisiones con `409 Conflict` y limpia bloqueos expirados automáticamente.
  - Llave de idempotencia en `useCheckoutFlow.js` para evitar cobros duplicados si el usuario hace doble clic o pierde red momentáneamente.
  - Consultas financieras agregadas en tiempo real en `EventQueryService.java` en lugar de contadores estáticos propensos a desincronización.
- **Seguridad multicapa:**
  - Contraseñas cifradas con **BCrypt**, autenticación sin estado con **JWT Bearer**, control de intentos fallidos de login y bitácora de auditoría en `auth_logs`.
  - Protección de rutas por rol tanto en frontend mediante guards como en backend.
  - En móvil: almacenamiento cifrado en `Expo SecureStore`, desbloqueo biométrico y **SSL Pinning**.
  - En infraestructura: puertos internos cerrados por NSG, llave SSH RSA 4096 y cifrado HTTPS con Certbot.
- **Calidad estática y documentación:**
  - Linters activos con **Oxlint** en los módulos Vite y **ESLint** en Expo.
  - Archivo `README.md` maestro en raíz y guías técnicas individuales por subproyecto.

---

## 7. Control de versiones, ramas y automatización CI/CD

- **Respuesta corta:** Usamos Git y GitHub con más de 155 commits bajo formato semántico, flujo de ramas separadas por estabilidad, submódulo independiente para la app móvil y pipelines automáticos de Integración y Entrega Continua en GitHub Actions.
- **Estrategia de ramas:**
  - `main`: rama estable de producción y disparador del flujo de despliegue continuo.
  - `development`: rama principal de integración donde convergen nuevas funciones antes de pasar a producción.
  - `feature/*` y `bugfix/*`: ramas aisladas por funcionalidad o corrección específica, integradas mediante Pull Requests para revisión previa.
- **Convención de commits:** Prefijos semánticos claros como `feat`, `fix`, `docs` y `chore` indicando el ámbito afectado, lo que permite auditar exactamente cuándo y por qué se corrigió cada defecto.
- **Modularidad de repositorios:** La aplicación móvil `LaikaMobil` se integra como submódulo independiente y los frontends de rol y Pilgrim pueden sincronizarse y desplegarse de forma autónoma.
- **Pipeline CI en `.github/workflows/ci.yml`:**
  - Se ejecuta en push y pull requests hacia `main`, `development`, `feature/**` y `bugfix/**`.
  - **Job 1:** Ejecuta en Node.js 18 las 60 pruebas unitarias — 35 de negocio y seguridad más 25 de algoritmos ML y Big Data.
  - **Job 2:** Compila `auth` y ejecuta `CancellationServiceImplTest` en `tickets` con JDK 17 y Maven.
  - **Job 3:** Valida la sintaxis y estructura de `docker-compose`.
- **Pipeline CD en `.github/workflows/cd.yml`:**
  - Ejecuta primero una compuerta de calidad previa con las 60 pruebas y validación de `docker-compose.prod.yml`.
  - Si aprueba, conecta por SSH a la VM de Azure, actualiza `main`, ejecuta `deploy_remote.sh` y comprueba la salud en vivo en `/api/health`.

---

## 8. Pruebas, calidad y cómo responder preguntas difíciles

### Cifras clave que debes tener presentes
- **60 pruebas unitarias en CI:** 35 de dominio, validaciones, seguridad SQLi/XSS, Luhn y bloqueos + 25 de modelos ML, K-Means, detección de bots, churn y reconciliación MATIS.
- **51 pruebas de integración en vivo sin mocks:** 36 sobre el sistema completo contra Pilgrim y Docker + 15 sobre endpoints ML, Big Data y MATIS, más auditoría de 12 puertos TCP.
- **Estrés y carga:** Simulador de 200 usuarios compitiendo por un mismo asiento, carga paralela en endpoints ML, plan Apache JMeter, colección Postman y tablero visual QA en puerto 5050.
- **354 casos multi-rol en Python:** 347 aprobados y 7 fallidos, logrando **98.0% de aprobación consolidada** con 0 casos bloqueados y evidencias guardadas en JSON y Markdown.

### Respuestas modelo para preguntas difíciles

**Pregunta 1: ¿Por qué no conectaron una pasarela de pagos bancaria real como Stripe o Mercado Pago?**
> "Por recomendación técnica y de alcance del proyecto se diseñó toda la lógica transaccional — intención de pago, confirmación, idempotencia anti-doble-cobro, emisión de boleto y reembolso — operando sobre un motor simulado. Esto permite probar flujos completos sin arriesgar cobros reales y deja desacoplado el servicio de pagos para conectar el proveedor que elija cada negocio en producción."

**Pregunta 2: ¿Por qué tienen 7 pruebas fallidas en la suite de 354 casos?**
> "Porque aplicamos transparencia total sin alterar pruebas para forzar un 100% artificial. Esos 7 hallazgos están documentados con su severidad y corresponden a endurecer validaciones RBAC en rutas internas específicas de respaldos y estadísticas, y a tres rutas secundarias del gestor. Ninguno bloquea la compra, la emisión de boletos ni el escaneo QR en puerta, y ya están priorizados en el backlog de mejora."

**Pregunta 3: ¿Qué pasa si se cae la única máquina virtual de Azure?**
> "Hoy la VM tiene política `restart: always` en Docker y todo el aprovisionamiento está declarado en Terraform, por lo que podemos levantar un nodo nuevo en minutos y restaurar respaldos. Reconocemos que operar en un solo nodo es una decisión consciente de optimización de costos para esta etapa; en nuestra hoja de ruta de fase comercial el siguiente paso es separar MySQL a un servicio administrado y escalar Pilgrim y los microservicios en múltiples nodos detrás de un balanceador."

**Pregunta 4: ¿Por qué tienen tanto código o módulos que quedaron parcialmente terminados como wearables?**
> "Durante la planeación exploramos extensiones como vinculación con wearables, pero al enfrentar restricciones de tiempo aplicamos criterio de priorización para proteger la estabilidad del producto mínimo viable principal. Dejamos documentados esos apartados como deuda técnica controlada en lugar de comprometer el núcleo comercial."

**Pregunta 5: Si tuvieron desviaciones en los sprints intermedios y retos de comunicación, ¿cómo lograron entregar el sistema funcionando?**
> "Reordenamos prioridades en JetBrains YouTrack enfocándonos en las historias críticas de los 228 Story Points, acotamos funciones secundarias no bloqueantes y dedicamos los Sprints 5 y 6 exclusivamente a certificación de pruebas y remediación de incidencias críticas. Esa experiencia nos dejó claro que en un proyecto futuro debemos reforzar desde el inicio la distribución de cargas y el seguimiento diario."

**Pregunta 6: ¿Por qué no usaron un solo monolito en lugar de 9 microservicios?**
> "Un monolito habría sido más simple al inicio, pero nuestra plataforma combina cargas muy distintas: ventas concurrentes en tiempo real en Java, enrutamiento ligero en FastAPI y procesamiento analítico pesado con PySpark en Python. Separarlo en microservicios permitió usar la mejor tecnología para cada dominio, aislar fallos para que un pico analítico no tumbe la venta de boletos y escalar cada módulo de forma independiente."

