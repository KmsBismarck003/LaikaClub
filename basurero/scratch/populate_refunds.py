import sqlite3
import random
import datetime
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TICKETS_DB = os.path.join(BASE_DIR, "microservices/tickets/tickets.db")

def add_refunds():
    print("--- INICIANDO INYECCIÓN DE REEMBOLSOS ---")
    conn = sqlite3.connect(TICKETS_DB)
    cur = conn.cursor()
    
    # Obtener tickets activos para reembolsar
    cur.execute("SELECT id, user_id, event_id, price FROM tickets WHERE status='active' LIMIT 500")
    tickets = cur.fetchall()
    
    refund_reasons = ["Error en la compra", "Cancelación del cliente", "Duplicado", "Cambio de planes", "Queja de servicio"]
    refund_statuses = ["pending", "approved", "rejected"]
    
    refund_batch = []
    for t_id, u_id, e_id, price in tickets:
        reason = random.choice(refund_reasons)
        status = random.choice(refund_statuses)
        created_at = (datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30))).isoformat()
        refund_batch.append((u_id, t_id, e_id, price, reason, "Simulado por inyección masiva", status, created_at))
        
    cur.executemany("""
        INSERT INTO refund_requests (user_id, ticket_id, event_id, amount, reason, detail, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, refund_batch)
    
    conn.commit()
    conn.close()
    print(f"500 solicitudes de reembolso inyectadas con éxito.")

if __name__ == "__main__":
    add_refunds()
