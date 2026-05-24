from pyspark.ml.regression import LinearRegression
from pyspark.ml.feature import VectorAssembler, PolynomialExpansion
from datetime import datetime

def train_polynomial_regression(train_df, test_df, evaluator, mongo_db=None):
    """
    Entrena un modelo de Regresión Polinomial de Grado 2 sobre PySpark.
    Guarda la ejecución y el score R² en MongoDB si se especifica.
    """
    assembler = VectorAssembler(inputCols=["cantidad"], outputCol="features_raw")
    poly = PolynomialExpansion(inputCol="features_raw", outputCol="features", degree=2)
    
    train_vector = poly.transform(assembler.transform(train_df))
    test_vector = poly.transform(assembler.transform(test_df))
    
    lr = LinearRegression(featuresCol="features", labelCol="ingreso")
    model = lr.fit(train_vector)
    
    # Evaluar R²
    predictions = model.transform(test_vector)
    r2_score = round(evaluator.evaluate(predictions), 4)
    
    metrics = {
        "algorithm": "Polinomial (deg 2)",
        "type": "regression",
        "r2": r2_score,
        "features": ["cantidad", "cantidad^2"],
        "label": "ingreso",
        "trained_at": datetime.now().isoformat(),
        "coefficients": [float(c) for c in model.coefficients]
    }
    
    if mongo_db is not None:
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] Polynomial Regression metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return r2_score, model
