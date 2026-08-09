package com.laikaclub.admin.service;

import com.laikaclub.admin.domain.Contract;
import com.laikaclub.admin.domain.ContractManager;
import com.laikaclub.admin.domain.Organization;
import com.laikaclub.admin.dto.ContractDTO;
import com.laikaclub.admin.dto.ContractManagerDTO;
import com.laikaclub.admin.dto.OrganizationDTO;
import com.laikaclub.admin.repository.ContractManagerRepository;
import com.laikaclub.admin.repository.ContractRepository;
import com.laikaclub.admin.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class B2bService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractManagerRepository contractManagerRepository;

    // --- Organizations ---
    public Organization createOrganization(OrganizationDTO dto) {
        Organization org = new Organization();
        org.setName(dto.getName());
        org.setTaxId(dto.getTaxId());
        org.setContactEmail(dto.getContactEmail());
        return organizationRepository.save(org);
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }
    
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Organization updateOrganization(Long id, OrganizationDTO dto) {
        Organization org = getOrganizationById(id);
        if (dto.getName() != null) {
            org.setName(dto.getName());
        }
        if (dto.getTaxId() != null) {
            org.setTaxId(dto.getTaxId());
        }
        if (dto.getContactEmail() != null) {
            org.setContactEmail(dto.getContactEmail());
        }
        return organizationRepository.save(org);
    }

    public void deleteOrganization(Long id) {
        Organization org = getOrganizationById(id);
        List<Contract> contracts = contractRepository.findByOrganizationId(id);
        for (Contract c : contracts) {
            deleteContract(c.getId());
        }
        organizationRepository.delete(org);
    }

    // --- Contracts ---
    public Contract createContract(ContractDTO dto) {
        Organization org = getOrganizationById(dto.getOrganizationId());

        Contract contract = new Contract();
        contract.setOrganization(org);
        contract.setName(dto.getName());
        contract.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setMaxEvents(dto.getMaxEvents());
        contract.setIsUnlimited(dto.getIsUnlimited() != null ? dto.getIsUnlimited() : false);
        
        return contractRepository.save(contract);
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
    
    public List<Contract> getContractsByOrganization(Long organizationId) {
        return contractRepository.findByOrganizationId(organizationId);
    }

    public Contract getContractById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
    }
    
    // Extensión de Contrato (Upselling)
    public Contract extendContract(Long contractId, ContractDTO dto) {
        Contract contract = getContractById(contractId);
        
        if (dto.getEndDate() != null) {
            contract.setEndDate(dto.getEndDate());
        }
        if (dto.getMaxEvents() != null) {
            contract.setMaxEvents(dto.getMaxEvents());
        }
        if (dto.getIsUnlimited() != null) {
            contract.setIsUnlimited(dto.getIsUnlimited());
        }
        if (dto.getStatus() != null) {
            contract.setStatus(dto.getStatus());
        }
        
        return contractRepository.save(contract);
    }

    public Contract updateContract(Long id, ContractDTO dto) {
        Contract contract = getContractById(id);
        if (dto.getOrganizationId() != null) {
            Organization org = getOrganizationById(dto.getOrganizationId());
            contract.setOrganization(org);
        }
        if (dto.getName() != null) {
            contract.setName(dto.getName());
        }
        if (dto.getStatus() != null) {
            contract.setStatus(dto.getStatus());
        }
        if (dto.getStartDate() != null) {
            contract.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            contract.setEndDate(dto.getEndDate());
        }
        if (dto.getMaxEvents() != null) {
            contract.setMaxEvents(dto.getMaxEvents());
        }
        if (dto.getIsUnlimited() != null) {
            contract.setIsUnlimited(dto.getIsUnlimited());
        }
        return contractRepository.save(contract);
    }

    public void deleteContract(Long id) {
        Contract contract = getContractById(id);
        List<ContractManager> managers = contractManagerRepository.findByContractId(id);
        if (!managers.isEmpty()) {
            contractManagerRepository.deleteAll(managers);
        }
        contractRepository.delete(contract);
    }

    // --- Contract Managers ---
    public ContractManager assignManagerToContract(ContractManagerDTO dto) {
        Contract contract = getContractById(dto.getContractId());
        
        // Verifica si ya está asignado
        contractManagerRepository.findByContractIdAndUserId(dto.getContractId(), dto.getUserId())
            .ifPresent(cm -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already assigned to this contract");
            });

        ContractManager cm = new ContractManager();
        cm.setContract(contract);
        cm.setUserId(dto.getUserId());
        cm.setRoleInContract(dto.getRoleInContract() != null ? dto.getRoleInContract() : "MANAGER");
        
        return contractManagerRepository.save(cm);
    }

    public List<ContractManager> getManagersByContract(Long contractId) {
        return contractManagerRepository.findByContractId(contractId);
    }

    public void unassignManagerFromContract(Long contractId, Long userId) {
        ContractManager cm = contractManagerRepository.findByContractIdAndUserId(contractId, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        contractManagerRepository.delete(cm);
    }
    
    public List<Contract> getContractsByManager(Long userId) {
        List<ContractManager> assignments = contractManagerRepository.findByUserId(userId);
        return assignments.stream().map(ContractManager::getContract).collect(Collectors.toList());
    }
}
