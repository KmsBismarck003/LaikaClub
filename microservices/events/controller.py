from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date, time, datetime
from fastapi import HTTPException
from typing import Optional, List, Dict, Any
import traceback

def get_public_events(db: Session, category: Optional[str] = None, limit: int = 100):
    try:
        query = """
            SELECT e.*, 
                   v.name as venue_name,
                   m.id as municipality_id_val, m.name as municipality_name,
                   s.id as state_id, s.name as state_name,
                   c.id as country_id, c.name as country_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN municipalities m ON v.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN countries c ON s.country_id = c.id
            WHERE e.status = 'published'
        """
        params = {"limit": limit}
        if category:
            query += " AND e.category = :category"
            params['category'] = category
        query += " ORDER BY e.grid_position_y ASC, e.grid_position_x ASC, e.event_date ASC LIMIT :limit"
        
        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error en Event Service")

def get_all_events(db: Session, limit: int = 100, country_id: int = None, state_id: int = None, municipality_id: int = None, venue_id: int = None):
    try:
        query = """
            SELECT e.*, 
                   v.name as venue_name,
                   m.id as municipality_id_val, m.name as municipality_name,
                   s.id as state_id, s.name as state_name,
                   c.id as country_id, c.name as country_name
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN municipalities m ON v.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN countries c ON s.country_id = c.id
            WHERE 1=1
        """
        params = {"limit": limit}
        
        if country_id:
            query += " AND c.id = :country_id"
            params["country_id"] = country_id
        if state_id:
            query += " AND s.id = :state_id"
            params["state_id"] = state_id
        if municipality_id:
            query += " AND v.municipality_id = :municipality_id"
            params["municipality_id"] = municipality_id
        if venue_id:
            query += " AND e.venue_id = :venue_id"
            params["venue_id"] = venue_id
            
        query += " ORDER BY e.id DESC LIMIT :limit"
        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener todos los eventos")

def get_user_events(db: Session, user_id: int, limit: int = 100):
    try:
        query = "SELECT * FROM events WHERE created_by = :user_id OR assigned_manager_id = :user_id ORDER BY id DESC LIMIT :limit"
        result = db.execute(text(query), {"user_id": user_id, "limit": limit})
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener eventos del usuario")

def get_event_by_id(db: Session, event_id: int):
    try:
        query = text("""
            SELECT e.*, v.name as venue_name 
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE e.id = :event_id
        """)
        event = db.execute(query, {"event_id": event_id}).fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
        
        res = dict(event._mapping)
        
        # Cargar secciones y reglas
        sections_query = text("SELECT * FROM event_ticket_sections WHERE event_id = :event_id")
        sections_db = db.execute(sections_query, {"event_id": event_id}).fetchall()
        res['sections'] = [dict(s._mapping) for s in sections_db]

        rules_query = text("SELECT * FROM event_rules WHERE event_id = :event_id")
        rules_db = db.execute(rules_query, {"event_id": event_id}).fetchall()
        res['rules'] = [dict(r._mapping) for r in rules_db]

        functions_query = text("""
            SELECT ef.*, v.name AS venue_name, v.city AS venue_city, vr.name AS room_name,
                   m.name AS venue_municipality, s.name AS venue_state
            FROM event_functions ef
            LEFT JOIN venues v ON ef.venue_id = v.id
            LEFT JOIN venue_rooms vr ON ef.room_id = vr.id
            LEFT JOIN municipalities m ON v.municipality_id = m.id
            LEFT JOIN states s ON m.state_id = s.id
            WHERE ef.event_id = :event_id
        """)
        functions_db = db.execute(functions_query, {"event_id": event_id}).fetchall()
        res['functions'] = [dict(f._mapping) for f in functions_db]

        # Cargar sala y su mapa si room_id está definido
        if res.get('room_id'):
            room_query = text("SELECT * FROM venue_rooms WHERE id = :room_id")
            room_db = db.execute(room_query, {"room_id": res['room_id']}).fetchone()
            if room_db:
                room_dict = dict(room_db._mapping)
                layout_metadata = room_dict.get('layout_metadata')
                if isinstance(layout_metadata, str):
                    import json
                    try:
                        layout_metadata = json.loads(layout_metadata)
                    except:
                        layout_metadata = {}
                elif not layout_metadata:
                    layout_metadata = {}
                room_dict['layout_metadata'] = layout_metadata
                room_dict['layout_json'] = layout_metadata
                res['room'] = room_dict

        # Enriquecer con sumarios (evita 404s en el primer render del dashboard)
        res['ticket_summary'] = get_event_tickets_analytics(db, event_id)
        res['revenue_summary'] = get_event_revenue_analytics(db, event_id)

        return res
    except HTTPException:
        raise
    except Exception:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener evento")

