package com.laikaclub.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {


    @Value("${spring.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${spring.datasource.mysql.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.mysql.driver-class-name}")
    private String mysqlDriverClassName;

    @Bean
    @SuppressWarnings("null")
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(mysqlDriverClassName);
        dataSource.setUrl(mysqlUrl);
        dataSource.setUsername(mysqlUsername);
        dataSource.setPassword(mysqlPassword);
        return dataSource;
    }

    @Bean
    @SuppressWarnings("null")
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
