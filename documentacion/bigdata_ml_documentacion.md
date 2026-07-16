# BIG DATA, ANÃLISIS DE DATOS Y MACHINE LEARNING

## DescripciÃ³n General del MÃ³dulo

El sistema LaikaClub incorpora un microservicio especializado denominado **analytics_bigdata**, cuyo propÃ³sito es ejecutar procesos de anÃ¡lisis de datos a gran escala, aprendizaje automÃ¡tico no supervisado y supervisado, asÃ­ como la generaciÃ³n de inteligencia de negocio accionable. Este microservicio opera de forma independiente al resto de la plataforma, expone su funcionalidad mediante una API REST construida con FastAPI y se comunica con las fuentes de datos relacionales (MySQL) y no relacionales (MongoDB Atlas) del sistema.

La arquitectura del microservicio se estructura en torno a una clase central denominada `AnalyticsEngine`, la cual hereda capacidades de mÃºltiples mÃ³dulos mixin especializados: `ClusteringModule`, `NeuralNetworkModule`, `UserDemandAnalyticsModule` y `MerchandiseAnalyticsModule`. Adicionalmente, importa e invoca funciones de algoritmos organizados en carpetas dedicadas bajo el directorio `algorithms/`, entre ellas los mÃ³dulos de agrupamiento `k_means.py` y `pca.py`. La inicializaciÃ³n de este motor se realiza en el evento de arranque de FastAPI y su estado persiste durante toda la vida Ãºtil del servicio.

Una caracterÃ­stica fundamental del diseÃ±o es el **modo de resiliencia** (`resilience_mode`). Al iniciarse, el motor activa Apache Spark en un hilo de fondo; mientras Spark no estÃ© disponible, el sistema opera automÃ¡ticamente con consultas SQL directas a MySQL o cÃ¡lculos heurÃ­sticos ligeros, garantizando que el servicio nunca interrumpa su operaciÃ³n. Una vez que Spark se inicializa correctamente, `resilience_mode` se establece en `False` y el motor comienza a procesar datos de forma distribuida.

---

## Aprendizaje AutomÃ¡tico No Supervisado

### PropÃ³sito y problema que resuelve

El aprendizaje automÃ¡tico no supervisado se emplea en LaikaClub para descubrir patrones y estructuras ocultas dentro del comportamiento de los usuarios, sin necesidad de contar con etiquetas predefinidas. El problema central que aborda es la **segmentaciÃ³n de la base de usuarios** de una plataforma de venta de boletos, donde resulta inviable clasificar manualmente a cada usuario segÃºn su nivel de lealtad, gasto o frecuencia de compra. En lugar de reglas estÃ¡ticas, el sistema aprende los agrupamientos naturales directamente a partir de los datos transaccionales.

### MÃ³dulos donde se implementa

El aprendizaje no supervisado se implementa principalmente en:

- `microservices/analytics_bigdata/modules/clustering_pca.py` â€” mÃ³dulo que contiene la lÃ³gica completa de segmentaciÃ³n de usuarios mediante K-Means y PCA.
- `microservices/analytics_bigdata/algorithms/clustering/k_means.py` â€” funciÃ³n modular de entrenamiento K-Means.
- `microservices/analytics_bigdata/algorithms/clustering/pca.py` â€” funciÃ³n modular de reducciÃ³n dimensional PCA.
- `microservices/analytics_bigdata/algorithms/clustering/venue_prospecting.py` â€” algoritmo de prospecciÃ³n B2B que aplica distancia euclidiana para encontrar recintos similares.

---

## RepresentaciÃ³n de Datos

### PropÃ³sito

Antes de que cualquier algoritmo de agrupamiento pueda operar, los datos deben ser transformados desde su forma tabular original (filas de tickets con campos como `user_id`, `price` y `created_at`) a una representaciÃ³n vectorial numÃ©rica que los algoritmos puedan procesar matemÃ¡ticamente.

### Proceso de preparaciÃ³n

El sistema ejecuta tres transformaciones secuenciales sobre los datos de la tabla `tickets`:

**Primera etapa â€” AgregaciÃ³n por usuario:** Se agrupan todos los registros de tickets por `user_id`, calculando tres mÃ©tricas por usuario: el nÃºmero total de tickets adquiridos (`cantidad`), el precio promedio pagado (`precio_promedio`) y el gasto total acumulado (`gasto_total`). Esta reducciÃ³n convierte millones de filas individuales en un perfil compacto por usuario.

**Segunda etapa â€” Ensamblado de vectores:** Mediante `VectorAssembler` de PySpark ML, las tres columnas numÃ©ricas se combinan en una sola columna de vector denso denominada `features`. Este paso es un requisito previo para cualquier algoritmo del ecosistema Spark ML.

