package com.laikaclub.tickets.dto;

public class CourtesyQuotaRequest {

    private Long managerUserId;
    private Long eventId;
    private Long eventFunctionId;
    private String sectionName;
    private Integer maxAllowed;

    public CourtesyQuotaRequest() {
    }

    public Long getManagerUserId() {
        return managerUserId;
    }

    public void setManagerUserId(Long managerUserId) {
        this.managerUserId = managerUserId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getEventFunctionId() {
        return eventFunctionId;
    }

    public void setEventFunctionId(Long eventFunctionId) {
        this.eventFunctionId = eventFunctionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Integer getMaxAllowed() {
        return maxAllowed;
    }

    public void setMaxAllowed(Integer maxAllowed) {
        this.maxAllowed = maxAllowed;
    }
}
