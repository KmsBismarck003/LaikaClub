package com.laikaclub.admin.repository;

import com.laikaclub.admin.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByOrganizationId(Long organizationId);
}
