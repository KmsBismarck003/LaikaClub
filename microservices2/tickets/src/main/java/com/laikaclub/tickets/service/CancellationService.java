package com.laikaclub.tickets.service;

import com.laikaclub.tickets.dto.CancellationDetailResponse;
import com.laikaclub.tickets.dto.CancellationQuoteResponse;

import java.util.List;

public interface CancellationService {

    /**
     * Evalúa las condiciones de cancelación y reembolso aplicables al boleto y evento,
     * calculando el importe y detallando el método de devolución sin alterar la persistencia.
     */
    CancellationQuoteResponse quoteCancellation(Long userId, Long ticketId);

    /**
     * Ejecuta la solicitud de cancelación de un boleto adquirido de forma transaccional,
     * revocando su validez para el acceso al evento y registrando la operación y su reembolso.
     */
    CancellationDetailResponse requestCancellation(Long userId, Long ticketId, String reason);

    /**
     * Obtiene el listado de solicitudes de cancelación del usuario con sus respectivos estados
     * (PENDING, APPROVED, REJECTED, REFUNDED).
     */
    List<CancellationDetailResponse> getUserCancellationRequests(Long userId);

    /**
     * Obtiene el detalle de una solicitud específica de cancelación.
     */
    CancellationDetailResponse getCancellationRequestDetail(Long userId, Long requestId);
}
