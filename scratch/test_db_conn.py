import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

MYSQL_URL = f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:3306/{os.getenv('MYSQL_DATABASE', 'laika_club3_v2')}"
print("MYSQL_URL:", MYSQL_URL)

try:
    engine = create_engine(MYSQL_URL, pool_pre_ping=True, connect_args={'connect_timeout': 2})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    res = db.execute(text("SELECT 1"))
    print("Result:", res.fetchone())
    db.close()
    print("MySQL Connection SUCCESSful!")
except Exception as e:
    print("MySQL Connection FAILED:", e)
