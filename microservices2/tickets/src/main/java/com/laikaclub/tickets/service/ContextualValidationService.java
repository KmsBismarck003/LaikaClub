package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.domain.TicketValidationLog;
import com.laikaclub.tickets.dto.TicketValidationResponse;
import com.laikaclub.tickets.dto.TicketVerify;
import com.laikaclub.tickets.repository.TicketRepository;
import com.laikaclub.tickets.repository.TicketValidationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ContextualValidationService {

    private static final Logger logger = LoggerFactory.getLogger(ContextualValidationService.class);

    private final TicketRepository ticketRepository;
    private final TicketValidationLogRepository validationLogRepository;
    private final RestTemplate restTemplate;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    @Autowired
    public ContextualValidationService(TicketRepository ticketRepository,
                                       TicketValidationLogRepository validationLogRepository) {
        this.ticketRepository = ticketRepository;
        this.validationLogRepository = validationLogRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public TicketValidationResponse verify(TicketVerify request) {
        return processValidation(request, false);
    }

    @Transactional
    public TicketValidationResponse redeem(TicketVerify request) {
        TicketValidationResponse verification = processValidation(request, false);
        if (!verification.isActionable()) {
            logAttempt(request, null, "REJECT", verification.getStatusCode(), verification.getOperatorMessage());
            return verification;
        }

        Ticket ticket = ticketRepository.findByTicketCode(request.getTicketCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        ticket.setStatus("used");
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        ticket.setRedeemedAt(nowStr);
        ticketRepository.save(ticket);

        verification.setStatus("used");
        verification.setRedeemedAt(nowStr);
        verification.setStatusCode("REDEEMED_SUCCESS");
        verification.setStatusTitle("INGRESO REGISTRADO");
        verification.setOperatorMessage("Boleto canjeado exitosamente en puerta. Ingreso autorizado.");
        verification.setMessage("Boleto canjeado exitosamente en puerta. Ingreso autorizado.");
        verification.setValid(true);
        verification.setActionable(false);
        verification.setAlreadyUsed(true);

        logAttempt(request, ticket, "REDEEM", "VALID_ACCESS", "Ingreso físico registrado en " + request.getAccessPoint());

        // Refresh redemption history
        verification.setRedemptionHistory(fetchFormattedHistory(request.getTicketCode()));
        return verification;
    }

    private TicketValidationResponse processValidation(TicketVerify request, boolean isRedeem) {
        TicketValidationResponse resp = new TicketValidationResponse();
        resp.setTicketCode(request.getTicketCode());

        Map<String, Object> terminalContext = new LinkedHashMap<>();
        terminalContext.put("platform", request.getPlatform());
        terminalContext.put("accessPoint", request.getAccessPoint());
        terminalContext.put("operatorId", request.getOperatorId());
        terminalContext.put("operatorName", request.getOperatorName());
        terminalContext.put("selectedEventId", request.getSelectedEventId());
        terminalContext.put("selectedFunctionId", request.getSelectedFunctionId());
        resp.setTerminalContext(terminalContext);

        Optional<Ticket> optTicket = ticketRepository.findByTicketCode(request.getTicketCode());
        if (optTicket.isEmpty()) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setStatusCode("INVALID_CODE");
            resp.setStatusTitle("CÓDIGO INEXISTENTE");
            resp.setOperatorMessage("El código del boleto no está registrado en el ecosistema LAIKA Club.");
            logAttempt(request, null, "VERIFY", "INVALID_CODE", "Intento con código inexistente");
            return resp;
        }

        Ticket ticket = optTicket.get();
        populateTicketMetadata(resp, ticket);

        // Fetch event metadata
        Map<String, Object> eventData = fetchEventInfo(ticket.getEventId(), ticket.getEventFunctionId());
        if (eventData != null) {
            resp.setEventDetails(eventData);
            resp.setEventName((String) eventData.getOrDefault("name", "Evento LAIKA Club"));
        } else {
            resp.setEventName("Evento #" + ticket.getEventId());
        }

        List<Map<String, Object>> history = fetchFormattedHistory(ticket.getTicketCode());
        resp.setRedemptionHistory(history);

        String currentStatus = ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : "active";
        if ("cancelled".equals(currentStatus) || "refunded".equals(currentStatus)) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setStatusCode("REVOKED_TICKET");
            resp.setStatusTitle("ACCESO REVOCADO");
            resp.setOperatorMessage("Este boleto fue cancelado administrativamente o devuelto por reembolso. Ingreso no autorizado.");
            logAttempt(request, ticket, "VERIFY", "REVOKED_TICKET", "Boleto revocado/reembolsado");
            return resp;
        }

        if ("transferred".equals(currentStatus)) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setStatusCode("TRANSFERRED_TICKET");
            resp.setStatusTitle("ACCESO TRANSFERIDO");
            resp.setOperatorMessage("La propiedad del boleto fue transferida a otro titular. Este código QR original se encuentra inhabilitado.");
            logAttempt(request, ticket, "VERIFY", "TRANSFERRED_TICKET", "Intento con boleto transferido");
            return resp;
        }

        if ("used".equals(currentStatus) || "redeemed".equals(currentStatus)) {
            String usedInfo = "Boleto previamente canjeado.";
            if (!history.isEmpty()) {
                for (Map<String, Object> log : history) {
                    if ("REDEEM".equalsIgnoreCase((String) log.get("action_type")) || "VALID_ACCESS".equalsIgnoreCase((String) log.get("result_status"))) {
                        usedInfo = String.format("Boleto canjeado el %s a las %s en %s (Plataforma: %s).",
                                log.get("date"), log.get("time"), log.get("access_point"), log.get("platform"));
                        break;
                    }
                }
            } else if (ticket.getRedeemedAt() != null) {
                usedInfo = "Boleto canjeado previamente en fecha: " + ticket.getRedeemedAt();
            }

            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setAlreadyUsed(true);
            resp.setStatusCode("ALREADY_REDEEMED");
            resp.setStatusTitle("BOLETO PREVIAMENTE CANJEADO");
            resp.setOperatorMessage("ATENCIÓN: " + usedInfo);
            logAttempt(request, ticket, "VERIFY", "ALREADY_REDEEMED", usedInfo);
            return resp;
        }

        if ("unutilized".equals(currentStatus)) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(false);
            resp.setStatusCode("CONCLUDED_EVENT");
            resp.setStatusTitle("FUNCIÓN FINALIZADA");
            resp.setOperatorMessage("Esta función o evento ha concluido previamente. El boleto consta como no utilizado y su validez de ingreso expiró.");
            logAttempt(request, ticket, "VERIFY", "CONCLUDED_EVENT", "Intento de ingreso a evento ya concluido");
            return resp;
        }

        // Evaluate temporal context against event scheduled date/time
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime eventStart = parseEventDateTime(eventData);

        if (eventStart != null) {
            // Check if concluded (tolerance: 4 hours after start time or previous day)
            if (now.isAfter(eventStart.plusHours(4)) || (now.toLocalDate().isAfter(eventStart.toLocalDate()) && now.isAfter(eventStart.plusHours(2)))) {
                // Lazy state promotion to unutilized
                ticket.setStatus("unutilized");
                ticketRepository.save(ticket);
                resp.setStatus("unutilized");

                resp.setValid(false);
                resp.setActionable(false);
                resp.setIsError(false);
                resp.setStatusCode("CONCLUDED_EVENT");
                resp.setStatusTitle("EVENTO CONCLUIDO");
                resp.setOperatorMessage("La fecha y horario programado para esta función ya concluyeron. El boleto se conserva archivado como no utilizado.");
                logAttempt(request, ticket, "VERIFY", "CONCLUDED_EVENT", "Promovido automáticamente a unutilized por expiración temporal");
                return resp;
            }

            // Check future event tolerance (opens 2 hours before scheduled time)
            LocalDateTime doorsOpen = eventStart.minusHours(2);
            if (now.isBefore(doorsOpen)) {
                long secRemaining = Duration.between(now, doorsOpen).getSeconds();
                resp.setValid(false);
                resp.setActionable(false);
                resp.setIsError(false);
                resp.setTimeRemainingSeconds(secRemaining);
                resp.setStatusCode("FUTURE_EVENT");
                resp.setStatusTitle("EVENTO PRÓXIMO / PUERTAS CERRADAS");
                resp.setOperatorMessage(String.format("El evento aún no abre puertas de ingreso. Apertura programada para %s a las %s.",
                        eventStart.toLocalDate(), eventStart.toLocalTime()));
                logAttempt(request, ticket, "VERIFY", "FUTURE_EVENT", "Verificación previa a apertura de puertas");
                return resp;
            }
        }

        // Check if operator terminal has a specific event/function configured that conflicts
        if (request.getSelectedEventId() != null && request.getSelectedEventId() > 0 && !request.getSelectedEventId().equals(ticket.getEventId())) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(false);
            resp.setStatusCode("WRONG_FUNCTION");
            resp.setStatusTitle("EVENTO INCORRECTO");
            resp.setOperatorMessage(String.format("Boleto auténtico pero corresponde a OTRA FUNCIÓN u EVENTO (%s). La terminal se encuentra operando para el evento ID %d.",
                    resp.getEventName(), request.getSelectedEventId()));
            logAttempt(request, ticket, "VERIFY", "WRONG_FUNCTION", "Mismatch con evento configurado en terminal");
            return resp;
        }

        // All business checks approved -> Valid Access
        resp.setValid(true);
        resp.setActionable(true);
        resp.setIsError(false);
        resp.setStatusCode("VALID_ACCESS");
        resp.setStatusTitle("ACCESIBILIDAD AUTORIZADA");
        resp.setOperatorMessage("Boleto legítimo y habilitado en ventana temporal. Puede efectuar el registro o canje de ingreso.");
        logAttempt(request, ticket, "VERIFY", "VALID_ACCESS", "Verificación exitosa");

        return resp;
    }

    private void logAttempt(TicketVerify request, Ticket ticket, String actionType, String resultStatus, String notes) {
        try {
            TicketValidationLog logEntry = new TicketValidationLog();
            if (ticket != null) {
                logEntry.setTicketId(ticket.getId());
                logEntry.setUserId(ticket.getUserId());
                logEntry.setEventId(ticket.getEventId());
                logEntry.setEventFunctionId(ticket.getEventFunctionId());
            } else {
                logEntry.setTicketId(0L);
                logEntry.setUserId(0L);
                logEntry.setEventId(request.getSelectedEventId() != null ? request.getSelectedEventId() : 0L);
            }

            logEntry.setTicketCode(request.getTicketCode());
            logEntry.setSelectedEventId(request.getSelectedEventId());
            logEntry.setSelectedFunctionId(request.getSelectedFunctionId());
            logEntry.setOperatorId(request.getOperatorId());
            logEntry.setOperatorName(request.getOperatorName());
            logEntry.setPlatform(request.getPlatform());
            logEntry.setDeviceInfo(request.getDeviceInfo());
            logEntry.setAccessPoint(request.getAccessPoint());
            logEntry.setActionType(actionType);
            logEntry.setResultStatus(resultStatus);
            logEntry.setNotes(notes);

            LocalDateTime now = LocalDateTime.now();
            logEntry.setValidationDate(now.format(DateTimeFormatter.ISO_LOCAL_DATE));
            logEntry.setValidationTime(now.format(DateTimeFormatter.ISO_LOCAL_TIME));

            validationLogRepository.save(logEntry);
        } catch (Exception e) {
            logger.error("Error registrando auditoría transaccional: {}", e.getMessage(), e);
        }
    }

    private void populateTicketMetadata(TicketValidationResponse resp, Ticket ticket) {
        resp.setId(ticket.getId());
        resp.setTicketId(ticket.getId());
        resp.setUserId(ticket.getUserId());
        resp.setEventId(ticket.getEventId());
        resp.setEventFunctionId(ticket.getEventFunctionId());
        resp.setSectionName(ticket.getSectionName());
        resp.setSeatId(ticket.getSeatId());
        resp.setPrice(ticket.getPrice());
        resp.setStatus(ticket.getStatus());
        resp.setPaymentMethod(ticket.getPaymentMethod());
        resp.setRedeemedAt(ticket.getRedeemedAt());
        resp.setTicketType(ticket.getSectionName() != null ? ticket.getSectionName() : "General");
        resp.setCustomerName("Titular ID " + ticket.getUserId());
        if (ticket.getPurchaseDate() != null) {
            resp.setPurchaseDate(ticket.getPurchaseDate().format(DateTimeFormatter.ISO_DATE_TIME));
        }

        Map<String, Object> tDetails = new LinkedHashMap<>();
        tDetails.put("ticketCode", ticket.getTicketCode());
        tDetails.put("sectionName", ticket.getSectionName());
        tDetails.put("seatId", ticket.getSeatId());
        tDetails.put("price", ticket.getPrice());
        tDetails.put("status", ticket.getStatus());
        tDetails.put("purchaseDate", resp.getPurchaseDate());
        resp.setTicketDetails(tDetails);
    }

    private List<Map<String, Object>> fetchFormattedHistory(String ticketCode) {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            List<TicketValidationLog> logs = validationLogRepository.findByTicketCodeOrderByCreatedAtDesc(ticketCode);
            for (TicketValidationLog log : logs) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", log.getId());
                map.put("action_type", log.getActionType());
                map.put("result_status", log.getResultStatus());
                map.put("platform", log.getPlatform());
                map.put("access_point", log.getAccessPoint());
                map.put("operator_id", log.getOperatorId());
                map.put("operator_name", log.getOperatorName());
                map.put("date", log.getValidationDate());
                map.put("time", log.getValidationTime());
                map.put("notes", log.getNotes());
                map.put("timestamp", log.getCreatedAt() != null ? log.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
                result.add(map);
            }
        } catch (Exception e) {
            logger.warn("No se pudo obtener historial de logs para código: {}", ticketCode);
        }
        return result;
    }

    private Map<String, Object> fetchEventInfo(Long eventId, Long functionId) {
        try {
            Map<String, Object> evData = restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
            if (evData != null && functionId != null) {
                List<Map<String, Object>> functions = (List<Map<String, Object>>) evData.get("functions");
                if (functions != null) {
                    for (Map<String, Object> func : functions) {
                        Number fid = (Number) func.get("id");
                        if (fid != null && fid.longValue() == functionId) {
                            evData.put("event_date", func.getOrDefault("event_date", func.get("date")));
                            evData.put("event_time", func.getOrDefault("event_time", func.get("time")));
                            break;
                        }
                    }
                }
            }
            return evData;
        } catch (Exception e) {
            logger.debug("Servicio de eventos inaccesible para ID {}", eventId);
            return null;
        }
    }

    private LocalDateTime parseEventDateTime(Map<String, Object> eventData) {
        if (eventData == null) return null;
        try {
            String dateStr = (String) eventData.getOrDefault("event_date", eventData.get("date"));
            String timeStr = (String) eventData.getOrDefault("event_time", eventData.getOrDefault("time", "20:00"));
            if (dateStr == null || dateStr.trim().isEmpty() || "N/A".equals(dateStr)) return null;

            LocalDate date = LocalDate.parse(dateStr.substring(0, 10));
            LocalTime time = LocalTime.of(20, 0);
            try {
                if (timeStr != null && !timeStr.trim().isEmpty() && !timeStr.contains("N/A")) {
                    String[] parts = timeStr.split(":");
                    time = LocalTime.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
                }
            } catch (Exception ignored) {}

            return LocalDateTime.of(date, time);
        } catch (Exception e) {
            return null;
        }
    }
}
