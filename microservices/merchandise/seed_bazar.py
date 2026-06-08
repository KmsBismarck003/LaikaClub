import sys
import os
import sqlite3
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from decimal import Decimal
from datetime import datetime

# Add the project root to sys.path to allow absolute imports
sys.path.append(os.getcwd())

from microservices.merchandise.database import Base
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings

PRODUCTS_BY_EVENT = {
    "Afterlife México 2026": [
        {
            "name": "Playera Afterlife Spectrum",
            "description": "Playera oficial con el grafico del androide de Afterlife en la espalda, impresion de alta calidad en algodon negro.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 3,
            "variants": [
                {"sku": "AL-TEE-S", "attributes": {"talla": "S"}, "price": Decimal("450.00"), "stock": 100},
                {"sku": "AL-TEE-M", "attributes": {"talla": "M"}, "price": Decimal("450.00"), "stock": 150},
                {"sku": "AL-TEE-L", "attributes": {"talla": "L"}, "price": Decimal("450.00"), "stock": 120},
                {"sku": "AL-TEE-XL", "attributes": {"talla": "XL"}, "price": Decimal("480.00"), "stock": 80}
            ]
        },
        {
            "name": "Sudadera Afterlife Lineal",
            "description": "Sudadera con capucha premium de algodon pesado, bordado minimalista con la tipografia oficial en el pecho.",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL"], "color": ["Negro", "Gris"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 2,
            "variants": [
                {"sku": "AL-HOOD-BLK-S", "attributes": {"talla": "S", "color": "Negro"}, "price": Decimal("950.00"), "stock": 50},
                {"sku": "AL-HOOD-BLK-M", "attributes": {"talla": "M", "color": "Negro"}, "price": Decimal("950.00"), "stock": 70},
                {"sku": "AL-HOOD-BLK-L", "attributes": {"talla": "L", "color": "Negro"}, "price": Decimal("950.00"), "stock": 60},
                {"sku": "AL-HOOD-BLK-XL", "attributes": {"talla": "XL", "color": "Negro"}, "price": Decimal("950.00"), "stock": 40},
                {"sku": "AL-HOOD-GRY-S", "attributes": {"talla": "S", "color": "Gris"}, "price": Decimal("980.00"), "stock": 30},
                {"sku": "AL-HOOD-GRY-M", "attributes": {"talla": "M", "color": "Gris"}, "price": Decimal("980.00"), "stock": 40},
                {"sku": "AL-HOOD-GRY-L", "attributes": {"talla": "L", "color": "Gris"}, "price": Decimal("980.00"), "stock": 40},
                {"sku": "AL-HOOD-GRY-XL", "attributes": {"talla": "XL", "color": "Gris"}, "price": Decimal("980.00"), "stock": 20}
            ]
        },
        {
            "name": "Termo Afterlife Matte",
            "description": "Termo metalico de doble pared de vacio, mantiene bebidas frias por 24 horas. Grabado laser con el logo.",
            "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
            "category": "vasos",
            "is_official": True,
            "attributes_schema": {"capacidad": ["750ml"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 4,
            "variants": [
                {"sku": "AL-TRM-BLK-750", "attributes": {"capacidad": "750ml"}, "price": Decimal("499.00"), "stock": 120}
            ]
        },
        {
            "name": "Gorra Afterlife Core",
            "description": "Gorra snapback de visera plana, estructurada con el logo del androide bordado en hilo blanco.",
            "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"talla": ["Unitalla"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "AL-CAP-UNI", "attributes": {"talla": "Unitalla"}, "price": Decimal("350.00"), "stock": 200}
            ]
        },
        {
            "name": "Pulsera LED Afterlife",
            "description": "Pulsera de silicona con luz LED audiorritmica que se sincroniza con los visuales y la musica del evento.",
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"talla": ["Ajustable"]},
            "delivery_methods": ["PICKUP_AT_EVENT"],
            "max_per_person": 10,
            "variants": [
                {"sku": "AL-BAND-LED", "attributes": {"talla": "Ajustable"}, "price": Decimal("150.00"), "stock": 500}
            ]
        },
        {
            "name": "Pase Backstage Afterlife VIP",
            "description": "Credencial fisica coleccionable con holograma de seguridad. Incluye acceso a zona de descanso detras del escenario principal.",
            "image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800",
            "category": "boletos",
            "is_official": True,
            "attributes_schema": {"tipo": ["Acceso Backstage"]},
            "delivery_methods": ["PICKUP_AT_EVENT"],
            "max_per_person": 2,
            "variants": [
                {"sku": "AL-VIP-BACK", "attributes": {"tipo": "Acceso Backstage"}, "price": Decimal("2500.00"), "stock": 30}
            ]
        }
    ],
    "Rammstein: Zeit Tour 2026": [
        {
            "name": "Playera Rammstein Zeit",
            "description": "Playera de corte clasico con la portada del album Zeit en alta definicion. 100% algodon prelavado.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL", "XXL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 4,
            "variants": [
                {"sku": "RS-TEE-S", "attributes": {"talla": "S"}, "price": Decimal("500.00"), "stock": 100},
                {"sku": "RS-TEE-M", "attributes": {"talla": "M"}, "price": Decimal("500.00"), "stock": 150},
                {"sku": "RS-TEE-L", "attributes": {"talla": "L"}, "price": Decimal("500.00"), "stock": 150},
                {"sku": "RS-TEE-XL", "attributes": {"talla": "XL"}, "price": Decimal("500.00"), "stock": 100},
                {"sku": "RS-TEE-XXL", "attributes": {"talla": "XXL"}, "price": Decimal("530.00"), "stock": 50}
            ]
        },
        {
            "name": "Sudadera Rammstein Pirotecnia",
            "description": "Sudadera negra con gorro y estampado trasero de la iconica pirotecnia de la banda. Textura suave y resistente.",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["M", "L", "XL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 2,
            "variants": [
                {"sku": "RS-HOOD-M", "attributes": {"talla": "M"}, "price": Decimal("1100.00"), "stock": 60},
                {"sku": "RS-HOOD-L", "attributes": {"talla": "L"}, "price": Decimal("1100.00"), "stock": 80},
                {"sku": "RS-HOOD-XL", "attributes": {"talla": "XL"}, "price": Decimal("1100.00"), "stock": 50}
            ]
        },
        {
            "name": "Termo Rammstein Acero",
            "description": "Termo rustico de acero inoxidable con el logotipo de Rammstein grabado en relieve. Aislamiento termico de alto rendimiento.",
            "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
            "category": "vasos",
            "is_official": True,
            "attributes_schema": {"capacidad": ["1L"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 3,
            "variants": [
                {"sku": "RS-TRM-1L", "attributes": {"capacidad": "1L"}, "price": Decimal("600.00"), "stock": 90}
            ]
        },
        {
            "name": "Llavero Metalico Rammstein",
            "description": "Llavero de aleacion de zinc pulido a mano con la forma del mitico logo cruzado de Rammstein.",
            "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"material": ["Metal"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "RS-KEY-MET", "attributes": {"material": "Metal"}, "price": Decimal("180.00"), "stock": 300}
            ]
        },
        {
            "name": "Poster Oficial Zeit Holografico",
            "description": "Poster oficial impreso en papel holografico de alto gramaje con arte exclusivo para la gira en Mexico. Edicion numerada.",
            "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800",
            "category": "coleccionables",
            "is_official": True,
            "attributes_schema": {"tamano": ["60x90cm"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "RS-PST-HOL", "attributes": {"tamano": "60x90cm"}, "price": Decimal("350.00"), "stock": 150}
            ]
        },
        {
            "name": "Gorra Rammstein Industrial",
            "description": "Gorra tipo militar deslavada con parche bordado del logotipo de la banda. Broche ajustable de bronce.",
            "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"talla": ["Unitalla"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 3,
            "variants": [
                {"sku": "RS-CAP-MIL", "attributes": {"talla": "Unitalla"}, "price": Decimal("399.00"), "stock": 140}
            ]
        }
    ],
    "Vive Latino 2026": [
        {
            "name": "Playera Vive Latino 2026",
            "description": "Playera conmemorativa oficial del festival con la lista completa de bandas en la espalda.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL"], "color": ["Negro", "Blanco"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "VL-TEE-BLK-S", "attributes": {"talla": "S", "color": "Negro"}, "price": Decimal("400.00"), "stock": 100},
                {"sku": "VL-TEE-BLK-M", "attributes": {"talla": "M", "color": "Negro"}, "price": Decimal("400.00"), "stock": 150},
                {"sku": "VL-TEE-BLK-L", "attributes": {"talla": "L", "color": "Negro"}, "price": Decimal("400.00"), "stock": 150},
                {"sku": "VL-TEE-BLK-XL", "attributes": {"talla": "XL", "color": "Negro"}, "price": Decimal("400.00"), "stock": 80},
                {"sku": "VL-TEE-WHT-S", "attributes": {"talla": "S", "color": "Blanco"}, "price": Decimal("400.00"), "stock": 60},
                {"sku": "VL-TEE-WHT-M", "attributes": {"talla": "M", "color": "Blanco"}, "price": Decimal("400.00"), "stock": 100},
                {"sku": "VL-TEE-WHT-L", "attributes": {"talla": "L", "color": "Blanco"}, "price": Decimal("400.00"), "stock": 100},
                {"sku": "VL-TEE-WHT-XL", "attributes": {"talla": "XL", "color": "Blanco"}, "price": Decimal("400.00"), "stock": 50}
            ]
        },
        {
            "name": "Sudadera Vive Latino Tricolor",
            "description": "Sudadera premium sin cierre con bloques de color inspirados en el diseno visual de la edicion 2026.",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 3,
            "variants": [
                {"sku": "VL-HOOD-S", "attributes": {"talla": "S"}, "price": Decimal("899.00"), "stock": 50},
                {"sku": "VL-HOOD-M", "attributes": {"talla": "M"}, "price": Decimal("899.00"), "stock": 70},
                {"sku": "VL-HOOD-L", "attributes": {"talla": "L"}, "price": Decimal("899.00"), "stock": 80},
                {"sku": "VL-HOOD-XL", "attributes": {"talla": "XL"}, "price": Decimal("899.00"), "stock": 40}
            ]
        },
        {
            "name": "Termo VL Ecologico",
            "description": "Termo de plastico biodegradable de doble pared libre de BPA, ideal para transportar liquidos dentro del festival.",
            "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
            "category": "vasos",
            "is_official": True,
            "attributes_schema": {"capacidad": ["600ml"], "color": ["Azul", "Naranja"]},
            "delivery_methods": ["PICKUP_AT_EVENT"],
            "max_per_person": 4,
            "variants": [
                {"sku": "VL-TRM-BLU", "attributes": {"capacidad": "600ml", "color": "Azul"}, "price": Decimal("250.00"), "stock": 150},
                {"sku": "VL-TRM-ORG", "attributes": {"capacidad": "600ml", "color": "Naranja"}, "price": Decimal("250.00"), "stock": 150}
            ]
        },
        {
            "name": "Gorra VL Snapback",
            "description": "Gorra con el logotipo bordado en relieve plano, visera inferior estampada con el arte oficial del festival.",
            "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"talla": ["Unitalla"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 4,
            "variants": [
                {"sku": "VL-CAP-UNI", "attributes": {"talla": "Unitalla"}, "price": Decimal("320.00"), "stock": 200}
            ]
        },
        {
            "name": "Mochila Festivalera VL",
            "description": "Mochila tipo morral ligera y resistente al agua, compartimiento principal amplio para tus pertenencias durante el festival.",
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"color": ["Negro"]},
            "delivery_methods": ["HOME_DELIVERY", "PICKUP_AT_EVENT"],
            "max_per_person": 3,
            "variants": [
                {"sku": "VL-BAG-BLK", "attributes": {"color": "Negro"}, "price": Decimal("290.00"), "stock": 250}
            ]
        },
        {
            "name": "Llavero Destapador VL",
            "description": "Llavero funcional de metal con funcion de destapador de botellas y el grabado de la edicion 2026.",
            "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"tipo": ["Destapador"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 10,
            "variants": [
                {"sku": "VL-KEY-OPEN", "attributes": {"tipo": "Destapador"}, "price": Decimal("120.00"), "stock": 500}
            ]
        }
    ],
    "Fórmula 1 Gran Premio de México 2026": [
        {
            "name": "Playera Scuderia Mexico",
            "description": "Playera deportiva de poliester transpirable, corte atletico con los colores de la bandera nacional y logotipos de patrocinadores.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL"]},
            "delivery_methods": ["HOME_DELIVERY", "PICKUP_AT_EVENT"],
            "max_per_person": 3,
            "variants": [
                {"sku": "F1-TEE-S", "attributes": {"talla": "S"}, "price": Decimal("850.00"), "stock": 100},
                {"sku": "F1-TEE-M", "attributes": {"talla": "M"}, "price": Decimal("850.00"), "stock": 150},
                {"sku": "F1-TEE-L", "attributes": {"talla": "L"}, "price": Decimal("850.00"), "stock": 120},
                {"sku": "F1-TEE-XL", "attributes": {"talla": "XL"}, "price": Decimal("880.00"), "stock": 80}
            ]
        },
        {
            "name": "Gorra GP Mexico Bordada",
            "description": "Gorra de visera curva con bordado en 3D de la edicion especial del Gran Premio de Mexico. Materiales de alta resistencia.",
            "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"talla": ["Unitalla"], "color": ["Verde"]},
            "delivery_methods": ["HOME_DELIVERY", "PICKUP_AT_EVENT"],
            "max_per_person": 4,
            "variants": [
                {"sku": "F1-CAP-GRN", "attributes": {"talla": "Unitalla", "color": "Verde"}, "price": Decimal("750.00"), "stock": 250}
            ]
        },
        {
            "name": "Termo Fibra de Carbono GP",
            "description": "Termo de viaje de acero inoxidable con textura exterior que simula fibra de carbono y valvula de apertura rapida.",
            "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
            "category": "vasos",
            "is_official": True,
            "attributes_schema": {"capacidad": ["500ml"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 3,
            "variants": [
                {"sku": "F1-TRM-CARB", "attributes": {"capacidad": "500ml"}, "price": Decimal("650.00"), "stock": 150}
            ]
        },
        {
            "name": "Mochila Deportiva F1",
            "description": "Mochila aerodinamica con compartimiento acolchado para laptop y bolsillos laterales de malla.",
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"capacidad": ["25L"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 2,
            "variants": [
                {"sku": "F1-BAG-DEP", "attributes": {"capacidad": "25L"}, "price": Decimal("1200.00"), "stock": 100}
            ]
        },
        {
            "name": "Llavero Casco Mini F1",
            "description": "Replica a escala mini en 3D de un casco de piloto de Formula 1 en llavero metalico esmaltado.",
            "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"color": ["Rojo", "Amarillo"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "F1-KEY-RED", "attributes": {"color": "Rojo"}, "price": Decimal("220.00"), "stock": 200},
                {"sku": "F1-KEY-YLW", "attributes": {"color": "Amarillo"}, "price": Decimal("220.00"), "stock": 150}
            ]
        },
        {
            "name": "Pase VIP Paddock Club",
            "description": "Credencial oficial de coleccion para el acceso al Lounge Paddock. No incluye boleto de entrada general al autodromo.",
            "image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800",
            "category": "boletos",
            "is_official": True,
            "attributes_schema": {"pase": ["Lounge Access"]},
            "delivery_methods": ["PICKUP_AT_EVENT"],
            "max_per_person": 2,
            "variants": [
                {"sku": "F1-VIP-PAD", "attributes": {"pase": "Lounge Access"}, "price": Decimal("6500.00"), "stock": 20}
            ]
        }
    ],
    "Avengers: Endgame (Función Especial)": [
        {
            "name": "Playera Reactor Arc",
            "description": "Playera negra con el diseno del Reactor Arc de Iron Man en el pecho, estampado con tinta fotoluminiscente que brilla en la oscuridad.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["S", "M", "L", "XL", "XXL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 4,
            "variants": [
                {"sku": "AV-TEE-S", "attributes": {"talla": "S"}, "price": Decimal("380.00"), "stock": 100},
                {"sku": "AV-TEE-M", "attributes": {"talla": "M"}, "price": Decimal("380.00"), "stock": 150},
                {"sku": "AV-TEE-L", "attributes": {"talla": "L"}, "price": Decimal("380.00"), "stock": 150},
                {"sku": "AV-TEE-XL", "attributes": {"talla": "XL"}, "price": Decimal("380.00"), "stock": 100},
                {"sku": "AV-TEE-XXL", "attributes": {"talla": "XXL"}, "price": Decimal("400.00"), "stock": 50}
            ]
        },
        {
            "name": "Sudadera Guantelete",
            "description": "Sudadera con gorro y diseno impreso de las gemas del infinito en la manga derecha. Algodon perchado ultra suave.",
            "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800",
            "category": "ropa",
            "is_official": True,
            "attributes_schema": {"talla": ["M", "L", "XL"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 2,
            "variants": [
                {"sku": "AV-HOOD-M", "attributes": {"talla": "M"}, "price": Decimal("850.00"), "stock": 80},
                {"sku": "AV-HOOD-L", "attributes": {"talla": "L"}, "price": Decimal("850.00"), "stock": 90},
                {"sku": "AV-HOOD-XL", "attributes": {"talla": "XL"}, "price": Decimal("850.00"), "stock": 60}
            ]
        },
        {
            "name": "Termo Avengers Insulado",
            "description": "Vaso termo con popote de metal y el logotipo clasico de los Vengadores. Excelente retencion de temperatura.",
            "image_url": "https://images.unsplash.com/photo-1576085898323-2183ba9a200c?auto=format&fit=crop&w=800",
            "category": "vasos",
            "is_official": True,
            "attributes_schema": {"capacidad": ["750ml"], "color": ["Azul Marino"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "AV-TRM-BLU", "attributes": {"capacidad": "750ml", "color": "Azul Marino"}, "price": Decimal("420.00"), "stock": 150}
            ]
        },
        {
            "name": "Llavero Escudo Cap",
            "description": "Llavero giratorio metalico tridimensional con la forma del escudo del Capitan America. Pintura esmaltada duradera.",
            "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800",
            "category": "accesorios",
            "is_official": True,
            "attributes_schema": {"material": ["Acero"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "AV-KEY-SHLD", "attributes": {"material": "Acero"}, "price": Decimal("150.00"), "stock": 300}
            ]
        },
        {
            "name": "Set de Stickers Avengers Vinil",
            "description": "Paquete con 10 calcomanias de vinil troqueladas de alta calidad, resistentes al agua y al sol. Diseños de personajes clasicos.",
            "image_url": "https://images.unsplash.com/photo-1572375995501-4b0894dbe7d1?auto=format&fit=crop&w=800",
            "category": "coleccionables",
            "is_official": True,
            "attributes_schema": {"cantidad": ["10 piezas"]},
            "delivery_methods": ["HOME_DELIVERY"],
            "max_per_person": 10,
            "variants": [
                {"sku": "AV-STK-SET", "attributes": {"cantidad": "10 piezas"}, "price": Decimal("99.00"), "stock": 400}
            ]
        },
        {
            "name": "Boleto Metalico Conmemorativo",
            "description": "Replica de boleto de cine fabricado en metal dorado con grabados detallados de los heroes originales de la funcion especial.",
            "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800",
            "category": "coleccionables",
            "is_official": True,
            "attributes_schema": {"acabado": ["Dorado"]},
            "delivery_methods": ["PICKUP_AT_EVENT", "HOME_DELIVERY"],
            "max_per_person": 5,
            "variants": [
                {"sku": "AV-TKT-MET", "attributes": {"acabado": "Dorado"}, "price": Decimal("299.00"), "stock": 120}
            ]
        }
    ]
}

GENERAL_PRODUCTS = [
    {
        "name": "Gorra Laika",
        "description": "Gorra oficial de nuestra tienda Laika Club, diseno snapback estructurado con el logotipo de la marca bordado en relieve tridimensional.",
        "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e881?auto=format&fit=crop&w=800",
        "category": "accesorios",
        "is_official": True,
        "attributes_schema": {"talla": ["Unitalla"], "color": ["Negro", "Rojo"]},
        "delivery_methods": ["HOME_DELIVERY", "PICKUP_AT_EVENT"],
        "max_per_person": 5,
        "variants": [
            {"sku": "LK-CAP-BLK", "attributes": {"talla": "Unitalla", "color": "Negro"}, "price": Decimal("299.00"), "stock": 250},
            {"sku": "LK-CAP-RED", "attributes": {"talla": "Unitalla", "color": "Rojo"}, "price": Decimal("299.00"), "stock": 250}
        ]
    }
]

def query_events_sqlite():
    db_path = "microservices/events/events.db"
    mappings = {}
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            names = list(PRODUCTS_BY_EVENT.keys())
            placeholders = ",".join("?" for _ in names)
            cur.execute(f"SELECT id, assigned_manager_id, name FROM events WHERE name IN ({placeholders})", names)
            rows = cur.fetchall()
            for r in rows:
                mappings[r[2]] = {"event_id": r[0], "manager_id": r[1] or 1}
            conn.close()
        except Exception as e:
            print(f"[SQLite events query] Error: {e}")
    return mappings

def query_events_mysql():
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")
    mappings = {}
    try:
        conn = pymysql.connect(
            host=host,
            user=user,
            password="root" if not password else password,
            database=database,
            charset="utf8mb4"
        )
        cur = conn.cursor()
        names = list(PRODUCTS_BY_EVENT.keys())
        placeholders = ",".join("%s" for _ in names)
        cur.execute(f"SELECT id, assigned_manager_id, name FROM events WHERE name IN ({placeholders})", names)
        rows = cur.fetchall()
        for r in rows:
            mappings[r[2]] = {"event_id": r[0], "manager_id": r[1] or 1}
        conn.close()
    except Exception as e:
        print(f"[MySQL events query] Error: {e}")
    return mappings

def seed_db(db_session, mappings, default_manager_id):
    try:
        print("Limpiando base de datos de mercancia...")
        db_session.query(MerchandiseVariant).delete()
        db_session.query(MerchandiseItem).delete()
        db_session.commit()

        # Seed settings for all managers we will use
        manager_ids = {default_manager_id}
        for name, ev_info in mappings.items():
            manager_ids.add(ev_info["manager_id"])

        print(f"Sembrando configuraciones para gestores: {manager_ids}...")
        for mid in manager_ids:
            settings = MerchandiseSettings(manager_id=mid, is_enabled=True, activation_fee_paid=True)
            db_session.merge(settings)
        db_session.commit()

        print("Sembrando productos de catalogo...")
        
        # 1. Seed products for the 5 events
        for event_name, products in PRODUCTS_BY_EVENT.items():
            ev_info = mappings.get(event_name, {"event_id": None, "manager_id": default_manager_id})
            event_id = ev_info["event_id"]
            manager_id = ev_info["manager_id"]
            
            print(f"  Sembrando {len(products)} productos para '{event_name}' (Event ID: {event_id}, Manager ID: {manager_id})...")
            for p in products:
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
                    manager_id=manager_id,
                    event_id=event_id
                )
                db_session.add(item)
                db_session.commit()
                db_session.refresh(item)

                for v in p["variants"]:
                    variant = MerchandiseVariant(
                        item_id=item.id,
                        sku=v["sku"],
                        attributes=v["attributes"],
                        price=v["price"],
                        stock=v["stock"]
                    )
                    db_session.add(variant)
                db_session.commit()

        # 2. Seed General products
        print(f"  Sembrando {len(GENERAL_PRODUCTS)} productos generales de la tienda...")
        for p in GENERAL_PRODUCTS:
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
                manager_id=default_manager_id,
                event_id=None
            )
            db_session.add(item)
            db_session.commit()
            db_session.refresh(item)

            for v in p["variants"]:
                variant = MerchandiseVariant(
                    item_id=item.id,
                    sku=v["sku"],
                    attributes=v["attributes"],
                    price=v["price"],
                    stock=v["stock"]
                )
                db_session.add(variant)
            db_session.commit()

        print("Base de datos sembrada exitosamente.")

    except Exception as e:
        print(f"Error sembrando base de datos: {e}")
        db_session.rollback()

