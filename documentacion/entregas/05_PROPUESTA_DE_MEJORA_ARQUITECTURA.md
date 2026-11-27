# PROPUESTA DE MEJORA TÉCNICA Y EVOLUCIÓN ARQUITECTÓNICA - LAIKA CLUB

**Proyecto:** Ecosistema LAIKA Club  
**Competencia a Evaluar:** Realizar la liberación y monitoreo del software mediante entrega continua (Criterio: Propone mejoras).  
**Fecha de Emisión:** 5 de diciembre de 2026  
**Documento de Referencia:** [documentacion/PLAN_DE_DESPLIEGUE_PRODUCCION.md](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/documentacion/PLAN_DE_DESPLIEGUE_PRODUCCION.md)  
**Alcance:** Escalabilidad horizontal, resiliencia transaccional, observabilidad y optimización FinOps.

---

## 1. DIAGNÓSTICO DE LA ARQUITECTURA ACTUAL

La arquitectura desplegada en producción (versión 2.0.0) opera exitosamente en un modelo **All-in-One contenerizado en Azure Virtual Machine** (`Standard_B2ps_v2` ARM64) complementado con **Vercel Edge Network** para las interfaces frontend. 

Si bien esta solución satisface holgadamente la demanda actual (~1,500 usuarios concurrentes y $30.14 USD/mes de consumo), el crecimiento proyectado en ventas masivas de boletaje (preventas simultáneas de estadios con >20,000 usuarios concurrentes) presenta cuellos de botella identificados:

1. **Persistencia Centralizada en Contenedor Local:** MySQL 8.0 comparte el disco SSD y el pool de memoria del host junto con los 8 microservicios y el motor analítico.
2. **Ausencia de Capa de Caching en Memoria:** Las consultas de disponibilidad de mapas de asientos impactan directamente sobre las tablas relacionales de la base de datos.
3. **Escalabilidad Vertical Rígida:** Ante un pico repentino de tráfico, escalar la VM completa requiere reinicio y redimensionamiento manual.
4. **Logs Dispersos:** La auditoría requiere conexión directa al servidor para inspeccionar `docker logs` o los archivos en `/var/log/nginx`.

---

## 2. EJES ESTRATÉGICOS DE MEJORA PROPUESTOS

