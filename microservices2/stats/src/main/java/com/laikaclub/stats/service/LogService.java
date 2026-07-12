package com.laikaclub.stats.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LogService {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    public List<Map<String, Object>> getLogs(int limit, String level) {
        File logsDir = findLogsDir();
        if (logsDir == null || !logsDir.exists() || !logsDir.isDirectory()) {
            logger.warn("[LOG SERVICE] Directorio de logs no encontrado.");
            return Collections.emptyList();
        }

        List<Map<String, Object>> allLogs = new ArrayList<>();
        File[] logFiles = logsDir.listFiles((dir, name) -> name.endsWith(".log"));

        if (logFiles == null) {
            return Collections.emptyList();
        }

        for (File file : logFiles) {
            String sourceName = file.getName().replace(".log", "").replace("_", " ");
            String source = toTitleCase(sourceName);

            try {
                List<String> lines = Files.readAllLines(file.toPath(), StandardCharsets.UTF_8);
                int start = Math.max(0, lines.size() - limit);
                List<String> lastLines = lines.subList(start, lines.size());

                for (String line : lastLines) {
                    line = line.trim();
                    if (line.isEmpty()) continue;

                    try {
                        if (line.contains("]") && line.contains(": ")) {
                            int bracketIdx = line.indexOf(']');
                            String tsPart = line.substring(0, bracketIdx).replace("[", "").trim();
                            String rest = line.substring(bracketIdx + 1);

                            int colonIdx = rest.indexOf(':');
                            if (colonIdx != -1) {
                                String lvl = rest.substring(0, colonIdx).trim();
                                String msg = rest.substring(colonIdx + 1).trim();

                                if (level != null && !level.equalsIgnoreCase("ALL") && !lvl.equalsIgnoreCase(level)) {
                                    continue;
                                }

                                String validLvl = Arrays.asList("INFO", "WARN", "ERROR", "SUCCESS").contains(lvl.toUpperCase()) ? lvl.toUpperCase() : "INFO";

                                Map<String, Object> logEntry = new HashMap<>();
                                logEntry.put("timestamp", tsPart);
                                logEntry.put("level", validLvl);
                                logEntry.put("source", source);
                                logEntry.put("message", msg);
                                allLogs.add(logEntry);
                            } else {
                                addFallbackLog(allLogs, line, source, level);
                            }
                        } else {
                            addFallbackLog(allLogs, line, source, level);
                        }
                    } catch (Exception e) {
                        // Omitir lineas mal formateadas
                    }
                }
            } catch (IOException e) {
                logger.error("Error leyendo archivo de log: {}", file.getName(), e);
            }
        }

        // Ordenar de forma descendente por timestamp
        allLogs.sort((o1, o2) -> {
            String ts1 = (String) o1.get("timestamp");
            String ts2 = (String) o2.get("timestamp");
            if (ts1 == null && ts2 == null) return 0;
            if (ts1 == null) return 1;
            if (ts2 == null) return -1;
            return ts2.compareTo(ts1);
        });

        if (allLogs.size() > limit) {
            return allLogs.subList(0, limit);
        }
        return allLogs;
    }

    private void addFallbackLog(List<Map<String, Object>> allLogs, String line, String source, String levelFilter) {
        if (levelFilter != null && !levelFilter.equalsIgnoreCase("ALL") && !levelFilter.equalsIgnoreCase("INFO")) {
            return;
        }
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        logEntry.put("level", "INFO");
        logEntry.put("source", source);
        logEntry.put("message", line);
        allLogs.add(logEntry);
    }

    private File findLogsDir() {
        // Buscar en varias rutas relativas comunes
        String[] potentialPaths = {
            "microservices_logs",
            "../microservices_logs",
            "../../microservices_logs",
            "../../../microservices_logs"
        };
        for (String path : potentialPaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                return dir;
            }
        }
        // Fallback al parent
        try {
            File currentDir = new File(".").getAbsoluteFile();
            while (currentDir != null) {
                File logsDir = new File(currentDir, "microservices_logs");
                if (logsDir.exists() && logsDir.isDirectory()) {
                    return logsDir;
                }
                currentDir = currentDir.getParentFile();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String toTitleCase(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        StringBuilder builder = new StringBuilder();
        boolean capitalizeNext = true;
        for (char c : input.toCharArray()) {
            if (Character.isSpaceChar(c)) {
                capitalizeNext = true;
                builder.append(c);
            } else if (capitalizeNext) {
                builder.append(Character.toTitleCase(c));
                capitalizeNext = false;
            } else {
                builder.append(Character.toLowerCase(c));
            }
        }
        return builder.toString();
    }
}
