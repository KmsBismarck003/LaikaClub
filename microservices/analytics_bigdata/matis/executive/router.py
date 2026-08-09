from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query
from datetime import datetime

router = APIRouter(prefix="/api/analytics/matis/executive", tags=["MATIS Executive Intelligence"])

@router.get("/kpis")
def get_executive_kpis():
    try:
        # 1. Total revenue & tickets sold
        payments_query = execute_query("SELECT SUM(amount) as revenue, COUNT(*) as txn_count FROM payments WHERE status = 'completed'")
        revenue = float(payments_query[0]["revenue"] or 0.0)
        transactions = int(payments_query[0]["txn_count"] or 0)
        
        tickets_query = execute_query("SELECT COUNT(*) as count, AVG(price) as avg_price FROM tickets WHERE status != 'cancelled'")
        tickets_sold = int(tickets_query[0]["count"] or 0)
        avg_ticket_price = float(tickets_query[0]["avg_price"] or 0.0)
        
        # 2. Total active users
        users_query = execute_query("SELECT COUNT(*) as count FROM users")
        total_users = int(users_query[0]["count"] or 0)
        
        # 3. Active events
        events_query = execute_query("SELECT COUNT(*) as count FROM events WHERE event_date >= NOW()")
        active_events = int(events_query[0]["count"] or 0)
        
        # 4. Conversion rate (users that bought tickets / total users)
        buyers_query = execute_query("SELECT COUNT(DISTINCT user_id) as count FROM tickets WHERE status != 'cancelled'")
        unique_buyers = int(buyers_query[0]["count"] or 0)
        conversion_rate = (unique_buyers / total_users) * 100 if total_users > 0 else 0.0
        
        return {
            "status": "success",
            "kpis": {
                "total_revenue": revenue,
                "tickets_sold": tickets_sold,
                "avg_ticket_price": round(avg_ticket_price, 2),
                "total_users": total_users,
                "active_events": active_events,
                "conversion_rate_pct": round(conversion_rate, 2),
                "total_transactions": transactions
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category-performance")
def get_category_performance():
    try:
        # Group sales by event category
        query = """
            SELECT e.category, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
            FROM events e
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
            GROUP BY e.category
        """
        rows = execute_query(query)
        
        performance = []
        for r in rows:
            category = r["category"] or "other"
            performance.append({
                "category": category.capitalize(),
                "tickets_sold": int(r["tickets_sold"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })
            
        return {
            "status": "success",
            "performance": performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sales-trend")
def get_sales_trend():
    try:
        # Monthly sales trend
        query = """
            SELECT DATE_FORMAT(created_at, '%%Y-%%m') as month, SUM(amount) as revenue, COUNT(*) as sales_count
            FROM payments
            WHERE status = 'completed'
            GROUP BY DATE_FORMAT(created_at, '%%Y-%%m')
            ORDER BY month ASC
        """
        rows = execute_query(query)
        
        # Fallback if DATE_FORMAT fails or SQLite is used
        if not rows:
            query = """
                SELECT strftime('%%Y-%%m', created_at) as month, SUM(amount) as revenue, COUNT(*) as sales_count
                FROM payments
                WHERE status = 'completed'
                GROUP BY month
                ORDER BY month ASC
            """
            try:
                rows = execute_query(query)
            except Exception:
                pass
                
        trend = []
        for r in rows:
            trend.append({
                "month": r["month"],
                "revenue": float(r["revenue"] or 0.0),
                "sales_count": int(r["sales_count"] or 0)
            })
            
        return {
            "status": "success",
            "trend": trend
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
