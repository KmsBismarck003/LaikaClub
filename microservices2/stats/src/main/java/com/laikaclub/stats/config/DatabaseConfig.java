package com.laikaclub.stats.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${spring.datasource.mysql.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.mysql.driver-class-name}")
    private String mysqlDriverClassName;

    @Value("${spring.datasource.sqlite.url}")
    private String sqliteUrl;

    @Value("${spring.datasource.sqlite.driver-class-name}")
    private String sqliteDriverClassName;

    @Bean
    @Primary
    @SuppressWarnings("null")
    public DataSource dataSource() {
        logger.info("[STATS SERVICE] Verificando conexión a la base de datos MySQL...");
        
        if (testConnection(mysqlUrl, mysqlUsername, mysqlPassword)) {
            logger.info("[STATS SERVICE] Conexión MySQL establecida exitosamente.");
            DriverManagerDataSource dataSource = new DriverManagerDataSource();
            dataSource.setDriverClassName(mysqlDriverClassName);
            dataSource.setUrl(mysqlUrl);
            dataSource.setUsername(mysqlUsername);
            dataSource.setPassword(mysqlPassword);
            return dataSource;
        } else {
            logger.warn("[STATS SERVICE] MySQL no está disponible. Conmutando a SQLite local (Fallback)...");
            DriverManagerDataSource dataSource = new DriverManagerDataSource();
            dataSource.setDriverClassName(sqliteDriverClassName);
            dataSource.setUrl(sqliteUrl);
            return dataSource;
        }
    }

    private boolean testConnection(String url, String username, String password) {
        Properties props = new Properties();
        props.setProperty("user", username);
        props.setProperty("password", password);
        props.setProperty("connectTimeout", "2000");
        props.setProperty("socketTimeout", "2000");

        try {
            Class.forName(mysqlDriverClassName);
            try (Connection conn = DriverManager.getConnection(url, props)) {
                return conn != null;
            }
        } catch (Exception e) {
            logger.debug("Error probando conexión a MySQL: {}", e.getMessage());
            return false;
        }
    }
}
