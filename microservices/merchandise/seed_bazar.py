import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decimal import Decimal

# Add the project root to sys.path to allow absolute imports
sys.path.append(os.getcwd())

from microservices.merchandise.database import Base, DB_PATH
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings

def seed():
    SQLALCHEMY_DATABASE_URL = f"sqlite:///./{DB_PATH}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        # if db.query(MerchandiseItem).count() > 0:
        #     print("Database already has data. Skipping seed.")
        #     return

        print("Seeding merchandise database...")

        # 1. Ensure a manager setting exists (dummy manager index 1)
        settings = MerchandiseSettings(manager_id=1, is_enabled=True, activation_fee_paid=True)
        db.merge(settings)
        db.commit()

        # 2. Add some products
        products_data = [
            {
                "name": "Backstage Pass: 'The Wall' Experience",
                "description": "Acceso total a camerinos, meet & greet y catering premium. El pase definitivo para fans.",
                "image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800",
                "category": "vip",
                "is_official": True,
                "variants": [{"size": "VIP", "price": Decimal("2500.00"), "stock": 5}]
            },
            {
                "name": "Sudadera 'Glitch Archive' - Ltd Edition",
                "description": "Sudadera de alta densidad con diseño bordado. Solo 50 unidades producidas.",
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
                "category": "sudaderas",
                "is_official": True,
                "variants": [{"size": "M", "price": Decimal("950.00"), "stock": 10}, {"size": "L", "price": Decimal("950.00"), "stock": 15}]
            },
            {
                "name": "Gorra 'Red Industrial' - Flash Sale",
                "description": "Gorra con acentos rojos. Oferta limitada por 24 horas.",
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
                "category": "accesorios",
                "is_official": False,
                "variants": [{"color": "Rojo/Negro", "price": Decimal("199.00"), "stock": 50}]
            },
            {
                "name": "Playera 'Cyber Laika' - Edición Neon",
                "description": "Playera de algodón 100% con estampado neon de alta durabilidad.",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
                "category": "playeras",
                "is_official": False,
                "variants": [{"size": "S", "price": Decimal("350.00"), "stock": 50}]
            }
        ]

        for p in products_data:
            item = MerchandiseItem(
                name=p["name"],
                description=p["description"],
                image_url=p["image_url"],
                category=p["category"],
                is_official=p["is_official"],
                status="published",
                manager_id=1
            )
            db.add(item)
            db.commit()
            db.refresh(item)

            for v in p["variants"]:
                variant = MerchandiseVariant(
                    item_id=item.id,
                    sku=v.get("sku", f"{p['category'][:2]}-{item.id}-{v.get('size', 'U')}"),
                    size=v.get("size"),
                    color=v.get("color"),
                    price=v["price"],
                    stock=v["stock"]
                )
                db.add(variant)
            db.commit()

        print("Successfully seeded 8 initial products for the Bazaar.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
