import sqlalchemy
from sqlalchemy import create_engine, text

MYSQL_URL = "mysql+pymysql://root:@localhost:3306/laika_club3_v2"

def upgrade():
    engine = create_engine(MYSQL_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN room_id INT DEFAULT NULL;"))
            print("Added room_id")
        except Exception as e:
            print(e)
            
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN use_seating_map BOOLEAN DEFAULT FALSE;"))
            print("Added use_seating_map")
        except Exception as e:
            print(e)
            
        conn.commit()

if __name__ == '__main__':
    upgrade()
