package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @Column(name = "`key`", nullable = false)
    private String key;

    @Column(name = "`value`", columnDefinition = "TEXT")
    private String value;

    // Getters and setters
    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
