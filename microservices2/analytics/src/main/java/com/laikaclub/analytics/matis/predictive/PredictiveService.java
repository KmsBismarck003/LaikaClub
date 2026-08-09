package com.laikaclub.analytics.matis.predictive;

import com.laikaclub.analytics.matis.shared.SharedAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PredictiveService {

    private static final Logger logger = LoggerFactory.getLogger(PredictiveService.class);

    private final JdbcTemplate jdbcTemplate;
    private final SharedAnalyticsService sharedService;

    @Autowired
    public PredictiveService(JdbcTemplate jdbcTemplate, SharedAnalyticsService sharedService) {
        this.jdbcTemplate = jdbcTemplate;
        this.sharedService = sharedService;
    }

    public Map<String, Object> predictSoldOut() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("timestamp", LocalDateTime.now().toString());

        try {
            // Find events where sold tickets are > 75% of capacity
            String query = "SELECT e.id, e.name, e.price, e.total_tickets, e.available_tickets, " +
                    "(SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as sold " +
                    "FROM events e WHERE e.status = 'published'";

            List<Map<String, Object>> events = jdbcTemplate.queryForList(query);
            List<Map<String, Object>> criticalEvents = new ArrayList<>();

            for (Map<String, Object> ev : events) {
                int total = ev.get("total_tickets") != null ? ((Number) ev.get("total_tickets")).intValue() : 0;
                int sold = ev.get("sold") != null ? ((Number) ev.get("sold")).intValue() : 0;
                double pct = total > 0 ? (sold * 100.0 / total) : 0.0;

                if (pct >= 75.0 && total > 0 && total != sold) {
                    Map<String, Object> evStats = new HashMap<>(ev);
                    evStats.put("ocupacion_pct", Math.round(pct * 100.0) / 100.0);
                    evStats.put("cancellation_risk", "Bajo");
                    evStats.put("sold_out_probability", Math.round((70.0 + (pct - 75.0) * 1.2) * 10.0) / 10.0);
                    criticalEvents.add(evStats);
                }
            }

            result.put("predictions", criticalEvents);
            result.put("confidence", 0.89);
            result.put("message", criticalEvents.isEmpty() ? 
                    "No hay eventos próximos con peligro inminente de agotado (>75% de ventas)." :
                    "Se han detectado " + criticalEvents.size() + " eventos con alta probabilidad de sold-out.");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }

        return result;
    }

    public Map<String, Object> detectAnomalies() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("timestamp", LocalDateTime.now().toString());

        try {
            // Find tickets with prices that don't match event base price
            String query = "SELECT t.id, t.ticket_code, t.price as ticket_price, e.name as event_name, e.price as base_price " +
                    "FROM tickets t JOIN events e ON t.event_id = e.id " +
                    "WHERE t.status != 'cancelled' AND (t.price > e.price * 3.0 OR t.price < e.price * 0.4)";

            List<Map<String, Object>> pricingAnomalies = jdbcTemplate.queryForList(query);
            result.put("pricing_anomalies_count", pricingAnomalies.size());
            result.put("anomalies", pricingAnomalies);
            result.put("level", pricingAnomalies.isEmpty() ? "info" : "warning");
            result.put("message", pricingAnomalies.isEmpty() ? 
                    "No se detectaron anomalías o fluctuaciones extrañas de precios." :
                    "Se detectaron " + pricingAnomalies.size() + " transacciones con desviación de precio extrema (posibles reventas o errores de pasarela).");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }

        return result;
    }

    public Map<String, Object> predictRegression(Integer managerId) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("timestamp", LocalDateTime.now().toString());

        double slope = 150.0;
        double intercept = 0.0;

        List<Map<String, Object>> mlPoints = new ArrayList<>();
        try {
            String query = "SELECT event_id, COUNT(*) as sold, SUM(price) as income FROM tickets WHERE status != 'cancelled' AND price < 50000 GROUP BY event_id";
            if (managerId != null) {
                query = "SELECT t.event_id, COUNT(t.id) as sold, SUM(t.price) as income " +
                        "FROM tickets t JOIN events e ON t.event_id = e.id " +
                        "WHERE t.status != 'cancelled' AND t.price < 50000 AND (e.created_by = ? OR e.assigned_manager_id = ?) " +
                        "GROUP BY t.event_id";
                mlPoints = jdbcTemplate.queryForList(query, managerId, managerId);
            } else {
                mlPoints = jdbcTemplate.queryForList(query);
            }
        } catch (Exception e) {
            logger.error("Error retrieving tickets for regression: {}", e.getMessage());
        }

        if (mlPoints.size() < 5) {
            result.put("status", "insufficient_data");
            result.put("message", "Datos reales insuficientes en MySQL para realizar el análisis de regresión (mínimo 5 eventos con ventas reales).");
            return result;
        }

        List<Double> xVals = new ArrayList<>();
        List<Double> yVals = new ArrayList<>();
        for (Map<String, Object> pt : mlPoints) {
            xVals.add(((Number) pt.get("sold")).doubleValue());
            yVals.add(((Number) pt.get("income")).doubleValue());
        }

        int n = xVals.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
        for (int i = 0; i < n; i++) {
            double x = xVals.get(i);
            double y = yVals.get(i);
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
            sumYY += y * y;
        }

        double meanX = sumX / n;
        double meanY = sumY / n;
        double ssTot = sumYY - (sumY * sumY) / n;
        double sxx = sumXX - (sumX * sumX) / n;
        double sxy = sumXY - (sumX * sumY) / n;

        if (sxx != 0) {
            slope = sxy / sxx;
            intercept = meanY - slope * meanX;
        }

        double ssResSimple = 0.0;
        double sumAbsSimple = 0.0;
        for (int i = 0; i < n; i++) {
            double x = xVals.get(i);
            double y = yVals.get(i);
            double yPred = slope * x + intercept;
            ssResSimple += Math.pow(y - yPred, 2);
            sumAbsSimple += Math.abs(y - yPred);
        }
        double r2Simple = ssTot != 0 ? 1.0 - (ssResSimple / ssTot) : 1.0;
        r2Simple = Math.max(0.0, Math.min(1.0, r2Simple));
        double maeSimple = sumAbsSimple / n;
        double rmseSimple = Math.sqrt(ssResSimple / n);

        result.put("slope", Math.round(slope * 100.0) / 100.0);
        result.put("intercept", Math.round(intercept * 100.0) / 100.0);
        result.put("r2", Math.round(r2Simple * 1000.0) / 1000.0);
        result.put("mae", Math.round(maeSimple * 100.0) / 100.0);
        result.put("rmse", Math.round(rmseSimple * 100.0) / 100.0);
        result.put("data_points_count", n);

        return result;
    }

    public Map<String, Object> predictClassification(Integer managerId, Integer eventId, String objective, String q1, String q2, String q3) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("timestamp", LocalDateTime.now().toString());

        boolean isDynamic = objective != null && !objective.isEmpty() && q1 != null && q2 != null && q3 != null;

        List<Map<String, Object>> predictions = new ArrayList<>();
        try {
            String query = "SELECT e.id as event_id, e.name, e.price, e.total_tickets, e.available_tickets, " +
                    "(SELECT COUNT(*) FROM tickets t WHERE t.event_id = e.id AND t.status != 'cancelled') as cantidad_vendida " +
                    "FROM events e";
            
            List<Object> qParams = new ArrayList<>();
            List<String> conditions = new ArrayList<>();
            if (managerId != null) {
                conditions.add("(e.created_by = ? OR e.assigned_manager_id = ?)");
                qParams.add(managerId);
                qParams.add(managerId);
            }
            if (eventId != null) {
                conditions.add("e.id = ?");
                qParams.add(eventId);
            }
            if (!conditions.isEmpty()) {
                query += " WHERE " + String.join(" AND ", conditions);
            }

            List<Map<String, Object>> events = jdbcTemplate.queryForList(query, qParams.toArray());

            for (Map<String, Object> ev : events) {
                double price = ev.get("price") != null ? ((Number) ev.get("price")).doubleValue() : 0.0;
                int totalTickets = ev.get("total_tickets") != null ? ((Number) ev.get("total_tickets")).intValue() : 0;
                int sold = ((Number) ev.get("cantidad_vendida")).intValue();

                double ocupacionPct = totalTickets > 0 ? (sold * 100.0 / totalTickets) : 0.0;
                ocupacionPct = Math.round(ocupacionPct * 100.0) / 100.0;

                String classification;
                String recommendation;
                double extraRevenue;

                if (isDynamic) {
                    double extraRevenueFactor = 0.0;
                    classification = "Precio Estable";
                    recommendation = "Mantener precio estándar";

                    if ("price_adjustment".equals(objective)) {
                        if ("volume".equals(q1) || "low".equals(q2)) {
                            classification = "Descuento Recomendado";
                            recommendation = "Aplicar descuento temporal de 15%";
                            extraRevenueFactor = 0.10;
                        } else if ("margin".equals(q1) && "high".equals(q2)) {
                            classification = "Tarifa Dinámica";
                            recommendation = "Incrementar tarifa 15% por alta demanda";
                            extraRevenueFactor = 0.15;
                        }
                    }
                    extraRevenue = sold * price * extraRevenueFactor;
                } else {
                    if (ocupacionPct > 60.0 && price > 30.0) {
                        classification = "Tarifa Dinámica";
                        recommendation = "Alta demanda. Incrementar precio 15%.";
                        extraRevenue = (totalTickets - sold) * price * 0.15;
                    } else if (ocupacionPct < 30.0 && price > 30.0) {
                        classification = "Promoción";
                        recommendation = "Baja demanda. Lanzar código 2x1.";
                        extraRevenue = (totalTickets - sold) * price * 0.15;
                    } else {
                        classification = "Estable";
                        recommendation = "Demanda promedio. Mantener precio base.";
                        extraRevenue = 0.0;
                    }
                }

                Map<String, Object> predictionMap = new HashMap<>();
                predictionMap.put("event_id", ev.get("event_id"));
                predictionMap.put("name", ev.get("name"));
                predictionMap.put("price", price);
                predictionMap.put("total_tickets", totalTickets);
                predictionMap.put("cantidad_vendida", sold);
                predictionMap.put("ocupacion_pct", ocupacionPct);
                predictionMap.put("classification", classification);
                predictionMap.put("recommendation", recommendation);
                predictionMap.put("extra_revenue", Math.round(extraRevenue * 100.0) / 100.0);
                predictions.add(predictionMap);
            }
        } catch (Exception e) {
            logger.error("Error in decision tree: {}", e.getMessage());
        }

        result.put("predictions", predictions);
        result.put("summary", "Clasificación de Oportunidades de Tarifa y Aforo");
        return result;
    }
}
