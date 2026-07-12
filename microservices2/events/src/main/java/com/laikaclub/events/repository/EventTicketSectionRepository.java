package com.laikaclub.events.repository;

import com.laikaclub.events.domain.EventTicketSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTicketSectionRepository extends JpaRepository<EventTicketSection, Long> {
    List<EventTicketSection> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
