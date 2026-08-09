package com.laikaclub.analytics.matis.venues;

import com.laikaclub.analytics.matis.shared.SharedAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class VenueIntelligenceService {

    private static final Logger logger = LoggerFactory.getLogger(VenueIntelligenceService.class);

    private final JdbcTemplate jdbcTemplate;
    private final SharedAnalyticsService sharedService;

    @Autowired
    public VenueIntelligenceService(JdbcTemplate jdbcTemplate, SharedAnalyticsService sharedService) {
        this.jdbcTemplate = jdbcTemplate;
        this.sharedService = sharedService;
    }

    public Map<String, Object> getVenueProspectingLeads() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("timestamp", LocalDateTime.now().toString());

        List<Map<String, Object>> activeVenues = new ArrayList<>();
        try {
            // Retrieve active venues from MySQL
            String query = "SELECT " +
                    "COALESCE(e.location, 'Coliseo LAIKA') as venue_name, " +
                    "e.category as event_category, " +
                    "COUNT(DISTINCT e.id) as events_count, " +
                    "MAX(e.total_tickets) as capacity, " +
                    "COUNT(t.id) as tickets_sold, " +
                    "COALESCE(SUM(t.price), 0.0) as total_revenue, " +
                    "COALESCE(AVG(t.price), 0.0) as avg_ticket_price " +
                    "FROM events e " +
                    "LEFT JOIN tickets t ON t.event_id = e.id " +
                    "GROUP BY e.location, e.category";
            activeVenues = jdbcTemplate.queryForList(query);
        } catch (Exception e) {
            logger.warn("MySQL query for active venues failed, using mock: {}", e.getMessage());
        }

        if (activeVenues.isEmpty()) {
            result.put("status", "insufficient_data");
            result.put("message", "Datos reales insuficientes en MySQL para realizar la prospección de recintos.");
            return result;
        }

        for (Map<String, Object> v : activeVenues) {
            double rev = v.get("total_revenue") != null ? ((Number) v.get("total_revenue")).doubleValue() : 0.0;
            if (rev >= 500000.0) {
                v.put("cluster_tag", "Alto Impacto (VIP/Masivos)");
                v.put("profitability", "Muy Alta");
            } else if (rev >= 100000.0) {
                v.put("cluster_tag", "Rendimiento Comercial Estable");
                v.put("profitability", "Media-Alta");
            } else {
                v.put("cluster_tag", "Emergente / Local");
                v.put("profitability", "Baja-Moderada");
            }
        }

        List<Map<String, Object>> leadsList = getStaticLeads();

        Map<String, String> catMapping = Map.of(
            "concert", "Club/Foro",
            "sport", "Arena/Estadio",
            "theater", "Teatro/Auditorio",
            "festival", "Arena/Estadio",
            "other", "Club/Antro"
        );

        List<Map<String, Object>> leadsResults = new ArrayList<>();
        for (Map<String, Object> lead : leadsList) {
            double leadCapacity = lead.get("capacity") != null ? ((Number) lead.get("capacity")).doubleValue() : 100.0;
            String leadCategory = lead.get("category") != null ? String.valueOf(lead.get("category")) : "Club/Foro";

            Map<String, Object> bestMatch = null;
            double maxScore = -1.0;

            for (Map<String, Object> active : activeVenues) {
                double activeCapacity = active.get("capacity") != null ? ((Number) active.get("capacity")).doubleValue() : 500.0;
                String activeCategoryRaw = active.get("event_category") != null ? String.valueOf(active.get("event_category")) : "other";
                String activeCategory = catMapping.getOrDefault(activeCategoryRaw.toLowerCase(), "Club/Foro");

                double capSimilarity;
                try {
                    capSimilarity = 1.0 - Math.abs(Math.log10(leadCapacity) - Math.log10(activeCapacity)) / 2.0;
                    capSimilarity = Math.max(0.0, Math.min(1.0, capSimilarity));
                } catch (Exception e) {
                    capSimilarity = 0.5;
                }

                double catSimilarity = leadCategory.equalsIgnoreCase(activeCategory) ? 1.0 : 0.3;
                double score = (catSimilarity * 0.6) + (capSimilarity * 0.4);

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = active;
                }
            }

            int matchPercentage = (int) (maxScore * 100);
            String priority = "Baja Prioridad (Perfil Diferente)";
            String priorityColor = "#94a3b8";

            if (matchPercentage >= 85) {
                priority = "Alta Prioridad (Lookalike Perfecto)";
                priorityColor = "#10b981";
            } else if (matchPercentage >= 65) {
                priority = "Prioridad Media (Prospecto Viable)";
                priorityColor = "#3b82f6";
            }

            String matchVenueName = bestMatch != null ? String.valueOf(bestMatch.get("venue_name")) : "Coliseo LAIKA 1";
            String matchClusterTag = bestMatch != null ? String.valueOf(bestMatch.get("cluster_tag")) : "Emergente";
            int matchTickets = bestMatch != null ? ((Number) bestMatch.get("tickets_sold")).intValue() : 0;

            String leadName = String.valueOf(lead.get("name"));
            String leadCity = String.valueOf(lead.get("city"));
            String leadState = String.valueOf(lead.get("state"));

            String explanation = String.format(
                "Este negocio se clasifica como %s con capacidad para %,.0f personas en %s, %s. " +
                "Tiene un **%d%% de similitud** comercial con tu recinto activo **'%s'** (perfil '%s' que ha vendido %,d tickets en tu plataforma). " +
                "Es un excelente candidato para prospección comercial B2B ya que comparte la misma dinámica de público y afluencia.",
                leadCategory, leadCapacity, leadCity, leadState, matchPercentage, matchVenueName, matchClusterTag, matchTickets
            );

            Map<String, Object> leadResult = new HashMap<>();
            leadResult.put("name", leadName);
            leadResult.put("category", leadCategory);
            leadResult.put("capacity", (int) leadCapacity);
            leadResult.put("location", leadCity + ", " + leadState);
            leadResult.put("contact", Map.of(
                "email", lead.get("contact_email") != null ? lead.get("contact_email") : "booking@venue.com",
                "phone", lead.get("phone") != null ? lead.get("phone") : ""
            ));
            leadResult.put("best_match_venue", matchVenueName);
            leadResult.put("match_score", matchPercentage);
            leadResult.put("prospecting_priority", priority);
            leadResult.put("priority_color", priorityColor);
            leadResult.put("explanation", explanation);
            leadsResults.add(leadResult);
        }

        leadsResults.sort((a, b) -> Integer.compare((Integer) b.get("match_score"), (Integer) a.get("match_score")));
        result.put("leads", leadsResults);
        result.put("total_leads_analyzed", leadsResults.size());
        result.put("active_patterns_count", activeVenues.size());

        // Focus recommendation
        result.put("market_recommendation", Map.of(
            "recommended_category", "Teatro/Auditorio",
            "recommended_state", "CDMX",
            "recommended_country", "México",
            "reasoning", "La CDMX sigue representando el mayor foco de captación debido a alta concentración y ticket promedio mayor."
        ));

        return result;
    }

    private List<Map<String, Object>> getStaticLeads() {
        return List.of(
            Map.of("name", "Arena Ciudad de México", "category", "Arena/Estadio", "capacity", 22000, "city", "Ciudad de México", "state", "CDMX", "contact_email", "booking@arenacdmx.com", "phone", "55-1234-5678"),
            Map.of("name", "Teatro Diana", "category", "Teatro/Auditorio", "capacity", 2400, "city", "Guadalajara", "state", "Jalisco", "contact_email", "teatro@diana.udg.mx", "phone", "33-9876-5432"),
            Map.of("name", "Foro Indie Rocks", "category", "Club/Foro", "capacity", 1500, "city", "Ciudad de México", "state", "CDMX", "contact_email", "eventos@indierocks.mx", "phone", "55-8765-4321"),
            Map.of("name", "Pepper Club", "category", "Club/Antro", "capacity", 800, "city", "San Pedro Garza García", "state", "Nuevo León", "contact_email", "vip@pepperclub.mx", "phone", "81-5566-7788")
        );
    }
}
