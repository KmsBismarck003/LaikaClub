import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def check_mysql():
    print("--- Checking MySQL ---")
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', 'localhost')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club')
    
    url = f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}"
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            res = conn.execute(text("SHOW TABLES"))
            tables = [r[0] for r in res.fetchall()]
            print(f"Tables in {dbname}: {tables}")
            
            if 'backup_history' in tables:
                res = conn.execute(text("SELECT COUNT(*) FROM backup_history"))
                count = res.scalar()
                print(f"Rows in backup_history: {count}")
            else:
                print("Table 'backup_history' MISSING!")
    except Exception as e:
        print(f"MySQL Error: {e}")

def check_mongo():
    print("\n--- Checking MongoDB ---")
    uri = os.getenv("MONGO_URI", "").strip('"')
    if not uri:
        print("MONGO_URI not set!")
        return
        
    from pymongo import MongoClient
    try:
        import certifi
        client = MongoClient(
            uri, 
            serverSelectionTimeoutMS=5000, 
            tlsCAFile=certifi.where()
        )
        # Try a ping
        client.admin.command('ping')
        print("MongoDB Atlas connection: OK")
        
        db_name = os.getenv("MONGO_DB", "laika_analytics")
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"Collections in {db_name}: {collections}")
    except Exception as e:
        print(f"MongoDB Error: {e}")

if __name__ == "__main__":
    check_mysql()
    check_mongo()
