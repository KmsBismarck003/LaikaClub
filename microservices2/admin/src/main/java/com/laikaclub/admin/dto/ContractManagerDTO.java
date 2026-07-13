package com.laikaclub.admin.dto;

public class ContractManagerDTO {
    private Long contractId;
    private Long userId;
    private String roleInContract;

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getRoleInContract() { return roleInContract; }
    public void setRoleInContract(String roleInContract) { this.roleInContract = roleInContract; }
}
