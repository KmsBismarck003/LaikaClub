package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "municipalities")
public class Municipality {

    @Id
    private Long id;

    @Column(name = "state_id", nullable = false)
    private Long stateId;

    private String name;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStateId() {
        return stateId;
    }

    public void setStateId(Long stateId) {
        this.stateId = stateId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
