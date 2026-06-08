import os
import sys
import sqlite3
import pymysql
import random
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Safe encoding for Windows console output
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# Text Pools for Realistic Spanish Comments
COMMENTS_BY_CATEGORY = {
    "ropa": {
        5: [
            "Excelente calidad, la tela se siente súper suave y cómoda.",
            "Me encantó el diseño de la playera, queda perfecta de mi talla.",
            "La sudadera está increíble, muy abrigadora y el estampado es premium.",
            "Súper recomendada. La calidad del algodón es muy buena y el color es firme.",
            "Muy bonita prenda, el bordado está muy bien hecho y luce genial."
        ],
        4: [
            "La tela está bien y el diseño me gusta mucho, aunque viene un poco ajustada.",
            "Buen producto, el estampado se ve duradero. Tardó un día más de lo esperado.",
            "Me gustó bastante, la tela es algo delgada pero ideal para el clima templado.",
            "Buen diseño y acabados decentes. Cumple muy bien por el precio."
        ],
        3: [
            "El diseño está chido, pero la tela se siente algo áspera al principio.",
            "Está regular, la talla viene un poco reducida, sugiero pedir una más.",
            "El estampado es bueno pero la playera es algo sencilla. Cumple."
        ],
        2: [
            "No me gustó mucho la calidad, se siente muy sintética la tela.",
            "El estampado vino un poco descolorido. No me convenció."
        ],
        1: [
            "Pésima calidad, se encogió demasiado en la primera lavada y se despintó.",
            "Muy corriente la tela para el costo que tiene. No la recomiendo."
        ]
    },
    "vasos": {
        5: [
            "Mantiene las bebidas frías por muchísimo tiempo, excelente termo.",
            "Me encantó el termo, el color mate y el grabado se ven muy premium.",
            "Muy buen tamaño y no derrama nada. Súper práctico para llevar a todos lados.",
            "Excelente calidad de acero inoxidable. Muy satisfecho con la compra.",
            "El termo está increíble, conserva el calor de mi café todo el día."
        ],
        4: [
            "Muy buen producto, conserva bien la temperatura. La tapa cuesta un poco cerrarla.",
            "El diseño está padrísimo, aunque el popote se siente un poco frágil.",
            "Buen vaso, no gotea nada y la pintura parece resistente."
        ],
        3: [
            "Funciona bien, pero siento que no dura las 24 horas frío como dice.",
            "Está bonito el termo pero se raya muy fácil con el uso diario.",
            "Cumple su función, pero el tamaño real es un poco menor de lo que esperaba."
        ],
        2: [
            "No conserva el calor por más de dos horas. Calidad regular.",
            "El sistema de la tapa gotea un poco al inclinar el termo."
        ],
        1: [
            "Llegó golpeado y con la pintura descarapelada. Muy mal control de calidad.",
            "No sirve para mantener bebidas frías, transpira todo el vaso."
        ]
    },
    "accesorios": {
        5: [
            "La gorra está espectacular, los materiales se sienten de primera y el bordado de 10.",
            "El llavero metálico tiene muy buen peso y acabados excelentes. Muy duradero.",
            "La mochila es ligera pero resistente, ideal para llevar lo necesario al festival.",
            "Muy bonito accesorio, el diseño está muy bien detallado y original.",
            "Me sorprendió la calidad de los materiales, vale cada centavo."
        ],
        4: [
            "Gorra muy chida, se ajusta perfecto. El color es un poco más opaco que en la foto.",
            "Mochila muy práctica, le caben bastantes cosas. Los cierres se sienten algo sencillos.",
            "Llavero de buena calidad, muy resistente. Luce muy bien en mis llaves."
        ],
        3: [
            "El accesorio cumple, aunque el precio me parece un poco elevado para lo que es.",
            "Está bien, pero la correa de la mochila es algo delgada.",
            "Es funcional pero el tamaño es más pequeño de lo que imaginaba."
        ],
        2: [
            "Se siente un poco corriente el material de plástico de la gorra.",
            "La mochila se descosió de un tirante a las pocas semanas de uso."
        ],
        1: [
            "Se rompió en el primer uso. Materiales extremadamente frágiles.",
            "Pésimo producto, no corresponde con las fotos mostradas en la tienda."
        ]
    },
    "boletos": {
        5: [
            "El pase VIP llegó rápido y el holograma de seguridad se ve increíble.",
            "Excelente credencial coleccionable, la presentación es de primer nivel.",
            "Muy buena atención en el pickup del evento. Súper recomendado.",
            "Excelente souvenir del backstage, valió totalmente la pena conseguirlo."
        ],
        4: [
            "Muy bonito recuerdo del evento, bien impreso y con buen material.",
            "Todo en orden con la entrega. Un pase coleccionable muy padre."
        ],
        3: [
            "El pase está bien impreso pero es de cartón sencillo. Esperaba algo de plástico.",
            "Cumple como recuerdo, aunque el proceso para recogerlo en el evento fue tardado."
        ],
        2: [
            "Muy sencillo el acabado para el costo que tiene el pase especial."
        ],
        1: [
            "No me entregaron el pase físico prometido y no me dieron respuesta. Pésimo."
        ]
    },
    "coleccionables": {
        5: [
            "El póster holográfico está bellísimo, la calidad de impresión es impecable.",
            "Llegó perfectamente protegido en su tubo de cartón. Coleccionable de 10.",
            "El boleto metálico tiene un nivel de detalle impresionante. Una joya.",
            "Excelente set de stickers, el adhesivo es muy fuerte y los diseños geniales."
        ],
        4: [
            "Muy buena calidad del póster, aunque la medida es un poco difícil de enmarcar.",
            "Stickers muy padres y resistentes al agua. Todo bien."
        ],
        3: [
            "Está bonito el boleto metálico, pero venía con un ligero rayón en la parte trasera.",
            "Los stickers están bien pero me llegaron repetidos algunos diseños."
        ],
        2: [
            "El papel del póster es muy delgado, se arruga con demasiada facilidad."
        ],
        1: [
            "Llegó todo doblado y arrugado por mal empaque. Solicité devolución inmediatamente."
        ]
    },
    "general": {
        5: [
            "Excelente producto, muy recomendado.",
            "Me encantó la calidad de los materiales y el diseño.",
            "Excelente compra. Cumple con todo lo prometido.",
            "Súper recomendado, gran servicio y entrega rápida."
        ],
        4: [
            "Muy buen producto, buena relación calidad-precio.",
            "Llegó en tiempo y forma, de buena calidad en general.",
            "Cumple con su función y se ve bastante bien."
        ],
        3: [
            "Producto aceptable, no destaca pero cumple con su propósito.",
            "Está bien por el precio, pero podría mejorar en los acabados."
        ],
        2: [
            "La calidad deja algo que desear, se siente de materiales económicos.",
            "No me gustó mucho cómo se ve en persona."
        ],
        1: [
            "Mala calidad, no lo recomiendo para nada.",
            "No sirve, se dañó muy rápido."
        ]
    }
}

