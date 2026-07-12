package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.BackupHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BackupHistoryRepository extends JpaRepository<BackupHistory, Long> {

    Optional<BackupHistory> findByBackupId(String backupId);

    List<BackupHistory> findTop50ByOrderByCreatedAtDesc();

    List<BackupHistory> findTop20ByStatusOrderByScheduledAtAsc(String status);

    @Query("SELECT MAX(b.createdAt) FROM BackupHistory b WHERE b.status = 'completed'")
    LocalDateTime findLatestCompletedBackupTime();

    @Modifying
    @Transactional
    @Query("DELETE FROM BackupHistory b WHERE b.status = 'failed' AND b.createdAt < :cutoffTime")
    int deleteOldFailedBackups(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Modifying
    @Transactional
    @Query("DELETE FROM BackupHistory b WHERE b.backupId = :backupId OR CAST(b.id AS string) = :backupId")
    int deleteByBackupIdOrIdString(@Param("backupId") String backupId);
}
