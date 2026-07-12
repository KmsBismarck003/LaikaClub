package com.laikaclub.merchandise.repository;

import com.laikaclub.merchandise.domain.MerchandiseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MerchandiseReviewRepository extends JpaRepository<MerchandiseReview, Long> {

    List<MerchandiseReview> findByItemId(Long itemId);

    @Query("SELECT AVG(r.rating) FROM MerchandiseReview r WHERE r.item.id = :itemId")
    Double getAverageRatingByItemId(@Param("itemId") Long itemId);
}
