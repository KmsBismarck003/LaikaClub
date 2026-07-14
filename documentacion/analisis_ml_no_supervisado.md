# Análisis Técnico y de Negocio: Aprendizaje Automático No Supervisado en Laika Club

Este documento presenta la evaluación estratégica, técnica y de arquitectura para la incorporación de técnicas de **Aprendizaje Automático No Supervisado** en la plataforma de gestión de eventos y venta de tickets **Laika Club**. 

Como equipo de Consultoría Senior en IA y Arquitectura de Software, nuestro objetivo es asegurar que cada algoritmo implementado genere un **retorno de inversión (ROI) claro**, mejore la toma de decisiones empresariales o enriquezca la experiencia del usuario, evitando implementaciones puramente cosméticas o académicas.

---

## 1. Resumen Ejecutivo: La Oportunidad de Negocio

Laika Club ha evolucionado de un modelo de venta directa a una plataforma **B2B SaaS** controlada mediante contratos y organizaciones, complementado con un canal transaccional **B2C** (venta de boletos a fans) y una tienda de **merchandising**.

El aprendizaje no supervisado ofrece tres ventajas competitivas críticas para este modelo híbrido:
1. **B2B (Optimización de Ventas y Prospección):** Identificar prospectos comerciales ("lookalikes") con base en el comportamiento real de los recintos activos, permitiendo al equipo de ventas cerrar contratos de mayor valor con menor esfuerzo.
2. **B2C (Hiper-personalización y Retención):** Agrupar a los fans por patrones de consumo reales (frecuencia, gasto, categorías) para automatizar campañas de marketing de precisión, incrementando el *Customer Lifetime Value* (CLV).
3. **MLOps y UX Consistente:** Integrar los modelos mediante una arquitectura desacoplada (Batch processing con Apache Spark y base de datos NoSQL de lectura rápida) para evitar latencias en la compra de boletos, acompañando los resultados de visualizaciones interactivas intuitivas para los administradores.

---

## 2. Análisis Individual de Técnicas y Algoritmos

A continuación, se evalúa la utilidad de los conceptos propuestos dentro del ecosistema de Laika Club.

### 2.1. Representación de Datos (Vectorización)
* **Definición Técnica:** Transformación de variables transaccionales, geográficas y categóricas en un vector numérico estructurado $\mathbf{x} = [x_1, x_2, \dots, x_n]$.
* **Utilidad:** **CRÍTICA / ALTA**
* **Beneficios Concretos:** Permite que datos crudos de MySQL (compras de boletos, precios, aforos, ubicaciones) puedan ser procesados por algoritmos matemáticos. Sin vectorización, no es posible aplicar K-Means, PCA ni distancia euclidiana.
* **Datos Necesarios:**
  * **Para Fans:** Cantidad de boletos comprados, precio promedio pagado, gasto total en tickets, gasto en merch, porcentaje de compras en categorías (concierto, teatro, deporte), estado de residencia.
  * **Para Recintos:** Capacidad total, promedio de eventos al mes, ingresos históricos, porcentaje de ocupación media.
* **Complejidad y Costos:** Baja-Media. En Spark se implementa de manera eficiente utilizando `VectorAssembler` y `StandardScaler` (escalamiento obligatorio para evitar que el gasto total en pesos distorsione variables como la cantidad de boletos).
* **Riesgos:** Si no se normalizan las variables, el modelo considerará el "gasto total" (valores en miles) miles de veces más importante que la "cantidad de eventos" (valores pequeños).

### 2.2. Algoritmo K-Means
* **Definición Técnica:** Algoritmo de particionado que agrupa $N$ observaciones en $K$ clústeres disjuntos basándose en la distancia a los centros de los grupos (centroides).
* **Utilidad:** **ALTA**
* **Beneficios Concretos:** 
  * **B2C:** Segmentación automática de fans en categorías de valor (ej. *Fans Casuales*, *Fans Regulares*, *Súper Fans/Whales*). Esto permite lanzar promociones específicas, como códigos de retención automáticos para usuarios en riesgo de inactividad o pre-ventas exclusivas para "Whales".
  * **B2B:** Clasificación de los recintos activos en perfiles de rendimiento comercial (*Emergente*, *Estable*, *Masivo/VIP*) para orientar el cobro de comisiones y estimar el éxito de nuevos espectáculos.
