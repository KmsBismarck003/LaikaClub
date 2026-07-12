package com.laikaclub.events.repository;

import com.laikaclub.events.domain.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByStatusOrderByNameAsc(String status);
}
