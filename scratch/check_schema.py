from sqlalchemy import create_engine, text
import json

engine = create_engine('mysql+pymysql://root:@127.0.0.1:3306/laika_club3_v2')
with engine.connect() as conn:
    res = conn.execute(text('DESCRIBE seating_zones'))
    print("SEATING_ZONES:", json.dumps([dict(row._mapping) for row in res.fetchall()], indent=2))
    
    res = conn.execute(text('DESCRIBE seating_blocks'))
    print("SEATING_BLOCKS:", json.dumps([dict(row._mapping) for row in res.fetchall()], indent=2))
    
    res = conn.execute(text('DESCRIBE room_seats'))
    print("ROOM_SEATS:", json.dumps([dict(row._mapping) for row in res.fetchall()], indent=2))
