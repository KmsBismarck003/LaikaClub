from pyspark.ml.clustering import KMeans
from datetime import datetime

def train_k_means(features_df, k=3, mongo_db=None):
    """
    Entrena un modelo de agrupamiento K-Means sobre PySpark.
    Guarda la ejecución y métricas en MongoDB si se especifica.
    """
    kmeans = KMeans(k=k, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
    model = kmeans.fit(features_df)
    
    # Evaluar clustering (Inercia / Suma de distancias cuadradas)
    # Nota: En versiones recientes de Spark ML, computeCost está deprecado, pero se puede usar ClusteredEvaluator.
    # Por simplicidad estimamos un indicador básico o guardamos los centros de los clústeres.
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
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] K-Means clustering metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return model
