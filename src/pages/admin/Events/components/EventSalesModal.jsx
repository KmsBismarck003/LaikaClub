import React, { useState } from 'react';
import { Modal, Card, Table, Badge, Button, Input, Icon } from '../../../../components';
import { useEventSalesData } from './useEventSalesData';

const EventSalesModal = ({ isOpen, onClose, event }) => {
    const { loading, ticketSummary, revenueSummary, attendees, error, refresh } = useEventSalesData(event?.id);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    if (!event) return null;

    // Filter attendees based on tab and search
    const getFilteredAttendees = () => {
        let list = attendees;
        if (activeTab === 'checked-in') {
            list = attendees.filter(a => a.status === 'checked-in');
        } else if (activeTab === 'pending') {
            list = attendees.filter(a => a.status !== 'checked-in');
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            list = list.filter(a => 
                (a.name || '').toLowerCase().includes(term) ||
                (a.email || '').toLowerCase().includes(term) ||
                (a.ticket || '').toLowerCase().includes(term)
            );
        }
        return list;
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
    };

    const attendeeColumns = [
        { key: 'name', header: 'Asistente/Comprador' },
        { key: 'email', header: 'Email' },
        { key: 'ticket', header: 'Boleto/Código' },
        { key: 'entry', header: 'Puerta', render: (val) => val || 'General' },
        { key: 'time', header: 'Hora Ingreso', render: (val) => val ? new Date(val).toLocaleTimeString() : 'N/A' },
        { 
            key: 'status', 
            header: 'Acceso',
            render: (val) => (
                <Badge variant={val === 'checked-in' ? 'success' : 'default'} rounded>
                    {val === 'checked-in' ? 'CANJEADO' : 'PENDIENTE'}
                </Badge>
            )
        }
    ];

    const exportToCSV = () => {
        const list = getFilteredAttendees();
        const headers = ['Nombre', 'Email', 'Boleto', 'Puerta', 'Hora Ingreso', 'Estado'];
        const csvRows = list.map(a => [
            a.name || '',
            a.email || '',
            a.ticket || '',
            a.entry || 'General',
            a.time || '',
            a.status || 'pending'
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `ventas_${event.name.replace(/\s+/g, '_')}_${activeTab}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ventas & Asistencia: ${event.name}`} size="large">
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', alignItems: 'center' }}>
                    <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#a0aec0' }}>Cargando métricas en tiempo real...</p>
                </div>
            ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
                    <Icon name="alert-triangle" size={48} />
                    <p style={{ marginTop: '1rem' }}>{error}</p>
                    <Button onClick={refresh} style={{ marginTop: '1rem' }}>Reintentar</Button>
                </div>
            ) : (
                <div className="sales-metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Navigation Tabs */}
                    <div className="sales-tabs" style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', gap: '1rem' }}>
                        {[
                            { id: 'dashboard', label: 'Resumen Financiero', icon: 'trending-up' },
                            { id: 'buyers', label: `Todos los Compradores (${attendees.length})`, icon: 'users' },
                            { id: 'checked-in', label: `Ya Canjearon (${attendees.filter(a => a.status === 'checked-in').length})`, icon: 'check-circle' },
                            { id: 'pending', label: `Pendientes (${attendees.filter(a => a.status !== 'checked-in').length})`, icon: 'clock' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === tab.id ? 'var(--primary, #ffffff)' : '#718096',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--primary, #ffffff)' : '2px solid transparent',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                            >
                                <Icon name={tab.icon} size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'dashboard' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* KPI Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                                <Card className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.15), rgba(0,0,0,0.2))', borderLeft: '4px solid #4299e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a0aec0', fontWeight: '500' }}>TOTAL RECAUDADO</span>
                                        <Icon name="dollar-sign" size={20} style={{ color: '#4299e1' }} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 0.2rem 0', fontWeight: '800' }}>{formatCurrency(revenueSummary?.net)}</h2>
                                    <span style={{ fontSize: '0.8rem', color: '#48bb78' }}>
                                        Bruto: {formatCurrency(revenueSummary?.gross)}
                                    </span>
                                </Card>

                                <Card className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.15), rgba(0,0,0,0.2))', borderLeft: '4px solid #48bb78' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a0aec0', fontWeight: '500' }}>BOLETOS VENDIDOS</span>
                                        <Icon name="ticket" size={20} style={{ color: '#48bb78' }} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 0.2rem 0', fontWeight: '800' }}>{ticketSummary?.sold || 0}</h2>
                                    <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                        De {ticketSummary?.total_capacity || 0} lugares disponibles
                                    </span>
                                </Card>

                                <Card className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(237, 137, 54, 0.15), rgba(0,0,0,0.2))', borderLeft: '4px solid #ed8936' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a0aec0', fontWeight: '500' }}>BOLETOS FALTANTES</span>
                                        <Icon name="archive" size={20} style={{ color: '#ed8936' }} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 0.2rem 0', fontWeight: '800' }}>{ticketSummary?.available || 0}</h2>
                                    <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                        Libres para venta
                                    </span>
                                </Card>

                                <Card className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.15), rgba(0,0,0,0.2))', borderLeft: '4px solid #9f7aec' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#a0aec0', fontWeight: '500' }}>ASISTENCIA ACTUAL</span>
                                        <Icon name="check-circle" size={20} style={{ color: '#9f7aec' }} />
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 0.2rem 0', fontWeight: '800' }}>
                                        {ticketSummary?.used || 0}
                                    </h2>
                                    <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                        {ticketSummary?.sold > 0 ? Math.round(((ticketSummary?.used || 0) / ticketSummary.sold) * 100) : 0}% de los vendidos canjeados
                                    </span>
                                </Card>
                            </div>

                            {/* Progress & Sell Through */}
                            <Card className="glass-panel">
                                <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Avance de Ventas (Sell-Through Rate)</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div 
                                            style={{ 
                                                width: `${Math.min(ticketSummary?.sell_through_pct || 0, 100)}%`, 
                                                height: '100%', 
                                                background: 'linear-gradient(90deg, var(--primary) 0%, #3182ce 100%)',
                                                borderRadius: '10px',
                                                transition: 'width 1s ease'
                                            }}
                                        ></div>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary, #ffffff)' }}>
                                        {ticketSummary?.sell_through_pct || 0}%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#a0aec0' }}>
                                    <span>{ticketSummary?.sold || 0} Vendidos</span>
                                    <span>Capacidad Máxima: {ticketSummary?.total_capacity || 0}</span>
                                </div>
                            </Card>

                            {/* Refund Stats */}
                            {revenueSummary?.tickets_refunded > 0 && (
                                <Card className="glass-panel" style={{ borderLeft: '4px solid var(--error)' }}>
                                    <h4 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Historial de Devoluciones</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                                        Se han procesado <strong>{revenueSummary.tickets_refunded} devoluciones</strong> con un monto total devuelto de <strong>{formatCurrency(revenueSummary.refunded_amount)}</strong>.
                                    </p>
                                </Card>
                            )}

                            {/* Recent Purchases List */}
                            <Card className="glass-panel">
                                <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Últimas Ventas Registradas</h4>
                                {ticketSummary?.recent_purchases && ticketSummary.recent_purchases.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#a0aec0' }}>
                                                    <th style={{ padding: '0.5rem' }}>Código</th>
                                                    <th style={{ padding: '0.5rem' }}>Comprador</th>
                                                    <th style={{ padding: '0.5rem' }}>Monto</th>
                                                    <th style={{ padding: '0.5rem' }}>Fecha</th>
                                                    <th style={{ padding: '0.5rem' }}>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ticketSummary.recent_purchases.map((p, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>{p.ticket_code}</td>
                                                        <td style={{ padding: '0.75rem 0.5rem' }}>{p.customer || 'Usuario Registrado'}</td>
                                                        <td style={{ padding: '0.75rem 0.5rem' }}>{formatCurrency(p.price)}</td>
                                                        <td style={{ padding: '0.75rem 0.5rem' }}>{p.purchase_date ? new Date(p.purchase_date).toLocaleString() : 'N/A'}</td>
                                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                                            <Badge variant={p.status === 'refunded' ? 'danger' : 'success'} rounded>
                                                                {p.status?.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ color: '#718096', fontSize: '0.9rem' }}>No hay ventas registradas recientemente.</p>
                                )}
                            </Card>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Search and Action Bar */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Input
                                    placeholder="Buscar por nombre, correo o código de boleto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    fullWidth
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Button onClick={exportToCSV} variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                                    <Icon name="download" size={16} />
                                    Exportar CSV
                                </Button>
                            </div>

                            {/* Table of Attendees */}
                            <div className="glass-panel" style={{ padding: 0, borderRadius: '8px', overflow: 'hidden' }}>
                                <Table
                                    columns={attendeeColumns}
                                    data={getFilteredAttendees()}
                                    emptyMessage="No se encontraron registros de asistentes con los criterios de búsqueda."
                                    hoverable
                                    className="admin-custom-table"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .sales-metrics-container td, .sales-metrics-container th {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </Modal>
    );
};

export default EventSalesModal;
