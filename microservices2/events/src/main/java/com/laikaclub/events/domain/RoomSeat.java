package com.laikaclub.events.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "room_seats")
public class RoomSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "block_id")
    private Long blockId;

    @Column(name = "zone_id")
    private Long zoneId;

    @Column(name = "seat_type_id", nullable = false)
    private Long seatTypeId;

    @Column(name = "seat_label", nullable = false)
    private String seatLabel;

    @Column(name = "x_position", nullable = false)
    private Double xPosition;

    @Column(name = "y_position", nullable = false)
    private Double yPosition;

    private String status = "active";

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

    public Long getBlockId() {
        return blockId;
    }

    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    public Long getZoneId() {
        return zoneId;
    }

    public void setZoneId(Long zoneId) {
        this.zoneId = zoneId;
    }

    public Long getSeatTypeId() {
        return seatTypeId;
    }

    public void setSeatTypeId(Long seatTypeId) {
        this.seatTypeId = seatTypeId;
    }

    public String getSeatLabel() {
        return seatLabel;
    }

    public void setSeatLabel(String seatLabel) {
        this.seatLabel = seatLabel;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
