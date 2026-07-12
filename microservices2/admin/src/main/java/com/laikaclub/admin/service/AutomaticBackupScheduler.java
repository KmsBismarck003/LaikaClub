package com.laikaclub.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laikaclub.admin.domain.BackupHistory;
import com.laikaclub.admin.domain.SystemConfig;
import com.laikaclub.admin.dto.AutomaticBackupConfig;
import com.laikaclub.admin.repository.BackupHistoryRepository;
import com.laikaclub.admin.repository.SystemConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class AutomaticBackupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AutomaticBackupScheduler.class);

    private final SystemConfigRepository systemConfigRepository;
    private final BackupHistoryRepository backupHistoryRepository;
    private final BackupService backupService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AutomaticBackupScheduler(SystemConfigRepository systemConfigRepository,
                                    BackupHistoryRepository backupHistoryRepository,
                                    BackupService backupService) {
        this.systemConfigRepository = systemConfigRepository;
        this.backupHistoryRepository = backupHistoryRepository;
        this.backupService = backupService;
    }

    @Scheduled(cron = "0 * * * * *") // check every minute
    public void runScheduledBackupCheck() {
        SystemConfig configRow = systemConfigRepository.findByKey("automatic_backup_config").orElse(null);
        if (configRow == null || configRow.getValue() == null || configRow.getValue().isEmpty()) {
            return;
        }

        try {
            AutomaticBackupConfig config = objectMapper.readValue(configRow.getValue(), AutomaticBackupConfig.class);
            if (!config.isEnabled()) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            
            // Calculate scheduled target time for today/current cycle
            String[] timeParts = config.getTime().split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);
            LocalDateTime scheduledTime = now.withHour(hour).withMinute(minute).withSecond(0).withNano(0);
            
            boolean isDue = false;
            if (now.isAfter(scheduledTime)) {
                LocalDateTime lastCompleted = backupHistoryRepository.findLatestCompletedBackupTime();
                if (lastCompleted == null || lastCompleted.isBefore(scheduledTime)) {
                    isDue = true;
                }
            }
            
            if (isDue) {
                logger.info("[SCHEDULER] Triggering scheduled automatic backup");
                String type = config.getBackupType() != null ? config.getBackupType() : "full";
                String prefix = "completo".equalsIgnoreCase(type) ? "full" : type;
                String backupId = "backup_" + prefix + "_" + now.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
                
                BackupHistory history = new BackupHistory();
                history.setBackupId(backupId);
                history.setType(type);
                history.setStatus("in_progress");
                history.setScheduledAt(scheduledTime);
                backupHistoryRepository.save(history);
                
                backupService.doBackupAsync(backupId, type, null);
                
                // Cleanup according to retention policy
                backupService.cleanupOldBackups(config);
            }
            
        } catch (Exception e) {
            logger.error("[SCHEDULER] Error processing automatic scheduled backup", e);
        }
    }
}
