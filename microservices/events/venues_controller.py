from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
import json
import traceback
from typing import Dict, Any

from . import venues_schemas as schemas

def get_countries(db: Session):
    try:
        result = db.execute(text("SELECT * FROM countries ORDER BY name ASC"))
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener países")

def get_states(db: Session, country_id: int):
    try:
        result = db.execute(text("SELECT * FROM states WHERE country_id = :cid ORDER BY name ASC"), {"cid": country_id})
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener estados")

def get_municipalities(db: Session, state_id: int):
    try:
        result = db.execute(text("SELECT * FROM municipalities WHERE state_id = :sid ORDER BY name ASC"), {"sid": state_id})
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al obtener municipios")

def get_seat_types(db: Session):
    try:
        result = db.execute(text("SELECT * FROM seat_types ORDER BY id ASC"))
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener tipos de asiento")

def get_venues(db: Session, status_filter: str = None, country_id: int = None, state_id: int = None, municipality_id: int = None, manager_id: int = None):
    try:
        query = """
            SELECT v.*, 
                   m.name as municipality_name,
                   s.id as state_id, s.name as state_name,
                   c.id as country_id, c.name as country_name,
                   u.first_name as manager_first_name, u.last_name as manager_last_name
            FROM venues v 
            LEFT JOIN municipalities m ON v.municipality_id = m.id 
            LEFT JOIN states s ON m.state_id = s.id
            LEFT JOIN countries c ON s.country_id = c.id
            LEFT JOIN users u ON v.assigned_manager_id = u.id
            WHERE 1=1
        """
        params = {}
        if status_filter and status_filter != 'all':
            query += " AND v.status = :status"
            params["status"] = status_filter
        
        if country_id:
            query += " AND c.id = :country_id"
            params["country_id"] = country_id
            
        if state_id:
            query += " AND s.id = :state_id"
            params["state_id"] = state_id
            
        if municipality_id:
            query += " AND v.municipality_id = :municipality_id"
            params["municipality_id"] = municipality_id

        if manager_id:
            query += " AND v.assigned_manager_id = :manager_id"
            params["manager_id"] = manager_id
        
        query += " ORDER BY v.name ASC"
        
        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener recintos")

def create_venue(db: Session, venue_data: schemas.VenueCreate):
    try:
        res = db.execute(text("""
            INSERT INTO venues (name, city, address, map_url, capacity, status, municipality_id, assigned_manager_id)
            VALUES (:name, :city, :address, :map_url, :capacity, :status, :municipality_id, :assigned_manager_id)
        """), {
            "name": venue_data.name,
            "city": venue_data.city,
            "address": venue_data.address,
            "map_url": venue_data.map_url,
            "capacity": venue_data.capacity,
            "status": venue_data.status,
            "municipality_id": venue_data.municipality_id,
            "assigned_manager_id": venue_data.assigned_manager_id
        })
        db.commit()
        new_id = res.lastrowid
        return {"id": new_id, "message": "Recinto creado exitosamente"}
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear recinto: {str(e)}")

def update_venue(db: Session, venue_id: int, venue_data: schemas.VenueUpdate):
    try:
        # Check if exists
        venue = db.execute(text("SELECT id FROM venues WHERE id = :id"), {"id": venue_id}).fetchone()
        if not venue:
            raise HTTPException(status_code=404, detail="Recinto no encontrado")

        update_fields = []
        params = {"id": venue_id}
        
        data_dict = venue_data.model_dump(exclude_unset=True)
        for key, value in data_dict.items():
            update_fields.append(f"{key} = :{key}")
            params[key] = value
            
        if not update_fields:
            return {"message": "No hay campos para actualizar"}
            
        query = f"UPDATE venues SET {', '.join(update_fields)} WHERE id = :id"
        db.execute(text(query), params)
        db.commit()
        return {"success": True, "message": "Recinto actualizado"}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar recinto: {str(e)}")

