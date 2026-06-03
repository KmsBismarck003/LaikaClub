from sqlalchemy.orm import Session
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings, MerchandiseOrder, MerchandiseOrderItem
from microservices.merchandise.schemas import MerchandiseItemCreate, MerchandiseItemUpdate, MerchandiseSettingsBase, OrderCreate
from fastapi import HTTPException
from decimal import Decimal
from ..common.mongodb_sync import sync_purchase_to_mongo
import asyncio


def get_merchandise_item(db: Session, merch_id: int):
    return db.query(MerchandiseItem).filter(MerchandiseItem.id == merch_id).first()

def get_all_merchandise(db: Session, manager_id: int = None, status: str = None, event_id: int = None, admin_status: str = None):
    query = db.query(MerchandiseItem)
    if manager_id:
        query = query.filter(MerchandiseItem.manager_id == manager_id)
    if status:
        query = query.filter(MerchandiseItem.status == status)
    if event_id:
        query = query.filter(MerchandiseItem.event_id == event_id)
    if admin_status:
        query = query.filter(MerchandiseItem.admin_status == admin_status)
    return query.all()

def create_merchandise(db: Session, item_data: MerchandiseItemCreate, manager_id: int):
    settings = db.query(MerchandiseSettings).filter(MerchandiseSettings.manager_id == manager_id).first()
    
    event_allowed = False
    if item_data.event_id:
        try:
            import requests
            import os
            events_url = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8002")
            response = requests.get(f"{events_url}/{item_data.event_id}", timeout=2)
            if response.status_code == 200:
                event_data = response.json()
                if event_data and event_data.get("merch_enabled"):
                    event_allowed = True
        except Exception as e:
            print(f"[MERCH SERVICE] Error checking event merch_enabled: {e}")

    if not event_allowed:
        if not settings or not settings.is_enabled:
            raise HTTPException(status_code=403, detail="Store is not enabled for this manager.")

    db_item = MerchandiseItem(
        name=item_data.name,
        description=item_data.description,
        image_url=item_data.image_url,
        category=item_data.category,
        status=item_data.status,
        admin_status=item_data.admin_status,
        event_id=item_data.event_id,
        attributes_schema=item_data.attributes_schema,
        delivery_methods=item_data.delivery_methods,
        max_per_person=item_data.max_per_person,
        manager_id=manager_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Crear las variantes anidadas
    for variant in item_data.variants:
        db_variant = MerchandiseVariant(
            item_id=db_item.id,
            sku=variant.sku,
            attributes=variant.attributes,
            price=variant.price,
            stock=variant.stock,
            is_active=variant.is_active
        )
        db.add(db_variant)
        
    db.commit()
    db.refresh(db_item)
    return db_item

def update_merchandise(db: Session, merch_id: int, item_update: MerchandiseItemUpdate, manager_id: int):
    db_item = db.query(MerchandiseItem).filter(MerchandiseItem.id == merch_id, MerchandiseItem.manager_id == manager_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Merchandise not found or not owned by manager.")
    
    update_data = item_update.model_dump(exclude_unset=True)
    
    # Actualizar Item Principal
    if 'variants' in update_data:
        variants_data = update_data.pop('variants')
    else:
        variants_data = None
        
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    # Actualizar o Crear Variantes si se enviaron
    if variants_data is not None:
        # Delete variants that were removed in the frontend
        sent_ids = [v_data['id'] for v_data in variants_data if v_data.get('id')]
        delete_query = db.query(MerchandiseVariant).filter(MerchandiseVariant.item_id == db_item.id)
        if sent_ids:
            delete_query = delete_query.filter(~MerchandiseVariant.id.in_(sent_ids))
        delete_query.delete(synchronize_session=False)

        for v_data in variants_data:
            if v_data.get('id'):
                # Actualizar existente
                db_variant = db.query(MerchandiseVariant).filter(
                    MerchandiseVariant.id == v_data['id'],
                    MerchandiseVariant.item_id == db_item.id
                ).first()
                if db_variant:
                    for k, v in v_data.items():
                        if k != 'id':
                            setattr(db_variant, k, v)
            else:
                # Crear nueva variante
                db_variant = MerchandiseVariant(
                    item_id=db_item.id,
                    sku=v_data.get('sku'),
                    attributes=v_data.get('attributes'),
                    price=v_data.get('price', Decimal('0.0')),
                    stock=v_data.get('stock', 0),
                    is_active=v_data.get('is_active', True)
                )
                db.add(db_variant)
    
    db.commit()
    db.refresh(db_item)
    return db_item


def get_settings(db: Session, manager_id: int):
    settings = db.query(MerchandiseSettings).filter(MerchandiseSettings.manager_id == manager_id).first()
    if not settings:
        settings = MerchandiseSettings(manager_id=manager_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_settings(db: Session, manager_id: int, settings_update: MerchandiseSettingsBase):
    db_settings = get_settings(db, manager_id)
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
    if update_data.get('is_enabled') and not db_settings.enabled_at:
        from datetime import datetime
        db_settings.enabled_at = datetime.utcnow()
    db.commit()
    db.refresh(db_settings)
    return db_settings

def create_order(db: Session, order: OrderCreate):
    total_amount = Decimal("0.00")
    total_commission = Decimal("0.00")
    net_amount = Decimal("0.00")
    
    order_items = []
    
    for item in order.items:
        variant = db.query(MerchandiseVariant).filter(MerchandiseVariant.id == item.variant_id).first()
        if not variant:
            raise HTTPException(status_code=404, detail=f"Variant {item.variant_id} not found.")
        if variant.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for variant {item.variant_id}.")
        
        merch_item = variant.item
        
        # Validación max_per_person
        user_previous_orders = db.query(MerchandiseOrderItem).join(MerchandiseOrder).filter(
            MerchandiseOrder.user_id == order.user_id,
            MerchandiseOrderItem.variant_id == item.variant_id,
            MerchandiseOrder.status == 'completed'
        ).all()
        previous_quantity = sum([o.quantity for o in user_previous_orders])
        if previous_quantity + item.quantity > merch_item.max_per_person:
            raise HTTPException(status_code=400, detail=f"Limit exceeded. Max {merch_item.max_per_person} items per person allowed.")
            
        settings = get_settings(db, merch_item.manager_id)
        event_allowed = False
        if merch_item.event_id:
            try:
                import requests
                import os
                events_url = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8002")
                response = requests.get(f"{events_url}/{merch_item.event_id}", timeout=2)
                if response.status_code == 200:
                    event_data = response.json()
                    if event_data and event_data.get("merch_enabled"):
                        event_allowed = True
            except Exception as e:
                print(f"[MERCH SERVICE] Error checking event merch_enabled for order: {e}")

        if not event_allowed and not settings.is_enabled:
            raise HTTPException(status_code=400, detail=f"Store not enabled for merchandise {merch_item.id}.")
            
        unit_price = variant.price
        item_total = unit_price * item.quantity
        commission_rate = settings.commission_percentage / Decimal("100.00")
        item_commission = item_total * commission_rate
        item_net = item_total - item_commission
        
        total_amount += item_total
        total_commission += item_commission
        net_amount += item_net
        
        variant.stock -= item.quantity
        
        order_items.append(MerchandiseOrderItem(
            variant_id=variant.id,
            quantity=item.quantity,
            unit_price=unit_price
        ))

    db_order = MerchandiseOrder(
        user_id=order.user_id,
        total_amount=total_amount,
        total_commission=total_commission,
        net_amount=net_amount,
        status="completed",
        payment_method=order.payment_method
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for oi in order_items:
        oi.order_id = db_order.id
        db.add(oi)
        
    db.commit()
    db.refresh(db_order)
    
    # SINCRONIZACIÓN A MONGO (Para análisis Spark/Jupyter centralizado)
    try:
        items_summary = [{"variant_id": oi.variant_id, "quantity": oi.quantity} for oi in order_items]
        sync_data = {
            "order_id": int(db_order.id),
            "user_id": int(order.user_id),
            "total_amount": float(total_amount),
            "total_commission": float(total_commission),
            "net_amount": float(net_amount),
            "payment_method": order.payment_method,
            "status": "completed",
            "purchase_date": datetime.now().isoformat(),
            "items": items_summary,
            "type": "merchandise_purchase"
        }
        # Sincronizar de forma no bloqueante a MongoDB
        asyncio.create_task(sync_purchase_to_mongo(sync_data))
        print(f"[MONGO-SYNC] Merchandise order {db_order.id} scheduled for Mongo synchronization.")
    except Exception as mongo_ex:
        print(f"[MONGO-SYNC] Error scheduling merchandise order for Mongo sync: {mongo_ex}")
    
    return db_order
