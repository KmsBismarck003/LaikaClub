package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.CancellationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationRequestRepository extends JpaRepository<CancellationRequest, Long> {

    List<CancellationRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CancellationRequest> findByIdAndUserId(Long id, Long userId);

    List<CancellationRequest> findByTicketId(Long ticketId);

    boolean existsByTicketIdAndStatusIn(Long ticketId, List<String> statuses);

    Optional<CancellationRequest> findFirstByTicketIdAndStatusIn(Long ticketId, List<String> statuses);

    Optional<CancellationRequest> findFirstByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