def delete_venue(db: Session, venue_id: int):
    try:
        # Check if exists
        venue = db.execute(text("SELECT id FROM venues WHERE id = :id"), {"id": venue_id}).fetchone()
        if not venue:
            raise HTTPException(status_code=404, detail="Recinto no encontrado")
            
        # Logical delete by default if there are related records, or just status='deleted'
        db.execute(text("UPDATE venues SET status = 'deleted' WHERE id = :id"), {"id": venue_id})
        db.commit()
        return {"success": True, "message": "Recinto marcado como eliminado"}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar recinto")


def get_venue_rooms(db: Session, venue_id: int):
    try:
        result = db.execute(text("SELECT * FROM venue_rooms WHERE venue_id = :venue_id ORDER BY name ASC"), {"venue_id": venue_id})
        rooms = []
        for row in result.fetchall():
            room_dict = dict(row._mapping)
            # Add has_map flag for frontend
            room_dict['has_map'] = room_dict.get('layout_mode') in ('map', 'grid')
            rooms.append(room_dict)
        return rooms
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener salas del recinto")

def create_venue_room(db: Session, venue_id: int, room_data: schemas.VenueRoomCreate):
    try:
        layout_mode = 'map' if room_data.has_map else 'general_admission'
        res = db.execute(text("""
            INSERT INTO venue_rooms (venue_id, name, capacity, status, layout_mode)
            VALUES (:venue_id, :name, :capacity, :status, :layout_mode)
        """), {
            "venue_id": venue_id,
            "name": room_data.name,
            "capacity": room_data.capacity,
            "status": room_data.status,
            "layout_mode": layout_mode
        })
        db.commit()
        return {"id": res.lastrowid, "message": "Sala creada exitosamente"}
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear sala: {str(e)}")

def update_venue_room(db: Session, venue_id: int, room_id: int, room_data: schemas.VenueRoomUpdate):
    try:
        # Check if exists
        room = db.execute(text("SELECT id FROM venue_rooms WHERE id = :id AND venue_id = :vid"), 
                          {"id": room_id, "vid": venue_id}).fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="Sala no encontrada")

        update_fields = []
        params = {"id": room_id}
        
        data_dict = room_data.model_dump(exclude_unset=True)
        
        # Handle has_map separately
        if 'has_map' in data_dict:
            has_map = data_dict.pop('has_map')
            update_fields.append("layout_mode = :layout_mode")
            params["layout_mode"] = 'map' if has_map else 'general_admission'

        for key, value in data_dict.items():
            update_fields.append(f"{key} = :{key}")
            params[key] = value
            
        if not update_fields:
            return {"message": "No hay campos para actualizar"}
            
        query = f"UPDATE venue_rooms SET {', '.join(update_fields)} WHERE id = :id"
        db.execute(text(query), params)
        db.commit()
        return {"success": True, "message": "Sala actualizada exitosamente"}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al actualizar sala: {str(e)}")

def get_venue_room_map(db: Session, room_id: int):
    try:
        # Get Room
        room = db.execute(text("SELECT * FROM venue_rooms WHERE id = :room_id"), {"room_id": room_id}).fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="Sala no encontrada")
        room_data = dict(room._mapping)

        # Parse layout_metadata
        layout_metadata = room_data.get('layout_metadata')
        if isinstance(layout_metadata, str):
            try:
                layout_metadata = json.loads(layout_metadata)
            except:
                layout_metadata = {}
        
        # Get Zones
        zones = db.execute(text("SELECT * FROM seating_zones WHERE room_id = :room_id"), {"room_id": room_id}).fetchall()
        
        # Get Blocks
        blocks = db.execute(text("SELECT * FROM seating_blocks WHERE room_id = :room_id"), {"room_id": room_id}).fetchall()
        
        # Get Seats
        seats = db.execute(text("SELECT * FROM room_seats WHERE room_id = :room_id"), {"room_id": room_id}).fetchall()

        return {
            "room": {
                "id": room_data['id'],
                "name": room_data['name'],
                "layout_mode": room_data['layout_mode'],
                "layout_metadata": layout_metadata
            },
            "layout_json": layout_metadata,
            "zones": [
                {
                    **dict(z._mapping),
                    "geometry_json": json.loads(z.geometry_json) if isinstance(z.geometry_json, str) else (z.geometry_json if z.geometry_json else {})
                } for z in zones
            ],
            "blocks": [
                {
                    **dict(b._mapping),
                    "config": json.loads(b.config) if isinstance(b.config, str) else b.config
                } for b in blocks
            ],
            "seats": [dict(s._mapping) for s in seats]
        }
    except HTTPException: raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error al obtener mapa de la sala")

