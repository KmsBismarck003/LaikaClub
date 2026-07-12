package com.laikaclub.achievements.repository;

import com.laikaclub.achievements.domain.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    Optional<UserCoupon> findByCodeAndUserId(String code, Long userId);

    @Query("SELECT c FROM UserCoupon c WHERE c.userId = :userId AND (c.usesLeft > 0 OR c.isPermanent = 1)")
    List<UserCoupon> findActiveCouponsByUserId(@Param("userId") Long userId);

    List<UserCoupon> findByUsesLeftGreaterThan(Integer usesLeft);
}
