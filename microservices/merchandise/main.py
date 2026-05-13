from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from microservices.merchandise.database import engine, Base, get_db
from microservices.merchandise.models import MerchandiseItem, MerchandiseVariant, MerchandiseSettings, MerchandiseOrder, MerchandiseOrderItem
from microservices.merchandise.schemas import MerchandiseItemCreate, MerchandiseItemUpdate, MerchandiseItemResponse, MerchandiseSettingsBase, MerchandiseSettingsResponse, OrderCreate, OrderResponse
import microservices.merchandise.controller as controller

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laika Merchandise Service", version="2.0.0")

def get_current_user_id(x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        return 1 # Fallback dummy ID for dev
    return int(x_user_id)

def get_current_role(x_user_role: Optional[str] = Header('gestor')):
    return x_user_role


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
def get_all_merchandise(manager_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return controller.get_all_merchandise(db, manager_id=manager_id, status=status)

@app.get("/{merch_id}", response_model=MerchandiseItemResponse)
def get_merchandise(merch_id: int, db: Session = Depends(get_db)):
    db_item = controller.get_merchandise_item(db, merch_id=merch_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Merchandise not found")
    return db_item

@app.put("/{merch_id}", response_model=MerchandiseItemResponse)
def update_merchandise(merch_id: int, item: MerchandiseItemUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return controller.update_merchandise(db=db, merch_id=merch_id, item_update=item, manager_id=user_id)


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
