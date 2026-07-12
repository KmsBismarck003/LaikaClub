package com.laikaclub.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.admin.domain.SystemConfig;
import com.laikaclub.admin.repository.SystemConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class ConfigService {

    private static final Logger logger = LoggerFactory.getLogger(ConfigService.class);

    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ConfigService(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    public Map<String, Object> getRuntimeConfig() {
        Map<String, String> rawConfig = new HashMap<>();
        systemConfigRepository.findAll().forEach(sc -> rawConfig.put(sc.getKey(), sc.getValue()));

        Map<String, Object> response = new HashMap<>();
        response.put("maintenanceMode", "true".equalsIgnoreCase(rawConfig.get("maintenanceMode")));
        response.put("registrationEnabled", !"false".equalsIgnoreCase(rawConfig.get("registrationEnabled")));
        
        int sessionTimeout = 30;
        try {
            if (rawConfig.containsKey("sessionTimeout")) {
                sessionTimeout = Integer.parseInt(rawConfig.get("sessionTimeout"));
            }
        } catch (NumberFormatException e) {
            // Use default
        }
        response.put("sessionTimeout", sessionTimeout);

        int maxTicketsPerUser = 5;
        try {
            if (rawConfig.containsKey("maxTicketsPerUser")) {
                maxTicketsPerUser = Integer.parseInt(rawConfig.get("maxTicketsPerUser"));
            }
        } catch (NumberFormatException e) {
            // Use default
        }
        response.put("maxTicketsPerUser", maxTicketsPerUser);

        return response;
    }

    public Map<String, Object> getTickerConfig() {
        SystemConfig tickerConfig = systemConfigRepository.findByKey("news_ticker_config").orElse(null);
        if (tickerConfig != null && tickerConfig.getValue() != null && !tickerConfig.getValue().isEmpty()) {
            try {
                return objectMapper.readValue(tickerConfig.getValue(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                logger.warn("No se pudo deserializar ticker config", e);
            }
        }

        // Return default configuration
        Map<String, Object> defaultConfig = new HashMap<>();
        defaultConfig.put("text", "PROXIMOS EVENTOS - OFERTAS EXCLUSIVAS - SOLD OUT: CONCIERTO ROCK - CLUB LAIKA");
        defaultConfig.put("backgroundColor", "#000000");
        defaultConfig.put("textColor", "#ffffff");
        defaultConfig.put("speed", 20);
        return defaultConfig;
    }

    @Transactional
    public void updateTickerConfig(Map<String, Object> config) {
        try {
            String valueStr = objectMapper.writeValueAsString(config);
            updateConfigParam("news_ticker_config", valueStr);
        } catch (Exception e) {
            logger.error("Error al guardar ticker config", e);
            throw new RuntimeException("Error al serializar ticker config", e);
        }
    }

    @Transactional
    public void updateConfigParam(String key, String value) {
        SystemConfig sc = systemConfigRepository.findByKey(key)
                .orElse(new SystemConfig(key, value));
        sc.setValue(value);
        systemConfigRepository.save(sc);
    }
}
