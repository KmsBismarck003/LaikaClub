import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='root',
        database='laika_events',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Tables in laika_events:", tables)
        
        if any(t.get('Tables_in_laika_events') == 'venues' for t in tables):
            cursor.execute("SELECT * FROM venues")
            venues = cursor.fetchall()
            print("Venues:", venues)
            
            if any(t.get('Tables_in_laika_events') == 'venue_rooms' for t in tables):
                cursor.execute("SELECT * FROM venue_rooms")
                rooms = cursor.fetchall()
                print("Rooms:", rooms)
            elif any(t.get('Tables_in_laika_events') == 'rooms' for t in tables):
                cursor.execute("SELECT * FROM rooms")
                rooms = cursor.fetchall()
                print("Rooms:", rooms)
                
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()
