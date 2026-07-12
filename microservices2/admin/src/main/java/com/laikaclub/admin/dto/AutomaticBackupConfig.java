package com.laikaclub.admin.dto;

public class AutomaticBackupConfig {
    private boolean enabled = false;
    private String frequency = "daily";  // hourly, daily, weekly, monthly
    private String time = "02:00";  // HH:MM
    private String backupType = "completo";  // completo, incremental
    private int retentionDays = 30;
    private int maxBackups = 10;
    private boolean notifyOnSuccess = true;
    private boolean notifyOnError = true;
    private int dayOfWeek = 0;  // 0-6 (0 = Domingo)
    private int dayOfMonth = 1;  // 1-31

    public AutomaticBackupConfig() {}

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getBackupType() {
        return backupType;
    }

    public void setBackupType(String backupType) {
        this.backupType = backupType;
    }

    public int getRetentionDays() {
        return retentionDays;
    }

    public void setRetentionDays(int retentionDays) {
        this.retentionDays = retentionDays;
    }

    public int getMaxBackups() {
        return maxBackups;
    }

    public void setMaxBackups(int maxBackups) {
        this.maxBackups = maxBackups;
    }

    public boolean isNotifyOnSuccess() {
        return notifyOnSuccess;
    }

    public void setNotifyOnSuccess(boolean notifyOnSuccess) {
        this.notifyOnSuccess = notifyOnSuccess;
    }

    public boolean isNotifyOnError() {
        return notifyOnError;
    }

    public void setNotifyOnError(boolean notifyOnError) {
        this.notifyOnError = notifyOnError;
    }

    public int getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public int getDayOfMonth() {
        return dayOfMonth;
    }

    public void setDayOfMonth(int dayOfMonth) {
        this.dayOfMonth = dayOfMonth;
    }
}
