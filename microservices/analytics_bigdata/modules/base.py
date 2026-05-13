import os
import threading
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, hour, avg, stddev
from pymongo import MongoClient

class BaseAnalytics:
    def __init__(self):
        super().__init__()
        self.spark = None
        self.resilience_mode = True # Iniciar en modo resiliencia (ligero) hasta que Spark despierte
        
        # Intentar cargar variables de entorno primero para tener acceso a MySQL
        env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
        load_dotenv(dotenv_path=env_path)
        
        self.mysql_user = os.getenv("MYSQL_USER", "root").strip('"')
        self.mysql_pass = os.getenv("MYSQL_PASSWORD", "").strip('"')
        self.mysql_host = os.getenv("MYSQL_HOST", "localhost").strip('"')
        self.mysql_db = os.getenv("MYSQL_DATABASE", "laika_club").strip('"')
        self.mysql_url = f"jdbc:mysql://{self.mysql_host}:3306/{self.mysql_db}"

        # Configuración MongoDB Atlas
        raw_uri = os.getenv("MONGO_URI", "").strip('"')
        self.mongo_uri = raw_uri
        self.mongo_db = os.getenv("MONGO_DB", "laika_analytics").strip('"')

        # Map de nombres (Inglés MySQL -> Español MongoDB)
        self.TABLE_MAP = {
            "users": "usuarios",
            "events": "eventos",
            "tickets": "tickets",
            "payments": "payments",
            "merchandise": "merchandise"
        }

        try:
            print(f"[DEBUG] Iniciando hilo de Spark...")
            self.spark_thread = threading.Thread(target=self._safe_initialize_spark)
            self.spark_thread.daemon = True
            self.spark_thread.start()
            print("[DEBUG] Hilo de Spark lanzado. El servicio operará en modo ligero mientras Spark inicializa.")
        except Exception as e:
            print(f"FAILED to launch spark thread: {e}")

    def _safe_initialize_spark(self):
        """Método para ejecutar en segundo plano."""
        try:
            print(f"[SPARK-START] Conectando a {self.mongo_uri[:20]}...")
            self._initialize_spark()
            if self.spark:
                print("[SPARK-READY] Sesión de Spark activada exitosamente.")
                self.resilience_mode = False
                self.spark.sparkContext.setLogLevel("ERROR")
            else:
                print("[SPARK-FAIL] No se pudo crear la sesión de Spark.")
        except Exception as e:
            print(f"[SPARK-CRITICAL] Error en inicialización fondo: {e}")

        if self.spark:
            try:
                self.spark.sparkContext.setLogLevel("ERROR")
                print("[DEBUG] Nivel de log de Spark ajustado.")
            except Exception as e:
                print(f"[DEBUG] Error al ajustar nivel de log: {e}")

    def _initialize_spark(self):
        """Intenta crear la sesión de Spark de forma segura."""
        print("[DEBUG] Ejecutando SparkSession.builder...")
        self.spark = SparkSession.builder \
            .appName("LaikaProactiveBI") \
            .config("spark.jars.packages", "org.mongodb.spark:mongo-spark-connector_2.13:10.3.0,mysql:mysql-connector-java:8.0.28") \
            .config("spark.mongodb.read.connection.uri", self.mongo_uri) \
            .config("spark.mongodb.write.connection.uri", self.mongo_uri) \
            .getOrCreate()

    def get_available_tables(self):
        return ["tickets", "users", "payments", "events", "merchandise"]

    def _read_mysql(self, table_name):
        if not self.spark: return None
        df = self.spark.read.format("jdbc") \
            .option("url", self.mysql_url) \
            .option("dbtable", table_name) \
            .option("user", self.mysql_user) \
            .option("password", self.mysql_pass) \
            .option("driver", "com.mysql.cj.jdbc.Driver") \
            .load()
        # Filtro de seguridad para nulos en columnas críticas si existen
        cols = df.columns
        if "id" in cols: df = df.filter(col("id").isNotNull())
        return df

    def _read_mongo(self, collection_name):
        if not self.spark: return None
        
        # Traducir si existe en el map
        mapped_name = self.TABLE_MAP.get(collection_name, collection_name)
        
        df = self.spark.read.format("mongodb") \
            .option("database", self.mongo_db) \
            .option("collection", mapped_name) \
            .load()
        # Filtro de seguridad para nulos
        if "_id" in df.columns: df = df.filter(col("_id").isNotNull())
        return df

    def _apply_filters(self, df, table_name, filters):
        """Aplica filtros a un DataFrame de Spark."""
        if not filters: return df
        if filters.get("date_from"):
            if "created_at" in df.columns:
                df = df.filter(df.created_at >= filters["date_from"])
        if filters.get("date_to"):
            if "created_at" in df.columns:
                df = df.filter(df.created_at <= filters["date_to"])
        if filters.get("category"):
            if table_name == "tickets" and "ticket_type" in df.columns:
                df = df.filter(df.ticket_type == filters["category"])
        if filters.get("role") or filters.get("access_level"):
            val = filters.get("role") or filters.get("access_level")
            # Mapeo Inteligente: En tickets (600k), el nivel de acceso es 'ticket_type'
            if table_name == "tickets" and "ticket_type" in df.columns:
                df = df.filter(df.ticket_type == val)
            else:
                c = "role" if "role" in df.columns else "access_level" if "access_level" in df.columns else None
                if c: df = df.filter(df[c] == val)
        
        if filters.get("payment_method"):
            if "payment_method" in df.columns:
                df = df.filter(df.payment_method == filters["payment_method"])
        
        if filters.get("hour_range") and "created_at" in df.columns:
            hr = filters["hour_range"]
            df_hour = df.withColumn("h", hour(df.created_at))
            if hr == "morning": df = df_hour.filter((df_hour.h >= 6) & (df_hour.h < 12))
            elif hr == "afternoon": df = df_hour.filter((df_hour.h >= 12) & (df_hour.h < 18))
            elif hr == "night": df = df_hour.filter((df_hour.h >= 18) & (df_hour.h <= 23))
            elif hr == "late_night": df = df_hour.filter((df_hour.h >= 0) & (df_hour.h < 6))

        if filters.get("anomalies_only"):
            # Filtrar por valores que estén por encima de la media + 2 desviaciones estándar (Simplificado en Spark)
            col_target = "price" if "price" in df.columns else "amount" if "amount" in df.columns else None
            if col_target:
                stats = df.select(avg(col_target).alias("mean"), stddev(col_target).alias("std")).collect()[0]
                if stats["mean"] is not None and stats["std"] is not None:
                    threshold = stats["mean"] + (2 * stats["std"])
                    df = df.filter(df[col_target] > threshold)

        return df

    def stop(self):
        if self.spark:
            self.spark.stop()
