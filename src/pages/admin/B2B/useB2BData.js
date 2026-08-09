import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useB2BData = () => {
    const [organizations, setOrganizations] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const orgsData = await api.b2b.getOrganizations();
            const contractsData = await api.b2b.getContracts();
            setOrganizations(orgsData || []);
            setContracts(contractsData || []);
        } catch (error) {
            console.error('Error fetching B2B data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createOrganization = async (orgData) => {
        try {
            await api.b2b.createOrganization(orgData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error creating organization', error);
            return { success: false, error };
        }
    };

    const updateOrganization = async (orgId, orgData) => {
        try {
            await api.b2b.updateOrganization(orgId, orgData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error updating organization', error);
            return { success: false, error };
        }
    };

    const deleteOrganization = async (orgId) => {
        try {
            await api.b2b.deleteOrganization(orgId);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error deleting organization', error);
            return { success: false, error };
        }
    };

    const createContract = async (contractData) => {
        try {
            await api.b2b.createContract(contractData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error creating contract', error);
            return { success: false, error };
        }
    };

    const updateContract = async (contractId, contractData) => {
        try {
            await api.b2b.updateContract(contractId, contractData);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error updating contract', error);
            return { success: false, error };
        }
    };

    const deleteContract = async (contractId) => {
        try {
            await api.b2b.deleteContract(contractId);
            await fetchData();
            return { success: true };
        } catch (error) {
            console.error('Error deleting contract', error);
            return { success: false, error };
        }
    };

    const getContractManagers = async (contractId) => {
        try {
            return await api.b2b.getContractManagers(contractId);
        } catch (error) {
            console.error('Error fetching contract managers', error);
            return [];
        }
    };

    const assignContractManager = async (contractId, userId, role = 'MANAGER') => {
        try {
            await api.b2b.assignContractManager({ contractId, userId, roleInContract: role });
            return { success: true };
        } catch (error) {
            console.error('Error assigning contract manager', error);
            return { success: false, error };
        }
    };

    const unassignContractManager = async (contractId, userId) => {
        try {
            await api.b2b.unassignContractManager(contractId, userId);
            return { success: true };
        } catch (error) {
            console.error('Error unassigning contract manager', error);
            return { success: false, error };
        }
    };

    return {
        organizations,
        contracts,
        loading,
        refresh: fetchData,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        createContract,
        updateContract,
        deleteContract,
        getContractManagers,
        assignContractManager,
        unassignContractManager
    };
};
