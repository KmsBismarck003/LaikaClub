package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.dto.TicketPurchase;
import com.laikaclub.tickets.dto.TicketVerify;
import com.laikaclub.tickets.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> resp = new HashMap<>();
        resp.put("status", "alive");
        resp.put("service", "ticket-service");
        return resp;
    }

    @GetMapping("/my-tickets")
    public List<Map<String, Object>> myTickets(@AuthenticationPrincipal UserPrincipal user) {
        return ticketService.getUserTickets(user.getId());
    }

    @PostMapping("/verify")
    public Ticket verifyTicket(@RequestBody TicketVerify data) {
        return ticketService.verifyTicket(data.getTicketCode());
    }

    @PostMapping("/redeem")
    public Map<String, Object> redeemTicket(@RequestBody TicketVerify data) {
        return ticketService.redeemTicket(data.getTicketCode());
    }

    @GetMapping("/busy-seats/{event_id}")
    public List<String> busySeats(@PathVariable("event_id") Long eventId,
                                  @RequestParam(value = "function_id", required = false) Long functionId) {
        return ticketService.getBusySeats(eventId, functionId);
    }

    @PostMapping("/purchase")
    public List<Map<String, Object>> purchase(@RequestBody TicketPurchase data,
                                              @AuthenticationPrincipal UserPrincipal user) {
        return ticketService.purchaseTickets(user.getId(), data.getItems(), data.getPaymentMethod());
    }

    @PostMapping("/payments/create-intent")
    public Map<String, Object> createPaymentIntent(@RequestBody Map<String, Object> body,
                                                   @AuthenticationPrincipal UserPrincipal user) {
        if (!body.containsKey("amount") || body.get("amount") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount es requerido");
        }
        Double amount = ((Number) body.get("amount")).doubleValue();
        Long eventId = body.containsKey("event_id") && body.get("event_id") != null ? 
                       ((Number) body.get("event_id")).longValue() : null;
        String method = (String) body.getOrDefault("method", "card");

        return ticketService.createPaymentIntent(user.getId(), amount, eventId, method);
    }

    @PostMapping("/payments/{reference}/confirm")
    public Map<String, Object> confirmPayment(@PathVariable("reference") String reference) {
        return ticketService.confirmPayment(reference);
    }

    @PostMapping("/refund")
    public Map<String, Object> refund(@RequestBody Map<String, Object> body,
                                      @AuthenticationPrincipal UserPrincipal user) {
        Number tId = (Number) body.get("ticket_id");
        if (tId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ticket_id requerido");
        }
        return ticketService.processRefund(user.getId(), tId.longValue());
    }

    @GetMapping("/refund/my-refunds")
    public List<Map<String, Object>> getMyRefunds(@AuthenticationPrincipal UserPrincipal user) {
        return ticketService.getUserRefunds(user.getId());
    }

    @PostMapping("/refund/request")
    public Map<String, Object> requestRefund(@RequestBody Map<String, Object> body,
                                             @AuthenticationPrincipal UserPrincipal user) {
        Number tId = (Number) body.get("ticket_id");
        if (tId == null) {
            tId = (Number) body.get("ticketId");
        }
        if (tId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ticket_id requerido");
        }
        return ticketService.processRefund(user.getId(), tId.longValue());
    }

    @PostMapping("/lucky-seat/assign")
    public Map<String, Object> assignLuckySeat(@RequestBody Map<String, Object> body,
                                               @AuthenticationPrincipal UserPrincipal user) {
        Number eventIdNum = (Number) body.get("event_id");
        if (eventIdNum == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event_id es requerido");
        }
        return ticketService.assignLuckySeat(user.getId(), eventIdNum.longValue());
    }

    @PostMapping("/free")
    public Map<String, Object> claimFreeTicket(@RequestBody Map<String, Object> body,
                                               @AuthenticationPrincipal UserPrincipal user) {
        Number eventIdNum = (Number) body.get("eventId");
        if (eventIdNum == null) {
            eventIdNum = (Number) body.get("event_id");
        }
        if (eventIdNum == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "event_id requerido");
        }

        String sectionName = (String) body.get("sectionName");
        if (sectionName == null) {
            sectionName = (String) body.get("section_name");
        }

        String sectionId = body.containsKey("sectionId") && body.get("sectionId") != null ? body.get("sectionId").toString() :
                           body.containsKey("section_id") && body.get("section_id") != null ? body.get("section_id").toString() : null;

        Number functionIdNum = (Number) body.get("functionId");
        if (functionIdNum == null) {
            functionIdNum = (Number) body.get("function_id");
        }
        Long functionId = functionIdNum != null ? functionIdNum.longValue() : null;

        String seatId = body.containsKey("seatId") && body.get("seatId") != null ? body.get("seatId").toString() :
                        body.containsKey("seat_id") && body.get("seat_id") != null ? body.get("seat_id").toString() : null;

        List<Map<String, Object>> result = ticketService.claimFreeTicket(user.getId(), eventIdNum.longValue(), sectionName, sectionId, functionId, seatId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Entrada gratuita registrada");
        response.put("tickets", result);
        return response;
    }

    @GetMapping("/internal/purchases")
    public List<Map<String, Object>> getInternalPurchases() {
        return ticketService.getInternalPurchases();
    }

    @GetMapping("/internal/purchases/{user_id}")
    public Map<String, Object> getInternalPurchasesByUser(@PathVariable("user_id") Long userId) {
        return ticketService.getInternalPurchasesByUserId(userId);
    }
}
