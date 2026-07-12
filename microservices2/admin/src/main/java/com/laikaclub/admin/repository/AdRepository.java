package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.Ad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {

    @Query(value = "SELECT a.* FROM ads a " +
                   "LEFT JOIN events e ON a.event_id = e.id " +
                   "WHERE a.active = 1 " +
                   "AND (a.event_id IS NULL OR (e.status = 'published' AND e.ads_enabled = 1)) " +
                   "ORDER BY a.id DESC", nativeQuery = true)
    List<Ad> findPublicActiveAds();

    List<Ad> findAllByOrderByIdDesc();
}
