package com.laikaclub.tickets.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TicketVerify {
    private String ticketCode;
    private Long operatorId;
    private String operatorName;
    private String platform;
    private String deviceInfo;
    private String accessPoint;
    private Long selectedEventId;
    private Long selectedFunctionId;
    private String actionType;

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getPlatform() {
        return platform != null ? platform : "WEB_OPERATOR";
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getDeviceInfo() {
        return deviceInfo != null ? deviceInfo : "Estación Operativa";
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getAccessPoint() {
        return accessPoint != null ? accessPoint : "Puerta Principal";
    }

    public void setAccessPoint(String accessPoint) {
        this.accessPoint = accessPoint;
    }

    public Long getSelectedEventId() {
        return selectedEventId;
    }

    public void setSelectedEventId(Long selectedEventId) {
        this.selectedEventId = selectedEventId;
    }

    public Long getSelectedFunctionId() {
        return selectedFunctionId;
    }

    public void setSelectedFunctionId(Long selectedFunctionId) {
        this.selectedFunctionId = selectedFunctionId;
    }

    public String getActionType() {
        return actionType != null ? actionType : "VERIFY";
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
}

