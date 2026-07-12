package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.AdClick;
import com.laikaclub.admin.dto.AdClickUserProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdClickRepository extends JpaRepository<AdClick, Long> {

    long countByAdId(Long adId);

    @Query(value = "SELECT ac.clicked_at as clickedAt, u.id as userId, u.full_name as fullName, u.email as email, u.profile_image as profileImage " +
                   "FROM ad_clicks ac " +
                   "LEFT JOIN users u ON ac.user_id = u.id " +
                   "WHERE ac.ad_id = :adId " +
                   "ORDER BY ac.clicked_at DESC", nativeQuery = true)
    List<AdClickUserProjection> findClickUsersByAdId(@Param("adId") Long adId);
}
