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
}
