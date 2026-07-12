package com.laikaclub.events.repository;

import com.laikaclub.events.domain.Municipality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MunicipalityRepository extends JpaRepository<Municipality, Long> {
    List<Municipality> findByStateIdOrderByNameAsc(Long stateId);
}
