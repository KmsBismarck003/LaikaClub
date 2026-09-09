from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query

router = APIRouter(prefix="/api/analytics/matis/products", tags=["MATIS Product Intelligence"])


@router.get("/sales")
def get_merchandise_sales(date_from: str = None, date_to: str = None):
    """
    Devuelve ventas de artículos de merchandise.
    Parámetros opcionales date_from y date_to (YYYY-MM-DD) filtran
    las órdenes dentro del rango indicado.
    Si las tablas de merchandise no existen en este entorno, devuelve
    un array vacío — sin datos simulados.
    """
    # Construir cláusulas de filtro de fecha
    date_filters = ["mo.status != 'cancelled'"]
    params_range = ["cancelled"]
    if date_from:
        date_filters.append("mo.created_at >= %s")
        params_range.append(date_from)
    if date_to:
        date_filters.append("mo.created_at <= %s")
        params_range.append(date_to)

    where_clause = " AND ".join(date_filters)

    try:
        # Rango real de fechas de órdenes filtradas
        range_conditions = ["status != 'cancelled'"]
        range_params = []
        if date_from:
            range_conditions.append("created_at >= %s")
            range_params.append(date_from)
        if date_to:
            range_conditions.append("created_at <= %s")
            range_params.append(date_to)

        date_range_query = execute_query(
            f"SELECT MIN(created_at) as fecha_inicio, MAX(created_at) as fecha_fin FROM merchandise_orders WHERE {' AND '.join(range_conditions)}",
            tuple(range_params) if range_params else None
        )
        fecha_inicio = None
        fecha_fin = None
        if date_range_query and date_range_query[0]["fecha_inicio"]:
            raw_i = date_range_query[0]["fecha_inicio"]
            raw_f = date_range_query[0]["fecha_fin"]
            fecha_inicio = raw_i.strftime("%Y-%m-%d") if hasattr(raw_i, 'strftime') else str(raw_i)[:10]
            fecha_fin = raw_f.strftime("%Y-%m-%d") if hasattr(raw_f, 'strftime') else str(raw_f)[:10]

        # Join condicional por fecha en las órdenes
        join_filter = ""
        join_params = []
        if date_from:
            join_filter += " AND mo.created_at >= %s"
            join_params.append(date_from)
        if date_to:
            join_filter += " AND mo.created_at <= %s"
            join_params.append(date_to)

        query = f"""
            SELECT i.id, i.name, MIN(v.price) as price,
                   COALESCE(SUM(oi.quantity), 0) as sold,
                   COALESCE(SUM(oi.quantity * oi.unit_price), 0.0) as revenue
            FROM merchandise_items i
            JOIN merchandise_variants v ON i.id = v.item_id
            LEFT JOIN merchandise_order_items oi ON v.id = oi.variant_id
            LEFT JOIN merchandise_orders mo ON oi.order_id = mo.id AND mo.status != 'cancelled'{join_filter}
            GROUP BY i.id, i.name
            ORDER BY revenue DESC
        """
        rows = execute_query(query, tuple(join_params) if join_params else None)

        products = []
        for r in rows:
            products.append({
                "id": r["id"],
                "name": r["name"],
                "price": float(r["price"] or 0.0),
                "units_sold": int(r["sold"] or 0),
                "total_revenue": float(r["revenue"] or 0.0)
            })

        return {
            "status": "success",
            "products_sales": products,
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
        }

    except Exception:
        # Las tablas de merchandise no existen en este entorno — devolver vacío, sin mocks
        return {
            "status": "success",
            "products_sales": [],
            "periodo": {
                "fecha_inicio": None,
                "fecha_fin": None
            },
            "message": "Las tablas de merchandise no están disponibles en este entorno."
        }


@router.get("/stock-alerts")
def get_stock_alerts():
    try:
        query = """
            SELECT i.name as product_name, v.size, v.color, v.stock
            FROM merchandise_variants v
            JOIN merchandise_items i ON v.item_id = i.id
            WHERE v.stock <= 10
            ORDER BY v.stock ASC
        """
        rows = execute_query(query)

        alerts = []
        for r in rows:
            alerts.append({
                "product_name": r["product_name"],
                "variant": f"{r['size']} - {r['color']}",
                "stock": int(r["stock"])
            })

        return {
            "status": "success",
            "alerts": alerts
        }
    except Exception:
        return {
            "status": "success",
            "alerts": []
        }
