package com.laikaclub.admin.config;

import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Configuration
public class JpaConfig {

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(DataSource dataSource) {
        return hibernateProperties -> {
            try (Connection connection = dataSource.getConnection()) {
                String databaseName = connection.getMetaData().getDatabaseProductName().toLowerCase();
                if (databaseName.contains("sqlite")) {
                    hibernateProperties.put(AvailableSettings.DIALECT, "org.hibernate.community.dialect.SQLiteDialect");
                } else {
                    hibernateProperties.put(AvailableSettings.DIALECT, "org.hibernate.dialect.MySQLDialect");
                }
            } catch (SQLException e) {
                hibernateProperties.put(AvailableSettings.DIALECT, "org.hibernate.dialect.MySQLDialect");
            }
        };
    }
}
