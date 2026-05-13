from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:@127.0.0.1:3306/laika_club3_v2')
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE seating_zones ADD COLUMN geometry_json JSON DEFAULT NULL'))
        print("Column geometry_json added to seating_zones")
    except Exception as e:
        print(f"Error adding geometry_json: {e}")
    
    conn.commit()
