
import sqlite3
import os
from pathlib import Path
from decimal import Decimal

DB_PATH = Path("microservices/merchandise/merchandise.db")

PRODUCTS = [
    # DISCOS (Vinyls / CDs)
    ("Vinyl Collector: 'After Hours' Red Edition", "Vinilo translúcido rojo, edición de coleccionista con arte exclusivo.", "Vinyls", 850.00, "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800"),
    ("CD Autografiado: Laika Anniversary", "Copia física firmada por el staff artístico de Laika Club.", "Vinyls", 450.00, "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800"),
    
    # GORRAS (Caps)
    ("Gorra Trucker: 'Industrial Red'", "Gorra con malla transpirable y bordado de alta densidad.", "Gorras", 299.00, "https://images.unsplash.com/photo-1588850561407-ed78c282e881?w=800"),
    ("Beanie Chrome: Winter Session", "Gorro de lana con parche metálico reflectante.", "Gorras", 250.00, "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800"),
    
    # TAZAS / VASOS (Mugs / Cups)
    ("Taza de Cerámica: Minimalist Black", "Taza mate con logo grabado en bajo relieve.", "Tazas", 180.00, "https://images.unsplash.com/photo-1517256010-52f05a72d48b?w=800"),
    ("Termo Industrial: 24h Cold", "Vaso de acero inoxidable con aislamiento térmico de doble capa.", "Vasos", 550.00, "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?w=800"),
    
    # PLAYERAS (T-shirts)
    ("Playera 'Staff Access' Oversize", "Corte holgado, algodón 240g, estampado en serigrafía puff.", "Playeras", 380.00, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
    ("Tee 'Sonic Wave' Reflectiva", "Estampado que brilla bajo la luz UV de los conciertos.", "Playeras", 420.00, "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800"),
    
    # LLAVEROS (Keychains)
    ("Llavero de Acrílico: Logo Laika", "Corte láser con efecto iridiscente.", "Llaveros", 85.00, "https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800"),
    
    # STICKERS
    ("Pack Stickers: 'Glow in Dark'", "Colección de 10 stickers resistentes al agua y sol.", "Stickers", 120.00, "https://images.unsplash.com/photo-1572375927501-44447e533464?w=800"),
    
    # POSTERS
    ("Poster Litografía: 'Main Stage'", "Impresión de alta calidad en papel galería 300g.", "Poster", 250.00, "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800")
]

def seed():
    print(f"--- Seeding Merchandise at {DB_PATH} ---")
    if not DB_PATH.exists():
        print("Error: merchandise.db not found. Run main service first.")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Clean old data if desired (optional, here we append or update)
        cursor.execute("DELETE FROM merchandise_variants")
        cursor.execute("DELETE FROM merchandise_items")
        cursor.execute("DELETE FROM merchandise_settings")
        
        # 1. Settings
        cursor.execute("""
            INSERT INTO merchandise_settings (manager_id, is_enabled, activation_fee_paid, commission_percentage, updated_at)
            VALUES (1, 1, 1, 10.0, '2026-04-12 00:00:00')
        """)

        # 2. Products
        for name, desc, cat, price, img in PRODUCTS:
            cursor.execute("""
                INSERT INTO merchandise_items (name, description, image_url, manager_id, category, is_official, rating, status, created_at, updated_at)
                VALUES (?, ?, ?, 1, ?, 1, 5.0, 'published', '2026-04-12 00:00:00', '2026-04-12 00:00:00')
            """, (name, desc, img, cat))
            
            item_id = cursor.lastrowid
            
            # Simple variant for each
            sku = f"{cat[:2].upper()}-{item_id}-01"
            cursor.execute("""
                INSERT INTO merchandise_variants (item_id, sku, size, color, price, stock, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, '2026-04-12 00:00:00', '2026-04-12 00:00:00')
            """, (item_id, sku, "Estándar", "Único", price, 100))

        conn.commit()
        print(f"Successfully seeded {len(PRODUCTS)} premium products.")
        
        # Verify counts
        cursor.execute("SELECT category, COUNT(*) FROM merchandise_items GROUP BY category")
        for row in cursor.fetchall():
            print(f"Category {row[0]}: {row[1]} items")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed()