* **Datos Necesarios:** Vectores de fans o recintos normalizados procedentes de la etapa de procesamiento.
* **Complejidad y Costos:** Media. Requiere ejecuciones de entrenamiento periódicas (offline/batch) mediante PySpark ML.
* **Riesgos:** La asignación aleatoria inicial de centroides puede llevar a mínimos locales. *Mitigación:* Usar el inicializador `k-means||` (por defecto en Spark) y fijar una semilla aleatoria (`seed=42`) para garantizar la reproducibilidad de los segmentos.

### 2.3. Distancia Euclidiana
* **Definición Técnica:** Métrica de distancia geométrica definida como:
  $$d(\mathbf{p}, \mathbf{q}) = \sqrt{\sum_{i=1}^n (p_i - q_i)^2}$$
* **Utilidad:** **ALTA**
* **Beneficios Concretos:**
  * **B2B Lookalike Prospecting:** Permite medir cuantitativamente qué tan similar es un prospecto de recinto de MongoDB (ej. "Foro Indie Rocks") respecto a un recinto exitoso registrado en MySQL (ej. "Coliseo Laika 3"). Si la distancia es corta, la plataforma genera una recomendación de alta prioridad de venta para el gestor comercial.
  * **Recomendación de Contenido:** Buscar "usuarios más cercanos" en comportamiento para recomendar eventos que otros ya compraron (Filtro Colaborativo ligero).
* **Datos Necesarios:** Vectores de características escalados de dos entidades de la misma clase.
* **Complejidad y Costos:** Muy baja. Es una fórmula matemática simple que se puede ejecutar en tiempo real dentro del backend de FastAPI (con numpy o math) sin necesidad de levantar el motor de Spark para la consulta interactiva.
* **Riesgos:** Sensibilidad extrema a variables no escaladas (la maldición de la dimensionalidad).

### 2.4. Gestión y Actualización de Centroides
* **Definición Técnica:** El proceso de recalcular las coordenadas medias de cada clúster tras el entrenamiento y actualizar su representación histórica en la base de datos.
* **Utilidad:** **MEDIA-ALTA**
* **Beneficios Concretos:** Los hábitos de consumo cambian (estacionalidad, inflación, modas). Si los centroides quedan fijos para siempre, la segmentación pierde vigencia (concepto conocido como *Data Drift*). Mantener un registro de los centroides en MongoDB permite:
  1. Clasificar instantáneamente a nuevos usuarios mapeándolos al centroide más cercano.
  2. Detectar cuándo un fan migra de segmento (ej. de Casual a Regular) y disparar eventos de marketing automáticos.
* **Datos Necesarios:** Coordenadas de los centros de los clústeres generadas en PySpark ML al finalizar el entrenamiento batch.
* **Complejidad y Costos:** Media. Requiere diseñar una colección en MongoDB (`ml_centroids_history`) que almacene los pesos por versión del modelo.
* **Riesgos:** Cambios abruptos en las definiciones de los segmentos de un mes a otro pueden confundir las estrategias de marketing automatizadas. *Mitigación:* Establecer procesos de re-etiquetado supervisado de centroides estables.

### 2.5. Inercia (WCSS - Within-Cluster Sum of Squares)
* **Definición Técnica:** Suma de las distancias al cuadrado de cada punto a su centroide asignado. Mide qué tan compactos son los grupos.
* **Utilidad:** **MEDIA (Interna)**
* **Beneficios Concretos:** Actúa como la métrica de control de calidad del modelo de segmentación de clientes. Si la inercia aumenta drásticamente con los mismos datos, indica que la segmentación de fans se está volviendo difusa y poco cohesiva, indicando la necesidad de reevaluar las características vectorizadas.
* **Datos Necesarios:** Salida del entrenamiento de K-Means.
* **Complejidad y Costos:** Baja. Es calculada de forma nativa por los algoritmos de clustering.
* **Riesgos:** Por sí sola, la inercia no indica si el segmento tiene sentido comercial, solo mide proximidad matemática.

