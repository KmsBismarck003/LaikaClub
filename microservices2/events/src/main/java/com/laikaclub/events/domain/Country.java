package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "countries")
public class Country {

    @Id
    private Long id;

    private String name;

    private String code;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
