package com.laikaclub.events.controller;

import com.laikaclub.events.dto.VenueDTOs;
import com.laikaclub.events.service.EventQueryService;
import com.laikaclub.events.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/venues")
public class VenueController {

    private final VenueService venueService;
    private final EventQueryService eventQueryService;

    @Autowired
    public VenueController(VenueService venueService, EventQueryService eventQueryService) {
        this.venueService = venueService;
        this.eventQueryService = eventQueryService;
    }

    @GetMapping("/locations/countries")
    public List<Map<String, Object>> getCountries() {
        return venueService.getCountries();
    }

    @GetMapping("/locations/states/{country_id}")
    public List<Map<String, Object>> getStates(@PathVariable("country_id") Long countryId) {
        return venueService.getStates(countryId);
    }

    @GetMapping("/locations/municipalities/{state_id}")
    public List<Map<String, Object>> getMunicipalities(@PathVariable("state_id") Long stateId) {
        return venueService.getMunicipalities(stateId);
    }

    @GetMapping("/seat-types")
    public List<Map<String, Object>> getSeatTypes() {
        return venueService.getSeatTypes();
    }

    @GetMapping
    public List<Map<String, Object>> getVenues(
            @RequestParam(name = "status_filter", defaultValue = "active") String statusFilter,
            @RequestParam(name = "country_id", required = false) Long countryId,
            @RequestParam(name = "state_id", required = false) Long stateId,
            @RequestParam(name = "municipality_id", required = false) Long municipalityId,
            @RequestParam(name = "manager_id", required = false) Long managerId) {
        return eventQueryService.getVenues(statusFilter, countryId, stateId, municipalityId, managerId);
    }

    @PostMapping
    public Map<String, Object> createVenue(@RequestBody VenueDTOs.VenueCreate dto) {
        return venueService.createVenue(dto);
    }

    @PutMapping("/{venue_id}")
    public Map<String, Object> updateVenue(
            @PathVariable("venue_id") Long venueId,
            @RequestBody VenueDTOs.VenueUpdate dto) {
        return venueService.updateVenue(venueId, dto);
    }

    @DeleteMapping("/{venue_id}")
    public Map<String, Object> deleteVenue(@PathVariable("venue_id") Long venueId) {
        return venueService.deleteVenue(venueId);
    }

    @GetMapping("/{venue_id}/rooms")
    public List<Map<String, Object>> getVenueRooms(@PathVariable("venue_id") Long venueId) {
        return venueService.getVenueRooms(venueId);
    }

    @PostMapping("/{venue_id}/rooms")
    public Map<String, Object> createVenueRoom(
            @PathVariable("venue_id") Long venueId,
            @RequestBody VenueDTOs.VenueRoomCreate dto) {
        return venueService.createVenueRoom(venueId, dto);
    }

    @PutMapping("/{venue_id}/rooms/{room_id}")
    public Map<String, Object> updateVenueRoom(
            @PathVariable("venue_id") Long venueId,
            @PathVariable("room_id") Long roomId,
            @RequestBody VenueDTOs.VenueRoomUpdate dto) {
        return venueService.updateVenueRoom(venueId, roomId, dto);
    }

    @GetMapping("/rooms/{room_id}/map")
    public Map<String, Object> getVenueRoomMap(@PathVariable("room_id") Long roomId) {
        return venueService.getVenueRoomMap(roomId);
    }

    @PostMapping("/rooms/{room_id}/map")
    public Map<String, Object> saveVenueRoomMap(
            @PathVariable("room_id") Long roomId,
            @RequestBody VenueDTOs.MapBuilderPayload payload) {
        return venueService.saveVenueRoomMap(roomId, payload);
    }
}
