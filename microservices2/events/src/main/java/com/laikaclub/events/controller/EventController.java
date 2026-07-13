package com.laikaclub.events.controller;

import com.laikaclub.events.config.UserPrincipal;
import com.laikaclub.events.dto.EventDTOs;
import com.laikaclub.events.service.EventQueryService;
import com.laikaclub.events.service.EventService;
import com.laikaclub.events.service.FileStorageService;
import com.laikaclub.events.service.PresaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class EventController {

    private final EventQueryService eventQueryService;
    private final EventService eventService;
    private final PresaleService presaleService;
    private final FileStorageService fileStorageService;

    @Autowired
    public EventController(EventQueryService eventQueryService,
                           EventService eventService,
                           PresaleService presaleService,
                           FileStorageService fileStorageService) {
        this.eventQueryService = eventQueryService;
        this.eventService = eventService;
        this.presaleService = presaleService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "healthy", "service", "laika-events");
    }

    @GetMapping("/public")
    public List<Map<String, Object>> getPublicEvents(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "20") int limit) {
        return eventQueryService.getPublicEvents(category, limit);
    }

    @GetMapping("/all")
    public List<Map<String, Object>> getAllEvents(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(name = "country_id", required = false) Long countryId,
            @RequestParam(name = "state_id", required = false) Long stateId,
            @RequestParam(name = "municipality_id", required = false) Long municipalityId,
            @RequestParam(name = "venue_id", required = false) Long venueId) {
        return eventQueryService.getAllEvents(limit, countryId, stateId, municipalityId, venueId);
    }

    @GetMapping("/my-events")
    public List<Map<String, Object>> getMyEvents(
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return eventQueryService.getUserEvents(principal.getId(), limit);
    }

    @GetMapping("/{event_id}")
    public Map<String, Object> getEventDetail(@PathVariable("event_id") Long eventId) {
        Map<String, Object> event = eventQueryService.getEventById(eventId, true);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
        }
        return event;
    }

    // Supports both standard and manager routes
    @PostMapping(value = {"", "/manager/events"})
    public Map<String, Object> createEvent(
            @RequestBody EventDTOs.EventCreate dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return eventService.createEvent(dto, principal.getId());
    }

    @PutMapping("/{event_id}")
    public Map<String, Object> updateEvent(
            @PathVariable("event_id") Long eventId,
            @RequestBody EventDTOs.EventUpdate dto) {
        return eventService.updateEvent(eventId, dto);
    }

    @PatchMapping(value = {"/{event_id}/publish", "/manager/events/{event_id}/publish"})
    public Map<String, Object> publishEvent(@PathVariable("event_id") Long eventId) {
        return eventService.publishEvent(eventId);
    }

    @PatchMapping(value = {"/{event_id}/unpublish", "/manager/events/{event_id}/unpublish"})
    public Map<String, Object> unpublishEvent(@PathVariable("event_id") Long eventId) {
        return eventService.unpublishEvent(eventId);
    }

    @GetMapping("/manager/events/{event_id}/tickets")
    public Map<String, Object> getEventTickets(@PathVariable("event_id") Long eventId) {
        return eventQueryService.getEventTicketsAnalytics(eventId);
    }

    @GetMapping("/manager/events/{event_id}/revenue")
    public Map<String, Object> getEventRevenue(@PathVariable("event_id") Long eventId) {
        return eventQueryService.getEventRevenueAnalytics(eventId);
    }

    @PostMapping("/manager/events/upload-image")
    public Map<String, Object> uploadEventImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.saveEventImage(file);
            return Map.of("url", url, "message", "Imagen subida correctamente");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al procesar la imagen: " + e.getMessage());
        }
    }

    @GetMapping("/presale/{event_id}/info")
    public Map<String, Object> getPresaleInfo(@PathVariable("event_id") Long eventId) {
        Map<String, Object> event = eventQueryService.getEventById(eventId, false);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
        }
        return presaleService.getPresaleInfo(event);
    }

    @PostMapping("/presale/{event_id}/validate-bin")
    public Map<String, Object> validatePresaleBin(
            @PathVariable("event_id") Long eventId,
            @RequestBody Map<String, Object> payload) {
        Map<String, Object> event = eventQueryService.getEventById(eventId, false);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
        }

        if (!presaleService.isPresaleActive(event)) {
            return Map.of("valid", true, "message", "Venta general activa");
        }

        String cardNumber = String.valueOf(payload.getOrDefault("card_number", ""));
        String bins = String.valueOf(event.getOrDefault("presale_bins", ""));
        boolean isValid = presaleService.validateBin(cardNumber, bins);

        return Map.of(
                "valid", isValid,
                "message", isValid ? "Tarjeta válida para preventa" : "Tarjeta no válida para preventa bancaria"
        );
    }

    @GetMapping("/historical")
    public List<Map<String, Object>> getHistoricalEvents(
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return eventQueryService.getHistoricalEvents(principal.getId(), principal.getRole(), limit);
    }
}
