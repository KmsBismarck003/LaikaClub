# Análisis de Factibilidad: Serverless y Scale-to-Zero en LAIKA Club

Este documento evalúa la viabilidad técnica, ventajas, inconvenientes y costos de implementar **Scale-to-zero** (escalado a cero) y arquitecturas **Serverless** (FaaS o contenedores serverless) en el ecosistema de **LAIKA Club**.

---

## 1. Conceptos Clave en el Contexto de LAIKA Club

*   **Scale-to-Zero**: Habilidad del proveedor cloud para apagar por completo las instancias de un servicio cuando no recibe tráfico durante un tiempo determinado (ej. 15 minutos). Durante este estado, el costo de cómputo es **$0 USD**.
*   **Cold Start (Arranque en frío)**: Cuando entra una petición y el servicio está en "cero", el proveedor debe aprovisionar un contenedor, descargar la imagen, inicializar la aplicación y la conexión a base de datos antes de responder. Esto añade un retraso (latencia) a la primera petición.

---

## 2. Factibilidad por Componente de Software

La arquitectura de LAIKA Club está dividida en dos versiones de microservicios (Python y Java) y bases de datos. La factibilidad varía drásticamente entre ellos:

### A. Stack Python (FastAPI)
*   **Factibilidad**: **Muy Alta**
*   **Tiempo de arranque en frío (Cold Start)**: **~100ms a 500ms**. Es prácticamente imperceptible para el usuario.
*   **Cómo se implementaría**:
    *   **Google Cloud Run**: La opción más sencilla. Solo requiere subir las imágenes Docker actuales de los microservicios. Cloud Run maneja el scale-to-zero de forma nativa sin modificar una sola línea de código.
    *   **AWS Lambda**: Requiere instalar un adaptador ASGI (como `Mangum`) en el `main.py` de FastAPI para traducir los eventos del API Gateway de AWS a peticiones HTTP internas.
*   **Recomendación**: Excelente candidato para serverless.

### B. Stack Java (Spring Boot)
*   **Factibilidad**: **Media-Baja** (requiere optimizaciones avanzadas)
*   **Tiempo de arranque en frío (Cold Start)**: **5 a 15 segundos**. La JVM tradicional y el escaneo de componentes de Spring Boot son pesados. Si el sistema se apaga a cero, el primer usuario en entrar tendrá que esperar hasta 15 segundos, lo cual suele provocar fallos de *timeout* y una pésima experiencia de usuario.
*   **Mitigaciones posibles**:
    *   **GraalVM Native Image**: Compilar los microservicios Spring Boot a binarios nativos. Esto reduce el arranque en frío a **<300ms** y el consumo de RAM a ~30MB.
    *   **Keep-Warm / Min-Instances**: Configurar el proveedor para mantener al menos 1 instancia activa de los servicios críticos (como `auth`). Esto elimina el *cold start* pero anula el ahorro de "Scale-to-zero" para esas instancias específicas.

### C. Bases de Datos (MySQL & MongoDB)
*   **El dilema**: Apagar los microservicios a cero no sirve de mucho si la base de datos centralizada (MySQL o MongoDB) sigue encendida 24/7 facturando una tarifa fija (el recurso más costoso de la nube).
*   **Soluciones Serverless Reales**:
    *   **MongoDB Atlas**: Usar el tier **Serverless** (pago por lectura/escritura en lugar de clúster dedicado). Cuesta $0 si no hay tráfico.
    *   **Bases de Datos Relacionales (MySQL)**: 
        *   *Aurora Serverless v2 (AWS)*: No escala a cero real (mantiene un mínimo de 0.5 ACUs, lo que equivale a ~$35 USD/mes).
        *   *Proveedores externos Serverless* (como **PlanetScale** para MySQL o **Neon** para PostgreSQL): Ofrecen scale-to-zero real y capas gratuitas generosas para proyectos en crecimiento.
    *   **El problema del Fallback SQLite**: En una arquitectura serverless efímera (AWS Lambda o Cloud Run), el almacenamiento local del contenedor se destruye cuando el servicio se escala a cero. Los cambios hechos en SQLite se perderían a menos que se monte un disco en red (EFS), lo cual añade costo y latencia.

---

## 3. ¿Dónde es más importante y factible implementarlo?

| Microservicio / Componente | Prioridad | Factibilidad | Plataforma Sugerida | Justificación |
| :--- | :---: | :---: | :--- | :--- |
| **Entornos de Desarrollo y QA** | **Máxima** | **Alta** | Google Cloud Run / AWS Lambda | Las ramas de desarrollo no se usan por las noches ni fines de semana. Apagar el entorno completo a cero genera un **ahorro inmediato del 70%** en costos de desarrollo. |
| **Módulo de Analíticas / Spark** | **Alta** | **Alta** | AWS Glue / Lambda programado | El análisis de Big Data (`analytics_bigdata` o Spark) no necesita estar encendido 24/7. Debe encenderse solo cuando se ejecuta un reporte programado (ej. una vez al día o a la semana), hacer el cálculo y apagarse. |
| **Servicios Secundarios** (`merchandise`, `achievements`, `tickets`) | **Media** | **Media** | Cloud Run (Python) | Reciben poco tráfico distribuido. Estar apagados la mayor parte del tiempo es ideal para ahorrar. |
| **API Gateway & Auth** | **Baja** | **Baja** | Servidor tradicional o Min-Instance = 1 | El API Gateway y el servicio de autenticación deben responder instantáneamente. Un cold start aquí bloquea toda la aplicación. |

---

## 4. Comparativa de Estrategias: Servidor Consolidado vs. Serverless

| Criterio | Servidor Único VPS (Docker Compose) | Serverless / Scale-to-zero (Cloud Run / Lambda) |
| :--- | :--- | :--- |
| **Costo Mensual Base** | Fijo (~$15 - $25 USD) independientemente del tráfico. | **$0 USD** (si no hay tráfico). Variable según peticiones. |
| **Latencia inicial** | 0ms (el servidor siempre está encendido y listo). | Variable (100ms en Python, hasta 15s en Java si no se optimiza). |
| **Complejidad de Código** | Ninguna (código estándar). | Media (adaptadores ASGI, configuración de VPC, compilación nativa en Java). |
| **Mantenimiento del Servidor** | Requiere actualizar el S.O., parches de seguridad y Docker. | No hay servidores que mantener (administrado por el proveedor). |
| **Persistencia Local** | Sencilla (volúmenes de Docker para SQLite o uploads). | Compleja (requiere buckets S3/Cloud Storage, no hay disco local persistente). |

---

## 5. Conclusión y Recomendación

1.  **Para Producción (Lanzamiento MVP)**: La estrategia actual de **un único servidor VPS consolidado con Docker Compose (Lightsail o DigitalOcean)** sigue siendo la más recomendada debido a su simplicidad técnica, latencia constante y costos sumamente bajos y predecibles (~$15-$20 USD).
2.  **Para Entornos de Desarrollo/Prueba**: Es **altamente factible y recomendado** mover el stack de desarrollo a **Google Cloud Run** para aprovechar el Scale-to-zero al 100% y no pagar nada por entornos que están inactivos el 80% del tiempo.
3.  **Para el módulo de Spark/Analíticas**: Es factible migrarlo a un modelo serverless (ej. AWS Lambda o contenedores efímeros) para que solo consuma CPU cuando el administrador solicite explícitamente un reporte pesado.
