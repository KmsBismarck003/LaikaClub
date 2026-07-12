package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchandiseVariantRepository extends JpaRepository<MerchandiseVariant, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM MerchandiseVariant v WHERE v.id = :id")
    Optional<MerchandiseVariant> findByIdForUpdate(@Param("id") Long id);
}
