import sqlite3
import os
import json

DB_PATH = "microservices/achievements/achievements.db"

def test_sync():
    if not os.path.exists(DB_PATH):
        print("DB non existent")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Clean previous test
    cur.execute("DELETE FROM user_achievements WHERE user_id = 999")
    cur.execute("DELETE FROM user_coupons WHERE user_id = 999")
    
    # Mock tiers (from achievemements.py)
    # We'll just check if the logic in main.py works
    # But I'll simulate it here to see if the DB receives the right data
    
    print("Simulating user 999 with 5 tickets (500 XP)...")
    ticket_count = 5
    
    # TIERS from achievements.py (manual copy for test)
    unlocked = [
        {"tier": 1, "name": "Pasaporte Cósmico", "reward_type": "service_fee", "reward_value": 100, "reward": "Sin cargos de servicio"},
        {"tier": 2, "name": "Ignición: T-Minus 0", "reward_type": "percentage", "reward_value": 15, "reward": "15% de Descuento"},
        {"tier": 3, "name": "Órbita Baja", "reward_type": "percentage", "reward_value": 25, "reward": "25% de Descuento"},
        {"tier": 4, "name": "Alunizaje VIP", "reward_type": "benefit", "reward": "Acceso Preferencial"},
    ]
    
    for t in unlocked:
        cur.execute("INSERT INTO user_achievements (user_id, tier, tier_name) VALUES (?,?,?)", (999, t["tier"], t["name"]))
        if t["reward_type"] in ["percentage", "service_fee"]:
            cur.execute("INSERT INTO user_coupons (user_id, code, discount_type, discount_value, description) VALUES (?,?,?,?,?)", 
                        (999, f"TEST-{t['tier']}", t["reward_type"], t["reward_value"], t["reward"]))

    conn.commit()
    
    # Verify
    cur.execute("SELECT count(*) FROM user_achievements WHERE user_id = 999")
    print(f"Achievements created: {cur.fetchone()[0]}")
    
    cur.execute("SELECT code, discount_value FROM user_coupons WHERE user_id = 999")
    coupons = cur.fetchall()
    print("Coupons generated:")
    for c in coupons:
        print(f" - {c[0]}: {c[1]}%")
    
    conn.close()

if __name__ == "__main__":
    test_sync()
