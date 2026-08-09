from fastapi import APIRouter, HTTPException
from matis.shared.db import execute_query
import math

router = APIRouter(prefix="/api/analytics/matis/venues", tags=["MATIS Venue Intelligence"])

@router.get("/prospects")
def get_lookalike_prospects():
    try:
        # 1. Fetch active venues in MySQL
        active_venues = execute_query("""
            SELECT 
                COALESCE(e.location, 'Coliseo LAIKA') as venue_name,
                e.category as event_category,
                COUNT(DISTINCT e.id) as events_count,
                MAX(e.total_tickets) as capacity,
                COUNT(t.id) as tickets_sold,
                COALESCE(SUM(t.price), 0.0) as total_revenue,
                COALESCE(AVG(t.price), 0.0) as avg_ticket_price
            FROM events e
            LEFT JOIN tickets t ON t.event_id = e.id
            GROUP BY e.location, e.category
        """)
        
        if not active_venues:
            return {
                "status": "insufficient_data",
                "message": "Datos de recintos activos insuficientes en MySQL para realizar lookalike prospecting."
            }

        # Classify clusters
        for v in active_venues:
            rev = float(v["total_revenue"])
            if rev >= 500000.0:
                v["cluster_tag"] = "Alto Impacto (VIP/Masivos)"
                v["profitability"] = "Muy Alta"
            elif rev >= 100000.0:
                v["cluster_tag"] = "Rendimiento Comercial Estable"
                v["profitability"] = "Media-Alta"
            else:
                v["cluster_tag"] = "Emergente / Local"
                v["profitability"] = "Baja-Moderada"

        # Static target leads to prospect
        leads = [
            {"name": "Arena Ciudad de México", "category": "Arena/Estadio", "capacity": 22000, "city": "Ciudad de México", "state": "CDMX", "contact_email": "booking@arenacdmx.com", "phone": "55-1234-5678"},
            {"name": "Teatro Diana", "category": "Teatro/Auditorio", "capacity": 2400, "city": "Guadalajara", "state": "Jalisco", "contact_email": "teatro@diana.udg.mx", "phone": "33-9876-5432"},
            {"name": "Foro Indie Rocks", "category": "Club/Foro", "capacity": 1500, "city": "Ciudad de México", "state": "CDMX", "contact_email": "eventos@indierocks.mx", "phone": "55-8765-4321"},
            {"name": "Pepper Club", "category": "Club/Antro", "capacity": 800, "city": "San Pedro Garza García", "state": "Nuevo León", "contact_email": "vip@pepperclub.mx", "phone": "81-5566-7788"}
        ]

        cat_mapping = {
            "concert": "Club/Foro",
            "sport": "Arena/Estadio",
            "theater": "Teatro/Auditorio",
            "festival": "Arena/Estadio",
            "other": "Club/Antro"
        }

        leads_results = []
        for lead in leads:
            lead_capacity = float(lead["capacity"])
            lead_category = lead["category"]

            best_match = None
            max_score = -1.0

            for active in active_venues:
                active_capacity = float(active["capacity"] or 500)
                active_category_raw = active["event_category"] or "other"
                active_category = cat_mapping.get(active_category_raw.lower(), "Club/Foro")

                # Log-scale capacity similarity
                try:
                    cap_similarity = 1.0 - abs(math.log10(lead_capacity) - math.log10(active_capacity)) / 2.0
                    cap_similarity = max(0.0, min(1.0, cap_similarity))
                except Exception:
                    cap_similarity = 0.5

                cat_similarity = 1.0 if lead_category.lower() == active_category.lower() else 0.3
                score = (cat_similarity * 0.6) + (cap_similarity * 0.4)

                if score > max_score:
                    max_score = score;
                    best_match = active

            match_percentage = int(max_score * 100)
            priority = "Baja Prioridad"
            priority_color = "#94a3b8"

            if match_percentage >= 85:
                priority = "Alta Prioridad (Lookalike Perfecto)"
                priority_color = "#10b981"
            elif match_percentage >= 65:
                priority = "Prioridad Media (Prospecto Viable)"
                priority_color = "#3b82f6"

            match_venue_name = best_match["venue_name"] if best_match else "Coliseo LAIKA 1"
            match_cluster_tag = best_match["cluster_tag"] if best_match else "Emergente"
            match_tickets = int(best_match["tickets_sold"]) if best_match else 0

            explanation = (
                f"Este negocio se clasifica como {lead_category} con capacidad para {lead_capacity:,.0f} personas en {lead['city']}, {lead['state']}. "
                f"Tiene un **{match_percentage}% de similitud** comercial con tu recinto activo **'{match_venue_name}'** (perfil '{match_cluster_tag}' que ha vendido {match_tickets:,} tickets en tu plataforma). "
                f"Es un excelente candidato para prospección comercial B2B ya que comparte la misma dinámica de público y afluencia."
            )

            leads_results.append({
                "name": lead["name"],
                "category": lead_category,
                "capacity": int(lead_capacity),
                "location": f"{lead['city']}, {lead['state']}",
                "contact": {
                    "email": lead["contact_email"],
                    "phone": lead["phone"]
                },
                "best_match_venue": match_venue_name,
                "match_score": match_percentage,
                "prospecting_priority": priority,
                "priority_color": priority_color,
                "explanation": explanation
            })

        leads_results.sort(key=lambda x: x["match_score"], reverse=True)
        
        return {
            "status": "success",
            "leads": leads_results,
            "total_leads_analyzed": len(leads_results),
            "active_patterns_count": len(active_venues),
            "market_recommendation": {
                "recommended_category": "Teatro/Auditorio",
                "recommended_state": "CDMX",
                "recommended_country": "México",
                "reasoning": "La CDMX sigue representando el mayor foco de captación debido a alta concentración y ticket promedio mayor."
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