### 2.6. Optimización del Número de Clústeres (Método del Codo)
* **Definición Técnica:** Gráfica de la Inercia (WCSS) frente a distintos valores de $K$. El "codo" es el punto donde el beneficio de añadir un clúster adicional disminuye significativamente.
* **Utilidad:** **MEDIA** (Excelente para automatización, bajo uso en producción diaria).
* **Beneficios Concretos:** Automatiza la decisión de "en cuántos segmentos debemos agrupar a nuestros usuarios". En lugar de definir arbitrariamente 3 clústeres, el sistema ejecuta periódicamente simulaciones de $K=2$ a $K=8$ y encuentra el punto de inflexión. Esto previene la sobre-segmentación que saturaría a los gestores de marketing.
* **Datos Necesarios:** Matriz de inercia multivariante generada en un loop de entrenamiento rápido.
* **Complejidad y Costos:** Media-Alta. Correr K-Means múltiples veces para graficar el codo consume recursos computacionales significativos en Spark.
* **Riesgos:** En datos reales, el "codo" a veces no está claramente definido (curva suave). Requiere lógica heurística de soporte para elegir el $K$ óptimo de forma automática.

### 2.7. Índice de Silueta (Silhouette Score)
* **Definición Técnica:** Mide qué tan similar es un objeto a su propio clúster (cohesión) en comparación con otros clústeres (separación). Varía entre -1 y 1.
* **Utilidad:** **MEDIA-ALTA (Para MLOps y Dashboards)**
* **Beneficios Concretos:** Es el indicador definitivo de la calidad del clustering. Un Silhouette Score alto (ej. $>0.6$) asegura que nuestros grupos (Súper Fans, Casuales, Inactivos) están perfectamente delimitados. Se expone en el dashboard del administrador como un KPI de la salud de la IA.
* **Datos Necesarios:** Distancia intraclúster e interclúster del dataset de prueba.
* **Complejidad y Costos:** Alta en Spark. Requiere calcular distancias pareadas de todos los puntos, lo cual es computacionalmente pesado en datasets de gran volumen.
* **Riesgos:** Si la base de datos crece a millones de tickets, el cálculo nativo puede ralentizar el pipeline de Spark. *Mitigación:* Calcularlo sobre una muestra representativa del 10% del dataset.

### 2.8. Análisis de Componentes Principales (PCA)
* **Definición Técnica:** Técnica de reducción de dimensionalidad que transforma variables correlacionadas en un conjunto de variables linealmente incorrelacionadas llamadas componentes principales, conservando la mayor varianza posible.
* **Utilidad:** **ALTA**
* **Beneficios Concretos:** 
  1. **Visualización de Negocio (UX Premium):** Los administradores de Laika Club no pueden visualizar un espacio de 5 o más dimensiones (gasto, volumen de compras, recurrencia, etc.). PCA reduce esto a 2D o 3D, permitiendo renderizar una gráfica de dispersión interactiva y dinámica (scatter plot) en el Dashboard de Administrador donde se aprecian claramente los clústeres de usuarios.
  2. **Eficiencia en Clustering:** Reduce el ruido antes de aplicar K-Means, lo que resulta en clústeres más estables y un menor tiempo de cómputo para Spark.
* **Datos Necesarios:** Matriz de vectores escalados multidimensionales.
* **Complejidad y Costos:** Media. En Spark se implementa mediante `PCA` (en la subcapa de *Feature Engineering*).
* **Riesgos:** Se pierde la interpretabilidad directa de los ejes principales (por ejemplo, el eje X del mapa visual representará una combinación matemática de "gasto" y "frecuencia", no una variable física única).

---

## 3. Matriz de Priorización de Implementación

Para maximizar el valor comercial inmediato, utilizaremos una matriz de **Valor de Negocio vs. Esfuerzo de Desarrollo**:

