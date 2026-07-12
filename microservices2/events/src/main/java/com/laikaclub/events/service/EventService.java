package com.laikaclub.events.service;

import com.laikaclub.events.domain.Event;
import com.laikaclub.events.domain.EventFunction;
import com.laikaclub.events.domain.EventRule;
import com.laikaclub.events.domain.EventTicketSection;
import com.laikaclub.events.dto.EventDTOs;
import com.laikaclub.events.repository.EventFunctionRepository;
import com.laikaclub.events.repository.EventRepository;
import com.laikaclub.events.repository.EventRuleRepository;
import com.laikaclub.events.repository.EventTicketSectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventTicketSectionRepository sectionRepository;
    private final EventRuleRepository ruleRepository;
    private final EventFunctionRepository functionRepository;
    private final EventQueryService eventQueryService;

    @Autowired
    public EventService(EventRepository eventRepository,
                        EventTicketSectionRepository sectionRepository,
                        EventRuleRepository ruleRepository,
                        EventFunctionRepository functionRepository,
                        EventQueryService eventQueryService) {
        this.eventRepository = eventRepository;
        this.sectionRepository = sectionRepository;
        this.ruleRepository = ruleRepository;
        this.functionRepository = functionRepository;
        this.eventQueryService = eventQueryService;
    }

    @Transactional
    public Map<String, Object> createEvent(EventDTOs.EventCreate dto, Long userId) {
        Event event = new Event();
        event.setName(dto.name);
        event.setDescription(dto.description);
        event.setEventDate(dto.event_date);
        event.setEventTime(dto.event_time);
        event.setLocation(dto.location);
        event.setVenue(dto.venue);
        event.setVenueId(dto.venue_id);
        event.setRoomId(dto.room_id);
        event.setUseSeatingMap(dto.use_seating_map != null ? dto.use_seating_map : false);
        event.setCategory(dto.category);
        event.setPrice(dto.price);
        event.setTotalTickets(dto.total_tickets);
        event.setAvailableTickets(dto.available_tickets);
        event.setImageUrl(dto.image_url);
        event.setStatus(dto.status != null ? dto.status : "draft");
        event.setCreatedBy(userId);
        event.setGridPositionX(dto.grid_position_x != null ? dto.grid_position_x : 0);
        event.setGridPositionY(dto.grid_position_y != null ? dto.grid_position_y : 0);
        event.setGridSpanX(dto.grid_span_x != null ? dto.grid_span_x : 1);
        event.setGridSpanY(dto.grid_span_y != null ? dto.grid_span_y : 1);
        event.setGridPage(dto.grid_page != null ? dto.grid_page : 0);

        // Permissions and Management
        event.setAdsEnabled(dto.ads_enabled != null ? dto.ads_enabled : false);
        event.setMaxAds(dto.max_ads != null ? dto.max_ads : 5);
        event.setMerchEnabled(dto.merch_enabled != null ? dto.merch_enabled : false);
        event.setMetricsEnabled(dto.metrics_enabled != null ? dto.metrics_enabled : false);
        event.setAssignedManagerId(dto.assigned_manager_id);
        event.setMunicipalityId(dto.municipality_id);

        // Presale settings
        event.setPresaleEnabled(dto.presale_enabled != null ? dto.presale_enabled : false);
        event.setPresaleBankName(dto.presale_bank_name);
        event.setPresaleBins(dto.presale_bins);
        event.setPresaleStart(dto.presale_start);
        event.setPresaleEnd(dto.presale_end);

        Event savedEvent = eventRepository.save(event);
        Long eventId = savedEvent.getId();

        // Save Sections
        if (dto.sections != null) {
            for (EventDTOs.EventTicketSectionCreate secDto : dto.sections) {
                EventTicketSection section = new EventTicketSection();
                section.setEventId(eventId);
                section.setName(secDto.name);
                section.setPrice(secDto.price);
                section.setCapacity(secDto.capacity);
                section.setAvailable(secDto.available);
                section.setBadgeText(secDto.badge_text);
                section.setColorHex(secDto.color_hex);
                sectionRepository.save(section);
            }
        }

        // Save Rules
        if (dto.rules != null) {
            for (EventDTOs.EventRuleCreate ruleDto : dto.rules) {
                EventRule rule = new EventRule();
                rule.setEventId(eventId);
                rule.setTitle(ruleDto.title);
                rule.setIcon(ruleDto.icon);
                rule.setDescription(ruleDto.description);
                ruleRepository.save(rule);
            }
        }

        // Save Functions
        if (dto.functions != null) {
            for (EventDTOs.FunctionCreate funcDto : dto.functions) {
                EventFunction func = new EventFunction();
                func.setEventId(eventId);
                func.setDate(funcDto.date);
                func.setTime(funcDto.time);
                func.setVenueId(funcDto.venue_id);
                func.setRoomId(funcDto.room_id);
                functionRepository.save(func);
            }
        }

        return eventQueryService.getEventById(eventId);
    }

    @Transactional
    public Map<String, Object> updateEvent(Long eventId, EventDTOs.EventUpdate dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        if (dto.name != null) event.setName(dto.name);
        if (dto.description != null) event.setDescription(dto.description);
        if (dto.event_date != null) event.setEventDate(dto.event_date);
        if (dto.event_time != null) event.setEventTime(dto.event_time);
        if (dto.location != null) event.setLocation(dto.location);
        if (dto.venue != null) event.setVenue(dto.venue);
        if (dto.category != null) event.setCategory(dto.category);
        if (dto.price != null) event.setPrice(dto.price);
        if (dto.total_tickets != null) event.setTotalTickets(dto.total_tickets);
        if (dto.available_tickets != null) event.setAvailableTickets(dto.available_tickets);
        if (dto.image_url != null) event.setImageUrl(dto.image_url);
        if (dto.status != null) event.setStatus(dto.status);
        if (dto.grid_position_x != null) event.setGridPositionX(dto.grid_position_x);
        if (dto.grid_position_y != null) event.setGridPositionY(dto.grid_position_y);
        if (dto.grid_span_x != null) event.setGridSpanX(dto.grid_span_x);
        if (dto.grid_span_y != null) event.setGridSpanY(dto.grid_span_y);
        if (dto.grid_page != null) event.setGridPage(dto.grid_page);
        if (dto.venue_id != null) event.setVenueId(dto.venue_id);
        if (dto.room_id != null) event.setRoomId(dto.room_id);
        if (dto.use_seating_map != null) event.setUseSeatingMap(dto.use_seating_map);

        if (dto.ads_enabled != null) event.setAdsEnabled(dto.ads_enabled);
        if (dto.max_ads != null) event.setMaxAds(dto.max_ads);
        if (dto.merch_enabled != null) event.setMerchEnabled(dto.merch_enabled);
        if (dto.metrics_enabled != null) event.setMetricsEnabled(dto.metrics_enabled);
        if (dto.assigned_manager_id != null) event.setAssignedManagerId(dto.assigned_manager_id);
        if (dto.municipality_id != null) event.setMunicipalityId(dto.municipality_id);

        if (dto.presale_enabled != null) event.setPresaleEnabled(dto.presale_enabled);
        if (dto.presale_bank_name != null) event.setPresaleBankName(dto.presale_bank_name);
        if (dto.presale_bins != null) event.setPresaleBins(dto.presale_bins);
        if (dto.presale_start != null) event.setPresaleStart(dto.presale_start);
        if (dto.presale_end != null) event.setPresaleEnd(dto.presale_end);

        eventRepository.save(event);

        // Update Sections if provided
        if (dto.sections != null) {
            sectionRepository.deleteByEventId(eventId);
            for (EventDTOs.EventTicketSectionUpdate secDto : dto.sections) {
                EventTicketSection section = new EventTicketSection();
                section.setEventId(eventId);
                section.setName(secDto.name);
                section.setPrice(secDto.price);
                section.setCapacity(secDto.capacity);
                section.setAvailable(secDto.available);
                section.setBadgeText(secDto.badge_text);
                section.setColorHex(secDto.color_hex);
                sectionRepository.save(section);
            }
        }

        // Update Rules if provided
        if (dto.rules != null) {
            ruleRepository.deleteByEventId(eventId);
            for (EventDTOs.EventRuleUpdate ruleDto : dto.rules) {
                EventRule rule = new EventRule();
                rule.setEventId(eventId);
                rule.setTitle(ruleDto.title);
                rule.setIcon(ruleDto.icon);
                rule.setDescription(ruleDto.description);
                ruleRepository.save(rule);
            }
        }

        // Update Functions if provided
        if (dto.functions != null) {
            functionRepository.deleteByEventId(eventId);
            for (EventDTOs.FunctionCreate funcDto : dto.functions) {
                EventFunction func = new EventFunction();
                func.setEventId(eventId);
                func.setDate(funcDto.date);
                func.setTime(funcDto.time);
                func.setVenueId(funcDto.venue_id);
                func.setRoomId(funcDto.room_id);
                functionRepository.save(func);
            }
        }

        return eventQueryService.getEventById(eventId);
    }

    @Transactional
    public Map<String, Object> publishEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
        event.setStatus("published");
        eventRepository.save(event);
        return Map.of("status", "success", "message", "Evento publicado");
    }

    @Transactional
    public Map<String, Object> unpublishEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
        event.setStatus("draft");
        eventRepository.save(event);
        return Map.of("status", "success", "message", "Evento movido a borrador");
    }
}
