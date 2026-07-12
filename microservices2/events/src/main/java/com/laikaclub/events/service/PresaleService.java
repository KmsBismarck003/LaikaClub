package com.laikaclub.events.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PresaleService {

    private static final Logger logger = LoggerFactory.getLogger(PresaleService.class);

    public boolean isPresaleActive(Map<String, Object> event) {
        if (event == null) return false;

        Object presaleEnabledObj = event.get("presale_enabled");
        boolean presaleEnabled = false;
        if (presaleEnabledObj instanceof Boolean) {
            presaleEnabled = (Boolean) presaleEnabledObj;
        } else if (presaleEnabledObj instanceof Number) {
            presaleEnabled = ((Number) presaleEnabledObj).intValue() != 0;
        }

        if (!presaleEnabled) {
            return false;
        }

        Object startObj = event.get("presale_start");
        Object endObj = event.get("presale_end");

        if (startObj == null || endObj == null) {
            return false;
        }

        String startStr = String.valueOf(startObj);
        String endStr = String.valueOf(endObj);

        if (startStr.isEmpty() || endStr.isEmpty()) {
            return false;
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Normalize: remove "Z" or microsecond decimals to match date parsing
            LocalDateTime startDt = parseIsoDateTime(startStr);
            LocalDateTime endDt = parseIsoDateTime(endStr);
            
            return !now.isBefore(startDt) && !now.isAfter(endDt);
        } catch (Exception e) {
            logger.debug("Error checking presale status: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateBin(String cardNumber, String allowedBinsCsv) {
        if (cardNumber == null || allowedBinsCsv == null || allowedBinsCsv.trim().isEmpty()) {
            return false;
        }

        // Clean non-digit characters
        String cleanNumber = cardNumber.replaceAll("\\D", "");

        if (cleanNumber.length() < 6) {
            return false;
        }

        String userBin = cleanNumber.substring(0, 6);
        String[] binsArray = allowedBinsCsv.split(",");
        for (String b : binsArray) {
            if (b.trim().equals(userBin)) {
                return true;
            }
        }

        return false;
    }

    public Map<String, Object> getPresaleInfo(Map<String, Object> event) {
        Map<String, Object> info = new HashMap<>();
        if (event == null) {
            info.put("presale_enabled", false);
            info.put("presale_active", false);
            info.put("presale_bank_name", null);
            info.put("presale_start", null);
            info.put("presale_end", null);
            info.put("presale_bins", null);
            return info;
        }

        boolean active = isPresaleActive(event);
        
        Object presaleEnabledObj = event.get("presale_enabled");
        boolean presaleEnabled = false;
        if (presaleEnabledObj instanceof Boolean) {
            presaleEnabled = (Boolean) presaleEnabledObj;
        } else if (presaleEnabledObj instanceof Number) {
            presaleEnabled = ((Number) presaleEnabledObj).intValue() != 0;
        }

        info.put("presale_enabled", presaleEnabled);
        info.put("presale_active", active);
        info.put("presale_bank_name", event.get("presale_bank_name"));
        info.put("presale_start", event.get("presale_start"));
        info.put("presale_end", event.get("presale_end"));
        info.put("presale_bins", event.get("presale_bins"));
        return info;
    }

    private LocalDateTime parseIsoDateTime(String isoStr) {
        // Normalización: quitar 'Z' si existe
        String clean = isoStr.replace("Z", "");
        // Quitar microsegundos/milisegundos si los hay (cortar por el primer punto decimal si tiene longitud > 19)
        if (clean.contains(".")) {
            clean = clean.substring(0, clean.indexOf("."));
        }
        // Si tiene formato YYYY-MM-DD HH:MM:SS (o similar con T)
        clean = clean.replace(" ", "T");
        
        if (clean.length() == 10) {
            // Solo fecha: YYYY-MM-DD
            return LocalDateTime.parse(clean + "T00:00:00");
        } else if (clean.length() == 16) {
            // YYYY-MM-DDTHH:MM
            return LocalDateTime.parse(clean + ":00");
        }
        
        return LocalDateTime.parse(clean);
    }
}