**Tercera etapa â€” Escalado estÃ¡ndar:** Se aplica `StandardScaler` con `withMean=True` y `withStd=True`, lo que centra cada caracterÃ­stica en media cero y la escala a desviaciÃ³n estÃ¡ndar uno. Este paso es crÃ­tico porque las magnitudes de `gasto_total` (que puede superar decenas de miles de pesos) son inconmensurables con `cantidad` (que puede ser 1 o 2 tickets), y sin escalado los algoritmos de distancia quedarÃ­an dominados por las variables de mayor magnitud.

La implementaciÃ³n de estas etapas puede observarse en el siguiente fragmento del mÃ³dulo `clustering_pca.py`:

```python
df_ml = df_tickets.groupBy("user_id").agg(
    count("*").alias("cantidad"),
    avg("price").alias("precio_promedio"),
    sum("price").alias("gasto_total")
).fillna(0)

assembler = VectorAssembler(
    inputCols=["cantidad", "precio_promedio", "gasto_total"],
    outputCol="features"
)
df_vector = assembler.transform(df_ml)

scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withMean=True, withStd=True)
df_scaled = scaler.fit(df_vector).transform(df_vector)
```

---

## AnÃ¡lisis de Componentes Principales (PCA)

### PropÃ³sito y problema que resuelve

El AnÃ¡lisis de Componentes Principales (PCA, por sus siglas en inglÃ©s) se utiliza en el sistema con dos objetivos complementarios: reducir la dimensionalidad del espacio de caracterÃ­sticas antes de aplicar K-Means, y habilitar la visualizaciÃ³n bidimensional de los segmentos de usuarios en el panel de administraciÃ³n.

Dado que el espacio original de caracterÃ­sticas comprende tres dimensiones correlacionadas, PCA permite proyectar estos datos a dos componentes principales que capturan la mayor varianza posible del conjunto, facilitando tanto la eficiencia computacional del clustering como la interpretabilidad visual para el administrador.

### MÃ³dulo principal

El algoritmo PCA se ejecuta dentro del mÃ©todo `run_pca_analysis` de `ClusteringModule`, y su implementaciÃ³n modular reutilizable se encuentra en `algorithms/clustering/pca.py`. La API expone este proceso en el endpoint `GET /api/analytics/ml/pca`.

### Datos de entrada y origen

- **Fuente primaria:** tabla `tickets` de la base de datos MySQL transaccional del sistema.
- **Variables de entrada al PCA:** vector escalado `scaledFeatures` compuesto por `cantidad`, `precio_promedio` y `gasto_total`, uno por cada usuario Ãºnico en la base de datos.

### Procesamiento

PCA se aplica siempre a `k=2` componentes principales, independientemente del valor de K que el administrador elija para el clustering, ya que el propÃ³sito de la reducciÃ³n es exclusivamente la visualizaciÃ³n en 2D en el frontend. El modelo calcula los vectores propios de la matriz de covarianza de los datos escalados y proyecta cada punto de usuario al nuevo subespacio.

La implementaciÃ³n principal se realiza de la siguiente manera:

```python
pca = PCA(k=2, inputCol="scaledFeatures", outputCol="pcaFeatures")
pca_model = pca.fit(df_scaled)
df_pca = pca_model.transform(df_scaled)
```

### Resultados generados

El modelo PCA retorna:

- `pcaFeatures`: vector de dos dimensiones por usuario, utilizado como entrada directa al algoritmo K-Means y como coordenadas para la visualizaciÃ³n de dispersiÃ³n.
- `varianza_explicada`: lista de dos valores que indican la proporciÃ³n de la varianza total del dataset que captura cada componente principal. Este valor se expone en la respuesta de la API bajo la clave `varianza_explicada` para que el frontend lo muestre al administrador.

La funciÃ³n modular en `pca.py` tambiÃ©n registra las mÃ©tricas de varianza explicada en la colecciÃ³n `ml_runs_history` de MongoDB Atlas para trazabilidad histÃ³rica de cada ejecuciÃ³n.

### Modo de resiliencia

Cuando Apache Spark no estÃ¡ disponible, el mÃ©todo `_run_pca_lightweight` del mÃ³dulo de resiliencia genera proyecciones heurÃ­sticas a partir de datos SQL, simulando una distribuciÃ³n tridimensional de usuarios con ruido gaussiano controlado. Este modo retorna el campo `"resilience": True` para indicar al cliente que los datos son aproximaciones estadÃ­sticas.

---

## Algoritmo K-Means

### PropÃ³sito dentro del sistema

K-Means es el algoritmo central de segmentaciÃ³n de usuarios de la plataforma. Su funciÃ³n es agrupar automÃ¡ticamente a todos los compradores de boletos en K segmentos homogÃ©neos basÃ¡ndose en sus patrones de compra, permitiendo al administrador identificar perfiles estratÃ©gicos como "usuarios casuales", "compradores recurrentes" y "super fans" o "whales" (usuarios de alto valor).

