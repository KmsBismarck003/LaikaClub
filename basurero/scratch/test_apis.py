
import httpx
import sys

def test_api():
    print("Testing APIs...")
    urls = {
        "Gateway Root": "http://127.0.0.1:8000/",
        "Public Ads (via Gateway)": "http://127.0.0.1:8000/api/ads/public",
        "Public Events (via Gateway)": "http://127.0.0.1:8000/api/events/public",
        "Event Service Direct": "http://127.0.0.1:8002/public",
        "Event Service Health": "http://127.0.0.1:8002/health"
    }
    
    for name, url in urls.items():
        try:
            r = httpx.get(url, timeout=2.0)
            print(f"[{name}] Status: {r.status_code}")
            if r.status_code == 200:
                content = r.text
                print(f"[{name}] Content Length: {len(content)}")
                if len(content) < 500:
                    print(f"[{name}] Sample: {content}")
                else:
                    print(f"[{name}] Sample: {content[:100]}...")
            else:
                 print(f"[{name}] Error detail: {r.text}")
        except Exception as e:
            print(f"[{name}] FAILED: {e}")

if __name__ == "__main__":
    test_api()
