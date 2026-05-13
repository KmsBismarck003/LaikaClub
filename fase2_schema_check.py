import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def main():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', '127.0.0.1')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
    
    host = '127.0.0.1'
    engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            print("Tables:", tables)
            
            for table in tables:
                if 'venue' in table or 'room' in table or 'countr' in table or 'stat' in table or 'muni' in table or 'pack' in table or 'zone' in table or 'seat' in table or 'grid' in table or 'event' in table:
                    print(f"\n--- Schema for {table} ---")
                    try:
                        res = conn.execute(text(f"SHOW CREATE TABLE {table}"))
                        for row in res:
                            print(row[1])
                    except Exception as e:
                        print("Error showing create table:", e)
                        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
