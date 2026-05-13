import pymysql
from pyspark.sql.functions import concat, lit, lower, col, sum, count, avg, desc, trim

class ProcessingModule:
    """Módulo de Procesamiento de Datos (MapReduce, 3D, Saneamiento)."""

    def run_analysis(self, table_name="tickets", mode="mapreduce", filters=None):
        if self.resilience_mode:
            return self._run_analysis_sql(table_name, filters)
        try:
            # Intentar primero Spark sobre MySQL (Transaccional)
            df = self._read_mysql(table_name)
            
            # Si falla Spark o es nulo, intentar Spark sobre MongoDB (Big Data / Analítica Separada)
            if df is None:
                print(f"[ANALYTICS] Intentando leer '{table_name}' desde MongoDB Atlas...")
                df = self._read_mongo(table_name)
            
            if df is None: raise Exception("Fuentes agotadas (No MySQL nor Mongo found via Spark)")
            
            if filters: df = self._apply_filters(df, table_name, filters)
            if mode == "mapreduce": return self._process_mapreduce(df, table_name)
            return []
        except Exception as e:
            print(f"Error in Spark Analysis ({table_name}): {e}")
            # Fallback final a SQL ligero
            return self._run_analysis_sql(table_name, filters)

    def run_full_analysis(self):
        return self.run_analysis(table_name="tickets", mode="mapreduce")

    def run_incremental_analysis(self, last_date):
        return self.run_analysis(table_name="tickets", mode="mapreduce")

    def run_saneamiento(self, table_name):
        return self.run_analysis(table_name=table_name, mode="mapreduce")

    def run_3d_analysis(self, table_name="tickets", clean_mode=False, filters=None):
        if self.resilience_mode:
            return self._run_3d_sql(table_name, filters)
        try:
            df = self._read_mysql(table_name)
            if df is None: raise Exception("Spark no dio resultados para 3D")
            
            if filters: df = self._apply_filters(df, table_name, filters)
            df_clean = df.fillna({"section_name": "ANÓNIMO", "precio": 0, "cantidad": 0, "price": 0})
            return self._process_3d(df_clean, table_name)
        except Exception as e:
            print(f"3D Spark fail, falling back to SQL: {e}")
            return self._run_3d_sql(table_name, filters)

    def _process_mapreduce(self, df, table_name, focus_filter=None):
        df = df.fillna({"producto": "SIN_CLASIFICAR", "name": "SIN_NOMBRE", "ticket_type": "STAND", "role": "OPERADOR"})
        
        if table_name == "tickets":
            try:
                df_events = self._read_mysql("events")
                df_joined = df.join(df_events, df.event_id == df_events.id, "inner")
                resumen = df_joined.groupBy(df_events.name, df_events.description, df.ticket_type).agg(
                    sum(df.price).alias("ingreso_total"),
                    count("*").alias("cantidad_total"),
                    avg(df.price).alias("precio_promedio")
                ).withColumn("producto", concat(col("name"), lit(" - "), col("ticket_type"))) \
                 .withColumnRenamed("description", "image_url")
                if focus_filter: resumen = resumen.filter(lower(col("name")).contains(focus_filter.lower()))
                return [row.asDict() for row in resumen.collect()]
            except:
                resumen = df.groupBy("ticket_type").agg(sum("price").alias("ingreso_total"), count("*").alias("cantidad_total")).withColumnRenamed("ticket_type", "producto")
                return [row.asDict() for row in resumen.collect()]
        
        elif table_name == "events":
            df_clean = df.fillna({"name": "ANÓNIMO", "available_tickets": 0, "price": 0})
            resumen = df_clean.groupBy("name").agg(
                sum(col("available_tickets") * col("price")).alias("ingreso_total"), 
                sum("available_tickets").alias("cantidad_total"), 
                avg("price").alias("precio_promedio")
            ).withColumnRenamed("name", "producto")
            if focus_filter: resumen = resumen.filter(lower(col("producto")).contains(focus_filter.lower()))
            return [row.asDict() for row in resumen.collect()]

        elif table_name == "users" or table_name == "top_spenders":
            resumen = df.join(self._read_mysql("payments"), df.id == col("user_id")) \
                .groupBy("username").agg(count("*").alias("cantidad_total"), sum("amount").alias("ingreso_total")).withColumnRenamed("username", "producto") \
                .orderBy(desc("ingreso_total")).limit(20)
            return [row.asDict() for row in resumen.collect()]

        elif table_name == "payments":
            cols = df.columns
            amount_col = "amount" if "amount" in cols else "monto" if "monto" in cols else None
            method_col = "payment_method" if "payment_method" in cols else "id"
            if amount_col: resumen = df.groupBy(method_col).agg(sum(amount_col).alias("ingreso_total"), count("*").alias("cantidad_total")).withColumnRenamed(method_col, "producto")
            else: resumen = df.groupBy(method_col).count().withColumnRenamed(method_col, "producto").withColumnRenamed("count", "cantidad_total").withColumn("ingreso_total", lit(0))
            return [row.asDict() for row in resumen.collect()]
            
        return [row.asDict() for row in df.limit(100).collect()]

    def _process_3d(self, df, table_name, focus_filter=None):
        df = df.fillna({"producto": "SIN_CLASIFICAR", "nombre": "SIN_NOMBRE", "ticket_type": "STAND", "role": "OPERADOR"})
        try:
            if table_name == "tickets":
                df_events = self._read_mysql("events")
                df_joined = df.join(df_events, df.event_id == df_events.id, "inner")
                df_3d = df_joined.select(concat(df_events.name, lit(" - "), df.ticket_type).alias("producto"), df.id.cast("double").alias("y_volumen"), df.price.cast("double").alias("z_ingreso"))
            elif table_name == "events":
                df_3d = df.select(col("name").alias("producto"), col("available_tickets").cast("double").alias("y_volumen"), col("price").cast("double").alias("z_ingreso"))
            elif table_name == "users" or table_name == "top_spenders":
                df_payments = self._read_mysql("payments")
                df_3d = df.join(df_payments, df.id == df_payments.user_id).groupBy("username").agg(count("*").cast("double").alias("y_volumen"), sum("amount").cast("double").alias("z_ingreso")).withColumnRenamed("username", "producto").orderBy(desc("z_ingreso")).limit(30)
            elif table_name == "payments":
                amount_col = "amount" if "amount" in df.columns else "monto" if "monto" in df.columns else None
                method_col = "payment_method" if "payment_method" in df.columns else "id"
                if amount_col: df_3d = df.groupBy(trim(col(method_col)).alias("producto")).agg(count("*").cast("double").alias("y_volumen"), sum(col(amount_col)).cast("double").alias("z_ingreso"))
                else: df_3d = df.groupBy(trim(col(method_col)).alias("producto")).agg(count("*").cast("double").alias("y_volumen"), lit(0.0).alias("z_ingreso"))
            else:
                df_3d = df.limit(100).select(lit("DATA").alias("producto"), col("id").cast("double").alias("y_volumen") if "id" in df.columns else lit(1.0).alias("y_volumen"), lit(0.0).alias("z_ingreso"))
            if focus_filter and "producto" in df_3d.columns: df_3d = df_3d.filter(lower(col("producto")).contains(focus_filter.lower()))
            return [row.asDict() for row in df_3d.collect()]
        except: return []

    def get_artist_suggestions(self):
        try:
            if self.resilience_mode:
                conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db)
                cursor = conn.cursor()
                cursor.execute("SELECT DISTINCT name FROM events")
                res = [row[0] for row in cursor.fetchall()]
                conn.close()
                return res
            df = self._read_mysql("events")
            suggestions = df.select("name").distinct().collect()
            return [row.name for row in suggestions]
        except: return []
