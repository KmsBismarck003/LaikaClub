package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.CourtesyIssuance;
import com.laikaclub.tickets.domain.CourtesyQuota;
import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.dto.CourtesyQuotaRequest;
import com.laikaclub.tickets.dto.CourtesySummaryResponse;
import com.laikaclub.tickets.dto.IssueCourtesyRequest;
import com.laikaclub.tickets.repository.CourtesyIssuanceRepository;
import com.laikaclub.tickets.repository.CourtesyQuotaRepository;
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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CourtesyService {

    private static final Logger logger = LoggerFactory.getLogger(CourtesyService.class);
    private static final int DEFAULT_MANAGER_QUOTA = 25;

    private final CourtesyQuotaRepository courtesyQuotaRepository;
    private final CourtesyIssuanceRepository courtesyIssuanceRepository;
    private final TicketRepository ticketRepository;
    private final MongoSyncService mongoSyncService;
    private final RestTemplate restTemplate;

    @Value("${services.events.url:http://localhost:8201}")
    private String eventServiceUrl;

    @Value("${services.auth.url:http://localhost:8101}")
    private String authServiceUrl;

    @Autowired
    public CourtesyService(CourtesyQuotaRepository courtesyQuotaRepository,
                           CourtesyIssuanceRepository courtesyIssuanceRepository,
                           TicketRepository ticketRepository,
                           MongoSyncService mongoSyncService) {
        this.courtesyQuotaRepository = courtesyQuotaRepository;
        this.courtesyIssuanceRepository = courtesyIssuanceRepository;
        this.ticketRepository = ticketRepository;
        this.mongoSyncService = mongoSyncService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Consulta las cuotas asignadas a un gestor para un evento o todas sus cuotas.
     */
    public List<CourtesyQuota> getManagerQuotas(Long managerUserId, Long eventId) {
        if (eventId != null) {
            return courtesyQuotaRepository.findByManagerUserIdAndEventIdOrderByCreatedAtDesc(managerUserId, eventId);
        }
        return courtesyQuotaRepository.findByManagerUserId(managerUserId);
    }

    /**
     * Permite a un administrador asignar o actualizar cuotas a un gestor.
     */
    @Transactional
    public CourtesyQuota setManagerQuota(CourtesyQuotaRequest req, Long requestingUserId, String requestingRole) {
        if (!isAdmin(requestingRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden asignar cuotas de cortesías");
        }
        if (req.getManagerUserId() == null || req.getEventId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "managerUserId y eventId son requeridos");
        }
        int max = (req.getMaxAllowed() != null && req.getMaxAllowed() >= 0) ? req.getMaxAllowed() : DEFAULT_MANAGER_QUOTA;

        Optional<CourtesyQuota> existingOpt = courtesyQuotaRepository.findByManagerUserIdAndEventId(
                req.getManagerUserId(), req.getEventId());

        CourtesyQuota quota;
        if (existingOpt.isPresent()) {
            quota = existingOpt.get();
            quota.setMaxAllowed(max);
            quota.setSectionName(req.getSectionName());
            quota.setEventFunctionId(req.getEventFunctionId());
        } else {
            quota = new CourtesyQuota(req.getManagerUserId(), req.getEventId(), max);
            quota.setSectionName(req.getSectionName());
            quota.setEventFunctionId(req.getEventFunctionId());
        }

        return courtesyQuotaRepository.save(quota);
    }

    /**
     * Emite boletos de cortesía ya sea de forma directa por correo o mediante lote de códigos de canje.
     */
    @Transactional
    public Map<String, Object> issueCourtesy(Long issuerUserId, String issuerEmail, String issuerRole, IssueCourtesyRequest request) {
        if (request.getEventId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eventId es requerido");
        }
        String motive = (request.getMotive() != null && !request.getMotive().trim().isEmpty())
                ? request.getMotive().trim() : "Invitación Especial";
        String recipientType = (request.getRecipientType() != null && !request.getRecipientType().trim().isEmpty())
                ? request.getRecipientType().trim().toUpperCase() : "INVITADO_ESPECIAL";
        String method = (request.getDeliveryMethod() != null && request.getDeliveryMethod().equalsIgnoreCase("CLAIM_CODE"))
                ? "CLAIM_CODE" : "DIRECT_EMAIL";
        int qty = request.getQuantity();

        // 1. Validar existencia del evento e inventario
        Map<?, ?> eventData = fetchEventData(request.getEventId());
        if (eventData == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado");
        }

        // 2. Verificar y descontar cuota autorizada del gestor
        consumeQuota(issuerUserId, issuerRole, request.getEventId(), request.getEventFunctionId(), request.getSectionName(), qty);

        // 3. Registrar auditoría del lote de emisión
        CourtesyIssuance issuance = new CourtesyIssuance(
                request.getEventId(),
                request.getEventFunctionId(),
                request.getSectionName(),
                issuerUserId,
                issuerEmail != null ? issuerEmail : "gestor@laikaclub.com",
                recipientType,
                motive,
                method,
                qty
        );
        courtesyIssuanceRepository.save(issuance);

        List<Map<String, Object>> generatedTickets = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if ("DIRECT_EMAIL".equals(method)) {
            String recipientEmail = request.getRecipientEmail();
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "recipientEmail es requerido para emisión directa");
            }
            String cleanRecipientEmail = recipientEmail.trim().toLowerCase();
            String recipientName = (request.getRecipientName() != null && !request.getRecipientName().trim().isEmpty())
                    ? request.getRecipientName().trim() : null;

            // Buscar si ya está registrado en auth
            Long recipientUserId = null;
            try {
                Map<?, ?> userMap = restTemplate.getForObject(authServiceUrl + "/internal/users/by-email?email=" + cleanRecipientEmail, Map.class);
                if (userMap != null && userMap.containsKey("id")) {
                    recipientUserId = ((Number) userMap.get("id")).longValue();
                    if (recipientName == null && userMap.containsKey("name")) {
                        recipientName = (String) userMap.get("name");
                    }
                }
            } catch (Exception e) {
                logger.info("Destinatario de cortesía no registrado aún en auth: {}", cleanRecipientEmail);
            }

            for (int i = 0; i < qty; i++) {
                String ticketCode = generateTicketCode();
                Ticket ticket = new Ticket();
                ticket.setUserId(recipientUserId);
                ticket.setEventId(request.getEventId());
                ticket.setEventFunctionId(request.getEventFunctionId());
                ticket.setTicketCode(ticketCode);
                ticket.setQrData(ticketCode);
                ticket.setSectionName(request.getSectionName() != null ? request.getSectionName() : "General");
                ticket.setPrice(0.0);
                ticket.setStatus("active");
                ticket.setPaymentMethod("courtesy");
                ticket.setPurchaseDate(now);
                ticket.setIsCourtesy(true);
                ticket.setCourtesyIssuanceId(issuance.getId());
                ticket.setRecipientType(recipientType);
                ticket.setCourtesyMotive(motive);
                ticket.setHolderName(recipientName != null ? recipientName : cleanRecipientEmail);
                ticket.setHolderEmail(cleanRecipientEmail);

                ticketRepository.save(ticket);
                syncToMongo(ticket, recipientUserId, now);

                Map<String, Object> tktMap = serializeCourtesyTicket(ticket);
                generatedTickets.add(tktMap);

                // Enviar correo transaccional
                sendEmailAsync(cleanRecipientEmail, recipientName, eventData, ticket, motive, issuerEmail);
            }
        } else {
            // CLAIM_CODE (Lote para el Centro de Canje)
            for (int i = 0; i < qty; i++) {
                String ticketCode = generateTicketCode();
                String claimToken = generateClaimToken();

                Ticket ticket = new Ticket();
                ticket.setUserId(null); // Pendiente de asignación
                ticket.setEventId(request.getEventId());
                ticket.setEventFunctionId(request.getEventFunctionId());
                ticket.setTicketCode(ticketCode);
                ticket.setQrData(ticketCode); // QR activo al ser canjeado
                ticket.setSectionName(request.getSectionName() != null ? request.getSectionName() : "General");
                ticket.setPrice(0.0);
                ticket.setStatus("pending_claim");
                ticket.setPaymentMethod("courtesy");
                ticket.setPurchaseDate(now);
                ticket.setIsCourtesy(true);
                ticket.setCourtesyIssuanceId(issuance.getId());
                ticket.setClaimToken(claimToken);
                ticket.setRecipientType(recipientType);
                ticket.setCourtesyMotive(motive);

                ticketRepository.save(ticket);
                syncToMongo(ticket, null, now);

                Map<String, Object> tktMap = serializeCourtesyTicket(ticket);
                generatedTickets.add(tktMap);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("issuance_id", issuance.getId());
        response.put("delivery_method", method);
        response.put("quantity", qty);
        response.put("recipient_type", recipientType);
        response.put("motive", motive);
        response.put("tickets", generatedTickets);
        response.put("message", "DIRECT_EMAIL".equals(method)
                ? "Cortesía emitida y notificada por correo electrónico al destinatario."
                : "Lote de códigos de cortesía generado exitosamente para entrega y canje posterior.");

        return response;
    }

    /**
     * Canjea un código de cortesía en el Centro de Canje por parte de un usuario autenticado.
     */
    @Transactional
    public Map<String, Object> claimCourtesy(String claimToken, Long claimingUserId, String claimingUserEmail, String claimingUserName) {
        if (claimToken == null || claimToken.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "claimToken es requerido");
        }
        String cleanToken = claimToken.trim().toUpperCase();

        Ticket ticket = ticketRepository.findByClaimToken(cleanToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código de cortesía inválido o no encontrado"));

        if (!Boolean.TRUE.equals(ticket.getIsCourtesy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código proporcionado no corresponde a un boleto de cortesía");
        }

        if (!"pending_claim".equalsIgnoreCase(ticket.getStatus())) {
            if ("active".equalsIgnoreCase(ticket.getStatus()) || "used".equalsIgnoreCase(ticket.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Este código de cortesía ya fue canjeado previamente");
            }
            if ("cancelled".equalsIgnoreCase(ticket.getStatus())) {
                throw new ResponseStatusException(HttpStatus.GONE, "Este código de cortesía fue revocado o cancelado por la administración");
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El boleto no se encuentra en estado canjeable (estado: " + ticket.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setUserId(claimingUserId);
        ticket.setHolderEmail(claimingUserEmail);
        ticket.setHolderName(claimingUserName != null && !claimingUserName.trim().isEmpty() ? claimingUserName : claimingUserEmail);
        ticket.setStatus("active");
        ticket.setPurchaseDate(now);
        ticketRepository.save(ticket);

        syncToMongo(ticket, claimingUserId, now);

        // Notificar por correo
        Map<?, ?> eventData = fetchEventData(ticket.getEventId());
        sendEmailAsync(claimingUserEmail, claimingUserName, eventData, ticket, ticket.getCourtesyMotive(), "LaikaClub Canjes");

        Map<String, Object> result = serializeCourtesyTicket(ticket);
        result.put("claimed_at", now.format(DateTimeFormatter.ISO_DATE_TIME));
        result.put("message", "¡Felicidades! Has canjeado tu boleto de cortesía exitosamente.");
        return result;
    }

    /**
     * Valida un código de cortesía y devuelve información preliminar para previsualizar antes de canjear.
     */
    public Map<String, Object> validateClaimToken(String claimToken) {
        if (claimToken == null || claimToken.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código requerido");
        }
        String cleanToken = claimToken.trim().toUpperCase();

        Ticket ticket = ticketRepository.findByClaimToken(cleanToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código de cortesía no encontrado"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("claim_token", cleanToken);
        response.put("status", ticket.getStatus());
        response.put("can_claim", "pending_claim".equalsIgnoreCase(ticket.getStatus()));
        response.put("section_name", ticket.getSectionName());
        response.put("recipient_type", ticket.getRecipientType());
        response.put("motive", ticket.getCourtesyMotive());

        Map<?, ?> eventData = fetchEventData(ticket.getEventId());
        if (eventData != null) {
            response.put("event_name", eventData.get("name"));
            response.put("event_date", eventData.get("event_date"));
            response.put("event_time", eventData.get("event_time"));
            response.put("venue_name", eventData.get("venue_name"));
            response.put("image_url", eventData.get("image_url"));
        }

        return response;
    }

    /**
     * Revoca un boleto de cortesía emitido antes de que sea utilizado.
     */
    @Transactional
    public Map<String, Object> revokeCourtesy(Long ticketId, Long requestingUserId, String requestingRole, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        if (!Boolean.TRUE.equals(ticket.getIsCourtesy())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden revocar boletos de cortesía");
        }

        if ("used".equalsIgnoreCase(ticket.getStatus()) || "redeemed".equalsIgnoreCase(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede revocar un boleto que ya fue validado en puerta");
        }

        if ("cancelled".equalsIgnoreCase(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El boleto ya se encuentra cancelado");
        }

        ticket.setStatus("cancelled");
        ticketRepository.save(ticket);

        // Devolver 1 a la cuota si existe
        courtesyQuotaRepository.findByManagerUserIdAndEventId(requestingUserId, ticket.getEventId())
                .ifPresent(quota -> {
                    if (quota.getIssuedCount() > 0) {
                        quota.setIssuedCount(quota.getIssuedCount() - 1);
                        courtesyQuotaRepository.save(quota);
                    }
                });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("ticket_id", ticket.getId());
        response.put("ticket_code", ticket.getTicketCode());
        response.put("status", "cancelled");
        response.put("reason", reason != null ? reason : "Revocado por administración");
        response.put("message", "Boleto de cortesía revocado con éxito");
        return response;
    }

    /**
     * Consulta el panel de auditoría y estadísticas de cortesías de un evento.
     */
    public CourtesySummaryResponse getCourtesyDashboard(Long eventId, Long requestingUserId, String requestingRole) {
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eventId es requerido");
        }

        List<CourtesyQuota> quotas;
        if (isAdmin(requestingRole)) {
            quotas = courtesyQuotaRepository.findByEventId(eventId);
        } else {
            quotas = courtesyQuotaRepository.findByManagerUserIdAndEventIdOrderByCreatedAtDesc(requestingUserId, eventId);
        }

        int totalAllowed = quotas.stream().mapToInt(CourtesyQuota::getMaxAllowed).sum();
        int totalIssued = quotas.stream().mapToInt(CourtesyQuota::getIssuedCount).sum();
        if (quotas.isEmpty() && !isAdmin(requestingRole)) {
            totalAllowed = DEFAULT_MANAGER_QUOTA;
        }

        List<CourtesyIssuance> issuances = courtesyIssuanceRepository.findByEventIdOrderByCreatedAtDesc(eventId);
        List<Ticket> tickets = ticketRepository.findByEventIdAndIsCourtesyTrueOrderByPurchaseDateDesc(eventId);

        long activeCount = tickets.stream().filter(t -> "active".equalsIgnoreCase(t.getStatus()) || "confirmed".equalsIgnoreCase(t.getStatus())).count();
        long pendingCount = tickets.stream().filter(t -> "pending_claim".equalsIgnoreCase(t.getStatus())).count();
        long usedCount = tickets.stream().filter(t -> "used".equalsIgnoreCase(t.getStatus()) || "redeemed".equalsIgnoreCase(t.getStatus())).count();
        long cancelledCount = tickets.stream().filter(t -> "cancelled".equalsIgnoreCase(t.getStatus())).count();

        List<Map<String, Object>> serializedIssuances = new ArrayList<>();
        DateTimeFormatter iso = DateTimeFormatter.ISO_DATE_TIME;
        for (CourtesyIssuance iss : issuances) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", iss.getId());
            map.put("event_id", iss.getEventId());
            map.put("issuer_user_id", iss.getIssuerUserId());
            map.put("issuer_email", iss.getIssuerEmail());
            map.put("recipient_type", iss.getRecipientType());
            map.put("motive", iss.getMotive());
            map.put("delivery_method", iss.getDeliveryMethod());
            map.put("quantity", iss.getQuantity());
            map.put("section_name", iss.getSectionName());
            map.put("created_at", iss.getCreatedAt() != null ? iss.getCreatedAt().format(iso) : null);
            serializedIssuances.add(map);
        }

        List<Map<String, Object>> serializedTickets = new ArrayList<>();
        for (Ticket tkt : tickets) {
            serializedTickets.add(serializeCourtesyTicket(tkt));
        }

        List<Map<String, Object>> serializedQuotas = new ArrayList<>();
        for (CourtesyQuota q : quotas) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", q.getId());
            map.put("manager_user_id", q.getManagerUserId());
            map.put("event_id", q.getEventId());
            map.put("max_allowed", q.getMaxAllowed());
            map.put("issued_count", q.getIssuedCount());
            map.put("remaining", Math.max(0, q.getMaxAllowed() - q.getIssuedCount()));
            serializedQuotas.add(map);
        }

        CourtesySummaryResponse resp = new CourtesySummaryResponse();
        resp.setTotalQuotaAllowed(totalAllowed);
        resp.setTotalQuotaIssued(totalIssued);
        resp.setTotalQuotaRemaining(Math.max(0, totalAllowed - totalIssued));
        resp.setTotalTickets(tickets.size());
        resp.setAssignedCount(activeCount);
        resp.setPendingClaimCount(pendingCount);
        resp.setUsedCount(usedCount);
        resp.setCancelledCount(cancelledCount);
        resp.setQuotas(serializedQuotas);
        resp.setIssuances(serializedIssuances);
        resp.setTickets(serializedTickets);

        return resp;
    }

    // ── Helper Methods ─────────────────────────────────────────────────────────

    private boolean isAdmin(String role) {
        return role != null && ("admin".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role));
    }

    private void consumeQuota(Long managerUserId, String role, Long eventId, Long functionId, String sectionName, int qty) {
        if (isAdmin(role)) {
            // Admin no tiene límite duro de cuota
            return;
        }

        Optional<CourtesyQuota> quotaOpt = courtesyQuotaRepository.findByManagerUserIdAndEventId(managerUserId, eventId);
        CourtesyQuota quota;
        if (quotaOpt.isPresent()) {
            quota = quotaOpt.get();
        } else {
            // Crear cuota por defecto
            quota = new CourtesyQuota(managerUserId, eventId, DEFAULT_MANAGER_QUOTA);
            quota.setSectionName(sectionName);
            quota.setEventFunctionId(functionId);
        }

        if (quota.getIssuedCount() + qty > quota.getMaxAllowed()) {
            int remaining = Math.max(0, quota.getMaxAllowed() - quota.getIssuedCount());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Límite de cortesías excedido. Tienes " + remaining + " cortesías disponibles de " + quota.getMaxAllowed() + " autorizadas.");
        }

        quota.setIssuedCount(quota.getIssuedCount() + qty);
        courtesyQuotaRepository.save(quota);
    }

    private Map<?, ?> fetchEventData(Long eventId) {
        try {
            return restTemplate.getForObject(eventServiceUrl + "/" + eventId, Map.class);
        } catch (Exception e) {
            logger.warn("No se pudo obtener datos del evento {} desde {}: {}", eventId, eventServiceUrl, e.getMessage());
            return null;
        }
    }

    private String generateTicketCode() {
        return "TKT-COR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String generateClaimToken() {
        return "LAIKA-COR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    private void syncToMongo(Ticket ticket, Long userId, LocalDateTime now) {
        try {
            Map<String, Object> syncData = new HashMap<>();
            syncData.put("user_id", userId);
            syncData.put("event_id", ticket.getEventId());
            syncData.put("ticket_code", ticket.getTicketCode());
            syncData.put("price", 0.0);
            syncData.put("seat_id", ticket.getSeatId());
            syncData.put("section", ticket.getSectionName());
            syncData.put("payment_method", "courtesy");
            syncData.put("purchase_date", now.format(DateTimeFormatter.ISO_DATE_TIME));
            syncData.put("type", "courtesy_issuance");
            syncData.put("is_courtesy", true);
            mongoSyncService.syncPurchaseToMongo(syncData);
        } catch (Exception e) {
            logger.debug("Mongo sync courtesy ignorado: {}", e.getMessage());
        }
    }

    private void sendEmailAsync(String toEmail, String recipientName, Map<?, ?> eventData, Ticket ticket, String motive, String issuerInfo) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("to_email", toEmail);
            payload.put("recipient_name", recipientName);
            payload.put("ticket_code", ticket.getTicketCode());
            payload.put("qr_data", ticket.getQrData() != null ? ticket.getQrData() : ticket.getTicketCode());
            payload.put("section_name", ticket.getSectionName());
            payload.put("seat_id", ticket.getSeatId());
            payload.put("motive", motive);
            payload.put("issuer_info", issuerInfo);

            if (eventData != null) {
                payload.put("event_name", eventData.get("name"));
                payload.put("event_date", eventData.get("event_date"));
                payload.put("event_time", eventData.get("event_time"));
            }

            restTemplate.postForEntity(authServiceUrl + "/internal/mail/courtesy", payload, Map.class);
        } catch (Exception e) {
            logger.warn("Error enviando correo de cortesía a {}: {}", toEmail, e.getMessage());
        }
    }

    private Map<String, Object> serializeCourtesyTicket(Ticket tkt) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", tkt.getId());
        map.put("user_id", tkt.getUserId());
        map.put("event_id", tkt.getEventId());
        map.put("ticket_code", tkt.getTicketCode());
        map.put("qr_data", tkt.getQrData());
        map.put("section_name", tkt.getSectionName());
        map.put("seat_id", tkt.getSeatId());
        map.put("price", tkt.getPrice());
        map.put("status", tkt.getStatus());
        map.put("payment_method", tkt.getPaymentMethod());
        map.put("purchase_date", tkt.getPurchaseDate() != null ? tkt.getPurchaseDate().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        map.put("is_courtesy", true);
        map.put("courtesy_issuance_id", tkt.getCourtesyIssuanceId());
        map.put("claim_token", tkt.getClaimToken());
        map.put("recipient_type", tkt.getRecipientType());
        map.put("courtesy_motive", tkt.getCourtesyMotive());
        map.put("holder_name", tkt.getHolderName());
        map.put("holder_email", tkt.getHolderEmail());
        return map;
    }
}