def get_comment(category, rating):
    cat_comments = COMMENTS_BY_CATEGORY.get(category, COMMENTS_BY_CATEGORY["general"])
    rating_comments = cat_comments.get(rating, COMMENTS_BY_CATEGORY["general"][rating])
    return random.choice(rating_comments)

def generate_random_date():
    start = datetime(2026, 1, 1)
    end = datetime(2026, 6, 7)
    delta = end - start
    random_days = random.randint(0, delta.days)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    random_seconds = random.randint(0, 59)
    return start + timedelta(days=random_days, hours=random_hours, minutes=random_minutes, seconds=random_seconds)

def main():
    print("=== SEEDING MERCHANDISE PURCHASES AND REVIEWS ===")
    
    mysql_host = os.getenv("MYSQL_HOST", "localhost")
    mysql_user = os.getenv("MYSQL_USER", "root")
    mysql_pass = os.getenv("MYSQL_PASSWORD", "")
    mysql_db = os.getenv("MYSQL_DATABASE", "laika_club3_v2")
    sqlite_db_path = "microservices/merchandise/merchandise.db"
    
    mysql_conn = None
    try:
        mysql_conn = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password="root" if not mysql_pass else mysql_pass,
            database=mysql_db,
            charset="utf8mb4"
        )
        print("Connected to MySQL successfully!")
    except Exception as e:
        print(f"Failed to connect to MySQL: {e}")
        return
        
    sqlite_conn = None
    try:
        sqlite_conn = sqlite3.connect(sqlite_db_path)
        print("Connected to SQLite successfully!")
    except Exception as e:
        print(f"Failed to connect to SQLite: {e}")
        
    mysql_cur = mysql_conn.cursor()
    
    print("Fetching users with role 'usuario' from MySQL...")
    mysql_cur.execute("SELECT id, first_name, last_name FROM users WHERE role = 'usuario'")
    users = mysql_cur.fetchall()
    print(f"Fetched {len(users)} users.")
    
    if not users:
        print("Error: No users found in MySQL.")
        mysql_conn.close()
        if sqlite_conn:
            sqlite_conn.close()
        return
        
    def clean_tables(conn, is_sqlite=False):
        cur = conn.cursor()
        print(f"Cleaning tables (is_sqlite={is_sqlite})...")
        try:
            if is_sqlite:
                cur.execute("DELETE FROM merchandise_order_items")
                cur.execute("DELETE FROM merchandise_reviews")
                cur.execute("DELETE FROM merchandise_orders")
                cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('merchandise_order_items', 'merchandise_reviews', 'merchandise_orders')")
            else:
                cur.execute("SET FOREIGN_KEY_CHECKS = 0")
                cur.execute("TRUNCATE TABLE merchandise_order_items")
                cur.execute("TRUNCATE TABLE merchandise_reviews")
                cur.execute("TRUNCATE TABLE merchandise_orders")
                cur.execute("SET FOREIGN_KEY_CHECKS = 1")
            conn.commit()
            print("Clean completed successfully.")
        except Exception as e:
            print(f"Error during cleanup: {e}")
            conn.rollback()

    clean_tables(mysql_conn, is_sqlite=False)
    if sqlite_conn:
        clean_tables(sqlite_conn, is_sqlite=True)

    commissions = {}
    mysql_cur.execute("SELECT manager_id, commission_percentage FROM merchandise_settings")
    for r in mysql_cur.fetchall():
        commissions[r[0]] = float(r[1])
        
    def process_seeding(conn, db_name_str, is_sqlite=False):
        cur = conn.cursor()
        print(f"\n--- Seeding Database: {db_name_str} ---")
        
        cur.execute("SELECT id, name, category, manager_id FROM merchandise_items")
        items_db = cur.fetchall()
        
        cur.execute("SELECT id, item_id, price, stock, sku FROM merchandise_variants")
        variants_db = cur.fetchall()
        
        variants_by_item = {}
        for v in variants_db:
            item_id = v[1]
            if item_id not in variants_by_item:
                variants_by_item[item_id] = []
            variants_by_item[item_id].append({
                "id": v[0],
                "price": float(v[2]),
                "stock": int(v[3]),
                "sku": v[4]
            })
            
        print(f"Found {len(items_db)} items and {len(variants_db)} variants.")
        
        orders_to_insert = []
        order_items_to_insert = []
        reviews_to_insert = []
        variant_stocks_to_update = {}
        item_ratings_to_update = {}
        mongo_purchases_to_sync = []
        
        order_counter = 1
        
        for item in items_db:
            item_id, item_name, category, manager_id = item
            item_variants = variants_by_item.get(item_id, [])
            if not item_variants:
                continue
                
            commission_percent = commissions.get(manager_id, 10.00)
            purchased_users = []
            
            for var in item_variants:
                var_id = var["id"]
                price = var["price"]
                
                # Reseed to a fresh simulated starting stock
                initial_stock = random.randint(120, 180)
                num_purchases = random.randint(12, 25)
                total_purchased_quantity = 0
                
                for _ in range(num_purchases):
                    user = random.choice(users)
                    user_id, first, last = user
                    user_name = f"{first} {last}"
                    
                    quantity = random.choice([1, 1, 1, 2])
                    total_purchased_quantity += quantity
                    
                    if (user_id, user_name) not in purchased_users:
                        purchased_users.append((user_id, user_name))
                        
                    purchase_date = generate_random_date()
                    purchase_date_str = purchase_date.strftime("%Y-%m-%d %H:%M:%S")
                    
                    payment_method = random.choices(
                        ["card", "paypal", "oxxo", "transfer"],
                        weights=[60, 20, 10, 10]
                    )[0]
                    
                    total_amount = price * quantity
                    commission = total_amount * (commission_percent / 100.0)
                    net_amount = total_amount - commission
                    idempotency_key = f"MCH-IDMP-{uuid.uuid4().hex[:12].upper()}"
                    
                    orders_to_insert.append({
                        "temp_id": order_counter,
                        "user_id": user_id,
                        "total_amount": total_amount,
                        "total_commission": commission,
                        "net_amount": net_amount,
                        "status": "completed",
                        "payment_method": payment_method,
                        "created_at": purchase_date_str,
                        "idempotency_key": idempotency_key
                    })
                    
                    order_items_to_insert.append({
                        "temp_order_id": order_counter,
                        "variant_id": var_id,
                        "quantity": quantity,
                        "unit_price": price
                    })
                    
                    if not is_sqlite:
                        mongo_purchases_to_sync.append({
                            "temp_order_id": order_counter,
                            "user_id": user_id,
                            "total_amount": float(total_amount),
                            "total_commission": float(commission),
                            "net_amount": float(net_amount),
                            "payment_method": payment_method,
                            "status": "completed",
                            "purchase_date": purchase_date.isoformat(),
                            "items": [{"variant_id": var_id, "quantity": quantity}],
                            "type": "merchandise_purchase"
                        })
                    
                    order_counter += 1
                
                remaining_stock = initial_stock - total_purchased_quantity
                if remaining_stock <= 0:
                    remaining_stock = random.randint(15, 30)
                variant_stocks_to_update[var_id] = remaining_stock
                
            # Create reviews
            num_reviews = min(len(purchased_users), random.randint(3, 7))
            if num_reviews > 0:
                reviewers = random.sample(purchased_users, num_reviews)
                ratings = []
                for reviewer in reviewers:
                    r_user_id, r_user_name = reviewer
                    rating = random.choices([5, 4, 3, 2, 1], weights=[55, 30, 10, 3, 2])[0]
                    ratings.append(rating)
                    comment = get_comment(category, rating)
                    review_date = generate_random_date()
                    review_date_str = review_date.strftime("%Y-%m-%d %H:%M:%S")
                    reviews_to_insert.append((
                        item_id, r_user_id, r_user_name, rating, comment, review_date_str
                    ))
                avg_rating = round(sum(ratings) / len(ratings), 1)
                item_ratings_to_update[item_id] = avg_rating
            else:
                item_ratings_to_update[item_id] = 0.0

        print(f"Inserting {len(orders_to_insert)} orders...")
        real_order_id_map = {}
        for order in orders_to_insert:
            if is_sqlite:
                cur.execute("""
                    INSERT INTO merchandise_orders (user_id, total_amount, total_commission, net_amount, status, payment_method, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (order["user_id"], order["total_amount"], order["total_commission"], order["net_amount"], order["status"], order["payment_method"], order["created_at"]))
            else:
                cur.execute("""
                    INSERT INTO merchandise_orders (user_id, total_amount, total_commission, net_amount, status, payment_method, created_at, idempotency_key)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (order["user_id"], order["total_amount"], order["total_commission"], order["net_amount"], order["status"], order["payment_method"], order["created_at"], order["idempotency_key"]))
            real_id = cur.lastrowid
            real_order_id_map[order["temp_id"]] = real_id
            
        print(f"Inserting {len(order_items_to_insert)} order items...")
        items_data = []
        for oi in order_items_to_insert:
            real_oid = real_order_id_map[oi["temp_order_id"]]
            items_data.append((real_oid, oi["variant_id"], oi["quantity"], oi["unit_price"]))
            
        if is_sqlite:
            cur.executemany("""
                INSERT INTO merchandise_order_items (order_id, variant_id, quantity, unit_price)
                VALUES (?, ?, ?, ?)
            """, items_data)
        else:
            cur.executemany("""
                INSERT INTO merchandise_order_items (order_id, variant_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """, items_data)
            
        print(f"Inserting {len(reviews_to_insert)} reviews...")
        if is_sqlite:
            cur.executemany("""
                INSERT INTO merchandise_reviews (item_id, user_id, user_name, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, reviews_to_insert)
        else:
            cur.executemany("""
                INSERT INTO merchandise_reviews (item_id, user_id, user_name, rating, comment, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, reviews_to_insert)
            
        print("Updating variant stocks...")
        for var_id, stock in variant_stocks_to_update.items():
            if is_sqlite:
                cur.execute("UPDATE merchandise_variants SET stock = ? WHERE id = ?", (stock, var_id))
            else:
                cur.execute("UPDATE merchandise_variants SET stock = %s WHERE id = %s", (stock, var_id))
                
        print("Updating item average ratings...")
        for item_id, rating in item_ratings_to_update.items():
            if is_sqlite:
                cur.execute("UPDATE merchandise_items SET rating = ? WHERE id = ?", (rating, item_id))
            else:
                cur.execute("UPDATE merchandise_items SET rating = %s WHERE id = %s", (rating, item_id))
                
        conn.commit()
        print(f"Database {db_name_str} seeded successfully!")
        
        if not is_sqlite:
            real_mongo_docs = []
            for doc in mongo_purchases_to_sync:
                temp_id = doc.pop("temp_order_id")
                doc["order_id"] = real_order_id_map[temp_id]
                real_mongo_docs.append(doc)
            return real_mongo_docs
        return []

    mongo_docs = process_seeding(mysql_conn, "MySQL (laika_club3_v2)", is_sqlite=False)
    if sqlite_conn:
        process_seeding(sqlite_conn, "SQLite (merchandise.db)", is_sqlite=True)

    if mongo_docs:
        print("\nAttempting to sync purchases to MongoDB Atlas...")
        sync_to_mongo(mongo_docs)
        
    mysql_conn.close()
    if sqlite_conn:
        sqlite_conn.close()
    print("\n=== SEEDING COMPLETED SUCCESSFULLY ===")

def sync_to_mongo(mongo_docs):
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB", "laika_analytics")
    if not mongo_uri:
        print("[MONGO] MONGO_URI not found. Skipping sync.")
        return
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        client.server_info()
        db = client[db_name]
        coll = db["purchases"]
        
        result_del = coll.delete_many({"type": "merchandise_purchase"})
        print(f"[MONGO] Deleted {result_del.deleted_count} old merchandise purchases.")
        
        batch_size = 5000
        for i in range(0, len(mongo_docs), batch_size):
            coll.insert_many(mongo_docs[i:i+batch_size])
            print(f"  Synced documents {i} to {min(i+batch_size, len(mongo_docs))}...")
        print("[MONGO] MongoDB Atlas synchronization completed successfully.")
    except Exception as e:
        print(f"[MONGO] MongoDB Atlas synchronization failed: {e}")

if __name__ == "__main__":
    main()
