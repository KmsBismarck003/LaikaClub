package com.laikaclub.events.lbs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lbs")
public class LbsController {

    private final LbsSuggestionEngine suggestionEngine;

    @Autowired
    public LbsController(LbsSuggestionEngine suggestionEngine) {
        this.suggestionEngine = suggestionEngine;
    }

    @PostMapping("/geofence/trigger")
    public ResponseEntity<Map<String, Object>> handleGeofenceTrigger(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody GeofenceTriggerDTO trigger) {
        
        if (userId == null) {
            // If we don't have a user context, we can't send a targeted push notification
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
        }

        try {
            suggestionEngine.processGeofenceTrigger(userId, trigger);
            return ResponseEntity.ok(Map.of("success", true, "message", "Geofence trigger processed"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
