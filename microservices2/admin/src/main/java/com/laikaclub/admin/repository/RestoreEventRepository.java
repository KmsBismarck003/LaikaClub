package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.RestoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestoreEventRepository extends JpaRepository<RestoreEvent, Long> {
    List<RestoreEvent> findAllByOrderByCreatedAtDesc();
}
