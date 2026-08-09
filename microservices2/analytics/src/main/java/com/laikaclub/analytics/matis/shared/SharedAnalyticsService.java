package com.laikaclub.analytics.matis.shared;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class SharedAnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(SharedAnalyticsService.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Autowired
    public SharedAnalyticsService(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    public JdbcTemplate getJdbcTemplate() {
        return jdbcTemplate;
    }

    public boolean isResilienceMode() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.getMetaData().getDatabaseProductName().toLowerCase().contains("sqlite");
        } catch (Exception e) {
            return true;
        }
    }

    public List<String> getAvailableTables() {
        return List.of("tickets", "users", "payments", "events");
    }

    public List<String> getArtistSuggestions() {
        try {
            return jdbcTemplate.queryForList("SELECT DISTINCT name FROM events", String.class);
        } catch (Exception e) {
            logger.error("Error fetching suggestions: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
