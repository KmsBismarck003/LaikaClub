package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.domain.TicketTransfer;
import com.laikaclub.tickets.domain.TransferToken;
import com.laikaclub.tickets.repository.TicketRepository;
import com.laikaclub.tickets.repository.TicketTransferRepository;
import com.laikaclub.tickets.repository.TransferTokenRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class TransferService {

    private static final Logger logger = LoggerFactory.getLogger(TransferService.class);

    private final TicketRepository ticketRepository;
    private final TransferTokenRepository transferTokenRepository;
    private final TicketTransferRepository ticketTransferRepository;
    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<Long, ReentrantLock> ticketLocks = new ConcurrentHashMap<>();

    @Value("${services.auth.url}")
    private String authServiceUrl;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    private static final int TRANSFER_EXPIRATION_HOURS = 48;
    private static final int LEGACY_TOKEN_TTL_MINUTES = 10;

    @Autowired
    public TransferService(TicketRepository ticketRepository,
                           TransferTokenRepository transferTokenRepository,
                           TicketTransferRepository ticketTransferRepository) {
        this.ticketRepository = ticketRepository;
        this.transferTokenRepository = transferTokenRepository;
        this.ticketTransferRepository = ticketTransferRepository;
        this.restTemplate = new RestTemplate();
    }

    private ReentrantLock getLockForTicket(Long ticketId) {
        return ticketLocks.computeIfAbsent(ticketId, k -> new ReentrantLock());
    }

    /**
     * Inicia una transferencia dirigida por correo electrónico.
     * Si el destinatario está registrado, status = PENDING_ACCEPTANCE.
     * Si no está registrado, status = PENDING_REGISTRATION (con claim_token para invitarlo).
     */
    @Transactional
    public Map<String, Object> requestTransfer(Long senderId, String senderEmail, Long ticketId, String recipientEmail, String password) {
        ReentrantLock lock = getLockForTicket(ticketId);
        lock.lock();
        try {
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo del destinatario es obligatorio");
            }
            String cleanRecipientEmail = recipientEmail.trim().toLowerCase();

            if (senderEmail != null && cleanRecipientEmail.equalsIgnoreCase(senderEmail.trim())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes transferirte un boleto a ti mismo");
            }

            Ticket ticket = ticketRepository.findByIdAndUserId(ticketId, senderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado para este usuario"));

            String status = ticket.getStatus() != null ? ticket.getStatus().toLowerCase() : "";
            if ("cancelled".equals(status) || "refunded".equals(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un boleto cancelado o reembolsado no puede transferirse");
            }
            if ("used".equals(status) || "redeemed".equals(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un boleto ya utilizado no puede transferirse");
            }
            if ("transferred".equals(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este boleto ya fue transferido anteriormente");
            }
            if ("transfer_pending".equals(status)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El boleto ya tiene una solicitud de transferencia pendiente");
            }
            if (!"active".equals(status) && !"confirmed".equals(status)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden transferir boletos activos");
            }

            // Verificar si ya existe transferencia pendiente en BD
            Optional<TicketTransfer> pendingOpt = ticketTransferRepository.findFirstByTicketIdOriginalAndStatusIn(
                    ticketId, List.of("PENDING_ACCEPTANCE", "PENDING_REGISTRATION"));
            if (pendingOpt.isPresent()) {
                TicketTransfer existing = pendingOpt.get();
                if (LocalDateTime.now().isBefore(existing.getExpiresAt())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una transferencia activa para este boleto");
                } else {
                    existing.setStatus("EXPIRED");
                    ticketTransferRepository.save(existing);
                }
            }

            // Validar contraseña si se proporcionó
            if (password != null && !password.trim().isEmpty()) {
                try {
                    Map<String, Object> req = new HashMap<>();
                    req.put("user_id", senderId);
                    req.put("password", password);
                    restTemplate.postForEntity(authServiceUrl + "/api/auth/verify-password", req, Void.class);
                } catch (Exception e) {
                    if (e.getMessage() != null && e.getMessage().contains("401")) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
                    }
                    logger.warn("Verificación de contraseña en auth falló o no disponible: {}", e.getMessage());
                }
            }

            // Buscar si el destinatario ya está registrado en Auth Service
            Long recipientUserId = null;
            String recipientName = null;
            try {
                Map<?, ?> userMap = restTemplate.getForObject(authServiceUrl + "/internal/users/by-email?email=" + cleanRecipientEmail, Map.class);
                if (userMap != null && userMap.containsKey("id")) {
                    recipientUserId = ((Number) userMap.get("id")).longValue();
                    recipientName = (String) userMap.get("name");
                }
            } catch (Exception e) {
                logger.info("Destinatario no registrado en auth service ({})", cleanRecipientEmail);
            }

            String initialStatus = (recipientUserId != null) ? "PENDING_ACCEPTANCE" : "PENDING_REGISTRATION";
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusHours(TRANSFER_EXPIRATION_HOURS);
            String claimToken = UUID.randomUUID().toString().replace("-", "");

            // Congelar boleto original
            ticket.setStatus("transfer_pending");
            ticketRepository.save(ticket);

            // Crear registro de transferencia
            TicketTransfer transfer = new TicketTransfer();
            transfer.setTicketIdOriginal(ticketId);
            transfer.setSenderUserId(senderId);
            transfer.setSenderEmail(senderEmail != null ? senderEmail : "usuario@laikaclub.com");
            transfer.setRecipientUserId(recipientUserId);
            transfer.setRecipientEmail(cleanRecipientEmail);
            transfer.setClaimToken(claimToken);
            transfer.setStatus(initialStatus);
            transfer.setExpiresAt(expiresAt);
            ticketTransferRepository.save(transfer);

            Map<String, Object> response = new HashMap<>();
            response.put("transfer_id", transfer.getId());
            response.put("status", initialStatus);
            response.put("claim_token", claimToken);
            response.put("recipient_email", cleanRecipientEmail);
            response.put("recipient_name", recipientName);
            response.put("is_registered_user", recipientUserId != null);
            response.put("expires_at", expiresAt.format(DateTimeFormatter.ISO_DATE_TIME));
            response.put("ticket_code", ticket.getTicketCode());
            response.put("message", recipientUserId != null
                    ? "Solicitud enviada. El destinatario debe aceptar la transferencia en su cuenta."
                    : "Invitación creada. Tu amigo puede registrarse con este correo para recibir el boleto.");

            return response;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Acepta la transferencia de un boleto (transacción atómica).
     */
    @Transactional
    public Map<String, Object> acceptTransfer(Long transferId, Long recipientUserId, String recipientEmail) {
        TicketTransfer transfer = ticketTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transferencia no encontrada"));

        ReentrantLock lock = getLockForTicket(transfer.getTicketIdOriginal());
        lock.lock();
        try {
            validateTransferIsActionable(transfer);

            // Verificar que el receptor tenga derecho a aceptar
            if (transfer.getRecipientUserId() != null) {
                if (!transfer.getRecipientUserId().equals(recipientUserId)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes autorización para aceptar esta transferencia");
                }
            } else {
                // Si fue invitada por email, verificar coincidencia de email
                if (recipientEmail != null && !transfer.getRecipientEmail().equalsIgnoreCase(recipientEmail.trim())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El correo de tu cuenta no coincide con el destinatario invitado");
                }
                transfer.setRecipientUserId(recipientUserId);
            }

            if (transfer.getSenderUserId().equals(recipientUserId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes aceptar un boleto transferido por ti mismo");
            }

            Ticket origTicket = ticketRepository.findById(transfer.getTicketIdOriginal())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto original no encontrado"));

            LocalDateTime now = LocalDateTime.now();
            String newCode = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

            // 1. Invalidar boleto anterior
            origTicket.setStatus("transferred");
            origTicket.setRedeemedAt(now.format(DateTimeFormatter.ISO_DATE_TIME));
            ticketRepository.save(origTicket);

            // 2. Crear credencial nueva para el receptor
            Ticket newTicket = new Ticket();
            newTicket.setUserId(recipientUserId);
            newTicket.setEventId(origTicket.getEventId());
            newTicket.setTicketCode(newCode);
            newTicket.setQrData(newCode);
            newTicket.setStatus("active");
            newTicket.setPurchaseDate(now);
            newTicket.setSeatId(origTicket.getSeatId());
            newTicket.setSectionName(origTicket.getSectionName());
            newTicket.setPrice(origTicket.getPrice());
            newTicket.setPaymentMethod("transfer");
            newTicket.setEventFunctionId(origTicket.getEventFunctionId());
            ticketRepository.save(newTicket);

            // 3. Actualizar registro de transferencia
            transfer.setStatus("ACCEPTED");
            transfer.setTicketIdNuevo(newTicket.getId());
            transfer.setCompletedAt(now);
            ticketTransferRepository.save(transfer);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Boleto aceptado y acreditado exitosamente");
            response.put("new_ticket_code", newCode);
            response.put("new_ticket_id", newTicket.getId());
            return response;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Rechaza la transferencia de un boleto. Restaura el boleto original a active.
     */
    @Transactional
    public Map<String, Object> rejectTransfer(Long transferId, Long recipientUserId, String recipientEmail) {
        TicketTransfer transfer = ticketTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transferencia no encontrada"));

        ReentrantLock lock = getLockForTicket(transfer.getTicketIdOriginal());
        lock.lock();
        try {
            validateTransferIsActionable(transfer);

            if (transfer.getRecipientUserId() != null && !transfer.getRecipientUserId().equals(recipientUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes autorización para rechazar esta transferencia");
            }

            Ticket origTicket = ticketRepository.findById(transfer.getTicketIdOriginal())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto original no encontrado"));

            origTicket.setStatus("active");
            ticketRepository.save(origTicket);

            transfer.setStatus("REJECTED");
            transfer.setCompletedAt(LocalDateTime.now());
            ticketTransferRepository.save(transfer);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Transferencia rechazada. El boleto fue devuelto al remitente.");
            return response;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Cancela la transferencia por parte del remitente (arrepentimiento o correo erróneo).
     */
    @Transactional
    public Map<String, Object> cancelTransfer(Long transferId, Long senderUserId) {
        TicketTransfer transfer = ticketTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transferencia no encontrada"));

        ReentrantLock lock = getLockForTicket(transfer.getTicketIdOriginal());
        lock.lock();
        try {
            if (!transfer.getSenderUserId().equals(senderUserId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el remitente puede cancelar esta transferencia");
            }

            validateTransferIsActionable(transfer);

            Ticket origTicket = ticketRepository.findById(transfer.getTicketIdOriginal())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto original no encontrado"));

            origTicket.setStatus("active");
            ticketRepository.save(origTicket);

            transfer.setStatus("CANCELLED");
            transfer.setCompletedAt(LocalDateTime.now());
            ticketTransferRepository.save(transfer);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Transferencia cancelada. El boleto está nuevamente activo en tu Wallet.");
            return response;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Reclama un boleto vía claim_token (usado en el autoregistro de usuarios no registrados).
     */
    @Transactional
    public Map<String, Object> claimByToken(String claimToken, Long claimingUserId, String claimingUserEmail) {
        TicketTransfer transfer = ticketTransferRepository.findByClaimToken(claimToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace de transferencia no válido o no encontrado"));

        return acceptTransfer(transfer.getId(), claimingUserId, claimingUserEmail);
    }

    /**
     * Obtiene la información pública del reclamo para mostrarla en la pantalla de registro/onboarding.
     */
    public Map<String, Object> getClaimInfo(String claimToken) {
        TicketTransfer transfer = ticketTransferRepository.findByClaimToken(claimToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace de transferencia no válido o no encontrado"));

        validateTransferIsActionable(transfer);

        Ticket ticket = ticketRepository.findById(transfer.getTicketIdOriginal())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        String senderName = "Un usuario de LAIKA Club";
        try {
            Map<?, ?> userMap = restTemplate.getForObject(authServiceUrl + "/api/auth/users/" + transfer.getSenderUserId() + "/public", Map.class);
            if (userMap != null) {
                senderName = userMap.containsKey("name") ? (String) userMap.get("name") :
                        userMap.containsKey("full_name") ? (String) userMap.get("full_name") : senderName;
            }
        } catch (Exception ignored) {}

        String eventName = "Evento LAIKA Club";
        String eventDate = null;
        String eventVenue = "LAIKA ARENA";
        try {
            Map<?, ?> evData = restTemplate.getForObject(eventServiceUrl + "/" + ticket.getEventId(), Map.class);
            if (evData != null) {
                eventName = evData.containsKey("name") ? (String) evData.get("name") : eventName;
                eventDate = evData.containsKey("date") ? (String) evData.get("date") : 
                            evData.containsKey("event_date") ? (String) evData.get("event_date") : null;
                eventVenue = evData.containsKey("venue_name") ? (String) evData.get("venue_name") : eventVenue;
            }
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("claim_token", claimToken);
        response.put("transfer_id", transfer.getId());
        response.put("sender_name", senderName);
        response.put("recipient_email", transfer.getRecipientEmail());
        response.put("event_name", eventName);
        response.put("event_date", eventDate);
        response.put("venue", eventVenue);
        response.put("section_name", ticket.getSectionName() != null ? ticket.getSectionName() : "General");
        response.put("expires_at", transfer.getExpiresAt().format(DateTimeFormatter.ISO_DATE_TIME));
        return response;
    }

    /**
     * Consulta transferencias entrantes pendientes del usuario logueado.
     */
    public List<Map<String, Object>> getIncomingTransfers(Long userId, String userEmail) {
        List<TicketTransfer> list = ticketTransferRepository.findIncomingTransfers(
                userId, userEmail, List.of("PENDING_ACCEPTANCE", "PENDING_REGISTRATION"));

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (TicketTransfer trf : list) {
            // Verificar expiración perezosa
            if (now.isAfter(trf.getExpiresAt())) {
                trf.setStatus("EXPIRED");
                ticketTransferRepository.save(trf);
                ticketRepository.findById(trf.getTicketIdOriginal()).ifPresent(t -> {
                    if ("transfer_pending".equals(t.getStatus())) {
                        t.setStatus("active");
                        ticketRepository.save(t);
                    }
                });
                continue;
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", trf.getId());
            item.put("claim_token", trf.getClaimToken());
            item.put("sender_email", trf.getSenderEmail());
            item.put("status", trf.getStatus());
            item.put("expires_at", trf.getExpiresAt().format(DateTimeFormatter.ISO_DATE_TIME));
            item.put("created_at", trf.getCreatedAt() != null ? trf.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);

            ticketRepository.findById(trf.getTicketIdOriginal()).ifPresent(t -> {
                item.put("ticket_code", t.getTicketCode());
                item.put("section_name", t.getSectionName());
                item.put("event_id", t.getEventId());

                try {
                    Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + t.getEventId(), Map.class);
                    if (ev != null) {
                        item.put("event_name", ev.get("name"));
                        item.put("event_date", ev.get("date") != null ? ev.get("date") : ev.get("event_date"));
                        item.put("venue", ev.get("venue_name"));
                        item.put("image_url", ev.get("image_url"));
                    }
                } catch (Exception ignored) {}
            });

            result.add(item);
        }
        return result;
    }

    /**
     * Consulta transferencias salientes pendientes iniciadas por el usuario logueado.
     */
    public List<Map<String, Object>> getOutgoingTransfers(Long userId) {
        List<TicketTransfer> list = ticketTransferRepository.findOutgoingTransfers(
                userId, List.of("PENDING_ACCEPTANCE", "PENDING_REGISTRATION"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (TicketTransfer trf : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", trf.getId());
            item.put("ticket_id", trf.getTicketIdOriginal());
            item.put("recipient_email", trf.getRecipientEmail());
            item.put("claim_token", trf.getClaimToken());
            item.put("status", trf.getStatus());
            item.put("expires_at", trf.getExpiresAt().format(DateTimeFormatter.ISO_DATE_TIME));
            item.put("created_at", trf.getCreatedAt() != null ? trf.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);

            ticketRepository.findById(trf.getTicketIdOriginal()).ifPresent(t -> {
                item.put("ticket_code", t.getTicketCode());
                item.put("section_name", t.getSectionName());
                item.put("event_id", t.getEventId());

                try {
                    Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + t.getEventId(), Map.class);
                    if (ev != null) {
                        item.put("event_name", ev.get("name"));
                        item.put("event_date", ev.get("date") != null ? ev.get("date") : ev.get("event_date"));
                    }
                } catch (Exception ignored) {}
            });

            result.add(item);
        }
        return result;
    }

    /**
     * Consulta el historial de transferencias completo del usuario.
     */
    public List<Map<String, Object>> getTransferHistory(Long userId, String email) {
        List<TicketTransfer> list = ticketTransferRepository.findAllUserTransfers(userId, email);
        List<Map<String, Object>> result = new ArrayList<>();

        for (TicketTransfer trf : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", trf.getId());
            item.put("is_sender", trf.getSenderUserId().equals(userId));
            item.put("sender_email", trf.getSenderEmail());
            item.put("recipient_email", trf.getRecipientEmail());
            item.put("status", trf.getStatus());
            item.put("created_at", trf.getCreatedAt() != null ? trf.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
            item.put("completed_at", trf.getCompletedAt() != null ? trf.getCompletedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);

            ticketRepository.findById(trf.getTicketIdOriginal()).ifPresent(t -> {
                item.put("ticket_code_original", t.getTicketCode());
                item.put("event_id", t.getEventId());
                try {
                    Map<?, ?> ev = restTemplate.getForObject(eventServiceUrl + "/" + t.getEventId(), Map.class);
                    if (ev != null) {
                        item.put("event_name", ev.get("name"));
                    }
                } catch (Exception ignored) {}
            });

            result.add(item);
        }
        return result;
    }

    private void validateTransferIsActionable(TicketTransfer transfer) {
        if (!"PENDING_ACCEPTANCE".equals(transfer.getStatus()) && !"PENDING_REGISTRATION".equals(transfer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Esta transferencia ya fue procesada o cancelada (" + transfer.getStatus() + ")");
        }

        if (LocalDateTime.now().isAfter(transfer.getExpiresAt())) {
            transfer.setStatus("EXPIRED");
            ticketTransferRepository.save(transfer);
            ticketRepository.findById(transfer.getTicketIdOriginal()).ifPresent(t -> {
                if ("transfer_pending".equals(t.getStatus())) {
                    t.setStatus("active");
                    ticketRepository.save(t);
                }
            });
            throw new ResponseStatusException(HttpStatus.GONE, "El enlace o solicitud de transferencia ha expirado");
        }
    }

    // --- MÉTODOS LEGACY COMPATIBILIDAD CON TRANSFER_TOKENS ---
    @Transactional
    public Map<String, Object> initiateTransfer(Long userId, Long ticketId, String password) {
        // Enlazar al flujo estructurado usando el correo de usuario por defecto
        return requestTransfer(userId, "usuario@laikaclub.com", ticketId, "transferencia_rapida@laikaclub.com", password);
    }

    public Map<String, Object> getTransferInfo(String token) {
        try {
            return getClaimInfo(token);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Token de transferencia no encontrado");
        }
    }

    @Transactional
    public Map<String, Object> claimTransfer(String token, Long recipientId) {
        return claimByToken(token, recipientId, null);
    }
}
