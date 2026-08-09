package com.laikaclub.analytics.matis.quality;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics/matis/quality")
public class QualityController {

    private final QualityService qualityService;

    @Autowired
    public QualityController(QualityService qualityService) {
        this.qualityService = qualityService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return qualityService.getDataQualityStats();
    }

    @PostMapping("/clean")
    public Map<String, Object> clean(@RequestParam(value = "table", defaultValue = "tickets") String table) {
        return qualityService.runSaneamiento(table);
    }
}
