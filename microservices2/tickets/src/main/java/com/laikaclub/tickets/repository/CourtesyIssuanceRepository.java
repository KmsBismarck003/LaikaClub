package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.CourtesyIssuance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtesyIssuanceRepository extends JpaRepository<CourtesyIssuance, Long> {

    List<CourtesyIssuance> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<CourtesyIssuance> findByIssuerUserIdOrderByCreatedAtDesc(Long issuerUserId);

    List<CourtesyIssuance> findByEventIdAndIssuerUserIdOrderByCreatedAtDesc(Long eventId, Long issuerUserId);
}
