# Microservicios Especializados y Analitica Big Data - LAIKA Club (microservices)

Servicios complementarios en Python para analitica avanzada, Machine Learning, procesamiento con Apache Spark (PySpark) y endpoints de inteligencia de negocios MATIS, ademas de un modulo parcial de wearables en TypeScript.

---

## 1. Mapa de Servicios y Estado Actual

| Directorio | Tecnologia | Puerto | Estado Actual | Proposito |
| :--- | :--- | :--- | :--- | :--- |
| `analytics_bigdata/` | Python, FastAPI 0.103.1, Uvicorn 0.23.2, PySpark 3.5.0, Scikit-learn 1.3.1, Pandas 2.1.0, PyMySQL, PyMongo | **8303** | **Activo** (`laika_analytics_bigdata` en `docker-compose.yml` y `docker-compose.prod.yml`) | Motor de analitica, modelos ML, saneamiento KDD, boveda NoSQL en MongoDB y API de inteligencia de negocios MATIS. |
| `wearables_backend/` | TypeScript, Express, Socket.IO, MySQL | **8204** (referencia en config) / `3010` en `Dockerfile` | **Parcial / No activo en Docker Compose** | Contiene repositorio MySQL, servicio Socket.IO, controlador y rutas de vinculacion de relojes (`laikaWear Watch`). Actualmente no tiene `package.json` ni `src/server.ts` en el repositorio, y no esta declarado como servicio en `docker-compose.yml` ni `docker-compose.prod.yml`. |

---

## 2. Motor Big Data, Machine Learning y MATIS BI (`analytics_bigdata/`)

### Dependencias Verificadas (`analytics_bigdata/requirements.txt`)
- `fastapi==0.103.1`, `uvicorn==0.23.2`
- `pyspark==3.5.0`
- `pymysql==1.1.0`, `pymongo==4.5.0`
- `numpy==1.25.2`, `scikit-learn==1.3.1`, `pandas==2.1.0`
- `python-dotenv==1.0.0`, `psutil==5.9.5`

### Arquitectura Interna
- `main.py` y `engine.py`: Aplicacion FastAPI y motor de ejecucion analitica.
- `modules/`: Modulos especializados (`base.py`, `classification.py`, `clustering_pca.py`, `intelligence.py`, `merchandise_analytics.py`, `neural_network.py`, `processing.py`, `recommendations.py`, `regression.py`, `resilience.py`, `scrapers.py`, `user_demand_analytics.py`, `vault.py`).
- `algorithms/`: Implementaciones organizadas en `classification/`, `clustering/` y `regression/`.
- `matis/`: Sub-routers de Business Intelligence consumidos por `matis-solid` (`customers/`, `events/`, `executive/`, `geography/`, `operational/`, `predictive/`, `products/`, `quality/`, `sales/`, `venues/`, `shared/`, `router.py`).

### Endpoints Implementados

#### Salud, ETL y Big Data (`main.py`)
- `GET /health`
- `GET /api/analytics/tables`, `GET /api/analytics/suggestions`
- `GET /api/analytics/full`, `GET /api/analytics/incremental`, `GET /api/analytics/mapreduce`, `GET /api/analytics/3d`
- `POST /api/analytics/predict`, `POST /api/analytics/anomalies`, `POST /api/analytics/clean`
- `GET /api/analytics/stats/descriptive`, `GET /api/analytics/intelligence`

#### Boveda NoSQL / Snapshots (`main.py`)
- `GET /api/analytics/vault/status`, `GET /api/analytics/vault/list`
- `POST /api/analytics/vault/sync`
- `GET /api/analytics/vault/download/{snapshot_id}`
- `POST /api/analytics/vault/restore/{snapshot_id}`
- `DELETE /api/analytics/vault/delete/{snapshot_id}`

#### Machine Learning y Analitica Predictiva (`main.py`)
- `GET /api/analytics/ml/regression`, `GET /api/analytics/ml/decision-tree`
- `GET /api/analytics/ml/elbow`, `GET /api/analytics/ml/pca`, `GET /api/analytics/ml/anomaly`
- `GET /api/analytics/ml/prospecting`, `POST /api/analytics/ml/prospecting/lead`
- `GET /api/analytics/ml/user-behavior`, `POST /api/analytics/ml/user-behavior/grant-coupon`
- `GET /api/analytics/ml/demand-prediction`, `GET /api/analytics/merch/sales-insights`
- `GET /api/analytics/ml/recommendations/{user_id}`, `POST /api/analytics/ml/recommend-target`
- `GET /api/analytics/ml/market-gaps`

#### Sub-API MATIS BI (`matis/`)
- **Executive**: `/kpis`, `/category-performance`, `/category-performance/details`, `/sales-trend`, `/sales-trend/details`, `/ticket-buyers`
- **Events**: `/occupancy`, `/top-revenue`, `/ticket-status`, `/list`, `/compare`
- **Sales**: `/summary`, `/payment-methods`, `/price-ranges`
- **Products**: `/sales`, `/stock-alerts`
- **Customers**: `/segments`, `/churn`
- **Geography**: `/sales-by-state`
- **Venues**: `/prospects`
- **Operational**: `/system`
- **Predictive**: `/regression`, `/decision-tree`, `/sold-out`, `/anomalies`
- **Quality**: `/integrity-score`, `POST /clean`

---

## 3. Modulo de Wearables (`wearables_backend/`)

Estado real en el repositorio:
- Archivos presentes en `wearables_backend/src/`:
  - `infrastructure/repositories/MysqlWearableRepository.ts`: Persistencia de dispositivos (`wearables`) con PIN de vinculacion, nivel de bateria y estado en linea.
  - `infrastructure/websockets/SocketService.ts`: Eventos Socket.IO (`wearable:request_pin`, `wearable:check_status`, `wearable:pin_generated`).
  - `presentation/controllers/WearableController.ts` y `presentation/routes/WearableRoutes.ts`: Rutas definidas `POST /request-pin`, `POST /link`, `GET /my-devices`, `PUT /:id`, `DELETE /:id`, `POST /user/:userId/update-tickets`.
- Pendientes para ejecucion autonoma: faltan `package.json`, `tsconfig.json`, el punto de entrada `src/server.ts`, las entidades/casos de uso referenciados y su declaracion de servicio en `docker-compose.yml`.

---

## 4. Scripts de Utilidad y Pruebas en el Directorio

- `microservices/simulador_big_data.py`: Script de simulacion de carga y datos analiticos.
- `microservices/analytics_bigdata/ingest_synthetic_data.py`: Ingesta de datos sinteticos para entrenamiento y pruebas.
- `microservices/analytics_bigdata/test_laika_analytics.py`, `test_analytics_stress.py`, `test_market.py`: Scripts de verificacion de endpoints analiticos.

---

## 5. Instalacion y Ejecucion de `analytics_bigdata`

### Prerrequisitos
- Python 3.10 o 3.11 y Java Runtime Environment (JRE) para Apache Spark.
- MySQL 8.0 (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`) y MongoDB (`MONGO_URI`, opcional si solo se consultan endpoints relacionales).

### Ejecucion Local
```bash
cd microservices/analytics_bigdata
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8303 --reload
```

### Ejecucion con Docker Compose
Desde la raiz de `LaikaClub`:
```bash
docker compose up -d analytics_bigdata
```
