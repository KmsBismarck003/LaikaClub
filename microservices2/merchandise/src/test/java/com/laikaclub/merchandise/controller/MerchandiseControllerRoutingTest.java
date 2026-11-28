package com.laikaclub.merchandise.controller;

import com.laikaclub.merchandise.domain.MerchandiseOrder;
import com.laikaclub.merchandise.service.MerchandiseService;
import com.laikaclub.merchandise.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MerchandiseControllerRoutingTest {

    @Mock
    private MerchandiseService merchandiseService;

    @Mock
    private TokenService tokenService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MerchandiseController controller = new MerchandiseController(merchandiseService, tokenService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void createOrderAcceptsPathWithoutTrailingSlash() throws Exception {
        MerchandiseOrder order = new MerchandiseOrder();
        order.setId(42L);
        order.setUserId(7L);
        order.setTotalAmount(new BigDecimal("350.00"));
        order.setStatus("completed");
        order.setPaymentMethod("card");

        when(merchandiseService.createOrder(any())).thenReturn(order);

        String payload = "{\"user_id\":7,\"payment_method\":\"card\",\"items\":[{\"variant_id\":206,\"quantity\":1}]}";

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.status").value("completed"));
    }

    @Test
    void createOrderAcceptsPathWithTrailingSlash() throws Exception {
        MerchandiseOrder order = new MerchandiseOrder();
        order.setId(43L);
        order.setUserId(7L);
        order.setTotalAmount(new BigDecimal("350.00"));
        order.setStatus("completed");
        order.setPaymentMethod("card");

        when(merchandiseService.createOrder(any())).thenReturn(order);

        String payload = "{\"user_id\":7,\"payment_method\":\"card\",\"items\":[{\"variant_id\":206,\"quantity\":1}]}";

        mockMvc.perform(post("/orders/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(43));
    }
}

