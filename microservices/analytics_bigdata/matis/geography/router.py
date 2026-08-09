from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query

router = APIRouter(prefix="/api/analytics/matis/geography", tags=["MATIS Geographic Intelligence"])

@router.get("/sales-by-state")
def get_sales_by_state():
    try:
        # Group event locations (CDMX, Jalisco, Nuevo Leon) and sum revenue
        query = """
            SELECT 
                CASE 
                    WHEN LOWER(e.location) LIKE '%cdmx%' OR LOWER(e.location) LIKE '%ciudad de méxico%' OR LOWER(e.location) LIKE '%mexico%' THEN 'CDMX'
                    WHEN LOWER(e.location) LIKE '%guadalajara%' OR LOWER(e.location) LIKE '%jalisco%' OR LOWER(e.location) LIKE '%akron%' OR LOWER(e.location) LIKE '%telmex%' THEN 'Jalisco'
                    WHEN LOWER(e.location) LIKE '%monterrey%' OR LOWER(e.location) LIKE '%nuevo león%' OR LOWER(e.location) LIKE '%san pedro%' THEN 'Nuevo León'
                    ELSE 'Otros Estados'
                END as state,
                COUNT(t.id) as tickets_sold,
                SUM(t.price) as revenue
            FROM events e
            JOIN tickets t ON e.id = t.event_id
            WHERE t.status != 'cancelled'
            GROUP BY state
            ORDER BY revenue DESC
        """
        rows = execute_query(query)
        
        data = []
        for r in rows:
            data.append({
                "state": r["state"],
                "tickets_sold": int(r["tickets_sold"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })
            
        return {
            "status": "success",
            "states_sales": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
