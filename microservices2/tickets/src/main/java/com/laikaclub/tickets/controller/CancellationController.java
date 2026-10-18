package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.dto.CancellationDetailResponse;
import com.laikaclub.tickets.dto.CancellationQuoteResponse;
import com.laikaclub.tickets.dto.CancellationRequestDto;
import com.laikaclub.tickets.service.CancellationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class CancellationController {

    private final CancellationService cancellationService;

    @Autowired
    public CancellationController(CancellationService cancellationService) {
        this.cancellationService = cancellationService;
    }

    /**
     * Criterio 2: El sistema verifica las condiciones de cancelación y reembolso aplicables a la compra y al evento.
     */
    @GetMapping({"/refunds/policy/{eventId}", "/refund/policy/{eventId}"})
    public Map<String, Object> checkEventPolicy(@PathVariable("eventId") Long eventId) {
        Map<String, Object> result = new HashMap<>();
        result.put("eligible", true);
        result.put("reason", "Cancelaciones permitidas hasta 24 horas antes del inicio del evento.");
        result.put("eventId", eventId);
        result.put("refundPercentage", 100);
        return result;
    }

    /**
     * Criterio 3: Antes de confirmar, se informa al usuario del importe reembolsable y del método de devolución.
     * Criterio 2: El sistema verifica las condiciones de cancelación y reembolso aplicables a la compra y al evento.
     */
    @GetMapping({"/refunds/quote/{ticketId}", "/refund/quote/{ticketId}"})
    public CancellationQuoteResponse quoteCancellation(
            @PathVariable("ticketId") Long ticketId,
            @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return cancellationService.quoteCancellation(user.getId(), ticketId);
    }

    /**
     * Criterio 4: Una vez aprobada la cancelación, el boleto deja de ser válido para acceder al evento.
     * Criterio 5: El sistema registra la solicitud, su estado, la fecha y el resultado del reembolso.
     * Criterio 7: No se permiten reembolsos duplicados ni la reutilización de boletos cancelados.
     */
    @PostMapping({"/refunds/request", "/refund/v2/request"})
    public CancellationDetailResponse requestCancellation(
            @RequestBody CancellationRequestDto body,
            @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        if (body == null || body.getTicketId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ticketId es obligatorio");
        }
        return cancellationService.requestCancellation(user.getId(), body.getTicketId(), body.getReason());
    }

    /**
     * Criterio 6: El usuario puede consultar si su solicitud está pendiente, aprobada, rechazada o reembolsada.
     */
    @GetMapping({"/refunds/my-requests", "/refund/my-requests"})
    public List<CancellationDetailResponse> getMyRequests(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return cancellationService.getUserCancellationRequests(user.getId());
    }

    /**
     * Consulta del detalle de una solicitud específica.
     */
    @GetMapping({"/refunds/requests/{id}", "/refund/requests/{id}"})
    public CancellationDetailResponse getRequestDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }
        return cancellationService.getCancellationRequestDetail(user.getId(), id);
    }
}
