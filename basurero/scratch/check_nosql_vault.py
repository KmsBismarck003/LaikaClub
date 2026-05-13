import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def check_nosql():
    print("--- NoSQL Diagnostics ---")
    try:
        uri = os.getenv("MONGO_URI", "").strip('"')
        db_name = os.getenv("MONGO_DB", "laika_analytics")
        print(f"Connecting to: {uri[:30]}...")
        
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        db = client[db_name]
        
        # Check metadata
        col_names = db.list_collection_names()
        print(f"Collections: {col_names}")
        
        metadata_exists = "nosql_vault_metadata" in col_names
        print(f"Collection 'nosql_vault_metadata' exists: {metadata_exists}")
        
        if metadata_exists:
            count = db["nosql_vault_metadata"].count_documents({})
            print(f"Records in 'nosql_vault_metadata': {count}")
            
            cursor = db["nosql_vault_metadata"].find().sort("created_at", -1).limit(5)
            for doc in cursor:
                print(f"  - {doc.get('snapshot_id')} | {doc.get('type')} | {doc.get('status')}")
        else:
            print("Creating 'nosql_vault_metadata' with seed data...")
            seed = {
                "snapshot_id": "nosql_snapshot_seed_20260412",
                "created_at": datetime.now(),
                "type": "completo",
                "tables": ["users", "events"],
                "status": "success",
                "total_records": 100
            }
            db["nosql_vault_metadata"].insert_one(seed)
            print("Seed NoSQL metadata created.")
            
        client.close()
    except Exception as e:
        print(f"NoSQL Error: {e}")

if __name__ == "__main__":
    check_nosql()
