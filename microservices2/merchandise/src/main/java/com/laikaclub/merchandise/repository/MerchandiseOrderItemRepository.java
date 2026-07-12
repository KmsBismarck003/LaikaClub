package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MerchandiseOrderItemRepository extends JpaRepository<MerchandiseOrderItem, Long> {

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM MerchandiseOrderItem oi JOIN oi.order o WHERE o.userId = :userId AND oi.variantId = :variantId AND o.status = 'completed'")
    Integer sumQuantityByUserIdAndVariantId(@Param("userId") Long userId, @Param("variantId") Long variantId);

    // Endpoint: GET /{merch_id}/purchased -> checks if the user has purchased this merch item
    // purchased = db.query(MerchandiseOrderItem).join(MerchandiseVariant).join(MerchandiseOrder).filter(
    //     MerchandiseOrder.user_id == user_id,
    //     MerchandiseVariant.item_id == merch_id
    // ).first()
    @Query("SELECT COUNT(oi) > 0 FROM MerchandiseOrderItem oi JOIN oi.order o JOIN MerchandiseVariant v ON oi.variantId = v.id WHERE o.userId = :userId AND v.item.id = :merchId")
    boolean existsByUserIdAndMerchandiseId(@Param("userId") Long userId, @Param("merchId") Long merchId);
}
