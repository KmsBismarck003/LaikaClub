import os
import bcrypt
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime

# Patch for bcrypt
if not hasattr(bcrypt, '__about__'):
    try:
        setattr(bcrypt, '__about__', type('About', (), {'__version__': getattr(bcrypt, '__version__', '4.0.0')}))
    except Exception:
        pass

load_dotenv()

def main():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', '127.0.0.1')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
    
    # Force 127.0.0.1
    host = '127.0.0.1'
    
    engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash("gearsof2")
    
    try:
        with engine.connect() as conn:
            # 1. Get all tables
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result]
            
            # 2. Disable FK checks
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
            
            # 3. Truncate all tables
            for table in tables:
                print(f"Truncating {table}...")
                conn.execute(text(f"TRUNCATE TABLE `{table}`"))
            
            # 4. Enable FK checks
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
            
            # 5. Insert users
            users = [
                ("Admin", "Laika", "admin@laikaclub.com", "admin"),
                ("Operador", "Laika", "operador@laikaclub.com", "staff"),
                ("Gestor", "Laika", "gestor@laikaclub.com", "manager")
            ]
            
            for fname, lname, email, role in users:
                print(f"Creating {role} user: {email}")
                conn.execute(text("""
                    INSERT INTO users (first_name, last_name, email, password_hash, role, status, created_at)
                    VALUES (:fname, :lname, :email, :hash, :role, 'active', :now)
                """), {
                    "fname": fname,
                    "lname": lname,
                    "email": email, 
                    "hash": hashed_password,
                    "role": role,
                    "now": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            
            conn.commit()
            print("Successfully cleaned DB and inserted 3 users!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
