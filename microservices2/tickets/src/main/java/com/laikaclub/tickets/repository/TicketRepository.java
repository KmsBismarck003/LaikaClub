package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserIdOrderByPurchaseDateDesc(Long userId);

    List<Ticket> findByUserIdAndStatusOrderByPurchaseDateDesc(Long userId, String status);

    Optional<Ticket> findByTicketCode(String ticketCode);

    @Query("SELECT t.seatId FROM Ticket t WHERE t.eventId = :eventId AND t.status IN :statuses")
    List<String> findSeatIdsByEventIdAndStatusIn(@Param("eventId") Long eventId, @Param("statuses") List<String> statuses);

    @Query("SELECT t.seatId FROM Ticket t WHERE t.eventId = :eventId AND t.eventFunctionId = :functionId AND t.status IN :statuses")
    List<String> findSeatIdsByEventIdAndEventFunctionIdAndStatusIn(@Param("eventId") Long eventId, @Param("functionId") Long functionId, @Param("statuses") List<String> statuses);

    Optional<Ticket> findByIdAndUserId(Long id, Long userId);

    @Query(value = "SELECT user_id, COUNT(id) as total_tickets, MAX(purchase_date) as last_purchase " +
                   "FROM tickets " +
                   "WHERE status != 'refunded' " +
                   "GROUP BY user_id", nativeQuery = true)
    List<Object[]> getInternalPurchasesRaw();

    @Query(value = "SELECT COUNT(id) as total_tickets, MAX(purchase_date) as last_purchase " +
                   "FROM tickets " +
                   "WHERE user_id = :userId AND status != 'refunded'", nativeQuery = true)
    Object[] getInternalPurchasesByUserIdRaw(@Param("userId") Long userId);
}
