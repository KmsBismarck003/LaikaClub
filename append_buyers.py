import os

file_path = r'c:\Users\redja\Music\entorno laika\PruebaJava\LaikaClub\microservices\analytics_bigdata\matis\executive\router.py'
with open(file_path, 'a', encoding='utf-8') as f:
    f.write('''

@router.get("/ticket-buyers")
def get_ticket_buyers():
    try:
        query = """
            SELECT u.id, u.name, u.email, COUNT(t.id) as tickets_bought, SUM(t.price) as total_spent
            FROM users u
            JOIN tickets t ON u.id = t.user_id
            WHERE t.status != 'cancelled'
            GROUP BY u.id, u.name, u.email
            ORDER BY total_spent DESC
        """
        rows = execute_query(query)

        buyers = []
        for r in rows:
            buyers.append({
                "id": r["id"],
                "name": r["name"] or "Usuario Anónimo",
                "email": r["email"] or "N/A",
                "tickets_bought": int(r["tickets_bought"] or 0),
                "total_spent": float(r["total_spent"] or 0.0)
            })

        return {
            "status": "success",
            "buyers": buyers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
''')

print("Done appending")
