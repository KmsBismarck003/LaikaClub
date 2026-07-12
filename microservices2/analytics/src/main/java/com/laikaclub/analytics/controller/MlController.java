package com.laikaclub.analytics.controller;

import com.laikaclub.analytics.service.AnalyticsEngineService;
import com.laikaclub.analytics.service.MerchAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class MlController {

    private final AnalyticsEngineService analyticsService;
    private final MerchAnalyticsService merchService;

    @Autowired
    public MlController(AnalyticsEngineService analyticsService, MerchAnalyticsService merchService) {
        this.analyticsService = analyticsService;
        this.merchService = merchService;
    }

    @GetMapping("/ml/regression")
    public Map<String, Object> getRegression(@RequestParam(value = "manager_id", required = false) Integer managerId) {
        return analyticsService.predictRegression(managerId);
    }

    @GetMapping("/ml/decision-tree")
    public Map<String, Object> getDecisionTree(
            @RequestParam(value = "manager_id", required = false) Integer managerId,
            @RequestParam(value = "event_id", required = false) Integer eventId,
            @RequestParam(value = "objective", required = false) String objective,
            @RequestParam(value = "q1", required = false) String q1,
            @RequestParam(value = "q2", required = false) String q2,
            @RequestParam(value = "q3", required = false) String q3) {
        return analyticsService.predictClassification(managerId, eventId, objective, q1, q2, q3);
    }

    @GetMapping("/ml/prospecting")
    public Map<String, Object> getProspecting() {
        return analyticsService.getVenueProspectingLeads();
    }

    @GetMapping("/ml/user-behavior")
    public Map<String, Object> getUserBehavior(@RequestParam(value = "manager_id", required = false) Integer managerId) {
        return analyticsService.getUserBehaviorAnalytics(managerId);
    }

    @GetMapping("/ml/demand-prediction")
    public Map<String, Object> getDemandPrediction(@RequestParam(value = "manager_id", required = false) Integer managerId) {
        return analyticsService.getDemandPredictionAnalytics(managerId);
    }

    @GetMapping("/merch/sales-insights")
    public Map<String, Object> getMerchSalesInsights(
            @RequestParam(value = "date_from", required = false) String dateFrom,
            @RequestParam(value = "date_to", required = false) String dateTo) {
        return merchService.getSalesInsights(dateFrom, dateTo);
    }
}
