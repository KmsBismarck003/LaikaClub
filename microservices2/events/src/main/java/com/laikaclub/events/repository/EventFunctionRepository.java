package com.laikaclub.events.repository;

import com.laikaclub.events.domain.EventFunction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventFunctionRepository extends JpaRepository<EventFunction, Long> {
    List<EventFunction> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
