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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ContextualValidationService {

    private static final Logger logger = LoggerFactory.getLogger(ContextualValidationService.class);

    private final TicketRepository ticketRepository;
    private final TicketValidationLogRepository validationLogRepository;
    private final TicketLifecyclePolicy lifecyclePolicy;
    private final RestTemplate restTemplate;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    @Autowired
    public ContextualValidationService(TicketRepository ticketRepository,
                                       TicketValidationLogRepository validationLogRepository,
                                       TicketLifecyclePolicy lifecyclePolicy) {
        this.ticketRepository = ticketRepository;
        this.validationLogRepository = validationLogRepository;
        this.lifecyclePolicy = lifecyclePolicy;
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

        boolean isEarlyAccess = Boolean.TRUE.equals(verification.getEarlyAccess())
                || "EARLY_ACCESS".equals(verification.getStatusCode());

        Ticket ticket = ticketRepository.findByTicketCode(request.getTicketCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        ticket.setStatus("used");
        String nowStr = EventAccessWindowEvaluator.nowMexico().format(DateTimeFormatter.ISO_DATE_TIME);
        ticket.setRedeemedAt(nowStr);
        ticketRepository.save(ticket);

        verification.setStatus("used");
        verification.setRedeemedAt(nowStr);
        verification.setEarlyAccess(isEarlyAccess);
        verification.setStatusCode("REDEEMED_SUCCESS");
        verification.setStatusTitle(isEarlyAccess ? "INGRESO ANTICIPADO REGISTRADO" : "INGRESO REGISTRADO");
        String successMsg = isEarlyAccess
                ? "Ingreso anticipado autorizado y canjeado exitosamente en puerta."
                : "Boleto canjeado exitosamente en puerta. Ingreso autorizado.";
        verification.setOperatorMessage(successMsg);
        verification.setMessage(successMsg);
        verification.setValid(true);
        verification.setActionable(false);
        verification.setAlreadyUsed(true);

        String auditStatus = isEarlyAccess ? "EARLY_ACCESS_REDEEM" : "VALID_ACCESS";
        String auditNote = (isEarlyAccess ? "Ingreso anticipado autorizado en " : "Ingreso físico registrado en ")
                + request.getAccessPoint();
        logAttempt(request, ticket, "REDEEM", auditStatus, auditNote);

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
        if ("pending_claim".equals(currentStatus)) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setStatusCode("PENDING_CLAIM");
            resp.setStatusTitle("CORTESÍA PENDIENTE DE CANJE");
            resp.setOperatorMessage("ACCESO DENEGADO: Este código de cortesía aún no ha sido canjeado por el titular en la plataforma.");
            resp.setMessage("Boleto de cortesía no canjeado.");
            logAttempt(request, ticket, "VERIFY", "PENDING_CLAIM", "Intento de acceso con cortesía no canjeada");
            return resp;
        }

        if ("cancelled".equals(currentStatus) || "refunded".equals(currentStatus)) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(true);
            resp.setStatusCode("REVOKED_TICKET");
            resp.setStatusTitle("BOLETO CANCELADO / REVOCADO");
            resp.setOperatorMessage("ACCESO DENEGADO: Este boleto fue CANCELADO y reembolsado. El código QR ha sido invalidado permanentemente y no permite ingresar al evento.");
            resp.setMessage("Boleto cancelado o reembolsado. Acceso inválido.");
            logAttempt(request, ticket, "VERIFY", "REVOKED_TICKET", "Intento de acceso con boleto cancelado/reembolsado");
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

        // Evaluate temporal context against event scheduled date/time in America/Mexico_City
        // and auto-reconcile reversible "unutilized" status if the event is still valid / rescheduled
        LocalDateTime now = EventAccessWindowEvaluator.nowMexico();
        EventAccessWindowEvaluator.WindowEvaluation window = EventAccessWindowEvaluator.evaluate(eventData, now);
        TicketLifecyclePolicy.ReconciliationResult reconciliation = lifecyclePolicy.reconcile(ticket, window);

        if (reconciliation.wasRestoredToActive()) {
            currentStatus = "active";
            resp.setStatus("active");
            if (resp.getTicketDetails() != null) {
                resp.getTicketDetails().put("status", "active");
            }
            logAttempt(request, ticket, "SYSTEM", "AUTO_RESTORED_ACTIVE",
                    "Boleto rehabilitado automáticamente: el evento sigue vigente o fue reprogramado");
        } else if (reconciliation.wasMarkedUnutilized()) {
            currentStatus = "unutilized";
            resp.setStatus("unutilized");
            if (resp.getTicketDetails() != null) {
                resp.getTicketDetails().put("status", "unutilized");
            }
        }

        if ("unutilized".equals(currentStatus) || window.getState() == EventAccessWindowEvaluator.WindowState.CONCLUDED) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(false);
            resp.setStatusCode("CONCLUDED_EVENT");
            resp.setStatusTitle("EVENTO CONCLUIDO");
            resp.setOperatorMessage("La fecha y horario programado para esta función ya concluyeron. El boleto se conserva archivado como no utilizado.");
            String note = reconciliation.wasMarkedUnutilized()
                    ? "Promovido automáticamente a unutilized por expiración temporal"
                    : "Intento de ingreso a evento ya concluido";
            logAttempt(request, ticket, "VERIFY", "CONCLUDED_EVENT", note);
            return resp;
        }

        if (window.getState() == EventAccessWindowEvaluator.WindowState.FUTURE_DAY) {
            resp.setValid(false);
            resp.setActionable(false);
            resp.setIsError(false);
            resp.setTimeRemainingSeconds(window.getSecondsUntilDoorsOpen());
            resp.setStatusCode("FUTURE_EVENT");
            resp.setStatusTitle("EVENTO PRÓXIMO / PUERTAS CERRADAS");
            resp.setOperatorMessage(String.format(
                    "El evento está programado para el %s a las %s (apertura regular de puertas a las %s). El ingreso se habilita el día del evento.",
                    window.getEventStart().toLocalDate(),
                    window.getEventStart().toLocalTime(),
                    window.getDoorsOpen().toLocalTime()));
            logAttempt(request, ticket, "VERIFY", "FUTURE_EVENT", "Verificación en fecha previa al día del evento");
            return resp;
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

        // Same-day early arrival before standard doors-open window -> Actionable amber warning
        if (window.getState() == EventAccessWindowEvaluator.WindowState.EARLY_ACCESS) {
            resp.setValid(true);
            resp.setActionable(true);
            resp.setIsError(false);
            resp.setEarlyAccess(true);
            resp.setTimeRemainingSeconds(window.getSecondsUntilStart());
            resp.setStatusCode("EARLY_ACCESS");
            resp.setStatusTitle("LLEGADA ANTICIPADA • ACCESO HABILITADO");
            resp.setOperatorMessage(String.format(
                    "El evento inicia hoy a las %s (apertura regular a las %s). Puedes autorizar el ingreso anticipado si puertas ya reciben asistentes.",
                    window.getEventStart().toLocalTime(),
                    window.getDoorsOpen().toLocalTime()));
            logAttempt(request, ticket, "VERIFY", "EARLY_ACCESS", "Verificación de llegada anticipada el día del evento");
            return resp;
        }

        // All business checks approved -> Valid Access (pre-show open window or in-progress event)
        boolean eventInProgress = window.getEventStart() != null && !now.isBefore(window.getEventStart());
        resp.setValid(true);
        resp.setActionable(true);
        resp.setIsError(false);
        resp.setEarlyAccess(false);
        resp.setStatusCode("VALID_ACCESS");
        resp.setStatusTitle(eventInProgress ? "ACCESO AUTORIZADO • EVENTO EN CURSO" : "ACCESIBILIDAD AUTORIZADA");
        resp.setOperatorMessage(eventInProgress
                ? "Evento en curso. Boleto legítimo y habilitado para ingreso en puerta."
                : "Boleto legítimo y habilitado en ventana temporal. Puede efectuar el registro o canje de ingreso.");
        logAttempt(request, ticket, "VERIFY", "VALID_ACCESS", eventInProgress ? "Verificación exitosa durante evento en curso" : "Verificación exitosa");

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

            LocalDateTime now = EventAccessWindowEvaluator.nowMexico();
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
        resp.setIsCourtesy(ticket.getIsCourtesy());
        resp.setRecipientType(ticket.getRecipientType());
        resp.setCourtesyMotive(ticket.getCourtesyMotive());

        if (Boolean.TRUE.equals(ticket.getIsCourtesy())) {
            String holder = ticket.getHolderName() != null && !ticket.getHolderName().isBlank()
                    ? ticket.getHolderName()
                    : (ticket.getHolderEmail() != null ? ticket.getHolderEmail() : "Invitado Especial");
            resp.setCustomerName(holder + " [Cortesía: " + (ticket.getRecipientType() != null ? ticket.getRecipientType() : "Especial") + "]");
        } else {
            resp.setCustomerName(ticket.getUserId() != null ? "Titular ID " + ticket.getUserId() : "Asistente");
        }

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
        tDetails.put("isCourtesy", ticket.getIsCourtesy());
        tDetails.put("recipientType", ticket.getRecipientType());
        tDetails.put("courtesyMotive", ticket.getCourtesyMotive());
        tDetails.put("holderName", ticket.getHolderName());
        tDetails.put("holderEmail", ticket.getHolderEmail());
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
            Map<String, Object> evData = restTemplate.getForObject(
                    eventServiceUrl + "/" + eventId + "?includePastFunctions=true", Map.class);
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
}
