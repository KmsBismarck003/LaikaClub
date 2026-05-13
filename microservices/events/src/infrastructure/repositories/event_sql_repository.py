from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
from ...domain.entities.event import Event, EventSection, EventRule
from ...domain.interfaces.event_repository import IEventRepository

class EventSQLRepository(IEventRepository):
    def __init__(self, db: Session):
        self.db = db

    def _map_to_entity(self, row: dict, sections: list, rules: list) -> Event:
        if not row: return None
        
        event_sections = [
            EventSection(
                name=s.get('name'),
                capacity=s.get('capacity'),
                price=s.get('price'),
                id=s.get('id'),
                event_id=s.get('event_id'),
                available=s.get('available'),
                badge_text=s.get('badge_text'),
                color_hex=s.get('color_hex')
            ) for s in sections
        ]
        
        event_rules = [
            EventRule(
                description=r.get('description'),
                rule_type=r.get('rule_type'),
                id=r.get('id'),
                event_id=r.get('event_id'),
                title=r.get('title'),
                icon=r.get('icon')
            ) for r in rules
        ]
        
        return Event(
            id=row.get('id'),
            title=row.get('title', row.get('name', '')), # support old name
            name=row.get('name', row.get('title', '')),
            description=row.get('description', ''),
            event_date=row.get('event_date', ''),
            event_time=row.get('event_time'),
            status=row.get('status', 'draft'),
            category=row.get('category', ''),
            created_by=row.get('created_by'),
            banner_url=row.get('banner_url', row.get('image_url')),
            thumbnail_url=row.get('thumbnail_url', row.get('image_url')),
            image_url=row.get('image_url', row.get('banner_url')),
            location=row.get('location'),
            venue=row.get('venue'),
            price=row.get('price'),
            total_tickets=row.get('total_tickets'),
            available_tickets=row.get('available_tickets'),
            grid_position_x=row.get('grid_position_x', 0),
            grid_position_y=row.get('grid_position_y', 0),
            grid_span_x=row.get('grid_span_x', 1),
            grid_span_y=row.get('grid_span_y', 1),
            grid_page=row.get('grid_page', 0),
            sections=event_sections,
            rules=event_rules
        )

    def find_by_id(self, event_id: int) -> Optional[Event]:
        event = self.db.execute(text("SELECT * FROM events WHERE id = :id"), {"id": event_id}).mappings().fetchone()
        if not event:
            return None
            
        sections = self.db.execute(text("SELECT * FROM event_ticket_sections WHERE event_id = :id"), {"id": event_id}).mappings().fetchall()
        rules = self.db.execute(text("SELECT * FROM event_rules WHERE event_id = :id"), {"id": event_id}).mappings().fetchall()
        
        return self._map_to_entity(dict(event), [dict(s) for s in sections], [dict(r) for r in rules])

    def find_all(self, limit: int = 100) -> List[Event]:
        events_rows = self.db.execute(text("SELECT * FROM events ORDER BY id DESC LIMIT :limit"), {"limit": limit}).mappings().fetchall()
        
        # In a real heavy app, N+1 query problem should be fixed here using IN clause.
        result = []
        for row in events_rows:
            sections = self.db.execute(text("SELECT * FROM event_ticket_sections WHERE event_id = :id"), {"id": row['id']}).mappings().fetchall()
            rules = self.db.execute(text("SELECT * FROM event_rules WHERE event_id = :id"), {"id": row['id']}).mappings().fetchall()
            result.append(self._map_to_entity(dict(row), [dict(s) for s in sections], [dict(r) for r in rules]))
            
        return result

    def save(self, event: Event) -> Event:
        # Create event
        insert_event = text("""
            INSERT INTO events (title, description, event_date, status, category, created_by, banner_url, thumbnail_url, grid_position_x, grid_position_y)
            VALUES (:title, :description, :event_date, :status, :category, :created_by, :banner_url, :thumbnail_url, :grid_position_x, :grid_position_y)
        """)
        
        result = self.db.execute(insert_event, {
            "title": event.title,
            "description": event.description,
            "event_date": event.event_date,
            "status": event.status,
            "category": event.category,
            "created_by": event.created_by,
            "banner_url": event.banner_url,
            "thumbnail_url": event.thumbnail_url,
            "grid_position_x": event.grid_position_x,
            "grid_position_y": event.grid_position_y
        })
        new_event_id = result.lastrowid
        
        # Insert sections
        for s in event.sections:
            self.db.execute(text("INSERT INTO event_ticket_sections (name, capacity, price, event_id) VALUES (:name, :cap, :price, :eid)"), 
                            {"name": s.name, "cap": s.capacity, "price": s.price, "eid": new_event_id})
                            
        # Insert rules
        for r in event.rules:
            self.db.execute(text("INSERT INTO event_rules (rule_type, description, event_id) VALUES (:rtype, :desc, :eid)"),
                            {"rtype": r.rule_type, "desc": r.description, "eid": new_event_id})
                            
        self.db.commit()
        return self.find_by_id(new_event_id)

    def delete(self, event_id: int) -> None:
        self.db.execute(text("DELETE FROM events WHERE id = :id"), {"id": event_id})
        self.db.commit()
