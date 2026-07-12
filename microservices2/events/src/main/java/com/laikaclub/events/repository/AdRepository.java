package com.laikaclub.events.repository;

import com.laikaclub.events.domain.Ad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByActive(Integer active);
}