def sanitize_dict(d: dict):
    """Convierte objetos date, time y datetime a strings para compatibilidad con SQLite."""
    for k, v in d.items():
        if isinstance(v, (date, time, datetime)):
            d[k] = str(v)
    return d

def create_event(db: Session, event_data: dict, user_id: int):
    try:
        data = event_data.dict()
        sections = data.pop('sections', []) or []
        rules = data.pop('rules', []) or []
        functions = data.pop('functions', []) or []
        
        # Sanitizar para SQLite
        data = sanitize_dict(data)
        
        # 1. Crear Evento
        data['created_by'] = user_id
        columns = ', '.join([f"`{k}`" for k in data.keys()])
        values_placeholders = ', '.join([f":{k}" for k in data.keys()])
        
        insert_event = text(f"""
            INSERT INTO events ({columns})
            VALUES ({values_placeholders})
        """)
        result = db.execute(insert_event, data)
        new_event_id = result.lastrowid
        
        # 2. Crear Secciones
        if sections:
            for s in sections:
                s['event_id'] = new_event_id
                s = sanitize_dict(s)
                cols_s = ', '.join([f"`{k}`" for k in s.keys()])
                vals_s = ', '.join([f":{k}" for k in s.keys()])
                db.execute(text(f"INSERT INTO event_ticket_sections ({cols_s}) VALUES ({vals_s})"), s)
                
        # 3. Crear Reglas
        if rules:
            for r in rules:
                r['event_id'] = new_event_id
                r = sanitize_dict(r)
                cols_r = ', '.join([f"`{k}`" for k in r.keys()])
                vals_r = ', '.join([f":{k}" for k in r.keys()])
                db.execute(text(f"INSERT INTO event_rules ({cols_r}) VALUES ({vals_r})"), r)

        # 4. Crear Funciones
        if functions:
            for f in functions:
                f['event_id'] = new_event_id
                f = sanitize_dict(f)
                cols_f = ', '.join([f"`{k}`" for k in f.keys()])
                vals_f = ', '.join([f":{k}" for k in f.keys()])
                db.execute(text(f"INSERT INTO event_functions ({cols_f}) VALUES ({vals_f})"), f)

        db.commit()
        return get_event_by_id(db, new_event_id)
        
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al crear evento")

def update_event(db: Session, event_id: int, event_data: dict):
    try:
        # Check exists
        get_event_by_id(db, event_id) # Raises 404 if not found
        
        data = event_data.dict(exclude_unset=True)
        sections = data.pop('sections', None)
        rules = data.pop('rules', None)
        functions = data.pop('functions', None)

        # Sanitizar para SQLite
        data = sanitize_dict(data)

        if data:
            set_clause = ", ".join([f"`{k}` = :{k}" for k in data.keys()])
            data['event_id'] = event_id
            update_query = text(f"UPDATE events SET {set_clause} WHERE id = :event_id")
            db.execute(update_query, data)

        if sections is not None:
            db.execute(text("DELETE FROM event_ticket_sections WHERE event_id = :event_id"), {"event_id": event_id})
            for s in sections:
                s.pop('id', None)
                s['event_id'] = event_id
                s = sanitize_dict(s)
                cols_s = ', '.join([f"`{k}`" for k in s.keys()])
                vals_s = ', '.join([f":{k}" for k in s.keys()])
                db.execute(text(f"INSERT INTO event_ticket_sections ({cols_s}) VALUES ({vals_s})"), s)

        if rules is not None:
            db.execute(text("DELETE FROM event_rules WHERE event_id = :event_id"), {"event_id": event_id})
            for r in rules:
                r.pop('id', None)
                r['event_id'] = event_id
                r = sanitize_dict(r)
                cols_r = ', '.join([f"`{k}`" for k in r.keys()])
                vals_r = ', '.join([f":{k}" for k in r.keys()])
                db.execute(text(f"INSERT INTO event_rules ({cols_r}) VALUES ({vals_r})"), r)

        if functions is not None:
            db.execute(text("DELETE FROM event_functions WHERE event_id = :event_id"), {"event_id": event_id})
            for f in functions:
                f.pop('id', None)
                f['event_id'] = event_id
                f = sanitize_dict(f)
                cols_f = ', '.join([f"`{k}`" for k in f.keys()])
                vals_f = ', '.join([f":{k}" for k in f.keys()])
                db.execute(text(f"INSERT INTO event_functions ({cols_f}) VALUES ({vals_f})"), f)

        db.commit()
        return get_event_by_id(db, event_id)
        
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al actualizar evento")

