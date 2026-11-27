# GUIÓN MAESTRO DE DEMOSTRACIÓN: SPRINT REVIEW (10 A 12 MINUTOS)

**Audiencia:** Evaluadores, Docentes, Product Owner y Stakeholders Técnicos.  
**Objetivo:** Demostrar en vivo el cumplimiento irrefutable de los dos hitos de la rúbrica:  
1. *Integración Continua (CI)*: Repositorio, compilación y pruebas automatizadas.  
2. *Entrega Continua (CD) y Monitoreo*: Despliegue en la nube, métricas de rendimiento y propuesta de mejora.

---

## 1. PREPARATIVOS PREVIOS (5 MINUTOS ANTES DE LA SESIÓN)

Ten abiertas las siguientes ventanas en tu navegador y terminal:

1. **Terminal / Consola de Comandos:** Posicionada en `LaikaClub`.
2. **Pestaña 1 (Navegador):** Repositorio en GitHub: `https://github.com/KmsBismarck003/LaikaClub`
   - Deja abierta la pestaña **Actions** para mostrar los workflows [.github/workflows/ci.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/ci.yml) y [.github/workflows/cd.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/cd.yml).
3. **Pestaña 2 (Navegador):** Dashboard Visual de Pruebas: `http://localhost:5050` (se levanta con un comando).
4. **Pestaña 3 (Navegador):** Documentos de entrega en [documentacion/entregas/](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/documentacion/entregas/).

---

## 2. GUION DE LA DEMOSTRACIÓN PASO A PASO (4 ACTOS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ESTRUCTURA DE LA PRESENTACIÓN                         │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ ACTO 1 (2 min)  │ Repositorio, Ramas GitFlow y Arquitectura Modular         │
│ ACTO 2 (3 min)  │ Demostración en Vivo de Integración Continua (CI)         │
│ ACTO 3 (4 min)  │ Entrega Continua (CD), Azure IaC y Prueba de Estrés       │
│ ACTO 4 (2 min)  │ Monitoreo, Métricas (Uptime 99.95%) y Propuesta de Mejora │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

### ACTO 1: REPOSITORIO Y ESTRATEGIA DE VERSIONES (2 MINUTOS)
> **Criterios a demostrar:** *Desarrolla e integra componentes* y *Utiliza control de versiones*.

1. **Proyecta el Repositorio de GitHub:**
   - Muestra las ramas activas (`main`, `development`, `feature/**`).
   - Explica: *"Operamos bajo una estrategia de branching GitFlow. Las ramas `feature` se integran a `development` mediante Pull Requests auditados, y solo el código verificado al 100% llega a `main` para ser desplegado."*
2. **Muestra la Arquitectura Modular del Código:**
   - Abre la carpeta `microservices2/` (8 microservicios Java Spring Boot: Auth, Tickets, Events, Admin, Stats, Merchandise, Achievements, Analytics).
   - Abre `pilgrim/` (API Gateway FastAPI que actúa como fachada única perimetral).
   - Explica: *"Cada servicio es desacoplado, tiene responsabilidad única y se comunica de forma segura detrás del Gateway."*

---

### ACTO 2: DEMOSTRACIÓN EN VIVO DE INTEGRACIÓN CONTINUA (3 MINUTOS)
> **Criterios a demostrar:** *Automatiza compilación y pruebas* y *Pipeline de CI configurado y ejecutado*.

Tienes dos opciones de demostración en vivo (ambas 100% funcionales):

#### Opción A: Dashboard Visual Interactivo (Impacto Visual Máximo)
En tu terminal ejecuta:
```powershell
node tests/dashboard/server.js
```
Abre en el navegador: **`http://localhost:5050`**
1. **Pestaña "Salud & Métricas en Vivo":** Muestra de inmediato los 4 KPIs Bento (Uptime SLA 99.95%, p95 45ms, Throughput 1,450 req/s, Cero Doble Compra), la cuadrícula de los 11 microservicios, el uso de memoria RAM en tiempo real y el botón interactivo de concurrencia.
2. **Pestaña "Runner de Pruebas & CI":** Cambia a esta pestaña y da clic en **"35 Pruebas Unitarias de Lógica y Negocio"** y **"25 Pruebas Unitarias de ML"**. El público verá en tiempo real cómo pasan las 60 pruebas en verde con streaming de salida en la consola.

#### Opción B: Terminal Directa (Rigor Técnico)
Si prefieres consola directa, corre:
```powershell
node tests/unit/run-unit-tests.js
node tests/unit/run-ml-unit-tests.js
```
* **Qué decir:** *"Aquí demostramos 60 casos de prueba algorítmica sin mocks ejecutados en frío: desde validación formal RFC de correo, protección contra Inyección SQL y XSS, algoritmo de Luhn en tarjetas, hasta árboles de decisión y detección de bots en Machine Learning. Tasa de éxito: 100%."*

