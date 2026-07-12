package com.laikaclub.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.admin.domain.BackupHistory;
import com.laikaclub.admin.dto.AutomaticBackupConfig;
import com.laikaclub.admin.repository.BackupHistoryRepository;
import com.laikaclub.admin.repository.SystemConfigRepository;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class BackupService {

    private static final Logger logger = LoggerFactory.getLogger(BackupService.class);

    private final BackupHistoryRepository backupHistoryRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${spring.datasource.mysql.password}")
    private String mysqlPassword;

    @Value("${mongo.uri:mongodb://localhost:27017}")
    private String mongoUri;

    @Value("${mongo.db:laika_analytics}")
    private String mongoDbName;

    private static final Path BACKUP_DIR = Paths.get("backups");

    static {
        try {
            Files.createDirectories(BACKUP_DIR);
        } catch (IOException e) {
            logger.error("No se pudo crear el directorio de backups", e);
        }
    }

    @Autowired
    public BackupService(BackupHistoryRepository backupHistoryRepository, SystemConfigRepository systemConfigRepository) {
        this.backupHistoryRepository = backupHistoryRepository;
        this.systemConfigRepository = systemConfigRepository;
    }

    private String getDbToolPath(String envVarName, String defaultToolName) {
        String path = System.getenv(envVarName);
        if (path == null || path.trim().isEmpty()) {
            return defaultToolName;
        }
        path = path.trim().replace("\"", "").replace("'", "");
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        if (isWindows && path.contains("/")) {
            return defaultToolName;
        }
        if (!isWindows && (path.contains("\\") || path.matches("^[A-Za-z]:.*"))) {
            return defaultToolName;
        }
        if ((path.contains("/") || path.contains("\\")) && !new File(path).exists()) {
            return defaultToolName;
        }
        return path;
    }

    private String getMysqlHost() {
        String envHost = System.getenv("MYSQL_HOST");
        if (envHost != null && !envHost.trim().isEmpty()) {
            return envHost;
        }
        try {
            String cleanUrl = mysqlUrl.substring(mysqlUrl.indexOf("//") + 2);
            int colonIndex = cleanUrl.indexOf(":");
            int slashIndex = cleanUrl.indexOf("/");
            if (colonIndex != -1 && colonIndex < slashIndex) {
                return cleanUrl.substring(0, colonIndex);
            }
            return cleanUrl.substring(0, slashIndex);
        } catch (Exception e) {
            return "localhost";
        }
    }

    private String getMysqlDatabase() {
        String envDb = System.getenv("MYSQL_DATABASE");
        if (envDb != null && !envDb.trim().isEmpty()) {
            return envDb;
        }
        try {
            String cleanUrl = mysqlUrl.substring(mysqlUrl.indexOf("//") + 2);
            int slashIndex = cleanUrl.indexOf("/");
            int questionIndex = cleanUrl.indexOf("?");
            if (questionIndex != -1) {
                return cleanUrl.substring(slashIndex + 1, questionIndex);
            }
            return cleanUrl.substring(slashIndex + 1);
        } catch (Exception e) {
            return "laika_club3_v2";
        }
    }

    @Async
    public void doBackupAsync(String backupId, String backupType, List<String> tables) {
        logger.info("[BACKUP] Iniciando mysqldump en segundo plano para: {}", backupId);
        
        File outFile = BACKUP_DIR.resolve(backupId + ".sql").toFile();
        String host = getMysqlHost();
        String user = mysqlUsername;
        String pwd = mysqlPassword;
        String dbName = getMysqlDatabase();
        String mysqldumpPath = getDbToolPath("MYSQLDUMP_PATH", "mysqldump");

        List<String> cmd = new ArrayList<>();
        cmd.add(mysqldumpPath);
        cmd.add("--host=" + host);
        cmd.add("--user=" + user);
        cmd.add("--skip-ssl");

        if (pwd != null && !pwd.isEmpty()) {
            cmd.add("--password=" + pwd);
        }

        if ("selectivo".equalsIgnoreCase(backupType) && tables != null && !tables.isEmpty()) {
            cmd.add("--single-transaction");
            cmd.add(dbName);
            cmd.addAll(tables);
        } else {
            cmd.add("--single-transaction");
            cmd.add("--routines");
            cmd.add("--triggers");
            cmd.add(dbName);
        }

        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectOutput(ProcessBuilder.Redirect.to(outFile));
            pb.redirectError(ProcessBuilder.Redirect.PIPE);

            Process process = pb.start();
            
            // Read error stream
            StringBuilder errorBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    errorBuilder.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            BackupHistory history = backupHistoryRepository.findByBackupId(backupId).orElse(null);

            if (history != null) {
                if (exitCode == 0) {
                    double sizeMb = (double) outFile.length() / (1024.0 * 1024.0);
                    history.setStatus("completed");
                    history.setCompletedAt(LocalDateTime.now());
                    history.setSizeMb(Math.round(sizeMb * 100.0) / 100.0);
                } else {
                    String errMsg = errorBuilder.toString();
                    if (errMsg.length() > 500) errMsg = errMsg.substring(0, 500);
                    history.setStatus("failed");
                    history.setCompletedAt(LocalDateTime.now());
                    history.setErrorMessage(errMsg.isEmpty() ? "Exit code " + exitCode : errMsg);
                }
                backupHistoryRepository.save(history);
            }
            logger.info("[BACKUP] mysqldump para {} completado con código {}", backupId, exitCode);

        } catch (Exception e) {
            logger.error("[BACKUP] Error al crear backup de MySQL", e);
            BackupHistory history = backupHistoryRepository.findByBackupId(backupId).orElse(null);
            if (history != null) {
                String errMsg = e.getMessage();
                if (errMsg != null && errMsg.length() > 500) errMsg = errMsg.substring(0, 500);
                history.setStatus("failed");
                history.setErrorMessage(errMsg);
                backupHistoryRepository.save(history);
            }
        }
    }

    @Async
    public void doMongoBackupAsync(String backupId) {
        logger.info("[BACKUP] Iniciando volcado de MongoDB en segundo plano para: {}", backupId);
        
        File outFile = BACKUP_DIR.resolve(backupId + ".json").toFile();

        try (MongoClient mongoClient = MongoClients.create(mongoUri)) {
            MongoDatabase db = mongoClient.getDatabase(mongoDbName);
            Map<String, List<Document>> dumpData = new HashMap<>();

            for (String collName : db.listCollectionNames()) {
                if (collName.startsWith("system.")) {
                    continue;
                }
                
                MongoCollection<Document> collection = db.getCollection(collName);
                List<Document> docs = new ArrayList<>();
                
                // Exclude _id field as done in Python
                for (Document doc : collection.find()) {
                    doc.remove("_id");
                    docs.add(doc);
                }
                dumpData.put(collName, docs);
            }

            try (Writer writer = new OutputStreamWriter(new FileOutputStream(outFile), StandardCharsets.UTF_8)) {
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(writer, dumpData);
            }

            double sizeMb = (double) outFile.length() / (1024.0 * 1024.0);
            BackupHistory history = backupHistoryRepository.findByBackupId(backupId).orElse(null);
            if (history != null) {
                history.setStatus("completed");
                history.setCompletedAt(LocalDateTime.now());
                history.setSizeMb(Math.round(sizeMb * 100.0) / 100.0);
                backupHistoryRepository.save(history);
            }
            logger.info("[BACKUP] Volcado de MongoDB para {} completado", backupId);

        } catch (Exception e) {
            logger.error("[BACKUP] Error en volcado de MongoDB", e);
            BackupHistory history = backupHistoryRepository.findByBackupId(backupId).orElse(null);
            if (history != null) {
                String errMsg = e.getMessage();
                if (errMsg != null && errMsg.length() > 500) errMsg = errMsg.substring(0, 500);
                history.setStatus("failed");
                history.setCompletedAt(LocalDateTime.now());
                history.setErrorMessage(errMsg);
                backupHistoryRepository.save(history);
            }
        }
    }

    public Map<String, Object> restoreBackup(String backupId) {
        Map<String, Object> response = new HashMap<>();
        
        File file = BACKUP_DIR.resolve(backupId + ".sql").toFile();
        if (!file.exists()) {
            // Search by prefix
            File[] matching = BACKUP_DIR.toFile().listFiles((dir, name) -> name.startsWith(backupId));
            if (matching != null && matching.length > 0) {
                file = matching[0];
            } else {
                response.put("success", false);
                response.put("message", "Archivo de respaldo no encontrado");
                return response;
            }
        }

        try {
            if (file.getName().endsWith(".json")) {
                // Restore MongoDB
                Map<String, List<Document>> dumpData;
                try (Reader reader = new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8)) {
                    dumpData = objectMapper.readValue(reader, new TypeReference<Map<String, List<Document>>>() {});
                }

                try (MongoClient mongoClient = MongoClients.create(mongoUri)) {
                    MongoDatabase db = mongoClient.getDatabase(mongoDbName);
                    List<String> restoredCols = new ArrayList<>();
                    
                    for (Map.Entry<String, List<Document>> entry : dumpData.entrySet()) {
                        String collName = entry.getKey();
                        List<Document> docs = entry.getValue();
                        
                        MongoCollection<Document> collection = db.getCollection(collName);
                        collection.drop(); // Clear previous
                        
                        if (!docs.isEmpty()) {
                            collection.insertMany(docs);
                        }
                        restoredCols.add(collName);
                    }
                    response.put("success", true);
                    response.put("message", "MongoDB restaurada con éxito desde " + file.getName());
                }
                return response;
            }

            // Restore MySQL
            String host = getMysqlHost();
            String user = mysqlUsername;
            String pwd = mysqlPassword;
            String dbName = getMysqlDatabase();
            String mysqlExe = getDbToolPath("MYSQL_EXE_PATH", "mysql");
            String mysqladminExe = getDbToolPath("MYSQLADMIN_EXE_PATH", "mysqladmin");

            // Recreate DB if it doesn't exist
            List<String> createDbCmd = new ArrayList<>();
            createDbCmd.add(mysqladminExe);
            createDbCmd.add("-h");
            createDbCmd.add(host);
            createDbCmd.add("-u");
            createDbCmd.add(user);
            createDbCmd.add("--skip-ssl");
            if (pwd != null && !pwd.isEmpty()) {
                createDbCmd.add("-p" + pwd);
            }
            createDbCmd.add("create");
            createDbCmd.add(dbName);

            try {
                ProcessBuilder pbCreate = new ProcessBuilder(createDbCmd);
                pbCreate.start().waitFor();
            } catch (Exception e) {
                // Ignore if database already exists
            }

            // Restore from file using standard input redirect
            List<String> restoreCmd = new ArrayList<>();
            restoreCmd.add(mysqlExe);
            restoreCmd.add("-h");
            restoreCmd.add(host);
            restoreCmd.add("-u");
            restoreCmd.add(user);
            restoreCmd.add("--skip-ssl");
            if (pwd != null && !pwd.isEmpty()) {
                restoreCmd.add("-p" + pwd);
            }
            restoreCmd.add(dbName);

            ProcessBuilder pbRestore = new ProcessBuilder(restoreCmd);
            pbRestore.redirectInput(ProcessBuilder.Redirect.from(file));
            pbRestore.redirectError(ProcessBuilder.Redirect.PIPE);

            Process process = pbRestore.start();
            StringBuilder errorBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    errorBuilder.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                response.put("success", true);
                response.put("message", "Base de datos " + dbName + " restaurada con éxito desde " + file.getName());
            } else {
                response.put("success", false);
                response.put("message", "Error en restauración: " + errorBuilder.toString());
            }

        } catch (Exception e) {
            logger.error("[RESTORE] Error en restauración", e);
            response.put("success", false);
            response.put("message", "Error inesperado: " + e.getMessage());
        }

        return response;
    }

    public void cleanupOldBackups(AutomaticBackupConfig config) {
        try {
            File[] files = BACKUP_DIR.toFile().listFiles((dir, name) -> name.startsWith("backup_") && name.endsWith(".sql"));
            if (files == null || files.length == 0) {
                return;
            }

            List<File> sqlFiles = new ArrayList<>(Arrays.asList(files));
            // Sort by modification time (newest first)
            sqlFiles.sort((f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));

            LocalDateTime cutoff = LocalDateTime.now().minusDays(config.getRetentionDays());
            long cutoffMillis = System.currentTimeMillis() - (config.getRetentionDays() * 24L * 60L * 60L * 1000L);

            // 1. Remove by age
            for (File sqlFile : sqlFiles) {
                if (sqlFile.lastModified() < cutoffMillis) {
                    sqlFile.delete();
                    File jsonFile = new File(sqlFile.getParentFile(), sqlFile.getName().replace(".sql", ".json"));
                    if (jsonFile.exists()) {
                        jsonFile.delete();
                    }
                    logger.info("🗑️ Respaldo antiguo eliminado: {}", sqlFile.getName());
                }
            }

            // Refresh file list and remove by count limits
            File[] remainingArr = BACKUP_DIR.toFile().listFiles((dir, name) -> name.startsWith("backup_") && name.endsWith(".sql"));
            if (remainingArr != null && remainingArr.length > config.getMaxBackups()) {
                List<File> remaining = new ArrayList<>(Arrays.asList(remainingArr));
                remaining.sort((f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));
                
                for (int i = config.getMaxBackups(); i < remaining.size(); i++) {
                    File toDel = remaining.get(i);
                    toDel.delete();
                    File jsonFile = new File(toDel.getParentFile(), toDel.getName().replace(".sql", ".json"));
                    if (jsonFile.exists()) {
                        jsonFile.delete();
                    }
                    logger.info("🗑️ Respaldo excedente eliminado: {}", toDel.getName());
                }
            }
            logger.info("✅ Limpieza de respaldos completada");
        } catch (Exception e) {
            logger.error("⚠️ Error al limpiar respaldos antiguos", e);
        }
    }

    public LocalDateTime calculateNextBackup(AutomaticBackupConfig config) {
        LocalDateTime now = LocalDateTime.now();
        String[] timeParts = config.getTime().split(":");
        int hour = Integer.parseInt(timeParts[0]);
        int minute = Integer.parseInt(timeParts[1]);

        LocalDateTime nextBackup;

        if ("hourly".equalsIgnoreCase(config.getFrequency())) {
            nextBackup = now.withMinute(0).withSecond(0).withNano(0);
            if (now.getMinute() > 0) {
                nextBackup = nextBackup.plusHours(1);
            }
        } else if ("daily".equalsIgnoreCase(config.getFrequency())) {
            nextBackup = now.withHour(hour).withMinute(minute).withSecond(0).withNano(0);
            if (now.compareTo(nextBackup) >= 0) {
                nextBackup = nextBackup.plusDays(1);
            }
        } else if ("weekly".equalsIgnoreCase(config.getFrequency())) {
            // Sunday = 0, Monday = 1, ... Saturday = 6
            int targetDOW = config.getDayOfWeek();
            DayOfWeek javaDOW = targetDOW == 0 ? DayOfWeek.SUNDAY : DayOfWeek.of(targetDOW);
            
            nextBackup = now.with(TemporalAdjusters.nextOrSame(javaDOW))
                    .withHour(hour).withMinute(minute).withSecond(0).withNano(0);
            
            if (now.compareTo(nextBackup) >= 0) {
                nextBackup = nextBackup.plusWeeks(1);
            }
        } else if ("monthly".equalsIgnoreCase(config.getFrequency())) {
            int day = config.getDayOfMonth();
            // Bound check for days in month
            int maxDays = now.toLocalDate().lengthOfMonth();
            int targetDay = Math.min(day, maxDays);
            
            nextBackup = now.withDayOfMonth(targetDay).withHour(hour).withMinute(minute).withSecond(0).withNano(0);
            if (now.compareTo(nextBackup) >= 0) {
                nextBackup = nextBackup.plusMonths(1);
                // Adjust day for the next month's length as well
                maxDays = nextBackup.toLocalDate().lengthOfMonth();
                nextBackup = nextBackup.withDayOfMonth(Math.min(day, maxDays));
            }
        } else {
            nextBackup = now.plusDays(1);
        }

        return nextBackup;
    }
}
