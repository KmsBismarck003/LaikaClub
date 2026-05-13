import sys
import os
import random
from decimal import Decimal

# Añadir la raíz del proyecto al path
sys.path.append(os.getcwd())

from microservices.merchandise.database import SessionLocal, Base, engine
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings

def seed_marketplace():
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Asegurar que el manager 1 tenga la tienda habilitada
        settings = db.query(MerchandiseSettings).filter(MerchandiseSettings.manager_id == 1).first()
        if not settings:
            settings = MerchandiseSettings(manager_id=1, is_enabled=True, activation_fee_paid=True)
            db.add(settings)
        else:
            settings.is_enabled = True
        db.commit()

        # 2. Datos de productos
        CATEGORIES = ["playeras", "sudaderas", "bombers", "stickers", "tazas", "llaveros", "coleccionables", "carteles"]
        
        SAMPLES = [
            # PLAYERAS
            {"name": "Camiseta Laika Cyberpunk", "cat": "playeras", "price": 19.99, "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"},
            {"name": "T-Shirt Industrial Rust", "cat": "playeras", "price": 24.50, "img": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"},
            {"name": "Oversized 'Comandante' Tee", "cat": "playeras", "price": 29.99, "img": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500"},
            {"name": "Minimalist Orbit Tee", "cat": "playeras", "price": 15.00, "img": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"},
            
            # SUDADERAS
            {"name": "Hoodie Laika Dark Matter", "cat": "sudaderas", "price": 45.99, "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"},
            {"name": "Sudadera Tech-Wear", "cat": "sudaderas", "price": 55.00, "img": "https://images.unsplash.com/photo-1578762560042-46ad127c9563?w=500"},
            {"name": "Space Cadet Crewneck", "cat": "sudaderas", "price": 39.99, "img": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"},
            
            # BOMBERS
            {"name": "Bomber Jacket Sputnik-1", "cat": "bombers", "price": 89.99, "img": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"},
            {"name": "Chaqueta Piloto Alpha", "cat": "bombers", "price": 120.00, "img": "https://images.unsplash.com/photo-1544022613-e87ed3b3df04?w=500"},
            
            # STICKERS
            {"name": "Pack Stickers Holográficos", "cat": "stickers", "price": 5.99, "img": "https://images.unsplash.com/photo-1589384416864-03fa4188e614?w=500"},
            {"name": "Vinyl Sticker 'Don't Stop'", "cat": "stickers", "price": 2.50, "img": "https://images.unsplash.com/photo-1589384416864-03fa4188e614?w=500"},
            
            # TAZAS
            {"name": "Taza Cerámica Negro Matte", "cat": "tazas", "price": 12.99, "img": "https://images.unsplash.com/photo-1514228742587-6b1558fbed20?w=500"},
            {"name": "Mug Térmico Laika", "cat": "tazas", "price": 18.50, "img": "https://images.unsplash.com/photo-1514228742587-6b1558fbed20?w=500"},
            
            # LLAVEROS
            {"name": "Llavero Metálico 'Orbit'", "cat": "llaveros", "price": 8.00, "img": "https://images.unsplash.com/photo-1544298621-aa3afcc74efe?w=500"},
            
            # COLECCIONABLES
            {"name": "Figura Sputnik Colección", "cat": "coleccionables", "price": 150.00, "img": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=500"},
            {"name": "Casco Astronauta Réplica", "cat": "coleccionables", "price": 299.99, "img": "https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?w=500"},
            
            # CARTELES
            {"name": "Poster Tour 2024", "cat": "carteles", "price": 14.99, "img": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=500"},
            {"name": "Litho Laika Legacy", "cat": "carteles", "price": 25.00, "img": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=500"},
        ]

        # Multiplicar por 2 para llegar a ~36 productos
        for _ in range(2):
            for sample in SAMPLES:
                item = MerchandiseItem(
                    name=f"{sample['name']} {random.randint(1,99)}",
                    description=f"Diseño exclusivo de la línea {sample['cat']}. Materiales de alta calidad con acabado industrial.",
                    image_url=sample['img'],
                    manager_id=1,
                    category=sample['cat'],
                    is_official=False, # Marketplace items
                    rating=round(random.uniform(4.0, 5.0), 1),
                    status='published'
                )
                db.add(item)
                db.commit()
                db.refresh(item)
                
                # Variantes
                if sample['cat'] in ['playeras', 'sudaderas', 'bombers']:
                    sizes = ['S', 'M', 'L', 'XL']
                    for s in sizes:
                        var = MerchandiseVariant(
                            item_id=item.id,
                            sku=f"{sample['cat'][:2].upper()}-{item.id}-{s}",
                            size=s,
                            price=Decimal(str(sample['price'])),
                            stock=random.randint(5, 50)
                        )
                        db.add(var)
                else:
                    var = MerchandiseVariant(
                        item_id=item.id,
                        sku=f"{sample['cat'][:2].upper()}-{item.id}-UNI",
                        size="One Size",
                        price=Decimal(str(sample['price'])),
                        stock=random.randint(10, 100)
                    )
                    db.add(var)
                db.commit()

        print(f"Successfully seeded {len(db.query(MerchandiseItem).all())} products.")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_marketplace()
