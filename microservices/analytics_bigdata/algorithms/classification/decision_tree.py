from pyspark.ml.classification import DecisionTreeClassifier
from pyspark.ml.feature import VectorAssembler
from datetime import datetime

def train_decision_tree(train_df, test_df, evaluator, max_depth=4, mongo_db=None):
    """
    Entrena un clasificador de Árbol de Decisión sobre PySpark.
    Guarda la ejecución, métricas de precisión y el árbol en MongoDB si se especifica.
    """
    assembler = VectorAssembler(inputCols=["total_tickets", "price", "ocupacion_pct"], outputCol="features")
    train_vector = assembler.transform(train_df)
    test_vector = assembler.transform(test_df)
    
    dt = DecisionTreeClassifier(featuresCol="features", labelCol="label", maxDepth=int(max_depth))
    model = dt.fit(train_vector)
    
    # Evaluar Precisión (Accuracy)
    predictions = model.transform(test_vector)
    accuracy_score = round(evaluator.evaluate(predictions), 4)
    
    metrics = {
        "algorithm": "Árbol de Decisión",
        "type": "classification",
        "accuracy": accuracy_score,
        "max_depth": max_depth,
        "features": ["total_tickets", "price", "ocupacion_pct"],
        "label": "label (oportunidad_tarifa_dinamica)",
        "trained_at": datetime.now().isoformat(),
        "tree_structure": model.toDebugString
    }
    
    if mongo_db is not None:
        try:
            mongo_db["ml_runs_history"].insert_one(metrics.copy())
            print("[MONGO SAVE] Decision Tree metrics stored in MongoDB.")
        except Exception as e:
            print(f"[MONGO SAVE] Error saving metrics to MongoDB: {e}")
            
    return accuracy_score, model

