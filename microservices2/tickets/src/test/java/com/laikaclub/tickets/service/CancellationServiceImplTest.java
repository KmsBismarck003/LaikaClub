package com.laikaclub.tickets.service;

import com.laikaclub.tickets.domain.CancellationRequest;
import com.laikaclub.tickets.domain.Payment;
import com.laikaclub.tickets.domain.Ticket;
import com.laikaclub.tickets.dto.CancellationDetailResponse;
import com.laikaclub.tickets.dto.CancellationQuoteResponse;
import com.laikaclub.tickets.repository.CancellationRequestRepository;
import com.laikaclub.tickets.repository.PaymentRepository;
import com.laikaclub.tickets.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CancellationServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private CancellationRequestRepository cancellationRequestRepository;

    @InjectMocks
    private CancellationServiceImpl cancellationService;

    private Ticket activeTicket;

    @BeforeEach
    void setUp() {
        activeTicket = new Ticket();
        activeTicket.setId(100L);
        activeTicket.setUserId(1L);
        activeTicket.setEventId(50L);
        activeTicket.setTicketCode("TKT-TEST1234");
        activeTicket.setPrice(350.0);
        activeTicket.setStatus("active");
        activeTicket.setPaymentMethod("card");
        activeTicket.setSectionName("Preferente");
        activeTicket.setSeatId("A-12");
        activeTicket.setPurchaseDate(LocalDateTime.now().minusDays(2));
    }

    @Test
    @DisplayName("Cotización de boleto activo sin restricciones debe ser elegible")
    void testQuoteCancellation_Eligible() {
        when(ticketRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(activeTicket));
        when(cancellationRequestRepository.existsByTicketIdAndStatusIn(eq(100L), anyList())).thenReturn(false);

        CancellationQuoteResponse quote = cancellationService.quoteCancellation(1L, 100L);

        assertNotNull(quote);
        assertTrue(quote.isEligible());
        assertEquals(350.0, quote.getOriginalPrice());
        assertEquals(350.0, quote.getRefundAmount());
        assertEquals(0.0, quote.getPenaltyFee());
        assertNull(quote.getRejectionReason());
        assertNotNull(quote.getEstimatedDays());
    }

    @Test
    @DisplayName("Cotización de boleto ya usado o canjeado debe ser rechazada")
    void testQuoteCancellation_UsedTicket_Rejected() {
        activeTicket.setStatus("used");
        when(ticketRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(activeTicket));

        CancellationQuoteResponse quote = cancellationService.quoteCancellation(1L, 100L);

        assertNotNull(quote);
        assertFalse(quote.isEligible());
        assertEquals(0.0, quote.getRefundAmount());
        assertTrue(quote.getRejectionReason().contains("utilizado") || quote.getRejectionReason().contains("canjeado"));
    }

    @Test
    @DisplayName("Cotización con solicitud previa activa debe ser rechazada (anti-duplicados)")
    void testQuoteCancellation_ExistingRequest_Rejected() {
        when(ticketRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(activeTicket));
        when(cancellationRequestRepository.existsByTicketIdAndStatusIn(eq(100L), anyList())).thenReturn(true);

        CancellationQuoteResponse quote = cancellationService.quoteCancellation(1L, 100L);

        assertNotNull(quote);
        assertFalse(quote.isEligible());
        assertTrue(quote.getRejectionReason().contains("Ya existe una solicitud"));
    }

    @Test
    @DisplayName("Ejecución de cancelación exitosa: revoca acceso al boleto y genera reembolso")
    void testRequestCancellation_Success() {
        when(ticketRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(activeTicket));
        when(cancellationRequestRepository.existsByTicketIdAndStatusIn(eq(100L), anyList())).thenReturn(false);

        CancellationRequest savedReq = new CancellationRequest();
        savedReq.setId(500L);
        savedReq.setTicketId(100L);
        savedReq.setUserId(1L);
        savedReq.setEventId(50L);
        savedReq.setTicketCode("TKT-TEST1234");
        savedReq.setOriginalPrice(350.0);
        savedReq.setRefundAmount(350.0);
        savedReq.setStatus("REFUNDED");
        savedReq.setCreatedAt(LocalDateTime.now());
        savedReq.setRefundedAt(LocalDateTime.now());

        when(cancellationRequestRepository.save(any(CancellationRequest.class))).thenReturn(savedReq);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(activeTicket);
        when(paymentRepository.save(any(Payment.class))).thenReturn(new Payment());

        CancellationDetailResponse result = cancellationService.requestCancellation(1L, 100L, "Motivo personal");

        assertNotNull(result);
        assertEquals(500L, result.getId());
        assertEquals("REFUNDED", result.getStatus());
        assertEquals("cancelled", activeTicket.getStatus()); // Criterio 4: Boleto deja de ser válido

        verify(ticketRepository).save(argThat(t -> "cancelled".equals(t.getStatus())));
        verify(paymentRepository).save(argThat(p -> p.getAmount() < 0)); // Reembolso contable
        verify(cancellationRequestRepository).save(any(CancellationRequest.class));
    }

    @Test
    @DisplayName("Ejecución de cancelación rechazada si el boleto no existe o pertenece a otro usuario")
    void testRequestCancellation_TicketNotFound() {
        when(ticketRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            cancellationService.requestCancellation(1L, 999L, "Motivo");
        });
    }
}
