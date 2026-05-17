
import sqlite3
from datetime import date, time

conn = sqlite3.connect(':memory:')
conn.execute("CREATE TABLE test (d TEXT, t TEXT, b INTEGER)")

data = {'d': date(2026, 5, 14), 't': time(12, 0), 'b': True}
try:
    conn.execute("INSERT INTO test (d, t, b) VALUES (:d, :t, :b)", data)
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
