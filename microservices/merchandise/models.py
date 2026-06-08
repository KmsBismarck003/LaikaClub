from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from microservices.merchandise.database import Base

class MerchandiseSettings(Base):
    __tablename__ = "merchandise_settings"
    manager_id = Column(Integer, primary_key=True)
    is_enabled = Column(Boolean, default=False)
    activation_fee_paid = Column(Boolean, default=False)
    commission_percentage = Column(Numeric(5, 2), default=10.00)
    enabled_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MerchandiseItem(Base):
    __tablename__ = "merchandise_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    manager_id = Column(Integer, nullable=False, index=True)
    category = Column(String(100), nullable=True) # playeras, sudaderas, stickers, etc.
    is_official = Column(Boolean, default=True) # True = Premium, False = Bazar/AliExpress
    rating = Column(Float, default=0.0) # Para el estilo marketplace
    status = Column(Enum('draft','published','hidden'), default='draft')
    admin_status = Column(String(50), default='pending_review') # 'pending_review', 'approved', 'rejected'
    event_id = Column(Integer, nullable=True, index=True)
    attributes_schema = Column(JSON, nullable=True)
    delivery_methods = Column(JSON, nullable=True)
    max_per_person = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    variants = relationship("MerchandiseVariant", back_populates="item", cascade="all, delete-orphan")
    reviews = relationship("MerchandiseReview", back_populates="item", cascade="all, delete-orphan")

class MerchandiseVariant(Base):
    __tablename__ = "merchandise_variants"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey('merchandise_items.id'), nullable=False)
    sku = Column(String(100), nullable=True)
    attributes = Column(JSON, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    item = relationship("MerchandiseItem", back_populates="variants")

class MerchandiseOrder(Base):
    __tablename__ = "merchandise_orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    total_commission = Column(Numeric(10, 2), nullable=False)
    net_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default='completed')
    payment_method = Column(String(50), default='card')
    idempotency_key = Column(String(255), nullable=True, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MerchandiseOrderItem(Base):
    __tablename__ = "merchandise_order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('merchandise_orders.id'), nullable=False)
    variant_id = Column(Integer, ForeignKey('merchandise_variants.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

class MerchandiseReview(Base):
    __tablename__ = "merchandise_reviews"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey('merchandise_items.id'), nullable=False)
    user_id = Column(Integer, nullable=False)
    user_name = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    item = relationship("MerchandiseItem", back_populates="reviews")
