package com.laikaclub.tickets.dto;

import java.util.List;
import java.util.Map;

public class CourtesySummaryResponse {

    private int totalQuotaAllowed;
    private int totalQuotaIssued;
    private int totalQuotaRemaining;
    private long totalTickets;
    private long assignedCount;
    private long pendingClaimCount;
    private long usedCount;
    private long cancelledCount;
    private List<Map<String, Object>> quotas;
    private List<Map<String, Object>> issuances;
    private List<Map<String, Object>> tickets;

    public CourtesySummaryResponse() {
    }

    public int getTotalQuotaAllowed() {
        return totalQuotaAllowed;
    }

    public void setTotalQuotaAllowed(int totalQuotaAllowed) {
        this.totalQuotaAllowed = totalQuotaAllowed;
    }

    public int getTotalQuotaIssued() {
        return totalQuotaIssued;
    }

    public void setTotalQuotaIssued(int totalQuotaIssued) {
        this.totalQuotaIssued = totalQuotaIssued;
    }

    public int getTotalQuotaRemaining() {
        return totalQuotaRemaining;
    }

    public void setTotalQuotaRemaining(int totalQuotaRemaining) {
        this.totalQuotaRemaining = totalQuotaRemaining;
    }

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getAssignedCount() {
        return assignedCount;
    }

    public void setAssignedCount(long assignedCount) {
        this.assignedCount = assignedCount;
    }

    public long getPendingClaimCount() {
        return pendingClaimCount;
    }

    public void setPendingClaimCount(long pendingClaimCount) {
        this.pendingClaimCount = pendingClaimCount;
    }

    public long getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(long usedCount) {
        this.usedCount = usedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public List<Map<String, Object>> getQuotas() {
        return quotas;
    }

    public void setQuotas(List<Map<String, Object>> quotas) {
        this.quotas = quotas;
    }

    public List<Map<String, Object>> getIssuances() {
        return issuances;
    }

    public void setIssuances(List<Map<String, Object>> issuances) {
        this.issuances = issuances;
    }

    public List<Map<String, Object>> getTickets() {
        return tickets;
    }

    public void setTickets(List<Map<String, Object>> tickets) {
        this.tickets = tickets;
    }
}
