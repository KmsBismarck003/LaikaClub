package com.laikaclub.analytics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VaultService {

    private static final Logger logger = LoggerFactory.getLogger(VaultService.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    @Autowired
    public VaultService(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    private boolean isSqlite() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.getMetaData().getDatabaseProductName().toLowerCase().contains("sqlite");
        } catch (Exception e) {
            return true;
        }
    }

    public Map<String, Object> syncMysqlToMongo(String backupType, List<String> tablesToSync) {
        Map<String, Object> response = new HashMap<>();
        if (mongoTemplate == null) {
            response.put("status", "error");
            response.put("message", "MongoDB no está configurado o no disponible.");
            return response;
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String snapshotId = "nosql_snapshot_" + timestamp;
        List<String> tables = tablesToSync != null && !tablesToSync.isEmpty() ? tablesToSync : List.of("tickets", "users", "payments", "events");

        Map<String, Object> syncedTables = new HashMap<>();
        long totalRecords = 0;

        try {
            boolean isSqliteDb = isSqlite();

            for (String table : tables) {
                // Check if table exists
                try {
                    jdbcTemplate.execute("SELECT 1 FROM " + table + " LIMIT 1");
                } catch (Exception e) {
                    logger.warn("Table {} does not exist, skipping.", table);
                    continue;
                }

                // Check created_at column for incremental backup
                boolean hasCreatedAt = false;
                try (Connection conn = dataSource.getConnection()) {
                    DatabaseMetaData meta = conn.getMetaData();
                    try (ResultSet rs = meta.getColumns(null, null, table, "created_at")) {
                        if (rs.next()) {
                            hasCreatedAt = true;
                        }
                    }
                } catch (Exception ignored) {}

                String query = "SELECT * FROM " + table;
                if ("incremental".equalsIgnoreCase(backupType) && hasCreatedAt) {
                    if (isSqliteDb) {
                        query += " WHERE created_at >= date('now', '-7 days')";
                    } else {
                        query += " WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                    }
                }

                List<Map<String, Object>> rows = jdbcTemplate.queryForList(query);
                List<Map<String, Object>> mongoDocs = new ArrayList<>();

                for (Map<String, Object> row : rows) {
                    // Convert column names to lower case to ensure compatibility
                    Map<String, Object> doc = new LinkedHashMap<>();
                    for (Map.Entry<String, Object> entry : row.entrySet()) {
                        doc.put(entry.getKey().toLowerCase(), entry.getValue());
                    }
                    doc.put("_table_name", table.toLowerCase());
                    mongoDocs.add(doc);
                }

                if (!mongoDocs.isEmpty()) {
                    mongoTemplate.insert(mongoDocs, snapshotId);
                }

                syncedTables.put(table, Map.of(
                    "status", "Capturado (Java)",
                    "records", mongoDocs.size()
                ));
                totalRecords += mongoDocs.size();
            }

            // Write metadata
            Map<String, Object> metadata = new LinkedHashMap<>();
            metadata.put("snapshot_id", snapshotId);
            metadata.put("created_at", new Date());
            metadata.put("type", backupType + " (Direct)");
            metadata.put("tables", tables);
            metadata.put("status", "success");
            metadata.put("total_records", totalRecords);

            mongoTemplate.insert(metadata, "nosql_vault_metadata");

            response.put("status", "success");
            response.put("snapshot_id", snapshotId);
            response.put("method", "Lightweight Sync");
            response.put("synced_tables", syncedTables);
            response.put("timestamp", LocalDateTime.now().toString());

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }

    public List<Map<String, Object>> listNosqlSnapshots() {
        List<Map<String, Object>> formatted = new ArrayList<>();
        if (mongoTemplate == null) {
            return formatted;
        }

        try {
            Query query = new Query().with(Sort.by(Sort.Direction.DESC, "created_at"));
            List<Map> metadata = mongoTemplate.find(query, Map.class, "nosql_vault_metadata");

            if (!metadata.isEmpty()) {
                for (Map m : metadata) {
                    Object dateObj = m.get("created_at");
                    String dateStr = dateObj != null ? dateObj.toString() : "";
                    
                    formatted.add(Map.of(
                        "id", m.get("snapshot_id"),
                        "created_at", dateStr,
                        "type", String.valueOf(m.getOrDefault("type", "completo")).toUpperCase(),
                        "size_docs", m.getOrDefault("total_records", 0),
                        "status", m.getOrDefault("status", "success")
                    ));
                }
            } else {
                // Fallback: list collections matching pattern
                Set<String> collections = mongoTemplate.getCollectionNames();
                for (String name : collections) {
                    if (name.startsWith("nosql_snapshot_")) {
                        long count = mongoTemplate.count(new Query(), name);
                        String createdTime = name.replace("nosql_snapshot_", "").replace("_", " ");
                        formatted.add(Map.of(
                            "id", name,
                            "created_at", createdTime,
                            "type", "COMPLETO",
                            "size_docs", count,
                            "status", "success"
                        ));
                    }
                }
                formatted.sort((a, b) -> String.valueOf(b.get("id")).compareTo(String.valueOf(a.get("id"))));
            }
        } catch (Exception e) {
            logger.error("Error listing NoSQL snapshots: {}", e.getMessage());
        }

        return formatted;
    }

    public Map<String, Object> deleteNosqlSnapshot(String snapshotId) {
        if (mongoTemplate == null) {
            return Map.of("status", "error", "message", "MongoDB no configurado.");
        }

        try {
            mongoTemplate.dropCollection(snapshotId);
            mongoTemplate.remove(new Query(Criteria.where("snapshot_id").is(snapshotId)), "nosql_vault_metadata");
            return Map.of("status", "success", "message", "Snapshot " + snapshotId + " eliminado");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    public Map<String, Object> restoreNosqlSnapshot(String snapshotId) {
        if (mongoTemplate == null) {
            return Map.of("status", "error", "message", "MongoDB no configurado.");
        }

        try {
            // Find metadata
            Map meta = mongoTemplate.findOne(new Query(Criteria.where("snapshot_id").is(snapshotId)), Map.class, "nosql_vault_metadata");
            List<String> tables = new ArrayList<>();
            if (meta != null && meta.containsKey("tables")) {
                Object tablesObj = meta.get("tables");
                if (tablesObj instanceof List) {
                    for (Object t : (List) tablesObj) {
                        tables.add(String.valueOf(t));
                    }
                }
            }

            if (tables.isEmpty()) {
                tables = List.of("tickets", "users", "payments", "events");
            }

            boolean isSqliteDb = isSqlite();

            if (!isSqliteDb) {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            }

            for (String table : tables) {
                // Clear table
                if (isSqliteDb) {
                    jdbcTemplate.execute("DELETE FROM " + table);
                } else {
                    jdbcTemplate.execute("TRUNCATE TABLE " + table);
                }

                // Query data from Mongo
                Query q = new Query(Criteria.where("_table_name").is(table.toLowerCase()));
                List<Map> data = mongoTemplate.find(q, Map.class, snapshotId);

                if (data.isEmpty()) {
                    continue;
                }

                // Identify columns
                Map firstRow = data.get(0);
                Set<String> columns = new LinkedHashSet<>();
                for (Object k : firstRow.keySet()) {
                    String col = String.valueOf(k);
                    if (!"_id".equals(col) && !"_table_name".equals(col)) {
                        columns.add(col);
                    }
                }

                if (columns.isEmpty()) {
                    continue;
                }

                String colsStr = String.join(", ", columns);
                String placeholders = String.join(", ", Collections.nCopies(columns.size(), "?"));
                String insertSql = "INSERT INTO " + table + " (" + colsStr + ") VALUES (" + placeholders + ")";

                List<Object[]> batchArgs = new ArrayList<>();
                for (Map row : data) {
                    Object[] args = new Object[columns.size()];
                    int idx = 0;
                    for (String col : columns) {
                        args[idx++] = row.get(col);
                    }
                    batchArgs.add(args);
                }

                jdbcTemplate.batchUpdate(insertSql, batchArgs);
            }

            if (!isSqliteDb) {
                jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            }

            return Map.of("status", "success", "message", "Restauración manual de " + snapshotId + " exitosa");

        } catch (Exception e) {
            logger.error("Error restoring NoSQL snapshot: {}", e.getMessage());
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    public Map<String, Object> getVaultStatus() {
        if (mongoTemplate == null) {
            return Map.of("ready", false, "message", "MongoDB no disponible.");
        }

        try {
            long count = mongoTemplate.count(new Query(), "nosql_vault_metadata");
            return Map.of(
                "ready", true,
                "snapshots_count", count,
                "storage", "MongoDB Atlas"
            );
        } catch (Exception e) {
            return Map.of("ready", false, "message", e.getMessage());
        }
    }

    public List<Map<String, Object>> getSnapshotData(String snapshotId) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (mongoTemplate == null) {
            return result;
        }

        try {
            List<Map> raw = mongoTemplate.findAll(Map.class, snapshotId);
            for (Map r : raw) {
                Map<String, Object> doc = new LinkedHashMap<>();
                for (Object k : r.keySet()) {
                    String key = String.valueOf(k);
                    if (!"_id".equals(key)) {
                        doc.put(key, r.get(key));
                    }
                }
                result.add(doc);
            }
        } catch (Exception e) {
            logger.error("Error reading snapshot data: {}", e.getMessage());
        }
        return result;
    }
}
