from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query

router = APIRouter(prefix="/api/analytics/matis/sales", tags=["MATIS Sales Intelligence"])

@router.get("/summary")
def get_sales_summary():
    try:
        # Total payments, pending, completed, cancelled
        query = """
            SELECT status, COUNT(*) as count, SUM(amount) as total_amount
            FROM payments
            GROUP BY status
        """
        rows = execute_query(query)
        
        summary = {}
        for r in rows:
            status = r["status"] or "unknown"
            summary[status] = {
                "count": int(r["count"] or 0),
                "total_amount": float(r["total_amount"] or 0.0)
            }
            
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payment-methods")
def get_payment_methods():
    try:
        query = """
            SELECT payment_method, COUNT(*) as count, SUM(amount) as revenue
            FROM payments
            WHERE status = 'completed'
            GROUP BY payment_method
        """
        rows = execute_query(query)
        
        methods = []
        for r in rows:
            methods.append({
                "method": (r["payment_method"] or "unknown").replace("_", " ").title(),
                "count": int(r["count"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })
            
        return {
            "status": "success",
            "methods": methods
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-ranges")
def get_price_ranges():
    try:
        # Categorize tickets by price range
        query = """
            SELECT 
                CASE 
                    WHEN price < 200 THEN 'Económico (< $200)'
                    WHEN price >= 200 AND price < 500 THEN 'Estándar ($200 - $500)'
                    WHEN price >= 500 AND price < 1500 THEN 'Preferente ($500 - $1500)'
                    ELSE 'VIP (> $1500)'
                END as range_label,
                COUNT(*) as count,
                SUM(price) as total_revenue
            FROM tickets
            WHERE status != 'cancelled'
            GROUP BY range_label
            ORDER BY total_revenue DESC
        """
        rows = execute_query(query)
        
        ranges = []
        for r in rows:
            ranges.append({
                "range": r["range_label"],
                "count": int(r["count"] or 0),
                "revenue": float(r["total_revenue"] or 0.0)
            })
            
        return {
            "status": "success",
            "price_ranges": ranges
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
