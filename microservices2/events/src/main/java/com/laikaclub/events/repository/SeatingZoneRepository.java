package com.laikaclub.events.repository;

import com.laikaclub.events.domain.SeatingZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatingZoneRepository extends JpaRepository<SeatingZone, Long> {
    List<SeatingZone> findByRoomId(Long roomId);
    void deleteByRoomId(Long roomId);
}
