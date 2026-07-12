package com.laikaclub.gateway.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RouteMapper {

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

    public static class TargetRoute {
        private final String targetUrl;
        private final boolean cacheable;

        public TargetRoute(String targetUrl, boolean cacheable) {
            this.targetUrl = targetUrl;
            this.cacheable = cacheable;
        }

        public String getTargetUrl() {
            return targetUrl;
        }

        public boolean isCacheable() {
            return cacheable;
        }
    }

    public TargetRoute map(String path) {
        String targetUrl = null;
        boolean cacheable = false;

        if (path.startsWith("/api/auth")) {
            targetUrl = authUrl + path.substring("/api/auth".length());
        } else if (path.startsWith("/api/events")) {
            targetUrl = eventsUrl + path.substring("/api/events".length());
            if (path.contains("/public")) {
                cacheable = true;
            }
        } else if (path.startsWith("/api/venues")) {
            targetUrl = eventsUrl + "/venues" + path.substring("/api/venues".length());
        } else if (path.startsWith("/api/manager")) {
            targetUrl = eventsUrl + "/manager" + path.substring("/api/manager".length());
        } else if (path.startsWith("/api/tickets")) {
            targetUrl = ticketsUrl + path.substring("/api/tickets".length());
        } else if (path.startsWith("/api/payments")) {
            targetUrl = ticketsUrl + "/payments" + path.substring("/api/payments".length());
        } else if (path.startsWith("/api/refunds")) {
            targetUrl = ticketsUrl + "/refund" + path.substring("/api/refunds".length());
        } else if (path.startsWith("/api/stats")) {
            targetUrl = statsUrl + path.substring("/api/stats".length());
        } else if (path.startsWith("/api/merchandise")) {
            targetUrl = merchandiseUrl + path.substring("/api/merchandise".length());
        } else if (path.startsWith("/api/monitoring")) {
            targetUrl = statsUrl + path.substring("/api/monitoring".length());
        } else if (path.startsWith("/api/database")) {
            targetUrl = adminUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/ads")) {
            targetUrl = adminUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/config")) {
            targetUrl = adminUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/admin/uploads")) {
            targetUrl = adminUrl + path.substring("/api/admin".length());
        } else if (path.startsWith("/api/uploads")) {
            targetUrl = adminUrl + path.substring("/api".length());
        } else if (path.startsWith("/uploads")) {
            targetUrl = adminUrl + path;
        } else if (path.startsWith("/api/admin/users")) {
            targetUrl = authUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/users")) {
            targetUrl = authUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/admin")) {
            targetUrl = adminUrl + path.substring("/api".length());
        } else if (path.startsWith("/api/achievements")) {
            targetUrl = achievementsUrl + path.substring("/api/achievements".length());
        } else if (path.startsWith("/api/analytics")) {
            targetUrl = analyticsUrl + path;
        }

        if (targetUrl != null) {
            return new TargetRoute(targetUrl, cacheable);
        }
        return null;
    }
}
