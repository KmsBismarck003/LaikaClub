import httpx
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from . import database, achievements
from .database import get_db, UserAchievement, UserCoupon
from datetime import datetime, timedelta
import os
import random
import string

app = FastAPI(title="Laika Achievements Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB
database.init_db()

TICKET_SERVICE_URL = os.getenv("TICKETS_SERVICE_URL", "http://localhost:8003")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

# Pydantic Schemas for Coupon validation and consumption
class ValidateCouponRequest(BaseModel):
    coupon_code: str
    subtotal: float
    service_fee_percent: float = 10.0

class ConsumeCouponRequest(BaseModel):
    coupon_code: str
    subtotal: float
    service_fee_percent: float = 10.0

def parse_date(date_val):
    if not date_val:
        return None
    if isinstance(date_val, datetime):
        return date_val
    # If it is a string
    try:
        return datetime.fromisoformat(date_val.split(".")[0])
    except Exception:
        pass
    try:
        return datetime.strptime(date_val.split(".")[0], "%Y-%m-%d %H:%M:%S")
    except Exception:
        pass
    return None

async def get_user_ticket_count(user_id: int, request: Request):
    token = request.headers.get("Authorization")
    headers = {"Authorization": token} if token else {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{TICKET_SERVICE_URL}/my-tickets", headers=headers)
            if resp.status_code == 200:
                tickets = resp.json()
                return len(tickets)
    except Exception as e:
        print(f"Error fetching tickets: {e}")
    return 0

def get_current_user_id(request: Request):
    user_id = request.headers.get("X-User-Id")
    if user_id: return int(user_id)
    return 1

@app.get("/")
async def get_progress(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    ticket_count = await get_user_ticket_count(user_id, request)
    
    # Sync achievements
    await check_achievements_logic(user_id, ticket_count, db)
    
    unlocked = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    user_tier = 1
    if unlocked:
        user_tier = max([a.tier for a in unlocked])
    
    return {
        "user_id": user_id,
        "ticket_count": ticket_count,
        "total_points": ticket_count * 100, # 1 ticket = 100 XP
        "tier": user_tier,
        "achievements": unlocked
    }

@app.get("/my")
async def get_my_info(request: Request, db: Session = Depends(get_db)):
    return await get_progress(request, db)

@app.get("/coupons")
async def get_coupons(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    
    # Run real-time check for this user to auto-incentivize
    await check_and_grant_user_incentives_realtime(user_id, request, db)
    
    now = datetime.utcnow()
    coupons = db.query(UserCoupon).filter(
        UserCoupon.user_id == user_id,
        (UserCoupon.uses_left > 0) | (UserCoupon.is_permanent == 1)
    ).all()
    
    # Filter expired
    active_coupons = []
    for c in coupons:
        if c.expires_at and c.expires_at < now:
            continue
        active_coupons.append(c)
        
    return active_coupons

@app.post("/coupons/validate")
async def validate_coupon(data: ValidateCouponRequest, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    coupon = db.query(UserCoupon).filter(
        UserCoupon.code == data.coupon_code,
        UserCoupon.user_id == user_id
    ).first()
    
    if not coupon:
        return {"valid": False, "detail": "Cupón no válido o no pertenece a tu usuario"}
    
    # Check expiration
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return {"valid": False, "detail": "El cupón ha expirado"}
    
    # Check uses
    if coupon.is_permanent != 1 and coupon.uses_left <= 0:
        return {"valid": False, "detail": "El cupón ya ha sido utilizado"}
    
    # Calculate discount
    discount = 0.0
    if coupon.discount_type == "percentage":
        discount = round(data.subtotal * (coupon.discount_value / 100.0), 2)
    elif coupon.discount_type == "fixed":
        discount = round(min(coupon.discount_value, data.subtotal), 2)
    elif coupon.discount_type == "service_fee":
        fee = data.subtotal * (data.service_fee_percent / 100.0)
        discount = round(fee * (coupon.discount_value / 100.0), 2)
        
    return {
        "valid": True,
        "discount": discount,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value,
        "description": coupon.description
    }

@app.post("/coupons/consume")
async def consume_coupon(data: ConsumeCouponRequest, request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    coupon = db.query(UserCoupon).filter(
        UserCoupon.code == data.coupon_code,
        UserCoupon.user_id == user_id
    ).first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupón no encontrado o no válido")
        
    # Check expiration
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="El cupón ha expirado")
        
    # Check uses
    if coupon.is_permanent != 1:
        if coupon.uses_left <= 0:
            raise HTTPException(status_code=400, detail="El cupón ya ha sido utilizado")
        coupon.uses_left -= 1
        db.commit()
        
    return {"status": "success", "uses_left": coupon.uses_left if coupon.is_permanent != 1 else "permanent"}

@app.post("/check")
async def manual_check(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    ticket_count = await get_user_ticket_count(user_id, request)
    await check_achievements_logic(user_id, ticket_count, db)
    return {"status": "success", "ticket_count": ticket_count}

@app.post("/run-incentives")
async def run_incentives(request: Request, test_mode: bool = False, db: Session = Depends(get_db)):
    # 1. Fetch all users from auth service
    users = []
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{AUTH_SERVICE_URL}/internal/users")
            if resp.status_code == 200:
                users = resp.json()
    except Exception as e:
        print(f"Error fetching internal users: {e}")
        raise HTTPException(status_code=500, detail=f"No se pudo conectar con Auth Service: {e}")
        
    if test_mode:
        # Prioritize test user testuser_1348@laikaclub.com to guarantee its execution in the 100 limit slice
        test_user = next((u for u in users if u["email"] == "testuser_1348@laikaclub.com"), None)
        other_users = [u for u in users if u["email"] != "testuser_1348@laikaclub.com"]
        if test_user:
            users = [test_user] + other_users[:99]
        else:
            users = users[:100]
        
    # 2. Fetch purchase history from tickets service
    purchases = {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{TICKET_SERVICE_URL}/internal/purchases")
            if resp.status_code == 200:
                for p in resp.json():
                    purchases[p["user_id"]] = p
    except Exception as e:
        print(f"Error fetching internal purchases: {e}")
        raise HTTPException(status_code=500, detail=f"No se pudo conectar con Ticket Service: {e}")

    # 2.5 Cache existing active coupons in memory to optimize database lookups (from N+1 down to 1 query)
    try:
        active_coupons = db.query(UserCoupon).filter(UserCoupon.uses_left > 0).all()
        existing_volver = {c.user_id for c in active_coupons if c.code and c.code.startswith("LAIKA-VOLVER90-")}
        existing_primerpaso = {c.user_id for c in active_coupons if c.code and c.code.startswith("LAIKA-PRIMERPASO-")}
        existing_despierta = {c.user_id for c in active_coupons if c.code and c.code.startswith("LAIKA-DESPIERTA-")}
    except Exception as e:
        print(f"Error caching active coupons: {e}")
        raise HTTPException(status_code=500, detail=f"Error al leer cupones activos: {e}")
        
    # Set thresholds (test mode uses ~1 minute / 60 seconds)
    now = datetime.utcnow()
    buyer_inactivity_days = 90 if not test_mode else 0.0007
    new_user_inactivity_days = 30 if not test_mode else 0.0007
    login_inactivity_days = 60 if not test_mode else 0.0007
    
    incentives_created = []
    newly_rewarded_uids = set()
    
    for u in users:
        uid = u["id"]
        email = u["email"]
        reg_date = parse_date(u["created_at"])
        last_log = parse_date(u["last_login"])
        
        user_p = purchases.get(uid, {"total_tickets": 0, "last_purchase": None})
        last_purch = parse_date(user_p["last_purchase"])
        tot_tickets = user_p["total_tickets"]
        
        # Check Campaign 1: Inactive buyer (purchased in past, but not recently)
        if tot_tickets > 0 and last_purch:
            time_since_purchase = now - last_purch
            if time_since_purchase.days >= buyer_inactivity_days or (test_mode and time_since_purchase.total_seconds() >= 60):
                prefix = "VOLVER90-"
                if uid not in existing_volver:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=uid,
                        code=code,
                        discount_type="percentage",
                        discount_value=15.0,
                        description="Cupón de Incentivo: Regreso Triunfal (15% de descuento en boletos)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0,
                        coupon_type="incentive"
                    )
                    db.add(new_coupon)
                    existing_volver.add(uid) # prevent duplicates in same run
                    incentives_created.append({
                        "user_id": uid,
                        "email": email,
                        "campaign": "Regreso Triunfal (90d inactivo)",
                        "code": code,
                        "benefit": "15% Descuento"
                    })
                    
        # Check Campaign 2: Registered but never purchased
        if tot_tickets == 0 and reg_date:
            time_since_reg = now - reg_date
            if time_since_reg.days >= new_user_inactivity_days or (test_mode and time_since_reg.total_seconds() >= 60):
                prefix = "PRIMERPASO-"
                if uid not in existing_primerpaso:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=uid,
                        code=code,
                        discount_type="service_fee",
                        discount_value=100.0,
                        description="Cupón de Incentivo: Tu Primer Evento (100% descuento en cargo por servicio)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0,
                        coupon_type="incentive"
                    )
                    db.add(new_coupon)
                    existing_primerpaso.add(uid) # prevent duplicates in same run
                    incentives_created.append({
                        "user_id": uid,
                        "email": email,
                        "campaign": "Primer Evento (Sin compras)",
                        "code": code,
                        "benefit": "100% Fee gratis"
                    })
                    
        # Check Campaign 3: Account unused (last login was long ago)
        login_ref = last_log if last_log else reg_date
        if login_ref:
            time_since_login = now - login_ref
            if time_since_login.days >= login_inactivity_days or (test_mode and time_since_login.total_seconds() >= 60):
                prefix = "DESPIERTA-"
                if uid not in existing_despierta and uid not in newly_rewarded_uids:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=uid,
                        code=code,
                        discount_type="fixed",
                        discount_value=200.0,
                        description="Cupón de Incentivo: Despierta tu Cuenta ($200 de descuento directo)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0,
                        coupon_type="incentive"
                    )
                    db.add(new_coupon)
                    existing_despierta.add(uid)
                    newly_rewarded_uids.add(uid)
                    incentives_created.append({
                        "user_id": uid,
                        "email": email,
                        "campaign": "Despierta tu Cuenta (Inactividad de login)",
                        "code": code,
                        "benefit": "$200 de descuento"
                    })
                    
    db.commit()
    return {
        "status": "success",
        "processed_users": len(users),
        "incentives_created_count": len(incentives_created),
        "incentives": incentives_created
    }

async def check_and_grant_user_incentives_realtime(user_id: int, request: Request, db: Session):
    try:
        # Get user details
        async with httpx.AsyncClient() as client:
            resp_user = await client.get(f"{AUTH_SERVICE_URL}/internal/users/{user_id}")
            if resp_user.status_code != 200:
                return
            u = resp_user.json()
            
            resp_purch = await client.get(f"{TICKET_SERVICE_URL}/internal/purchases/{user_id}")
            if resp_purch.status_code != 200:
                return
            user_p = resp_purch.json()
            
        now = datetime.utcnow()
        reg_date = parse_date(u["created_at"])
        last_log = parse_date(u["last_login"])
        last_purch = parse_date(user_p["last_purchase"])
        tot_tickets = user_p["total_tickets"]
        
        # 1. Check Campaign 1: Inactive buyer (90 days)
        if tot_tickets > 0 and last_purch:
            time_since_purchase = now - last_purch
            if time_since_purchase.days >= 90:
                prefix = "VOLVER90-"
                existing = db.query(UserCoupon).filter(
                    UserCoupon.user_id == user_id,
                    UserCoupon.code.like(f"LAIKA-{prefix}%"),
                    UserCoupon.uses_left > 0
                ).first()
                if not existing:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=user_id,
                        code=code,
                        discount_type="percentage",
                        discount_value=15.0,
                        description="Cupón de Incentivo: Regreso Triunfal (15% de descuento en boletos)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0
                    )
                    db.add(new_coupon)
                    db.commit()
                    
        # 2. Check Campaign 2: Registered but never purchased (30 days)
        elif tot_tickets == 0 and reg_date:
            time_since_reg = now - reg_date
            if time_since_reg.days >= 30:
                prefix = "PRIMERPASO-"
                existing = db.query(UserCoupon).filter(
                    UserCoupon.user_id == user_id,
                    UserCoupon.code.like(f"LAIKA-{prefix}%"),
                    UserCoupon.uses_left > 0
                ).first()
                if not existing:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=user_id,
                        code=code,
                        discount_type="service_fee",
                        discount_value=100.0,
                        description="Cupón de Incentivo: Tu Primer Evento (100% descuento en cargo por servicio)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0
                    )
                    db.add(new_coupon)
                    db.commit()
                    
        # 3. Check Campaign 3: Account unused / login inactivity (60 days)
        login_ref = last_log if last_log else reg_date
        if login_ref:
            time_since_login = now - login_ref
            if time_since_login.days >= 60:
                prefix = "DESPIERTA-"
                existing = db.query(UserCoupon).filter(
                    UserCoupon.user_id == user_id,
                    UserCoupon.code.like(f"LAIKA-{prefix}%"),
                    UserCoupon.uses_left > 0
                ).first()
                if not existing:
                    code = f"LAIKA-{prefix}{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
                    new_coupon = UserCoupon(
                        user_id=user_id,
                        code=code,
                        discount_type="fixed",
                        discount_value=200.0,
                        description="Cupón de Incentivo: Despierta tu Cuenta ($200 de descuento directo)",
                        uses_left=1,
                        expires_at=now + timedelta(days=30),
                        is_permanent=0
                    )
                    db.add(new_coupon)
                    db.commit()
    except Exception as e:
        print(f"Error checking real-time incentives for user {user_id}: {e}")

async def check_achievements_logic(user_id: int, ticket_count: int, db: Session):
    unlocked_tiers = achievements.get_achievements_for_count(ticket_count)
    already_unlocked = [a.tier for a in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()]
    
    for t in unlocked_tiers:
        if t["tier"] not in already_unlocked:
            # Create Achievement
            new_ach = UserAchievement(
                user_id=user_id,
                achievement_id=t["tier"],
                tier=t["tier"],
                tier_name=t["name"],
                phase=t["phase"]
            )
            db.add(new_ach)
            
            # Create Coupon reward if applicable
            if t.get("reward_type") in ["percentage", "fixed", "service_fee"]:
                new_coupon = UserCoupon(
                    user_id=user_id,
                    code=achievements.generate_coupon_code(t["tier"]),
                    discount_type=t["reward_type"],
                    discount_value=t["reward_value"],
                    description=t["reward"],
                    uses_left=t.get("uses", 1),
                    is_permanent=1 if t.get("permanent") else 0
                )
                db.add(new_coupon)
    
    db.commit()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
