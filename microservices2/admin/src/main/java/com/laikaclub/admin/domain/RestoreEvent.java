package com.laikaclub.admin.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "restore_events")
public class RestoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_datetime")
    private String startDatetime;

    @Column(name = "end_datetime")
    private String endDatetime;

    @Column(name = "database_name")
    private String databaseName;

    @Column(name = "environment")
    private String environment;

    @Column(name = "restore_type")
    private String restoreType;

    @Column(name = "backup_size_mb")
    private String backupSizeMb;

    @Column(name = "execution_method")
    private String executionMethod;

    @Column(name = "server_name")
    private String serverName;

    @Column(name = "restore_reason", columnDefinition = "TEXT")
    private String restoreReason;

    @Column(name = "severity")
    private String severity = "media";

    @Column(name = "is_confirmed")
    private Boolean isConfirmed = false;

    @Column(name = "technical_checks", columnDefinition = "TEXT")
    private String technicalChecks;

    @Column(name = "functional_checks", columnDefinition = "TEXT")
    private String functionalChecks;

    @Column(name = "operational_impact", columnDefinition = "TEXT")
    private String operationalImpact;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public RestoreEvent() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStartDatetime() {
        return startDatetime;
    }

    public void setStartDatetime(String startDatetime) {
        this.startDatetime = startDatetime;
    }

    public String getEndDatetime() {
        return endDatetime;
    }

    public void setEndDatetime(String endDatetime) {
        this.endDatetime = endDatetime;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getRestoreType() {
        return restoreType;
    }

    public void setRestoreType(String restoreType) {
        this.restoreType = restoreType;
    }

    public String getBackupSizeMb() {
        return backupSizeMb;
    }

    public void setBackupSizeMb(String backupSizeMb) {
        this.backupSizeMb = backupSizeMb;
    }

    public String getExecutionMethod() {
        return executionMethod;
    }

    public void setExecutionMethod(String executionMethod) {
        this.executionMethod = executionMethod;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public String getRestoreReason() {
        return restoreReason;
    }

    public void setRestoreReason(String restoreReason) {
        this.restoreReason = restoreReason;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Boolean getIsConfirmed() {
        return isConfirmed;
    }

    public void setIsConfirmed(Boolean isConfirmed) {
        this.isConfirmed = isConfirmed;
    }

    public String getTechnicalChecks() {
        return technicalChecks;
    }

    public void setTechnicalChecks(String technicalChecks) {
        this.technicalChecks = technicalChecks;
    }

    public String getFunctionalChecks() {
        return functionalChecks;
    }

    public void setFunctionalChecks(String functionalChecks) {
        this.functionalChecks = functionalChecks;
    }

    public String getOperationalImpact() {
        return operationalImpact;
    }

    public void setOperationalImpact(String operationalImpact) {
        this.operationalImpact = operationalImpact;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
