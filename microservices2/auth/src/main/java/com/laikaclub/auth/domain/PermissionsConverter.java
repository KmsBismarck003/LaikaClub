package com.laikaclub.auth.domain;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Converter
public class PermissionsConverter implements AttributeConverter<Map<String, Boolean>, String> {

    private static final Logger logger = LoggerFactory.getLogger(PermissionsConverter.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Boolean> attribute) {
        if (attribute == null) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            logger.error("Error serializando permisos a JSON", e);
            return "{}";
        }
    }

    @Override
    public Map<String, Boolean> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(dbData, new TypeReference<Map<String, Boolean>>() {});
        } catch (IOException e) {
            logger.error("Error deserializando permisos desde JSON: {}", dbData, e);
            return new HashMap<>();
        }
    }
}
