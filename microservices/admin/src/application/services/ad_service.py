from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from ...domain.interfaces.ad_repository import IAdRepository
from ...domain.entities.ad import Ad

class AdService:
    def __init__(self, ad_repo: IAdRepository):
        self.ad_repo = ad_repo

    def get_public_ads(self) -> List[Dict[str, Any]]:
        ads = self.ad_repo.find_all(only_active=True)
        return [self._format_ad(ad) for ad in ads]

    def get_all_ads(self) -> List[Dict[str, Any]]:
        ads = self.ad_repo.find_all(only_active=False)
        return [self._format_ad(ad) for ad in ads]

    def create_ad(self, data: dict) -> Dict[str, Any]:
        new_ad = Ad(
            title=data.get('title'),
            image_url=data.get('image_url'),
            link_url=data.get('link_url'),
            position=data.get('position', 'main'),
            active=data.get('active', True)
        )
        saved_ad = self.ad_repo.save(new_ad)
        return self._format_ad(saved_ad)

    def update_ad(self, ad_id: int, data: dict) -> Dict[str, Any]:
        ad = self.ad_repo.find_by_id(ad_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Anuncio no encontrado")

        if 'title' in data and data['title'] is not None:
            ad.title = data['title']
        if 'image_url' in data and data['image_url'] is not None:
            ad.image_url = data['image_url']
        if 'link_url' in data and data['link_url'] is not None:
            ad.link_url = data['link_url']
        if 'position' in data and data['position'] is not None:
            ad.position = data['position']
        if 'active' in data and data['active'] is not None:
            ad.active = bool(data['active'])

        updated_ad = self.ad_repo.update(ad)
        return self._format_ad(updated_ad)

    def delete_ad(self, ad_id: int) -> dict:
        self.ad_repo.delete(ad_id)
        return {"success": True}

    def record_click(self, ad_id: int, user_id: Optional[int] = None) -> dict:
        self.ad_repo.record_click(ad_id, user_id)
        return {"success": True}

    def get_ad_clicks(self, ad_id: int) -> List[dict]:
        return self.ad_repo.get_clicks_info(ad_id)

    def _format_ad(self, ad: Ad) -> dict:
        return {
            "id": ad.id,
            "title": ad.title,
            "image_url": ad.image_url,
            "link_url": ad.link_url,
            "position": ad.position,
            "active": ad.active,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
            "click_count": getattr(ad, 'click_count', 0)
        }
