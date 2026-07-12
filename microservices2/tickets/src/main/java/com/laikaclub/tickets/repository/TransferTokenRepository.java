package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.TransferToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransferTokenRepository extends JpaRepository<TransferToken, Long> {
    Optional<TransferToken> findByToken(String token);
    Optional<TransferToken> findFirstByTicketIdAndIsUsedFalseAndExpiresAtAfter(Long ticketId, LocalDateTime now);
}
