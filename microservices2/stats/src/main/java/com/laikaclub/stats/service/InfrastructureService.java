package com.laikaclub.stats.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HWDiskStore;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class InfrastructureService {

    private static final Logger logger = LoggerFactory.getLogger(InfrastructureService.class);

    private final long startTime = System.currentTimeMillis();

    @Value("${mongo.uri:}")
    private String mongoUri;

    @Value("${mongo.db:laika_analytics}")
    private String mongoDbName;

    @Autowired
    private DataSource dataSource;

    private MongoClient mongoClient;
    private MongoDatabase mongoDatabase;

    private SystemInfo systemInfo;
    private CentralProcessor processor;
    private GlobalMemory memory;

    private double currentCpuPercent = 0.0;
    private double currentMemoryPercent = 0.0;
    private long[] prevTicks;

    private final List<Double> cpuHistory = new CopyOnWriteArrayList<>(Arrays.asList(0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
    private final List<Double> memHistory = new CopyOnWriteArrayList<>(Arrays.asList(0.0, 0.0, 0.0, 0.0, 0.0, 0.0));

    @PostConstruct
    public void init() {
        // Inicializar OSHI
        try {
            this.systemInfo = new SystemInfo();
            this.processor = systemInfo.getHardware().getProcessor();
            this.memory = systemInfo.getHardware().getMemory();
            this.prevTicks = processor.getSystemCpuLoadTicks();
        } catch (Exception e) {
            logger.error("Error al inicializar OSHI: {}", e.getMessage());
        }

        // Inicializar MongoDB client
        if (mongoUri == null || mongoUri.trim().isEmpty()) {
            logger.warn("[STATS INFRA] No se configuró MONGO_URI. Se omitirán las estadísticas de MongoDB.");
            return;
        }

        try {
            String sanitizedUri = mongoUri.replace("\"", "").replace("'", "").trim();
            String sanitizedDb = mongoDbName.replace("\"", "").replace("'", "").trim();
            if (!sanitizedUri.isEmpty()) {
                logger.info("[STATS INFRA] Inicializando cliente MongoDB para estadísticas en: {}", sanitizedDb);
                this.mongoClient = MongoClients.create(sanitizedUri);
                this.mongoDatabase = this.mongoClient.getDatabase(sanitizedDb);
            }
        } catch (Exception e) {
            logger.error("[STATS INFRA] Error al configurar el cliente de MongoDB: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void destroy() {
        if (mongoClient != null) {
            try {
                mongoClient.close();
            } catch (Exception ignored) {}
        }
    }

    @Scheduled(fixedRate = 5000)
    public void pollMetrics() {
        try {
            if (processor != null) {
                double cpuLoad = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100.0;
                this.prevTicks = processor.getSystemCpuLoadTicks();
                this.currentCpuPercent = Math.round(cpuLoad * 100.0) / 100.0;
            }
            if (memory != null) {
                long total = memory.getTotal();
                long available = memory.getAvailable();
                double memUsedPercent = ((double) (total - available) / total) * 100.0;
                this.currentMemoryPercent = Math.round(memUsedPercent * 100.0) / 100.0;
            }

            // Actualizar historiales de 6 elementos
            updateHistory(cpuHistory, currentCpuPercent);
            updateHistory(memHistory, currentMemoryPercent);
        } catch (Exception e) {
            logger.error("Error al muestrear métricas físicas: {}", e.getMessage());
        }
    }

    private void updateHistory(List<Double> history, double newValue) {
        if (history.size() >= 6) {
            history.remove(0);
        }
        history.add(newValue);
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("cpu_history", new ArrayList<>(cpuHistory));
        metrics.put("mem_history", new ArrayList<>(memHistory));
        metrics.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return metrics;
    }

    public Map<String, Object> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        // 1. Database metrics
        Map<String, Object> dbStats = new HashMap<>();
        boolean isDbHealthy = false;
        try (Connection conn = dataSource.getConnection()) {
            isDbHealthy = conn.isValid(2);
        } catch (Exception ignored) {}
        
        dbStats.put("status", isDbHealthy ? "healthy" : "unhealthy");
        dbStats.put("uptime", (System.currentTimeMillis() - startTime) / 1000);

        Map<String, Object> connections = new HashMap<>();
        int activeConn = 3;
        int maxConn = 151;
        if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
            com.zaxxer.hikari.HikariDataSource ds = (com.zaxxer.hikari.HikariDataSource) dataSource;
            if (ds.getHikariPoolMXBean() != null) {
                activeConn = ds.getHikariPoolMXBean().getActiveConnections();
                maxConn = ds.getMaximumPoolSize();
            }
        }
        connections.put("active", activeConn);
        connections.put("max", maxConn);
        connections.put("usage_percent", Math.round(((double) activeConn / maxConn * 100.0) * 100.0) / 100.0);
        dbStats.put("connections", connections);
        status.put("database", dbStats);

        // 2. Physical System metrics
        Map<String, Object> systemStats = new HashMap<>();
        
        Map<String, Object> cpuMap = new HashMap<>();
        cpuMap.put("percent", currentCpuPercent);
        systemStats.put("cpu", cpuMap);

        Map<String, Object> memMap = new HashMap<>();
        memMap.put("percent", currentMemoryPercent);
        systemStats.put("memory", memMap);

        Map<String, Object> diskMap = new HashMap<>();
        File root = new File("/");
        double totalGb = (double) root.getTotalSpace() / (1024.0 * 1024.0 * 1024.0);
        double freeGb = (double) root.getFreeSpace() / (1024.0 * 1024.0 * 1024.0);
        diskMap.put("total_gb", Math.round(totalGb * 100.0) / 100.0);
        diskMap.put("free_gb", Math.round(freeGb * 100.0) / 100.0);
        systemStats.put("disk", diskMap);

        Map<String, Object> ioMap = new HashMap<>();
        double readMb = 0.0;
        double writeMb = 0.0;
        try {
            if (systemInfo != null) {
                long readBytes = 0;
                long writeBytes = 0;
                for (HWDiskStore ds : systemInfo.getHardware().getDiskStores()) {
                    readBytes += ds.getReadBytes();
                    writeBytes += ds.getWriteBytes();
                }
                readMb = (double) readBytes / (1024.0 * 1024.0);
                writeMb = (double) writeBytes / (1024.0 * 1024.0);
            }
        } catch (Exception ignored) {}
        ioMap.put("read_mb", Math.round(readMb * 100.0) / 100.0);
        ioMap.put("write_mb", Math.round(writeMb * 100.0) / 100.0);
        systemStats.put("io", ioMap);

        status.put("system", systemStats);

        // 3. Bóveda Cloud (MongoDB Atlas) metrics
        status.put("boveda_cloud", getBovedaCloudMetrics());

        // 4. Integrity
        Map<String, Object> integrity = new HashMap<>();
        integrity.put("is_healthy", isDbHealthy);
        status.put("integrity", integrity);

        return status;
    }

    private Map<String, Object> getBovedaCloudMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("status", "inactive");
        metrics.put("sync_count", 0);
        metrics.put("last_sync", "N/A");
        metrics.put("health_score", 0);
        metrics.put("latency", 0.0);
        metrics.put("collections", Collections.emptyList());

        if (mongoDatabase != null) {
            try {
                long startPing = System.currentTimeMillis();
                mongoDatabase.runCommand(new org.bson.Document("ping", 1));
                double latency = System.currentTimeMillis() - startPing;

                List<Map<String, Object>> collections = new ArrayList<>();
                long totalDocs = 0;
                for (String cName : mongoDatabase.listCollectionNames()) {
                    long count = mongoDatabase.getCollection(cName).countDocuments();
                    Map<String, Object> colMap = new HashMap<>();
                    colMap.put("name", cName);
                    colMap.put("count", count);
                    collections.add(colMap);
                    totalDocs += count;
                }

                metrics.put("latency", latency);
                metrics.put("collections", collections);
                metrics.put("status", totalDocs > 0 ? "active" : "standby");
                metrics.put("sync_count", totalDocs);
                metrics.put("health_score", totalDocs > 0 ? 100 : 85);
                metrics.put("last_sync", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            } catch (Exception e) {
                logger.warn("Error obteniendo métricas de MongoDB Atlas: {}", e.getMessage());
                metrics.put("status", "error");
            }
        }

        return metrics;
    }
}
