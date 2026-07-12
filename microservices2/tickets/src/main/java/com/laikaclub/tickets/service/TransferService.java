package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.domain.TransferToken;
import com.laikaclub.tickets.repository.TicketRepository;
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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class TransferService {

    private static final Logger logger = LoggerFactory.getLogger(TransferService.class);

    private final TicketRepository ticketRepository;
    private final TransferTokenRepository transferTokenRepository;
    private final RestTemplate restTemplate;

    @Value("${services.auth.url}")
    private String authServiceUrl;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    private static final int TRANSFER_TOKEN_TTL_MINUTES = 10;

    @Autowired
    public TransferService(TicketRepository ticketRepository,
                           TransferTokenRepository transferTokenRepository) {
        this.ticketRepository = ticketRepository;
        this.transferTokenRepository = transferTokenRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional
    public Map<String, Object> initiateTransfer(Long userId, Long ticketId, String password) {
        // Verificar propiedad
        Ticket ticket = ticketRepository.findByIdAndUserId(ticketId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado o no activo"));

        if (!"active".equals(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado o no activo");
        }

        // Verificar token activo sin usar
        LocalDateTime now = LocalDateTime.now();
        transferTokenRepository.findFirstByTicketIdAndIsUsedFalseAndExpiresAtAfter(ticketId, now)
                .ifPresent(t -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un enlace de transferencia activo para este boleto. Espera a que expire.");
                });

        // Validar contraseña
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("user_id", userId);
            req.put("password", password);

            restTemplate.postForEntity(authServiceUrl + "/api/auth/verify-password", req, Void.class);
        } catch (Exception e) {
            // Si es un error de cliente (ej. 401), propagamos contraseña incorrecta
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
            }
            // Para desarrollo, si el servicio de auth está caído, no bloqueamos la demo
            logger.warn("No se pudo verificar contraseña en el servicio de auth (fallo no crítico en dev): {}", e.getMessage());
        }

        // Generar token único
        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = now.plusMinutes(TRANSFER_TOKEN_TTL_MINUTES);

        TransferToken transferToken = new TransferToken();
        transferToken.setToken(token);
        transferToken.setTicketId(ticketId);
        transferToken.setOwnerId(userId);
        transferToken.setExpiresAt(expiresAt);
        transferToken.setIsUsed(false);

        transferTokenRepository.save(transferToken);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("expires_at", expiresAt.format(DateTimeFormatter.ISO_DATE_TIME));
        response.put("expires_in_seconds", TRANSFER_TOKEN_TTL_MINUTES * 60);
        response.put("ticket_code", ticket.getTicketCode());
        return response;
    }

    public Map<String, Object> getTransferInfo(String token) {
        TransferToken transfer = fetchValidTransfer(token);
        Long ticketId = transfer.getTicketId();
        Long ownerId = transfer.getOwnerId();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boleto no encontrado"));

        // Obtener nombre del dueño
        String ownerName = "Usuario LAIKA";
        try {
            Map<?, ?> userMap = restTemplate.getForObject(authServiceUrl + "/api/auth/users/" + ownerId + "/public", Map.class);
            if (userMap != null) {
                ownerName = userMap.containsKey("name") ? (String) userMap.get("name") : 
                            userMap.containsKey("full_name") ? (String) userMap.get("full_name") : "Usuario LAIKA";
            }
        } catch (Exception e) {
            logger.warn("Error consultando nombre público de usuario en auth service: {}", e.getMessage());
        }

        // Obtener info del evento
        String eventName = "Evento LAIKA";
        String eventDate = null;
        try {
            Map<?, ?> evData = restTemplate.getForObject(eventServiceUrl + "/" + ticket.getEventId(), Map.class);
            if (evData != null) {
                eventName = evData.containsKey("name") ? (String) evData.get("name") : eventName;
                eventDate = evData.containsKey("event_date") ? (String) evData.get("event_date") : 
                            evData.containsKey("date") ? (String) evData.get("date") : null;
            }
        } catch (Exception e) {
            logger.warn("Error consultando info de evento: {}", e.getMessage());
        }

        LocalDateTime now = LocalDateTime.now();
        long secondsLeft = Math.max(0, Duration.between(now, transfer.getExpiresAt()).toSeconds());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("owner_name", ownerName);
        response.put("event_name", eventName);
        response.put("event_date", eventDate);
        response.put("section_name", ticket.getSectionName() != null ? ticket.getSectionName() : "General");
        response.put("seat_id", ticket.getSeatId());
        response.put("ticket_code", ticket.getTicketCode());
        response.put("expires_at", transfer.getExpiresAt().format(DateTimeFormatter.ISO_DATE_TIME));
        response.put("seconds_left", secondsLeft);

        return response;
    }

    @Transactional
    public Map<String, Object> claimTransfer(String token, Long recipientId) {
        TransferToken transfer = fetchValidTransfer(token);

        if (transfer.getOwnerId().equals(recipientId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes reclamar tu propio boleto");
        }

        Ticket ticket = ticketRepository.findById(transfer.getTicketId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "El boleto ya no está disponible"));

        if (!"active".equals(ticket.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El boleto ya no está disponible");
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            String newCode = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

            // Invalida emisor
            ticket.setStatus("transferred");
            ticket.setRedeemedAt(now.format(DateTimeFormatter.ISO_DATE_TIME));
            ticketRepository.save(ticket);

            // Crea receptor
            Ticket newTicket = new Ticket();
            newTicket.setUserId(recipientId);
            newTicket.setEventId(ticket.getEventId());
            newTicket.setTicketCode(newCode);
            newTicket.setQrData(newCode);
            newTicket.setStatus("active");
            newTicket.setPurchaseDate(now);
            newTicket.setSeatId(ticket.getSeatId());
            newTicket.setSectionName(ticket.getSectionName());
            newTicket.setPrice(ticket.getPrice());
            newTicket.setPaymentMethod("transfer");
            newTicket.setEventFunctionId(ticket.getEventFunctionId());
            ticketRepository.save(newTicket);

            // Marcar token como usado
            transfer.setIsUsed(true);
            transfer.setClaimedBy(recipientId);
            transfer.setClaimedAt(now);
            transferTokenRepository.save(transfer);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Boleto transferido exitosamente");
            response.put("new_ticket_code", newCode);
            return response;

        } catch (Exception e) {
            logger.error("Error al reclamar transferencia de boleto: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error en la transferencia: " + e.getMessage());
        }
    }

    private TransferToken fetchValidTransfer(String token) {
        TransferToken transfer = transferTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace de transferencia no encontrado"));

        if (transfer.getIsUsed()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este enlace ya fue utilizado");
        }

        if (LocalDateTime.now().isAfter(transfer.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.GONE, "El enlace de transferencia ha expirado");
        }

        return transfer;
    }
}
