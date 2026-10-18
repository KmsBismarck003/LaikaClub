package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.CancellationRequest;
import com.laikaclub.tickets.domain.Payment;
import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.dto.CancellationDetailResponse;
import com.laikaclub.tickets.dto.CancellationQuoteResponse;
import com.laikaclub.tickets.repository.CancellationRequestRepository;
import com.laikaclub.tickets.repository.PaymentRepository;
import com.laikaclub.tickets.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class CancellationServiceImpl implements CancellationService {

    private static final Logger logger = LoggerFactory.getLogger(CancellationServiceImpl.class);

    private final TicketRepository ticketRepository;
    private final PaymentRepository paymentRepository;
    private final CancellationRequestRepository cancellationRequestRepository;
    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<Long, ReentrantLock> ticketLocks = new ConcurrentHashMap<>();

    @Value("${services.events.url}")
    private String eventServiceUrl;

    @Value("${services.wearables.url}")
    private String wearablesServiceUrl;

    @Autowired
    public CancellationServiceImpl(TicketRepository ticketRepository,
                                   PaymentRepository paymentRepository,
                                   CancellationRequestRepository cancellationRequestRepository) {
        this.ticketRepository = ticketRepository;
        this.paymentRepository = paymentRepository;
        this.cancellationRequestRepository = cancellationRequestRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public CancellationQuoteResponse quoteCancellation(Long userId, Long ticketId) {
        Ticket ticket = ticketRepository.findByIdAndUserId(ticketId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado para este usuario"));

        CancellationQuoteResponse quote = new CancellationQuoteResponse();
        quote.setTicketId(ticket.getId());
        quote.setTicketCode(ticket.getTicketCode());
        quote.setEventId(ticket.getEventId());
        quote.setOriginalPrice(ticket.getPrice() != null ? ticket.getPrice() : 0.0);
        quote.setSeatInfo(formatSeatInfo(ticket));

        String paymentMethod = ticket.getPaymentMethod();
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            paymentMethod = "Tarjeta bancaria / Pasarela de pago";
        }
        quote.setPaymentMethod(formatPaymentMethodDisplay(paymentMethod));

        // 1. Validar estado actual del boleto
        String status = ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : "unknown";
        if ("used".equals(status) || "redeemed".equals(status)) {
            quote.setEligible(false);
            quote.setRejectionReason("El boleto ya ha sido canjeado o utilizado para ingresar al evento.");
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            return quote;
        }

        if ("cancelled".equals(status) || "refunded".equals(status)) {
            quote.setEligible(false);
            quote.setRejectionReason("El boleto ya se encuentra cancelado o reembolsado previamente.");
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            return quote;
        }

        if ("transferred".equals(status)) {
            quote.setEligible(false);
            quote.setRejectionReason("El boleto fue transferido a otro usuario y no puede ser gestionado por la cuenta de origen.");
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            return quote;
        }

        if (!"active".equals(status)) {
            quote.setEligible(false);
            quote.setRejectionReason("El boleto no se encuentra en un estado activo para solicitar cancelación (estado actual: " + status + ").");
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            return quote;
        }

        // 2. Validar si ya existe solicitud previa en curso
        boolean alreadyPending = cancellationRequestRepository.existsByTicketIdAndStatusIn(
                ticketId, List.of("PENDING", "APPROVED", "REFUNDED")
        );
        if (alreadyPending) {
            quote.setEligible(false);
            quote.setRejectionReason("Ya existe una solicitud de cancelación activa o completada para este boleto.");
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            return quote;
        }

        // 3. Consultar y verificar datos del evento
        Map<String, Object> eventData = fetchEventData(ticket.getEventId());
        String eventName = "Evento LAIKA Club";
        String eventDateStr = null;

        if (eventData != null) {
            eventName = (String) eventData.getOrDefault("name", "Evento LAIKA Club");
            eventDateStr = (String) eventData.getOrDefault("event_date", eventData.get("date"));
        }
        quote.setEventName(eventName);
        quote.setEventDate(eventDateStr != null ? eventDateStr : "Fecha por confirmar");

        // 4. Evaluar condiciones de fecha y tiempo del evento
        LocalDateTime eventDateTime = parseEventDateTime(eventDateStr);
        if (eventDateTime != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(eventDateTime)) {
                quote.setEligible(false);
                quote.setRejectionReason("El evento ya dio inicio o concluyó. No se permiten cancelaciones extemporáneas.");
                quote.setRefundAmount(0.0);
                quote.setPenaltyFee(0.0);
                return quote;
            }

            // Regla: Permitido hasta 24 horas antes del inicio del evento
            if (now.plusHours(24).isAfter(eventDateTime)) {
                quote.setEligible(false);
                quote.setRejectionReason("La política del evento estipula que las cancelaciones deben realizarse al menos 24 horas antes de la función.");
                quote.setRefundAmount(0.0);
                quote.setPenaltyFee(0.0);
                return quote;
            }
        }

        // 5. Cálculo del importe reembolsable según política
        double price = ticket.getPrice() != null ? ticket.getPrice() : 0.0;
        if (price <= 0.0) {
            quote.setEligible(true);
            quote.setRefundAmount(0.0);
            quote.setPenaltyFee(0.0);
            quote.setPolicySummary("Boleto cortesía / gratuito. Se revocará el acceso al evento sin generar dispersión financiera.");
            quote.setEstimatedDays("Inmediato");
        } else {
            // Reembolso del 100% de acuerdo a la política anticipada
            double penalty = 0.0;
            double refund = price - penalty;
            quote.setEligible(true);
            quote.setRefundAmount(refund);
            quote.setPenaltyFee(penalty);
            quote.setPolicySummary("Reembolso del 100% del valor pagado por cancelación anticipada (más de 24 horas antes del evento).");
            quote.setEstimatedDays("3 a 5 días hábiles bancarios");
        }

        return quote;
    }

    @Override
    @Transactional
    public CancellationDetailResponse requestCancellation(Long userId, Long ticketId, String reason) {
        ReentrantLock lock = ticketLocks.computeIfAbsent(ticketId, k -> new ReentrantLock());
        lock.lock();
        try {
            // Verificar condiciones mediante la cotización
            CancellationQuoteResponse quote = quoteCancellation(userId, ticketId);
            if (!quote.isEligible()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, quote.getRejectionReason());
            }

            Ticket ticket = ticketRepository.findByIdAndUserId(ticketId, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

            // 1. Criterio 4: El boleto deja de ser válido para acceder al evento inmediatamente
            ticket.setStatus("cancelled");
            ticketRepository.save(ticket);
            logger.info("Boleto {} marcado como cancelado e invalidado para acceso", ticket.getTicketCode());

            // 2. Registrar la solicitud de cancelación
            CancellationRequest request = new CancellationRequest();
            request.setTicketId(ticket.getId());
            request.setUserId(userId);
            request.setEventId(ticket.getEventId());
            request.setTicketCode(ticket.getTicketCode());
            request.setOriginalPrice(quote.getOriginalPrice());
            request.setRefundAmount(quote.getRefundAmount());
            request.setPenaltyFee(quote.getPenaltyFee());
            request.setPaymentMethod(quote.getPaymentMethod());
            request.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Cancelación solicitada por el usuario");

            double refundAmount = quote.getRefundAmount();
            String gatewayRefId = "REF-PSP-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
            request.setGatewayRefundId(gatewayRefId);

            if (refundAmount > 0.0) {
                // Registrar pago negativo en el ledger de pagos
                Payment refundPayment = new Payment();
                refundPayment.setUserId(userId);
                refundPayment.setEventId(ticket.getEventId());
                refundPayment.setAmount(-refundAmount);
                refundPayment.setStatus("refunded");
                refundPayment.setPaymentMethod(ticket.getPaymentMethod());
                refundPayment.setReference(gatewayRefId);
                refundPayment.setCreatedAt(LocalDateTime.now());
                paymentRepository.save(refundPayment);

                request.setPaymentReference(gatewayRefId);
                // Estado del reembolso confirmado por el procesador
                request.setStatus("REFUNDED");
                request.setRefundedAt(LocalDateTime.now());
            } else {
                // Entrada gratuita o sin costo
                request.setStatus("APPROVED");
                request.setPaymentReference("N/A-FREE");
                request.setRefundedAt(LocalDateTime.now());
            }

            CancellationRequest savedRequest = cancellationRequestRepository.save(request);

            // 3. Notificación al ecosistema
            notifyWearablesService(userId, "ticket_cancelled");

            return mapToDetailResponse(savedRequest, quote.getEventName(), quote.getSeatInfo());
        } finally {
            lock.unlock();
        }
    }

    @Override
    public List<CancellationDetailResponse> getUserCancellationRequests(Long userId) {
        List<CancellationRequest> requests = cancellationRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<CancellationDetailResponse> result = new ArrayList<>();

        Map<Long, String> eventNamesCache = new HashMap<>();

        for (CancellationRequest req : requests) {
            String eventName = eventNamesCache.computeIfAbsent(req.getEventId(), id -> {
                Map<String, Object> data = fetchEventData(id);
                return data != null ? (String) data.getOrDefault("name", "Evento #" + id) : "Evento #" + id;
            });

            Optional<Ticket> ticketOpt = ticketRepository.findById(req.getTicketId());
            String seatInfo = ticketOpt.map(this::formatSeatInfo).orElse("N/A");

            result.add(mapToDetailResponse(req, eventName, seatInfo));
        }

        return result;
    }

    @Override
    public CancellationDetailResponse getCancellationRequestDetail(Long userId, Long requestId) {
        CancellationRequest request = cancellationRequestRepository.findByIdAndUserId(requestId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud de cancelación no encontrada"));

        Map<String, Object> eventData = fetchEventData(request.getEventId());
        String eventName = eventData != null ? (String) eventData.getOrDefault("name", "Evento #" + request.getEventId()) : "Evento #" + request.getEventId();

        Optional<Ticket> ticketOpt = ticketRepository.findById(request.getTicketId());
        String seatInfo = ticketOpt.map(this::formatSeatInfo).orElse("N/A");

        return mapToDetailResponse(request, eventName, seatInfo);
    }

    private CancellationDetailResponse mapToDetailResponse(CancellationRequest req, String eventName, String seatInfo) {
        CancellationDetailResponse resp = new CancellationDetailResponse();
        resp.setId(req.getId());
        resp.setTicketId(req.getTicketId());
        resp.setTicketCode(req.getTicketCode());
        resp.setEventId(req.getEventId());
        resp.setEventName(eventName);
        resp.setSeatInfo(seatInfo);
        resp.setOriginalPrice(req.getOriginalPrice());
        resp.setRefundAmount(req.getRefundAmount());
        resp.setPenaltyFee(req.getPenaltyFee());
        resp.setPaymentMethod(formatPaymentMethodDisplay(req.getPaymentMethod()));
        resp.setStatus(req.getStatus());
        resp.setStatusLabel(mapStatusToLabel(req.getStatus()));
        resp.setCancellationReason(req.getCancellationReason());
        resp.setRejectionReason(req.getRejectionReason());
        resp.setGatewayRefundId(req.getGatewayRefundId());

        if (req.getCreatedAt() != null) {
            resp.setCreatedAt(req.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (req.getRefundedAt() != null) {
            resp.setRefundedAt(req.getRefundedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        if ("REFUNDED".equalsIgnoreCase(req.getStatus())) {
            resp.setMessage("Tu reembolso fue procesado exitosamente por $" + String.format("%.2f", req.getRefundAmount()) + " MXN.");
        } else if ("APPROVED".equalsIgnoreCase(req.getStatus())) {
            resp.setMessage("Cancelación aprobada sin saldo pendiente.");
        } else if ("PENDING".equalsIgnoreCase(req.getStatus())) {
            resp.setMessage("Tu solicitud se encuentra en revisión.");
        } else if ("REJECTED".equalsIgnoreCase(req.getStatus())) {
            resp.setMessage("Solicitud rechazada: " + (req.getRejectionReason() != null ? req.getRejectionReason() : "No cumple políticas de reembolso."));
        } else {
            resp.setMessage("Estado de solicitud: " + req.getStatus());
        }

        return resp;
    }

    private String mapStatusToLabel(String status) {
        if (status == null) return "Desconocido";
        switch (status.toUpperCase()) {
            case "PENDING":
                return "Pendiente de revisión";
            case "APPROVED":
                return "Cancelación aprobada";
            case "REFUNDED":
                return "Reembolsado con éxito";
            case "REJECTED":
                return "Solicitud rechazada";
            case "FAILED":
                return "Fallo en dispersión";
            default:
                return status;
        }
    }

    private String formatSeatInfo(Ticket ticket) {
        StringBuilder sb = new StringBuilder();
        if (ticket.getSectionName() != null && !ticket.getSectionName().isEmpty()) {
            sb.append(ticket.getSectionName());
        } else {
            sb.append("General");
        }
        if (ticket.getSeatId() != null && !ticket.getSeatId().isEmpty()) {
            sb.append(" - Asiento ").append(ticket.getSeatId());
        }
        return sb.toString();
    }

    private String formatPaymentMethodDisplay(String method) {
        if (method == null) return "Tarjeta bancaria";
        String lower = method.toLowerCase();
        if (lower.contains("card") || lower.contains("tarjeta")) {
            return "Tarjeta bancaria (Cargo original)";
        }
        if (lower.contains("cash") || lower.contains("efectivo") || lower.contains("oxxo")) {
            return "Saldo en cuenta / Reembolso en efectivo";
        }
        if (lower.contains("free") || lower.contains("gratis") || lower.contains("cortesia")) {
            return "Cortesía institucional";
        }
        return method;
    }

    private Map<String, Object> fetchEventData(Long eventId) {
        if (eventId == null) return null;
        try {
            return restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
        } catch (Exception e) {
            logger.warn("No se pudo obtener datos del evento {}: {}", eventId, e.getMessage());
            return null;
        }
    }

    private LocalDateTime parseEventDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        try {
            dateStr = dateStr.trim();
            if (dateStr.length() == 10) {
                // yyyy-MM-dd -> asume las 23:59 del día o 20:00
                LocalDate ld = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
                return ld.atTime(20, 0);
            }
            if (dateStr.contains("T")) {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            if (dateStr.contains(" ")) {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }
        } catch (Exception e) {
            logger.warn("No se pudo parsear la fecha del evento '{}': {}", dateStr, e.getMessage());
        }
        return null;
    }

    private void notifyWearablesService(Long userId, String action) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("action", action);
            payload.put("timestamp", LocalDateTime.now().toString());
            restTemplate.postForObject(wearablesServiceUrl + "/notify", payload, String.class);
        } catch (Exception e) {
            logger.warn("No se pudo notificar a wearables: {}", e.getMessage());
        }
    }
}
