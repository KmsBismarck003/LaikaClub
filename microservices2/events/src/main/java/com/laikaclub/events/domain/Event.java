package com.laikaclub.events.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_date")
    private String eventDate;

    @Column(name = "event_time")
    private String eventTime;

    private String location;

    private String venue;

    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "use_seating_map")
    private Boolean useSeatingMap = false;

    private String category;

    private Double price;

    @Column(name = "total_tickets")
    private Integer totalTickets;

    @Column(name = "available_tickets")
    private Integer availableTickets;

    @Column(name = "image_url")
    private String imageUrl;

    private String status = "draft";

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "grid_position_x")
    private Integer gridPositionX = 0;

    @Column(name = "grid_position_y")
    private Integer gridPositionY = 0;

    @Column(name = "grid_span_x")
    private Integer gridSpanX = 1;

    @Column(name = "grid_span_y")
    private Integer gridSpanY = 1;

    @Column(name = "grid_page")
    private Integer gridPage = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Permissions and management fields
    @Column(name = "ads_enabled")
    private Boolean adsEnabled = false;

    @Column(name = "max_ads")
    private Integer maxAds = 5;

    @Column(name = "merch_enabled")
    private Boolean merchEnabled = false;

    @Column(name = "metrics_enabled")
    private Boolean metricsEnabled = false;

    @Column(name = "assigned_manager_id")
    private Long assignedManagerId;

    @Column(name = "municipality_id")
    private Long municipalityId;

    // Presale bank settings
    @Column(name = "presale_enabled")
    private Boolean presaleEnabled = false;

    @Column(name = "presale_bank_name")
    private String presaleBankName;

    @Column(name = "presale_bins", columnDefinition = "TEXT")
    private String presaleBins;

    @Column(name = "presale_start")
    private String presaleStart;

    @Column(name = "presale_end")
    private String presaleEnd;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getEventTime() {
        return eventTime;
    }

    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Boolean getUseSeatingMap() {
        return useSeatingMap;
    }

    public void setUseSeatingMap(Boolean useSeatingMap) {
        this.useSeatingMap = useSeatingMap;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(Integer totalTickets) {
        this.totalTickets = totalTickets;
    }

    public Integer getAvailableTickets() {
        return availableTickets;
    }

    public void setAvailableTickets(Integer availableTickets) {
        this.availableTickets = availableTickets;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Integer getGridPositionX() {
        return gridPositionX;
    }

    public void setGridPositionX(Integer gridPositionX) {
        this.gridPositionX = gridPositionX;
    }

    public Integer getGridPositionY() {
        return gridPositionY;
    }

    public void setGridPositionY(Integer gridPositionY) {
        this.gridPositionY = gridPositionY;
    }

    public Integer getGridSpanX() {
        return gridSpanX;
    }

    public void setGridSpanX(Integer gridSpanX) {
        this.gridSpanX = gridSpanX;
    }

    public Integer getGridSpanY() {
        return gridSpanY;
    }

    public void setGridSpanY(Integer gridSpanY) {
        this.gridSpanY = gridSpanY;
    }

    public Integer getGridPage() {
        return gridPage;
    }

    public void setGridPage(Integer gridPage) {
        this.gridPage = gridPage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getAdsEnabled() {
        return adsEnabled;
    }

    public void setAdsEnabled(Boolean adsEnabled) {
        this.adsEnabled = adsEnabled;
    }

    public Integer getMaxAds() {
        return maxAds;
    }

    public void setMaxAds(Integer maxAds) {
        this.maxAds = maxAds;
    }

    public Boolean getMerchEnabled() {
        return merchEnabled;
    }

    public void setMerchEnabled(Boolean merchEnabled) {
        this.merchEnabled = merchEnabled;
    }

    public Boolean getMetricsEnabled() {
        return metricsEnabled;
    }

    public void setMetricsEnabled(Boolean metricsEnabled) {
        this.metricsEnabled = metricsEnabled;
    }

    public Long getAssignedManagerId() {
        return assignedManagerId;
    }

    public void setAssignedManagerId(Long assignedManagerId) {
        this.assignedManagerId = assignedManagerId;
    }

    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }

    public Boolean getPresaleEnabled() {
        return presaleEnabled;
    }

    public void setPresaleEnabled(Boolean presaleEnabled) {
        this.presaleEnabled = presaleEnabled;
    }

    public String getPresaleBankName() {
        return presaleBankName;
    }

    public void setPresaleBankName(String presaleBankName) {
        this.presaleBankName = presaleBankName;
    }

    public String getPresaleBins() {
        return presaleBins;
    }

    public void setPresaleBins(String presaleBins) {
        this.presaleBins = presaleBins;
    }

    public String getPresaleStart() {
        return presaleStart;
    }

    public void setPresaleStart(String presaleStart) {
        this.presaleStart = presaleStart;
    }

    public String getPresaleEnd() {
        return presaleEnd;
    }

    public void setPresaleEnd(String presaleEnd) {
        this.presaleEnd = presaleEnd;
    }
}
