package com.laikaclub.auth.repository;

import com.laikaclub.auth.domain.PermissionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRequestRepository extends JpaRepository<PermissionRequest, Long> {

    @Query("SELECT pr FROM PermissionRequest pr JOIN FETCH pr.user u WHERE pr.status = :status")
    List<PermissionRequest> findByStatus(@Param("status") String status);
}