| Algoritmo / Técnica | Utilidad de Negocio | Complejidad / Esfuerzo | Impacto en UX / Operación | Prioridad | Fase de Desarrollo |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **Representación y Vectorización** | Alta | Baja-Media | Ninguno directo (Backend) | **Crítica** | Fase 1 (Base) |
| **Distancia Euclidiana** | Alta | Baja | Recomendaciones lookalike de recintos y clientes | **Alta** | Fase 1 (Lookalike B2B) |
| **Algoritmo K-Means** | Alta | Media | Creación de campañas dirigidas y audiencias automáticas | **Alta** | Fase 2 (Segmentación) |
| **PCA (Reducción Dimensional)** | Alta | Media | Gráfica de visualización interactiva en el Dashboard | **Alta** | Fase 2 (Visualización) |
| **Gestión de Centroides** | Media-Alta | Media | Mapeo rápido en tiempo real para usuarios nuevos | **Media** | Fase 2 (MLOps inicial) |
| **Índice de Silueta** | Media | Alta | Monitoreo de calidad de segmentación para TI | **Media** | Fase 3 (Robustez) |
| **Inercia (WCSS)** | Media | Baja-Media | Monitoreo de consistencia interna de los grupos | **Baja** | Fase 3 (Robustez) |
| **Método del Codo** | Media | Alta | Optimización dinámica de la cantidad de clústeres | **Baja** | Fase 3 (Automatización) |

---

## 4. Recomendaciones Innovadoras (Más allá de la lista original)

Para generar ventajas competitivas disruptivas en Laika Club, proponemos dos técnicas adicionales de aprendizaje no supervisado:

### A. Reglas de Asociación (Algoritmo Apriori / FP-Growth)
* **Caso de Uso:** **Venta Cruzada Inteligente (Cross-Selling)**.
* **Descripción:** Analizar las transacciones conjuntas de tickets y mercancía oficial de bandas. 
* **Valor de Negocio:** Permite recomendar productos en el carrito de checkout. Ejemplo: *"El 78% de los fans que compran tickets para conciertos de Rock Alternativo en Guadalajara también adquieren la playera oficial del evento"*. Permite al sistema sugerir dinámicamente mercancía relevante antes de finalizar el pago del ticket, aumentando el ticket promedio.

### B. Detección de Anomalías basadas en Densidad (DBSCAN o Isolation Forest)
* **Caso de Uso:** **Anti-Bot y Prevención de Reventa en Taquilla**.
* **Descripción:** Los revendedores y bots compran boletos con un patrón de tiempo y volumen anormal. DBSCAN agrupa los datos e identifica los puntos aislados (ruido/anomalías) en el proceso de compra (ej. transacciones a milisegundos de diferencia, tarjetas con nombres no coincidentes repetitivas).
* **Valor de Negocio:** Protege la reputación de Laika Club garantizando que los fans reales tengan acceso a los tickets a precio oficial, bloqueando transacciones fraudulentas o sospechosas de bots en microsegundos.

---

## 5. Propuesta de Arquitectura Decoplada

Para integrar estos modelos sin impactar el rendimiento transaccional de la compra de boletos (que debe ser ultra-rápida y tolerante a fallos), se propone un diseño basado en **Procesamiento Asíncrono Offline-Online**:

```mermaid
graph TD
    %% Base de Datos y Orígenes
    subgraph Capa Transaccional (MySQL/SQLite)
        DB_MYSQL[(MySQL Central)]
    end

    subgraph Capa Analítica Offline
        Spark[Apache Spark / PySpark ML]
        Mongo[(MongoDB Atlas)]
    end

    %% Flujo de Entrenamiento (Batch)
    DB_MYSQL -->|Sincronización Batch Diaria / Semanal| Spark
    Spark -->|1. Vectorización y Normalización| Spark
    Spark -->|2. Ejecución PCA y K-Means| Spark
    Spark -->|3. Cálculo de Centroides e Inercia| Spark
    Spark -->|4. Almacenar Centroides y Asignaciones| Mongo

    %% Capa de Backend Real-Time
    subgraph Microservicio Analytics (FastAPI)
        API_Gateway[API Gateway]
        FastAPI[FastAPI Analytics Service]
        FastAPI_DB[(SQLite Fallback)]
    end

    API_Gateway -->|Ruta /api/analytics| FastAPI
    Mongo -->|Lectura rápida de centroides y coordenadas 2D| FastAPI
    FastAPI -->|Inferencia en caliente mediante Distancia Euclidiana| FastAPI

    %% Cliente
    subgraph Cliente Web (React)
        Admin_Dashboard[Dashboard del Administrador]
        Fan_UI[Interfaz del Fan]
    end

    FastAPI -->|1. Coordenadas PCA y Clústeres| Admin_Dashboard
    FastAPI -->|2. Recomendaciones y Cupones| Fan_UI
```

