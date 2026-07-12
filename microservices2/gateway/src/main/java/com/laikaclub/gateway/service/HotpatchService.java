package com.laikaclub.gateway.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class HotpatchService {

    private static final Logger logger = LoggerFactory.getLogger(HotpatchService.class);

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResponseEntity<byte[]> getPublicAds() throws Exception {
        if (jdbcTemplate == null) {
            throw new IllegalStateException("JdbcTemplate is not configured (MySQL is down)");
        }

        logger.info("[GATEWAY HOTPATCH] Fetching active ads from MySQL...");
        String query = "SELECT a.id, a.title, a.image_url, a.link_url, a.position, a.active, a.event_id " +
                "FROM ads a " +
                "LEFT JOIN events e ON a.event_id = e.id " +
                "WHERE a.active = 1 " +
                "  AND (a.event_id IS NULL OR (e.status = 'published' AND e.ads_enabled = 1)) " +
                "ORDER BY a.id DESC";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(query);

        logger.info("[GATEWAY HOTPATCH DEBUG] Fetched {} rows from MySQL", rows.size());

        // Process and convert 'active' field to boolean
        for (Map<String, Object> row : rows) {
            Object activeVal = row.get("active");
            if (activeVal instanceof Number) {
                row.put("active", ((Number) activeVal).intValue() == 1);
            } else if (activeVal instanceof Boolean) {
                row.put("active", activeVal);
            } else {
                row.put("active", false);
            }
        }

        byte[] jsonBytes = objectMapper.writeValueAsBytes(rows);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        return new ResponseEntity<>(jsonBytes, headers, HttpStatus.OK);
    }
}
