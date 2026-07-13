package com.laikaclub.events.repository;

import com.laikaclub.events.domain.UserLbsHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLbsHistoryRepository extends JpaRepository<UserLbsHistory, Long> {
    Optional<UserLbsHistory> findByUserIdAndVenueId(Long userId, Long venueId);
}
