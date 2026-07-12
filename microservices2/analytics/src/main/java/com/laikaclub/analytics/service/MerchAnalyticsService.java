package com.laikaclub.analytics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class MerchAnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(MerchAnalyticsService.class);

    @Autowired(required = false)
    private DataSource dataSource;

    private Connection getMerchConnection() throws Exception {
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                String dbProduct = conn.getMetaData().getDatabaseProductName().toLowerCase();
                if (dbProduct.contains("mysql")) {
                    return dataSource.getConnection();
                }
            } catch (Exception e) {
                logger.warn("Failed checking MySQL datasource: {}, falling back to SQLite", e.getMessage());
            }
        }

        Class.forName("org.xerial.sqlite.JDBC");
        
        String path = "microservices/merchandise/merchandise.db";
        String eventsPath = "microservices/events/events.db";

        File f = new File(path);
        if (!f.exists()) {
            path = "../../microservices/merchandise/merchandise.db";
            eventsPath = "../../microservices/events/events.db";
        }

        Connection conn = DriverManager.getConnection("jdbc:sqlite:" + path);
        try (var stmt = conn.createStatement()) {
            stmt.execute("ATTACH DATABASE '" + eventsPath + "' AS events_db;");
        }
        return conn;
    }

    public Map<String, Object> getSalesInsights(String dateFrom, String dateTo) {
        Map<String, Object> response = new LinkedHashMap<>();
        
        try (Connection conn = getMerchConnection()) {
            StringBuilder dateFilter = new StringBuilder();
            List<Object> params = new ArrayList<>();

            if (dateFrom != null && !dateFrom.trim().isEmpty()) {
                dateFilter.append(" AND o.created_at >= ?");
                params.add(dateFrom);
            }
            if (dateTo != null && !dateTo.trim().isEmpty()) {
                dateFilter.append(" AND o.created_at <= ?");
                params.add(dateTo + " 23:59:59");
            }

            // 1. Sales per product
            String productSql = 
                "SELECT " +
                "    i.name          AS product_name, " +
                "    i.category      AS category, " +
                "    COALESCE(MIN(oi.unit_price), MIN(v.price), 0) AS unit_price, " +
                "    SUM(oi.quantity)      AS units_sold, " +
                "    SUM(oi.quantity * COALESCE(oi.unit_price, v.price, 0)) AS revenue " +
                "FROM merchandise_order_items oi " +
                "JOIN merchandise_orders o ON o.id = oi.order_id " +
                "JOIN merchandise_variants v ON v.id = oi.variant_id " +
                "JOIN merchandise_items i ON i.id = v.item_id " +
                "WHERE o.status = 'completed' " +
                dateFilter +
                " GROUP BY i.id, i.name, i.category " +
                "ORDER BY units_sold DESC";

            List<Map<String, Object>> products = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(productSql)) {
                for (int i = 0; i < params.size(); i++) {
                    ps.setObject(i + 1, params.get(i));
                }
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> p = new LinkedHashMap<>();
                        p.put("product_name", rs.getString("product_name"));
                        p.put("category", rs.getString("category"));
                        p.put("unit_price", rs.getDouble("unit_price"));
                        p.put("units_sold", rs.getInt("units_sold"));
                        p.put("revenue", rs.getDouble("revenue"));
                        products.add(p);
                    }
                }
            }

            long totalUnits = 0;
            double totalRevenue = 0.0;
            for (Map<String, Object> p : products) {
                totalUnits += (Integer) p.get("units_sold");
                totalRevenue += (Double) p.get("revenue");
            }

            // 2. Average per order
            String ordersSql = 
                "SELECT COUNT(*) as cnt, SUM(total_amount) as total " +
                "FROM merchandise_orders o " +
                "WHERE status = 'completed' " +
                dateFilter;

            int orderCount = 0;
            double avgPerOrder = 0.0;

            try (PreparedStatement ps = conn.prepareStatement(ordersSql)) {
                for (int i = 0; i < params.size(); i++) {
                    ps.setObject(i + 1, params.get(i));
                }
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        orderCount = rs.getInt("cnt");
                    }
                }
            }
            if (orderCount > 0) {
                avgPerOrder = Math.round((totalRevenue / orderCount) * 100.0) / 100.0;
            }

            // 3. Classify products
            int maxTop = 5;
            double minUnitsThreshold = Math.max(2.0, totalUnits * 0.05);

            List<Map<String, Object>> topProducts = new ArrayList<>();
            List<Map<String, Object>> lowProducts = new ArrayList<>();

            List<String> badges = List.of("Favorito Absoluto", "Muy Vendido", "Popular", "Sólido", "Buen Rendimiento");

            for (int i = 0; i < products.size(); i++) {
                Map<String, Object> p = products.get(i);
                int units = (Integer) p.get("units_sold");
                double rev = (Double) p.get("revenue");
                String name = (String) p.get("product_name");
                String cat = (String) p.get("category");

                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("name", name);
                entry.put("category", cat);
                entry.put("units", units);
                entry.put("revenue", Math.round(rev * 100.0) / 100.0);

                if (i < maxTop) {
                    entry.put("badge", badges.get(i));
                    entry.put("rank", i + 1);
                    topProducts.add(entry);
                }

                if (units <= minUnitsThreshold && i >= maxTop) {
                    entry.put("reason", diagnoseLowSeller(units, rev, totalUnits));
                    entry.put("action", recommendAction(units, rev, cat));
                    lowProducts.add(entry);
                }
            }

            // 4. Analysis by category
            Map<String, Map<String, Object>> catMap = new LinkedHashMap<>();
            for (Map<String, Object> p : products) {
                String cat = (String) p.get("category");
                if (cat == null) cat = "General";
                
                int units = (Integer) p.get("units_sold");
                double rev = (Double) p.get("revenue");

                catMap.putIfAbsent(cat, new LinkedHashMap<>(Map.of("units", 0, "revenue", 0.0)));
                Map<String, Object> cData = catMap.get(cat);
                cData.put("units", (Integer) cData.get("units") + units);
                cData.put("revenue", (Double) cData.get("revenue") + rev);
            }

            List<Map<String, Object>> categoryInsights = new ArrayList<>();
            for (Map.Entry<String, Map<String, Object>> entry : catMap.entrySet()) {
                categoryInsights.add(Map.of(
                    "category", entry.getKey(),
                    "units", entry.getValue().get("units"),
                    "revenue", Math.round(((Double) entry.getValue().get("revenue")) * 100.0) / 100.0
                ));
            }
            categoryInsights.sort((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")));

            // 5. Breakdown by Event Type
            String eventSql = 
                "SELECT " +
                "    COALESCE(e.category, 'Sin evento / General') AS event_type, " +
                "    COUNT(DISTINCT o.id) AS total_orders, " +
                "    SUM(oi.quantity * COALESCE(oi.unit_price, v.price, 0)) AS revenue " +
                "FROM merchandise_orders o " +
                "JOIN merchandise_order_items oi ON o.id = oi.order_id " +
                "JOIN merchandise_variants v ON v.id = oi.variant_id " +
                "JOIN merchandise_items i ON i.id = v.item_id " +
                "LEFT JOIN events_db.events e ON e.id = i.event_id " +
                "WHERE o.status = 'completed' " +
                dateFilter +
                " GROUP BY event_type " +
                "ORDER BY revenue DESC";

            List<Map<String, Object>> eventBreakdown = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(eventSql)) {
                for (int i = 0; i < params.size(); i++) {
                    ps.setObject(i + 1, params.get(i));
                }
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        eventBreakdown.add(Map.of(
                            "event_type", rs.getString("event_type"),
                            "total_orders", rs.getInt("total_orders"),
                            "revenue", Math.round(rs.getDouble("revenue") * 100.0) / 100.0
                        ));
                    }
                }
            }

            // 6. Generate strategic recommendations
            List<Map<String, Object>> recommendations = generateRecommendations(
                topProducts, lowProducts, categoryInsights,
                totalUnits, totalRevenue, eventBreakdown
            );

            response.put("status", "success");
            response.put("generated_at", LocalDateTime.now().toString());
            response.put("date_from", dateFrom);
            response.put("date_to", dateTo);
            response.put("summary", Map.of(
                "total_products_analyzed", products.size(),
                "total_units_sold", totalUnits,
                "total_revenue", Math.round(totalRevenue * 100.0) / 100.0,
                "avg_per_order", avgPerOrder,
                "total_orders", orderCount
            ));
            response.put("top_products", topProducts);
            response.put("low_products", lowProducts.subList(0, Math.min(10, lowProducts.size())));
            response.put("category_insights", categoryInsights);
            response.put("event_type_breakdown", eventBreakdown);
            response.put("recommendations", recommendations);

        } catch (Exception e) {
            logger.error("Error executing merchandise insights: {}", e.getMessage());
            response.put("status", "error");
            response.put("error", e.getMessage());
        }

        return response;
    }

    private String diagnoseLowSeller(int units, double revenue, double total) {
        double pct = total > 0 ? (units / total * 100.0) : 0.0;
        if (units == 0) {
            return "No se vendió ninguna unidad en el período seleccionado.";
        }
        if (pct < 1) {
            return String.format("Solo representó el %.1f%% de las ventas totales. Muy baja rotación.", pct);
        }
        return String.format("Vendió %d unidad(es), por debajo del promedio esperado del catálogo.", units);
    }

    private String recommendAction(int units, double revenue, String category) {
        if (units == 0) {
            return "Considera retirarlo del catálogo o hacer una promoción de lanzamiento con descuento del 30% para estimular su primera compra.";
        }
        if (revenue < 500) {
            return "Prueba combinarlo con un producto estrella en un paquete (bundle) para impulsarlo sin reducir precio directamente.";
        }
        return String.format("Colócalo en un lugar más visible en la tienda o agrégalo como sugerido junto a los productos de '%s' más populares.", category);
    }

    private List<Map<String, Object>> generateRecommendations(
            List<Map<String, Object>> top, List<Map<String, Object>> low,
            List<Map<String, Object>> categories, long totalUnits, double totalRevenue,
            List<Map<String, Object>> eventBreakdown) {
        
        List<Map<String, Object>> recs = new ArrayList<>();

        // 1. Catalog Star
        if (!top.isEmpty()) {
            Map<String, Object> star = top.get(0);
            String body = String.format(
                "El producto que más se vendió fue «%s» con %,d unidades y $%,.0f MXN en ingresos. ",
                star.get("name"), star.get("units"), star.get("revenue")
            );

            if (top.size() > 1) {
                List<String> otherTops = new ArrayList<>();
                for (int i = 1; i < Math.min(3, top.size()); i++) {
                    otherTops.add(String.valueOf(top.get(i).get("name")));
                }
                String othersTxt = String.join(" y ", otherTops);
                body += String.format(
                    "Le siguen de cerca %s. Te recomendamos asegurarte de tener suficiente stock de estos artículos " +
                    "antes de cada evento, ya que son los que la gente más busca. También podrías ampliar la variedad " +
                    "dentro de su categoría para capturar aún más ventas de quienes ya compran ese tipo de producto.",
                    othersTxt
                );
            }

            recs.add(Map.of(
                "icon", "",
                "title", "Tus productos estrella",
                "body", body,
                "type", "success",
                "tag", "ALTO RENDIMIENTO"
            ));
        }

        // 2. Low Performers
        if (!low.isEmpty()) {
            List<String> lowNamesList = new ArrayList<>();
            for (int i = 0; i < Math.min(3, low.size()); i++) {
                lowNamesList.add("«" + low.get(i).get("name") + "»");
            }
            String lowNames = String.join(", ", lowNamesList);

            long zeroSellers = low.stream().filter(p -> ((Number) p.get("units")).intValue() == 0).count();

            String body = String.format("Los productos con menos ventas fueron: %s. ", lowNames);
            if (zeroSellers > 0) {
                body += String.format(
                    "De estos, %d no vendieron ni una sola unidad. Antes de descontinuarlos, prueba ponerlos " +
                    "en una oferta de descuento o pregunta a los asistentes si los conocen — a veces simplemente no se ven.",
                    zeroSellers
                );
            } else {
                body += "No son un fracaso, pero sí necesitan un pequeño empujón. Prueba incluirlos en paquetes con los más vendidos o ponerlos en un lugar más visible durante los eventos.";
            }

            recs.add(Map.of(
                "icon", "",
                "title", "Productos que necesitan un empujón",
                "body", body,
                "type", "warning",
                "tag", "BAJO RENDIMIENTO"
            ));
        }

        // 3. Category Diversification
        if (categories.size() >= 2) {
            Map<String, Object> topCat = categories.get(0);
            Map<String, Object> lowCat = categories.get(categories.size() - 1);

            String body = String.format(
                "La categoría «%s» generó la mayor parte de los ingresos con $%,.0f MXN. " +
                "En cambio, «%s» fue la que menos movió ($%,.0f MXN). " +
                "Si quieres equilibrar mejor tus ventas, considera traer más variedad de «%s» " +
                "en el siguiente evento y evalúa si vale la pena seguir invirtiendo en «%s» o redirigir ese presupuesto.",
                topCat.get("category"), topCat.get("revenue"), lowCat.get("category"), lowCat.get("revenue"),
                topCat.get("category"), lowCat.get("category")
            );

            recs.add(Map.of(
                "icon", "",
                "title", "¿En qué tipo de productos conviene invertir más?",
                "body", body,
                "type", "info",
                "tag", "DIVERSIFICACIÓN"
            ));
        }

        // 4. By Event Type
        if (eventBreakdown.size() >= 2) {
            Map<String, Object> bestEv = eventBreakdown.get(0);
            Map<String, Object> worstEv = eventBreakdown.get(eventBreakdown.size() - 1);

            String body = String.format(
                "La mercancía se vende mejor en eventos de tipo «%s» donde se generaron $%,.0f MXN. " +
                "En eventos de «%s» las ventas fueron más bajas. Si organizas más eventos del primer tipo, " +
                "puedes anticipar mayor demanda de mercancía y preparar el inventario con tiempo.",
                bestEv.get("event_type"), bestEv.get("revenue"), worstEv.get("event_type")
            );

            recs.add(Map.of(
                "icon", "",
                "title", "¿En qué eventos vende más tu tienda?",
                "body", body,
                "type", "info",
                "tag", "POR TIPO DE EVENTO"
            ));
        }

        // 5. Financial Health
        if (totalRevenue > 0) {
            double top3Rev = 0.0;
            for (int i = 0; i < Math.min(3, top.size()); i++) {
                top3Rev += (Double) top.get(i).get("revenue");
            }
            double concentration = Math.round((top3Rev / totalRevenue * 100.0) * 10.0) / 10.0;

            String body = String.format("En total tu tienda generó $%,.0f MXN en ventas de mercancía. ", totalRevenue);
            if (concentration > 70.0) {
                body += String.format(
                    "El %.1f%% de esos ingresos viene de solo 3 productos. Esto es bueno porque tienes éxitos claros, " +
                    "pero también significa que si alguno de ellos falla o se agota, los ingresos caerán notablemente. " +
                    "Intenta impulsar 2 o 3 productos más para tener una base más sólida.",
                    concentration
                );
            } else {
                body += "Tus ventas están bien distribuidas entre varios productos, lo que hace tu negocio más estable y resistente.";
            }

            recs.add(Map.of(
                "icon", "",
                "title", "Salud financiera de tu tienda",
                "body", body,
                "type", "success",
                "tag", "FINANZAS"
            ));
        }

        return recs;
    }
}
