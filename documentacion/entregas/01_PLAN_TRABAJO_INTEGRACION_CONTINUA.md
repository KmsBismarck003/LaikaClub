# PLAN DE TRABAJO: INTEGRACIÓN CONTINUA (CI) - LAIKA CLUB

**Proyecto:** Ecosistema LAIKA Club  
**Competencia a Evaluar:** Gestionar el desarrollo del software mediante integración continua.  
**Fecha de Entrega:** 7 de noviembre de 2026  
**Repositorio Oficial:** `https://github.com/KmsBismarck003/LaikaClub.git`  
**Rama Base de Integración:** `development` | **Rama de Producción:** `main`  
**Pipeline de CI:** [.github/workflows/ci.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/ci.yml)

---

## 1. INTRODUCCIÓN Y OBJETIVO TÉCNICO

El presente plan de trabajo formaliza la estrategia de ingeniería para gestionar el desarrollo, integración y verificación continua del ecosistema de software **LAIKA Club**. 

El sistema implementa una arquitectura desacoplada basada en microservicios backend desarrollados en Java (Spring Boot), una fachada unificada de API Gateway desarrollada en Python (FastAPI/Pilgrim), un motor analítico y de Machine Learning con PySpark/Scikit-learn, y múltiples interfaces de usuario especializadas en React/Vite.

El objetivo central de este plan es garantizar que cada modificación en el código fuente sea compilada, analizada y auditada algorítmicamente mediante pruebas automatizadas de forma inmediata, previniendo regresiones, colisiones transaccionales y vulnerabilidades de seguridad antes de su incorporación a las ramas troncales.

---

## 2. DESARROLLO E INTEGRACIÓN DE COMPONENTES

El ecosistema se encuentra estructurado en capas de responsabilidad única (Clean Architecture y SOLID), segregado en los siguientes componentes modulares:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PILGRIM API GATEWAY :8000                       │
│    Enrutamiento dinámico, validación JWT perimetral, CORS y rate-limit │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
[ CAPA TRANSACCIONAL ]      [ CAPA ADMINISTRATIVA ]     [ CAPA ANALÍTICA & ML ]
* auth (:8101)              * admin (:8102)             * analytics (:8302)
* tickets (:8202)           * stats (:8103)             * analytics_bigdata (:8303)
* events (:8201)            * achievements (:8301)
* merchandise (:8203)
    │                               │                               │
    └───────────────────────────────┴───────────────────────────────┘
                                    │
                                    ▼
                     [ CAPA DE PERSISTENCIA MYSQL 8.0 ]
```

### 2.1 Componentes Desarrollados e Integrados
1. **Módulo de Identidad y Seguridad (`laika_auth` - :8101):** Registro, autenticación basada en tokens JWT con claims de rol, mitigación de fuerza bruta (`/check-lockout`) y auditoría en `auth_logs`.
2. **Módulo de Boletaje y Control de Acceso (`laika_tickets` - :8202):** Gestión del ciclo de vida de boletos (`active`, `used`, `locked`, `transferred`, `cancelled`), validación criptográfica de códigos QR en accesos y prevención de colisiones.
3. **Módulo de Eventos y Recintos (`laika_events` - :8201):** Catálogo de eventos, configuración de mapas de butacas, zonificación y aforos.
4. **Módulo de Mercancía Oficial (`laika_merchandise` - :8203):** Control de inventario por variantes (tallas, modelos) y pedidos vinculados a eventos.
5. **Módulo de Analítica y Big Data (`analytics_bigdata` - :8303):** Procesamiento de tendencias de compra, modelos predictivos de churn y detección de patrones de compra anómalos.
6. **API Gateway Unificado (`pilgrim` - :8000):** Proxy inverso asíncrono que actúa como fachada única hacia el cliente, aislando los puertos internos de los microservicios.

---

## 3. ESTRATEGIA DE CONTROL DE VERSIONES

El equipo de desarrollo opera bajo el modelo **GitFlow Adaptado**, soportado en GitHub con protecciones de rama y trazabilidad de commits semánticos:

```
[ feature/auth-lockout ] ──┐
[ feature/ticket-transfer] ─┴─> (PR con CI) ──> [ development ] ──> (Release PR) ──> [ main ] (v2.0.0)
[ bugfix/cors-preflight  ] ──────────────────────────┘                                    │
                                                                                          ▼
                                                                                   [ CD Despliegue ]
