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
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    private final EventRepository eventRepository;
    private final EventTicketSectionRepository sectionRepository;
    private final EventRuleRepository ruleRepository;
    private final EventFunctionRepository functionRepository;
    private final EventQueryService eventQueryService;
    private final NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    public EventService(EventRepository eventRepository,
                        EventTicketSectionRepository sectionRepository,
                        EventRuleRepository ruleRepository,
                        EventFunctionRepository functionRepository,
                        EventQueryService eventQueryService,
                        NamedParameterJdbcTemplate jdbcTemplate) {
        this.eventRepository = eventRepository;
        this.sectionRepository = sectionRepository;
        this.ruleRepository = ruleRepository;
        this.functionRepository = functionRepository;
        this.eventQueryService = eventQueryService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureNotificationsTable() {
        try {
            jdbcTemplate.getJdbcOperations().execute(
                "CREATE TABLE IF NOT EXISTS event_notifications (" +
                "  id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "  user_id BIGINT NOT NULL," +
                "  event_id BIGINT NOT NULL," +
                "  event_function_id BIGINT NULL," +
                "  type VARCHAR(40) NOT NULL," +
                "  title VARCHAR(200) NOT NULL," +
                "  message TEXT NOT NULL," +
                "  detail TEXT NULL," +
                "  reason VARCHAR(500) NULL," +
                "  old_date VARCHAR(32) NULL," +
                "  new_date VARCHAR(32) NULL," +
                "  old_time VARCHAR(16) NULL," +
                "  new_time VARCHAR(16) NULL," +
                "  refund_eligible TINYINT(1) DEFAULT 0," +
                "  refund_deadline VARCHAR(32) NULL," +
                "  is_read TINYINT(1) DEFAULT 0," +
                "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "  INDEX idx_en_user (user_id, is_read)," +
                "  INDEX idx_en_event (event_id)" +
                ")"
            );
        } catch (Exception ex) {
            logger.warn("No se pudo verificar/crear tabla event_notifications: {}", ex.getMessage());
        }
    }

    private long countSoldTicketsForFunction(Long functionId) {
        if (functionId == null) return 0L;
        try {
            Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM laika_tickets.tickets " +
                "WHERE event_function_id = :functionId AND status IN ('active', 'confirmed', 'used')",
                new MapSqlParameterSource("functionId", functionId),
                Long.class
            );
            return count != null ? count : 0L;
        } catch (Exception ex) {
            logger.warn("Error consultando boletos vendidos para función {}: {}", functionId, ex.getMessage());
            return 0L;
        }
    }

    private List<Long> findAffectedBuyerUserIds(Long eventId, Long functionId) {
        try {
            MapSqlParameterSource params = new MapSqlParameterSource("eventId", eventId);
            String sql;
            if (functionId != null) {
                sql = "SELECT DISTINCT user_id FROM laika_tickets.tickets " +
                      "WHERE event_id = :eventId AND (event_function_id = :functionId OR event_function_id IS NULL) " +
                      "AND user_id IS NOT NULL AND status NOT IN ('cancelled', 'refunded')";
                params.addValue("functionId", functionId);
            } else {
                sql = "SELECT DISTINCT user_id FROM laika_tickets.tickets " +
                      "WHERE event_id = :eventId AND user_id IS NOT NULL " +
                      "AND status NOT IN ('cancelled', 'refunded')";
            }
            return jdbcTemplate.queryForList(sql, params, Long.class);
        } catch (Exception ex) {
            logger.warn("Error consultando compradores afectados para evento {}: {}", eventId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    private int dispatchEventChangeNotifications(
            Event event,
            Long functionId,
            String type,
            String oldDate,
            String newDate,
            String oldTime,
            String newTime,
            String reason,
            boolean refundEligible) {

        List<Long> buyerIds = findAffectedBuyerUserIds(event.getId(), functionId);
        if (buyerIds.isEmpty()) {
            return 0;
        }

        String refundDeadline = refundEligible
            ? LocalDate.now(ZoneId.of("America/Mexico_City")).plusDays(14).toString()
            : null;

        String title;
        String message;
        String detail;

        if ("cancelled".equals(type)) {
            title = "Evento cancelado: " + event.getName();
            message = "El evento " + event.getName() + " ha sido cancelado oficialmente. Tu compra es elegible para reembolso del 100%.";
            detail = (reason != null && !reason.isBlank() ? "Motivo: " + reason + ". " : "") +
                     "Puedes iniciar o seguir tu devolución en la sección de Reembolsos sin penalización.";
        } else {
            title = "Cambio de horario / reprogramación: " + event.getName();
            String oldSchedule = (oldDate != null ? oldDate : "") + (oldTime != null && !oldTime.isBlank() ? " " + oldTime : "");
            String newSchedule = (newDate != null ? newDate : "") + (newTime != null && !newTime.isBlank() ? " " + newTime : "");
            message = "El evento " + event.getName() + " cambió de " + oldSchedule.trim() + " a " + newSchedule.trim() +
                      ". Tus boletos y código QR siguen siendo 100% válidos.";
            detail = (reason != null && !reason.isBlank() ? "Motivo oficial: " + reason + ". " : "") +
                     "No necesitas cambiar tu boleto; si no puedes asistir a la nueva fecha, tienes hasta el " +
                     refundDeadline + " para solicitar reembolso del 100%.";
        }

        String insertSql = "INSERT INTO event_notifications " +
                "(user_id, event_id, event_function_id, type, title, message, detail, reason, " +
                " old_date, new_date, old_time, new_time, refund_eligible, refund_deadline, is_read) " +
                "VALUES (:userId, :eventId, :functionId, :type, :title, :message, :detail, :reason, " +
                "        :oldDate, :newDate, :oldTime, :newTime, :refundEligible, :refundDeadline, 0)";

        int inserted = 0;
        for (Long uid : buyerIds) {
            try {
                MapSqlParameterSource p = new MapSqlParameterSource()
                    .addValue("userId", uid)
                    .addValue("eventId", event.getId())
                    .addValue("functionId", functionId)
                    .addValue("type", type)
                    .addValue("title", title)
                    .addValue("message", message)
                    .addValue("detail", detail)
                    .addValue("reason", reason)
                    .addValue("oldDate", oldDate)
                    .addValue("newDate", newDate)
                    .addValue("oldTime", oldTime)
                    .addValue("newTime", newTime)
                    .addValue("refundEligible", refundEligible ? 1 : 0)
                    .addValue("refundDeadline", refundDeadline);
                jdbcTemplate.update(insertSql, p);
                inserted++;
            } catch (Exception ex) {
                logger.warn("No se pudo insertar notificación para usuario {}: {}", uid, ex.getMessage());
            }
        }
        return inserted;
    }

    private void syncPrimaryScheduleFromFunctions(Event event) {
        List<EventFunction> all = functionRepository.findByEventId(event.getId());
        if (all == null || all.isEmpty()) return;
        all.sort(Comparator.comparing(f -> (f.getDate() != null ? f.getDate() : "") + "T" + (f.getTime() != null ? f.getTime() : "00:00")));
        EventFunction primary = all.get(0);
        if (primary.getDate() != null && !primary.getDate().isBlank()) {
            event.setEventDate(primary.getDate());
        }
        if (primary.getTime() != null && !primary.getTime().isBlank()) {
            event.setEventTime(primary.getTime());
        }
        eventRepository.save(event);
    }

    @Transactional
    public Map<String, Object> createEvent(EventDTOs.EventCreate dto, Long userId) {
        if (dto.contract_id == null) {
            dto.contract_id = 1L;
        }

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
        event.setAvailableTickets(dto.available_tickets != null ? dto.available_tickets : dto.total_tickets);
        event.setImageUrl(dto.image_url);
        event.setDurationMinutes(dto.duration_minutes != null ? dto.duration_minutes : 0);
        event.setGalleryUrls(dto.gallery_urls);
        event.setStatus(dto.status != null ? dto.status : "draft");
        event.setGridPositionX(dto.grid_position_x);
        event.setGridPositionY(dto.grid_position_y);
        event.setGridSpanX(dto.grid_span_x != null ? dto.grid_span_x : 1);
        event.setGridSpanY(dto.grid_span_y != null ? dto.grid_span_y : 1);
        event.setGridPage(dto.grid_page != null ? dto.grid_page : 1);

        event.setAdsEnabled(dto.ads_enabled != null ? dto.ads_enabled : false);
        event.setMaxAds(dto.max_ads != null ? dto.max_ads : 5);
        event.setMerchEnabled(dto.merch_enabled != null ? dto.merch_enabled : false);
        event.setMetricsEnabled(dto.metrics_enabled != null ? dto.metrics_enabled : false);
        event.setAssignedManagerId(dto.assigned_manager_id != null ? dto.assigned_manager_id : userId);
        event.setContractId(dto.contract_id);
        event.setMunicipalityId(dto.municipality_id);

        event.setPresaleEnabled(dto.presale_enabled != null ? dto.presale_enabled : false);
        event.setPresaleBankName(dto.presale_bank_name);
        event.setPresaleBins(dto.presale_bins);
        event.setPresaleStart(dto.presale_start);
        event.setPresaleEnd(dto.presale_end);

        event = eventRepository.save(event);
        Long eventId = event.getId();

        if (dto.sections != null) {
            for (EventDTOs.EventTicketSectionCreate secDto : dto.sections) {
                EventTicketSection section = new EventTicketSection();
                section.setEventId(eventId);
                section.setName(secDto.name);
                section.setPrice(secDto.price);
                section.setCapacity(secDto.capacity);
                section.setAvailable(secDto.available != null ? secDto.available : secDto.capacity);
                section.setBadgeText(secDto.badge_text);
                section.setColorHex(secDto.color_hex);
                sectionRepository.save(section);
            }
        }

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
        return eventQueryService.getEventById(eventId, false);
    }

    @Transactional
    public Map<String, Object> updateEvent(Long eventId, EventDTOs.EventUpdate dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        String oldDate = event.getEventDate();
        String oldTime = event.getEventTime();
        String oldVenue = event.getVenue();
        String oldStatus = event.getStatus();

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
        if (dto.duration_minutes != null) event.setDurationMinutes(dto.duration_minutes);
        if (dto.gallery_urls != null) event.setGalleryUrls(dto.gallery_urls);
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
        if (dto.contract_id != null) event.setContractId(dto.contract_id);
        if (dto.municipality_id != null) event.setMunicipalityId(dto.municipality_id);

        if (dto.presale_enabled != null) event.setPresaleEnabled(dto.presale_enabled);
        if (dto.presale_bank_name != null) event.setPresaleBankName(dto.presale_bank_name);
        if (dto.presale_bins != null) event.setPresaleBins(dto.presale_bins);
        if (dto.presale_start != null) event.setPresaleStart(dto.presale_start);
        if (dto.presale_end != null) event.setPresaleEnd(dto.presale_end);

        eventRepository.save(event);

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

        // Actualización segura de funciones preservando IDs (evita romper referencias de boletos vendidos)
        int notifiedBuyers = 0;
        boolean functionRescheduled = false;
        if (dto.functions != null) {
            List<EventFunction> existingList = functionRepository.findByEventId(eventId);
            Map<Long, EventFunction> existingById = new HashMap<>();
            for (EventFunction ef : existingList) {
                existingById.put(ef.getId(), ef);
            }

            Set<Long> retainedIds = new HashSet<>();
            for (EventDTOs.FunctionCreate funcDto : dto.functions) {
                if (funcDto.id != null && existingById.containsKey(funcDto.id)) {
                    EventFunction ef = existingById.get(funcDto.id);
                    retainedIds.add(ef.getId());
                    String fOldDate = ef.getDate();
                    String fOldTime = ef.getTime();
                    boolean fChanged = !Objects.equals(fOldDate, funcDto.date) || !Objects.equals(fOldTime, funcDto.time);
                    ef.setDate(funcDto.date);
                    ef.setTime(funcDto.time);
                    if (funcDto.venue_id != null) ef.setVenueId(funcDto.venue_id);
                    if (funcDto.room_id != null) ef.setRoomId(funcDto.room_id);
                    functionRepository.save(ef);
                    if (fChanged) {
                        functionRescheduled = true;
                        notifiedBuyers += dispatchEventChangeNotifications(
                            event, ef.getId(), "rescheduled", fOldDate, funcDto.date, fOldTime, funcDto.time,
                            funcDto.change_reason != null ? funcDto.change_reason : dto.change_reason, true
                        );
                    }
                } else {
                    EventFunction func = new EventFunction();
                    func.setEventId(eventId);
                    func.setDate(funcDto.date);
                    func.setTime(funcDto.time);
                    func.setVenueId(funcDto.venue_id != null ? funcDto.venue_id : event.getVenueId());
                    func.setRoomId(funcDto.room_id != null ? funcDto.room_id : event.getRoomId());
                    functionRepository.save(func);
                }
            }

            // Eliminar solo funciones retiradas que NO tengan boletos vendidos
            for (EventFunction ef : existingList) {
                if (!retainedIds.contains(ef.getId())) {
                    long sold = countSoldTicketsForFunction(ef.getId());
                    if (sold > 0) {
                        throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "No se puede eliminar la función del " + ef.getDate() + " porque tiene " + sold + " boleto(s) vendidos. Reprográmala en su lugar."
                        );
                    }
                    functionRepository.delete(ef);
                }
            }
            syncPrimaryScheduleFromFunctions(event);
        }

        // Notificación automática cuando Admin o Gestor cancela o cambia fecha/hora/recinto
        boolean becameCancelled = !"cancelled".equalsIgnoreCase(oldStatus) && "cancelled".equalsIgnoreCase(event.getStatus());
        boolean eventScheduleChanged =
            (dto.event_date != null && !Objects.equals(oldDate, event.getEventDate())) ||
            (dto.event_time != null && !Objects.equals(oldTime, event.getEventTime())) ||
            (dto.venue != null && !Objects.equals(oldVenue, event.getVenue()));

        if (becameCancelled) {
            notifiedBuyers += dispatchEventChangeNotifications(
                event, null, "cancelled", oldDate, event.getEventDate(), oldTime, event.getEventTime(),
                dto.cancel_reason != null ? dto.cancel_reason : dto.change_reason, true
            );
        } else if (eventScheduleChanged && !functionRescheduled) {
            // Si el cambio vino desde Admin (sin array functions), sincronizar función única si existe
            List<EventFunction> existingFns = functionRepository.findByEventId(eventId);
            if (existingFns.size() == 1) {
                EventFunction onlyFn = existingFns.get(0);
                if (dto.event_date != null) onlyFn.setDate(event.getEventDate());
                if (dto.event_time != null) onlyFn.setTime(event.getEventTime());
                functionRepository.save(onlyFn);
            }
            notifiedBuyers += dispatchEventChangeNotifications(
                event, null, "rescheduled", oldDate, event.getEventDate(), oldTime, event.getEventTime(),
                dto.change_reason, true
            );
        }

        Map<String, Object> result = eventQueryService.getEventById(eventId, false);
        result.put("notifications_sent", notifiedBuyers);
        return result;
    }

    @Transactional
    public Map<String, Object> addEventFunction(Long eventId, EventDTOs.FunctionCreate dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        if (dto.date == null || dto.date.isBlank() || dto.time == null || dto.time.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha y hora son obligatorias.");
        }

        EventFunction func = new EventFunction();
        func.setEventId(eventId);
        func.setDate(dto.date.trim());
        func.setTime(dto.time.trim());
        func.setVenueId(dto.venue_id != null ? dto.venue_id : event.getVenueId());
        func.setRoomId(dto.room_id != null ? dto.room_id : event.getRoomId());
        func = functionRepository.save(func);

        syncPrimaryScheduleFromFunctions(event);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("function_id", func.getId());
        response.put("event", eventQueryService.getEventById(eventId, false));
        return response;
    }

    @Transactional
    public Map<String, Object> updateEventFunction(Long eventId, Long functionId, EventDTOs.FunctionCreate dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        EventFunction func = functionRepository.findById(functionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Función no encontrada"));

        if (!Objects.equals(func.getEventId(), eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La función no pertenece al evento especificado.");
        }

        long soldTickets = countSoldTicketsForFunction(functionId);
        if (soldTickets > 0 && dto.room_id != null && !Objects.equals(dto.room_id, func.getRoomId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se puede cambiar la sala de una función con " + soldTickets + " boleto(s) vendidos porque alteraría el mapa de asientos."
            );
        }

        String oldDate = func.getDate();
        String oldTime = func.getTime();
        Long oldVenueId = func.getVenueId();

        if (dto.date != null && !dto.date.isBlank()) func.setDate(dto.date.trim());
        if (dto.time != null && !dto.time.isBlank()) func.setTime(dto.time.trim());
        if (dto.venue_id != null) func.setVenueId(dto.venue_id);
        if (dto.room_id != null) func.setRoomId(dto.room_id);
        functionRepository.save(func);

        syncPrimaryScheduleFromFunctions(event);

        boolean scheduleChanged =
            !Objects.equals(oldDate, func.getDate()) ||
            !Objects.equals(oldTime, func.getTime()) ||
            !Objects.equals(oldVenueId, func.getVenueId());

        int notifiedBuyers = 0;
        if (scheduleChanged) {
            notifiedBuyers = dispatchEventChangeNotifications(
                event, functionId, "rescheduled", oldDate, func.getDate(), oldTime, func.getTime(),
                dto.change_reason, true
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("function_id", functionId);
        response.put("sold_tickets", soldTickets);
        response.put("notifications_sent", notifiedBuyers);
        response.put("refund_eligible", scheduleChanged && soldTickets > 0);
        response.put("event", eventQueryService.getEventById(eventId, false));
        return response;
    }

    @Transactional
    public Map<String, Object> deleteEventFunction(Long eventId, Long functionId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        EventFunction func = functionRepository.findById(functionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Función no encontrada"));

        if (!Objects.equals(func.getEventId(), eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La función no pertenece al evento especificado.");
        }

        List<EventFunction> all = functionRepository.findByEventId(eventId);
        if (all.size() <= 1) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "El evento debe conservar al menos una función programada. Reprográmala o cancela el evento."
            );
        }

        long soldTickets = countSoldTicketsForFunction(functionId);
        if (soldTickets > 0) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "No se puede eliminar esta función porque tiene " + soldTickets + " boleto(s) vendidos. Reprográmala para proteger a los compradores."
            );
        }

        functionRepository.delete(func);
        syncPrimaryScheduleFromFunctions(event);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("deleted_function_id", functionId);
        response.put("event", eventQueryService.getEventById(eventId, false));
        return response;
    }

    public List<Map<String, Object>> getUserNotifications(Long userId) {
        ensureNotificationsTable();
        String sql = "SELECT id, user_id, event_id, event_function_id, type, title, message, detail, reason, " +
                "old_date, new_date, old_time, new_time, refund_eligible, refund_deadline, is_read, created_at " +
                "FROM event_notifications WHERE user_id = :userId ORDER BY created_at DESC LIMIT 50";
        return jdbcTemplate.queryForList(sql, new MapSqlParameterSource("userId", userId));
    }

    @Transactional
    public Map<String, Object> markNotificationRead(Long userId, Long notificationId) {
        ensureNotificationsTable();
        int updated = jdbcTemplate.update(
            "UPDATE event_notifications SET is_read = 1 WHERE id = :id AND user_id = :userId",
            new MapSqlParameterSource().addValue("id", notificationId).addValue("userId", userId)
        );
        return Map.of("status", "success", "updated", updated);
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
