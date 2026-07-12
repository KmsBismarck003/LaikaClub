package com.laikaclub.auth.repository;

import com.laikaclub.auth.domain.AuthLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthLogRepository extends JpaRepository<AuthLog, Long>, JpaSpecificationExecutor<AuthLog> {
    
    Page<AuthLog> findAll(Specification<AuthLog> spec, Pageable pageable);
}
