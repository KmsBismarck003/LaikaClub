import pymysql
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import bcrypt
if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('About', (), {'__version__': bcrypt.__version__})

def reset_admin_password():
    load_dotenv()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    new_password = "admin123"
    hashed_password = pwd_context.hash(new_password)

    conn = pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', ''),
        database=os.getenv('MYSQL_DATABASE', 'laika_club')
    )
    cursor = conn.cursor()
    
    # Reset admin password and ensure status is active
    sql = "UPDATE users SET password_hash = %s, status = 'active', failed_attempts = 0, lockout_until = NULL WHERE email = 'admin@laikaclub.com'"
    cursor.execute(sql, (hashed_password,))
    
    if cursor.rowcount > 0:
        print(f"[AUTH_FIX] Password for admin@laikaclub.com reset to: {new_password}")
    else:
        print("[AUTH_FIX] Admin account not found!")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    reset_admin_password()
