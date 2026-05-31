import pymysql
from pymongo import MongoClient
from datetime import datetime, timedelta

class VaultModule:
    """Módulo de Bóveda NoSQL: Backups, Sincronización y Restauración."""
    
    def sync_mysql_to_mongo(self, backup_type="completo", tables_to_sync=None):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_id = f"nosql_snapshot_{timestamp}"
        results = {}
        tables = tables_to_sync if tables_to_sync else ["tickets", "users", "payments", "events"]
        
        if self.resilience_mode:
            return self._sync_lightweight(backup_type, tables, snapshot_id)
        
        try:
            client = MongoClient(self.mongo_uri)
            mongo_db = client[self.mongo_db]
            
            for table in tables:
                df = self._read_mysql(table)
                if backup_type == "incremental":
                    filter_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
                    if "created_at" in df.columns: df = df.filter(df.created_at >= filter_date)
                
                df.write.format("mongodb") \
                    .option("database", self.mongo_db) \
                    .option("collection", snapshot_id) \
                    .mode("append").save()
                results[table] = {"status": "Capturado", "records": df.count()}
            
            mongo_db["nosql_vault_metadata"].insert_one({
                "snapshot_id": snapshot_id,
                "created_at": datetime.now(),
                "type": backup_type,
                "tables": tables,
                "status": "success",
                "total_records": sum(r["records"] for r in results.values())
            })
            return {"status": "success", "snapshot_id": snapshot_id, "synced_tables": results, "timestamp": datetime.now().isoformat()}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _sync_lightweight(self, backup_type, tables, snapshot_id):
        results = {}
        try:
            mysql_conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)
            client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True)
            mongo_db = client[self.mongo_db]
            
            with mysql_conn.cursor() as cursor:
                for table in tables:
                    cursor.execute(f"SHOW COLUMNS FROM {table}")
                    columns = [c['Field'] for c in cursor.fetchall()]
                    query = f"SELECT * FROM {table}"
                    if backup_type == "incremental":
                        if "created_at" in columns: query += " WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
                    
                    cursor.execute(query)
                    rows = cursor.fetchall()
                    if rows: mongo_db[snapshot_id].insert_many(rows)
                    results[table] = {"status": "Capturado (Ligero)", "records": len(rows)}
            
            mongo_db["nosql_vault_metadata"].insert_one({
                "snapshot_id": snapshot_id, "created_at": datetime.now(), "type": f"{backup_type} (Direct)", "tables": tables, "status": "success", "total_records": sum(r["records"] for r in results.values())
            })
            return {"status": "success", "snapshot_id": snapshot_id, "method": "Lightweight Sync", "synced_tables": results, "timestamp": datetime.now().isoformat()}
        except Exception as e:
            return {"status": "error", "message": f"Fallo en motor ligero: {str(e)}"}
        finally:
            if 'mysql_conn' in locals(): mysql_conn.close()

    def list_nosql_snapshots(self):
        try:
            client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
            db = client[self.mongo_db]
            metadata = list(db["nosql_vault_metadata"].find({}, {"_id": 0}).sort("created_at", -1))
            if not metadata: return self._fallback_list_snapshots(db)
            
            formatted = []
            for m in metadata:
                formatted.append({
                    "id": m["snapshot_id"],
                    "created_at": m["created_at"].isoformat() if isinstance(m["created_at"], datetime) else m["created_at"],
                    "type": m.get("type", "completo").upper(),
                    "size_docs": m.get("total_records", 0),
                    "status": m.get("status", "success")
                })
            return formatted
        except: return []

    def _fallback_list_snapshots(self, db):
        collections = db.list_collection_names()
        snapshots = []
        for name in collections:
            if name.startswith("nosql_snapshot_"):
                snapshots.append({"id": name, "created_at": name.replace("nosql_snapshot_", "").replace("_", " "), "type": "COMPLETO", "size_docs": db[name].count_documents({})})
        return sorted(snapshots, key=lambda x: x['id'], reverse=True)

    def delete_nosql_snapshot(self, snapshot_id):
        try:
            client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True)
            db = client[self.mongo_db]
            db.drop_collection(snapshot_id)
            return {"status": "success", "message": f"Snapshot {snapshot_id} eliminado"}
        except Exception as e: return {"status": "error", "message": str(e)}

    def restore_nosql_snapshot(self, snapshot_id):
        if self.resilience_mode: return self._restore_lightweight(snapshot_id)
        try:
            client = MongoClient(self.mongo_uri)
            db = client[self.mongo_db]
            meta = db["nosql_vault_metadata"].find_one({"snapshot_id": snapshot_id})
            tables = meta.get("tables", ["tickets", "users", "payments", "events"]) if meta else ["tickets", "users", "payments", "events"]
            
            for table in tables:
                df = self.spark.read.format("mongodb").option("database", self.mongo_db).option("collection", snapshot_id).load()
                df.write.format("jdbc").option("url", self.mysql_url).option("dbtable", table).option("user", self.mysql_user).option("password", self.mysql_pass).option("driver", "com.mysql.cj.jdbc.Driver").mode("overwrite").save()
            return {"status": "success", "message": f"Restauración de {snapshot_id} completada vía Spark"}
        except: return self._restore_lightweight(snapshot_id)

    def _restore_lightweight(self, snapshot_id):
        try:
            client = MongoClient(self.mongo_uri, tlsAllowInvalidCertificates=True)
            mongo_db = client[self.mongo_db]
            mysql_conn = pymysql.connect(host=self.mysql_host, user=self.mysql_user, password=self.mysql_pass, database=self.mysql_db, charset="utf8mb4")
            data = list(mongo_db[snapshot_id].find({}, {"_id": 0}))
            if not data: return {"status": "error", "message": "Snapshot vacío o no encontrado"}
            
            meta = mongo_db["nosql_vault_metadata"].find_one({"snapshot_id": snapshot_id})
            tables = meta.get("tables", ["tickets"]) if meta else ["tickets"]

            with mysql_conn.cursor() as cursor:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                for table in tables:
                    cursor.execute(f"TRUNCATE TABLE {table}")
                    if not data: continue
                    cols = data[0].keys()
                    placeholders = ", ".join(["%s"] * len(cols))
                    columns_str = ", ".join(cols)
                    insert_query = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
                    vals = [tuple(row.values()) for row in data]
                    cursor.executemany(insert_query, vals)
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
            mysql_conn.commit()
            mysql_conn.close()
            return {"status": "success", "message": f"Restauración manual de {snapshot_id} exitosa"}
        except Exception as e: return {"status": "error", "message": str(e)}
