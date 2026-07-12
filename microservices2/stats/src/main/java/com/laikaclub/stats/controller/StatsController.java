package com.laikaclub.stats.controller;

import com.laikaclub.stats.config.UserPrincipal;
import com.laikaclub.stats.service.InfrastructureService;
import com.laikaclub.stats.service.LogService;
import com.laikaclub.stats.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class StatsController {

    private final StatsService statsService;
    private final InfrastructureService infrastructureService;
    private final LogService logService;

    @Autowired
    public StatsController(StatsService statsService,
                           InfrastructureService infrastructureService,
                           LogService logService) {
        this.statsService = statsService;
        this.infrastructureService = infrastructureService;
        this.logService = logService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "alive");
        response.put("service", "stats-service");
        return response;
    }

    @GetMapping("/admin/dashboard")
    public Map<String, Object> adminDashboard() {
        return statsService.getDashboardSummary();
    }

    @GetMapping("/admin/sales")
    public List<Map<String, Object>> adminSales() {
        return statsService.getSalesByEvent();
    }

    @GetMapping("/status")
    public Map<String, Object> systemStatus() {
        return infrastructureService.getSystemStatus();
    }

    @GetMapping("/metrics")
    public Map<String, Object> systemMetrics() {
        return infrastructureService.getSystemMetrics();
    }

    @GetMapping("/manager/dashboard")
    public Map<String, Object> managerDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        Long managerId = (principal != null) ? principal.getId() : 1L;
        return statsService.getManagerDashboard(managerId);
    }

    @GetMapping("/logs")
    public List<Map<String, Object>> getLogs(
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "level", required = false) String level) {
        return logService.getLogs(limit, level);
    }
}
