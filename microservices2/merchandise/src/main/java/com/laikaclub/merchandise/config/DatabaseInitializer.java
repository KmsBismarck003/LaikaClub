package com.laikaclub.merchandise.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
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
            logger.info("[MERCHANDISE DB INITIALIZER] Ejecutando inicialización sobre: {}", dbProduct);

            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    // 1. Settings Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_settings (" +
                            "manager_id INT PRIMARY KEY, " +
                            "is_enabled TINYINT(1) DEFAULT 0, " +
                            "activation_fee_paid TINYINT(1) DEFAULT 0, " +
                            "commission_percentage DECIMAL(5, 2) DEFAULT 10.00, " +
                            "enabled_at DATETIME NULL, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                            ")");

                    // 2. Items Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_items (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "name VARCHAR(255) NOT NULL, " +
                            "description TEXT NULL, " +
                            "image_url TEXT NULL, " +
                            "manager_id INT NOT NULL, " +
                            "category VARCHAR(100) NULL, " +
                            "is_official TINYINT(1) DEFAULT 1, " +
                            "rating FLOAT DEFAULT 0.0, " +
                            "status VARCHAR(50) DEFAULT 'draft', " +
                            "admin_status VARCHAR(50) DEFAULT 'pending_review', " +
                            "event_id INT NULL, " +
                            "attributes_schema JSON NULL, " +
                            "delivery_methods JSON NULL, " +
                            "max_per_person INT DEFAULT 5, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                            ")");

                    // 3. Variants Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_variants (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "item_id INT NOT NULL, " +
                            "sku VARCHAR(100) NULL, " +
                            "attributes JSON NULL, " +
                            "price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, " +
                            "stock INT DEFAULT 0, " +
                            "is_active TINYINT(1) DEFAULT 1, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (item_id) REFERENCES merchandise_items(id) ON DELETE CASCADE" +
                            ")");

                    // 4. Orders Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_orders (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "user_id INT NOT NULL, " +
                            "total_amount DECIMAL(10, 2) NOT NULL, " +
                            "total_commission DECIMAL(10, 2) NOT NULL, " +
                            "net_amount DECIMAL(10, 2) NOT NULL, " +
                            "status VARCHAR(50) DEFAULT 'completed', " +
                            "payment_method VARCHAR(50) DEFAULT 'card', " +
                            "idempotency_key VARCHAR(255) UNIQUE NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 5. Order Items Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_order_items (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "order_id INT NOT NULL, " +
                            "variant_id INT NOT NULL, " +
                            "quantity INT NOT NULL, " +
                            "unit_price DECIMAL(10, 2) NOT NULL, " +
                            "FOREIGN KEY (order_id) REFERENCES merchandise_orders(id) ON DELETE CASCADE, " +
                            "FOREIGN KEY (variant_id) REFERENCES merchandise_variants(id)" +
                            ")");

                    // 6. Reviews Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_reviews (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "item_id INT NOT NULL, " +
                            "user_id INT NOT NULL, " +
                            "user_name VARCHAR(255) NOT NULL, " +
                            "rating INT NOT NULL, " +
                            "comment TEXT NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (item_id) REFERENCES merchandise_items(id) ON DELETE CASCADE" +
                            ")");

                } else { // SQLite
                    // 1. Settings Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_settings (" +
                            "manager_id INTEGER PRIMARY KEY, " +
                            "is_enabled INTEGER DEFAULT 0, " +
                            "activation_fee_paid INTEGER DEFAULT 0, " +
                            "commission_percentage REAL DEFAULT 10.00, " +
                            "enabled_at TEXT NULL, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 2. Items Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_items (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "name TEXT NOT NULL, " +
                            "description TEXT NULL, " +
                            "image_url TEXT NULL, " +
                            "manager_id INTEGER NOT NULL, " +
                            "category TEXT NULL, " +
                            "is_official INTEGER DEFAULT 1, " +
                            "rating REAL DEFAULT 0.0, " +
                            "status TEXT DEFAULT 'draft', " +
                            "admin_status TEXT DEFAULT 'pending_review', " +
                            "event_id INTEGER NULL, " +
                            "attributes_schema TEXT NULL, " +
                            "delivery_methods TEXT NULL, " +
                            "max_per_person INTEGER DEFAULT 5, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 3. Variants Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_variants (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "item_id INTEGER NOT NULL, " +
                            "sku TEXT NULL, " +
                            "attributes TEXT NULL, " +
                            "price REAL NOT NULL DEFAULT 0.00, " +
                            "stock INTEGER DEFAULT 0, " +
                            "is_active INTEGER DEFAULT 1, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (item_id) REFERENCES merchandise_items(id) ON DELETE CASCADE" +
                            ")");

                    // 4. Orders Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_orders (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "user_id INTEGER NOT NULL, " +
                            "total_amount REAL NOT NULL, " +
                            "total_commission REAL NOT NULL, " +
                            "net_amount REAL NOT NULL, " +
                            "status TEXT DEFAULT 'completed', " +
                            "payment_method TEXT DEFAULT 'card', " +
                            "idempotency_key TEXT UNIQUE NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    // 5. Order Items Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_order_items (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "order_id INTEGER NOT NULL, " +
                            "variant_id INTEGER NOT NULL, " +
                            "quantity INTEGER NOT NULL, " +
                            "unit_price REAL NOT NULL, " +
                            "FOREIGN KEY (order_id) REFERENCES merchandise_orders(id) ON DELETE CASCADE, " +
                            "FOREIGN KEY (variant_id) REFERENCES merchandise_variants(id)" +
                            ")");

                    // 6. Reviews Table
                    stmt.execute("CREATE TABLE IF NOT EXISTS merchandise_reviews (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "item_id INTEGER NOT NULL, " +
                            "user_id INTEGER NOT NULL, " +
                            "user_name TEXT NOT NULL, " +
                            "rating INTEGER NOT NULL, " +
                            "comment TEXT NULL, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "FOREIGN KEY (item_id) REFERENCES merchandise_items(id) ON DELETE CASCADE" +
                            ")");
                }

                // Add missing columns dynamic checks (similar to python ALTER columns scripts)
                boolean isMysql = dbProduct.contains("mysql");

                addColumnIfNotExists(conn, "merchandise_orders", "idempotency_key", isMysql ? "VARCHAR(255) UNIQUE" : "TEXT UNIQUE");
                addColumnIfNotExists(conn, "merchandise_items", "category", isMysql ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "merchandise_items", "is_official", isMysql ? "TINYINT(1) DEFAULT 1" : "INTEGER DEFAULT 1");
                addColumnIfNotExists(conn, "merchandise_items", "rating", isMysql ? "FLOAT DEFAULT 0.0" : "REAL DEFAULT 0.0");
                addColumnIfNotExists(conn, "merchandise_items", "status", isMysql ? "VARCHAR(50) DEFAULT 'draft'" : "TEXT DEFAULT 'draft'");
                addColumnIfNotExists(conn, "merchandise_items", "admin_status", isMysql ? "VARCHAR(50) DEFAULT 'pending_review'" : "TEXT DEFAULT 'pending_review'");
                addColumnIfNotExists(conn, "merchandise_items", "event_id", isMysql ? "INT" : "INTEGER");
                addColumnIfNotExists(conn, "merchandise_items", "attributes_schema", isMysql ? "JSON" : "TEXT");
                addColumnIfNotExists(conn, "merchandise_items", "delivery_methods", isMysql ? "JSON" : "TEXT");
                addColumnIfNotExists(conn, "merchandise_items", "max_per_person", isMysql ? "INT DEFAULT 5" : "INTEGER DEFAULT 5");

                addColumnIfNotExists(conn, "merchandise_variants", "sku", isMysql ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "merchandise_variants", "attributes", isMysql ? "JSON" : "TEXT");
                addColumnIfNotExists(conn, "merchandise_variants", "price", isMysql ? "DECIMAL(10, 2) NOT NULL DEFAULT 0.00" : "REAL NOT NULL DEFAULT 0.00");
                addColumnIfNotExists(conn, "merchandise_variants", "stock", isMysql ? "INT DEFAULT 0" : "INTEGER DEFAULT 0");
                addColumnIfNotExists(conn, "merchandise_variants", "is_active", isMysql ? "TINYINT(1) DEFAULT 1" : "INTEGER DEFAULT 1");
            }
            logger.info("[MERCHANDISE DB INITIALIZER] Inicialización y migraciones completadas exitosamente.");
        } catch (Exception e) {
            logger.error("[MERCHANDISE DB INITIALIZER] Error ejecutando inicialización de DB: {}", e.getMessage());
        }
    }

    private void addColumnIfNotExists(Connection conn, String tableName, String columnName, String columnType) {
        try {
            DatabaseMetaData md = conn.getMetaData();
            try (ResultSet rs = md.getColumns(null, null, tableName, columnName)) {
                if (!rs.next()) {
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnType);
                        logger.info("[MERCHANDISE DB INITIALIZER] Columna {} agregada a la tabla {}", columnName, tableName);
                    }
                }
            }
        } catch (Exception e) {
            // Ignore if column already exists or any SQLite alteration constraint issues
            logger.debug("[MERCHANDISE DB INITIALIZER] Advertencia al agregar columna {} a la tabla {}: {}", columnName, tableName, e.getMessage());
        }
    }
}
