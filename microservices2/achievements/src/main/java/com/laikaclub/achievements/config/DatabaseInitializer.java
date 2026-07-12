package com.laikaclub.achievements.config;

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
            logger.info("[ACHIEVEMENTS DB INITIALIZER] Inicializando tablas sobre: {}", dbProduct);

            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    // 1. user_achievements
                    stmt.execute("CREATE TABLE IF NOT EXISTS user_achievements (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "user_id INT NOT NULL, " +
                            "achievement_id INT NOT NULL, " +
                            "tier INT NOT NULL, " +
                            "tier_name VARCHAR(100) NULL, " +
                            "phase VARCHAR(50) NULL, " +
                            "unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "KEY idx_user (user_id), " +
                            "KEY idx_achievement (achievement_id)" +
                            ")");

                    // 2. user_coupons
                    stmt.execute("CREATE TABLE IF NOT EXISTS user_coupons (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "user_id INT NOT NULL, " +
                            "code VARCHAR(50) NOT NULL UNIQUE, " +
                            "coupon_type VARCHAR(50) DEFAULT '', " +
                            "discount_type VARCHAR(20) NOT NULL, " +
                            "discount_value DOUBLE NOT NULL, " +
                            "description VARCHAR(255) NULL, " +
                            "uses_left INT DEFAULT 1, " +
                            "expires_at DATETIME NULL, " +
                            "is_permanent TINYINT(1) DEFAULT 0, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "KEY idx_user (user_id), " +
                            "KEY idx_code (code)" +
                            ")");
                } else { // SQLite
                    // 1. user_achievements
                    stmt.execute("CREATE TABLE IF NOT EXISTS user_achievements (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "user_id INTEGER NOT NULL, " +
                            "achievement_id INTEGER NOT NULL, " +
                            "tier INTEGER NOT NULL, " +
                            "tier_name TEXT NULL, " +
                            "phase TEXT NULL, " +
                            "unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // Create index if not exist
                    stmt.execute("CREATE INDEX IF NOT EXISTS idx_ua_user ON user_achievements(user_id)");

                    // 2. user_coupons
                    stmt.execute("CREATE TABLE IF NOT EXISTS user_coupons (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "user_id INTEGER NOT NULL, " +
                            "code TEXT NOT NULL UNIQUE, " +
                            "coupon_type TEXT DEFAULT '', " +
                            "discount_type TEXT NOT NULL, " +
                            "discount_value REAL NOT NULL, " +
                            "description TEXT NULL, " +
                            "uses_left INTEGER DEFAULT 1, " +
                            "expires_at TIMESTAMP NULL, " +
                            "is_permanent INTEGER DEFAULT 0, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    stmt.execute("CREATE INDEX IF NOT EXISTS idx_uc_user ON user_coupons(user_id)");
                    stmt.execute("CREATE INDEX IF NOT EXISTS idx_uc_code ON user_coupons(code)");
                }
            }
            logger.info("[ACHIEVEMENTS DB INITIALIZER] Inicialización de DB completada exitosamente.");
        } catch (Exception e) {
            logger.error("[ACHIEVEMENTS DB INITIALIZER] Error inicializando base de datos: {}", e.getMessage());
        }
    }
}
