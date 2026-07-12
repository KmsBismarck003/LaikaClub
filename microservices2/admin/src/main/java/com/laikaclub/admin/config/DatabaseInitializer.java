package com.laikaclub.admin.config;

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
            logger.info("[ADMIN DB INITIALIZER] Ejecutando inicialización sobre: {}", dbProduct);

            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    // 1. system_config
                    stmt.execute("CREATE TABLE IF NOT EXISTS system_config (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "`key` VARCHAR(255) UNIQUE NOT NULL, " +
                            "`value` TEXT NULL, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                            ")");

                    // 2. backup_history
                    stmt.execute("CREATE TABLE IF NOT EXISTS backup_history (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "backup_id VARCHAR(255) UNIQUE NOT NULL, " +
                            "type VARCHAR(50) NULL, " +
                            "status VARCHAR(50) NULL, " +
                            "scheduled_at DATETIME NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "completed_at DATETIME NULL, " +
                            "size_mb DOUBLE NULL, " +
                            "error_message TEXT NULL" +
                            ")");

                    // 3. ads
                    stmt.execute("CREATE TABLE IF NOT EXISTS ads (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "title VARCHAR(255) NOT NULL, " +
                            "image_url TEXT NOT NULL, " +
                            "link_url TEXT NULL, " +
                            "position VARCHAR(100) DEFAULT 'main', " +
                            "active TINYINT(1) DEFAULT 1, " +
                            "event_id INT NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 4. ad_clicks
                    stmt.execute("CREATE TABLE IF NOT EXISTS ad_clicks (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "ad_id INT NOT NULL, " +
                            "user_id INT NULL, " +
                            "clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");
                } else { // SQLite
                    // 1. system_config
                    stmt.execute("CREATE TABLE IF NOT EXISTS system_config (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "`key` TEXT UNIQUE NOT NULL, " +
                            "`value` TEXT NULL, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 2. backup_history
                    stmt.execute("CREATE TABLE IF NOT EXISTS backup_history (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "backup_id TEXT UNIQUE NOT NULL, " +
                            "type TEXT NULL, " +
                            "status TEXT NULL, " +
                            "scheduled_at TIMESTAMP NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "completed_at TIMESTAMP NULL, " +
                            "size_mb REAL NULL, " +
                            "error_message TEXT NULL" +
                            ")");

                    // 3. ads
                    stmt.execute("CREATE TABLE IF NOT EXISTS ads (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "title TEXT NOT NULL, " +
                            "image_url TEXT NOT NULL, " +
                            "link_url TEXT NULL, " +
                            "position TEXT DEFAULT 'main', " +
                            "active INTEGER DEFAULT 1, " +
                            "event_id INTEGER NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 4. ad_clicks
                    stmt.execute("CREATE TABLE IF NOT EXISTS ad_clicks (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "ad_id INTEGER NOT NULL, " +
                            "user_id INTEGER NULL, " +
                            "clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");
                            
                    // Ensure events and users exist to avoid crashes on joins
                    stmt.execute("CREATE TABLE IF NOT EXISTS events (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "status TEXT, " +
                            "ads_enabled INTEGER" +
                            ")");
                    
                    stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "full_name TEXT, " +
                            "email TEXT, " +
                            "profile_image TEXT" +
                            ")");
                }
            }
            logger.info("[ADMIN DB INITIALIZER] Inicialización completada exitosamente.");
        } catch (Exception e) {
            logger.error("[ADMIN DB INITIALIZER] Error ejecutando inicialización de DB: {}", e.getMessage());
        }
    }
}
