package com.laikaclub.admin.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    private String status = "ACTIVE"; // ACTIVE, FINISHED, PENDING

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "max_events")
    private Integer maxEvents;

    @Column(name = "is_unlimited")
    private Boolean isUnlimited = false;

    @Column(name = "max_functions_per_event")
    private Integer maxFunctionsPerEvent = 1;

    @Column(name = "merch_enabled")
    private Boolean merchEnabled = false;

    @Column(name = "seating_map_enabled")
    private Boolean seatingMapEnabled = false;

    @Column(name = "metrics_enabled")
    private Boolean metricsEnabled = false;

    @Column(name = "ads_enabled")
    private Boolean adsEnabled = false;

    @Column(name = "max_ads_per_event")
    private Integer maxAdsPerEvent = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getMaxEvents() {
        return maxEvents;
    }

    public void setMaxEvents(Integer maxEvents) {
        this.maxEvents = maxEvents;
    }

    public Boolean getIsUnlimited() {
        return isUnlimited;
    }

    public void setIsUnlimited(Boolean isUnlimited) {
        this.isUnlimited = isUnlimited;
    }

    public Integer getMaxFunctionsPerEvent() {
        return maxFunctionsPerEvent;
    }

    public void setMaxFunctionsPerEvent(Integer maxFunctionsPerEvent) {
        this.maxFunctionsPerEvent = maxFunctionsPerEvent;
    }

    public Boolean getMerchEnabled() {
        return merchEnabled;
    }

    public void setMerchEnabled(Boolean merchEnabled) {
        this.merchEnabled = merchEnabled;
    }

    public Boolean getSeatingMapEnabled() {
        return seatingMapEnabled;
    }

    public void setSeatingMapEnabled(Boolean seatingMapEnabled) {
        this.seatingMapEnabled = seatingMapEnabled;
    }

    public Boolean getMetricsEnabled() {
        return metricsEnabled;
    }

    public void setMetricsEnabled(Boolean metricsEnabled) {
        this.metricsEnabled = metricsEnabled;
    }

    public Boolean getAdsEnabled() {
        return adsEnabled;
    }

    public void setAdsEnabled(Boolean adsEnabled) {
        this.adsEnabled = adsEnabled;
    }

    public Integer getMaxAdsPerEvent() {
        return maxAdsPerEvent;
    }

    public void setMaxAdsPerEvent(Integer maxAdsPerEvent) {
        this.maxAdsPerEvent = maxAdsPerEvent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
