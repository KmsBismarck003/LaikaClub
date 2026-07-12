package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "seating_blocks")
public class SeatingBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    private String name;

    @Column(name = "x_position", nullable = false)
    private Double xPosition;

    @Column(name = "y_position", nullable = false)
    private Double yPosition;

    private Double rotation = 0.0;

    @Column(columnDefinition = "TEXT")
    private String config;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getxPosition() {
        return xPosition;
    }

    public void setxPosition(Double xPosition) {
        this.xPosition = xPosition;
    }

    public Double getyPosition() {
        return yPosition;
    }

    public void setyPosition(Double yPosition) {
        this.yPosition = yPosition;
    }

    public Double getRotation() {
        return rotation;
    }

    public void setRotation(Double rotation) {
        this.rotation = rotation;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }
}
