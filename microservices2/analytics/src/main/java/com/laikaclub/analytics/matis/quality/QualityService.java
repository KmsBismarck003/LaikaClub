package com.laikaclub.analytics.matis.quality;

import com.laikaclub.analytics.matis.shared.SharedAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class QualityService {

    private static final Logger logger = LoggerFactory.getLogger(QualityService.class);

    private final JdbcTemplate jdbcTemplate;
    private final SharedAnalyticsService sharedService;

    @Autowired
    public QualityService(JdbcTemplate jdbcTemplate, SharedAnalyticsService sharedService) {
        this.jdbcTemplate = jdbcTemplate;
        this.sharedService = sharedService;
    }

    public Map<String, Object> runSaneamiento(String tableName) {
        Map<String, Object> result = new HashMap<>();
        result.put("table", tableName);
        result.put("timestamp", LocalDateTime.now().toString());

        try {
            boolean isSqlite = sharedService.isResilienceMode();

            // 1. Total records before
            Integer totalBefore = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
            result.put("total_records_before", totalBefore != null ? totalBefore : 0);

            // 2. Count duplicates
            Integer duplicatesCount = 0;
            try {
                duplicatesCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(id) - COUNT(DISTINCT id) FROM " + tableName, Integer.class
                );
            } catch (Exception e) {
                logger.warn("Could not calculate duplicates: {}", e.getMessage());
            }
            result.put("duplicates_removed", duplicatesCount != null ? duplicatesCount : 0);

            // 3. Count nulls & Impute values
            int nullsImputed = 0;
            Map<String, Integer> imputedDetails = new HashMap<>();

            if ("tickets".equalsIgnoreCase(tableName)) {
                Integer nullPrices = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tickets WHERE price IS NULL OR price = 0", Integer.class);
                if (nullPrices != null && nullPrices > 0) {
                    jdbcTemplate.update("UPDATE tickets SET price = 50.0 WHERE price IS NULL OR price = 0");
                    nullsImputed += nullPrices;
                    imputedDetails.put("price", nullPrices);
                }
                Integer nullTypes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tickets WHERE ticket_type IS NULL OR ticket_type = ''", Integer.class);
                if (nullTypes != null && nullTypes > 0) {
                    jdbcTemplate.update("UPDATE tickets SET ticket_type = 'STAND' WHERE ticket_type IS NULL OR ticket_type = ''");
                    nullsImputed += nullTypes;
                    imputedDetails.put("ticket_type", nullTypes);
                }
            } else if ("payments".equalsIgnoreCase(tableName)) {
                Integer nullAmounts = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments WHERE amount IS NULL OR amount = 0", Integer.class);
                if (nullAmounts != null && nullAmounts > 0) {
                    jdbcTemplate.update("UPDATE payments SET amount = 50.0 WHERE amount IS NULL OR amount = 0");
                    nullsImputed += nullAmounts;
                    imputedDetails.put("amount", nullAmounts);
                }
                Integer nullMethods = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments WHERE payment_method IS NULL OR payment_method = ''", Integer.class);
                if (nullMethods != null && nullMethods > 0) {
                    jdbcTemplate.update("UPDATE payments SET payment_method = 'Tarjeta' WHERE payment_method IS NULL OR payment_method = ''");
                    nullsImputed += nullMethods;
                    imputedDetails.put("payment_method", nullMethods);
                }
            } else if ("events".equalsIgnoreCase(tableName)) {
                Integer nullPrices = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM events WHERE price IS NULL OR price = 0", Integer.class);
                if (nullPrices != null && nullPrices > 0) {
                    jdbcTemplate.update("UPDATE events SET price = 30.0 WHERE price IS NULL OR price = 0");
                    nullsImputed += nullPrices;
                    imputedDetails.put("price", nullPrices);
                }
                Integer nullCategories = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM events WHERE category IS NULL OR category = ''", Integer.class);
                if (nullCategories != null && nullCategories > 0) {
                    jdbcTemplate.update("UPDATE events SET category = 'General' WHERE category IS NULL OR category = ''");
                    nullsImputed += nullCategories;
                    imputedDetails.put("category", nullCategories);
                }
            }

            // Remove duplicates
            if (duplicatesCount != null && duplicatesCount > 0) {
                try {
                    if (isSqlite) {
                        jdbcTemplate.update("DELETE FROM " + tableName + " WHERE id NOT IN (SELECT MIN(id) FROM " + tableName + " GROUP BY id)");
                    } else {
                        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
                        jdbcTemplate.update("DELETE t1 FROM " + tableName + " t1 INNER JOIN " + tableName + " t2 WHERE t1.id > t2.id AND t1.id = t2.id");
                        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
                    }
                } catch (Exception e) {
                    logger.error("Error removing duplicates: {}", e.getMessage());
                }
            }

            Integer totalAfter = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
            result.put("total_records_after", totalAfter != null ? totalAfter : 0);
            result.put("nulls_imputed", nullsImputed);
            result.put("imputed_details", imputedDetails);
            result.put("status", "success");

        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
        }

        return result;
    }

    public Map<String, Object> getDataQualityStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            int nullEmails = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE email IS NULL OR email = ''", Integer.class);
            int duplicateUserEmails = jdbcTemplate.queryForObject("SELECT COUNT(email) - COUNT(DISTINCT email) FROM users WHERE email IS NOT NULL AND email != ''", Integer.class);
            int outlierTickets = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tickets WHERE price > 1000", Integer.class);
            int totalTickets = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tickets", Integer.class);
            int totalUsers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);

            stats.put("null_emails", nullEmails);
            stats.put("duplicate_emails", duplicateUserEmails);
            stats.put("outlier_tickets", outlierTickets);
            stats.put("total_tickets", totalTickets);
            stats.put("total_users", totalUsers);
            stats.put("data_integrity_score", totalTickets == 0 ? 100.0 : Math.round((1.0 - (double) outlierTickets / totalTickets) * 100.0));
            stats.put("status", "success");
        } catch (Exception e) {
            stats.put("status", "error");
            stats.put("message", e.getMessage());
        }
        return stats;
    }
}
