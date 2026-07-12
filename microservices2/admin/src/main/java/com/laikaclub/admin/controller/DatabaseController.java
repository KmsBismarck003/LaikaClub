package com.laikaclub.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.admin.domain.BackupHistory;
import com.laikaclub.admin.domain.SystemConfig;
import com.laikaclub.admin.dto.AutomaticBackupConfig;
import com.laikaclub.admin.repository.BackupHistoryRepository;
import com.laikaclub.admin.repository.SystemConfigRepository;
import com.laikaclub.admin.service.BackupService;
import com.laikaclub.admin.service.ExporterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
public class DatabaseController {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseController.class);

    private final BackupHistoryRepository backupHistoryRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final BackupService backupService;
    private final ExporterService exporterService;
    private final DataSource dataSource;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public DatabaseController(BackupHistoryRepository backupHistoryRepository,
                              SystemConfigRepository systemConfigRepository,
                              BackupService backupService,
                              ExporterService exporterService,
                              DataSource dataSource) {
        this.backupHistoryRepository = backupHistoryRepository;
        this.systemConfigRepository = systemConfigRepository;
        this.backupService = backupService;
        this.exporterService = exporterService;
        this.dataSource = dataSource;
    }

    // --- List Backups ---
    @GetMapping("/database/backups")
    public ResponseEntity<?> listBackups() {
        try {
            List<BackupHistory> list = backupHistoryRepository.findTop50ByOrderByCreatedAtDesc();
            return ResponseEntity.ok(Map.of("backups", list, "total", list.size()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("backups", List.of(), "total", 0, "error", e.getMessage()));
        }
    }

    // --- Trigger Backup ---
    @PostMapping("/database/backup")
    public ResponseEntity<?> createBackup(@RequestBody BackupRequest req) {
        String dbEngine = req.getEngine() != null ? req.getEngine().toLowerCase() : "mysql";
        String backupType = req.getType() != null ? req.getType().toLowerCase() : "full";

        LocalDateTime now = LocalDateTime.now();
        String formattedDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().replace("-", "").substring(0, 6);

        if ("mongodb".equalsIgnoreCase(dbEngine)) {
            String backupId = "backup_mongo_" + formattedDate + "_" + uniqueId;
            
            BackupHistory history = new BackupHistory();
            history.setBackupId(backupId);
            history.setType("mongodb");
            history.setStatus("in_progress");
            backupHistoryRepository.save(history);

            backupService.doMongoBackupAsync(backupId);
            return ResponseEntity.ok(Map.of("success", true, "backup_id", backupId, "message", "Respaldo MongoDB iniciado"));
        } else {
            String prefix = "completo".equalsIgnoreCase(backupType) ? "full" : backupType;
            String backupId = "backup_" + prefix + "_" + formattedDate + "_" + uniqueId;
            
            BackupHistory history = new BackupHistory();
            history.setBackupId(backupId);
            history.setType(backupType);
            history.setStatus("in_progress");
            backupHistoryRepository.save(history);

            backupService.doBackupAsync(backupId, backupType, req.getTables());
            return ResponseEntity.ok(Map.of("success", true, "backup_id", backupId, "message", "Respaldo iniciado"));
        }
    }

    // --- Delete Backup ---
    @DeleteMapping("/database/backups/{backupId}")
    public ResponseEntity<?> deleteBackup(@PathVariable String backupId) {
        backupHistoryRepository.deleteByBackupIdOrIdString(backupId);
        
        // Find and delete files
        Path backupDir = Paths.get("backups");
        File[] files = backupDir.toFile().listFiles((dir, name) -> name.startsWith(backupId));
        if (files != null) {
            for (File f : files) {
                f.delete();
            }
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    // --- Streaming Download Backup ---
    @GetMapping("/database/backups/{backupId}/download")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String backupId) throws IOException {
        Path backupDir = Paths.get("backups");
        Path filePath = backupDir.resolve(backupId + ".sql");
        
        if (!Files.exists(filePath)) {
            File[] files = backupDir.toFile().listFiles((dir, name) -> name.startsWith(backupId));
            if (files != null && files.length > 0) {
                filePath = files[0].toPath();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        }

        Resource resource = new InputStreamResource(Files.newInputStream(filePath));
        String filename = filePath.getFileName().toString();
        String contentType = filename.endsWith(".json") ? "application/json" : "application/sql";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    // --- Tables and Rows Count ---
    @GetMapping("/database/tables")
    public ResponseEntity<?> listTables() {
        try {
            List<String> tableNames = exporterService.getAllTables();
            List<Map<String, Object>> tables = new ArrayList<>();
            
            try (Connection conn = dataSource.getConnection()) {
                for (String t : tableNames) {
                    long count = 0;
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM `" + t + "`")) {
                        if (rs.next()) {
                            count = rs.getLong(1);
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", t);
                    map.put("row_count", count);
                    tables.add(map);
                }
            }
            return ResponseEntity.ok(Map.of("tables", tables));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("tables", List.of(), "error", e.getMessage()));
        }
    }

    // --- Database stats ---
    @GetMapping("/database/stats")
    public ResponseEntity<?> getStats() {
        try {
            List<Map<String, Object>> tables = new ArrayList<>();
            try (Connection conn = dataSource.getConnection()) {
                String dbProduct = conn.getMetaData().getDatabaseProductName().toLowerCase();
                if (dbProduct.contains("mysql")) {
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT table_name, table_rows, data_length, index_length " +
                                 "FROM information_schema.tables WHERE table_schema = DATABASE()")) {
                        while (rs.next()) {
                            Map<String, Object> map = new HashMap<>();
                            map.put("table_name", rs.getString("table_name"));
                            map.put("table_rows", rs.getLong("table_rows"));
                            map.put("data_length", rs.getLong("data_length"));
                            map.put("index_length", rs.getLong("index_length"));
                            tables.add(map);
                        }
                    }
                } else {
                    List<String> tableNames = exporterService.getAllTables();
                    for (String t : tableNames) {
                        long count = 0;
                        try (Statement stmt = conn.createStatement();
                             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM `" + t + "`")) {
                            if (rs.next()) {
                                count = rs.getLong(1);
                            }
                        }
                        Map<String, Object> map = new HashMap<>();
                        map.put("table_name", t);
                        map.put("table_rows", count);
                        map.put("data_length", 0);
                        map.put("index_length", 0);
                        tables.add(map);
                    }
                }
            }
            return ResponseEntity.ok(Map.of("tables", tables));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("tables", List.of()));
        }
    }

    // --- Exports ---
    @GetMapping("/database/export/json")
    public ResponseEntity<byte[]> exportJson() {
        try {
            byte[] bytes = exporterService.exportToJson();
            String filename = "database_export_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/database/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        try {
            byte[] bytes = exporterService.exportToExcel();
            String filename = "database_export_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .body(bytes);
        } catch (Exception e) {
            logger.error("Error exporting to Excel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/database/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        try {
            byte[] bytes = exporterService.exportToPdf();
            String filename = "database_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .body(bytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/database/export/svg")
    public ResponseEntity<String> exportSvg() {
        try {
            String svg = exporterService.exportToSvg();
            String filename = "database_schema_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".svg";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/svg+xml"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .body(svg);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Optimize ---
    @PostMapping("/database/optimize")
    public ResponseEntity<?> optimizeDb() {
        try (Connection conn = dataSource.getConnection()) {
            String dbProduct = conn.getMetaData().getDatabaseProductName().toLowerCase();
            List<String> tableNames = exporterService.getAllTables();
            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    for (String t : tableNames) {
                        try {
                            stmt.execute("OPTIMIZE TABLE `" + t + "`");
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                } else {
                    stmt.execute("VACUUM");
                }
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Optimización completada"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // --- Clear Cache ---
    @PostMapping("/database/clear-cache")
    public ResponseEntity<?> clearCache() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Caché limpiado"));
    }

    // --- Restore ---
    @PostMapping("/database/restore")
    public ResponseEntity<?> restoreBackup(@RequestBody Map<String, String> payload) {
        String backupId = payload.get("backup_id");
        if (backupId == null || backupId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "backup_id es requerido"));
        }
        
        Map<String, Object> result = backupService.restoreBackup(backupId);
        return ResponseEntity.ok(result);
    }

    // --- Automatic Backups Config ---
    @GetMapping("/database/automatic-backup/config")
    public ResponseEntity<?> getAutoBackupConfig() {
        AutomaticBackupConfig config = new AutomaticBackupConfig();
        SystemConfig configRow = systemConfigRepository.findByKey("automatic_backup_config").orElse(null);
        
        if (configRow != null && configRow.getValue() != null && !configRow.getValue().isEmpty()) {
            try {
                config = objectMapper.readValue(configRow.getValue(), AutomaticBackupConfig.class);
            } catch (Exception e) {
                // Ignore and use default
            }
        }

        LocalDateTime lastCompleted = backupHistoryRepository.findLatestCompletedBackupTime();
        String lastBackupStr = lastCompleted != null ? lastCompleted.toString() : null;

        String nextBackupStr = null;
        if (config.isEnabled()) {
            nextBackupStr = backupService.calculateNextBackup(config).toString();
        }

        return ResponseEntity.ok(Map.of(
            "config", config,
            "lastBackup", lastBackupStr,
            "nextBackup", nextBackupStr
        ));
    }

    @PutMapping("/database/automatic-backup/config")
    public ResponseEntity<?> updateAutoBackupConfig(@RequestBody AutomaticBackupConfig config) {
        try {
            String valueStr = objectMapper.writeValueAsString(config);
            SystemConfig configRow = systemConfigRepository.findByKey("automatic_backup_config")
                    .orElse(new SystemConfig("automatic_backup_config", valueStr));
            configRow.setValue(valueStr);
            systemConfigRepository.save(configRow);

            String nextBackupStr = null;
            if (config.isEnabled()) {
                nextBackupStr = backupService.calculateNextBackup(config).toString();
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Configuración guardada correctamente",
                "nextBackup", nextBackupStr
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al guardar configuración: " + e.getMessage()));
        }
    }

    @GetMapping("/database/automatic-backup/scheduled")
    public ResponseEntity<?> getScheduledBackups() {
        List<BackupHistory> list = backupHistoryRepository.findTop20ByStatusOrderByScheduledAtAsc("scheduled");
        return ResponseEntity.ok(Map.of("scheduled", list));
    }

    @DeleteMapping("/database/automatic-backup/scheduled/{id}")
    public ResponseEntity<?> cancelScheduledBackup(@PathVariable Long id) {
        BackupHistory history = backupHistoryRepository.findById(id).orElse(null);
        if (history != null && "scheduled".equalsIgnoreCase(history.getStatus())) {
            backupHistoryRepository.delete(history);
            return ResponseEntity.ok(Map.of("success", true, "message", "Respaldo cancelado correctamente"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Respaldo programado no encontrado"));
    }

    @PostMapping("/database/automatic-backup/trigger")
    public ResponseEntity<?> triggerBackup() {
        BackupRequest req = new BackupRequest();
        req.setEngine("mysql");
        req.setType("full");
        return createBackup(req);
    }

    @PostMapping("/database/automatic-backup/cleanup")
    public ResponseEntity<?> cleanupBackups() {
        AutomaticBackupConfig config = new AutomaticBackupConfig();
        SystemConfig configRow = systemConfigRepository.findByKey("automatic_backup_config").orElse(null);
        if (configRow != null && configRow.getValue() != null && !configRow.getValue().isEmpty()) {
            try {
                config = objectMapper.readValue(configRow.getValue(), AutomaticBackupConfig.class);
            } catch (Exception e) {
                // use default
            }
        }
        
        backupService.cleanupOldBackups(config);
        
        // Also cleanup old failed logs from database (older than 7 days) as done in python
        backupHistoryRepository.deleteOldFailedBackups(LocalDateTime.now().minusDays(7));

        return ResponseEntity.ok(Map.of("success", true, "message", "Limpieza completada"));
    }

    // --- Static Request DTO ---
    public static class BackupRequest {
        private String type = "full";
        private List<String> tables;
        private String engine = "mysql";

        public BackupRequest() {}

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public List<String> getTables() {
            return tables;
        }

        public void setTables(List<String> tables) {
            this.tables = tables;
        }

        public String getEngine() {
            return engine;
        }

        public void setEngine(String engine) {
            this.engine = engine;
        }
    }
}
