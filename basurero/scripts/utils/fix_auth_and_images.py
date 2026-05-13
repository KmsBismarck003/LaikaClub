import os
import pymysql
import sys
from dotenv import load_dotenv

# Asegurar que importamos security correctamente desde microservices.auth.security
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from microservices.auth.security import get_password_hash

load_dotenv()

def fix_system():
    try:
        conn = pymysql.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'laika_club'),
            cursorclass=pymysql.cursors.DictCursor
        )
        c = conn.cursor()

        print("[*] Fixing Passwords...")
        # Restablecer passwords de admin, gestor y usuario a admin123
        hashed_pwd = get_password_hash('admin123')
        
        users_to_fix = ['admin@laikaclub.com', 'gestor@laikaclub.com', 'usuario@laikaclub.com']
        
        for email in users_to_fix:
            c.execute("""
                UPDATE users 
                SET password_hash=%s, failed_attempts=0, lockout_until=NULL, status='active'
                WHERE email=%s
            """, (hashed_pwd, email))
            print(f"    -> Reset {email} password to 'admin123', unlocked account.")

        print("[*] Fixing Event Images...")
        # Añadir imágenes genéricas de alta calidad a los eventos que no tienen
        placeholders = [
            "https://images.unsplash.com/photo-1540039155732-6761b54cbaca?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
        ]

        c.execute("SELECT id FROM events WHERE image_url IS NULL OR image_url = ''")
        events = c.fetchall()
        
        if events:
            import random
            count = 0
            for event in events:
                img = random.choice(placeholders)
                c.execute("UPDATE events SET image_url=%s WHERE id=%s", (img, event['id']))
                count += 1
            print(f"    -> Added placeholder images to {count} events.")
        else:
            print("    -> All events already have images.")

        conn.commit()
        conn.close()
        print("\n[SUCCESS] Fix applied. You can log in using 'admin123'.")
    except Exception as e:
        print(f"[-] Error applying fixes: {e}")

if __name__ == "__main__":
    fix_system()
