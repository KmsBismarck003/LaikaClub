import sqlite3
import os

dbs = [
    'microservices/auth/auth.db',
    'microservices/events/events.db',
    'microservices/tickets/tickets.db',
    'microservices/auth/auth_dev.db'
]

for db in dbs:
    if not os.path.exists(db):
        print(f"--- {db} NOT FOUND ---")
        continue
    print(f"--- {db} ---")
    conn = sqlite3.connect(db)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    
    for table_tuple in tables:
        table = table_tuple[0]
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  Table {table}: {count} rows")
        
        if table.lower() in ['users', 'user']:
            cursor.execute(f"SELECT * FROM {table} WHERE email LIKE '%juan%' OR first_name LIKE '%juan%'")
            juan = cursor.fetchall()
            if juan:
                print(f"    FOUND JUAN: {juan}")
    
    conn.close()
    print("-" * 30)
