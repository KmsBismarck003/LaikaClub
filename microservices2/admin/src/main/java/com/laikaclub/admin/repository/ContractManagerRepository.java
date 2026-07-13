package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.ContractManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractManagerRepository extends JpaRepository<ContractManager, Long> {
    List<ContractManager> findByUserId(Long userId);
    List<ContractManager> findByContractId(Long contractId);
    Optional<ContractManager> findByContractIdAndUserId(Long contractId, Long userId);
}
