# Decisiones de Arquitectura - LAIKA Club

Este documento justifica las principales decisiones tecnológicas y patrones de diseño aplicados en el sistema **LAIKA Club**, mapeados directamente con la implementación actual en el código base.

---

## 1. Patrón API Gateway Centralizado
* **Decisión**: Concentrar todo el tráfico del cliente en un único gateway (`gateway.py`) expuesto en el puerto `8000`.
* **Justificación**: 
  * Simplifica el frontend eliminando la necesidad de gestionar múltiples direcciones base para cada servicio.
  * Facilita el manejo unificado del intercambio de recursos de origen cruzado (CORS).
  * Permite añadir seguridad perimetral o caché en una sola pieza de infraestructura.
* **Compromiso (Trade-off)**: Introduce un punto único de falla (SPOF) y, en la implementación actual, se observa un hotpatch de consultas directas a base de datos para la ruta `/api/ads/public`, lo cual viola la separación de responsabilidades pero optimiza la velocidad de carga de banners.

---

## 2. Persistencia Híbrida y Resiliencia con Fallback Dual (MySQL -> SQLite)
* **Decisión**: Configurar un adaptador ORM en cada microservicio que intente conectarse de manera primaria a MySQL, pero conmute de manera automática y transparente a archivos SQLite locales si el host relacional principal no está disponible.
* **Justificación**:
  * **Tolerancia a fallos**: Si el servidor local (ej. XAMPP) o la base de datos de producción sufre una caída, el sistema de venta de boletos o autenticación sigue operativo de forma degradada en el nodo local.
  * **Agilidad en desarrollo**: Permite a nuevos desarrolladores arrancar el ecosistema en sistemas locales sin requerir la configuración inmediata de un servidor MySQL completo.
* **Compromiso (Trade-off)**: Los datos transaccionados localmente durante la caída de MySQL quedan aislados en la base SQLite del microservicio, requiriendo un proceso de reconciliación posterior.

---

## 3. Separación de Cargas de Trabajo OLTP y OLAP (MongoDB Atlas)
* **Decisión**: Realizar un volcado asíncrono ("fire-and-forget") de las transacciones de compra hacia MongoDB Atlas, utilizando el driver `motor` no bloqueante dentro del controlador de tickets.
* **Justificación**:
  * Evita la degradación del rendimiento del hilo principal de procesamiento de pagos (OLTP) en MySQL al realizar las consultas agregadas complejas en una base de datos NoSQL externa (OLAP).
  * Permite escalar el módulo de Big Data de manera independiente sin afectar la disponibilidad de la tienda ni de la emisión de boletos QR.

---

## 4. Inicialización Resiliente de Apache Spark en Segundo Plano
* **Decisión**: Arrancar el motor distributed de Apache Spark en un hilo alterno (`engine.py`) dentro del microservicio de analíticas pesadas (`analytics_bigdata`) y proveer una conmutación automática a consultas SQL relacionales mientras Spark se inicializa.
* **Justificación**:
  * La JVM de Apache Spark tarda varios segundos en iniciar. Si las peticiones de administración dependieran exclusivamente del contexto de Spark desde el primer segundo, el dashboard de métricas se bloquearía temporalmente. El fallback a SQL relacional garantiza disponibilidad inmediata.

---

## 5. Estrategia de Optimización de Costos en la Nube (AWS & MongoDB)
* **Decisión**: Consolidar recursos en una única instancia virtual (VPS/EC2) vía Docker Compose, usar una única instancia RDS con esquemas lógicos para bases de datos relacionales, y la capa gratuita de MongoDB Atlas para la analítica.
* **Justificación**: Permite ejecutar el ecosistema de 8 microservicios con un presupuesto reducido (~$15-$30 USD/mes) sin comprometer la independencia de desarrollo, la seguridad de base de datos o el rendimiento.
* **Detalles**: Ver [optimizacion-costos.md](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/documentacion/optimizacion-costos.md) para más detalles.