### MÃ³dulo donde se implementa

La lÃ³gica principal reside en `ClusteringModule.run_pca_analysis` (archivo `clustering_pca.py`). La funciÃ³n modular reutilizable se define en `algorithms/clustering/k_means.py`. El endpoint de exposiciÃ³n es `GET /api/analytics/ml/pca?k={n}`.

### Datos de entrada

K-Means recibe como entrada el DataFrame `df_pca`, que contiene la columna `pcaFeatures` con las coordenadas bidimensionales resultantes de la transformaciÃ³n PCA. El parÃ¡metro `k` es dinÃ¡mico: el administrador selecciona el nÃºmero de segmentos deseado desde la interfaz del panel, y dicho valor se transmite como parÃ¡metro de consulta a la API.

### Procesamiento del algoritmo

K-Means se inicializa con una semilla fija (`seed=42`) para garantizar la reproducibilidad de los resultados entre ejecuciones. El algoritmo itera asignando cada usuario al centroide mÃ¡s cercano y recalculando las posiciones de los centroides hasta convergencia. Al operar sobre los datos reducidos por PCA, la distancia calculada entre puntos y centroides corresponde al espacio bidimensional proyectado.

El siguiente fragmento representa la lÃ³gica principal de entrenamiento y predicciÃ³n:

```python
kmeans = KMeans(k=k, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
model = kmeans.fit(df_pca)
df_final = model.transform(df_pca)
```

La funciÃ³n modular `train_k_means` en `algorithms/clustering/k_means.py` encapsula este proceso de forma independiente y permite persistir las mÃ©tricas de ejecuciÃ³n en MongoDB:

```python
def train_k_means(features_df, k=3, mongo_db=None):
    kmeans = KMeans(k=k, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
    model = kmeans.fit(features_df)
    centers = [[float(val) for val in center] for center in model.clusterCenters()]
    metrics = {
        "algorithm": "K-Means",
        "type": "clustering",
        "k": k,
        "features": ["pcaFeatures"],
        "trained_at": datetime.now().isoformat(),
        "cluster_centers": centers
    }
    if mongo_db is not None:
        mongo_db["ml_runs_history"].insert_one(metrics.copy())
    return model
```

### Resultados generados

Tras la ejecuciÃ³n, el sistema produce:

- **AsignaciÃ³n de cluster por usuario:** cada registro recibe un identificador numÃ©rico de segmento en la columna `cluster`.
- **Resumen por segmento:** para cada cluster se calcula el nÃºmero de usuarios (`size`), el gasto promedio (`avg_spent`) y la cantidad promedio de tickets (`avg_tickets`), formando el objeto `cluster_summary` que se expone al frontend.
- **Datos de visualizaciÃ³n:** hasta 500 puntos por ejecuciÃ³n (limitados para no saturar el navegador) con sus coordenadas PCA, identificador de cluster y mÃ©tricas individuales.

### RelaciÃ³n con otros mÃ³dulos

Los resultados de K-Means alimentan directamente la visualizaciÃ³n de dispersiÃ³n 2D en el panel BigDataVisualizer del frontend. Adicionalmente, los centroides son persistidos en MongoDB para su uso en el mÃ³dulo de MLOps descrito en la secciÃ³n de GestiÃ³n de Centroides.

---

## Distancia Euclidiana

### PropÃ³sito y contexto de uso

La distancia euclidiana se utiliza en dos contextos distintos dentro del sistema. El primero es implÃ­cito: K-Means en su implementaciÃ³n de Spark ML utiliza internamente la distancia euclidiana al cuadrado para asignar cada punto al centroide mÃ¡s cercano y para calcular la inercia del modelo. El segundo es explÃ­cito e implementado manualmente en el algoritmo de ProspecciÃ³n B2B.

### Uso en el mÃ³dulo de ProspecciÃ³n de Recintos (Venue Prospecting)

El archivo `algorithms/clustering/venue_prospecting.py` implementa un algoritmo de similitud entre recintos que calcula directamente la distancia euclidiana en un espacio bidimensional normalizado. El objetivo es encontrar, para cada prospecto B2B almacenado en MongoDB, el recinto activo en la plataforma que mÃ¡s se le asemeja comercialmente, a fin de generar una puntuaciÃ³n de afinidad y priorizar la prospecciÃ³n.

#### Datos de entrada y vectorizaciÃ³n

Cada recinto (tanto activo como prospecto) se representa mediante dos caracterÃ­sticas normalizadas:

- **Capacidad logarÃ­tmica:** `log10(capacidad) / 5.0`, lo que comprime el rango de valores desde pequeÃ±os clubes (300 personas) hasta grandes arenas (100,000 personas) en una escala comparable.
- **Distancia categÃ³rica:** un valor binario que vale `0.0` si el prospecto y el recinto activo pertenecen a la misma categorÃ­a (por ejemplo, ambos son "Club/Foro"), o `1.0` si son categorÃ­as distintas.

