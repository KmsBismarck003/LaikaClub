# PLAN DE TRABAJO: ENTREGA CONTINUA, LIBERACIÓN Y MONITOREO (CD) - LAIKA CLUB

**Proyecto:** Ecosistema LAIKA Club  
**Competencia a Evaluar:** Realizar la liberación y monitoreo del software mediante entrega continua.  
**Fecha de Entrega:** 5 de diciembre de 2026  
**Entorno Productivo:** Microsoft Azure (`Standard_B2ps_v2` ARM64 en `southcentralus`) + Vercel Edge Network  
**Pipeline de CD:** [.github/workflows/cd.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/cd.yml)  
**Script de Despliegue Automatizado:** [deploy_remote.sh](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/deploy_remote.sh)  
**Infraestructura como Código (IaC):** [terraform/main.tf](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/terraform/main.tf)

---

## 1. INTRODUCCIÓN Y OBJETIVO TÉCNICO

El presente plan de trabajo define los procedimientos de ingeniería para aprovisionar, liberar, desplegar de forma continua y monitorear el sistema **LAIKA Club** en un entorno de producción en la nube.

La meta principal es alcanzar un flujo de Entrega Continua (Continuous Delivery / Continuous Deployment) que reduzca a cero el tiempo de inactividad no planificado, automatice el ciclo de vida de los despliegues en Azure, recolecte métricas operativas de salud en tiempo real y asegure la alta disponibilidad ante ráfagas de usuarios en venta de boletaje.

---

## 2. CONFIGURACIÓN DEL AMBIENTE DE LIBERACIÓN

El ambiente de liberación se aprovisiona mediante **Infraestructura como Código (IaC)** con Terraform, garantizando reproducibilidad y control de costos FinOps.

### 2.1 Topología Cloud (Híbrida Azure + Vercel)
```
                          [ USUARIOS FINALES ]
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼ (Tráfico Web / SPA)                               ▼ (APIs / Webhooks / Datos)
[ VERCEL EDGE NETWORK ]                        [ CLOUD HOST AZURE VM ]
* Web Pública (/)                              * Ubuntu 22.04 LTS (ARM64)
* Portal Admin (/admin)                        * NGINX Reverse Proxy (80 / 443 SSL)
* Portal Gestor (/gestor)                      * Let's Encrypt Certbot
* Terminal Operador (/operador)                * Docker Engine & Compose Prod
                                                              │
                                                              ▼
                                               [ PILGRIM API GATEWAY :8000 ]
                                                              │
                                       ┌──────────────────────┴──────────────────────┐
                                       ▼                                             ▼
                          [ 8 MICROSERVICIOS JAVA ]                     [ MOTOR ANALÍTICA & ML ]
                          (:8101, :8102, :8103, :8201,                  (:8302, :8303 PySpark)
                           :8202, :8203, :8301, :8302)                               │
                                       │                                             │
                                       └──────────────────────┬──────────────────────┘
                                                              │
                                                              ▼
                                                [ BASE DE DATOS MYSQL 8.0 ]
                                                (Puerto interno :3306)
```

### 2.2 Especificación de Infraestructura en Azure
* **Máquina Virtual:** `Standard_B2ps_v2` (2 vCPU ARM64, 4 GB RAM, arquitectura optimizada en costo y desempeño térmico).
* **Almacenamiento:** Disco SSD administrado de 32 GB (`StandardSSD_LRS`).
* **Seguridad Perimetral (NSG):** Reglas de entrada estrictas en puertos 22 (SSH con clave privada), 80 (HTTP) y 443 (HTTPS). Los puertos de microservicios (8000, 8101..8303, 3306) permanecen en red interna privada y solo se exponen vía NGINX.
* **Certificado SSL:** Certificado criptográfico TLS X.509 emitido por Let's Encrypt con renovación automática.
* **Protección FinOps:** Presupuesto asignado de $100.00 USD con alerta automática de consumo a los $85.00 USD en Azure Consumption Budgets.

---

