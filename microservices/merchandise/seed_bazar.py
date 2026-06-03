import sys
import os
from sqlalchemy.orm import sessionmaker
from decimal import Decimal

# Add the project root to sys.path to allow absolute imports
sys.path.append(os.getcwd())

from microservices.merchandise.database import Base, engine, SessionLocal
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings

def seed():
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        print("Limpiando base de datos de mercancia...")
        db.query(MerchandiseVariant).delete()
        db.query(MerchandiseItem).delete()
        db.commit()

        print("Sembrando configuracion de gestor...")
        settings = MerchandiseSettings(manager_id=1, is_enabled=True, activation_fee_paid=True)
        db.merge(settings)
        db.commit()

        print("Sembrando catalogo de mercancia de produccion...")

        products_data = [
            {
                "name": "Sudadera Chrome Industrial Bad Bunny",
                "description": "Sudadera oficial de edicion limitada con tipografia de cromo brillante. Algodon pesado de alta calidad.",
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
                "category": "ropa",
                "is_official": True,
                "attributes_schema": {"talla": ["S", "M", "L", "XL"], "color": ["Negro", "Plata"]},
                "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
                "max_per_person": 2,
                "variants": [
                    {"sku": "BB-HOOD-BLK-S", "attributes": {"talla": "S", "color": "Negro"}, "price": Decimal("950.00"), "stock": 10},
                    {"sku": "BB-HOOD-BLK-M", "attributes": {"talla": "M", "color": "Negro"}, "price": Decimal("950.00"), "stock": 15},
                    {"sku": "BB-HOOD-BLK-L", "attributes": {"talla": "L", "color": "Negro"}, "price": Decimal("950.00"), "stock": 5},
                    {"sku": "BB-HOOD-BLK-XL", "attributes": {"talla": "XL", "color": "Negro"}, "price": Decimal("950.00"), "stock": 0}, # Agotado
                    {"sku": "BB-HOOD-SLV-M", "attributes": {"talla": "M", "color": "Plata"}, "price": Decimal("1100.00"), "stock": 8},
                    {"sku": "BB-HOOD-SLV-L", "attributes": {"talla": "L", "color": "Plata"}, "price": Decimal("1100.00"), "stock": 12}
                ]
            },
            {
                "name": "Playera Cyber Laika - Edicion Neon",
                "description": "Playera de algodon 100% con estampado neon de alta durabilidad y diseno minimalista.",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
                "category": "ropa",
                "is_official": True,
                "attributes_schema": {"talla": ["S", "M", "L"]},
                "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
                "max_per_person": 3,
                "variants": [
                    {"sku": "LK-TEE-S", "attributes": {"talla": "S"}, "price": Decimal("350.00"), "stock": 20},
                    {"sku": "LK-TEE-M", "attributes": {"talla": "M"}, "price": Decimal("350.00"), "stock": 0}, # Agotado
                    {"sku": "LK-TEE-L", "attributes": {"talla": "L"}, "price": Decimal("350.00"), "stock": 35}
                ]
            },
            {
                "name": "Termo de Acero Inoxidable Laika",
                "description": "Termo de acero inoxidable de doble capa para mantener bebidas frias o calientes. Grabado en laser.",
                "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
                "category": "vaso",
                "is_official": True,
                "attributes_schema": {"capacidad": ["500ml", "750ml"], "color": ["Negro Mate", "Rojo Laika"]},
                "delivery_methods": ["HOME_DELIVERY"],
                "max_per_person": 5,
                "variants": [
                    {"sku": "LK-TRM-BLK-500", "attributes": {"capacidad": "500ml", "color": "Negro Mate"}, "price": Decimal("450.00"), "stock": 25},
                    {"sku": "LK-TRM-BLK-750", "attributes": {"capacidad": "750ml", "color": "Negro Mate"}, "price": Decimal("550.00"), "stock": 12},
                    {"sku": "LK-TRM-RED-500", "attributes": {"capacidad": "500ml", "color": "Rojo Laika"}, "price": Decimal("450.00"), "stock": 0}, # Agotado
                    {"sku": "LK-TRM-RED-750", "attributes": {"capacidad": "750ml", "color": "Rojo Laika"}, "price": Decimal("550.00"), "stock": 18}
                ]
            },
            {
                "name": "Pase de Acceso Backstage VIP",
                "description": "Acceso total a camerinos, meet & greet y catering premium. El pase definitivo para fans del evento.",
                "image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800",
                "category": "boleto",
                "is_official": True,
                "attributes_schema": {"acceso": ["Camerinos", "Meet & Greet"]},
                "delivery_methods": ["PICKUP_AT_EVENT"],
                "max_per_person": 1,
                "variants": [
                    {"sku": "EV-VIP-CAM", "attributes": {"acceso": "Camerinos"}, "price": Decimal("2500.00"), "stock": 5},
                    {"sku": "EV-VIP-M&G", "attributes": {"acceso": "Meet & Greet"}, "price": Decimal("4000.00"), "stock": 3}
                ]
            },
            {
                "name": "Gorra Laika Red Industrial",
                "description": "Gorra snapback de edicion especial con visera plana y bordado en 3D del logotipo industrial.",
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
                "category": "gorras",
                "is_official": False,
                "attributes_schema": {"talla": ["Unitalla"]},
                "delivery_methods": ["HOME_DELIVERY"],
                "max_per_person": 4,
                "variants": [
                    {"sku": "LK-CAP-UNI", "attributes": {"talla": "Unitalla"}, "price": Decimal("299.00"), "stock": 50}
                ]
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
                admin_status="approved",
                attributes_schema=p["attributes_schema"],
                delivery_methods=p["delivery_methods"],
                max_per_person=p["max_per_person"],
                manager_id=1
            )
            db.add(item)
            db.commit()
            db.refresh(item)

            for v in p["variants"]:
                variant = MerchandiseVariant(
                    item_id=item.id,
                    sku=v["sku"],
                    attributes=v["attributes"],
                    price=v["price"],
                    stock=v["stock"]
                )
                db.add(variant)
            db.commit()

        print("Base de datos sembrada con exito.")

    except Exception as e:
        print(f"Error sembrando base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
