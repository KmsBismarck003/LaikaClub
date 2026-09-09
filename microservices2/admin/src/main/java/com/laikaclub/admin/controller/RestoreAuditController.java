package com.laikaclub.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.admin.domain.RestoreEvent;
import com.laikaclub.admin.repository.RestoreEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/restore-audit")
public class RestoreAuditController {

    private final RestoreEventRepository restoreEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RestoreAuditController(RestoreEventRepository restoreEventRepository) {
        this.restoreEventRepository = restoreEventRepository;
    }

    @GetMapping("/events")
    public ResponseEntity<?> getEvents(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Boolean is_confirmed) {

        List<RestoreEvent> events = restoreEventRepository.findAllByOrderByCreatedAtDesc();

        if (environment != null && !environment.isEmpty()) {
            events = events.stream()
                    .filter(e -> environment.equalsIgnoreCase(e.getEnvironment()))
                    .collect(Collectors.toList());
        }
        if (severity != null && !severity.isEmpty()) {
            events = events.stream()
                    .filter(e -> severity.equalsIgnoreCase(e.getSeverity()))
                    .collect(Collectors.toList());
        }
        if (is_confirmed != null) {
            events = events.stream()
                    .filter(e -> is_confirmed.equals(e.getIsConfirmed()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of("events", events, "total", events.size()));
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody RestoreEvent event) {
        if (event.getCreatedAt() == null) {
            event.setCreatedAt(LocalDateTime.now());
        }
        RestoreEvent saved = restoreEventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        Optional<RestoreEvent> event = restoreEventRepository.findById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(event.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody RestoreEvent updated) {
        return restoreEventRepository.findById(id).map(existing -> {
            if (updated.getEnvironment() != null) existing.setEnvironment(updated.getEnvironment());
            if (updated.getRestoreType() != null) existing.setRestoreType(updated.getRestoreType());
            if (updated.getSeverity() != null) existing.setSeverity(updated.getSeverity());
            if (updated.getRestoreReason() != null) existing.setRestoreReason(updated.getRestoreReason());
            RestoreEvent saved = restoreEventRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events/{id}/technical-checks")
    public ResponseEntity<?> saveTechnicalChecks(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return restoreEventRepository.findById(id).map(existing -> {
            try {
                existing.setTechnicalChecks(objectMapper.writeValueAsString(data));
                restoreEventRepository.save(existing);
                return ResponseEntity.ok(Map.of("success", true, "event", existing));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events/{id}/functional-checks")
    public ResponseEntity<?> saveFunctionalChecks(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return restoreEventRepository.findById(id).map(existing -> {
            try {
                existing.setFunctionalChecks(objectMapper.writeValueAsString(data));
                restoreEventRepository.save(existing);
                return ResponseEntity.ok(Map.of("success", true, "event", existing));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events/{id}/operational-impact")
    public ResponseEntity<?> saveOperationalImpact(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return restoreEventRepository.findById(id).map(existing -> {
            try {
                existing.setOperationalImpact(objectMapper.writeValueAsString(data));
                restoreEventRepository.save(existing);
                return ResponseEntity.ok(Map.of("success", true, "event", existing));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/events/{id}/confirm")
    public ResponseEntity<?> confirmEvent(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return restoreEventRepository.findById(id).map(existing -> {
            existing.setIsConfirmed(true);
            existing.setConfirmedAt(LocalDateTime.now());
            restoreEventRepository.save(existing);
            return ResponseEntity.ok(Map.of("success", true, "message", "Evento verificado y confirmado"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<RestoreEvent> events = restoreEventRepository.findAll();
        long totalRestores = events.size();
        long pending = events.stream().filter(e -> !Boolean.TRUE.equals(e.getIsConfirmed())).count();
        long confirmed = totalRestores - pending;

        double successRate = totalRestores > 0 ? ((double) confirmed / totalRestores) * 100 : 100.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRestores", totalRestores);
        stats.put("pendingConfirmation", pending);
        stats.put("successRate", Math.round(successRate * 10.0) / 10.0);
        stats.put("avgDowntimeMinutes", 0);

        return ResponseEntity.ok(Map.of("stats", stats));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportHistory() {
        List<RestoreEvent> events = restoreEventRepository.findAllByOrderByCreatedAtDesc();
        StringBuilder csv = new StringBuilder("id,database_name,environment,restore_type,execution_method,is_confirmed,created_at\n");
        for (RestoreEvent e : events) {
            csv.append(e.getId()).append(",")
               .append(e.getDatabaseName()).append(",")
               .append(e.getEnvironment()).append(",")
               .append(e.getRestoreType()).append(",")
               .append(e.getExecutionMethod()).append(",")
               .append(e.getIsConfirmed()).append(",")
               .append(e.getCreatedAt()).append("\n");
        }
        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=restore_audit_history.csv")
                .body(bytes);
    }
}
