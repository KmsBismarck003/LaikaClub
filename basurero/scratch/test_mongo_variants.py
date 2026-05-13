import os
import sys
import io
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

def test_connection(name, **kwargs):
    print(f"\n--- Testing: {name} ---")
    uri = os.getenv("MONGO_URI", "").strip('"')
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, **kwargs)
        client.admin.command('ping')
        print(f"[OK] {name} successful!")
        return True
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return False

if __name__ == "__main__":
    test_connection("Default (from URI)")
    test_connection("With certifi", tlsCAFile=certifi.where())
    test_connection("Allow Invalid Certs", tlsAllowInvalidCertificates=True)
    test_connection("Both certifi and Allow Invalid", tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    
    # Try non-srv if we can parse it (Manual reconstruction for testing)
    # mongodb+srv://user:pass@host/db -> mongodb://user:pass@host/?ssl=true...
    # But host is different for non-srv. Shards are usually:
    # cluster-shard-00-00.mongodb.net:27017, etc.
