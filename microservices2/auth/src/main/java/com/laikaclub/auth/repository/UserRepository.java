package com.laikaclub.auth.repository;

import com.laikaclub.auth.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    long countByRole(String role);

    @Query("SELECT u.email FROM User u WHERE u.status = :status")
    List<String> findEmailsByStatus(@Param("status") String status);

    Page<User> findAll(Specification<User> spec, Pageable pageable);
}