def save_venue_room_map(db: Session, room_id: int, payload: schemas.MapBuilderPayload):
    try:
        # Verify Room
        room = db.execute(text("SELECT id, capacity FROM venue_rooms WHERE id = :room_id"), {"room_id": room_id}).fetchone()
        if not room:
            raise HTTPException(status_code=404, detail="Sala no encontrada")
            
        room_capacity = room[1]
        
        # Verify Capacity
        if len(payload.seats) > room_capacity:
            raise HTTPException(status_code=400, detail=f"Límite excedido. El mapa tiene {len(payload.seats)} asientos pero la sala solo permite {room_capacity}.")

        # 1. Update Room Metadata
        layout_meta = payload.layout_json if payload.layout_json is not None else payload.layout_metadata
        layout_meta_json = json.dumps(layout_meta) if layout_meta else None
        db.execute(text("""
            UPDATE venue_rooms 
            SET layout_mode = :layout_mode, layout_metadata = :layout_metadata 
            WHERE id = :room_id
        """), {
            "layout_mode": payload.layout_mode,
            "layout_metadata": layout_meta_json,
            "room_id": room_id
        })

        # Mappings for temp IDs to real IDs
        zone_id_map = {}
        block_id_map = {}
        
        # Lists to keep track of what to NOT delete
        keep_zone_ids = []
        keep_block_ids = []
        keep_seat_ids = []

        # 2. Process Zones
        for zone in payload.zones:
            geometry_json = json.dumps(zone.geometry_json) if zone.geometry_json else None
            # Si el ID es un entero > 0, es una actualización de algo existente
            is_existing = isinstance(zone.id, int) and zone.id > 0
            
            if is_existing:
                # Update
                db.execute(text("""
                    UPDATE seating_zones 
                    SET name = :name, color_hex = :color_hex, geometry_json = :geometry_json 
                    WHERE id = :id AND room_id = :room_id
                """), {
                    "name": zone.name, "color_hex": zone.color_hex, "geometry_json": geometry_json,
                    "id": zone.id, "room_id": room_id
                })
                keep_zone_ids.append(zone.id)
                zone_id_map[zone.id] = zone.id
            else:
                # Insert (Nuevos o temporales con string)
                res = db.execute(text("""
                    INSERT INTO seating_zones (room_id, name, color_hex, geometry_json) 
                    VALUES (:room_id, :name, :color_hex, :geometry_json)
                """), {
                    "room_id": room_id, "name": zone.name, "color_hex": zone.color_hex, "geometry_json": geometry_json
                })
                new_id = res.lastrowid
                keep_zone_ids.append(new_id)
                if zone.id:
                    zone_id_map[zone.id] = new_id

        # 3. Process Blocks
        for block in payload.blocks:
            config_json = json.dumps(block.config) if block.config else None
            is_existing = isinstance(block.id, int) and block.id > 0
            
            if is_existing:
                # Update
                db.execute(text("""
                    UPDATE seating_blocks 
                    SET name = :name, x_position = :x, y_position = :y, rotation = :r, config = :config 
                    WHERE id = :id AND room_id = :room_id
                """), {
                    "name": block.name, "x": block.x_position, "y": block.y_position, 
                    "r": block.rotation, "config": config_json,
                    "id": block.id, "room_id": room_id
                })
                keep_block_ids.append(block.id)
                block_id_map[block.id] = block.id
            else:
                # Insert
                res = db.execute(text("""
                    INSERT INTO seating_blocks (room_id, name, x_position, y_position, rotation, config) 
                    VALUES (:room_id, :name, :x, :y, :r, :config)
                """), {
                    "room_id": room_id, "name": block.name, "x": block.x_position, 
                    "y": block.y_position, "r": block.rotation, "config": config_json
                })
                new_id = res.lastrowid
                keep_block_ids.append(new_id)
                if block.id:
                    block_id_map[block.id] = new_id

        # 4. Process Seats
        for seat in payload.seats:
            # Map block and zone IDs if they were temporary
            real_block_id = block_id_map.get(seat.block_id, seat.block_id) if seat.block_id is not None else None
            real_zone_id = zone_id_map.get(seat.zone_id, seat.zone_id) if seat.zone_id is not None else None
            
            is_existing = isinstance(seat.id, int) and seat.id > 0

            if is_existing:
                # Update
                db.execute(text("""
                    UPDATE room_seats 
                    SET block_id = :b, zone_id = :z, seat_type_id = :st, seat_label = :sl, 
                        x_position = :x, y_position = :y, status = :status 
                    WHERE id = :id AND room_id = :room_id
                """), {
                    "b": real_block_id, "z": real_zone_id, "st": seat.seat_type_id, 
                    "sl": seat.seat_label, "x": seat.x_position, "y": seat.y_position, 
                    "status": seat.status, "id": seat.id, "room_id": room_id
                })
                keep_seat_ids.append(seat.id)
            else:
                # Insert
                res = db.execute(text("""
                    INSERT INTO room_seats (room_id, block_id, zone_id, seat_type_id, seat_label, x_position, y_position, status) 
                    VALUES (:room_id, :b, :z, :st, :sl, :x, :y, :status)
                """), {
                    "room_id": room_id, "b": real_block_id, "z": real_zone_id, "st": seat.seat_type_id, 
                    "sl": seat.seat_label, "x": seat.x_position, "y": seat.y_position, "status": seat.status
                })
                keep_seat_ids.append(res.lastrowid)

        # 5. Cleanup (Delete items that were removed in the builder)
        # Seats
        if keep_seat_ids:
            format_strings = ','.join([':id_' + str(i) for i in range(len(keep_seat_ids))])
            params = {f"id_{i}": keep_seat_ids[i] for i in range(len(keep_seat_ids))}
            params["room_id"] = room_id
            db.execute(text(f"DELETE FROM room_seats WHERE room_id = :room_id AND id NOT IN ({format_strings})"), params)
        else:
            db.execute(text("DELETE FROM room_seats WHERE room_id = :room_id"), {"room_id": room_id})

        # Blocks
        if keep_block_ids:
            format_strings = ','.join([':id_' + str(i) for i in range(len(keep_block_ids))])
            params = {f"id_{i}": keep_block_ids[i] for i in range(len(keep_block_ids))}
            params["room_id"] = room_id
            db.execute(text(f"DELETE FROM seating_blocks WHERE room_id = :room_id AND id NOT IN ({format_strings})"), params)
        else:
            db.execute(text("DELETE FROM seating_blocks WHERE room_id = :room_id"), {"room_id": room_id})

        # Zones
        if keep_zone_ids:
            format_strings = ','.join([':id_' + str(i) for i in range(len(keep_zone_ids))])
            params = {f"id_{i}": keep_zone_ids[i] for i in range(len(keep_zone_ids))}
            params["room_id"] = room_id
            db.execute(text(f"DELETE FROM seating_zones WHERE room_id = :room_id AND id NOT IN ({format_strings})"), params)
        else:
            db.execute(text("DELETE FROM seating_zones WHERE room_id = :room_id"), {"room_id": room_id})

        db.commit()
        return {"success": True, "message": "Mapa guardado exitosamente"}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al guardar el mapa: {str(e)}")