Se propone un plan de evolución estructurado en 5 ejes técnicos prioritarios:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA OBJETIVO (FASE 3)                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
[ EJE 1: CACHING REDIS ]    [ EJE 2: AUTOESCALADO ACA ]   [ EJE 3: DB FLEXIBLE ]
Lectura de mapas de asientos Escala horizontal por cola   MySQL administrado con
en memoria (<1.5ms).         HTTP (KEDA). De 1 a 10 réplicas. réplicas de lectura y PITR.
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
[ EJE 4: OPENTELEMETRY & APM ]                             [ EJE 5: ESTRATEGIA FINOPS ]
Trazas distribuidas de extremo                             Ahorro de hasta 40% mediante
a extremo (Frontend -> API -> DB).                         Reserved Instances y Schedules.
```

---

### EJE 1: IMPLEMENTACIÓN DE CACHING DISTRIBUIDO EN MEMORIA (REDIS)

* **Problema:** En eventos de alta demanda, el 80% de las consultas corresponden a lecturas repetitivas de mapas de asientos ocupados (`GET /api/events/{id}/seats`).
* **Propuesta:** Integrar una instancia de **Redis** (o Azure Cache for Redis / contenedor Redis Alpine) entre Pilgrim API Gateway y los microservicios transaccionales.
* **Mecanismo de Operación:**
  - Al consultar el aforo, el gateway consulta primero la clave `cache:event:{id}:seats` con un TTL de 3 a 5 segundos.
  - Al realizarse un bloqueo o confirmación de boleto en `laika_tickets`, se emite una invalidación atómica de caché vía evento Redis Pub/Sub (`DEL cache:event:{id}:seats`).
* **Beneficio Medible:**
  - Reducción del tiempo de respuesta en consulta de asientos de **22.0 ms a 1.2 ms**.
  - Reducción de hasta un **75% en la carga de I/O de disco** en la base de datos relacional.

---

### EJE 2: ESCALABILIDAD HORIZONTAL ELÁSTICA CON AZURE CONTAINER APPS (ACA)

* **Problema:** La máquina virtual actual tiene un límite fijo de 2 vCPUs y 4 GB de RAM.
* **Propuesta:** Migrar de Docker Compose en VM hacia **Azure Container Apps (ACA)** basado en Kubernetes serverless administrado.
* **Mecanismo de Operación:**
  - Configuración de autoescalado basado en **KEDA (Kubernetes Event-driven Autoscaling)**.
  - Definición de reglas de escalado: Cuando las peticiones concurrentes por réplica superen 50 req/s, ACA levantará automáticamente nuevas réplicas (escalado de 1 a 10 pods) en menos de 15 segundos.
  - Los microservicios de baja demanda (ej. `laika_stats`, `laika_merchandise`) pueden escalar a 0 réplicas en horas valle, optimizando costos.
* **Beneficio Medible:**
  - Capacidad para atender hasta **25,000 usuarios concurrentes** sin degradación de latencia.
  - Cero administración de parches del sistema operativo de la máquina virtual.

---

### EJE 3: SEGREGACIÓN Y RESILIENCIA DE BASE DE DATOS (AZURE MYSQL FLEXIBLE)

* **Problema:** Almacenar la base de datos en un volumen Docker local (`laika_db_data`) representa un punto único de falla (SPOF) en caso de corrupción del sistema de archivos del host.
* **Propuesta:** Desacoplar la persistencia relacional hacia **Azure Database for MySQL Flexible Server** (Tier Burstable B1ms o General Purpose).
* **Mecanismo de Operación:**
  - Activación de réplicas de lectura (*Read Replicas*): el tráfico analítico pesado (`analytics_bigdata` y reportes de gestión) se redirige a la réplica de solo lectura, aislando las transacciones de compra de boletos en el nodo primario.
  - Copias de seguridad automáticas con restauración a un punto en el tiempo (*Point-in-Time Restore - PITR*) durante 35 días.
  - Cifrado en reposo con claves administradas y autenticación mediante Azure Active Directory / Entra ID.
* **Beneficio Medible:**
  - RPO (Recovery Point Objective) reducido a **menos de 5 minutos**.
  - Aislamiento absoluto entre transacciones críticas de taquilla y reportes analíticos masivos.

---

### EJE 4: OBSERVABILIDAD AVANZADA Y TRAZABILIDAD DISTRIBUIDA (APM)

* **Problema:** Cuando una petición presenta lentitud, identificar cuál de los 8 microservicios o qué query SQL causó el retraso requiere análisis manual de logs.
* **Propuesta:** Incorporar el estándar abierto **OpenTelemetry (OTel)** instrumentando Pilgrim Gateway (FastAPI) y los microservicios Java Spring Boot con exportación hacia Azure Application Insights o Grafana Tempo.
* **Mecanismo de Operación:**
  - Inyección de una cabecera de correlación `X-Correlation-ID` en Pilgrim API Gateway al recibir cualquier solicitud del usuario.
  - Propagación automática del ID entre llamadas HTTP internas de microservicios.
  - Tablero centralizado en Grafana / Azure Monitor con alertas automáticas vía Webhook (Slack / Discord / Correo) ante tasas de error > 1.0% o latencias p95 > 500ms.
* **Beneficio Medible:**
  - Diagnóstico de incidentes (*Root Cause Analysis*) reducido de **45 minutos a menos de 3 minutos**.

---

### EJE 5: ESTRATEGIA FINOPS Y SOSTENIBILIDAD FINANCIERA

* **Propuesta:** Para mantener la operación dentro del presupuesto institucional:
  1. **Reserved Instances (RI):** Adquirir reservas de capacidad a 1 año en Azure para obtener ahorros de entre **35% y 42%** respecto a la tarifa por hora bajo demanda (*Pay-As-You-Go*).
  2. **Apagado Programado en Entornos No Productivos:** Configurar automatización en Azure Automation para apagar las instancias de Staging/QA fuera de horas laborales (lunes a viernes de 8:00 a 20:00), recortando un **65% del costo mensual en entornos de prueba**.
  3. **Compresión Brotli y CDN Caching en Vercel:** Maximizar la entrega de assets estáticos y mapas vectoriales desde el borde (*Edge Caching*), ahorrando ancho de banda de salida en Azure.

---

## 3. MATRIZ DE PRIORIZACIÓN Y HOJA DE RUTA (ROADMAP)

| Propuesta | Impacto en Negocio | Complejidad Técnica | Esfuerzo Estimado | Prioridad |
| :--- | :---: | :---: | :---: | :---: |
| **Eje 1: Caching Redis en Mapas de Boletos** | Alto (Latencia <2ms) | Media | 1 Sprint (2 semanas) | **Alta (Inmediata)** |
| **Eje 4: Trazabilidad OpenTelemetry** | Alto (Observabilidad) | Baja | 1 Sprint (1 semana) | **Alta (Inmediata)** |
| **Eje 3: Migración a MySQL Flexible Server** | Crítico (Cero SPOF) | Media | 2 Sprints (3 semanas) | **Media** |
| **Eje 2: Migración a Azure Container Apps** | Muy Alto (Escala elástica) | Alta | 3 Sprints (4 semanas) | **Media / Largo Plazo** |
| **Eje 5: Reserved Instances & FinOps** | Alto (Ahorro $40%) | Muy Baja | 1 Día | **Inmediata** |

---

## 4. CONCLUSIÓN DE EVALUACIÓN (HITO 2)

La arquitectura desplegada actual demuestra estabilidad, seguridad y cumplimiento del 100% de los criterios funcionales de liberación y monitoreo. 

La presente propuesta de mejora traza un camino viable, profesional y económicamente sustentable para evolucionar el sistema hacia un estándar de escala global, consolidando las mejores prácticas de la industria de software moderno.

