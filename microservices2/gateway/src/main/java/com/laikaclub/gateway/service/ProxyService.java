package com.laikaclub.gateway.service;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;

@Service
public class ProxyService {

    private static final Logger logger = LoggerFactory.getLogger(ProxyService.class);
    private final RestTemplate restTemplate;

    public ProxyService() {
        this.restTemplate = new RestTemplate();
        // Configure RestTemplate to NOT throw exceptions on 4xx/5xx errors,
        // so we can pass them back directly to the client.
        this.restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public void handleError(@org.springframework.lang.NonNull ClientHttpResponse response) throws IOException {
                // Pass errors through as normal responses
            }
        });
    }

    public ResponseEntity<byte[]> proxy(RouteMapper.TargetRoute route, HttpServletRequest request) {
        String method = request.getMethod();
        String targetUrl = route.getTargetUrl();
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            targetUrl += "?" + queryString;
        }

        logger.info("[GATEWAY] Proxying {} {} -> {}", method, request.getRequestURI(), targetUrl);

        try {
            // Read body
            byte[] body = StreamUtils.copyToByteArray(request.getInputStream());

            // Build headers
            HttpHeaders headers = new HttpHeaders();
            Collections.list(request.getHeaderNames()).forEach(headerName -> {
                if (!headerName.equalsIgnoreCase("host") &&
                        !headerName.equalsIgnoreCase("content-length") &&
                        !headerName.equalsIgnoreCase("connection")) {
                    headers.set(headerName, request.getHeader(headerName));
                }
            });

            HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

            // Execute request
            ResponseEntity<byte[]> response = restTemplate.exchange(
                    new URI(targetUrl),
                    HttpMethod.valueOf(java.util.Objects.requireNonNull(method)),
                    entity,
                    byte[].class
            );

            // Filter response headers to avoid content length mismatch or compression issues
            HttpHeaders respHeaders = new HttpHeaders();
            response.getHeaders().forEach((headerName, headerValues) -> {
                if (!headerName.equalsIgnoreCase("content-encoding") &&
                        !headerName.equalsIgnoreCase("transfer-encoding") &&
                        !headerName.equalsIgnoreCase("content-length") &&
                        !headerName.toLowerCase().startsWith("access-control-")) {
                    respHeaders.put(headerName, headerValues);
                }
            });

            return new ResponseEntity<>(
                    response.getBody(),
                    respHeaders,
                    response.getStatusCode()
            );

        } catch (IOException | URISyntaxException e) {
            logger.error("[GATEWAY ERROR] Error proxying request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(java.util.Objects.requireNonNull(MediaType.APPLICATION_JSON))
                    .body(String.format("{\"detail\": \"Gateway Error: %s\"}", e.getMessage()).getBytes());
        }
    }
}
