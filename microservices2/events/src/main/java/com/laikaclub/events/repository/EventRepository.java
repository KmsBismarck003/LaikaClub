package com.laikaclub.events.repository;

import com.laikaclub.events.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCreatedByOrAssignedManagerIdOrderByIdDesc(Long createdBy, Long assignedManagerId);
    
    long countByVenueIdAndStatus(Long venueId, String status);
}
