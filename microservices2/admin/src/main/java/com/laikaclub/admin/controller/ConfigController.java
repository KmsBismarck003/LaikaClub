package com.laikaclub.admin.controller;

import com.laikaclub.admin.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class ConfigController {

    private final ConfigService configService;

    @Autowired
    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getRuntimeConfig() {
        return ResponseEntity.ok(configService.getRuntimeConfig());
    }

    @GetMapping("/config/ticker")
    public ResponseEntity<Map<String, Object>> getTickerConfig() {
        return ResponseEntity.ok(configService.getTickerConfig());
    }

    @PostMapping("/config/ticker")
    public ResponseEntity<Map<String, Boolean>> updateTickerConfig(@RequestBody Map<String, Object> config) {
        configService.updateTickerConfig(config);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/config/{key}")
    public ResponseEntity<Map<String, Boolean>> updateConfigParam(@PathVariable String key, @RequestBody Map<String, Object> payload) {
        Object val = payload.get("value");
        String valueStr = val != null ? val.toString() : "";
        configService.updateConfigParam(key, valueStr);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
