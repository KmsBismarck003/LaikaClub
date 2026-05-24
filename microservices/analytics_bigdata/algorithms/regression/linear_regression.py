from pyspark.ml.regression import LinearRegression
from pyspark.ml.feature import VectorAssembler
from datetime import datetime

def train_linear_regression(train_df, test_df, evaluator, mongo_db=None):
    """
    Entrena un modelo de Regresión Lineal Simple sobre PySpark.
    Si se provee mongo_db, guarda la ejecución y el score R² en MongoDB.
    """
    assembler = VectorAssembler(inputCols=["cantidad"], outputCol="features")
    train_vector = assembler.transform(train_df)
    test_vector = assembler.transform(test_df)
    
    lr = LinearRegression(featuresCol="features", labelCol="ingreso")
    model = lr.fit(train_vector)
    
    # Evaluar R²
    predictions = model.transform(test_vector)
    r2_score = round(evaluator.evaluate(predictions), 4)
    
    metrics = {
        "algorithm": "Lineal Simple",
        "type": "regression",
        "r2": r2_score,
        "features": ["cantidad"],
        "label": "ingreso",
        "trained_at": datetime.now().isoformat(),
        "coefficients": {
            "slope": float(model.coefficients[0]),
            "intercept": float(model.intercept)
        }
    }
    
    # Persistir en MongoDB si está disponible
    if mongo_db is not None:
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] Linear Regression metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return r2_score, model