#### CÃ¡lculo de la distancia y transformaciÃ³n a puntuaciÃ³n

El siguiente fragmento de cÃ³digo ilustra el nÃºcleo del cÃ¡lculo:

```python
# Capacidad normalizada (log10 escalado sobre 5.0)
lead_cap_norm = math.log10(lead["capacity"]) / 5.0
active_cap_norm = math.log10(active["capacity"]) / 5.0

# Distancia de CategorÃ­a (0.0 si son iguales, 1.0 si son diferentes)
active_cat = cat_mapping.get(active["event_category"].lower(), "Club/Foro")
cat_dist = 0.0 if lead["category"].lower() == active_cat.lower() else 1.0

# CÃ¡lculo de Distancia Euclidiana: d(p,q) = sqrt((p1-q1)^2 + (p2-q2)^2)
euclidean_distance = math.sqrt((lead_cap_norm - active_cap_norm)**2 + cat_dist**2)

# Transformar distancia en score de similitud inversa (0 a 1)
# La distancia mÃ¡xima posible es sqrt(1^2 + 1^2) = 1.414
score = max(0.0, 1.0 - (euclidean_distance / 1.414))
```

#### Resultados

El puntaje resultante (`match_score`) se expresa como un porcentaje (0 a 100) y determina la **prioridad de prospecciÃ³n** asignada a cada lead:

- 85% o mÃ¡s: Alta Prioridad (Lookalike Perfecto)
- 65% a 84%: Prioridad Media (Prospecto Viable)
- Menor a 65%: Baja Prioridad (Perfil Diferente)

Cada lead procesado incluye una explicaciÃ³n en lenguaje natural generada automÃ¡ticamente que detalla el porcentaje de similitud, el recinto de referencia y el razonamiento comercial.

---

## GestiÃ³n de Centroides

### PropÃ³sito

La gestiÃ³n de centroides forma parte de la capa de MLOps del sistema. Su objetivo es persistir el estado de cada modelo K-Means entrenado, incluyendo las posiciones de los centroides en el espacio PCA, junto con las mÃ©tricas de calidad del modelo, en la base de datos MongoDB Atlas. Esto permite mantener un historial auditado de todas las ejecuciones del motor de Machine Learning.

### ImplementaciÃ³n

Inmediatamente despuÃ©s de entrenar el modelo K-Means dentro de `run_pca_analysis`, el sistema extrae los centros de los clusters mediante `model.clusterCenters()` y los almacena en la colecciÃ³n `ml_centroids_history` de MongoDB. Cada documento guardado incluye la marca de tiempo, el algoritmo empleado, el valor de K seleccionado, la inercia (WCSS) y el Ã­ndice de silueta obtenidos.

La siguiente secciÃ³n del cÃ³digo corresponde a esta operaciÃ³n de persistencia:

```python
# â”€â”€ GESTIÃ“N DE CENTROIDES (MLOps) â”€â”€
if hasattr(self, 'mongo_uri') and self.mongo_uri:
    client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=3000)
    db = client[self.mongo_db]
    centroids_col = db["ml_centroids_history"]
    
    centers_list = [center.tolist() for center in model.clusterCenters()]
    centroids_col.insert_one({
        "timestamp": datetime.now(),
        "algorithm": "K-Means-PCA",
        "k": k,
        "wcss": float(wcss),
        "silhouette": float(silhouette),
        "centroids": centers_list
    })
```

### Beneficios

Este mecanismo permite comparar la evoluciÃ³n de los segmentos a lo largo del tiempo, detectar si los perfiles de usuarios han cambiado entre periodos y disponer de un registro auditable de cada anÃ¡lisis ejecutado por la plataforma, en lÃ­nea con prÃ¡cticas estÃ¡ndar de MLOps.

---

## Inercia (WCSS â€” Within-Cluster Sum of Squares)

### PropÃ³sito

La inercia, tambiÃ©n denominada WCSS (suma de cuadrados dentro del cluster), mide la cohesiÃ³n interna de un modelo K-Means. Representa la suma de las distancias al cuadrado entre cada punto de datos y el centroide de su cluster asignado. Cuanto menor sea el valor de WCSS, mÃ¡s compactos y homogÃ©neos son los clusters formados.

En LaikaClub, la inercia cumple dos funciones: actÃºa como indicador de calidad del modelo entrenado y es el dato principal que alimenta el MÃ©todo del Codo para determinar el valor Ã³ptimo de K.

### ObtenciÃ³n del valor

Dentro de `run_pca_analysis`, el WCSS se obtiene del atributo `trainingCost` del resumen del modelo Spark ML, con manejo de excepciÃ³n para compatibilidad entre versiones de Spark:

```python
try:
    wcss = model.summary.trainingCost
except AttributeError:
    wcss = 0.0
```

