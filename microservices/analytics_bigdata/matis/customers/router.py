from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query
from datetime import datetime

router = APIRouter(prefix="/api/analytics/matis/customers", tags=["MATIS Customer Intelligence"])

@router.get("/segments")
def get_customer_segments():
    try:
        # Group users by purchases & total spent
        query = """
            SELECT t.user_id, u.first_name, u.last_name, u.email,
                   COUNT(t.id) as tickets_count, SUM(t.price) as total_spent
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.status != 'cancelled'
            GROUP BY t.user_id
        """
        rows = execute_query(query)
        
        segments = {
            "Súper Fans (VIP)": [],
            "Fans Recurrentes": [],
            "Público General": [],
            "Compradores Casuales": []
        }
        
        for r in rows:
            tickets = int(r["tickets_count"] or 0)
            spent = float(r["total_spent"] or 0.0)
            name = f"{r['first_name']} {r['last_name']}".strip()
            
            user_data = {
                "id": r["user_id"],
                "name": name if name else "Usuario Sin Nombre",
                "email": r["email"],
                "tickets": tickets,
                "spent": spent
            }
            
            if spent >= 1500.0 or tickets >= 6:
                segments["Súper Fans (VIP)"].append(user_data)
            elif spent >= 500.0 or tickets >= 3:
                segments["Fans Recurrentes"].append(user_data)
            elif tickets >= 2:
                segments["Público General"].append(user_data)
            else:
                segments["Compradores Casuales"].append(user_data)
                
        # Format summary
        summary = []
        for name, list_users in segments.items():
            avg_spent = sum(u["spent"] for u in list_users) / len(list_users) if list_users else 0.0
            avg_tix = sum(u["tickets"] for u in list_users) / len(list_users) if list_users else 0.0
            summary.append({
                "name": name,
                "size": len(list_users),
                "centroid_summary": f"Gasto Promedio: ${round(avg_spent, 2)} | Tickets Promedio: {round(avg_tix, 1)}",
                "description": (
                    "Alta rentabilidad. Clientes muy leales" if "VIP" in name else
                    "Asisten regularmente pero cuidan su presupuesto" if "Recurrentes" in name else
                    "Compradores estándar. Rentables en volumen" if "General" in name else
                    "Sensibles a promociones y descuentos. Compran raro"
                )
            })
            
        return {
            "status": "success",
            "segments_summary": summary,
            "segments_details": {k: v[:15] for k, v in segments.items()} # Limit to top 15 each
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/churn")
def get_churn_analysis():
    try:
        # Customers with no activity
        query = """
            SELECT u.id, u.first_name, u.last_name, u.email, u.last_login, u.created_at
            FROM users u
            WHERE u.id NOT IN (
                SELECT DISTINCT user_id FROM tickets WHERE status != 'cancelled'
            )
            LIMIT 50
        """
        rows = execute_query(query)
        
        churn_candidates = []
        for r in rows:
            name = f"{r['first_name']} {r['last_name']}".strip()
            
            # Estimate days inactive
            last_login = r["last_login"] or r["created_at"] or datetime.now()
            if isinstance(last_login, str):
                try:
                    last_login = datetime.fromisoformat(last_login)
                except Exception:
                    last_login = datetime.now()
            
            days_inactive = (datetime.now() - last_login).days
            
            risk = "Medio"
            if days_inactive > 90:
                risk = "Alto"
            elif days_inactive < 30:
                risk = "Bajo"
                
            churn_candidates.append({
                "id": r["id"],
                "name": name if name else "Usuario Inactivo",
                "email": r["email"],
                "days_inactive": max(0, days_inactive),
                "risk_level": risk
            })
            
        # Sort by days inactive
        churn_candidates.sort(key=lambda x: x["days_inactive"], reverse=True)
        
        # Risk distribution
        risk_dist = {"Bajo": 0, "Medio": 0, "Alto": 0}
        for c in churn_candidates:
            risk_dist[c["risk_level"]] += 1
            
        return {
            "status": "success",
            "churn_candidates": churn_candidates[:15],
            "risk_distribution": risk_dist
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
