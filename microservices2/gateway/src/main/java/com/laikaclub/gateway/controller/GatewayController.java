package com.laikaclub.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import com.laikaclub.gateway.service.CacheService;
import com.laikaclub.gateway.service.HotpatchService;
import com.laikaclub.gateway.service.ProxyService;
import com.laikaclub.gateway.service.RouteMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class GatewayController {

    private static final Logger logger = LoggerFactory.getLogger(GatewayController.class);

    @Autowired
    private RouteMapper routeMapper;

    @Autowired
    private ProxyService proxyService;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private HotpatchService hotpatchService;

    @Value("${services.auth}")
    private String authUrl;

    @Value("${services.events}")
    private String eventsUrl;

    @Value("${services.tickets}")
    private String ticketsUrl;

    @Value("${services.stats}")
    private String statsUrl;

    @Value("${services.admin}")
    private String adminUrl;

    @Value("${services.achievements}")
    private String achievementsUrl;

    @Value("${services.analytics}")
    private String analyticsUrl;

    @Value("${services.merchandise}")
    private String merchandiseUrl;

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> services = new HashMap<>();
        services.put("auth", authUrl);
        services.put("events", eventsUrl);
        services.put("tickets", ticketsUrl);
        services.put("stats", statsUrl);
        services.put("admin", adminUrl);
        services.put("achievements", achievementsUrl);
        services.put("analytics", analyticsUrl);
        services.put("merchandise", merchandiseUrl);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Laika API Gateway Active");
        response.put("debug_check", "v2");
        response.put("routing_to", services);

        return ResponseEntity.ok(response);
    }

    @RequestMapping("/**")
    public ResponseEntity<byte[]> handleRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Hotpatch intercept for public ads
        if (path.equals("/api/ads/public") && method.equalsIgnoreCase("GET")) {
            try {
                return hotpatchService.getPublicAds();
            } catch (Exception e) {
                logger.warn("[GATEWAY HOTPATCH] MySQL query failed. Falling back to Admin Service proxy: {}", e.getMessage());
                // Fallthrough to standard proxy logic
            }
        }

        // 2. Resolve target route
        RouteMapper.TargetRoute route = routeMapper.map(path);
        if (route == null) {
            logger.warn("[GATEWAY] Route not found: {}", path);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"detail\": \"Not Found\"}".getBytes());
        }

        // 3. Construct full url for cache checking
        String fullUrl = route.getTargetUrl();
        String queryString = request.getQueryString();
        if (queryString != null && !queryString.isEmpty()) {
            fullUrl += "?" + queryString;
        }

        // 4. Cache read for public GET requests
        if (method.equalsIgnoreCase("GET") && route.isCacheable()) {
            ResponseEntity<byte[]> cachedResponse = cacheService.get(fullUrl);
            if (cachedResponse != null) {
                return cachedResponse;
            }
        }

        // 5. Forward request
        ResponseEntity<byte[]> response = proxyService.proxy(route, request);

        // 6. Cache write for successful GET responses
        if (method.equalsIgnoreCase("GET") && route.isCacheable() && response.getStatusCode() == HttpStatus.OK) {
            cacheService.put(fullUrl, response);
        }

        return response;
    }
}
