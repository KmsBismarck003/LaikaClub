from pymongo import MongoClient
import numpy as np

class RecommendationsModule:
    """Módulo mixin para el motor de recomendaciones basadas en aprendizaje no supervisado."""
    
    def get_event_target_audience(self, event_features=None, limit=5):
        """
        Recomendador Estratégico para Administradores.
        Detecta eventos activos con baja ocupación y sugiere a qué clúster de
        usuarios enviar campañas promocionales basándose en los centroides del modelo.
        """
        try:
            import pymysql
            if not hasattr(self, 'mongo_uri') or not self.mongo_uri:
                return {"status": "error", "message": "Conexión a MongoDB no configurada."}
                
            # 1. Obtener eventos con baja ocupación (Oferta vs Demanda)
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            query = """
                SELECT e.id, e.name, e.category, e.total_tickets as capacity, e.price, COUNT(t.id) as tickets_sold
                FROM events e
                LEFT JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
                WHERE e.status = 'active' OR e.status = 'published'
                GROUP BY e.id
                HAVING tickets_sold < (e.total_tickets * 0.5)
                ORDER BY (e.total_tickets - tickets_sold) DESC
                LIMIT %s
            """
            cursor.execute(query, (limit,))
            low_occupancy_events = cursor.fetchall()
            conn.close()
            
            if not low_occupancy_events:
                 return {
                     "status": "success",
                     "target_clusters": [],
                     "summary": "Actualmente no hay eventos con baja ocupación. ¡Excelente trabajo!"
                 }
                 
            # 2. Conectar a MongoDB para obtener perfiles de clusters
            client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=3000)
            db = client[self.mongo_db]
            
            latest_model = db["ml_centroids_history"].find_one(sort=[("timestamp", -1)])
            if not latest_model:
                return {"status": "error", "message": "No hay modelo entrenado. Ejecuta Clasificación de Fans primero."}
                
            centroids = latest_model.get("centroids", [])
            
            # Identificar dinámicamente qué cluster es VIP (mayor gasto) y cuál es Frecuente (mayor cantidad)
            vip_cluster = 0
            freq_cluster = 0
            if centroids and len(centroids) > 0 and len(centroids[0]) >= 3:
                # Features: [cantidad, precio_promedio, gasto_total]
                gasto_totals = [c[2] for c in centroids]
                vip_cluster = gasto_totals.index(max(gasto_totals))
                cantidades = [c[0] for c in centroids]
                freq_cluster = cantidades.index(max(cantidades))
            
            # Nombres semánticos para los clústeres
            segment_names = ["Súper Fans (VIP)", "Compradores Casuales", "Fans Recurrentes", "Público General"]
            
            recommendations = []
            for event in low_occupancy_events:
                occ_rate = (event["tickets_sold"] / event["capacity"] * 100) if event["capacity"] > 0 else 0
                price_val = float(event["price"]) if event["price"] else 0.0
                price_display = f"${price_val:,.2f}" if price_val > 0 else "Entrada Gratuita / Variable"
                
                # Asignación estratégica
                if price_val >= 800:
                    target_c = vip_cluster
                    target_name = segment_names[target_c] if target_c < len(segment_names) else f"Segmento {target_c + 1}"
                    reason = f"Evento Premium ({price_display}). Requiere compradores con alto poder adquisitivo."
                    action = f"Dirigir campaña de Upgrade o Beneficios VIP al segmento: {target_name}."
                else:
                    target_c = freq_cluster
                    target_name = segment_names[target_c] if target_c < len(segment_names) else f"Segmento {target_c + 1}"
                    reason = f"Evento Estándar ({price_display}). Ideal para estrategias de volumen y recurrencia."
                    action = f"Lanza campaña de descuento 2x1 o flash sale dirigida al segmento: {target_name}."
                    
                recommendations.append({
                    "event_id": event["id"],
                    "event_name": event["name"],
                    "category": event["category"],
                    "occupancy": round(occ_rate, 1),
                    "target_cluster": target_c,
                    "target_cluster_name": target_name,
                    "reason": reason,
                    "action": action
                })

            
            return {
                "status": "success",
                "target_clusters": recommendations,
                "summary": "Recomendaciones generadas cruzando eventos en riesgo con perfiles de compradores."
            }
        except Exception as e:
            print(f"[Recommendations Engine] Error Strategic Recs: {e}")
            return {"status": "error", "message": str(e)}

    def get_user_recommendations(self, user_id, limit=5):
        """
        Encuentra recomendaciones de eventos para un usuario consultando su clúster
        y sugiriendo eventos que coinciden con el perfil del centroide.
        """
        try:
            if not hasattr(self, 'mongo_uri') or not self.mongo_uri:
                return {"status": "error", "message": "Conexión a MongoDB no configurada."}
                
            client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=3000)
            db = client[self.mongo_db]
            
            # Buscar a qué clúster pertenece el usuario
            user_segment = db["user_segments"].find_one({"user_id": int(user_id)})
            
            if not user_segment:
                return {"status": "error", "message": "Usuario sin historial. Usa recomendaciones generales (Trending)."}
                
            cluster_id = user_segment.get("cluster")
            
            # Consultar eventos que han sido comprados mayoritariamente por este clúster (Lógica de filtrado colaborativo)
            # Como no tenemos tabla "event_clusters", buscamos usuarios del mismo clúster:
            peer_users = list(db["user_segments"].find({"cluster": cluster_id}, {"user_id": 1, "_id": 0}).limit(100))
            peer_ids = [u["user_id"] for u in peer_users]
            
            if not peer_ids:
                return {"status": "success", "recommendations": []}
                
            # Consulta a MySQL para ver qué eventos compraron estos usuarios similares recientemente
            import pymysql
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            format_strings = ','.join(['%s'] * len(peer_ids))
            query = f"""
                SELECT e.id, e.name, e.category, e.price, COUNT(t.id) as score
                FROM tickets t
                JOIN events e ON t.event_id = e.id
                WHERE t.user_id IN ({format_strings}) AND e.status != 'cancelled'
                GROUP BY e.id
                ORDER BY score DESC
                LIMIT %s
            """
            
            # Añadir límite a los parámetros
            params = peer_ids + [limit]
            cursor.execute(query, tuple(params))
            recs = cursor.fetchall()
            conn.close()
            
            return {
                "status": "success",
                "user_cluster": cluster_id,
                "recommendations": recs,
                "summary": f"Recomendaciones personalizadas basadas en similitud Euclidiana y K-Means."
            }
        except Exception as e:
            print(f"[Recommendations Engine] Error User Recs: {e}")
            return {"status": "error", "message": str(e)}