### 5.1. Flujo de Datos y Roles Arquitectónicos
1. **Entrenamiento (Offline Batch):** Apache Spark procesa las transacciones históricas de MySQL de forma asíncrona (ej. una vez al día a las 3:00 AM o mediante un hilo en segundo plano de prioridad baja). No interfiere con el flujo de compra de boletos del microservicio de `tickets`.
2. **Persistencia de Pesos (MongoDB Atlas):** Spark escribe los resultados del análisis (coordenadas de proyección PCA de cada usuario, identificador de clúster asignado, ubicación de los centroides de K-Means y métricas de calidad como Silueta y Varianza Explicada) en MongoDB Atlas.
3. **Inferencia en Tiempo Real (FastAPI):** Cuando un usuario inicia sesión o navega por el dashboard, el microservicio de analítica consulta las colecciones de MongoDB (lecturas ultra-rápidas mediante índices de `user_id`). 
   * Si entra un **usuario nuevo** (Cold-Start) o se evalúa un **prospecto B2B**, FastAPI calcula en microsegundos la **distancia euclidiana** de este nuevo elemento contra los centroides previamente almacenados en MongoDB para asignarle un segmento de forma dinámica, **sin levantar ni sobrecargar la sesión de Spark**.
4. **Visualización en React:** El frontend consume el endpoint de analíticas y renderiza un scatter plot en 2D/3D (utilizando Plotly, ya integrado en la SPA) utilizando las coordenadas reducidas por PCA.

---

## 6. Corrección Técnica de Deuda Crítica Identificada

Durante el análisis del código actual, hemos detectado una **anomalía crítica** que debe ser corregida como prerrequisito para la visualización del dashboard:

* **El Hallazgo:** El archivo frontend `src/services/misc.service.js` (Línea 114) realiza una petición HTTP al endpoint `/api/analytics/ml/pca` pasando como parámetro la cantidad de componentes `k`:
  ```javascript
  getPCAML: async (k = 3) => {
      const response = await axios.get(`${ANALYTICS_URL}/ml/pca`, { params: { k } });
      return response.data;
  }
  ```
  Sin embargo, en el microservicio de analítica (`microservices/analytics_bigdata/main.py`), **este endpoint no está registrado**. Esto provoca que cuando el administrador de Laika Club intente abrir la pestaña de "Clustering PCA" en el dashboard, la aplicación reciba un error HTTP 404/502, provocando que la interfaz de visualización falle.
* **La Solución Propuesta:** Implementar el endpoint en `main.py` delegando la llamada al método consolidado de la clase `AnalyticsEngine` (que hereda de `ClusteringModule` y ya implementa la lógica robusta con fallback en el método `run_pca_analysis(k)`).

---

## 7. Plan de Trabajo Modular Propuesto (Próximos Pasos)

1. **Aprobación de la Estrategia:** Confirmación del enfoque de negocio, priorización y arquitectura por parte del Product Owner / Administrador.
2. **Corrección de Endpoints:** Registrar la ruta `/api/analytics/ml/pca` en el FastAPI de analíticas conectándolo con el módulo `ClusteringModule` ya estructurado en el backend.
3. **Robustecimiento del Pipeline en Spark:** Ajustar `clustering_pca.py` para calcular e inyectar el **Índice de Silueta** y la **Inercia** en las respuestas y en el historial de ejecuciones de MongoDB.
4. **Implementación de Distancia Euclidiana en Caliente:** Integrar la lógica de asignación de clústeres para nuevos registros/leads en tiempo real en base a los centroides activos.
5. **Conexión UI:** Validar que la interfaz React del dashboard consuma correctamente las coordenadas reducidas por PCA y renderice la gráfica de dispersión interactiva sin errores de compilación ni de red.
