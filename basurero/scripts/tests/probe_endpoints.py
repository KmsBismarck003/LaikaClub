import urllib.request, json
urls = {
    "mr_tickets": "http://localhost:8007/api/analytics/mapreduce?table=tickets",
    "mr_events": "http://localhost:8007/api/analytics/mapreduce?table=events",
    "mr_users": "http://localhost:8007/api/analytics/mapreduce?table=users",
    "f_3d": "http://localhost:8007/api/analytics/3d?table=tickets"
}
for name, u in urls.items():
    try:
        data = urllib.request.urlopen(u, timeout=10).read().decode()
        print(f"--- {name} ---")
        print(data[:500])
    except Exception as e:
        print(f"{name} Error: {e}")
