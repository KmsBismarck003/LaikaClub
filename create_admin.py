import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import bcrypt

# Patch for bcrypt
if not hasattr(bcrypt, '__about__'):
    try:
        setattr(bcrypt, '__about__', type('About', (), {'__version__': getattr(bcrypt, '__version__', '4.0.0')}))
    except Exception:
        pass

from passlib.context import CryptContext
from datetime import datetime

load_dotenv()

def main():
    email = "al222310350@gmail.com"
    password = "gearsof3"
    
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', '127.0.0.1')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3')
    
    # Force localhost or 127.0.0.1 since we are running locally outside of docker
    host = '127.0.0.1' 
    
    engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(password)
    
    try:
        with engine.connect() as conn:
            # Check if user exists
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).fetchone()
            
            if result:
                print(f"Updating existing user: {email}")
                conn.execute(text("""
                    UPDATE users 
                    SET password_hash = :hash, role = 'admin', status = 'active'
                    WHERE email = :email
                """), {"hash": hashed_password, "email": email})
            else:
                print(f"Creating new admin user: {email}")
                conn.execute(text("""
                    INSERT INTO users (first_name, last_name, email, password_hash, role, status, created_at)
                    VALUES ('Admin', 'Laika', :email, :hash, 'admin', 'active', :now)
                """), {
                    "email": email, 
                    "hash": hashed_password,
                    "now": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            
            conn.commit()
            print("Successfully granted admin credentials!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
