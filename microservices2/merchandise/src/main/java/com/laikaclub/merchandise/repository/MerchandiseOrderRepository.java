package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchandiseOrderRepository extends JpaRepository<MerchandiseOrder, Long> {
    Optional<MerchandiseOrder> findByIdempotencyKey(String idempotencyKey);
}
