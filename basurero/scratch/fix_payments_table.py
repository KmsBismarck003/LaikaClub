import pymysql
import os
from dotenv import load_dotenv

def fix_table():
    load_dotenv()
    
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club3')
        )
        
        cursor = conn.cursor()
        
        # Check if reference column exists
        cursor.execute("SHOW COLUMNS FROM payments LIKE 'reference'")
        result = cursor.fetchone()
        
        if not result:
            print("Columna 'reference' no encontrada. Añadiendo...")
            cursor.execute("ALTER TABLE payments ADD COLUMN reference VARCHAR(100) NULL")
            conn.commit()
            print("Columna 'reference' añadida correctamente a la tabla payments.")
        else:
            print("La columna 'reference' ya existe en la tabla payments.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.open:
            conn.close()

if __name__ == "__main__":
    fix_table()
