package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "states")
public class State {

    @Id
    private Long id;

    @Column(name = "country_id", nullable = false)
    private Long countryId;

    private String name;

    private String code;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCountryId() {
        return countryId;
    }

    public void setCountryId(Long countryId) {
        this.countryId = countryId;
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
