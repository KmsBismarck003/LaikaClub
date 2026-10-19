package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.TicketTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketTransferRepository extends JpaRepository<TicketTransfer, Long> {

    Optional<TicketTransfer> findByClaimToken(String claimToken);

    Optional<TicketTransfer> findFirstByTicketIdOriginalAndStatusIn(Long ticketIdOriginal, List<String> statuses);

    List<TicketTransfer> findBySenderUserIdOrderByCreatedAtDesc(Long senderUserId);

    @Query("SELECT t FROM TicketTransfer t WHERE (t.recipientUserId = :recipientUserId OR LOWER(t.recipientEmail) = LOWER(:email)) AND t.status IN :statuses ORDER BY t.createdAt DESC")
    List<TicketTransfer> findIncomingTransfers(@Param("recipientUserId") Long recipientUserId,
                                             @Param("email") String email,
                                             @Param("statuses") List<String> statuses);

    @Query("SELECT t FROM TicketTransfer t WHERE t.senderUserId = :senderUserId AND t.status IN :statuses ORDER BY t.createdAt DESC")
    List<TicketTransfer> findOutgoingTransfers(@Param("senderUserId") Long senderUserId,
                                             @Param("statuses") List<String> statuses);

    @Query("SELECT t FROM TicketTransfer t WHERE t.senderUserId = :userId OR t.recipientUserId = :userId OR LOWER(t.recipientEmail) = LOWER(:email) ORDER BY t.createdAt DESC")
    List<TicketTransfer> findAllUserTransfers(@Param("userId") Long userId, @Param("email") String email);

    List<TicketTransfer> findByStatusInAndExpiresAtBefore(List<String> statuses, LocalDateTime now);
}
