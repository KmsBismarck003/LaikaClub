# Estrategia de Optimización de Costos (AWS & MongoDB) - LAIKA Club

Es una preocupación muy común y válida: los microservicios y bases de datos en la nube pueden volverse extremadamente costosos si se configuran de manera ingenua (por ejemplo, creando una base de datos RDS y un contenedor ECS por cada microservicio, lo cual dispararía los costos a cientos de dólares mensuales).

Sin embargo, **es perfectamente viable mantener la arquitectura distribuida actual pagando menos de $15 - $30 USD mensuales en producción**, y **$0 USD en desarrollo**, sin perder calidad, seguridad ni resiliencia.

A continuación se detalla la estrategia de optimización estructurada por componentes:

---

## 1. OPTIMIZACIÓN DE CÓMPUTO (MICROSERVICIOS)

Tener 8 microservicios Java/Spring Boot ejecutándose individualmente en AWS (por ejemplo, en ECS Fargate o instancias EC2 independientes) es el principal factor de costo.

### Estrategias de Ahorro:

- **Consolidación en una sola Instancia (Docker Compose)**:
  - _En lugar de_: Levantar 8 servicios en AWS ECS ($80 - $120+ USD/mes).
  - _Solución_: Desplegar todos los contenedores en una única máquina virtual (instancia EC2 pequeña, tipo `t3.medium` de 4GB RAM o Lightsail equivalente) administrados con Docker Compose.
  - _Costo estimado_: **$15 - $20 USD/mes**.
- **GraalVM Native Image (Reducción drástica de memoria)**:
  - _El problema_: Cada microservicio Java con la JVM tradicional consume entre 250MB y 400MB de memoria RAM.
  - _Solución_: Compilar las aplicaciones Spring Boot a binarios nativos usando GraalVM. Esto reduce el consumo de RAM por microservicio a **30MB - 50MB** y reduce el tiempo de arranque a milisegundos.
  - _Impacto_: Permite ejecutar los 8 microservicios juntos en una máquina de solo 2GB o 4GB de RAM con excelente rendimiento.
- **AWS App Runner / ECS con Fargate Spot**:
  - Si se requiere escalabilidad automática, utilizar **Fargate Spot**, el cual ofrece hasta un **70% de descuento** sobre el precio estándar al utilizar capacidad sobrante de AWS.

---

## 2. OPTIMIZACIÓN DE BASES DE DATOS: EVITANDO EL DILEMA "MONOLITO VS. COSTOS ALTOS"

Es común recibir la crítica de que si todos los microservicios usan un solo servidor físico de base de datos, entonces es un "monolito disfrazado" y si el servidor cae, todo el sistema cae. Sin embargo, el diseño actual de **LAIKA Club** resuelve esto de forma elegante en dos niveles:

### A. Aislamiento Lógico (No hay acoplamiento de código)

- **El problema del Monolito**: El verdadero peligro de una base de datos monolítica no es solo físico, sino el **acoplamiento de datos** (que el microservicio A haga consultas cruzadas o JOINs a las tablas del microservicio B, o que un cambio en las tablas de A rompa a B).
- **Nuestra Solución**: Usamos **una sola instancia física de base de datos** (para reducir costos a una sola máquina RDS de ~$15 USD/mes), pero creamos **esquemas lógicos independientes** (`db_auth`, `db_events`, `db_tickets`, etc.) y **usuarios separados por microservicio**. El microservicio `Auth` solo tiene credenciales para entrar a `db_auth`, y no puede ver ni modificar nada más.
- **Beneficio**: Cumplimos el patrón _Database-per-Service_ a nivel de arquitectura y desarrollo, pero pagamos por un solo servidor.

### B. Tolerancia a Fallos Física con Fallback Dual (MySQL $\rightarrow$ SQLite)

