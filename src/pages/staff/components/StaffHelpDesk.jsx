import React, { useState } from 'react';
import { Table, Button, Input, Icon, Badge } from '../../../components';
import { managerAPI } from '../../../services/managerService';
import { ticketAPI } from '../../../services/ticketService';
import { useNotification } from '../../../context/NotificationContext';
import '../StaffDashboard.css';

const StaffHelpDesk = ({ eventId }) => {
    const { success, error: showError } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const allAttendees = await managerAPI.getAttendees(eventId);
            const filtered = allAttendees.filter(a => 
                (a.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (a.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (a.ticket?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setResults(filtered);
        } catch (error) {
            showError('Error en consulta al servicio de asistentes');
        } finally {
            setLoading(false);
        }
    };

    const handleManualRedeem = async (ticketCode) => {
        try {
            await ticketAPI.redeem(ticketCode);
            success('Acceso manual validado y registrado en bitácora del sistema');
            handleSearch(); // Refresh list
        } catch (error) {
            showError(error.message || 'Fallo al procesar validación manual en servidor');
        }
    };

    const columns = [
        { key: 'name', header: 'Nombre del Asistente' },
        { key: 'email', header: 'Correo Electrónico' },
        { key: 'ticket', header: 'Código de Boleto' },
        { 
            key: 'status', 
            header: 'Estatus',
            render: (status) => (
                <Badge variant={status === 'checked-in' ? 'success' : 'warning'}>
                    {status === 'checked-in' ? 'INGRESADO EN PUERTA' : 'PENDIENTE DE ACCESO'}
                </Badge>
            )
        },
        {
            key: 'actions',
            header: 'Validación Manual',
            render: (_, row) => (
                row.status !== 'checked-in' ? (
                    <Button size="small" variant="success" onClick={() => handleManualRedeem(row.ticket)}>
                        Validar Acceso
                    </Button>
                ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--staff-text-muted)', fontWeight: 700 }}>Canjeado</span>
                )
            )
        }
    ];

    return (
        <div className="staff-help-desk-view">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                    <Input 
                        placeholder="Ingresa Nombre, Email, DNI o Código de boleto para localizar en lista..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                </div>
                <Button type="submit" variant="primary" loading={loading} style={{ padding: '0 2rem', minHeight: '44px' }}>
                    <Icon name="search" size={18} className="mr-2" />
                    Consultar Bitácora
                </Button>
            </form>

            {!hasSearched ? (
                <div className="staff-empty-state">
                    <Icon name="search" size={36} style={{ color: 'var(--staff-text-muted)', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <h3 className="staff-empty-title">Soporte de Puerta y Resolución de Problemas</h3>
                    <p className="staff-empty-desc">Utiliza la barra de búsqueda superior para localizar el registro de cualquier asistente del evento en caso de falla con su dispositivo o pérdida del código de lectura.</p>
                </div>
            ) : (
                <Table 
                    columns={columns}
                    data={results}
                    emptyMessage="No se localizaron asistentes que coincidan con el criterio ingresado para este evento."
                    hoverable
                />
            )}
        </div>
    );
};

export default StaffHelpDesk;
