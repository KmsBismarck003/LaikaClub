from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query

router = APIRouter(prefix="/api/analytics/matis/events", tags=["MATIS Event Intelligence"])

@router.get("/occupancy")
def get_events_occupancy():
    try:
        query = """
            SELECT e.id, e.name, e.category, e.total_tickets as capacity,
                   (SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as tickets_sold
            FROM events e
            ORDER BY tickets_sold DESC
        """
        rows = execute_query(query)

        events = []
        for r in rows:
            capacity = int(r["capacity"] or 100)
            sold = int(r["tickets_sold"] or 0)
            occupancy = (sold / capacity) * 100 if capacity > 0 else 0.0

            events.append({
                "id": r["id"],
                "name": r["name"],
                "category": (r["category"] or "other").title(),
                "capacity": capacity,
                "tickets_sold": sold,
                "occupancy_rate_pct": round(occupancy, 2)
            })

        return {
            "status": "success",
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-revenue")
def get_top_events_by_revenue(date_from: str = None, date_to: str = None):
    """
    Devuelve los eventos con mayor recaudación.
    Parámetros opcionales date_from y date_to (YYYY-MM-DD) filtran
    las compras de tickets en el rango indicado.
    """
    try:
        # Construir cláusulas de filtro de fecha
        date_filters = ["t.status != 'cancelled'"]
        params = []
        if date_from:
            date_filters.append("t.purchase_date >= %s")
            params.append(date_from)
        if date_to:
            date_filters.append("t.purchase_date <= %s")
            params.append(date_to)

        where_clause = " AND ".join(date_filters)

        # Rango real de fechas de los tickets filtrados
        date_filters_range = ["status != 'cancelled'"]
        params_range = []
        if date_from:
            date_filters_range.append("purchase_date >= %s")
            params_range.append(date_from)
        if date_to:
            date_filters_range.append("purchase_date <= %s")
            params_range.append(date_to)

        date_range_query = execute_query(
            f"SELECT MIN(purchase_date) as fecha_inicio, MAX(purchase_date) as fecha_fin FROM tickets WHERE {' AND '.join(date_filters_range)}",
            tuple(params_range) if params_range else None
        )
        fecha_inicio = None
        fecha_fin = None
        if date_range_query and date_range_query[0]["fecha_inicio"]:
            raw_i = date_range_query[0]["fecha_inicio"]
            raw_f = date_range_query[0]["fecha_fin"]
            fecha_inicio = raw_i.strftime("%Y-%m-%d") if hasattr(raw_i, 'strftime') else str(raw_i)[:10]
            fecha_fin = raw_f.strftime("%Y-%m-%d") if hasattr(raw_f, 'strftime') else str(raw_f)[:10]

        query = f"""
            SELECT e.id, e.name, e.category, COUNT(t.id) as tickets_sold, SUM(t.price) as revenue
            FROM events e
            JOIN tickets t ON e.id = t.event_id
            WHERE {where_clause}
            GROUP BY e.id, e.name, e.category
            ORDER BY revenue DESC
            LIMIT 10
        """
        rows = execute_query(query, tuple(params) if params else None)

        events = []
        for r in rows:
            events.append({
                "id": r["id"],
                "name": r["name"],
                "category": (r["category"] or "other").capitalize(),
                "tickets_sold": int(r["tickets_sold"] or 0),
                "revenue": float(r["revenue"] or 0.0)
            })

        return {
            "status": "success",
            "top_events": events,
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket-status")
def get_ticket_status():
    try:
        query = """
            SELECT status, COUNT(*) as count
            FROM tickets
            GROUP BY status
        """
        rows = execute_query(query)

        status_breakdown = {}
        for r in rows:
            status = r["status"] or "unknown"
            status_breakdown[status] = int(r["count"] or 0)

        return {
            "status": "success",
            "status_breakdown": status_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
def list_all_events():
    try:
        query = "SELECT id, name FROM events ORDER BY name ASC"
        rows = execute_query(query)
        return {
            "status": "success",
            "events": [{"id": r["id"], "name": r["name"]} for r in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
def compare_events(event_a: int, event_b: int, date_from: str = None, date_to: str = None):
    try:
        query_a_name = execute_query("SELECT name FROM events WHERE id = %s", (event_a,))
        name_a = query_a_name[0]["name"] if query_a_name else f"Evento {event_a}"

        query_b_name = execute_query("SELECT name FROM events WHERE id = %s", (event_b,))
        name_b = query_b_name[0]["name"] if query_b_name else f"Evento {event_b}"

        query_a = """
            SELECT DATE_FORMAT(purchase_date, '%%Y-%%m-%%d') as date, SUM(price) as revenue, COUNT(*) as count
            FROM tickets
            WHERE event_id = %s AND status != 'cancelled'
        """
        params_a = [event_a]
        if date_from:
            query_a += " AND purchase_date >= %s"
            params_a.append(date_from)
        if date_to:
            query_a += " AND purchase_date <= %s"
            params_a.append(date_to)
        query_a += " GROUP BY DATE_FORMAT(purchase_date, '%%Y-%%m-%%d') ORDER BY date ASC"

        rows_a = execute_query(query_a, tuple(params_a))

        query_b = """
            SELECT DATE_FORMAT(purchase_date, '%%Y-%%m-%%d') as date, SUM(price) as revenue, COUNT(*) as count
            FROM tickets
            WHERE event_id = %s AND status != 'cancelled'
        """
        params_b = [event_b]
        if date_from:
            query_b += " AND purchase_date >= %s"
            params_b.append(date_from)
        if date_to:
            query_b += " AND purchase_date <= %s"
            params_b.append(date_to)
        query_b += " GROUP BY DATE_FORMAT(purchase_date, '%%Y-%%m-%%d') ORDER BY date ASC"

        rows_b = execute_query(query_b, tuple(params_b))

        sales_a = [{"date": r["date"], "revenue": float(r["revenue"] or 0.0), "tickets_sold": int(r["count"] or 0)} for r in rows_a]
        sales_b = [{"date": r["date"], "revenue": float(r["revenue"] or 0.0), "tickets_sold": int(r["count"] or 0)} for r in rows_b]

        return {
            "status": "success",
            "event_a": {"id": event_a, "name": name_a, "sales": sales_a},
            "event_b": {"id": event_b, "name": name_b, "sales": sales_b}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