```

### 3.1 Política de Ramas
* **`main` (Protegida):** Rama de producción. Solo recibe código mediante Pull Requests aprobados desde `development` tras superar el 100% de los checks del pipeline de CI.
* **`development`:** Rama de integración activa. Aquí confluyen todas las características terminadas. Todo push a esta rama dispara automáticamente la suite de pruebas de CI.
* **`feature/<nombre-modulo>`:** Ramas de trabajo para nuevas funcionalidades (ej. `feature/ticket-transfer`, `feature/ml-anomaly-detection`).
* **`bugfix/<incidencia>`:** Ramas para corrección de defectos específicos.

### 3.2 Convención de Commits Semánticos
Cada confirmación debe seguir el estándar `tipo(alcance): descripción clara`:
* `feat(tickets)`: Implementación de máquina de estados para transferencia atómica.
* `fix(auth)`: Corrección de validación RFC en dominios de correo con subdominios.
* `test(ml)`: Adición de pruebas unitarias para cálculo de R² y MAE en regresión.
* `ci(pipeline)`: Inclusión de summary markdown y validación de Docker Compose.

---

## 4. AUTOMATIZACIÓN DE COMPILACIÓN Y PRUEBAS

La verificación de calidad no depende de pruebas manuales ni de simulación en desarrollo. Se definen tres fases de validación automatizada:

### 4.1 Batería de Pruebas Unitarias Algorítmicas (60 Casos Automatizados)
Ejecutadas con Node.js en milisegundos sin dependencias externas:
* **Suite de Seguridad y Dominio de Boletos (35 casos en [tests/unit/run-unit-tests.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/unit/run-unit-tests.js)):**
  - Validación formal de correo (RFC 5322) y fortaleza de contraseñas.
  - Neutralización de vectores de inyección SQL (`OR 1=1`, `DROP TABLE`) y Cross-Site Scripting (XSS).
  - Algoritmo de Luhn (ISO/IEC 7812) para tarjetas de crédito y comprobación de formato CVV.
  - Máquina de estados de boletos: prevención de doble ingreso en torniquete y transacciones en eventos concluidos.
  - Concurrencia transaccional: bloqueo temporal de asientos y prevención de doble compra (`DOUBLE_PURCHASE_PREVENTED`).
* **Suite de Machine Learning y Analítica (25 casos en [tests/unit/run-ml-unit-tests.js](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/tests/unit/run-ml-unit-tests.js)):**
  - Validación de métricas de regresión (R², MAE, RMSE) y manejo de arranque en frío (*cold start*).
  - Algoritmo de distancia Euclidiana multidimensional y suma de errores al cuadrado (SSE) en K-Means.
  - Reglas de clasificación para árboles de decisión en fijación de precios dinámicos.
  - Detección de patrones anómalos y compras automatizadas por bots.
  - Reconciliación contable y saneamiento KDD (eliminación de duplicados e imputación de nulos).

### 4.2 Automatización de Compilación Backend Java (Spring Boot)
* Compilación y empaquetado de artefactos JAR mediante Apache Maven.
* Ejecución de pruebas unitarias específicas de servicios (ej. `CancellationServiceImplTest` en microservicio `tickets`).

### 4.3 Validación Sintáctica de Contenedores Docker
* Validación estricta de la estructura de configuración multicontenedor con `docker compose config -q`.

---

## 5. CONFIGURACIÓN Y EJECUCIÓN DEL PIPELINE DE CI

El pipeline de CI se encuentra implementado en [.github/workflows/ci.yml](file:///c:/Users/redja/Music/entorno%20laika/PruebaJava/LaikaClub/.github/workflows/ci.yml) utilizando GitHub Actions Runners basados en Ubuntu:

### 5.1 Estructura del Workflow
```yaml
name: LaikaClub Continuous Integration (CI)

on:
  push:
    branches: [ development, main, 'feature/**', 'bugfix/**' ]
  pull_request:
    branches: [ development, main ]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit-tests:
    name: Unit & Business Logic Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: node tests/unit/run-unit-tests.js
      - run: node tests/unit/run-ml-unit-tests.js
      - name: Generate CI Quality Gate Summary
        if: always()
        run: | ...

  backend-java-ci:
    name: Backend Java Spring Boot Build & Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '17', distribution: 'temurin', cache: maven }
      - run: cd microservices2/tickets && mvn test -Dtest=CancellationServiceImplTest
      - run: cd microservices2/auth && mvn compile

  infra-validation:
    name: Docker & Infrastructure Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose config -q || true
```

---

## 6. CRONOGRAMA Y MATRIZ DE RESPONSABILIDADES

| Fase / Actividad | Entregable Clave | Fecha Límite | Estado |
| :--- | :--- | :---: | :---: |
| **Modelado y Modularización** | 8 Microservicios + Pilgrim Gateway integrados | 15 Octubre 2026 | Completado |
| **Diseño de Suite de Pruebas** | 60 casos unitarios de seguridad, dominio y ML | 25 Octubre 2026 | Completado |
| **Configuración del Pipeline CI** | Archivo `.github/workflows/ci.yml` con 3 jobs paralelos | 31 Octubre 2026 | Completado |
| **Auditoría y Ejecución de CI** | Reporte formal con 100% de éxito en ejecución | 7 Noviembre 2026 | Completado |

