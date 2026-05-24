from pyspark.ml.regression import LinearRegression
from pyspark.ml.feature import VectorAssembler
from datetime import datetime

def train_lasso_regression(train_df, test_df, evaluator, mongo_db=None):
    """
    Entrena un modelo de Regresión Lasso (L1 Regularization) sobre PySpark.
    Guarda la ejecución y el score R² en MongoDB si se especifica.
    """
    assembler = VectorAssembler(inputCols=["cantidad"], outputCol="features")
    train_vector = assembler.transform(train_df)
    test_vector = assembler.transform(test_df)
    
    # regParam = 0.5, elasticNetParam = 1.0 define la penalización L1 (Lasso)
    lasso = LinearRegression(featuresCol="features", labelCol="ingreso", regParam=0.5, elasticNetParam=1.0)
    model = lasso.fit(train_vector)
    
    # Evaluar R²
    predictions = model.transform(test_vector)
    r2_score = round(evaluator.evaluate(predictions), 4)
    
    metrics = {
        "algorithm": "Lasso",
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
    
    if mongo_db is not None:
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] Lasso Regression metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return r2_score, model
