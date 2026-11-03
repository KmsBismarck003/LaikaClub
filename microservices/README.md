# Microservicios Especializados y Analitica Big Data - LAIKA Club (microservices)

Servicios analiticos avanzados, procesamiento distribuido de datos masivos con Apache Spark, modelos de Machine Learning y backend para dispositivos IoT/Wearables de LAIKA Club.

---

## 1. Descripcion General

El directorio `microservices` contiene los componentes especializados de procesamiento de datos pesados y telecomunicaciones de campo que complementan la infraestructura central de Spring Boot:

1. **Motor de Big Data y Machine Learning (`analytics_bigdata`)**: Microservicio en Python que integra Apache Spark (PySpark) y FastAPI para ejecutar algoritmos predictivos, proyecciones de demanda de taquilla, analisis de comportamiento de compra y deteccion de anomalias en transacciones.
2. **Backend de Wearables e IoT (`wearables_backend`)**: Servicio en Node.js y Express dedicado a la comunicacion con pulseras inteligentes (NFC/RFID) y balizas de posicionamiento utilizadas por asistentes en festivales y conciertos masivos.
3. **Generadores y Simuladores de Carga**: Scripts de ingesta masiva y generacion de datos sinteticos para pruebas de estres y calibracion de modelos analiticos.

---

## 2. Mapa de Servicios y Puertos

| Servicio | Directorio | Tecnologia | Puerto Interno | Proposito |
| :--- | :--- | :--- | :--- | :--- |
| `analytics_bigdata` | `analytics_bigdata/` | Python 3.11, PySpark, FastAPI, Scikit-learn | **8303** | Modelos ML (Ridge, Lasso, Regresion Lineal), recomendaciones de eventos personalizadas con gestion de Cold Start y deteccion de anomalias. |
| `wearables_backend` | `wearables_backend/` | Node.js 18+, Express | **8204** | Telemetria y vinculacion de pulseras inteligentes a boletos para control de accesos rapidos y consumo dentro del recinto. |

---

## 3. Motor Big Data y Machine Learning (`analytics_bigdata`)

### Arquitectura del Servicio
- **Framework de API**: FastAPI ejecutandose sobre Uvicorn en el puerto 8303.
- **Motor de Computo Distribuido**: Apache Spark en modo local para operaciones de agregacion y mineria de datos sin bloquear el hilo principal.
- **Bases de Datos Asociadas**: Conecta a MySQL (`laika_analytics`) para datos transaccionales estructurados y a MongoDB Atlas para almacenamiento de series de eventos y telemetria no estructurada.

### Capacidades Predictivas y Algoritmos
- **Recomendacion de Espectaculos (`/api/analytics/ml/recommendations/{user_id}`)**:
  - Filtro colaborativo basado en historial previo de compras.
  - Manejo de Cold Start: si el usuario es de reciente creacion o no tiene historial, el sistema retorna limpiamente `status: "cold_start"` y una lista de eventos con mayor traccion general, evitando errores 500.
- **Proyeccion de Demanda de Taquilla**:
  - Modelos de regresion lineal y regularizacion (Ridge y Lasso) para predecir el ritmo de agotamiento de funciones con base en fecha, dia de la semana, capacidad del recinto y categoria.
- **Deteccion de Fraude y Anomalias**:
  - Identificacion de patrones sospechosos de adquisicion masiva o intervalos de compra no humanos.

---

## 4. Backend de Wearables (`wearables_backend`)

- **Proposito**: Gestionar la sincronizacion de pulseras electronicas entregadas a usuarios VIP o asistentes a festivales multi-dia.
- **Endpoints Expuestos**: Vinculacion de chip NFC a identificador de boleto (`/api/wearables/pair`), lectura de saldo precargado (`/api/wearables/balance`) y verificacion rapida en puntos de recarga.

---

## 5. Scripts de Utilidad y Simulacion

Ubicados en la raiz del modulo para tareas de calibracion y pruebas:
- `simulador_big_data.py`: Emula flujos continuos de compras y consultas de eventos para evaluar el comportamiento del motor Spark.
- `analytics_bigdata/ingest_synthetic_data.py`: Genera miles de registros sinteticos en bases de datos locales para entrenamiento de modelos.
- `analytics_bigdata/test_laika_analytics.py`: Suite de verificacion de endpoints analiticos y contratos de respuesta.

---

## 6. Instalacion y Puesta en Marcha

### Prerrequisitos
- Python version 3.10 o 3.11 con Java Runtime Environment (JRE) para soporte de Apache Spark.
- Node.js 18+ para el modulo de wearables.

### Ejecucion de `analytics_bigdata` (Python / PySpark)
```bash
cd microservices/analytics_bigdata
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8303 --reload
```

### Ejecucion de `wearables_backend` (Node.js)
```bash
cd microservices/wearables_backend
npm install
npm run dev
```

### Ejecucion en Docker
Ambos servicios estan integrados en `docker-compose.yml` bajo los nombres de contenedor `laika_analytics_bigdata` y `laika_wearables`.
