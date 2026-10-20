package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.domain.CourtesyQuota;
import com.laikaclub.tickets.dto.ClaimCourtesyRequest;
import com.laikaclub.tickets.dto.CourtesyQuotaRequest;
import com.laikaclub.tickets.dto.CourtesySummaryResponse;
import com.laikaclub.tickets.dto.IssueCourtesyRequest;
import com.laikaclub.tickets.service.CourtesyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courtesy")
public class CourtesyController {

    private final CourtesyService courtesyService;

    @Autowired
    public CourtesyController(CourtesyService courtesyService) {
        this.courtesyService = courtesyService;
    }

    /**
     * Emite boletos de cortesía (Directo a correo o Lote de códigos de canje).
     */
    @PostMapping("/issue")
    public Map<String, Object> issueCourtesy(@RequestBody IssueCourtesyRequest request,
                                             @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return courtesyService.issueCourtesy(user.getId(), user.getEmail(), user.getRole(), request);
    }

    /**
     * Canjea un código de cortesía en el Centro de Canje por el usuario autenticado.
     */
    @PostMapping("/claim")
    public Map<String, Object> claimCourtesy(@RequestBody ClaimCourtesyRequest request,
                                             @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para canjear tu boleto de cortesía");
        }
        return courtesyService.claimCourtesy(request.getClaimToken(), user.getId(), user.getEmail(), null);
    }

    /**
     * Previsualiza y valida un código de cortesía antes de su canje (Acceso público).
     */
    @GetMapping("/validate-token/{token}")
    public Map<String, Object> validateToken(@PathVariable("token") String token) {
        return courtesyService.validateClaimToken(token);
    }

    /**
     * Obtiene el dashboard y auditoría de cortesías de un evento (Gestor / Admin).
     */
    @GetMapping("/event/{eventId}")
    public CourtesySummaryResponse getEventCourtesyDashboard(@PathVariable("eventId") Long eventId,
                                                             @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return courtesyService.getCourtesyDashboard(eventId, user.getId(), user.getRole());
    }

    /**
     * Consulta las cuotas asignadas al gestor autenticado.
     */
    @GetMapping("/my-quotas")
    public List<CourtesyQuota> getMyQuotas(@RequestParam(value = "eventId", required = false) Long eventId,
                                           @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return courtesyService.getManagerQuotas(user.getId(), eventId);
    }

    /**
     * Asigna o actualiza la cuota de un gestor (Solo Administrador).
     */
    @PostMapping("/quota")
    public CourtesyQuota setManagerQuota(@RequestBody CourtesyQuotaRequest request,
                                         @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return courtesyService.setManagerQuota(request, user.getId(), user.getRole());
    }

    /**
     * Revoca un boleto de cortesía emitido previamente.
     */
    @PostMapping("/{ticketId}/revoke")
    public Map<String, Object> revokeCourtesy(@PathVariable("ticketId") Long ticketId,
                                              @RequestBody(required = false) Map<String, Object> body,
                                              @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        String reason = (body != null && body.containsKey("reason")) ? (String) body.get("reason") : "Cancelado por el gestor";
        return courtesyService.revokeCourtesy(ticketId, user.getId(), user.getRole(), reason);
    }
}
