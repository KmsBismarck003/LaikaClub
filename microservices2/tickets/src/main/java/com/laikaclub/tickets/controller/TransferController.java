package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transfer")
public class TransferController {

    private final TransferService transferService;

    @Autowired
    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    /**
     * Inicia una solicitud de transferencia dirigida por correo electrónico.
     */
    @PostMapping("/request")
    public Map<String, Object> requestTransfer(@RequestBody Map<String, Object> body,
                                               @AuthenticationPrincipal UserPrincipal user) {
        Number ticketIdNum = (Number) body.get("ticket_id");
        if (ticketIdNum == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ticket_id requerido");
        }
        String recipientEmail = (String) body.get("recipient_email");
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "recipient_email requerido");
        }
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        String password = (String) body.get("password");
        if (password == null || password.trim().isEmpty()) {
            password = (String) body.get("password_confirm");
        }
        if (password == null) {
            password = "";
        }

        return transferService.requestTransfer(
                user.getId(),
                user.getEmail(),
                ticketIdNum.longValue(),
                recipientEmail,
                password
        );
    }

    /**
     * Acepta una transferencia entrante.
     */
    @PostMapping("/{transferId}/accept")
    public Map<String, Object> acceptTransfer(@PathVariable("transferId") Long transferId,
                                              @AuthenticationPrincipal UserPrincipal user) {
        return transferService.acceptTransfer(transferId, user.getId(), user.getEmail());
    }

    /**
     * Rechaza una transferencia entrante.
     */
    @PostMapping("/{transferId}/reject")
    public Map<String, Object> rejectTransfer(@PathVariable("transferId") Long transferId,
                                              @AuthenticationPrincipal UserPrincipal user) {
        return transferService.rejectTransfer(transferId, user.getId(), user.getEmail());
    }

    /**
     * Cancela una transferencia saliente (por el remitente).
     */
    @PostMapping("/{transferId}/cancel")
    public Map<String, Object> cancelTransfer(@PathVariable("transferId") Long transferId,
                                              @AuthenticationPrincipal UserPrincipal user) {
        return transferService.cancelTransfer(transferId, user.getId());
    }

    /**
     * Reclama un boleto vía claim_token (para usuarios que recién se registraron).
     */
    @PostMapping("/claim/{claimToken}")
    public Map<String, Object> claimByToken(@PathVariable("claimToken") String claimToken,
                                            @AuthenticationPrincipal UserPrincipal user) {
        return transferService.claimByToken(claimToken, user.getId(), user.getEmail());
    }

    /**
     * Obtiene información pública del boleto a reclamar (para vista previa en el registro).
     */
    @GetMapping("/claim-info/{claimToken}")
    public Map<String, Object> getClaimInfo(@PathVariable("claimToken") String claimToken) {
        return transferService.getClaimInfo(claimToken);
    }

    /**
     * Lista las transferencias entrantes pendientes de aceptar.
     */
    @GetMapping("/incoming")
    public List<Map<String, Object>> getIncomingTransfers(@AuthenticationPrincipal UserPrincipal user) {
        return transferService.getIncomingTransfers(user.getId(), user.getEmail());
    }

    /**
     * Lista las transferencias salientes pendientes de que el destinatario acepte o se registre.
     */
    @GetMapping("/outgoing")
    public List<Map<String, Object>> getOutgoingTransfers(@AuthenticationPrincipal UserPrincipal user) {
        return transferService.getOutgoingTransfers(user.getId());
    }

    /**
     * Historial de transferencias completas del usuario.
     */
    @GetMapping("/history")
    public List<Map<String, Object>> getTransferHistory(@AuthenticationPrincipal UserPrincipal user) {
        return transferService.getTransferHistory(user.getId(), user.getEmail());
    }

    // --- ENDPOINTS LEGACY DE RETROCOMPATIBILIDAD ---
    @PostMapping("/initiate")
    public Map<String, Object> initiateTransfer(@RequestBody Map<String, Object> body,
                                                @AuthenticationPrincipal UserPrincipal user) {
        Number ticketIdNum = (Number) body.get("ticket_id");
        if (ticketIdNum == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ticket_id requerido");
        }
        String password = (String) body.getOrDefault("password", "");
        return transferService.initiateTransfer(user.getId(), ticketIdNum.longValue(), password);
    }

    @GetMapping("/{token}")
    public Map<String, Object> getTransferInfo(@PathVariable("token") String token) {
        return transferService.getTransferInfo(token);
    }

    @PostMapping("/{token}/claim")
    public Map<String, Object> claimTransfer(@PathVariable("token") String token,
                                             @AuthenticationPrincipal UserPrincipal user) {
        return transferService.claimTransfer(token, user.getId());
    }
}
