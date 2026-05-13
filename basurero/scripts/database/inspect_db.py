from sqlalchemy import create_engine, text

e = create_engine('mysql+pymysql://root:@localhost/laika_club3')

tables = ["users", "events", "event_ticket_sections", "tickets", "payments"]

with e.begin() as conn:
    for t in tables:
        try:
            cols = [r[0] for r in conn.execute(text(f"DESCRIBE {t}")).fetchall()]
            print(f"{t}: {cols}")
        except Exception as ex:
            print(f"Error reading {t}: {ex}")
