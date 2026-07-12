package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MerchandiseItemRepository extends JpaRepository<MerchandiseItem, Long> {

    @Query("SELECT i FROM MerchandiseItem i WHERE " +
           "(:managerId IS NULL OR i.managerId = :managerId) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:eventId IS NULL OR i.eventId = :eventId) AND " +
           "(:adminStatus IS NULL OR i.adminStatus = :adminStatus)")
    List<MerchandiseItem> findAllWithFilters(
            @Param("managerId") Long managerId,
            @Param("status") String status,
            @Param("eventId") Long eventId,
            @Param("adminStatus") String adminStatus);
}
