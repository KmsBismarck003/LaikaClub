import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../../components';

const OrganizationModal = ({ isOpen, onClose, onSubmit, organization = null }) => {
    const [form, setForm] = useState({ name: '', taxId: '', contactEmail: '' });

    useEffect(() => {
        if (organization) {
            setForm({
                name: organization.name || '',
                taxId: organization.taxId || '',
                contactEmail: organization.contactEmail || ''
            });
        } else {
            setForm({ name: '', taxId: '', contactEmail: '' });
        }
    }, [organization, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Modal isOpen={isOpen} title={organization ? "Editar Cliente B2B" : "Nuevo Cliente B2B"} onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <Input 
                    label="Nombre de la Organización" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                <Input 
                    label="RFC o Tax ID" 
                    required 
                    value={form.taxId} 
                    onChange={e => setForm({ ...form, taxId: e.target.value })} 
                />
                <Input 
                    label="Correo de Contacto" 
                    type="email" 
                    required 
                    value={form.contactEmail} 
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })} 
                />
                <Button type="submit" variant="primary">
                    {organization ? "Guardar Cambios" : "Guardar Cliente"}
                </Button>
            </form>
        </Modal>
    );
};

export default OrganizationModal;
