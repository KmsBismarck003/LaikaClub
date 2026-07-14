package com.laikaclub.events.lbs;

import com.laikaclub.events.config.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody GeofenceTriggerDTO trigger) {
        
        if (principal == null) {
            // If we don't have a user context, we can't send a targeted push notification
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
        }
        
        Long userId = principal.getId();

        try {
            String suggestion = suggestionEngine.processGeofenceTrigger(userId, trigger);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "suggestion", suggestion != null ? suggestion : "none"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