## 3. AUTOMATIZACIÓN DEL DESPLIEGUE CONTINUO (CD)

El proceso de despliegue se ejecuta de forma desatendida mediante el workflow [.github/workflows/cd.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/cd.yml):

### 3.1 Flujo de Liberación Automatizado
1. **Trigger de Despliegue:** Merge aprobado hacia la rama `main` o publicación de un tag de versión (`v*.*.*`).
2. **Quality Gate Pre-Despliegue:** El workflow ejecuta automáticamente las 60 pruebas unitarias algorítmicas y valida la sintaxis de [docker-compose.prod.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/docker-compose.prod.yml). Si alguna prueba falla, el despliegue se cancela inmediatamente.
3. **Conexión Criptográfica SSH:** GitHub Actions se conecta a la máquina virtual Azure empleando credenciales seguras almacenadas en GitHub Secrets (`AZURE_VM_HOST`, `AZURE_VM_USER`, `AZURE_SSH_PRIVATE_KEY`).
4. **Ejecución del Script Maestro [deploy_remote.sh](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/deploy_remote.sh):**
   - Actualización del código fuente en `/app/laika`.
   - Sincronización del repositorio de Pilgrim API Gateway.
   - Verificación de variables de producción (`.env.production`).
   - Reconstrucción de imágenes de contenedores y actualización en caliente con `docker compose -f docker-compose.prod.yml up -d --build`.
   - Health check local contra el endpoint de salud `http://127.0.0.1:8000/api/health`.

---

## 4. ARQUITECTURA DE MONITOREO Y OBSERVABILIDAD

El monitoreo de la solución opera en tres niveles de visibilidad:

### 4.1 Nivel Infraestructura y Contenedores (Docker Runtime)
* Inspección de saturación de CPU, consumo de memoria RAM y transferencia de red por contenedor mediante `docker stats`.
* Límites de memoria por contenedor asignados en `docker-compose.prod.yml` para evitar condiciones de OOM (*Out Of Memory*).

### 4.2 Nivel API Gateway y Salud de Microservicios
* Endpoint centralizado de inspección: `GET /api/health`.
* Validación periódica de conectividad hacia cada microservicio dependiente (Auth, Tickets, Events, Admin, Analytics).
* Alertas de indisponibilidad con reinicio automático de contenedores (`restart: always`).

### 4.3 Nivel Aplicativo y Logs en Tiempo Real
* Centralización de logs de acceso y errores en NGINX (`/var/log/nginx/access.log` y `error.log`).
* Trazabilidad de transacciones críticas y bloqueos de boletos en `auth_logs` y registros de tickets en MySQL.

---

## 5. EVALUACIÓN DE RENDIMIENTO Y DISPONIBILIDAD

Para garantizar la operación continua sin caídas en eventos masivos:
* **Objetivo de Disponibilidad (SLA):** 99.9% de uptime mensual.
* **Pruebas de Estrés Transaccional:** Ejecución de suites de concurrencia ([simulate_concurrency_stress.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/performance/simulate_concurrency_stress.js)) simulando ráfagas simultáneas de hasta 200 peticiones en el mismo milisegundo sobre el mismo asiento.
* **Garantía Transaccional:** Cero doble compra demostrada matemáticamente mediante semáforos de bloqueo atómico.

---

## 6. CRONOGRAMA DE LIBERACIÓN Y HITOS

| Actividad | Entregable | Fecha Límite | Estado |
| :--- | :--- | :---: | :---: |
| **Aprovisionamiento IaC** | Plantillas Terraform aplicadas en Azure | 10 Noviembre 2026 | Completado |
| **Configuración de Pipeline CD** | Workflow `.github/workflows/cd.yml` | 18 Noviembre 2026 | Completado |
| **Pruebas de Carga y Rendimiento** | Ejecución de scripts de estrés y métricas | 25 Noviembre 2026 | Completado |
| **Despliegue y Monitoreo Final** | Software en vivo, métricas y propuesta de mejora | 5 Diciembre 2026 | Completado |

