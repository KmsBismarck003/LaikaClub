import React from 'react';
import { Badge } from '../../../components';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import '../StaffDashboard.css';

const StaffHistoryList = ({ history = [] }) => {
    return (
        <div className="staff-history-section">
            <h3 className="staff-section-title"><Clock size={16} /> Registro de Actives de Turno Recientes</h3>
            {history.length === 0 ? (
                <div className="staff-empty-state">
                    <Clock size={36} style={{ color: 'var(--staff-text-muted)', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <h4 className="staff-empty-title">Bitácora Vacía en Esta Sesión</h4>
                    <p className="staff-empty-desc">Los accesos verificados y validados a través de esta terminal aparecerán detallados en este listado en orden cronológico en tiempo real.</p>
                </div>
            ) : (
                <div className="staff-history-list">
                    {history.map((scan, index) => (
                        <div key={index} className="staff-history-item">
                            <div className="staff-history-meta">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {scan.status === 'valid' ? <CheckCircle2 size={22} color="var(--staff-status-valid)" /> :
                                        scan.status === 'used' ? <AlertTriangle size={22} color="var(--staff-status-warning)" /> :
                                            <XCircle size={22} color="var(--staff-status-error)" />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <span className="staff-history-code">{scan.ticketCode || 'CÓDIGO NO LEGIBLE'}</span>
                                    <span className="staff-history-event">{scan.eventName || 'Evento LAIKA Club'} • {scan.customerName || 'Asistente'}</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <span className="staff-history-time">{scan.scannedAt ? new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Hora no disponible'}</span>
                                <Badge variant={
                                    scan.status === 'valid' ? 'success' :
                                        scan.status === 'used' ? 'warning' : 'danger'
                                }>
                                    {scan.status === 'valid' ? 'ACCESO VÁLIDO' :
                                        scan.status === 'used' ? 'PREVIAMENTE USADO' : 'ACCESO RECHAZADO'}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffHistoryList;
