import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Input } from '../../../../components';
import { Icon } from '../../../../components';
import { adminUsersAPI } from '../../../../services/adminService';

const ContractManagersModal = ({ 
    isOpen, 
    onClose, 
    contract, 
    getContractManagers, 
    assignContractManager, 
    unassignContractManager 
}) => {
    const [assignedManagers, setAssignedManagers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const loadManagersAndUsers = async () => {
        if (!contract) return;
        setLoading(true);
        try {
            // 1. Fetch currently assigned managers
            const managers = await getContractManagers(contract.id);
            setAssignedManagers(managers || []);

            // 2. Fetch all system users
            const users = await adminUsersAPI.getAll();
            setAllUsers(Array.isArray(users) ? users : (users?.users || []));
        } catch (error) {
            console.error('Error loading managers or users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && contract) {
            loadManagersAndUsers();
            setSearchQuery('');
        }
    }, [isOpen, contract]);

    const handleAssign = async (userId) => {
        setActionLoading(true);
        const res = await assignContractManager(contract.id, userId);
        if (res.success) {
            // Reload list
            const managers = await getContractManagers(contract.id);
            setAssignedManagers(managers || []);
        } else {
            alert('Error al asignar usuario al contrato: ' + (res.error?.response?.data?.message || 'Usuario ya asignado o error del sistema.'));
        }
        setActionLoading(false);
    };

    const handleUnassign = async (userId, userName) => {
        if (window.confirm(`¿Estás seguro de desvincular al gestor "${userName}" de este contrato?`)) {
            setActionLoading(true);
            const res = await unassignContractManager(contract.id, userId);
            if (res.success) {
                // Reload list
                const managers = await getContractManagers(contract.id);
                setAssignedManagers(managers || []);
            } else {
                alert('Error al desvincular al gestor.');
            }
            setActionLoading(false);
        }
    };

    // Filter out users who are already assigned
    const assignedUserIds = assignedManagers.map(m => m.userId);
    const availableUsers = allUsers.filter(u => {
        if (assignedUserIds.includes(u.id)) return false;
        
        // Filter by search query (first_name, last_name, email)
        const name = `${u.firstName || u.first_name || ''} ${u.lastName || u.last_name || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const columnsAssigned = [
        { key: 'userId', header: 'ID Usuario' },
        { 
            key: 'userName', 
            header: 'Nombre', 
            render: (_, row) => {
                // Find user details in allUsers list if possible, or fall back to role/id
                const userObj = allUsers.find(u => u.id === row.userId);
                if (userObj) {
                    return `${userObj.firstName || userObj.first_name || ''} ${userObj.lastName || userObj.last_name || ''}`.trim() || `ID: ${row.userId}`;
                }
                return `ID: ${row.userId}`;
            }
        },
        { 
            key: 'userEmail', 
            header: 'Email', 
            render: (_, row) => {
                const userObj = allUsers.find(u => u.id === row.userId);
                return userObj ? userObj.email : 'N/A';
            }
        },
        { 
            key: 'role', 
            header: 'Rol en Contrato', 
            render: (val, row) => <Badge variant="success">{row.roleInContract || 'MANAGER'}</Badge> 
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (_, row) => {
                const userObj = allUsers.find(u => u.id === row.userId);
                const name = userObj ? `${userObj.firstName || userObj.first_name || ''} ${userObj.lastName || userObj.last_name || ''}`.trim() : `ID ${row.userId}`;
                return (
                    <Button 
                        size="small" 
                        variant="danger" 
                        disabled={actionLoading}
                        onClick={() => handleUnassign(row.userId, name)}
                        style={{ padding: '4px 8px', minWidth: 'auto' }}
                    >
                        <Icon name="trash" size={12} className="mr-1" /> Desvincular
                    </Button>
                );
            }
        }
    ];

    return (
        <Modal isOpen={isOpen} title={`Cuentas Vinculadas - ${contract?.name || ''}`} onClose={onClose} size="large">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Current Managers Section */}
                <div>
                    <h4 style={{ color: '#e2e8f0', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Cuentas de Gestor Asignadas</h4>
                    {loading ? (
                        <p style={{ color: '#a0aec0' }}>Cargando asignaciones...</p>
                    ) : assignedManagers.length === 0 ? (
                        <p style={{ color: '#a0aec0', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            No hay gestores asignados a este contrato. Los gestores vinculados podrán crear y controlar eventos bajo este contrato/proyecto.
                        </p>
                    ) : (
                        <Table columns={columnsAssigned} data={assignedManagers} className="admin-custom-table" />
                    )}
                </div>

                {/* Add New Manager Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: '#e2e8f0', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Vincular Nuevo Gestor/Usuario</h4>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <Input 
                            placeholder="Buscar usuario por nombre o email..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {availableUsers.length === 0 ? (
                            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '1rem' }}>No se encontraron usuarios disponibles</p>
                        ) : (
                            availableUsers.map(user => (
                                <div 
                                    key={user.id} 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        padding: '0.6rem 0.8rem', 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        gap: '1rem'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#fff' }}>{user.firstName || user.first_name} {user.lastName || user.last_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{user.email} <span style={{ marginLeft: '8px', opacity: 0.6 }}>({user.role})</span></div>
                                    </div>
                                    <Button 
                                        size="small" 
                                        variant="outline" 
                                        disabled={actionLoading}
                                        onClick={() => handleAssign(user.id)}
                                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                    >
                                        <Icon name="plus" size={12} className="mr-1" /> Vincular
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button onClick={onClose} variant="secondary">Cerrar</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ContractManagersModal;
