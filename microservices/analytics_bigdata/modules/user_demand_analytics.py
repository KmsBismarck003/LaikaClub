import os
import pymysql
from datetime import datetime, timedelta
from pyspark.sql.functions import col, sum as spark_sum, count, when, datediff, current_date, avg, hour, dayofweek

class UserDemandAnalyticsModule:
    """Módulo mixin para el análisis de comportamiento de usuarios, predicción de abandono (churn) y demanda."""

    def get_user_behavior_analytics(self, manager_id=None):
        """Calcula el top de consumidores, cuentas inactivas y distribución de riesgo de abandono (churn)."""
        if self.resilience_mode:
            return self._get_user_behavior_sql(manager_id)
        
        try:
            # Implementación distribuida con PySpark
            df_users = self._read_mysql("users")
            df_tickets = self._read_mysql("tickets").filter(col("status") != "cancelled")
            df_payments = self._read_mysql("payments").filter(col("status") == "completed")
            
            if manager_id:
                df_events = self._read_mysql("events").filter(
                    (col("created_by") == manager_id) | (col("assigned_manager_id") == manager_id)
                )
                event_ids = [r.id for r in df_events.select("id").collect()]
                df_tickets = df_tickets.filter(col("event_id").isin(event_ids))
                df_payments = df_payments.filter(col("event_id").isin(event_ids))

            # 1. Top de Consumidores
            df_user_tickets = df_tickets.groupBy("user_id").agg(count("*").alias("tickets_bought"))
            df_user_payments = df_payments.groupBy("user_id").agg(spark_sum("amount").alias("total_spent"))
            
            df_user_stats = df_users.join(df_user_tickets, df_users.id == df_user_tickets.user_id, "left") \
                                   .join(df_user_payments, df_users.id == df_user_payments.user_id, "left") \
                                   .select(
                                       df_users.id,
                                       df_users.first_name,
                                       df_users.last_name,
                                       df_users.email,
                                       col("tickets_bought").alias("tickets"),
                                       col("total_spent").alias("spent"),
                                       df_users.last_login,
                                       df_users.created_at
                                   ).fillna(0)
            
            top_consumers_rows = df_user_stats.filter(col("tickets") > 0).orderBy(col("spent").desc(), col("tickets").desc()).limit(15).collect()
            top_consumers = []
            for r in top_consumers_rows:
                top_consumers.append({
                    "id": r.id,
                    "name": f"{r.first_name} {r.last_name}",
                    "email": r.email,
                    "tickets": int(r.tickets),
                    "spent": float(r.spent)
                })

            # 2. Cuentas Inactivas (Usuarios registrados con 0 tickets)
            inactive_accounts_count = df_user_stats.filter(col("tickets") == 0).count()
            
            # 3. Predicción de Abandono (Churn) según inactividad
            df_churn = df_user_stats.withColumn(
                "days_since_login", 
                when(col("last_login").isNotNull(), datediff(current_date(), col("last_login")))
                .otherwise(datediff(current_date(), col("created_at")))
            )
            
            df_churn = df_churn.withColumn(
                "risk_level",
                when(col("days_since_login") > 90, "High")
                .when((col("days_since_login") > 30) & (col("days_since_login") <= 90), "Medium")
                .otherwise("Low")
            )
            
            risk_counts = df_churn.groupBy("risk_level").count().collect()
            churn_risk_distribution = {"Low": 0, "Medium": 0, "High": 0}
            for rc in risk_counts:
                churn_risk_distribution[rc.risk_level] = rc["count"]
                
            churn_candidates_rows = df_churn.filter(col("risk_level") == "High").orderBy(col("days_since_login").desc()).limit(10).collect()
            churn_candidates = []
            for r in churn_candidates_rows:
                churn_candidates.append({
                    "id": r.id,
                    "name": f"{r.first_name} {r.last_name}",
                    "email": r.email,
                    "days_inactive": int(r.days_since_login) if r.days_since_login is not None else 120,
                    "last_login": r.last_login.isoformat() if r.last_login else None
                })
                
            return {
                "status": "success",
                "top_consumers": top_consumers,
                "inactive_accounts_count": inactive_accounts_count,
                "churn_risk_distribution": churn_risk_distribution,
                "churn_candidates": churn_candidates,
                "timestamp": datetime.now().isoformat(),
                "resilience": False
            }
        except Exception as e:
            print(f"[PySpark Behavior] Error: {e}. Activando fallback SQL...")
            return self._get_user_behavior_sql(manager_id)

    def _get_user_behavior_sql(self, manager_id=None):
        """Fallback con SQL Directo para cuando Spark no está disponible o inicializado."""
        try:
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            manager_filter = ""
            if manager_id:
                manager_filter = f"AND (e.created_by = {int(manager_id)} OR e.assigned_manager_id = {int(manager_id)})"
            
            query_top = f"""
                SELECT u.id, u.first_name, u.last_name, u.email,
                       COUNT(t.id) as tickets,
                       COALESCE(SUM(p.amount), 0) as spent
                FROM users u
                LEFT JOIN tickets t ON u.id = t.user_id AND t.status != 'cancelled'
                LEFT JOIN events e ON t.event_id = e.id {manager_filter}
                LEFT JOIN payments p ON u.id = p.user_id AND p.status = 'completed' AND p.event_id = t.event_id
                GROUP BY u.id
                HAVING tickets > 0
                ORDER BY spent DESC, tickets DESC
                LIMIT 15
            """
            cursor.execute(query_top)
            rows_top = cursor.fetchall()
            top_consumers = [{
                "id": r["id"],
                "name": f"{r['first_name']} {r['last_name']}",
                "email": r["email"],
                "tickets": int(r["tickets"]),
                "spent": float(r["spent"])
            } for r in rows_top]

            query_inactive = """
                SELECT COUNT(*) as cnt
                FROM users u
                WHERE u.id NOT IN (SELECT DISTINCT user_id FROM tickets WHERE status != 'cancelled')
            """
            cursor.execute(query_inactive)
            inactive_accounts_count = cursor.fetchone()["cnt"]

            query_churn = """
                SELECT id, first_name, last_name, email, last_login, created_at,
                       DATEDIFF(NOW(), COALESCE(last_login, created_at)) as days_inactive
                FROM users
            """
            cursor.execute(query_churn)
            rows_churn = cursor.fetchall()
            
            churn_risk_distribution = {"Low": 0, "Medium": 0, "High": 0}
            churn_candidates = []
            
            for r in rows_churn:
                days = r["days_inactive"]
                if days is None:
                    days = 120
                
                if days > 90:
                    level = "High"
                elif days > 30:
                    level = "Medium"
                else:
                    level = "Low"
                
                churn_risk_distribution[level] += 1
                
                if level == "High":
                    churn_candidates.append({
                        "id": r["id"],
                        "name": f"{r['first_name']} {r['last_name']}",
                        "email": r["email"],
                        "days_inactive": int(days),
                        "last_login": r["last_login"].isoformat() if r["last_login"] else None
                    })
            
            churn_candidates = sorted(churn_candidates, key=lambda x: x["days_inactive"], reverse=True)[:10]
            conn.close()
            
            return {
                "status": "success",
                "top_consumers": top_consumers,
                "inactive_accounts_count": inactive_accounts_count,
                "churn_risk_distribution": churn_risk_distribution,
                "churn_candidates": churn_candidates,
                "timestamp": datetime.now().isoformat(),
                "resilience": True
            }
        except Exception as e:
            print(f"[SQL Behavior Fail]: {e}")
            return {"status": "error", "message": str(e)}

    def get_demand_prediction_analytics(self, manager_id=None):
        """Prevee la tasa de asistencia de eventos y calcula la rentabilidad por horarios/días."""
        if self.resilience_mode:
            return self._get_demand_prediction_sql(manager_id)
            
        try:
            # Implementación con PySpark
            df_events = self._read_mysql("events")
            df_tickets = self._read_mysql("tickets").filter(col("status") != "cancelled")
            
            if manager_id:
                df_events = df_events.filter(
                    (col("created_by") == manager_id) | (col("assigned_manager_id") == manager_id)
                )
                event_ids = [r.id for r in df_events.select("id").collect()]
                df_tickets = df_tickets.filter(col("event_id").isin(event_ids))
                
            df_sold = df_tickets.groupBy("event_id").agg(count("*").alias("tickets_sold"))
            df_events_stats = df_events.join(df_sold, df_events.id == df_sold.event_id, "left").fillna(0)
            
            df_events_stats = df_events_stats.withColumn(
                "attendance_rate", 
                when(col("total_tickets") > 0, col("tickets_sold") / col("total_tickets"))
                .otherwise(0.0)
            )
            
            events_rows = df_events_stats.select("id", "name", "category", "total_tickets", "tickets_sold", "attendance_rate", "price", "event_date", "event_time").collect()
            
            events_attendance = []
            for r in events_rows:
                current_rate = float(r.attendance_rate)
                price_val = float(r.price) if r.price else 0.0
                
                # Heurística de predicción de demanda final:
                if current_rate >= 0.8:
                    predicted_rate = 1.0
                else:
                    price_factor = 0.95 if price_val > 500 else 1.05
                    predicted_rate = min(1.0, current_rate * 1.35 * price_factor)
                
                predicted_tickets = int(round(predicted_rate * r.total_tickets))
                
                events_attendance.append({
                    "id": r.id,
                    "name": r.name,
                    "category": r.category if hasattr(r, "category") and r.category else "General",
                    "total_tickets": int(r.total_tickets),
                    "tickets_sold": int(r.tickets_sold),
                    "current_attendance_pct": round(current_rate * 100, 1),
                    "predicted_attendance_pct": round(predicted_rate * 100, 1),
                    "predicted_tickets_sold": predicted_tickets,
                    "price": price_val,
                    "date": r.event_date.isoformat() if r.event_date else None,
                    "time": str(r.event_time) if r.event_time else None
                })
                
            df_slots = df_events_stats.groupBy(
                hour("event_time").alias("start_hour"),
                dayofweek("event_date").alias("day_of_week")
            ).agg(
                spark_sum("tickets_sold").alias("total_tickets_sold"),
                avg("price").alias("avg_price"),
                count("*").alias("event_count")
            ).fillna(0)
            
            days_map = {1: "Domingo", 2: "Lunes", 3: "Martes", 4: "Miércoles", 5: "Jueves", 6: "Viernes", 7: "Sábado"}
            
            slots_rows = df_slots.collect()
            profitable_slots = []
            for r in slots_rows:
                sh = r.start_hour if r.start_hour is not None else 20
                dow = r.day_of_week if r.day_of_week is not None else 6
                est_revenue = float(r.total_tickets_sold) * float(r.avg_price)
                
                profitable_slots.append({
                    "start_hour": int(sh),
                    "day_name": days_map.get(dow, "Sábado"),
                    "tickets_sold": int(r.total_tickets_sold),
                    "avg_price": float(r.avg_price),
                    "estimated_revenue": est_revenue,
                    "event_count": int(r.event_count)
                })
                
            profitable_slots = sorted(profitable_slots, key=lambda x: x["estimated_revenue"], reverse=True)
            
            return {
                "status": "success",
                "events_attendance": events_attendance,
                "profitable_slots": profitable_slots,
                "timestamp": datetime.now().isoformat(),
                "resilience": False
            }
        except Exception as e:
            print(f"[PySpark Demand] Error: {e}. Fallback SQL...")
            return self._get_demand_prediction_sql(manager_id)
            
    def _get_demand_prediction_sql(self, manager_id=None):
        """Fallback con SQL Directo para cuando Spark no está disponible o inicializado."""
        try:
            conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            manager_filter = ""
            if manager_id:
                manager_filter = f"AND (e.created_by = {int(manager_id)} OR e.assigned_manager_id = {int(manager_id)})"
            
            query_events = f"""
                SELECT e.id, e.name, e.category, e.total_tickets, e.price, e.event_date, e.event_time,
                       COUNT(t.id) as tickets_sold
                FROM events e
                LEFT JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
                WHERE 1=1 {manager_filter}
                GROUP BY e.id
            """
            cursor.execute(query_events)
            rows_events = cursor.fetchall()
            
            events_attendance = []
            for r in rows_events:
                total_tickets = r["total_tickets"] if r["total_tickets"] else 100
                tickets_sold = r["tickets_sold"]
                price_val = float(r["price"]) if r["price"] else 0.0
                
                current_rate = tickets_sold / total_tickets if total_tickets > 0 else 0
                if current_rate >= 0.8:
                    predicted_rate = 1.0
                else:
                    price_factor = 0.95 if price_val > 500 else 1.05
                    predicted_rate = min(1.0, current_rate * 1.35 * price_factor)
                
                predicted_tickets = int(round(predicted_rate * total_tickets))
                
                events_attendance.append({
                    "id": r["id"],
                    "name": r["name"],
                    "category": r["category"] if r.get("category") else "General",
                    "total_tickets": int(total_tickets),
                    "tickets_sold": int(tickets_sold),
                    "current_attendance_pct": round(current_rate * 100, 1),
                    "predicted_attendance_pct": round(predicted_rate * 100, 1),
                    "predicted_tickets_sold": predicted_tickets,
                    "price": price_val,
                    "date": r["event_date"].isoformat() if r["event_date"] else None,
                    "time": str(r["event_time"]) if r["event_time"] else None
                })
                
            query_slots = f"""
                SELECT HOUR(e.event_time) as start_hour,
                       DAYOFWEEK(e.event_date) as day_of_week,
                       COUNT(DISTINCT e.id) as event_count,
                       COUNT(t.id) as tickets_sold,
                       AVG(e.price) as avg_price
                FROM events e
                LEFT JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
                WHERE 1=1 {manager_filter}
                GROUP BY start_hour, day_of_week
            """
            cursor.execute(query_slots)
            rows_slots = cursor.fetchall()
            
            days_map = {1: "Domingo", 2: "Lunes", 3: "Martes", 4: "Miércoles", 5: "Jueves", 6: "Viernes", 7: "Sábado"}
            profitable_slots = []
            for r in rows_slots:
                sh = r["start_hour"] if r["start_hour"] is not None else 20
                dow = r["day_of_week"] if r["day_of_week"] is not None else 6
                
                avg_price = float(r["avg_price"]) if r["avg_price"] else 0.0
                tickets_sold = int(r["tickets_sold"])
                est_revenue = tickets_sold * avg_price
                
                profitable_slots.append({
                    "start_hour": int(sh),
                    "day_name": days_map.get(dow, "Sábado"),
                    "tickets_sold": tickets_sold,
                    "avg_price": avg_price,
                    "estimated_revenue": est_revenue,
                    "event_count": int(r["event_count"])
                })
                
            profitable_slots = sorted(profitable_slots, key=lambda x: x["estimated_revenue"], reverse=True)
            conn.close()
            
            return {
                "status": "success",
                "events_attendance": events_attendance,
                "profitable_slots": profitable_slots,
                "timestamp": datetime.now().isoformat(),
                "resilience": True
            }
        except Exception as e:
            print(f"[SQL Demand Fail]: {e}")
            return {"status": "error", "message": str(e)}
