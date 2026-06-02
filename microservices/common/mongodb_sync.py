import os
import motor.motor_asyncio
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB", "laika_analytics")

client = None
db = None

def get_mongo_db():
    global client, db
    if client is None and MONGO_URI:
        try:
            sanitized_uri = MONGO_URI.strip('"').strip("'")
            sanitized_db = MONGO_DB.strip('"').strip("'")
            client = motor.motor_asyncio.AsyncIOMotorClient(
                sanitized_uri,
                serverSelectionTimeoutMS=5000,  # Timeout rápido para no bloquear
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                tlsAllowInvalidCertificates=True,
            )
            db = client[sanitized_db]
            print(f"[MONGO SYNC] Configured MongoDB client for: {sanitized_db}")
        except Exception as e:
            print(f"[MONGO SYNC] Error configuring MongoDB client: {e}")
            client = None
            return None
    return db

async def sync_purchase_to_mongo(purchase_data: dict):
    """
    Sincroniza un evento de compra a MongoDB Atlas para análisis.
    Función fire-and-forget: nunca lanza excepción al caller.
    """
    try:
        mongo_db = get_mongo_db()
        if mongo_db is None:
            print("[MONGO SYNC] Skipping sync: no connection configured.")
            return False

        if "synced_at" not in purchase_data:
            purchase_data["synced_at"] = datetime.now().isoformat()

        collection = mongo_db["purchases"]
        result = await collection.insert_one(purchase_data)
        print(f"[MONGO SYNC] Data synced with ID: {result.inserted_id}")
        return True
    except Exception as e:
        # Siempre silencioso: el fallo de analytics NO debe bloquear la compra
        print(f"[MONGO SYNC] Failed to sync data (non-critical): {e}")
        return False