El valor obtenido se incluye en la respuesta de la API bajo la clave `wcss` y tambiÃ©n se persiste en MongoDB junto con los centroides del modelo.

---

## OptimizaciÃ³n del Valor K (MÃ©todo del Codo)

### PropÃ³sito y problema que resuelve

La elecciÃ³n del nÃºmero de clusters K en K-Means es una decisiÃ³n que no puede delegarse al algoritmo mismo. Seleccionar un K demasiado pequeÃ±o produce segmentos demasiado heterogÃ©neos; un K excesivamente grande fragmenta grupos naturales sin aportar informaciÃ³n adicional. El MÃ©todo del Codo (Elbow Method) automatiza esta decisiÃ³n analizando cÃ³mo varÃ­a la inercia al incrementar K.

### MÃ³dulo donde se implementa

El mÃ©todo se implementa en `ClusteringModule.run_elbow_method_optimization` dentro de `clustering_pca.py`. Se expone mediante el endpoint `GET /api/analytics/ml/elbow?max_k={n}`.

### Procesamiento

El algoritmo entrena un modelo K-Means completo para cada valor de K desde 2 hasta `max_k` (por defecto 8). Para cada K registra la inercia resultante, construyendo una curva de valores WCSS. Luego aplica una heurÃ­stica analÃ­tica para identificar el "codo": el punto de la curva donde la reducciÃ³n marginal de inercia al aumentar K empieza a disminuir significativamente.

La heurÃ­stica calcula la razÃ³n entre la caÃ­da de inercia del paso anterior y la del paso siguiente. El K con la mayor razÃ³n corresponde al punto de inflexiÃ³n de la curva.

El proceso descrito anteriormente se implementa de la siguiente manera:

```python
wcss_curve = []
for k_val in range(2, max_k + 1):
    kmeans = KMeans(k=k_val, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
    model = kmeans.fit(df_pca)
    wcss = model.summary.trainingCost
    wcss_curve.append({"k": k_val, "wcss": float(wcss)})

# HeurÃ­stica analÃ­tica: MÃ¡xima caÃ­da relativa de inercia
optimal_k = 3
max_drop_ratio = 0
for i in range(1, len(wcss_curve)-1):
    drop1 = wcss_curve[i-1]["wcss"] - wcss_curve[i]["wcss"]
    drop2 = wcss_curve[i]["wcss"] - wcss_curve[i+1]["wcss"]
    if drop1 > 0 and drop2 > 0:
        ratio = drop1 / drop2
        if ratio > max_drop_ratio:
            max_drop_ratio = ratio
            optimal_k = wcss_curve[i]["k"]
```

### Resultados y uso

El mÃ©todo retorna la curva WCSS completa (`wcss_curve`) y el valor `optimal_k` sugerido. El panel de administraciÃ³n utiliza esta informaciÃ³n para graficar la curva del codo y resaltar visualmente el K recomendado, orientando al administrador en la selecciÃ³n del parÃ¡metro antes de ejecutar la segmentaciÃ³n definitiva.

---

## Ãndice de Silueta (Silhouette Score)

### PropÃ³sito

El Ã­ndice de silueta es una mÃ©trica de evaluaciÃ³n de la calidad del clustering que mide simultÃ¡neamente la cohesiÃ³n interna de cada cluster y la separaciÃ³n entre clusters distintos. Sus valores oscilan entre -1 y 1; valores cercanos a 1 indican clusters bien definidos y bien separados, mientras que valores negativos sugieren que los puntos estÃ¡n asignados al cluster incorrecto.

En el sistema, el Silhouette Score se utiliza para validar objetivamente la calidad del modelo K-Means generado en cada ejecuciÃ³n del anÃ¡lisis de segmentaciÃ³n.

### MÃ³dulo y cÃ¡lculo

El cÃ¡lculo se realiza mediante `ClusteringEvaluator` de PySpark ML, configurado con la mÃ©trica `silhouette` y la distancia `squaredEuclidean`. Opera sobre el DataFrame `df_final`, que contiene las coordenadas PCA de cada usuario y su asignaciÃ³n de cluster.

```python
evaluator = ClusteringEvaluator(
    predictionCol="cluster",
    featuresCol="pcaFeatures",
    metricName="silhouette",
    distanceMeasure="squaredEuclidean"
)
silhouette = evaluator.evaluate(df_final)
```

### Resultados y persistencia

El valor obtenido se incluye en la respuesta de la API bajo la clave `silhouette_score`, se persiste en MongoDB dentro de la colecciÃ³n `ml_centroids_history` junto con los centroides, y es visible en el panel de administraciÃ³n para que el usuario pueda evaluar la confiabilidad de la segmentaciÃ³n actual antes de tomar decisiones basadas en ella.

---

## MÃ³dulos de AnÃ¡lisis y Predicciones

