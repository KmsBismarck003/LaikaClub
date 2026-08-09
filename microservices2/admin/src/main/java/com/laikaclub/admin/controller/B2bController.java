package com.laikaclub.admin.controller;

import com.laikaclub.admin.domain.Contract;
import com.laikaclub.admin.domain.ContractManager;
import com.laikaclub.admin.domain.Organization;
import com.laikaclub.admin.dto.ContractDTO;
import com.laikaclub.admin.dto.ContractManagerDTO;
import com.laikaclub.admin.dto.OrganizationDTO;
import com.laikaclub.admin.service.B2bService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/b2b")
public class B2bController {

    @Autowired
    private B2bService b2bService;

    // --- Organizations ---
    @PostMapping("/organizations")
    public ResponseEntity<Organization> createOrganization(@RequestBody OrganizationDTO dto) {
        return ResponseEntity.ok(b2bService.createOrganization(dto));
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(b2bService.getAllOrganizations());
    }

    @GetMapping("/organizations/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable Long id) {
        return ResponseEntity.ok(b2bService.getOrganizationById(id));
    }

    @PutMapping("/organizations/{id}")
    public ResponseEntity<Organization> updateOrganization(@PathVariable Long id, @RequestBody OrganizationDTO dto) {
        return ResponseEntity.ok(b2bService.updateOrganization(id, dto));
    }

    @DeleteMapping("/organizations/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        b2bService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    // --- Contracts ---
    @PostMapping("/contracts")
    public ResponseEntity<Contract> createContract(@RequestBody ContractDTO dto) {
        return ResponseEntity.ok(b2bService.createContract(dto));
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Contract>> getAllContracts() {
        return ResponseEntity.ok(b2bService.getAllContracts());
    }

    @GetMapping("/organizations/{orgId}/contracts")
    public ResponseEntity<List<Contract>> getContractsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(b2bService.getContractsByOrganization(orgId));
    }

    @GetMapping("/contracts/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
        return ResponseEntity.ok(b2bService.getContractById(id));
    }

    @PatchMapping("/contracts/{id}/extend")
    public ResponseEntity<Contract> extendContract(@PathVariable Long id, @RequestBody ContractDTO dto) {
        return ResponseEntity.ok(b2bService.extendContract(id, dto));
    }

    @PutMapping("/contracts/{id}")
    public ResponseEntity<Contract> updateContract(@PathVariable Long id, @RequestBody ContractDTO dto) {
        return ResponseEntity.ok(b2bService.updateContract(id, dto));
    }

    @DeleteMapping("/contracts/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable Long id) {
        b2bService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    // --- Contract Managers ---
    @PostMapping("/managers/assign")
    public ResponseEntity<ContractManager> assignManager(@RequestBody ContractManagerDTO dto) {
        return ResponseEntity.ok(b2bService.assignManagerToContract(dto));
    }

    @GetMapping("/contracts/{contractId}/managers")
    public ResponseEntity<List<ContractManager>> getManagersByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(b2bService.getManagersByContract(contractId));
    }

    @DeleteMapping("/contracts/{contractId}/managers/{userId}")
    public ResponseEntity<Void> unassignManager(@PathVariable Long contractId, @PathVariable Long userId) {
        b2bService.unassignManagerFromContract(contractId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/managers/{userId}/contracts")
    public ResponseEntity<List<Contract>> getContractsByManager(@PathVariable Long userId) {
        return ResponseEntity.ok(b2bService.getContractsByManager(userId));
    }
}
