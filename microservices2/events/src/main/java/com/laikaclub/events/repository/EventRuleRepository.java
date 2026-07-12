package com.laikaclub.events.repository;

import com.laikaclub.events.domain.EventRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRuleRepository extends JpaRepository<EventRule, Long> {
    List<EventRule> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
