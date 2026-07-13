import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Input } from '../../../components';
import { Icon } from '../../../components';
import api from '../../../services/api';
import '../Events/admin.css';

const B2BManager = () => {
    const [organizations, setOrganizations] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);

    // Form state
    const [orgForm, setOrgForm] = useState({ name: '', taxId: '', contactEmail: '' });
    const [contractForm, setContractForm] = useState({
        organizationId: '', name: '', status: 'ACTIVE', startDate: '', endDate: '', maxEvents: 0, isUnlimited: false
    });

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            await api.b2b.createOrganization(orgForm);
            setIsOrgModalOpen(false);
            setOrgForm({ name: '', taxId: '', contactEmail: '' });
            fetchData();
        } catch (error) {
            alert('Error al crear organización');
        }
    };

    const handleCreateContract = async (e) => {
        e.preventDefault();
        try {
            await api.b2b.createContract(contractForm);
            setIsContractModalOpen(false);
            setContractForm({ organizationId: '', name: '', status: 'ACTIVE', startDate: '', endDate: '', maxEvents: 0, isUnlimited: false });
            fetchData();
        } catch (error) {
            alert('Error al crear contrato');
        }
    };

    const orgColumns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { key: 'taxId', header: 'RFC/Tax ID' },
        { key: 'contactEmail', header: 'Email de Contacto' },
        { key: 'createdAt', header: 'Alta', render: (val) => new Date(val).toLocaleDateString() }
    ];

    const contractColumns = [
        { key: 'organization', header: 'Cliente', render: (val) => val?.name || 'N/A' },
        { key: 'name', header: 'Proyecto/Paquete' },
        { key: 'status', header: 'Estado', render: (val) => <Badge variant={val === 'ACTIVE' ? 'success' : 'default'} rounded>{val}</Badge> },
        { key: 'endDate', header: 'Vence', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'isUnlimited', header: 'Límites', render: (val, row) => val ? <Badge variant="warning">Ilimitado</Badge> : `${row.maxEvents} eventos max.` }
    ];

    return (
        <div className="admin-events-page">
            <div className="page-header">
                <div className="header-title-group">
                    <h1>B2B: Clientes y Contratos</h1>
                    <p className="header-subtitle">Gestiona las organizaciones (recintos/promotores) y sus paquetes contratados.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* ORGANIZATIONS SECTION */}
                <Card className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Clientes / Organizaciones</h3>
                        <Button size="small" onClick={() => setIsOrgModalOpen(true)}>+ Nuevo Cliente</Button>
                    </div>
                    {loading ? <p>Cargando...</p> : (
                        <Table columns={orgColumns} data={organizations} className="admin-custom-table" />
                    )}
                </Card>

                {/* CONTRACTS SECTION */}
                <Card className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Contratos / Proyectos</h3>
                        <Button size="small" onClick={() => setIsContractModalOpen(true)}>+ Nuevo Contrato</Button>
                    </div>
                    {loading ? <p>Cargando...</p> : (
                        <Table columns={contractColumns} data={contracts} className="admin-custom-table" />
                    )}
                </Card>
            </div>

            {/* MODAL ORG */}
            {isOrgModalOpen && (
                <Modal isOpen={true} title="Nuevo Cliente B2B" onClose={() => setIsOrgModalOpen(false)}>
                    <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input label="Nombre de la Organización" required value={orgForm.name} onChange={e => setOrgForm({...orgForm, name: e.target.value})} />
                        <Input label="RFC o Tax ID" required value={orgForm.taxId} onChange={e => setOrgForm({...orgForm, taxId: e.target.value})} />
                        <Input label="Correo de Contacto" type="email" required value={orgForm.contactEmail} onChange={e => setOrgForm({...orgForm, contactEmail: e.target.value})} />
                        <Button type="submit">Guardar Cliente</Button>
                    </form>
                </Modal>
            )}

            {/* MODAL CONTRACT */}
            {isContractModalOpen && (
                <Modal isOpen={true} title="Nuevo Contrato / Paquete" onClose={() => setIsContractModalOpen(false)}>
                    <form onSubmit={handleCreateContract} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Cliente</label>
                            <select className="laika-input" required value={contractForm.organizationId} onChange={e => setContractForm({...contractForm, organizationId: e.target.value})}>
                                <option value="">-- Seleccionar --</option>
                                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                        <Input label="Nombre del Proyecto (Ej. Tour 2026)" required value={contractForm.name} onChange={e => setContractForm({...contractForm, name: e.target.value})} />
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Input label="Fecha Inicio" type="date" required value={contractForm.startDate} onChange={e => setContractForm({...contractForm, startDate: e.target.value})} />
                            <Input label="Fecha Fin" type="date" required value={contractForm.endDate} onChange={e => setContractForm({...contractForm, endDate: e.target.value})} />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={contractForm.isUnlimited} onChange={e => setContractForm({...contractForm, isUnlimited: e.target.checked})} />
                            Paquete Ilimitado (Venue Retainer)
                        </label>

                        {!contractForm.isUnlimited && (
                            <Input label="Límite Máximo de Eventos" type="number" required value={contractForm.maxEvents} onChange={e => setContractForm({...contractForm, maxEvents: parseInt(e.target.value)})} />
                        )}

                        <Button type="submit">Activar Contrato</Button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default B2BManager;
