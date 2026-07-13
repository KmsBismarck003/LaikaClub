package com.laikaclub.events.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class EventQueryService {

    private static final Logger logger = LoggerFactory.getLogger(EventQueryService.class);

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public EventQueryService(NamedParameterJdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> getPublicEvents(String category, int limit) {
        String sql = "SELECT e.*, " +
                "       v.name as venue_name, " +
                "       m.id as municipality_id_val, m.name as municipality_name, " +
                "       s.id as state_id, s.name as state_name, " +
                "       c.id as country_id, c.name as country_name " +
                "FROM events e " +
                "LEFT JOIN venues v ON e.venue_id = v.id " +
                "LEFT JOIN municipalities m ON v.municipality_id = m.id " +
                "LEFT JOIN states s ON m.state_id = s.id " +
                "LEFT JOIN countries c ON s.country_id = c.id " +
                "WHERE e.status = 'published' " +
                "AND (" +
                "  EXISTS (SELECT 1 FROM event_functions ef WHERE ef.event_id = e.id AND CONCAT(ef.date, ' ', ef.time) >= :cutoff) " +
                "  OR " +
                "  (NOT EXISTS (SELECT 1 FROM event_functions ef WHERE ef.event_id = e.id) AND CONCAT(e.event_date, ' ', e.event_time) >= :cutoff) " +
                ") ";

        MapSqlParameterSource params = new MapSqlParameterSource();
        LocalDateTime cutoff = LocalDateTime.now(ZoneId.of("America/Mexico_City")).minusHours(1);
        params.addValue("cutoff", cutoff.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        if (category != null && !category.isEmpty()) {
            sql += "AND e.category = :category ";
            params.addValue("category", category);
        }

        sql += "ORDER BY e.grid_position_y ASC, e.grid_position_x ASC, e.event_date ASC LIMIT :limit";
        params.addValue("limit", limit);

        try {
            return cleanResults(jdbcTemplate.queryForList(sql, params));
        } catch (Exception e) {
            logger.error("Error in getPublicEvents: ", e);
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getAllEvents(int limit, Long countryId, Long stateId, Long municipalityId, Long venueId) {
        String sql = "SELECT e.*, " +
                "       v.name as venue_name, " +
                "       m.id as municipality_id_val, m.name as municipality_name, " +
                "       s.id as state_id, s.name as state_name, " +
                "       c.id as country_id, c.name as country_name " +
                "FROM events e " +
                "LEFT JOIN venues v ON e.venue_id = v.id " +
                "LEFT JOIN municipalities m ON v.municipality_id = m.id " +
                "LEFT JOIN states s ON m.state_id = s.id " +
                "LEFT JOIN countries c ON s.country_id = c.id " +
                "WHERE 1=1 ";

        MapSqlParameterSource params = new MapSqlParameterSource();
        if (countryId != null) {
            sql += "AND c.id = :countryId ";
            params.addValue("countryId", countryId);
        }
        if (stateId != null) {
            sql += "AND s.id = :stateId ";
            params.addValue("stateId", stateId);
        }
        if (municipalityId != null) {
            sql += "AND v.municipality_id = :municipalityId ";
            params.addValue("municipalityId", municipalityId);
        }
        if (venueId != null) {
            sql += "AND e.venue_id = :venueId ";
            params.addValue("venueId", venueId);
        }

        sql += "ORDER BY e.id DESC LIMIT :limit";
        params.addValue("limit", limit);

        try {
            return cleanResults(jdbcTemplate.queryForList(sql, params));
        } catch (Exception e) {
            logger.error("Error in getAllEvents: ", e);
            return Collections.emptyList();
        }
    }

    public List<Map<String, Object>> getUserEvents(Long userId, int limit) {
        String sql = "SELECT * FROM events WHERE created_by = :userId OR assigned_manager_id = :userId ORDER BY id DESC LIMIT :limit";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("limit", limit);
        try {
            return cleanResults(jdbcTemplate.queryForList(sql, params));
        } catch (Exception e) {
            logger.error("Error in getUserEvents: ", e);
            return Collections.emptyList();
        }
    }

    public Map<String, Object> getEventById(Long eventId, boolean isPublic) {
        String sql = "SELECT e.*, v.name as venue_name " +
                "FROM events e " +
                "LEFT JOIN venues v ON e.venue_id = v.id " +
                "WHERE e.id = :eventId";
        
        MapSqlParameterSource params = new MapSqlParameterSource().addValue("eventId", eventId);
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, params);
        if (list.isEmpty()) {
            return null;
        }

        Map<String, Object> event = new HashMap<>(list.get(0));
        cleanMap(event);

        // Sections
        String sectionsSql = "SELECT * FROM event_ticket_sections WHERE event_id = :eventId";
        event.put("sections", cleanResults(jdbcTemplate.queryForList(sectionsSql, params)));

        // Rules
        String rulesSql = "SELECT * FROM event_rules WHERE event_id = :eventId";
        event.put("rules", cleanResults(jdbcTemplate.queryForList(rulesSql, params)));

        // Functions
        String functionsSql = "SELECT ef.*, v.name AS venue_name, v.city AS venue_city, vr.name AS room_name, " +
                "       m.name AS venue_municipality, s.name AS venue_state " +
                "FROM event_functions ef " +
                "LEFT JOIN venues v ON ef.venue_id = v.id " +
                "LEFT JOIN venue_rooms vr ON ef.room_id = vr.id " +
                "LEFT JOIN municipalities m ON v.municipality_id = m.id " +
                "LEFT JOIN states s ON m.state_id = s.id " +
                "WHERE ef.event_id = :eventId ";
                
        if (isPublic) {
            LocalDateTime cutoff = LocalDateTime.now(ZoneId.of("America/Mexico_City")).minusHours(1);
            functionsSql += "AND CONCAT(ef.date, ' ', ef.time) >= :cutoff ";
            params.addValue("cutoff", cutoff.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        
        event.put("functions", cleanResults(jdbcTemplate.queryForList(functionsSql, params)));

        // Room and Seating Map
        Long roomId = getLong(event.get("room_id"));
        if (roomId != null) {
            String roomSql = "SELECT * FROM venue_rooms WHERE id = :roomId";
            List<Map<String, Object>> roomList = jdbcTemplate.queryForList(roomSql, new MapSqlParameterSource("roomId", roomId));
            if (!roomList.isEmpty()) {
                Map<String, Object> room = new HashMap<>(roomList.get(0));
                cleanMap(room);
                
                Object metadataObj = room.get("layout_metadata");
                Map<String, Object> layoutMetadata = new HashMap<>();
                if (metadataObj instanceof String) {
                    try {
                        layoutMetadata = objectMapper.readValue((String) metadataObj, new TypeReference<Map<String, Object>>() {});
                    } catch (Exception e) {
                        logger.debug("Could not parse layout_metadata string: {}", e.getMessage());
                    }
                }
                room.put("layout_metadata", layoutMetadata);
                room.put("layout_json", layoutMetadata);
                event.put("room", room);
            }
        }

        // Add analytics
        event.put("ticket_summary", getEventTicketsAnalytics(eventId));
        event.put("revenue_summary", getEventRevenueAnalytics(eventId));

        return event;
    }

    public Map<String, Object> getEventTicketsAnalytics(Long eventId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // 1. Capacity
            String capSql = "SELECT total_tickets FROM events WHERE id = :eventId";
            List<Map<String, Object>> capList = jdbcTemplate.queryForList(capSql, new MapSqlParameterSource("eventId", eventId));
            int totalCapacity = 0;
            if (!capList.isEmpty()) {
                totalCapacity = getInt(capList.get(0).get("total_tickets"));
            }

            // 2. Stats
            String statsSql = "SELECT status, COUNT(*) as cnt FROM laika_tickets.tickets WHERE event_id = :eventId GROUP BY status";
            List<Map<String, Object>> statsList = jdbcTemplate.queryForList(statsSql, new MapSqlParameterSource("eventId", eventId));
            
            int active = 0;
            int used = 0;
            int refunded = 0;
            int cancelled = 0;
            
            for (Map<String, Object> row : statsList) {
                String status = String.valueOf(row.get("status"));
                int count = getInt(row.get("cnt"));
                if ("active".equalsIgnoreCase(status)) active = count;
                else if ("used".equalsIgnoreCase(status)) used = count;
                else if ("refunded".equalsIgnoreCase(status)) refunded = count;
                else if ("cancelled".equalsIgnoreCase(status)) cancelled = count;
            }
            
            int sold = active + used;

            // 3. Recent purchases
            String recentSql = "SELECT t.ticket_code, u.first_name as customer, t.price, t.purchase_date, t.status " +
                    "FROM laika_tickets.tickets t " +
                    "LEFT JOIN laika_auth.users u ON t.user_id = u.id " +
                    "WHERE t.event_id = :eventId " +
                    "ORDER BY t.purchase_date DESC " +
                    "LIMIT 10";
            List<Map<String, Object>> recentPurchases = cleanResults(jdbcTemplate.queryForList(recentSql, new MapSqlParameterSource("eventId", eventId)));

            double sellThroughPct = totalCapacity > 0 ? Math.round((double) sold / totalCapacity * 1000.0) / 10.0 : 0.0;

            summary.put("sold", sold);
            summary.put("total_capacity", totalCapacity);
            summary.put("sell_through_pct", sellThroughPct);
            summary.put("active", active);
            summary.put("used", used);
            summary.put("refunded", refunded);
            summary.put("cancelled", cancelled);
            summary.put("available", totalCapacity - sold);
            summary.put("recent_purchases", recentPurchases);

        } catch (Exception e) {
            logger.warn("Could not load tickets analytics for event {}: {}. Returning default values.", eventId, e.getMessage());
            // Safe fallback if 'tickets' table does not exist
            summary.put("sold", 0);
            summary.put("total_capacity", 0);
            summary.put("sell_through_pct", 0.0);
            summary.put("active", 0);
            summary.put("used", 0);
            summary.put("refunded", 0);
            summary.put("cancelled", 0);
            summary.put("available", 0);
            summary.put("recent_purchases", Collections.emptyList());
        }

        return summary;
    }

    public Map<String, Object> getEventRevenueAnalytics(Long eventId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            String sql = "SELECT " +
                    "    SUM(price) as gross, " +
                    "    SUM(CASE WHEN status = 'refunded' THEN price ELSE 0 END) as refunded_amount, " +
                    "    SUM(CASE WHEN status IN ('active', 'used') THEN price ELSE 0 END) as net, " +
                    "    COUNT(CASE WHEN status IN ('active', 'used') THEN 1 END) as tickets_sold, " +
                    "    COUNT(CASE WHEN status = 'refunded' THEN 1 END) as tickets_refunded " +
                    "FROM laika_tickets.tickets " +
                    "WHERE event_id = :eventId";
            
            List<Map<String, Object>> resList = jdbcTemplate.queryForList(sql, new MapSqlParameterSource("eventId", eventId));
            Map<String, Object> res = resList.get(0);

            double gross = getDouble(res.get("gross"));
            double refundedAmount = getDouble(res.get("refunded_amount"));
            double net = getDouble(res.get("net"));
            int ticketsSold = getInt(res.get("tickets_sold"));
            int ticketsRefunded = getInt(res.get("tickets_refunded"));

            String projectedSql = "SELECT SUM(capacity * price) as projected FROM event_ticket_sections WHERE event_id = :eventId";
            List<Map<String, Object>> projectedList = jdbcTemplate.queryForList(projectedSql, new MapSqlParameterSource("eventId", eventId));
            double projectedTotal = gross;
            if (!projectedList.isEmpty() && projectedList.get(0).get("projected") != null) {
                projectedTotal = getDouble(projectedList.get(0).get("projected"));
            }

            summary.put("gross", gross);
            summary.put("refunded_amount", refundedAmount);
            summary.put("net", net);
            summary.put("tickets_sold", ticketsSold);
            summary.put("tickets_refunded", ticketsRefunded);
            summary.put("projected_total", projectedTotal);

        } catch (Exception e) {
            logger.warn("Could not load revenue analytics for event {}: {}. Returning default values.", eventId, e.getMessage());
            // Safe fallback if 'tickets' table does not exist
            summary.put("gross", 0.0);
            summary.put("refunded_amount", 0.0);
            summary.put("net", 0.0);
            summary.put("tickets_sold", 0);
            summary.put("tickets_refunded", 0);
            summary.put("projected_total", 0.0);
        }

        return summary;
    }

    public List<Map<String, Object>> getVenues(String statusFilter, Long countryId, Long stateId, Long municipalityId, Long managerId) {
        String sql = "SELECT v.*, " +
                "       m.name as municipality_name, " +
                "       s.id as state_id, s.name as state_name, " +
                "       c.id as country_id, c.name as country_name, " +
                "       u.first_name as manager_first_name, u.last_name as manager_last_name " +
                "FROM venues v " +
                "LEFT JOIN municipalities m ON v.municipality_id = m.id " +
                "LEFT JOIN states s ON m.state_id = s.id " +
                "LEFT JOIN countries c ON s.country_id = c.id " +
                "LEFT JOIN users u ON v.assigned_manager_id = u.id " +
                "WHERE 1=1 ";

        MapSqlParameterSource params = new MapSqlParameterSource();
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("all")) {
            sql += "AND v.status = :status ";
            params.addValue("status", statusFilter);
        }
        if (countryId != null) {
            sql += "AND c.id = :countryId ";
            params.addValue("countryId", countryId);
        }
        if (stateId != null) {
            sql += "AND s.id = :stateId ";
            params.addValue("stateId", stateId);
        }
        if (municipalityId != null) {
            sql += "AND v.municipality_id = :municipalityId ";
            params.addValue("municipalityId", municipalityId);
        }
        if (managerId != null) {
            sql += "AND v.assigned_manager_id = :managerId ";
            params.addValue("managerId", managerId);
        }

        sql += "ORDER BY v.name ASC";

        try {
            return cleanResults(jdbcTemplate.queryForList(sql, params));
        } catch (Exception e) {
            logger.warn("Error in getVenues: {}. Trying fallback without users join...", e.getMessage());
            try {
                String fallbackSql = "SELECT v.*, " +
                        "       m.name as municipality_name, " +
                        "       s.id as state_id, s.name as state_name, " +
                        "       c.id as country_id, c.name as country_name " +
                        "FROM venues v " +
                        "LEFT JOIN municipalities m ON v.municipality_id = m.id " +
                        "LEFT JOIN states s ON m.state_id = s.id " +
                        "LEFT JOIN countries c ON s.country_id = c.id " +
                        "WHERE 1=1 ";
                
                if (statusFilter != null && !statusFilter.equalsIgnoreCase("all")) {
                    fallbackSql += "AND v.status = :status ";
                }
                if (countryId != null) {
                    fallbackSql += "AND c.id = :countryId ";
                }
                if (stateId != null) {
                    fallbackSql += "AND s.id = :stateId ";
                }
                if (municipalityId != null) {
                    fallbackSql += "AND v.municipality_id = :municipalityId ";
                }
                if (managerId != null) {
                    fallbackSql += "AND v.assigned_manager_id = :managerId ";
                }
                fallbackSql += "ORDER BY v.name ASC";
                
                return cleanResults(jdbcTemplate.queryForList(fallbackSql, params));
            } catch (Exception ex) {
                logger.error("Error in getVenues fallback: ", ex);
                return Collections.emptyList();
            }
        }
    }

    public List<Map<String, Object>> getHistoricalEvents(Long userId, String role, int limit) {
        String sql = "SELECT e.*, " +
                "       v.name as venue_name " +
                "FROM events e " +
                "LEFT JOIN venues v ON e.venue_id = v.id " +
                "WHERE e.status != 'draft' " +
                "AND (" +
                "  (EXISTS (SELECT 1 FROM event_functions ef WHERE ef.event_id = e.id) AND " +
                "   NOT EXISTS (SELECT 1 FROM event_functions ef2 WHERE ef2.event_id = e.id AND CONCAT(ef2.date, ' ', ef2.time) >= :cutoff)) " +
                "  OR " +
                "  (NOT EXISTS (SELECT 1 FROM event_functions ef WHERE ef.event_id = e.id) AND CONCAT(e.event_date, ' ', e.event_time) < :cutoff) " +
                ") ";

        MapSqlParameterSource params = new MapSqlParameterSource();
        LocalDateTime cutoff = LocalDateTime.now(ZoneId.of("America/Mexico_City")).minusHours(1);
        params.addValue("cutoff", cutoff.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        if ("gestor".equalsIgnoreCase(role)) {
            sql += "AND (e.created_by = :userId OR e.assigned_manager_id = :userId) ";
            params.addValue("userId", userId);
        }
        
        sql += "ORDER BY e.event_date DESC LIMIT :limit";
        params.addValue("limit", limit);

        try {
            return cleanResults(jdbcTemplate.queryForList(sql, params));
        } catch (Exception e) {
            logger.error("Error in getHistoricalEvents: ", e);
            return Collections.emptyList();
        }
    }

    // Helper methods to sanitize map keys and handle different databases (casing, nulls, types)
    private List<Map<String, Object>> cleanResults(List<Map<String, Object>> results) {
        List<Map<String, Object>> cleanList = new ArrayList<>();
        for (Map<String, Object> map : results) {
            Map<String, Object> copy = new HashMap<>(map);
            cleanMap(copy);
            cleanList.add(copy);
        }
        return cleanList;
    }

    private void cleanMap(Map<String, Object> map) {
        // Handle database casing issues
        List<String> keys = new ArrayList<>(map.keySet());
        for (String key : keys) {
            Object val = map.get(key);
            String lowerKey = key.toLowerCase();
            
            // Clean values
            if (val instanceof java.sql.Timestamp) {
                val = val.toString();
            } else if (val instanceof java.sql.Date) {
                val = val.toString();
            } else if (val instanceof java.sql.Time) {
                val = val.toString();
            }

            // Convert boolean representations if necessary
            if ("use_seating_map".equals(lowerKey) || "ads_enabled".equals(lowerKey) || "merch_enabled".equals(lowerKey) || 
                "metrics_enabled".equals(lowerKey) || "presale_enabled".equals(lowerKey)) {
                if (val instanceof Number) {
                    val = ((Number) val).intValue() != 0;
                }
            }

            map.remove(key);
            map.put(lowerKey, val);
        }
    }

    private Long getLong(Object obj) {
        if (obj instanceof Number) return ((Number) obj).longValue();
        if (obj instanceof String) {
            try {
                return Long.parseLong((String) obj);
            } catch (Exception e) { return null; }
        }
        return null;
    }

    private Integer getInt(Object obj) {
        if (obj instanceof Number) return ((Number) obj).intValue();
        if (obj instanceof String) {
            try {
                return Integer.parseInt((String) obj);
            } catch (Exception e) { return 0; }
        }
        return 0;
    }

    private Double getDouble(Object obj) {
        if (obj instanceof Number) return ((Number) obj).doubleValue();
        if (obj instanceof String) {
            try {
                return Double.parseDouble((String) obj);
            } catch (Exception e) { return 0.0; }
        }
        return 0.0;
    }
}
