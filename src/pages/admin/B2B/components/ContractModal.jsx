import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../../components';

const ContractModal = ({ isOpen, onClose, onSubmit, organizations, contract = null }) => {
    const [form, setForm] = useState({
        organizationId: '',
        name: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
        maxEvents: 0,
        isUnlimited: false
    });

    useEffect(() => {
        if (contract) {
            setForm({
                organizationId: contract.organization?.id || contract.organizationId || '',
                name: contract.name || '',
                status: contract.status || 'ACTIVE',
                startDate: contract.startDate || '',
                endDate: contract.endDate || '',
                maxEvents: contract.maxEvents || 0,
                isUnlimited: contract.isUnlimited || false
            });
        } else {
            setForm({
                organizationId: '',
                name: '',
                status: 'ACTIVE',
                startDate: '',
                endDate: '',
                maxEvents: 0,
                isUnlimited: false
            });
        }
    }, [contract, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Modal isOpen={isOpen} title={contract ? "Editar Contrato / Paquete" : "Nuevo Contrato / Paquete"} onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#a0aec0' }}>Cliente / Organización</label>
                    <select 
                        className="laika-input" 
                        required 
                        value={form.organizationId} 
                        onChange={e => setForm({ ...form, organizationId: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(26, 32, 44, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <Input 
                    label="Nombre del Proyecto / Paquete (Ej. Tour 2026)" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Input 
                        label="Fecha Inicio" 
                        type="date" 
                        required 
                        value={form.startDate} 
                        onChange={e => setForm({ ...form, startDate: e.target.value })} 
                    />
                    <Input 
                        label="Fecha Fin" 
                        type="date" 
                        required 
                        value={form.endDate} 
                        onChange={e => setForm({ ...form, endDate: e.target.value })} 
                    />
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#a0aec0' }}>Estado del Contrato</label>
                    <select 
                        className="laika-input" 
                        required 
                        value={form.status} 
                        onChange={e => setForm({ ...form, status: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(26, 32, 44, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    >
                        <option value="ACTIVE">Activo (ACTIVE)</option>
                        <option value="PENDING">Pendiente (PENDING)</option>
                        <option value="FINISHED">Finalizado (FINISHED)</option>
                    </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#e2e8f0', margin: '0.5rem 0' }}>
                    <input 
                        type="checkbox" 
                        checked={form.isUnlimited} 
                        onChange={e => setForm({ ...form, isUnlimited: e.target.checked })} 
                    />
                    Paquete Ilimitado (Venue Retainer)
                </label>

                {!form.isUnlimited && (
                    <Input 
                        label="Límite Máximo de Eventos" 
                        type="number" 
                        required 
                        value={form.maxEvents} 
                        onChange={e => setForm({ ...form, maxEvents: parseInt(e.target.value) || 0 })} 
                    />
                )}

                <Button type="submit" variant="primary">
                    {contract ? "Guardar Cambios" : "Activar Contrato"}
                </Button>
            </form>
        </Modal>
    );
};

export default ContractModal;
