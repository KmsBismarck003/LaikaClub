package com.laikaclub.tickets.repository;

import com.laikaclub.tickets.domain.TicketValidationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketValidationLogRepository extends JpaRepository<TicketValidationLog, Long> {

    List<TicketValidationLog> findByTicketCodeOrderByCreatedAtDesc(String ticketCode);

    List<TicketValidationLog> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<TicketValidationLog> findAllByOrderByCreatedAtDesc();
}