- **El problema de la Caída**: "Si cae el servidor de MySQL, se cae todo el sistema".
- **Nuestra Solución**: Cada microservicio cuenta con un adaptador de base de datos resiliente. Si detecta que la base de datos MySQL en la nube no responde (caída del servidor o red), **conmuta automáticamente y en caliente a un archivo SQLite local (`.db`)** dentro de su propio contenedor/directorio.
- **Beneficio**: El sistema no se apaga. Sigue operando de forma local y distribuida (modo degradado), eliminando el punto único de falla físico sin tener que pagar un costoso clúster de réplicas en AWS.

### Resumen de Estrategias de Ahorro en Base de Datos:

- **Entornos de Desarrollo / QA**: Usar únicamente los archivos **SQLite** locales. Costo de infraestructura de datos en desarrollo: **$0 USD**.
- **Entorno de Producción**: Una sola instancia RDS pequeña con 8 esquemas lógicos y fallback configurado. Costo: **~$15 USD/mes**.

---

## 3. OPTIMIZACIÓN DE ANALÍTICAS (MONGODB ATLAS & APACHE SPARK)

Las cargas de trabajo OLAP (analíticas) suelen consumir muchos recursos.

### Estrategias de Ahorro:

- **MongoDB Atlas Free Tier (M0)**:
  - MongoDB Atlas ofrece un nivel gratuito (clúster M0 con 512MB de almacenamiento), el cual es más que suficiente para almacenar registros analíticos históricos en fases iniciales y medias del proyecto.
  - _Costo_: **$0 USD**.
  - Solo se escala a un nivel de pago si el volumen de negocio crece y genera los ingresos suficientes para justificarlo.
- **Apache Spark On-Demand u Optimizado**:
  - _Evitar_: Tener un clúster EMR de AWS encendido 24/7 (cuesta cientos de dólares).
  - _Solución_: Ejecutar Spark de forma local en la misma instancia de analíticas durante horas de bajo tráfico, o procesar los reportes usando agregaciones nativas de MongoDB/SQL hasta que el volumen de datos realmente requiera procesamiento distribuido.

---

## 4. ALTERNATIVAS A AWS TRADICIONAL

AWS es excelente para grandes corporativos, pero para proyectos que inician, sus costos variables (como transferencia de datos y NAT Gateways) pueden ser impredecibles.

| Proveedor / Servicio       | Configuración Sugerida                                        | Costo Mensual Aprox. | Ventajas                                                                      |
| :------------------------- | :------------------------------------------------------------ | :------------------- | :---------------------------------------------------------------------------- |
| **AWS Lightsail**          | 1 VPS (2 vCPUs, 4GB RAM) + 1 Base de datos administrada MySQL | ~$35 USD             | Precios fijos y predecibles, fácil de migrar a AWS tradicional en el futuro.  |
| **DigitalOcean / Hetzner** | 1 Droplet / VPS (4GB - 8GB RAM)                               | ~$10 - $15 USD       | Mucho más ancho de banda gratuito y más hardware por una fracción del precio. |
| **MongoDB Atlas**          | Clúster M0 (Shared)                                           | **$0 USD**           | Totalmente administrado y sin costos iniciales.                               |

---

## RESUMEN DE RECOMENDACIONES PARA EL LANZAMIENTO

1. **Fase de Desarrollo / Demo**: Usar **SQLite** local en los microservicios y **MongoDB Atlas (Free Tier)**. Costo de infraestructura: **$0 USD**.
2. **Fase de Lanzamiento (MVP)**: Desplegar en **AWS Lightsail** o **DigitalOcean** usando Docker Compose (ejecutando los microservicios compilados de forma nativa o optimizados en RAM) y una base de datos unificada con esquemas lógicos. Costo: **~$15 - $25 USD/mes**.
3. **Fase de Crecimiento**: Cuando el sistema tenga clientes reales y genere ingresos estables, migrar gradualmente a servicios administrados de AWS (ECS, RDS independiente) financiados directamente por las ventas de la plataforma.
