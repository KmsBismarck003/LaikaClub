package com.laikaclub.events.repository;

import com.laikaclub.events.domain.VenueRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRoomRepository extends JpaRepository<VenueRoom, Long> {
    List<VenueRoom> findByVenueIdOrderByNameAsc(Long venueId);
}