### AnÃ¡lisis de Comportamiento de Usuarios y PredicciÃ³n de Abandono (Churn)

**Objetivo:** Identificar usuarios en riesgo de abandonar la plataforma, detectar los mayores consumidores activos y cuantificar la distribuciÃ³n de riesgo de churn en la base de usuarios.

**MÃ³dulo:** `UserDemandAnalyticsModule.get_user_behavior_analytics` en `modules/user_demand_analytics.py`. Endpoint: `GET /api/analytics/ml/user-behavior`.

**Datos utilizados:** Tablas `users`, `tickets` y `payments` de MySQL. Las variables de comportamiento derivadas son `days_since_login` (dÃ­as desde el Ãºltimo inicio de sesiÃ³n) y `days_since_purchase` (dÃ­as desde la Ãºltima compra de boleto).

**Flujo de procesamiento:**

Cuando Spark estÃ¡ disponible, el sistema carga las tres tablas como DataFrames distribuidos y realiza joins para construir un perfil por usuario. Seguidamente calcula las variables de tiempo de inactividad. Con ellas aplica reglas de clasificaciÃ³n de riesgo:

- Riesgo Alto: mÃ¡s de 90 dÃ­as sin iniciar sesiÃ³n o sin compra.
- Riesgo Medio: entre 31 y 90 dÃ­as de inactividad.
- Riesgo Bajo: menos de 31 dÃ­as.

Adicionalmente, el sistema entrena un **Ã¡rbol de decisiÃ³n supervisado** (`DecisionTreeClassifier` de Spark ML con `maxDepth=3`) para predecir el riesgo de abandono a partir de tres caracterÃ­sticas: `tickets_bought`, `total_spent` y `recency_purchase`. El conjunto de datos se divide 70/30 para entrenamiento y prueba. Las mÃ©tricas resultantes (accuracy, precision, recall, F1 y matriz de confusiÃ³n) se incluyen en la respuesta.

Cuando Spark no estÃ¡ disponible, el mÃ³dulo utiliza `sklearn.tree.DecisionTreeClassifier` con los mismos parÃ¡metros y la misma particiÃ³n aleatoria, garantizando continuidad funcional.

La lÃ³gica central del Ã¡rbol de decisiÃ³n puede observarse en el siguiente fragmento:

```python
if len(rows_churn) >= 5 and len(set(y)) > 1:
    X_arr = np.array(X)
    y_arr = np.array(y)
    X_train, X_test, y_train, y_test = train_test_split(
        X_arr, y_arr, test_size=0.3, random_state=42
    )
    clf = DecisionTreeClassifier(max_depth=3, random_state=42)
    clf.fit(X_train, y_train)
    preds = clf.predict(X_test)
```

**Resultados y uso:** La respuesta incluye: lista de los 15 mayores consumidores (`top_consumers`), conteo de cuentas inactivas (`inactive_accounts_count`), distribuciÃ³n de riesgo por nivel (`churn_risk_distribution`), lista de los 10 candidatos con mayor riesgo (`churn_candidates`) y mÃ©tricas del clasificador. El panel de administraciÃ³n utiliza estos datos para habilitar acciones de retenciÃ³n, como la emisiÃ³n de cupones de descuento a usuarios en riesgo alto mediante el endpoint `POST /api/analytics/ml/user-behavior/grant-coupon`.

---

### PredicciÃ³n de Demanda de Eventos

**Objetivo:** Estimar la tasa de asistencia final esperada para cada evento activo y determinar las franjas horarias y dÃ­as de la semana mÃ¡s rentables para programar eventos.

**MÃ³dulo:** `UserDemandAnalyticsModule.get_demand_prediction_analytics` en `modules/user_demand_analytics.py`. Endpoint: `GET /api/analytics/ml/demand-prediction`.

**Datos utilizados:** Tablas `events` y `tickets` de MySQL, con filtro para excluir tickets cancelados.

**Flujo de procesamiento:** El sistema calcula la tasa de asistencia actual de cada evento (`tickets_sold / total_tickets`). Sobre esta tasa aplica una heurÃ­stica de proyecciÃ³n de demanda final que considera el factor precio:

```python
if current_rate >= 0.8:
    predicted_rate = 1.0
else:
    price_factor = 0.95 if price_val > 500 else 1.05
    predicted_rate = min(1.0, current_rate * 1.35 * price_factor)
```

Paralelamente, agrupa los eventos por hora de inicio y dÃ­a de la semana para calcular el ingreso estimado por franja horaria, produciendo la lista de `profitable_slots` ordenada por rentabilidad descendente.

**Resultados:** La respuesta incluye la lista `events_attendance` con porcentaje actual y predicho para cada evento, y `profitable_slots` con las combinaciones dÃ­a-hora de mayor rendimiento histÃ³rico. Esta informaciÃ³n permite al administrador optimizar la programaciÃ³n de nuevos eventos y anticipar niveles de inventario de boletos.