def seed_sqlite():
    db_path = "microservices/merchandise/merchandise.db"
    if not os.path.exists(os.path.dirname(db_path)):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    print(f"\n--- Sembrando SQLite: {db_path} ---")
    engine = create_engine(f"sqlite:///./{db_path}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    # Run migrations/alter tables to be sure columns exist
    from microservices.merchandise.database import run_migrations
    run_migrations(engine)
    
    Session = sessionmaker(bind=engine)
    db = Session()
    
    mappings = query_events_sqlite()
    print(f"Mapped events in SQLite: {mappings}")
    
    seed_db(db, mappings, default_manager_id=1)
    db.close()

def seed_mysql():
    host = os.getenv("MYSQL_HOST", "localhost")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    database = os.getenv("MYSQL_DATABASE", "laika_club3_v2")
    
    mysql_url = f"mysql+pymysql://{user}:{'root' if not password else password}@{host}:3306/{database}"
    
    print(f"\n--- Sembrando MySQL: {host} @ {database} ---")
    try:
        engine = create_engine(mysql_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        
        # Run migrations
        from microservices.merchandise.database import run_migrations
        run_migrations(engine)
        
        Session = sessionmaker(bind=engine)
        db = Session()
        
        mappings = query_events_mysql()
        print(f"Mapped events in MySQL: {mappings}")
        
        # In MySQL, let's find the first gestor user in the database to use as default_manager_id
        default_manager_id = 1
        try:
            conn = pymysql.connect(
                host=host,
                user=user,
                password="root" if not password else password,
                database=database,
                charset="utf8mb4"
            )
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE role = 'gestor' ORDER BY id ASC LIMIT 1")
            row = cur.fetchone()
            if row:
                default_manager_id = row[0]
            conn.close()
        except Exception as e:
            print(f"Could not fetch first gestor from MySQL, using fallback ID 1. Error: {e}")
            
        seed_db(db, mappings, default_manager_id=default_manager_id)
        db.close()
    except Exception as e:
        print(f"MySQL connection/seeding failed: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    seed_sqlite()
    seed_mysql()
