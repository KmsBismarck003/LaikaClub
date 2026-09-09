from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query
from datetime import datetime

router = APIRouter(prefix="/api/analytics/matis/executive", tags=["MATIS Executive Intelligence"])

@router.get("/kpis")
def get_executive_kpis():
    try:
        payments_query = execute_query("SELECT SUM(amount) as revenue, COUNT(*) as txn_count FROM payments WHERE status = 'completed'")
        revenue = float(payments_query[0]["revenue"] or 0.0)
        transactions = int(payments_query[0]["txn_count"] or 0)

        tickets_query = execute_query("SELECT COUNT(*) as count, AVG(price) as avg_price FROM tickets WHERE status != 'cancelled'")
        tickets_sold = int(tickets_query[0]["count"] or 0)
        avg_ticket_price = float(tickets_query[0]["avg_price"] or 0.0)

        users_query = execute_query("SELECT COUNT(*) as count FROM users")
        total_users = int(users_query[0]["count"] or 0)

        events_query = execute_query("SELECT COUNT(*) as count FROM events WHERE event_date >= NOW()")
        active_events = int(events_query[0]["count"] or 0)

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
def get_category_performance(date_from: str = None, date_to: str = None):
    """
    Devuelve el rendimiento acumulado por categoría de evento.
    Parámetros opcionales date_from y date_to (formato YYYY-MM-DD) filtran
    las compras de tickets dentro del rango indicado.
    """
    try:
        # Construir cláusulas de filtro de fecha
        date_filters = []
        params = []
        if date_from:
            date_filters.append("t.purchase_date >= %s")
            params.append(date_from)
        if date_to:
            date_filters.append("t.purchase_date <= %s")
            params.append(date_to)

        where_clause = ""
        if date_filters:
            where_clause = " AND " + " AND ".join(date_filters)

        # Rango real de fechas de los tickets que pasan el filtro
        date_range_query = execute_query(
            f"""
            SELECT MIN(purchase_date) as fecha_inicio, MAX(purchase_date) as fecha_fin
            FROM tickets
            WHERE status != 'cancelled'{where_clause.replace('t.', '')}
            """,
            tuple(params) if params else None
        )
        fecha_inicio = None
        fecha_fin = None
        if date_range_query and date_range_query[0]["fecha_inicio"]:
            raw_i = date_range_query[0]["fecha_inicio"]
            raw_f = date_range_query[0]["fecha_fin"]
            fecha_inicio = raw_i.strftime("%Y-%m-%d") if hasattr(raw_i, 'strftime') else str(raw_i)[:10]
            fecha_fin = raw_f.strftime("%Y-%m-%d") if hasattr(raw_f, 'strftime') else str(raw_f)[:10]

        query = f"""
            SELECT e.category, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
            FROM events e
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'{where_clause}
            GROUP BY e.category
        """
        rows = execute_query(query, tuple(params) if params else None)

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
            "performance": performance,
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales-trend")
def get_sales_trend():
    try:
        query = """
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as revenue, COUNT(*) as sales_count
            FROM payments
            WHERE status = 'completed'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        """
        rows = execute_query(query)

        if not rows:
            query = """
                SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as revenue, COUNT(*) as sales_count
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


@router.get("/category-performance/details")
def get_category_performance_details(category: str, date_from: str = None, date_to: str = None):
    """
    DRILL-DOWN: Eventos individuales de una categoría, con filtro de fecha opcional.
    """
    try:
        date_filters = ["LOWER(e.category) = LOWER(%s)"]
        params = [category]
        if date_from:
            date_filters.append("t.purchase_date >= %s")
            params.append(date_from)
        if date_to:
            date_filters.append("t.purchase_date <= %s")
            params.append(date_to)

        where_clause = " AND ".join(date_filters)

        query = f"""
            SELECT e.id, e.name, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
            FROM events e
            JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
            WHERE {where_clause}
            GROUP BY e.id, e.name
            ORDER BY revenue DESC
        """
        rows = execute_query(query, tuple(params))

        events = []
        for r in rows:
            events.append({
                "id": r["id"],
                "name": r["name"],
                "tickets_sold": int(r["tickets_sold"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })

        return {
            "status": "success",
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales-trend/details")
def get_sales_trend_details(month: str):
    """
    DRILL-DOWN: Desglose de eventos para un mes específico (formato YYYY-MM).
    """
    try:
        query = """
            SELECT e.id, e.name, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
            FROM events e
            JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
            WHERE DATE_FORMAT(t.purchase_date, '%%Y-%%m') = %s
            GROUP BY e.id, e.name
            ORDER BY revenue DESC
        """
        rows = execute_query(query, (month,))

        if not rows:
            try:
                query_fallback = """
                    SELECT e.id, e.name, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
                    FROM events e
                    JOIN tickets t ON e.id = t.event_id AND t.status != 'cancelled'
                    WHERE strftime('%%Y-%%m', t.purchase_date) = %s
                    GROUP BY e.id, e.name
                    ORDER BY revenue DESC
                """
                rows = execute_query(query_fallback, (month,))
            except Exception:
                pass

        events = []
        for r in rows:
            events.append({
                "id": r["id"],
                "name": r["name"],
                "tickets_sold": int(r["tickets_sold"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })

        return {
            "status": "success",
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket-buyers")
def get_ticket_buyers():
    try:
        query = """
            SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.email, COUNT(t.id) as tickets_bought, SUM(t.price) as total_spent
            FROM users u
            JOIN tickets t ON u.id = t.user_id
            WHERE t.status != 'cancelled'
            GROUP BY u.id, u.first_name, u.last_name, u.email
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
