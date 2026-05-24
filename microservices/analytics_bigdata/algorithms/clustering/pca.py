from pyspark.ml.feature import StandardScaler, PCA
from datetime import datetime

def run_pca(vector_df, k=3, mongo_db=None):
    """
    Ejecuta el algoritmo PCA para reducción de dimensionalidad sobre PySpark.
    Guarda los resultados de la varianza explicada en MongoDB si se especifica.
    """
    scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withMean=True, withStd=True)
    scaler_model = scaler.fit(vector_df)
    df_scaled = scaler_model.transform(vector_df)
    
    pca = PCA(k=k, inputCol="scaledFeatures", outputCol="pcaFeatures")
    pca_model = pca.fit(df_scaled)
    df_pca = pca_model.transform(df_scaled)
    
    explained_variance = [float(x) for x in pca_model.explainedVariance]
    
    metrics = {
        "algorithm": "PCA",
        "type": "dimensionality_reduction",
        "k": k,
        "features": ["cantidad", "precio_promedio", "gasto_total"],
        "explained_variance": explained_variance,
        "trained_at": datetime.now().isoformat()
    }
    
    if mongo_db is not None:
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] PCA metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return df_pca, explained_variance, pca_model
