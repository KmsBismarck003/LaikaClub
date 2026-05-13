from typing import Optional, List, Dict
from fastapi import HTTPException
from ...domain.interfaces.event_repository import IEventRepository
from ...domain.entities.event import Event, EventSection, EventRule

class EventService:
    def __init__(self, event_repo: IEventRepository):
        self.event_repo = event_repo

    def get_event(self, event_id: int) -> dict:
        event = self.event_repo.find_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")
            
        # Convert to dictionary response for presentation layer
        return {
            "id": event.id,
            "title": event.title,
            "name": event.name,
            "description": event.description,
            "event_date": event.event_date,
            "event_time": event.event_time,
            "location": event.location,
            "venue": event.venue,
            "price": event.price,
            "total_tickets": event.total_tickets,
            "available_tickets": event.available_tickets,
            "image_url": event.image_url,
            "status": event.status,
            "category": event.category,
            "created_by": event.created_by,
            "banner_url": event.banner_url,
            "thumbnail_url": event.thumbnail_url,
            "grid_position_x": event.grid_position_x,
            "grid_position_y": event.grid_position_y,
            "grid_span_x": event.grid_span_x,
            "grid_span_y": event.grid_span_y,
            "grid_page": event.grid_page,
            "sections": [{"id": s.id, "name": s.name, "capacity": s.capacity, "price": s.price, "available": s.available, "badge_text": s.badge_text, "color_hex": s.color_hex} for s in event.sections],
            "rules": [{"id": r.id, "rule_type": r.rule_type, "description": r.description, "title": r.title, "icon": r.icon} for r in event.rules]
        }

    def create_event(self, data: dict, user_id: int) -> dict:
        # Create Entity objects from raw dict
        sections_data = data.pop('sections', []) or []
        rules_data = data.pop('rules', []) or []
        
        sections = [EventSection(name=s['name'], capacity=s['capacity'], price=s['price']) for s in sections_data]
        rules = [EventRule(rule_type=r['rule_type'], description=r['description']) for r in rules_data]
        
        new_event = Event(
            title=data.get('title', ''),
            description=data.get('description', ''),
            event_date=data.get('event_date', ''),
            status=data.get('status', 'draft'),
            category=data.get('category', ''),
            created_by=user_id,
            banner_url=data.get('banner_url'),
            thumbnail_url=data.get('thumbnail_url'),
            grid_position_x=data.get('grid_position_x', 0),
            grid_position_y=data.get('grid_position_y', 0),
            sections=sections,
            rules=rules
        )
        
        saved_event = self.event_repo.save(new_event)
        return self.get_event(saved_event.id)
