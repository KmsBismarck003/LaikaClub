package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/transfer")
public class TransferController {

    private final TransferService transferService;

    @Autowired
    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

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
