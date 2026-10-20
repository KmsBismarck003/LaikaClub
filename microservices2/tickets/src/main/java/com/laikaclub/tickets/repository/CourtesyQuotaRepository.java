package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.CourtesyQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourtesyQuotaRepository extends JpaRepository<CourtesyQuota, Long> {

    Optional<CourtesyQuota> findByManagerUserIdAndEventId(Long managerUserId, Long eventId);

    Optional<CourtesyQuota> findByManagerUserIdAndEventIdAndEventFunctionIdAndSectionName(
            Long managerUserId, Long eventId, Long eventFunctionId, String sectionName);

    List<CourtesyQuota> findByEventId(Long eventId);

    List<CourtesyQuota> findByManagerUserId(Long managerUserId);

    List<CourtesyQuota> findByManagerUserIdAndEventIdOrderByCreatedAtDesc(Long managerUserId, Long eventId);
}
