package com.laikaclub.analytics.matis.predictive;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics/matis/predictive")
public class PredictiveController {

    private final PredictiveService predictiveService;

    @Autowired
    public PredictiveController(PredictiveService predictiveService) {
        this.predictiveService = predictiveService;
    }

    @GetMapping("/sold-out")
    public Map<String, Object> getSoldOutPredictions() {
        return predictiveService.predictSoldOut();
    }

    @GetMapping("/anomalies")
    public Map<String, Object> getAnomalies() {
        return predictiveService.detectAnomalies();
    }

    @GetMapping("/regression")
    public Map<String, Object> getRegression(@RequestParam(value = "manager_id", required = false) Integer managerId) {
        return predictiveService.predictRegression(managerId);
    }

    @GetMapping("/classification")
    public Map<String, Object> getClassification(
            @RequestParam(value = "manager_id", required = false) Integer managerId,
            @RequestParam(value = "event_id", required = false) Integer eventId,
            @RequestParam(value = "objective", required = false) String objective,
            @RequestParam(value = "q1", required = false) String q1,
            @RequestParam(value = "q2", required = false) String q2,
            @RequestParam(value = "q3", required = false) String q3) {
        return predictiveService.predictClassification(managerId, eventId, objective, q1, q2, q3);
    }
}
