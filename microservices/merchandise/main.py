from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from microservices.merchandise.database import engine, Base, get_db
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings, MerchandiseOrder, MerchandiseOrderItem
from microservices.merchandise.schemas import MerchandiseItemCreate, MerchandiseItemUpdate, MerchandiseItemResponse, MerchandiseSettingsBase, MerchandiseSettingsResponse, OrderCreate, OrderResponse
import microservices.merchandise.controller as controller

# Crear tablas
import os
import jwt
from dotenv import load_dotenv
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laika Merchandise Service", version="2.0.0")

SECRET_KEY = os.getenv('JWT_SECRET', 'tu_clave_secreta_aqui')
ALGORITHM = "HS256"

def get_token_payload(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
    except Exception as e:
        print(f"DEBUG: JWT Decode Error in Merchandise: {str(e)}")
    return None

def get_current_user_id(authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)):
    payload = get_token_payload(authorization)
    if payload:
        user_id = payload.get('id') or payload.get('user_id')
        if user_id:
            return int(user_id)
    if x_user_id:
        return int(x_user_id)
    return 1 # Fallback dummy ID for dev

def get_current_role(authorization: Optional[str] = Header(None), x_user_role: Optional[str] = Header(None)):
    payload = get_token_payload(authorization)
    if payload:
        role = payload.get('role')
        if role:
            return role
    if x_user_role:
        return x_user_role
    return 'gestor'


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "merchandise_v2"}


# --- Merchandise Items (Products) ---
@app.post("/", response_model=MerchandiseItemResponse)
def create_merchandise(item: MerchandiseItemCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id), role: str = Depends(get_current_role)):
    if role not in ['gestor', 'admin']:
        raise HTTPException(status_code=403, detail="Only managers / admins can create merchandise.")
    return controller.create_merchandise(db=db, item_data=item, manager_id=user_id)

@app.get("/", response_model=List[MerchandiseItemResponse])
def get_all_merchandise(manager_id: Optional[int] = None, status: Optional[str] = None, event_id: Optional[int] = None, admin_status: Optional[str] = None, db: Session = Depends(get_db)):
    return controller.get_all_merchandise(db, manager_id=manager_id, status=status, event_id=event_id, admin_status=admin_status)

@app.get("/{merch_id}", response_model=MerchandiseItemResponse)
def get_merchandise(merch_id: int, db: Session = Depends(get_db)):
    db_item = controller.get_merchandise_item(db, merch_id=merch_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Merchandise not found")
    return db_item

@app.put("/{merch_id}", response_model=MerchandiseItemResponse)
def update_merchandise(merch_id: int, item: MerchandiseItemUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return controller.update_merchandise(db=db, merch_id=merch_id, item_update=item, manager_id=user_id)

@app.delete("/{merch_id}")
def delete_merchandise(merch_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_item = db.query(MerchandiseItem).filter(MerchandiseItem.id == merch_id, MerchandiseItem.manager_id == user_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Merchandise not found or not owned by manager.")
    
    # Delete associated variants first
    db.query(MerchandiseVariant).filter(MerchandiseVariant.item_id == merch_id).delete()
    
    db.delete(db_item)
    db.commit()
    return {"message": "Merchandise deleted successfully"}


@app.put("/{merch_id}/admin_status", response_model=MerchandiseItemResponse)
def update_admin_status(merch_id: int, status_update: MerchandiseItemUpdate, db: Session = Depends(get_db), role: str = Depends(get_current_role)):
    if role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can update admin status.")
    
    db_item = controller.get_merchandise_item(db, merch_id=merch_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Merchandise not found.")
    
    if status_update.admin_status:
        db_item.admin_status = status_update.admin_status
        db.commit()
        db.refresh(db_item)
        
    return db_item


# --- Admin and Settings ---
@app.get("/settings/{manager_id}", response_model=MerchandiseSettingsResponse)
def get_settings(manager_id: int, db: Session = Depends(get_db)):
    return controller.get_settings(db=db, manager_id=manager_id)

@app.put("/settings/{manager_id}", response_model=MerchandiseSettingsResponse)
def update_settings(manager_id: int, settings: MerchandiseSettingsBase, db: Session = Depends(get_db), role: str = Depends(get_current_role)):
    if role != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can update settings.")
    return controller.update_settings(db=db, manager_id=manager_id, settings_update=settings)


# --- Orders ---
@app.post("/orders/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return controller.create_order(db=db, order=order)

@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(MerchandiseOrder).filter(MerchandiseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
