from matis.shared.db import execute_query

query = """
SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as revenue, COUNT(*) as sales_count
FROM payments
WHERE status = 'completed'
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month ASC
"""
rows = execute_query(query)
print("MySQL DATE_FORMAT result:", rows)

query2 = """
SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as revenue, COUNT(*) as sales_count
FROM payments
WHERE status = 'completed'
GROUP BY month
ORDER BY month ASC
"""
try:
    rows2 = execute_query(query2)
    print("SQLite strftime result:", rows2)
except Exception as e:
    print("SQLite strftime error:", e)