---

### DetecciÃ³n de AnomalÃ­as (Anti-Bot y PrevenciÃ³n de Reventa)

**Objetivo:** Identificar cuentas de usuario con patrones de compra estadÃ­sticamente anÃ³malos que sugieran actividad de bots o revendedores masivos de boletos.

**MÃ³dulo:** `UserDemandAnalyticsModule.run_anomaly_detection` en `modules/user_demand_analytics.py`. Endpoint: `GET /api/analytics/ml/anomaly`.

**Algoritmo empleado:** Isolation Forest de scikit-learn, configurado con `n_estimators=100` y `contamination=0.02` (se asume un 2% histÃ³rico de cuentas con comportamiento anÃ³malo).

**Datos y caracterÃ­sticas:** Para cada usuario se construye un vector de cuatro caracterÃ­sticas: `total_tickets` (volumen total de compras), `distinct_events` (nÃºmero de eventos distintos en los que comprÃ³), `total_spent` (gasto total) y `avg_spent_per_ticket` (ticket promedio). El modelo se entrena sobre el conjunto completo de usuarios con al menos 10 registros.

El comportamiento anterior queda definido en el siguiente bloque:

```python
X_arr = np.array(X)
# Entrenar Isolation Forest asumiendo 2% histÃ³rico de cuentas bot/reventa
clf = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)
preds = clf.fit_predict(X_arr)

anomalies = []
for idx, pred in enumerate(preds):
    if pred == -1:  # -1 indica anomalÃ­a en Isolation Forest
        user_data = users_map[idx]
        anomalies.append({ ... "risk_score": "High (Bot/Scalper Suspicion)" })
```

**Resultados:** La respuesta devuelve el total de usuarios analizados, el nÃºmero de anomalÃ­as detectadas y la lista de cuentas sospechosas con su perfil de compra. Esta informaciÃ³n permite al equipo de operaciones revisar y suspender cuentas antes de que afecten la disponibilidad de boletos para usuarios legÃ­timos.

---

### AnÃ¡lisis de Ventas de MercancÃ­a con DetecciÃ³n de Patrones de Compra Conjunta (Cross-Selling)

**Objetivo:** Identificar los productos de mayor y menor rendimiento en la tienda de mercancÃ­a del evento, detectar patrones de compra conjunta entre productos y generar recomendaciones estratÃ©gicas accionables en lenguaje natural para el administrador.

**MÃ³dulo:** `MerchandiseAnalyticsModule.get_sales_insights` en `modules/merchandise_analytics.py`. Endpoint: `GET /api/analytics/merch/sales-insights`.

**Datos utilizados:** Tablas `merchandise_orders`, `merchandise_order_items`, `merchandise_variants` y `merchandise_items` de SQLite, con soporte para cruzar datos de eventos mediante `ATTACH DATABASE`.

**Flujo de procesamiento:** El mÃ³dulo consulta las ventas por producto, calcula mÃ©tricas agregadas (unidades vendidas, ingreso generado) y clasifica los productos en "estrellas" (top 5 por volumen) y "dormidos" (menos del 5% del total de unidades vendidas). Para el anÃ¡lisis de cross-selling, construye una canasta de compra por orden y calcula co-ocurrencias de productos usando el siguiente algoritmo:

```python
co_occurrences = defaultdict(int)
for b in baskets.values():
    items = list(b)
    for i in range(len(items)):
        for j in range(i+1, len(items)):
            pair = tuple(sorted([items[i], items[j]]))
            co_occurrences[pair] += 1

if co_occurrences:
    best_pair = max(co_occurrences.items(), key=lambda x: x[1])
    conf_a_to_b = (pair_count / product_counts[item_a]) * 100
```

**Resultados:** Se generan hasta seis recomendaciones en lenguaje natural que incluyen: los productos estrella del catÃ¡logo, sugerencias de venta cruzada basadas en el par de mayor co-ocurrencia con su confianza en porcentaje, anÃ¡lisis de diversificaciÃ³n por categorÃ­a, vinculaciÃ³n de ventas con tipos de evento y un resumen de la salud financiera de la tienda.

---

### Inteligencia Proactiva y AnÃ¡lisis de Sesiones

**Objetivo:** Generar recomendaciones operativas para el administrador basadas en el anÃ¡lisis del trÃ¡fico de autenticaciÃ³n, la elasticidad de precios, el comportamiento de sesiones y las ventas de mercancÃ­a por horario.

**MÃ³dulo:** `IntelligenceModule.get_smart_recommendations` en `modules/intelligence.py`. Endpoint: `GET /api/analytics/intelligence?action=bi`.

**Datos utilizados:** Bases de datos SQLite de los microservicios de autenticaciÃ³n (`auth.db`), tickets (`tickets.db`) y mercancÃ­a (`merchandise.db`).

