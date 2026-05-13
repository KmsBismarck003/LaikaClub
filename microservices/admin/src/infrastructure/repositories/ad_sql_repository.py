from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from ...domain.entities.ad import Ad
from ...domain.interfaces.ad_repository import IAdRepository

class AdSQLRepository(IAdRepository):
    def __init__(self, db: Session):
        self.db = db

    def _map_to_entity(self, row) -> Ad:
        if not row:
            return None
        d = dict(row._mapping)
        return Ad(
            id=d.get('id'),
            title=d.get('title'),
            image_url=d.get('image_url'),
            link_url=d.get('link_url'),
            position=d.get('position'),
            active=bool(d.get('active', False)),
            created_at=d.get('created_at'),
            click_count=d.get('click_count', 0)
        )

    def find_all(self, only_active: bool = False) -> List[Ad]:
        if only_active:
            rows = self.db.execute(text("SELECT * FROM ads WHERE active=1 ORDER BY id DESC")).fetchall()
        else:
            rows = self.db.execute(text("""
                SELECT a.*, (SELECT COUNT(*) FROM ad_clicks ac WHERE ac.ad_id = a.id) as click_count
                FROM ads a 
                ORDER BY a.id DESC
            """)).fetchall()
        return [self._map_to_entity(r) for r in rows]

    def find_by_id(self, ad_id: int) -> Optional[Ad]:
        row = self.db.execute(text("SELECT * FROM ads WHERE id=:id"), {"id": ad_id}).fetchone()
        return self._map_to_entity(row)

    def save(self, ad: Ad) -> Ad:
        self.db.execute(text("""
            INSERT INTO ads (title, image_url, link_url, position, active)
            VALUES (:t, :i, :l, :p, :a)
        """), {"t": ad.title, "i": ad.image_url, "l": ad.link_url, "p": ad.position, "a": int(ad.active)})
        self.db.commit()
        
        row = self.db.execute(text("SELECT * FROM ads ORDER BY id DESC LIMIT 1")).fetchone()
        return self._map_to_entity(row)

    def update(self, ad: Ad) -> Ad:
        self.db.execute(text("""
            UPDATE ads 
            SET title=:t, image_url=:i, link_url=:l, position=:p, active=:a 
            WHERE id=:id
        """), {"t": ad.title, "i": ad.image_url, "l": ad.link_url, "p": ad.position, "a": int(ad.active), "id": ad.id})
        self.db.commit()
        return self.find_by_id(ad.id)

    def delete(self, ad_id: int) -> None:
        self.db.execute(text("DELETE FROM ads WHERE id=:id"), {"id": ad_id})
        self.db.commit()

    def record_click(self, ad_id: int, user_id: Optional[int] = None) -> None:
        self.db.execute(text("""
            INSERT INTO ad_clicks (ad_id, user_id, clicked_at)
            VALUES (:ad_id, :user_id, CURRENT_TIMESTAMP)
        """), {"ad_id": ad_id, "user_id": user_id})
        self.db.commit()

    def get_clicks_info(self, ad_id: int) -> List[dict]:
        rows = self.db.execute(text("""
            SELECT ac.clicked_at, u.id as user_id, u.full_name, u.email, u.profile_image
            FROM ad_clicks ac
            LEFT JOIN users u ON ac.user_id = u.id
            WHERE ac.ad_id = :ad_id
            ORDER BY ac.clicked_at DESC
        """), {"ad_id": ad_id}).fetchall()
        
        clicks = []
        for r in rows:
            d = dict(r._mapping)
            if d.get('clicked_at') and hasattr(d['clicked_at'], 'isoformat'):
                d['clicked_at'] = d['clicked_at'].isoformat()
            clicks.append(d)
        return clicks
