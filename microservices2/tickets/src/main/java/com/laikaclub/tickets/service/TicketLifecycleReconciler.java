package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

/**
 * Reconciliador de vigencia temporal de boletos (SRP).
 * Garantiza que un boleto marcado como "unutilized" se rehabilite automáticamente a "active"
 * si el evento sigue vigente, fue reprogramado o extendió su duración, sin tocar jamás
 * estados terminales reales (used, cancelled, refunded, transferred, pending_claim).
 */
@Component
public class TicketLifecycleReconciler implements TicketLifecyclePolicy {

    private static final Set<String> TERMINAL_STATUSES = Set.of(
            "used",
            "redeemed",
            "cancelled",
            "refunded",
            "transferred",
            "pending_claim"
    );

    private static final Set<String> ACTIVE_LIKE_STATUSES = Set.of(
            "active",
            "confirmed"
    );

    private final TicketRepository ticketRepository;

    @Autowired
    public TicketLifecycleReconciler(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public ReconciliationResult reconcile(Ticket ticket, EventAccessWindowEvaluator.WindowEvaluation window) {
        if (ticket == null) {
            return new ReconciliationResult(ReconciliationAction.UNCHANGED, null, null);
        }

        String rawStatus = ticket.getStatus();
        String normalizedStatus = rawStatus != null ? rawStatus.trim().toLowerCase(Locale.ROOT) : "active";

        if (isTerminalStatus(normalizedStatus) || window == null
                || window.getState() == EventAccessWindowEvaluator.WindowState.UNKNOWN) {
            return new ReconciliationResult(ReconciliationAction.UNCHANGED, normalizedStatus, normalizedStatus);
        }

        EventAccessWindowEvaluator.WindowState state = window.getState();

        if ("unutilized".equals(normalizedStatus)
                && (state == EventAccessWindowEvaluator.WindowState.OPEN
                || state == EventAccessWindowEvaluator.WindowState.EARLY_ACCESS
                || state == EventAccessWindowEvaluator.WindowState.FUTURE_DAY)) {
            ticket.setStatus("active");
            ticketRepository.save(ticket);
            return new ReconciliationResult(ReconciliationAction.RESTORED_TO_ACTIVE, normalizedStatus, "active");
        }

        if (ACTIVE_LIKE_STATUSES.contains(normalizedStatus)
                && state == EventAccessWindowEvaluator.WindowState.CONCLUDED) {
            ticket.setStatus("unutilized");
            ticketRepository.save(ticket);
            return new ReconciliationResult(ReconciliationAction.MARKED_UNUTILIZED, normalizedStatus, "unutilized");
        }

        return new ReconciliationResult(ReconciliationAction.UNCHANGED, normalizedStatus, normalizedStatus);
    }

    @Override
    public boolean isTerminalStatus(String status) {
        if (status == null) {
            return false;
        }
        return TERMINAL_STATUSES.contains(status.trim().toLowerCase(Locale.ROOT));
    }
}

