import urllib.request
import csv
import io
import re
from datetime import datetime

class ScraperModule:
    """Módulo de Extracción de Datos (Scrapers)."""
    
    def scrape_football_data(self, league="SP1"):
        """Extrae datos históricos de fútbol de football-data.co.uk."""
        url = f"https://www.football-data.co.uk/mmz4281/2324/{league}.csv"
        try:
            print(f"[SCRAPER] Conectando a {url}...")
            headers = {'User-Agent': 'Mozilla/5.0'}
            req = urllib.request.Request(url, headers=headers)
            
            with urllib.request.urlopen(req) as response:
                content = response.read().decode('utf-8')
                csv_data = csv.DictReader(io.StringIO(content))
                
                results = []
                rows = list(csv_data)
                for row in rows[-20:]:
                    results.append({
                        "fecha": row.get("Date"),
                        "local": row.get("HomeTeam"),
                        "visitante": row.get("AwayTeam"),
                        "goles_local": int(row.get("FTHG", 0)),
                        "goles_visitante": int(row.get("FTAG", 0)),
                        "resultado": row.get("FTR")
                    })
                
                return {
                    "status": "success",
                    "source": "football-data.co.uk",
                    "league": league,
                    "count": len(results),
                    "data": results
                }
        except Exception as e:
            print(f"[SCRAPER-ERROR] {e}")
            return {"status": "error", "message": f"No se pudo extraer datos: {str(e)}"}

    def scrape_custom_url(self, url):
        """Extrae metadatos y activos (SVGs/Imágenes) de cualquier URL."""
        try:
            print(f"[SCRAPER] Scraping dinámico: {url}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            req = urllib.request.Request(url, headers=headers)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8', errors='ignore')
                
                title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
                title = title_match.group(1) if title_match else "Sin Título"
                
                desc_match = re.search(r'<meta name="description" content="(.*?)"', html, re.IGNORECASE)
                description = desc_match.group(1) if desc_match else "Sin descripción disponible."
                
                svgs_inline = re.findall(r'(<svg.*?</svg>)', html, re.IGNORECASE | re.DOTALL)
                svgs_ext = re.findall(r'src=["\'](.*?\.svg)["\']', html, re.IGNORECASE)
                images = re.findall(r'src=["\'](.*?\.(?:png|jpg|jpeg|gif|webp))["\']', html, re.IGNORECASE)
                
                base_url = "/".join(url.split("/")[:3])
                processed_images = []
                for img in images[:10]:
                    if img.startswith("//"): processed_images.append("https:" + img)
                    elif img.startswith("/"): processed_images.append(base_url + img)
                    elif img.startswith("http"): processed_images.append(img)
                    else: processed_images.append(url.rstrip("/") + "/" + img)

                return {
                    "status": "success",
                    "metadata": {
                        "title": title,
                        "description": description,
                        "url": url,
                        "timestamp": datetime.now().isoformat()
                    },
                    "assets": {
                        "svgs_inline_count": len(svgs_inline),
                        "svg_files": svgs_ext[:5],
                        "images": processed_images,
                        "sample_svg": svgs_inline[0] if svgs_inline else None
                    },
                    "summary": f"Se encontraron {len(svgs_inline)} SVGs y {len(images)} imágenes en la fuente."
                }
        except Exception as e:
            return {"status": "error", "message": f"Error de Scraper: {str(e)}"}
