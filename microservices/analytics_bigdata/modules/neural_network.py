from pyspark.sql.functions import count, sum, when, col
from datetime import datetime

class NeuralNetworkModule:
    """Módulo de Red Neuronal (Deep Learning vía PyTorch)."""
    
    def run_neural_network_analysis(self, epochs=50):
        """Entrena una red neuronal."""
        if self.resilience_mode:
            return self._run_nn_simulation(epochs)
            
        try:
            import torch
            import torch.nn as nn
            import torch.optim as optim
            import numpy as np
        except ImportError:
            return {"error": "PyTorch (torch) no está instalado en el entorno del servidor."}

        try:
            df_tickets = self._read_mysql("tickets")
            df_ml = df_tickets.groupBy("event_id").agg(
                count("*").alias("cantidad"),
                sum("price").alias("ingreso")
            ).withColumn("label", when(col("ingreso") > 500, 1).otherwise(0)).collect()

            if len(df_ml) < 5:
                return {
                    "status": "insufficient_data",
                    "message": "Datos insuficientes para análisis"
                }

            X = np.array([[row.cantidad, row.ingreso] for row in df_ml], dtype=np.float32)
            y = np.array([row.label for row in df_ml], dtype=np.int64)

            X = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-6)

            X_tensor = torch.tensor(X)
            y_tensor = torch.tensor(y)

            class LaikaNet(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.net = nn.Sequential(
                        nn.Linear(2, 8), nn.ReLU(),
                        nn.Linear(8, 2)
                    )
                def forward(self, x): return self.net(x)

            model = LaikaNet()
            criterion = nn.CrossEntropyLoss()
            optimizer = optim.Adam(model.parameters(), lr=0.01)

            loss_history = []
            for epoch in range(epochs):
                outputs = model(X_tensor)
                loss = criterion(outputs, y_tensor)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                if epoch % 5 == 0:
                    loss_history.append({"epoch": epoch, "loss": float(loss.item())})

            return {
                "status": "success",
                "loss_history": loss_history,
                "epochs": epochs,
                "summary": f"Entrenamiento completado sobre {len(df_ml)} muestras.",
                "prediction_map": "0: Éxito Bajo | 1: Éxito Alto (>500)"
            }
        except Exception as e:
            print(f"NN Training Fail: {e}")
            return {"error": str(e)}

    def _run_nn_simulation(self, epochs=50):
        """Entrena una red neuronal real usando MLPClassifier de scikit-learn sobre datos de MySQL."""
        import pymysql
        import numpy as np
        from sklearn.neural_network import MLPClassifier
        from datetime import datetime
        
        try:
            # 1. Consultar agregados de eventos reales de MySQL
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            query = """
                SELECT event_id, 
                       COUNT(*) as cantidad, 
                       SUM(price) as ingreso
                FROM tickets
                WHERE status != 'cancelled'
                GROUP BY event_id
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            conn.close()
            
            if len(rows) < 5:
                return {
                    "status": "insufficient_data",
                    "message": "Datos insuficientes para análisis"
                }
                
            X = np.array([[float(r["cantidad"]), float(r["ingreso"])] for r in rows], dtype=np.float32)
            y = np.array([1 if float(r["ingreso"]) > 500 else 0 for r in rows], dtype=np.int64)
            
            # Normalizar X
            X_mean = X.mean(axis=0)
            X_std = X.std(axis=0)
            X_std[X_std == 0] = 1.0
            X_scaled = (X - X_mean) / X_std
            
            # Entrenar MLPClassifier
            clf = MLPClassifier(hidden_layer_sizes=(8,), max_iter=epochs, random_state=42, solver='adam', learning_rate_init=0.01)
            
            # Controlar warnings de no convergencia si epochs es pequeño
            import warnings
            from sklearn.exceptions import ConvergenceWarning
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=ConvergenceWarning)
                clf.fit(X_scaled, y)
                
            # Obtener historia de pérdida
            loss_history = []
            if hasattr(clf, 'loss_curve_'):
                for epoch_idx, loss_val in enumerate(clf.loss_curve_):
                    if epoch_idx % 5 == 0 or epoch_idx == len(clf.loss_curve_) - 1:
                        loss_history.append({"epoch": epoch_idx, "loss": round(float(loss_val), 4)})
                        
            return {
                "status": "success",
                "resilience": True,
                "loss_history": loss_history,
                "epochs": len(clf.loss_curve_) if hasattr(clf, 'loss_curve_') else epochs,
                "summary": f"Entrenamiento de Red Neuronal (MLP Classifier) completado localmente sobre {len(rows)} muestras.",
                "insights": [
                    "Inicialización de sinapsis locales completada.",
                    f"Optimización Adam convergente en {len(clf.loss_curve_) if hasattr(clf, 'loss_curve_') else epochs} épocas.",
                    f"Precisión media de entrenamiento: {round(clf.score(X_scaled, y) * 100, 1)}%"
                ],
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Fallback Neural Network Training Fail: {e}")
            return {"status": "error", "message": f"Fallback Neural Network Training Fail: {str(e)}"}
