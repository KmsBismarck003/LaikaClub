from sqlalchemy import create_engine, text

e = create_engine('mysql+pymysql://root:@localhost/laika_club3')
with e.begin() as conn:
    conn.execute(text("UPDATE payments SET payment_method = 'card' WHERE payment_method = '' AND id MOD 2 = 0"))
    conn.execute(text("UPDATE payments SET payment_method = 'cash' WHERE payment_method = '' AND id MOD 3 = 0"))
    conn.execute(text("UPDATE payments SET payment_method = 'transfer' WHERE payment_method = ''"))
    conn.execute(text("UPDATE tickets SET ticket_type = 'GENERAL' WHERE ticket_type = ''"))
    print("Corrección de ENUMs aplicada.")
