package com.laikaclub.events.repository;

import com.laikaclub.events.domain.SeatingBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatingBlockRepository extends JpaRepository<SeatingBlock, Long> {
    List<SeatingBlock> findByRoomId(Long roomId);
    void deleteByRoomId(Long roomId);
}