def publish_event(db: Session, event_id: int):
    try:
        query = text("UPDATE events SET status = 'published' WHERE id = :event_id")
        db.execute(query, {"event_id": event_id})
        db.commit()
        return {"status": "success", "message": "Evento publicado"}
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al publicar evento")

def unpublish_event(db: Session, event_id: int):
    try:
        query = text("UPDATE events SET status = 'draft' WHERE id = :event_id")
        db.execute(query, {"event_id": event_id})
        db.commit()
        return {"status": "success", "message": "Evento movido a borrador"}
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al despublicar evento")

def get_event_tickets_analytics(db: Session, event_id: int):
    try:
        # 1. Obtener capacidad total desde el evento
        event_q = text("SELECT total_tickets FROM events WHERE id = :event_id")
        event_res = db.execute(event_q, {"event_id": event_id}).fetchone()
        total_capacity = event_res[0] if event_res else 0

        # 2. Obtener conteos por estado
        stats_q = text("""
            SELECT status, COUNT(*) as count 
            FROM tickets 
            WHERE event_id = :event_id 
            GROUP BY status
        """)
        stats_res = db.execute(stats_q, {"event_id": event_id}).fetchall()
        stats = {row[0]: row[1] for row in stats_res}

        active = stats.get('active', 0)
        used = stats.get('used', 0)
        refunded = stats.get('refunded', 0)
        cancelled = stats.get('cancelled', 0)
        sold = active + used

        # 3. Obtener compras recientes
        recent_q = text("""
            SELECT t.ticket_code, u.first_name as customer, t.price, t.purchase_date, t.status
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.event_id = :event_id
            ORDER BY t.purchase_date DESC
            LIMIT 10
        """)
        recent_res = db.execute(recent_q, {"event_id": event_id}).fetchall()
        recent_purchases = []
        for row in recent_res:
            d = dict(row._mapping)
            if d['purchase_date']: d['purchase_date'] = str(d['purchase_date'])
            recent_purchases.append(d)

        sell_through_pct = round((sold / total_capacity * 100), 1) if total_capacity > 0 else 0

        return {
            "sold": sold,
            "total_capacity": total_capacity,
            "sell_through_pct": sell_through_pct,
            "active": active,
            "used": used,
            "refunded": refunded,
            "cancelled": cancelled,
            "available": total_capacity - sold,
            "recent_purchases": recent_purchases
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener analytics de tickets")

def get_event_revenue_analytics(db: Session, event_id: int):
    try:
        query = text("""
            SELECT 
                SUM(price) as gross,
                SUM(CASE WHEN status = 'refunded' THEN price ELSE 0 END) as refunded_amount,
                SUM(CASE WHEN status IN ('active', 'used') THEN price ELSE 0 END) as net,
                COUNT(CASE WHEN status IN ('active', 'used') THEN 1 END) as tickets_sold,
                COUNT(CASE WHEN status = 'refunded' THEN 1 END) as tickets_refunded
            FROM tickets 
            WHERE event_id = :event_id
        """)
        res = db.execute(query, {"event_id": event_id}).fetchone()
        
        projected_q = text("""
            SELECT SUM(capacity * price) as projected
            FROM event_ticket_sections
            WHERE event_id = :event_id
        """)
        projected_res = db.execute(projected_q, {"event_id": event_id}).fetchone()
        projected_total = projected_res[0] if projected_res and projected_res[0] else (res[0] or 0)

        return {
            "gross": float(res[0] or 0),
            "refunded_amount": float(res[1] or 0),
            "net": float(res[2] or 0),
            "tickets_sold": int(res[3] or 0),
            "tickets_refunded": int(res[4] or 0),
            "projected_total": float(projected_total)
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener analytics financieros")

