package com.laikaclub.admin.dto;

import java.time.LocalDate;

public class ContractDTO {
    private Long id;
    private Long organizationId;
    private String name;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxEvents;
    private Boolean isUnlimited;
    private Integer maxFunctionsPerEvent;
    private Boolean merchEnabled;
    private Boolean seatingMapEnabled;
    private Boolean metricsEnabled;
    private Boolean adsEnabled;
    private Integer maxAdsPerEvent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getMaxEvents() { return maxEvents; }
    public void setMaxEvents(Integer maxEvents) { this.maxEvents = maxEvents; }
    public Boolean getIsUnlimited() { return isUnlimited; }
    public void setIsUnlimited(Boolean isUnlimited) { this.isUnlimited = isUnlimited; }
    public Integer getMaxFunctionsPerEvent() { return maxFunctionsPerEvent; }
    public void setMaxFunctionsPerEvent(Integer maxFunctionsPerEvent) { this.maxFunctionsPerEvent = maxFunctionsPerEvent; }
    public Boolean getMerchEnabled() { return merchEnabled; }
    public void setMerchEnabled(Boolean merchEnabled) { this.merchEnabled = merchEnabled; }
    public Boolean getSeatingMapEnabled() { return seatingMapEnabled; }
    public void setSeatingMapEnabled(Boolean seatingMapEnabled) { this.seatingMapEnabled = seatingMapEnabled; }
    public Boolean getMetricsEnabled() { return metricsEnabled; }
    public void setMetricsEnabled(Boolean metricsEnabled) { this.metricsEnabled = metricsEnabled; }
    public Boolean getAdsEnabled() { return adsEnabled; }
    public void setAdsEnabled(Boolean adsEnabled) { this.adsEnabled = adsEnabled; }
    public Integer getMaxAdsPerEvent() { return maxAdsPerEvent; }
    public void setMaxAdsPerEvent(Integer maxAdsPerEvent) { this.maxAdsPerEvent = maxAdsPerEvent; }
}
