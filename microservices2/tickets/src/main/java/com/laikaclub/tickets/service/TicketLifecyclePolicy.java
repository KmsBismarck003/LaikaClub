package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.Ticket;

/**
 * Contrato de política de ciclo de vida temporal para boletos (DIP / ISP).
 * Define cómo reconciliar el estado persistido de un boleto frente a la ventana real del evento,
 * protegiendo estados terminales inmutables (used, cancelled, refunded, transferred, pending_claim).
 */
public interface TicketLifecyclePolicy {

    enum ReconciliationAction {
        UNCHANGED,
        RESTORED_TO_ACTIVE,
        MARKED_UNUTILIZED
    }

    final class ReconciliationResult {
        private final ReconciliationAction action;
        private final String previousStatus;
        private final String currentStatus;

        public ReconciliationResult(ReconciliationAction action, String previousStatus, String currentStatus) {
            this.action = action;
            this.previousStatus = previousStatus;
            this.currentStatus = currentStatus;
        }

        public ReconciliationAction getAction() {
            return action;
        }

        public String getPreviousStatus() {
            return previousStatus;
        }

        public String getCurrentStatus() {
            return currentStatus;
        }

        public boolean wasRestoredToActive() {
            return action == ReconciliationAction.RESTORED_TO_ACTIVE;
        }

        public boolean wasMarkedUnutilized() {
            return action == ReconciliationAction.MARKED_UNUTILIZED;
        }
    }

    ReconciliationResult reconcile(Ticket ticket, EventAccessWindowEvaluator.WindowEvaluation window);

    boolean isTerminalStatus(String status);
}

