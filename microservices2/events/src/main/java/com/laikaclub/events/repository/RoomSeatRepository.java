package com.laikaclub.events.repository;

import com.laikaclub.events.domain.RoomSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomSeatRepository extends JpaRepository<RoomSeat, Long> {
    List<RoomSeat> findByRoomId(Long roomId);
    void deleteByRoomId(Long roomId);
}
