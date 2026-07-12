package com.laikaclub.stats.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final DataSource dataSource;

    @Autowired
    public DatabaseInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            String dbProduct = conn.getMetaData().getDatabaseProductName().toLowerCase();
            logger.info("[STATS DB INITIALIZER] Ejecutando inicialización y migraciones sobre: {}", dbProduct);

            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    stmt.execute("CREATE TABLE IF NOT EXISTS system_metrics (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "cpu_percent DOUBLE, " +
                            "memory_percent DOUBLE, " +
                            "disk_free_gb DOUBLE, " +
                            "recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS alert_log (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "level VARCHAR(50) DEFAULT 'info', " +
                            "message TEXT, " +
                            "service VARCHAR(100), " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                } else { // SQLite
                    stmt.execute("CREATE TABLE IF NOT EXISTS system_metrics (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "cpu_percent REAL, " +
                            "memory_percent REAL, " +
                            "disk_free_gb REAL, " +
                            "recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS alert_log (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "level TEXT DEFAULT 'info', " +
                            "message TEXT, " +
                            "service TEXT, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");
                }
            }
            logger.info("[STATS DB INITIALIZER] Inicialización de tablas completada exitosamente.");
        } catch (Exception e) {
            logger.error("[STATS DB INITIALIZER] Error ejecutando inicialización de base de datos: {}", e.getMessage());
        }
    }
}
