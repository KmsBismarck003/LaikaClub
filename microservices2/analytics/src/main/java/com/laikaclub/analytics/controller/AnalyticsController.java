package com.laikaclub.analytics.controller;

import com.laikaclub.analytics.service.AnalyticsEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/")
public class AnalyticsController {

    private final AnalyticsEngineService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsEngineService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "service", "laika-analytics");
    }

    @GetMapping("/api/analytics/tables")
    public Map<String, List<String>> getTables() {
        return Map.of("tables", analyticsService.getAvailableTables());
    }

    @GetMapping("/api/analytics/suggestions")
    public List<String> getSuggestions() {
        return analyticsService.getArtistSuggestions();
    }

    @GetMapping("/api/analytics/full")
    public List<Map<String, Object>> getFullAnalysis() {
        return analyticsService.runAnalysis("tickets", "mapreduce", Collections.emptyMap());
    }

    @GetMapping("/api/analytics/incremental")
    public List<Map<String, Object>> getIncrementalAnalysis(@RequestParam("last_date") String lastDate) {
        return analyticsService.runAnalysis("tickets", "mapreduce", Map.of("date_from", lastDate));
    }

    @GetMapping("/api/analytics/mapreduce")
    public List<Map<String, Object>> getMapReduce(
            @RequestParam(value = "table_name", required = false) String tableNameParam,
            @RequestParam(value = "table", required = false) String tableParam,
            @RequestParam(value = "mode", defaultValue = "mapreduce") String mode,
            @RequestParam(value = "date_from", required = false) String dateFrom,
            @RequestParam(value = "date_to", required = false) String dateTo,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "payment_method", required = false) String paymentMethod,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "min_price", required = false) Double minPrice,
            @RequestParam(value = "max_price", required = false) Double maxPrice,
            @RequestParam(value = "event_id", required = false) Integer eventId,
            @RequestParam(value = "hour_range", required = false) String hourRange,
            @RequestParam(value = "manager_id", required = false) Integer managerId) {

        String tableName = tableNameParam != null ? tableNameParam : tableParam;
        if (tableName == null) tableName = "tickets";

        Map<String, Object> filters = new HashMap<>();
        if (dateFrom != null) filters.put("date_from", dateFrom);
        if (dateTo != null) filters.put("date_to", dateTo);
        if (category != null) filters.put("category", category);
        if (role != null) filters.put("role", role);
        if (paymentMethod != null) filters.put("payment_method", paymentMethod);
        if (status != null) filters.put("status", status);
        if (minPrice != null) filters.put("min_price", minPrice);
        if (maxPrice != null) filters.put("max_price", maxPrice);
        if (eventId != null) filters.put("event_id", eventId);
        if (hourRange != null) filters.put("hour_range", hourRange);
        if (managerId != null) filters.put("manager_id", managerId);

        return analyticsService.runAnalysis(tableName, mode, filters);
    }

    @GetMapping("/api/analytics/3d")
    public List<Map<String, Object>> get3dAnalysis(
            @RequestParam(value = "table_name", required = false) String tableNameParam,
            @RequestParam(value = "table", required = false) String tableParam,
            @RequestParam(value = "date_from", required = false) String dateFrom,
            @RequestParam(value = "date_to", required = false) String dateTo,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "payment_method", required = false) String paymentMethod,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "min_price", required = false) Double minPrice,
            @RequestParam(value = "max_price", required = false) Double maxPrice,
            @RequestParam(value = "event_id", required = false) Integer eventId,
            @RequestParam(value = "hour_range", required = false) String hourRange,
            @RequestParam(value = "manager_id", required = false) Integer managerId) {

        String tableName = tableNameParam != null ? tableNameParam : tableParam;
        if (tableName == null) tableName = "tickets";

        Map<String, Object> filters = new HashMap<>();
        if (dateFrom != null) filters.put("date_from", dateFrom);
        if (dateTo != null) filters.put("date_to", dateTo);
        if (category != null) filters.put("category", category);
        if (role != null) filters.put("role", role);
        if (paymentMethod != null) filters.put("payment_method", paymentMethod);
        if (status != null) filters.put("status", status);
        if (minPrice != null) filters.put("min_price", minPrice);
        if (maxPrice != null) filters.put("max_price", maxPrice);
        if (eventId != null) filters.put("event_id", eventId);
        if (hourRange != null) filters.put("hour_range", hourRange);
        if (managerId != null) filters.put("manager_id", managerId);

        return analyticsService.run3dAnalysis(tableName, filters);
    }

    @PostMapping("/api/analytics/predict")
    public Map<String, Object> predict() {
        return analyticsService.predictSoldOut();
    }

    @PostMapping("/api/analytics/anomalies")
    public Map<String, Object> anomalies() {
        return analyticsService.detectAnomalies();
    }

    @PostMapping("/api/analytics/clean")
    public Map<String, Object> clean(@RequestParam(value = "table", defaultValue = "tickets") String table) {
        return analyticsService.runSaneamiento(table);
    }

    @GetMapping("/api/analytics/stats/descriptive")
    public Map<String, Object> getDescriptiveStats(
            @RequestParam(value = "table_name", required = false) String tableNameParam,
            @RequestParam(value = "table", required = false) String tableParam,
            @RequestParam(value = "manager_id", required = false) Integer managerId,
            @RequestParam(value = "event_id", required = false) Integer eventId) {

        String tableName = tableNameParam != null ? tableNameParam : tableParam;
        if (tableName == null) tableName = "tickets";

        return analyticsService.getDescriptiveStats(tableName, managerId, eventId);
    }

    @GetMapping("/api/analytics/intelligence")
    public Map<String, Object> getIntelligence(
            @RequestParam("action") String action,
            @RequestParam(value = "table_name", defaultValue = "tickets") String tableName) {
        return analyticsService.runProactiveIntelligence(action, tableName);
    }
}