**AnÃ¡lisis ejecutados:**

- **Ventana Ã³ptima de mantenimiento:** Analiza la distribuciÃ³n de actividad por hora del dÃ­a desde `auth_logs` para identificar la franja de tres horas consecutivas con menor trÃ¡fico, sugiriÃ©ndola como ventana de mantenimiento del sistema.
- **Elasticidad de precios:** Segmenta las ventas de tickets en cuatro rangos de precio y calcula el volumen de ventas e ingreso generado por cada rango, identificando cuÃ¡l maximiza volumen y cuÃ¡l maximiza ingreso.
- **Comportamiento de sesiones:** Calcula la tasa de fallos de inicio de sesiÃ³n y el dÃ­a de mayor actividad, emitiendo una alerta si la tasa de fallos supera el 25%.
- **AnÃ¡lisis de mercancÃ­a por horario:** Identifica la hora de mayor venta de mercancÃ­a para orientar la programaciÃ³n de promociones flash.

---

### ProspecciÃ³n Inteligente de Recintos (B2B Venue Prospecting)

**Objetivo:** Identificar recintos de eventos no asociados a la plataforma que presenten alta similitud comercial con los recintos activos actuales, priorizÃ¡ndolos como candidatos para expansiÃ³n B2B.

**MÃ³dulo:** `algorithms/clustering/venue_prospecting.py`. Endpoint: `GET /api/analytics/ml/prospecting`.

**Datos utilizados:** Prospectos (leads) almacenados en la colecciÃ³n `potential_venues_leads` de MongoDB Atlas y datos de rendimiento de recintos activos consultados desde MySQL mediante un join de cinco tablas (`events`, `venues`, `tickets`, `municipalities`, `states`).

**Flujo:** El algoritmo clasifica cada recinto activo en un perfil de rendimiento ("Alto Impacto", "Comercial Estable", "Emergente") basÃ¡ndose en su ingreso total histÃ³rico. Luego, para cada prospecto, calcula la distancia euclidiana en el espacio bidimensional normalizado (capacidad logarÃ­tmica y categorÃ­a) respecto a todos los recintos activos, selecciona el de mayor similitud y genera una explicaciÃ³n comercial en lenguaje natural junto con la prioridad de prospecciÃ³n asignada.

Adicionalmente, el algoritmo deduce el segmento de mercado de mayor oportunidad (combinaciÃ³n de categorÃ­a de recinto y estado geogrÃ¡fico) a partir del rendimiento acumulado de los recintos activos, produciendo una recomendaciÃ³n tÃ¡ctica de expansiÃ³n geogrÃ¡fica para el equipo comercial.

---

## Consideraciones TÃ©cnicas Relevantes

**Arquitectura de doble motor:** El diseÃ±o del microservicio garantiza disponibilidad continua mediante dos rutas de ejecuciÃ³n. La ruta primaria utiliza Apache Spark con conectores JDBC para MySQL y el conector oficial de MongoDB para Spark. La ruta secundaria (modo resiliencia) emplea consultas SQL directas con PyMySQL o scikit-learn en lugar de PySpark ML, con idÃ©ntica interfaz de salida hacia el cliente.

**InicializaciÃ³n asÃ­ncrona de Spark:** La sesiÃ³n de Spark se inicializa en un hilo de fondo (`threading.Thread`) para que el microservicio responda inmediatamente al arrancar, sin bloquear el proceso principal durante la inicializaciÃ³n, que puede tomar entre 30 y 90 segundos dependiendo del entorno.

**LimitaciÃ³n de puntos en visualizaciÃ³n:** El mÃ³dulo de clustering limita la transferencia de datos al frontend a 500 puntos por ejecuciÃ³n (`df_json.limit(500)`), mientras que las estadÃ­sticas de resumen por segmento se calculan sobre el dataset completo antes de aplicar dicho lÃ­mite. Esto garantiza que los indicadores de tamaÃ±o y gasto promedio por segmento sean precisos independientemente del volumen total de usuarios.

**Semilla fija en algoritmos:** Todos los algoritmos estocÃ¡sticos del sistema utilizan `seed=42` y `random_state=42`, asegurando que las ejecuciones repetidas con los mismos datos produzcan resultados idÃ©nticos, lo cual es esencial para la auditabilidad del sistema y la comparabilidad de resultados entre periodos.

**Trazabilidad en MongoDB:** Las colecciones `ml_runs_history` y `ml_centroids_history` de MongoDB Atlas funcionan como un registro histÃ³rico de todas las ejecuciones de modelos, almacenando algoritmo utilizado, parÃ¡metros, mÃ©tricas de calidad y marca de tiempo. Esta informaciÃ³n es la base para futuros anÃ¡lisis de deriva del modelo (model drift) y monitoreo de calidad en producciÃ³n.
