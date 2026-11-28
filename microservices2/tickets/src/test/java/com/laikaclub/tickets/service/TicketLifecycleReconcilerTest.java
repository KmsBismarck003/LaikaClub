package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TicketLifecycleReconcilerTest {

    private TicketRepository ticketRepository;
    private TicketLifecycleReconciler reconciler;

    @BeforeEach
    void setUp() {
        ticketRepository = mock(TicketRepository.class);
        reconciler = new TicketLifecycleReconciler(ticketRepository);
    }

    private EventAccessWindowEvaluator.WindowEvaluation evalOf(EventAccessWindowEvaluator.WindowState state) {
        LocalDateTime now = LocalDateTime.of(2026, 11, 27, 17, 30);
        return new EventAccessWindowEvaluator.WindowEvaluation(state, now, now.minusHours(2), now.plusHours(4), 0L, 0L);
    }

    @Test
    void restoresUnutilizedTicketWhenEventIsOpenOrEarlyOrFuture() {
        for (EventAccessWindowEvaluator.WindowState state : List.of(
                EventAccessWindowEvaluator.WindowState.OPEN,
                EventAccessWindowEvaluator.WindowState.EARLY_ACCESS,
                EventAccessWindowEvaluator.WindowState.FUTURE_DAY)) {
            Ticket ticket = new Ticket();
            ticket.setStatus("unutilized");

            TicketLifecyclePolicy.ReconciliationResult result = reconciler.reconcile(ticket, evalOf(state));
            assertTrue(result.wasRestoredToActive());
            assertEquals("active", ticket.getStatus());
        }
        verify(ticketRepository, times(3)).save(any(Ticket.class));
    }

    @Test
    void marksActiveTicketUnutilizedWhenEventConcluded() {
        Ticket ticket = new Ticket();
        ticket.setStatus("active");

        TicketLifecyclePolicy.ReconciliationResult result = reconciler.reconcile(
                ticket, evalOf(EventAccessWindowEvaluator.WindowState.CONCLUDED));

        assertTrue(result.wasMarkedUnutilized());
        assertEquals("unutilized", ticket.getStatus());
        verify(ticketRepository, times(1)).save(ticket);
    }

    @Test
    void neverMutatesTicketWhenWindowIsUnknown() {
        Ticket ticket = new Ticket();
        ticket.setStatus("unutilized");

        TicketLifecyclePolicy.ReconciliationResult result = reconciler.reconcile(
                ticket, evalOf(EventAccessWindowEvaluator.WindowState.UNKNOWN));

        assertEquals(TicketLifecyclePolicy.ReconciliationAction.UNCHANGED, result.getAction());
        assertEquals("unutilized", ticket.getStatus());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void neverRestoresTerminalStatuses() {
        for (String terminal : List.of("used", "redeemed", "cancelled", "refunded", "transferred", "pending_claim")) {
            Ticket ticket = new Ticket();
            ticket.setStatus(terminal);

            TicketLifecyclePolicy.ReconciliationResult result = reconciler.reconcile(
                    ticket, evalOf(EventAccessWindowEvaluator.WindowState.OPEN));

            assertEquals(TicketLifecyclePolicy.ReconciliationAction.UNCHANGED, result.getAction());
            assertEquals(terminal, ticket.getStatus());
        }
        verify(ticketRepository, never()).save(any());
    }
}

