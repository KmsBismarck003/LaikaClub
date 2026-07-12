package com.laikaclub.tickets.config;

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
            logger.info("[TICKETS DB INITIALIZER] Ejecutando migraciones sobre: {}", dbProduct);

            try (Statement stmt = conn.createStatement()) {
                if (dbProduct.contains("mysql")) {
                    stmt.execute("CREATE TABLE IF NOT EXISTS tickets (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "user_id INT NOT NULL, " +
                            "event_id INT NOT NULL, " +
                            "ticket_code VARCHAR(100) UNIQUE NOT NULL, " +
                            "qr_data TEXT, " +
                            "section_name VARCHAR(100), " +
                            "seat_id VARCHAR(100), " +
                            "price DOUBLE DEFAULT 0, " +
                            "status VARCHAR(50) DEFAULT 'active', " +
                            "payment_method VARCHAR(50), " +
                            "redeemed_at VARCHAR(100), " +
                            "purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "event_function_id INT" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS payments (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "user_id INT NOT NULL, " +
                            "event_id INT, " +
                            "amount DOUBLE NOT NULL, " +
                            "payment_method VARCHAR(50), " +
                            "status VARCHAR(50) DEFAULT 'completed', " +
                            "reference VARCHAR(100), " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS transfer_tokens (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY, " +
                            "token VARCHAR(64) UNIQUE NOT NULL, " +
                            "ticket_id INT NOT NULL, " +
                            "owner_id INT NOT NULL, " +
                            "expires_at DATETIME NOT NULL, " +
                            "claimed_by INT DEFAULT NULL, " +
                            "claimed_at DATETIME DEFAULT NULL, " +
                            "is_used TINYINT(1) DEFAULT 0, " +
                            "created_at DATETIME DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    try {
                        stmt.execute("ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50)");
                    } catch (Exception ignored) {}
                    try {
                        stmt.execute("ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'");
                    } catch (Exception ignored) {}

                } else { // SQLite
                    stmt.execute("CREATE TABLE IF NOT EXISTS tickets (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "user_id INTEGER NOT NULL, " +
                            "event_id INTEGER NOT NULL, " +
                            "ticket_code TEXT UNIQUE NOT NULL, " +
                            "qr_data TEXT, " +
                            "section_name TEXT, " +
                            "seat_id TEXT, " +
                            "price REAL DEFAULT 0, " +
                            "status TEXT DEFAULT 'active', " +
                            "payment_method TEXT, " +
                            "redeemed_at TEXT, " +
                            "purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                            "event_function_id INTEGER" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS payments (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "user_id INTEGER NOT NULL, " +
                            "event_id INTEGER, " +
                            "amount REAL NOT NULL, " +
                            "payment_method TEXT, " +
                            "status TEXT DEFAULT 'completed', " +
                            "reference TEXT, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");

                    stmt.execute("CREATE TABLE IF NOT EXISTS transfer_tokens (" +
                            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                            "token TEXT UNIQUE NOT NULL, " +
                            "ticket_id INTEGER NOT NULL, " +
                            "owner_id INTEGER NOT NULL, " +
                            "expires_at TEXT NOT NULL, " +
                            "claimed_by INTEGER DEFAULT NULL, " +
                            "claimed_at TEXT DEFAULT NULL, " +
                            "is_used INTEGER DEFAULT 0, " +
                            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                            ")");
                }

                addColumnIfNotExists(conn, "tickets", "purchase_date", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
                addColumnIfNotExists(conn, "tickets", "section_name", dbProduct.contains("mysql") ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "tickets", "seat_id", dbProduct.contains("mysql") ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "tickets", "price", dbProduct.contains("mysql") ? "DOUBLE DEFAULT 0" : "REAL DEFAULT 0");
                addColumnIfNotExists(conn, "tickets", "payment_method", dbProduct.contains("mysql") ? "VARCHAR(50)" : "TEXT");
                addColumnIfNotExists(conn, "tickets", "qr_data", "TEXT");
                addColumnIfNotExists(conn, "tickets", "redeemed_at", dbProduct.contains("mysql") ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "tickets", "event_function_id", dbProduct.contains("mysql") ? "INT" : "INTEGER");
                addColumnIfNotExists(conn, "payments", "event_id", dbProduct.contains("mysql") ? "INT" : "INTEGER");
                addColumnIfNotExists(conn, "payments", "reference", dbProduct.contains("mysql") ? "VARCHAR(100)" : "TEXT");
                addColumnIfNotExists(conn, "payments", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            }
            logger.info("[TICKETS DB INITIALIZER] Migración completada exitosamente.");
        } catch (Exception e) {
            logger.error("[TICKETS DB INITIALIZER] Error ejecutando migraciones de inicio: {}", e.getMessage());
        }
    }

    private void addColumnIfNotExists(Connection conn, String tableName, String columnName, String columnType) {
        try {
            DatabaseMetaData md = conn.getMetaData();
            try (ResultSet rs = md.getColumns(null, null, tableName, columnName)) {
                if (!rs.next()) {
                    try (Statement stmt = conn.createStatement()) {
                        stmt.execute("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnType);
                        logger.info("[TICKETS DB INITIALIZER] Columna {} agregada a la tabla {}", columnName, tableName);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("[TICKETS DB INITIALIZER] Advertencia al agregar columna {} a la tabla {}: {}", columnName, tableName, e.getMessage());
        }
    }
}
