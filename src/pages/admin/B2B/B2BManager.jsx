import React, { useState } from 'react';
import { Card, Button, Table, Badge } from '../../../components';
import { Icon } from '../../../components';
import { useB2BData } from './useB2BData';
import OrganizationModal from './components/OrganizationModal';
import ContractModal from './components/ContractModal';
import ContractManagersModal from './components/ContractManagersModal';
import '../Events/admin.css';

const B2BManager = () => {
    const {
        organizations,
        contracts,
        loading,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        createContract,
        updateContract,
        deleteContract,
        getContractManagers,
        assignContractManager,
        unassignContractManager
    } = useB2BData();

    // Modals state
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);

    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);

    const [isManagersModalOpen, setIsManagersModalOpen] = useState(false);
    const [selectedContractForManagers, setSelectedContractForManagers] = useState(null);

    const handleOrgSubmit = async (formData) => {
        let res;
        if (selectedOrg) {
            res = await updateOrganization(selectedOrg.id, formData);
        } else {
            res = await createOrganization(formData);
        }
        if (res.success) {
            setIsOrgModalOpen(false);
            setSelectedOrg(null);
        } else {
            alert(selectedOrg ? 'Error al actualizar organización' : 'Error al crear organización');
        }
    };

    const handleDeleteOrg = async (org) => {
        if (window.confirm(`¿Estás seguro de eliminar el cliente B2B "${org.name}"?\nEsta acción es irreversible y eliminará todos sus contratos asociados.`)) {
            const res = await deleteOrganization(org.id);
            if (!res.success) {
                alert('Error al eliminar organización');
            }
        }
    };

    const handleContractSubmit = async (formData) => {
        let res;
        if (selectedContract) {
            res = await updateContract(selectedContract.id, formData);
        } else {
            res = await createContract(formData);
        }
        if (res.success) {
            setIsContractModalOpen(false);
            setSelectedContract(null);
        } else {
            alert(selectedContract ? 'Error al actualizar contrato' : 'Error al crear contrato');
        }
    };

    const handleDeleteContract = async (contract) => {
        if (window.confirm(`¿Estás seguro de eliminar el contrato "${contract.name}"?\nEsta acción es irreversible.`)) {
            const res = await deleteContract(contract.id);
            if (!res.success) {
                alert('Error al eliminar contrato');
            }
        }
    };

    const orgColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { key: 'taxId', header: 'RFC/Tax ID' },
        { key: 'contactEmail', header: 'Email de Contacto' },
        { key: 'createdAt', header: 'Alta', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
        { 
            key: 'actions', 
            header: 'Acciones', 
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Button 
                        size="small" 
                        variant="secondary" 
                        onClick={() => {
                            setSelectedOrg(row);
                            setIsOrgModalOpen(true);
                        }}
                        style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                        title="Editar Cliente"
                    >
                        <Icon name="edit" size={14} />
                    </Button>
                    <Button 
                        size="small" 
                        variant="danger" 
                        onClick={() => handleDeleteOrg(row)}
                        style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                        title="Eliminar Cliente"
                    >
                        <Icon name="trash" size={14} />
                    </Button>
                </div>
            )
        }
    ];

    const contractColumns = [
        { key: 'organization', header: 'Cliente', render: (val) => val?.name || 'N/A' },
        { key: 'name', header: 'Proyecto/Paquete' },
        { key: 'status', header: 'Estado', render: (val) => <Badge variant={val === 'ACTIVE' ? 'success' : 'default'} rounded>{val}</Badge> },
        { key: 'endDate', header: 'Vence', render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A' },
        { key: 'isUnlimited', header: 'Límites', render: (val, row) => val ? <Badge variant="warning">Ilimitado</Badge> : `${row.maxEvents} eventos max.` },
        { 
            key: 'actions', 
            header: 'Acciones', 
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Button 
                        size="small" 
                        variant="primary" 
                        onClick={() => {
                            setSelectedContractForManagers(row);
                            setIsManagersModalOpen(true);
                        }}
                        style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                        title="Vincular Cuentas/Gestores"
                    >
                        <Icon name="users" size={14} />
                    </Button>
                    <Button 
                        size="small" 
                        variant="secondary" 
                        onClick={() => {
                            setSelectedContract(row);
                            setIsContractModalOpen(true);
                        }}
                        style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                        title="Editar Contrato"
                    >
                        <Icon name="edit" size={14} />
                    </Button>
                    <Button 
                        size="small" 
                        variant="danger" 
                        onClick={() => handleDeleteContract(row)}
                        style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                        title="Eliminar Contrato"
                    >
                        <Icon name="trash" size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="admin-events-page">
            <div className="page-header">
                <div className="header-title-group">
                    <h1>B2B: Clientes y Contratos</h1>
                    <p className="header-subtitle">Gestiona las organizaciones (recintos/promotores), sus paquetes contratados, edítalos o elimínalos.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* ORGANIZATIONS SECTION */}
                <Card className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Clientes / Organizaciones</h3>
                        <Button size="small" onClick={() => {
                            setSelectedOrg(null);
                            setIsOrgModalOpen(true);
                        }}>+ Nuevo Cliente</Button>
                    </div>
                    {loading ? <p>Cargando...</p> : (
                        <Table columns={orgColumns} data={organizations} className="admin-custom-table" />
                    )}
                </Card>

                {/* CONTRACTS SECTION */}
                <Card className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Contratos / Proyectos</h3>
                        <Button size="small" onClick={() => {
                            setSelectedContract(null);
                            setIsContractModalOpen(true);
                        }}>+ Nuevo Contrato</Button>
                    </div>
                    {loading ? <p>Cargando...</p> : (
                        <Table columns={contractColumns} data={contracts} className="admin-custom-table" />
                    )}
                </Card>
            </div>

            {/* MODAL ORG */}
            <OrganizationModal 
                isOpen={isOrgModalOpen} 
                onClose={() => {
                    setIsOrgModalOpen(false);
                    setSelectedOrg(null);
                }} 
                onSubmit={handleOrgSubmit} 
                organization={selectedOrg} 
            />

            {/* MODAL CONTRACT */}
            <ContractModal 
                isOpen={isContractModalOpen} 
                onClose={() => {
                    setIsContractModalOpen(false);
                    setSelectedContract(null);
                }} 
                onSubmit={handleContractSubmit} 
                organizations={organizations} 
                contract={selectedContract} 
            />

            {/* MODAL MANAGERS */}
            <ContractManagersModal 
                isOpen={isManagersModalOpen} 
                onClose={() => {
                    setIsManagersModalOpen(false);
                    setSelectedContractForManagers(null);
                }}
                contract={selectedContractForManagers}
                getContractManagers={getContractManagers}
                assignContractManager={assignContractManager}
                unassignContractManager={unassignContractManager}
            />
        </div>
    );
};

export default B2BManager;
