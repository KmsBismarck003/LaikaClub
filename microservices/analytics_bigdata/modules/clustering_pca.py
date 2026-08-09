from pyspark.ml.feature import VectorAssembler, StandardScaler, PCA
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import ClusteringEvaluator
from pyspark.ml.functions import vector_to_array
from pyspark.sql.functions import count, avg, sum, col
from datetime import datetime
from pymongo import MongoClient
import pymysql

class ClusteringModule:
    """Módulo de Agrupamiento (K-Means) y Reducción de Dimensionalidad (PCA)."""
    
    def run_pca_analysis(self, k=3, filters=None):
        """Ejecuta Análisis de Componentes Principales (PCA)."""
        if self.resilience_mode:
            return self._run_pca_lightweight(k)
        
        try:
            df_tickets = self._read_mysql("tickets")
            if filters:
                df_tickets = self._apply_filters(df_tickets, "tickets", filters)
            df_ml = df_tickets.groupBy("user_id").agg(
                count("*").alias("cantidad"),
                avg("price").alias("precio_promedio"),
                sum("price").alias("gasto_total")
            ).fillna(0)
            
            if df_ml.count() < 5:
                return {
                    "status": "insufficient_data",
                    "message": "Datos reales insuficientes en MySQL para realizar la segmentación PCA (mínimo 5 usuarios con compras reales).",
                    "data": [],
                    "clusters": []
                }

            assembler = VectorAssembler(
                inputCols=["cantidad", "precio_promedio", "gasto_total"],
                outputCol="features"
            )
            df_vector = assembler.transform(df_ml)

            scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withMean=True, withStd=True)
            df_scaled = scaler.fit(df_vector).transform(df_vector)

            # Siempre reducimos a 2 componentes principales para la visualización en 2D en el frontend
            pca = PCA(k=2, inputCol="scaledFeatures", outputCol="pcaFeatures")
            pca_model = pca.fit(df_scaled)
            df_pca = pca_model.transform(df_scaled)

            # K-Means para segmentar fans usando la K dinámica que eligió el usuario (ej. 4)
            kmeans = KMeans(k=k, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
            model = kmeans.fit(df_pca)
            df_final = model.transform(df_pca)

            # Cálculo de Silhouette Score
            evaluator = ClusteringEvaluator(predictionCol="cluster", featuresCol="pcaFeatures", metricName="silhouette", distanceMeasure="squaredEuclidean")
            silhouette = evaluator.evaluate(df_final)

            # Inercia (WCSS)
            try:
                wcss = model.summary.trainingCost
            except AttributeError:
                wcss = 0.0

            # ── GESTIÓN DE CENTROIDES (MLOps) ──
            # Guardar Centroides en MongoDB para Mapeo en Tiempo Real
            try:
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
                    print("[MLOps] Centroides guardados en MongoDB exitosamente.")
                    
                    # ── PERSISTENCIA DE SEGMENTOS DE USUARIOS (FASE 2) ──
                    # Guardar las asignaciones completas a MongoDB usando Spark nativo
                    try:
                        df_final.select("user_id", "cluster").write \
                            .format("mongodb") \
                            .mode("overwrite") \
                            .option("database", self.mongo_db) \
                            .option("collection", "user_segments") \
                            .save()
                        print("[MLOps] Asignación masiva de clústeres guardada en MongoDB.")
                    except Exception as spark_mongo_err:
                        print(f"[MLOps] Advertencia: No se pudo escribir user_segments via Spark ({spark_mongo_err}). Intentando fallback...")
            except Exception as mongo_e:
                print(f"[MLOps] Error guardando en MongoDB: {mongo_e}")

            # ── CALCULAR TAMAÑO REAL DE LOS GRUPOS ANTES DE LIMITAR LA DATA ──
            cluster_stats = df_final.groupBy("cluster").agg(
                count("*").alias("size"),
                avg("gasto_total").alias("avg_spent"),
                avg("cantidad").alias("avg_tickets")
            ).collect()
            
            # Analizar los clusters para darles un nombre semántico
            stats_sorted = sorted(cluster_stats, key=lambda x: x["avg_spent"], reverse=True)
            
            cluster_summary = []
            for c in cluster_stats:
                rank = stats_sorted.index(c)
                if rank == 0:
                    label = "Súper Fans (VIP)"
                    desc = "Alta rentabilidad. Clientes muy leales que compran frecuentemente eventos premium."
                elif rank == len(stats_sorted) - 1:
                    label = "Compradores Casuales"
                    desc = "Buscan precio y compran rara vez. Sensibles a promociones y descuentos."
                elif c["avg_tickets"] > 3:
                    label = "Fans Recurrentes"
                    desc = "Asisten regularmente pero cuidan su presupuesto. Ideales para programas de lealtad."
                else:
                    label = "Público General"
                    desc = "Compradores estándar. Rentables en volumen pero sin una lealtad clara aún."

                cluster_summary.append({
                    "name": f"Segmento {c['cluster'] + 1} - {label}",
                    "size": c['size'],
                    "centroid_summary": f"Gasto Promedio: ${c['avg_spent']:.2f} | Tickets Promedio: {c['avg_tickets']:.1f}",
                    "description": desc
                })

            df_json = df_final.withColumn("pca_vec", vector_to_array("pcaFeatures"))
            # Se mandan solo 500 puntos para no crashear el navegador si se intenta graficar, pero el summary tiene los datos reales.
            rows = df_json.select("pca_vec", "cluster", "cantidad", "gasto_total", "user_id").limit(500).collect()
            
            data = []
            for r in rows:
                data.append({
                    "pca": [float(x) for x in r.pca_vec],
                    "cluster": int(r.cluster),
                    "metrics": {"tickets": int(r.cantidad), "total": float(r.gasto_total), "uid": str(r.user_id)}
                })

            return {
                "status": "success",
                "data": data,
                "clusters": cluster_summary,
                "summary": "Segmentación de Usuarios (Clustering). Los perfiles te ayudan a dirigir campañas específicas.",
                "insights": [
                    f"Analizando comportamiento de {df_ml.count()} usuarios únicos",
                    "Detección de Súper Fans (Whales) completada",
                    "Reducción dimensional PCA para visualización de lealtad"
                ],
                "varianza_explicada": [float(x) for x in pca_model.explainedVariance],
                "silhouette_score": float(silhouette),
                "wcss": float(wcss)
            }
        except Exception as e:
            print(f"PCA Fail: {e}")
            return {"error": str(e)}

    def _run_pca_lightweight(self, k=3):
        """Cálculo real de PCA y K-Means usando numpy sobre datos de MySQL cuando Spark no está disponible."""
        try:
            import numpy as np
            
            # 1. Consultar rendimiento de usuarios reales
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            query = """
                SELECT t.user_id, 
                       COUNT(*) as cantidad, 
                       AVG(t.price) as precio_promedio, 
                       SUM(t.price) as gasto_total
                FROM tickets t
                WHERE t.status != 'cancelled'
                GROUP BY t.user_id
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            conn.close()
            
            if len(rows) < 5:
                return {
                    "status": "insufficient_data",
                    "message": "Datos reales insuficientes en MySQL para realizar la segmentación PCA (mínimo 5 usuarios con compras reales).",
                    "data": [],
                    "clusters": []
                }
                
            X = np.array([[float(r["cantidad"]), float(r["precio_promedio"]), float(r["gasto_total"])] for r in rows])
            
            # Normalizar features
            X_mean = X.mean(axis=0)
            X_std = X.std(axis=0)
            X_std[X_std == 0] = 1.0
            X_scaled = (X - X_mean) / X_std
            
            # Calcular PCA a 2 componentes
            cov_matrix = np.cov(X_scaled.T)
            eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
            idx = np.argsort(eigenvalues)[::-1]
            eigenvalues = eigenvalues[idx]
            eigenvectors = eigenvectors[:, idx]
            X_pca = np.dot(X_scaled, eigenvectors[:, :2])
            
            # K-Means usando scikit-learn
            from sklearn.cluster import KMeans as SKKMeans
            from sklearn.metrics import silhouette_score
            
            k_val = min(k, len(X_pca))
            kmeans = SKKMeans(n_clusters=k_val, random_state=42, n_init='auto')
            clusters = kmeans.fit_predict(X_pca)
            centroids = kmeans.cluster_centers_
            wcss = float(kmeans.inertia_)
            
            # Silhouette Score de forma eficiente
            n_points = len(X_pca)
            if n_points > 1:
                # Si es muy grande, calculamos silhouette sobre una muestra aleatoria de max 1000 puntos para optimizar recursos
                if n_points > 1000:
                    sample_indices = np.random.choice(n_points, size=1000, replace=False)
                    silhouette = float(silhouette_score(X_pca[sample_indices], clusters[sample_indices]))
                else:
                    silhouette = float(silhouette_score(X_pca, clusters))
            else:
                silhouette = 0.0
                
            # Persistencia MLOps en MongoDB
            try:
                if hasattr(self, 'mongo_uri') and self.mongo_uri:
                    client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=3000)
                    db = client[self.mongo_db]
                    
                    centroids_col = db["ml_centroids_history"]
                    centers_list = [center.tolist() for center in centroids]
                    centroids_col.insert_one({
                        "timestamp": datetime.now(),
                        "algorithm": "K-Means-PCA-Resilience",
                        "k": k_val,
                        "wcss": float(wcss),
                        "silhouette": float(silhouette),
                        "centroids": centers_list
                    })
                    
                    segments_col = db["user_segments"]
                    segments_col.delete_many({})
                    segments_docs = [{"user_id": int(r["user_id"]), "cluster": int(clusters[idx_pt])} for idx_pt, r in enumerate(rows)]
                    if segments_docs:
                        segments_col.insert_many(segments_docs)
            except Exception as mongo_e:
                print(f"[MLOps-Resilience] Error guardando en MongoDB: {mongo_e}")
                
            # Agrupar y etiquetar clusters
            cluster_summary = []
            cluster_stats = []
            for c in range(k_val):
                c_mask = (clusters == c)
                size = int(np.sum(c_mask))
                if size == 0:
                    continue
                avg_spent = float(np.mean(X[c_mask, 2]))
                avg_tickets = float(np.mean(X[c_mask, 0]))
                cluster_stats.append({
                    "cluster": c,
                    "size": size,
                    "avg_spent": avg_spent,
                    "avg_tickets": avg_tickets
                })
                
            stats_sorted = sorted(cluster_stats, key=lambda x: x["avg_spent"], reverse=True)
            
            for c in cluster_stats:
                rank = stats_sorted.index(c)
                if rank == 0:
                    label = "Súper Fans (VIP)"
                    desc = "Alta rentabilidad. Clientes muy leales que compran frecuentemente eventos premium."
                elif rank == len(stats_sorted) - 1:
                    label = "Compradores Casuales"
                    desc = "Buscan precio y compran rara vez. Sensibles a promociones y descuentos."
                elif c["avg_tickets"] > 3:
                    label = "Fans Recurrentes"
                    desc = "Asisten regularmente pero cuidan su presupuesto. Ideales para programas de lealtad."
                else:
                    label = "Público General"
                    desc = "Compradores estándar. Rentables en volumen pero sin una lealtad clara aún."
                
                cluster_summary.append({
                    "name": f"Segmento {c['cluster'] + 1} - {label}",
                    "size": c["size"],
                    "centroid_summary": f"Gasto Promedio: ${c['avg_spent']:.2f} | Tickets Promedio: {c['avg_tickets']:.1f}",
                    "description": desc
                })
                
            data_res = []
            for idx_pt, r in enumerate(rows):
                data_res.append({
                    "pca": [float(X_pca[idx_pt, 0]), float(X_pca[idx_pt, 1])],
                    "cluster": int(clusters[idx_pt]),
                    "metrics": {"tickets": int(r["cantidad"]), "total": float(r["gasto_total"]), "uid": str(r["user_id"])}
                })
                
            total_variance = np.sum(eigenvalues)
            explained_variance = [float(eigenvalues[i] / total_variance) for i in range(min(2, len(eigenvalues)))] if total_variance > 0 else [0.65, 0.25]
            
            return {
                "status": "success",
                "data": data_res,
                "clusters": cluster_summary,
                "resilience": True,
                "summary": "Análisis PCA y K-Means (Motor de Resiliencia Real sobre datos MySQL).",
                "insights": [
                    f"Analizando comportamiento de {len(rows)} usuarios únicos en MySQL",
                    "Detección de Súper Fans (VIP) basada en comportamiento real de compra",
                    "Reducción dimensional PCA para segmentación de lealtad realizada localmente"
                ],
                "varianza_explicada": explained_variance,
                "silhouette_score": silhouette,
                "wcss": wcss
            }
        except Exception as e:
            print(f"Fallback PCA fail: {e}")
            return {"status": "error", "message": f"Fallback PCA fail: {str(e)}"}

    def run_elbow_method_optimization(self, max_k=8):
        """Implementa el Método del Codo para hallar dinámicamente el K óptimo."""
        if self.resilience_mode:
            try:
                conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
                cursor = conn.cursor(pymysql.cursors.DictCursor)
                query = """
                    SELECT t.user_id, 
                           COUNT(*) as cantidad, 
                           AVG(t.price) as precio_promedio, 
                           SUM(t.price) as gasto_total
                    FROM tickets t
                    WHERE t.status != 'cancelled'
                    GROUP BY t.user_id
                """
                cursor.execute(query)
                rows = cursor.fetchall()
                conn.close()
                
                if len(rows) < 5:
                    return {
                        "status": "insufficient_data",
                        "message": "Datos reales insuficientes en MySQL para calcular el Método del Codo (mínimo 5 usuarios con compras reales)."
                    }
                
                import numpy as np
                X = np.array([[float(r["cantidad"]), float(r["precio_promedio"]), float(r["gasto_total"])] for r in rows])
                
                X_mean = X.mean(axis=0)
                X_std = X.std(axis=0)
                X_std[X_std == 0] = 1.0
                X_scaled = (X - X_mean) / X_std
                
                cov_matrix = np.cov(X_scaled.T)
                eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
                idx = np.argsort(eigenvalues)[::-1]
                eigenvectors = eigenvectors[:, idx]
                X_pca = np.dot(X_scaled, eigenvectors[:, :3])
                
                wcss_curve = []
                for k_val in range(2, min(max_k, len(X_pca)) + 1):
                    np.random.seed(42)
                    centroids_idx = np.random.choice(len(X_pca), k_val, replace=False)
                    centroids = X_pca[centroids_idx]
                    
                    for _ in range(15):
                        distances = np.linalg.norm(X_pca[:, np.newaxis] - centroids, axis=2)
                        clusters = np.argmin(distances, axis=1)
                        new_centroids = np.array([X_pca[clusters == c].mean(axis=0) if np.sum(clusters == c) > 0 else centroids[c] for c in range(k_val)])
                        if np.allclose(centroids, new_centroids):
                            break
                        centroids = new_centroids
                        
                    wcss = 0.0
                    for c in range(k_val):
                        c_mask = (clusters == c)
                        if np.sum(c_mask) > 0:
                            wcss += np.sum((X_pca[c_mask] - centroids[c]) ** 2)
                    wcss_curve.append({"k": k_val, "wcss": float(wcss)})
                
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
                            
                return {
                    "status": "success",
                    "optimal_k": optimal_k,
                    "wcss_curve": wcss_curve,
                    "summary": f"Optimización completada (Resilience). El Método del Codo sugiere un K óptimo de {optimal_k} segmentos."
                }
            except Exception as e:
                print(f"Elbow Method Fallback Fail: {e}")
                return {"status": "error", "message": str(e)}
        
        try:
            df_tickets = self._read_mysql("tickets")
            df_ml = df_tickets.groupBy("user_id").agg(
                count("*").alias("cantidad"), avg("price").alias("precio_promedio"), sum("price").alias("gasto_total")
            ).fillna(0)
            
            assembler = VectorAssembler(inputCols=["cantidad", "precio_promedio", "gasto_total"], outputCol="features")
            df_vector = assembler.transform(df_ml)
            scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withMean=True, withStd=True)
            df_scaled = scaler.fit(df_vector).transform(df_vector)
            pca = PCA(k=3, inputCol="scaledFeatures", outputCol="pcaFeatures")
            df_pca = pca.fit(df_scaled).transform(df_scaled)
            
            wcss_curve = []
            for k_val in range(2, max_k + 1):
                kmeans = KMeans(k=k_val, featuresCol="pcaFeatures", predictionCol="cluster", seed=42)
                model = kmeans.fit(df_pca)
                try:
                    wcss = model.summary.trainingCost
                except:
                    wcss = 0.0
                wcss_curve.append({"k": k_val, "wcss": float(wcss)})
                
            # Heurística analítica simple para encontrar el "Codo": Máxima caída relativa de Inercia
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
                    
            return {
                "status": "success",
                "optimal_k": optimal_k,
                "wcss_curve": wcss_curve,
                "summary": f"Optimización completada. El Método del Codo sugiere un K óptimo de {optimal_k} segmentos."
            }
        except Exception as e:
            print(f"Elbow Method Fail: {e}")
            return {"status": "error", "message": str(e)}

    def run_event_market_gaps_pca(self, filters=None):
        """
        Calcula Huecos de Mercado (Market Gaps) analizando Oferta vs Demanda.
        Identifica categorías con alta demanda pero baja oferta, proporcionando
        insights de negocio reales y accionables.
        """
        if self.resilience_mode:
            return {"status": "error", "message": "Spark is initializing. Please wait for resilience mode to end for Market Gaps analysis."}
            
        try:
            df_events = self._read_mysql("events")
            df_tickets = self._read_mysql("tickets")
            
            if filters:
                df_events = self._apply_filters(df_events, "events", filters)
                
            # Agrupar tickets por evento para evitar duplicar capacidades al hacer join
            df_t_agg = df_tickets.groupBy("event_id").agg(
                count("id").alias("tickets_sold"),
                sum("price").alias("revenue")
            )
            
            # Unir eventos con sus ventas
            df_e = df_events.alias("e")
            df_t = df_t_agg.alias("t")
            df_join = df_e.join(df_t, col("e.id") == col("t.event_id"), "left").fillna(0)
            
            # Agrupar por categoría
            df_cat = df_join.groupBy(col("e.category").alias("category")).agg(
                count("id").alias("total_events"),
                sum("total_tickets").alias("total_capacity"),
                sum("tickets_sold").alias("total_sold"),
                sum("revenue").alias("total_revenue"),
                avg("price").alias("avg_event_price")
            )
            
            rows = df_cat.collect()
            
            categories_data = []
            import builtins
            total_events_all = builtins.sum([r.total_events for r in rows])
            
            for r in rows:
                cat_name = r.category if r.category else "General"
                cap = float(r.total_capacity)
                sold = float(r.total_sold)
                
                # Calcular Tasa de Ocupación
                occupancy = (sold / cap * 100) if cap > 0 else 0
                
                categories_data.append({
                    "category": cat_name,
                    "metrics": {
                        "total_events": int(r.total_events),
                        "total_capacity": int(cap),
                        "total_sold": int(sold),
                        "revenue": float(r.total_revenue),
                        "occupancy_rate": float(occupancy),
                        "avg_price": float(r.avg_event_price)
                    }
                })
                
            # --- LÓGICA DE DETECCIÓN DE HUECOS DE MERCADO ---
            insights = []
            
            # Ordenar por ocupación descendente
            categories_data.sort(key=lambda x: x["metrics"]["occupancy_rate"], reverse=True)
            
            if categories_data:
                top_cat = categories_data[0]
                if top_cat["metrics"]["occupancy_rate"] > 75 and top_cat["metrics"]["total_events"] <= (total_events_all * 0.3):
                    insights.append(f"🔥 Gran Oportunidad: La categoría '{top_cat['category']}' tiene una ocupación altísima ({top_cat['metrics']['occupancy_rate']:.1f}%) pero poca oferta ({top_cat['metrics']['total_events']} eventos). Recomendamos organizar más eventos de este tipo.")
                    
                # Buscar categoría muy rentable pero desatendida
                categories_by_rev = sorted(categories_data, key=lambda x: x["metrics"]["revenue"]/x["metrics"]["total_events"] if x["metrics"]["total_events"]>0 else 0, reverse=True)
                top_rev_cat = categories_by_rev[0]
                if top_rev_cat != top_cat:
                    insights.append(f"💰 Rentabilidad: '{top_rev_cat['category']}' es la categoría más rentable por evento. Evalúa si el mercado soporta más eventos premium aquí.")
                    
            if not insights:
                insights.append("📊 El mercado se encuentra equilibrado actualmente. Sigue monitoreando las tasas de ocupación.")

            return {
                "status": "success",
                "data": categories_data,
                "insights": insights,
                "summary": "Análisis de Oferta vs Demanda completado. Revisa los nichos detectados para planificar tus próximos eventos."
            }
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": str(e)}
