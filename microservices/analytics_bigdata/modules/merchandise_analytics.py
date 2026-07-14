"""
merchandise_analytics.py
────────────────────────────────────────────────────────────────────
Módulo dedicado al análisis inteligente de ventas de mercancía.

Algoritmo:
  1. Lee las tablas merchandise_orders, merchandise_order_items,
     merchandise_products y events desde SQLite.
  2. Calcula métricas de rendimiento por producto:
     - Unidades vendidas totales
     - Ingreso generado
     - Tasa de recompra aproximada
     - Qué tipos de evento las impulsan más
  3. Genera recomendaciones accionables en lenguaje natural:
     - "Estrella del catálogo" → productos top, recomendar ampliar stock/variedad
     - "Dormidos" → productos con pocas ventas, recomendar estrategias
  4. Devuelve todo en un dict JSON listo para el frontend.
"""

import sqlite3
from pathlib import Path
from datetime import datetime
from collections import defaultdict


class MerchandiseAnalyticsModule:
    """Análisis de ventas de mercancía y recomendaciones estratégicas."""

    # ──────────────────────────────────────────────────────
    # RUTAS
    # ──────────────────────────────────────────────────────
    @property
    def _base(self):
        return Path(__file__).resolve().parent.parent.parent.parent

    @property
    def _merch_db(self):
        return self._base / "microservices" / "merchandise" / "merchandise.db"

    @property
    def _events_db(self):
        return self._base / "microservices" / "events" / "events.db"

    # ──────────────────────────────────────────────────────
    # UTILIDAD: Ejecutar query SQLite
    # ──────────────────────────────────────────────────────
    def _query(self, db_path: Path, sql: str, params=(), attach_events=False):
        """Ejecuta una query SQLite y regresa lista de dicts."""
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            if attach_events and self._events_db.exists():
                cur.execute(f"ATTACH DATABASE '{self._events_db}' AS events_db;")
            cur.execute(sql, params)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            print(f"[MERCH_ANALYTICS] SQLite error en {db_path}: {e}")
            return []

    # ──────────────────────────────────────────────────────
    # ALGORITMO PRINCIPAL
    # ──────────────────────────────────────────────────────
    def get_sales_insights(self, date_from: str = None, date_to: str = None):
        """
        Analiza las ventas de mercancía y genera recomendaciones.

        Retorna:
          {
            status, generated_at,
            summary: { total_products, total_sold, total_revenue, avg_per_order },
            top_products: [ { name, units, revenue, rank, badge } ... ],
            low_products: [ { name, units, revenue, reason, action } ... ],
            category_insights: [ { category, units, revenue } ... ],
            event_type_breakdown: [ { event_type, units, revenue } ... ],
            recommendations: [ { icon, title, body, type } ... ]
          }
        """
        try:
            date_filter = ""
            params = []
            if date_from:
                date_filter += " AND o.created_at >= ?"
                params.append(date_from)
            if date_to:
                date_filter += " AND o.created_at <= ?"
                params.append(date_to + " 23:59:59")

            # ─── 1. VENTAS POR PRODUCTO ────────────────────────────────────
            product_sql = f"""
                SELECT
                    i.name          AS product_name,
                    i.category      AS category,
                    COALESCE(MIN(oi.unit_price), MIN(v.price), 0) AS unit_price,
                    SUM(oi.quantity)      AS units_sold,
                    SUM(oi.quantity * COALESCE(oi.unit_price, v.price, 0)) AS revenue
                FROM merchandise_order_items oi
                JOIN merchandise_orders o ON o.id = oi.order_id
                JOIN merchandise_variants v ON v.id = oi.variant_id
                JOIN merchandise_items i ON i.id = v.item_id
                WHERE o.status = 'completed'
                {date_filter}
                GROUP BY i.id, i.name, i.category
                ORDER BY units_sold DESC
            """
            products = self._query(self._merch_db, product_sql, params)

            # ─── 2. TOTALES GLOBALES ───────────────────────────────────────
            total_units = sum(p.get("units_sold", 0) or 0 for p in products)
            total_revenue = sum(p.get("revenue", 0) or 0 for p in products)

            # Promedio por orden
            orders_sql = f"""
                SELECT COUNT(*) as cnt, SUM(total_amount) as total
                FROM merchandise_orders
                WHERE status = 'completed'
                {date_filter}
            """
            orders_agg = self._query(self._merch_db, orders_sql, params)
            order_count = orders_agg[0].get("cnt", 0) if orders_agg else 0
            avg_per_order = round(total_revenue / order_count, 2) if order_count > 0 else 0

            # ─── 3. CLASIFICAR PRODUCTOS ───────────────────────────────────
            MAX_TOP = 5
            MIN_UNITS_THRESHOLD = max(2, total_units * 0.05)  # < 5% del total = dormido

            top_products = []
            low_products = []

            for i, p in enumerate(products):
                units = p.get("units_sold", 0) or 0
                rev = p.get("revenue", 0) or 0
                name = p.get("product_name") or "Producto"
                cat = p.get("category") or "General"

                entry = {
                    "name": name,
                    "category": cat,
                    "units": int(units),
                    "revenue": round(float(rev), 2),
                }

                if i < MAX_TOP:
                    # Asignar badge según posición (sin emojis)
                    badges = ["Favorito Absoluto", "Muy Vendido", "Popular",
                              "Sólido", "Buen Rendimiento"]
                    entry["badge"] = badges[i] if i < len(badges) else "Activo"
                    entry["rank"] = i + 1
                    top_products.append(entry)

                if units <= MIN_UNITS_THRESHOLD and i >= MAX_TOP:
                    entry["reason"] = self._diagnose_low_seller(units, rev, total_units)
                    entry["action"] = self._recommend_action(units, rev, cat)
                    low_products.append(entry)

            # ─── 4. ANÁLISIS POR CATEGORÍA ────────────────────────────────
            cat_map = defaultdict(lambda: {"units": 0, "revenue": 0.0})
            for p in products:
                cat = p.get("category") or "General"
                cat_map[cat]["units"] += int(p.get("units_sold", 0) or 0)
                cat_map[cat]["revenue"] += float(p.get("revenue", 0) or 0)

            category_insights = [
                {"category": cat, "units": v["units"], "revenue": round(v["revenue"], 2)}
                for cat, v in sorted(cat_map.items(), key=lambda x: x[1]["revenue"], reverse=True)
            ]

            # ─── 5. BREAKDOWN POR TIPO DE EVENTO ──────────────────────────
            # Cruzamos las órdenes con el evento mediante la vinculación en merchandise_items
            event_sql = f"""
                SELECT
                    COALESCE(e.category, 'Sin evento / General') AS event_type,
                    COUNT(DISTINCT o.id) AS total_orders,
                    SUM(oi.quantity * COALESCE(oi.unit_price, v.price, 0)) AS revenue
                FROM merchandise_orders o
                JOIN merchandise_order_items oi ON o.id = oi.order_id
                JOIN merchandise_variants v ON v.id = oi.variant_id
                JOIN merchandise_items i ON i.id = v.item_id
                LEFT JOIN events_db.events e ON e.id = i.event_id
                WHERE o.status = 'completed'
                {date_filter}
                GROUP BY event_type
                ORDER BY revenue DESC
            """
            event_breakdown = self._query(self._merch_db, event_sql, params, attach_events=True)

            # ─── 5.5 ASOCIACIÓN DE PRODUCTOS (CROSS-SELLING) ──────────────────
            basket_sql = f"""
                SELECT o.id as order_id, i.name as product_name
                FROM merchandise_orders o
                JOIN merchandise_order_items oi ON o.id = oi.order_id
                JOIN merchandise_variants v ON v.id = oi.variant_id
                JOIN merchandise_items i ON i.id = v.item_id
                WHERE o.status = 'completed' {date_filter}
            """
            basket_rows = self._query(self._merch_db, basket_sql, params)
            
            baskets = defaultdict(set)
            product_counts = defaultdict(int)
            for r in basket_rows:
                baskets[r["order_id"]].add(r["product_name"])
                
            for b in baskets.values():
                for p in b:
                    product_counts[p] += 1
            
            co_occurrences = defaultdict(int)
            for b in baskets.values():
                items = list(b)
                for i in range(len(items)):
                    for j in range(i+1, len(items)):
                        pair = tuple(sorted([items[i], items[j]]))
                        co_occurrences[pair] += 1
            
            cross_sell_insight = None
            if co_occurrences:
                best_pair = max(co_occurrences.items(), key=lambda x: x[1])
                pair_items = best_pair[0]
                pair_count = best_pair[1]
                
                if pair_count >= 2: # Al menos 2 co-ocurrencias significativas
                    item_a, item_b = pair_items
                    conf_a_to_b = (pair_count / product_counts[item_a]) * 100
                    conf_b_to_a = (pair_count / product_counts[item_b]) * 100
                    
                    if conf_a_to_b >= conf_b_to_a:
                        base_item, rec_item, conf = item_a, item_b, conf_a_to_b
                    else:
                        base_item, rec_item, conf = item_b, item_a, conf_b_to_a
                        
                    cross_sell_insight = {
                        "base_item": base_item,
                        "rec_item": rec_item,
                        "confidence": conf
                    }

            # ─── 6. RECOMENDACIONES EN LENGUAJE HUMANO ────────────────────
            recommendations = self._generate_recommendations(
                top_products, low_products, category_insights,
                total_units, total_revenue, event_breakdown, cross_sell_insight
            )

            return {
                "status": "success",
                "generated_at": datetime.now().isoformat(),
                "date_from": date_from,
                "date_to": date_to,
                "summary": {
                    "total_products_analyzed": len(products),
                    "total_units_sold": int(total_units),
                    "total_revenue": round(float(total_revenue), 2),
                    "avg_per_order": avg_per_order,
                    "total_orders": int(order_count),
                },
                "top_products": top_products,
                "low_products": low_products[:10],
                "category_insights": category_insights,
                "event_type_breakdown": event_breakdown,
                "recommendations": recommendations,
            }

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"status": "error", "error": str(e)}

    # ──────────────────────────────────────────────────────
    # HELPERS DE DIAGNÓSTICO Y RECOMENDACIÓN
    # ──────────────────────────────────────────────────────
    def _diagnose_low_seller(self, units: int, revenue: float, total: int) -> str:
        """Genera un diagnóstico breve en texto humano."""
        pct = (units / total * 100) if total > 0 else 0
        if units == 0:
            return "No se vendió ninguna unidad en el período seleccionado."
        if pct < 1:
            return f"Solo representó el {pct:.1f}% de las ventas totales. Muy baja rotación."
        return f"Vendió {units} unidad(es), por debajo del promedio esperado del catálogo."

    def _recommend_action(self, units: int, revenue: float, category: str) -> str:
        """Genera una recomendación accionable."""
        if units == 0:
            return (
                "Considera retirarlo del catálogo o hacer una promoción de lanzamiento "
                "con descuento del 30% para estimular su primera compra."
            )
        if revenue < 500:
            return (
                "Prueba combinarlo con un producto estrella en un paquete (bundle) "
                "para impulsarlo sin reducir precio directamente."
            )
        return (
            "Colócalo en un lugar más visible en la tienda o agrégalo como "
            f"sugerido junto a los productos de '{category}' más populares."
        )

    def _generate_recommendations(
        self, top, low, categories, total_units, total_revenue, event_breakdown, cross_sell_insight=None
    ) -> list:
        """Genera la lista de recomendaciones estratégicas humanizadas."""
        recs = []

        # ── REC 1: Estrella del catálogo ──────────────────────────────────
        if top:
            star = top[0]
            second = top[1] if len(top) > 1 else None
            other_tops = [t["name"] for t in top[1:3]] if len(top) > 1 else []
            others_txt = " y ".join(other_tops) if other_tops else ""

            body = (
                f"El producto que más se vendió fue «{star['name']}» "
                f"con {star['units']:,} unidades y ${star['revenue']:,.0f} MXN en ingresos. "
            )
            if others_txt:
                body += (
                    f"Le siguen de cerca {others_txt}. "
                    f"Te recomendamos asegurarte de tener suficiente stock de estos artículos "
                    f"antes de cada evento, ya que son los que la gente más busca. "
                    f"También podrías ampliar la variedad dentro de su categoría para capturar "
                    f"aún más ventas de quienes ya compran ese tipo de producto."
                )
            recs.append({
                "icon": "",
                "title": "Tus productos estrella",
                "body": body,
                "type": "success",
                "tag": "ALTO RENDIMIENTO"
            })

        # ── REC 2: Productos con bajo rendimiento ──────────────────────────
        if low:
            low_names = ", ".join([f"«{p['name']}»" for p in low[:3]])
            zero_sellers = [p for p in low if p.get("units", 0) == 0]
            body = (
                f"Los productos con menos ventas fueron: {low_names}. "
            )
            if zero_sellers:
                body += (
                    f"De estos, {len(zero_sellers)} no vendieron ni una sola unidad. "
                    f"Antes de descontinuarlos, prueba ponerlos en una oferta de descuento "
                    f"o pregunta a los asistentes si los conocen — a veces simplemente no se ven."
                )
            else:
                body += (
                    "No son un fracaso, pero sí necesitan un pequeño empujón. "
                    "Prueba incluirlos en paquetes con los más vendidos o ponerlos "
                    "en un lugar más visible durante los eventos."
                )
            recs.append({
                "icon": "",
                "title": "Productos que necesitan un empujón",
                "body": body,
                "type": "warning",
                "tag": "BAJO RENDIMIENTO"
            })

        # ── REC 3: Diversificación por categoría ──────────────────────────
        if len(categories) >= 2:
            top_cat = categories[0]
            low_cat = categories[-1]
            body = (
                f"La categoría «{top_cat['category']}» generó la mayor parte de los ingresos "
                f"con ${top_cat['revenue']:,.0f} MXN. "
                f"En cambio, «{low_cat['category']}» fue la que menos movió "
                f"(${low_cat['revenue']:,.0f} MXN). "
                f"Si quieres equilibrar mejor tus ventas, considera traer más variedad de "
                f"«{top_cat['category']}» en el siguiente evento y evalúa si vale la pena "
                f"seguir invirtiendo en «{low_cat['category']}» o redirigir ese presupuesto."
            )
            recs.append({
                "icon": "",
                "title": "¿En qué tipo de productos conviene invertir más?",
                "body": body,
                "type": "info",
                "tag": "DIVERSIFICACIÓN"
            })

        # ── REC 4: Vinculación con tipos de evento ────────────────────────
        if event_breakdown and len(event_breakdown) >= 2:
            best_ev = event_breakdown[0]
            worst_ev = event_breakdown[-1]
            body = (
                f"La mercancía se vende mejor en eventos de tipo «{best_ev.get('event_type', 'N/A')}» "
                f"donde se generaron ${best_ev.get('revenue', 0):,.0f} MXN. "
                f"En eventos de «{worst_ev.get('event_type', 'N/A')}» las ventas fueron más bajas. "
                f"Si organizas más eventos del primer tipo, puedes anticipar mayor demanda "
                f"de mercancía y preparar el inventario con tiempo."
            )
            recs.append({
                "icon": "",
                "title": "¿En qué eventos vende más tu tienda?",
                "body": body,
                "type": "info",
                "tag": "POR TIPO DE EVENTO"
            })

        # ── REC 5: Resumen financiero ─────────────────────────────────────
        if total_revenue > 0:
            # Calcular el % que los top 3 concentran
            top3_rev = sum(t["revenue"] for t in top[:3])
            concentration = round(top3_rev / total_revenue * 100, 1) if total_revenue > 0 else 0
            body = (
                f"En total tu tienda generó ${total_revenue:,.0f} MXN en ventas de mercancía. "
            )
            if concentration > 70:
                body += (
                    f"El {concentration}% de esos ingresos viene de solo 3 productos. "
                    f"Esto es bueno porque tienes éxitos claros, pero también significa que "
                    f"si alguno de ellos falla o se agota, los ingresos caerán notablemente. "
                    f"Intenta impulsar 2 o 3 productos más para tener una base más sólida."
                )
            else:
                body += (
                    f"Tus ventas están bien distribuidas entre varios productos, "
                    f"lo que hace tu negocio más estable y resistente."
                )
            recs.append({
                "icon": "",
                "title": "Salud financiera de tu tienda",
                "body": body,
                "type": "success",
                "tag": "FINANZAS"
            })

        # ── REC 6: Venta Cruzada (Cross-Selling ML) ───────────────────────
        if cross_sell_insight:
            base = cross_sell_insight["base_item"]
            rec = cross_sell_insight["rec_item"]
            conf = cross_sell_insight["confidence"]
            
            body = (
                f"Hemos detectado un fuerte patrón de compra conjunta: el {conf:.0f}% de los clientes "
                f"que compran «{base}» también adquieren «{rec}». "
                f"Te recomendamos crear un paquete promocional (Bundle) con ambos productos "
                f"u ofrecer «{rec}» como sugerencia automática (upsell) en el carrito cuando un usuario agregue «{base}»."
            )
            # Insertar en la segunda posición (Alta prioridad para ML)
            recs.insert(1, {
                "icon": "",
                "title": "Venta Cruzada Inteligente (Cross-Selling)",
                "body": body,
                "type": "success",
                "tag": "MACHINE LEARNING"
            })

        return recs
