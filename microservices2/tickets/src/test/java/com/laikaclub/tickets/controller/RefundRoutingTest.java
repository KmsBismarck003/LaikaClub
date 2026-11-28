package com.laikaclub.tickets.controller;

import com.laikaclub.tickets.config.UserPrincipal;
import com.laikaclub.tickets.dto.CancellationDetailResponse;
import com.laikaclub.tickets.repository.TicketValidationLogRepository;
import com.laikaclub.tickets.service.CancellationService;
import com.laikaclub.tickets.service.ContextualValidationService;
import com.laikaclub.tickets.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class RefundRoutingTest {

    @Mock
    private TicketService ticketService;

    @Mock
    private ContextualValidationService contextualValidationService;

    @Mock
    private TicketValidationLogRepository validationLogRepository;

    @Mock
    private CancellationService cancellationService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        TicketController ticketController = new TicketController(
                ticketService,
                contextualValidationService,
                validationLogRepository,
                cancellationService
        );
        CancellationController cancellationController = new CancellationController(cancellationService);

        HandlerMethodArgumentResolver principalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                return new UserPrincipal(99L, "user@laikaclub.com", "user");
            }
        };

        this.mockMvc = MockMvcBuilders.standaloneSetup(ticketController, cancellationController)
                .setCustomArgumentResolvers(principalResolver)
                .build();
    }

    @Test
    void postRefundRequestRoutesUnambiguouslyWithSnakeCasePayload() throws Exception {
        CancellationDetailResponse response = new CancellationDetailResponse();
        response.setId(10L);
        response.setTicketId(555L);
        response.setStatus("REFUNDED");
        response.setRefundAmount(450.0);

        when(cancellationService.requestCancellation(eq(99L), eq(555L), eq("Cambio de planes - No puedo asistir")))
                .thenReturn(response);

        String payload = "{\"ticket_id\":555,\"reason\":\"Cambio de planes\",\"detail\":\"No puedo asistir\"}";

        mockMvc.perform(post("/refund/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("REFUNDED"));

        verify(cancellationService).requestCancellation(99L, 555L, "Cambio de planes - No puedo asistir");
    }

    @Test
    void postRefundsRequestRoutesWithCamelCasePayload() throws Exception {
        CancellationDetailResponse response = new CancellationDetailResponse();
        response.setId(11L);
        response.setTicketId(556L);
        response.setStatus("REFUNDED");

        when(cancellationService.requestCancellation(eq(99L), eq(556L), eq("Error en la compra")))
                .thenReturn(response);

        String payload = "{\"ticketId\":556,\"reason\":\"Error en la compra\"}";

        mockMvc.perform(post("/refunds/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11));
    }
}

