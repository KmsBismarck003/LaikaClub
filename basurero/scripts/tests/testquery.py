import asyncio
from sqlalchemy.orm import Session
from microservices.achievements.database import SessionLocal, init_db, UserCoupon
from microservices.achievements.main import check_achievements_logic, get_user_ticket_count
import datetime

class FakeReq:
    headers = {}

async def test():
    db = SessionLocal()
    user_id = 1
    now = datetime.datetime.utcnow()
    print("Testing query...")
    try:
        coupons = db.query(UserCoupon).filter(
            UserCoupon.user_id == user_id,
            (UserCoupon.uses_left > 0) | (UserCoupon.is_permanent == 1)
        ).all()
        print(f"Coupons count: {len(coupons)}")
    except Exception as e:
        print(f"FAILED QUERY: {e}")

asyncio.run(test())