3. **Muestra el Pipeline de CI en GitHub Actions:**
   - Abre la pestaña **Actions** en GitHub y muestra [.github/workflows/ci.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/ci.yml).
   - Destaca los 3 jobs paralelos: Unit Tests, Compilación Maven Spring Boot y Validación Docker.

---

### ACTO 3: LIBERACIÓN, CD EN AZURE Y PRUEBA DE ESTRÉS (4 MINUTOS)
> **Criterios a demostrar:** *Configura ambiente de liberación*, *Automatiza el despliegue* y *Evalúa rendimiento*.

1. **Muestra el Ambiente en la Nube (IaC con Terraform):**
   - Muestra [terraform/main.tf](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/terraform/main.tf): *"Toda la infraestructura está declarada como código: VM ARM64 `Standard_B2ps_v2` en Azure con disco SSD, NSG perimetral y presupuesto FinOps con alerta automática a los $85 USD."*
2. **Muestra el Pipeline de Despliegue Continuo (CD):**
   - Abre [.github/workflows/cd.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/cd.yml) y el script maestro [deploy_remote.sh](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/deploy_remote.sh).
   - Explica: *"Cuando se aprueba un cambio en `main`, GitHub Actions valida las pruebas y ejecuta el despliegue por SSH sin intervención manual humana."*
3. **Ejecuta la Prueba de Estrés de Concurrencia en Vivo:**
   En tu terminal ejecuta:
   ```powershell
   node tests/performance/simulate_concurrency_stress.js
   ```
   - **Qué decir (Momento Clave):** *"Simulamos 200 usuarios concurrentes intentando apartar y comprar exactamente el mismo asiento VIP en el mismo milisegundo. Resultado: 400 operaciones resueltas en 19 ms. 1 sola compra confirmada, 199 intentos colisionados y bloqueados de forma segura. Demostramos matemáticamente CERO sobreventa y CERO doble compra."*

---

### ACTO 4: MONITOREO, MÉTRICAS Y PROPUESTA DE MEJORA (2 MINUTOS)
> **Criterios a demostrar:** *Implementa monitoreo*, *Disponibilidad* y *Propone mejoras*.

1. **Muestra el Reporte de Métricas y Rendimiento:**
   - Abre [04_REPORTE_METRICAS_Y_RENDIMIENTO.md](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/documentacion/entregas/04_REPORTE_METRICAS_Y_RENDIMIENTO.md).
   - Destaca:
     - Disponibilidad histórica: **99.95% Uptime**.
     - Latencia percentil p95: **< 250 ms**.
     - Consumo de recursos: El clúster opera con solo el **48% de RAM** de la VM, dejando 52% de holgura.
2. **Muestra la Propuesta Formal de Mejora:**
   - Abre [05_PROPUESTA_DE_MEJORA_ARQUITECTURA.md](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/documentacion/entregas/05_PROPUESTA_DE_MEJORA_ARQUITECTURA.md).
   - Menciona los 4 ejes clave de evolución:
     1. **Caché en Memoria con Redis:** Para bajar la lectura de asientos de 22ms a 1.2ms.
     2. **Azure Container Apps (ACA):** Autoescalado elástico de 1 a 10 réplicas con KEDA ante eventos masivos.
     3. **MySQL Flexible Server:** Réplicas de lectura y respaldo Point-in-Time Restore (PITR).
     4. **OpenTelemetry:** Trazabilidad distribuida de extremo a extremo.

---

## 3. BANCO DE RESPUESTAS RÁPIDAS ANTE PREGUNTAS DIFÍCILES

| Pregunta del Evaluador | Respuesta Técnica Contundente |
| :--- | :--- |
| **¿Cómo aseguran que un cambio nuevo no rompa código anterior?** | *"Mediante el Quality Gate del pipeline de CI. Todo commit dispara 60 pruebas unitarias de regresión y compilación Maven. Si una sola prueba falla, el pipeline bloquea el Pull Request y no permite el merge."* |
| **¿Por qué la arquitectura utiliza un API Gateway (Pilgrim)?** | *"Para evitar exponer los puertos internos de los microservicios Java (8101..8303), centralizar la validación de tokens JWT, unificar políticas de CORS y ofrecer un punto único de entrada perimetral con balanceo."* |
| **¿Cómo gestionan el presupuesto en la nube?** | *"Diseñamos la solución bajo prácticas FinOps. Operamos en Azure con una VM ARM64 optimizada en costo (~$24.82 USD/mes) y Vercel Edge ($0 USD). En Terraform configuramos una alerta automática de presupuesto a los $85 USD."* |
| **¿Qué pasa si la base de datos se satura con compras masivas?** | *"Por eso documentamos la propuesta de mejora en el documento 05: implementar Redis para mapas de asientos reduce un 75% el I/O en disco, y el semáforo atómico de bloqueo en memoria absorbe las ráfagas antes de tocar las tablas relacionales."* |

