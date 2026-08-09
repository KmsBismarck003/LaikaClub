import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Icon, PermissionWall, AnimatedCounter } from '../../components';
import { Camera, Search, ShoppingBag, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import QRScanner from './components/QRScanner';
import TicketInfo from './components/TicketInfo';
import StatusMessage from './components/StatusMessage';
import StaffStats from './components/StaffStats';
import StaffHelpDesk from './components/StaffHelpDesk';
import StaffBoxOffice from './components/StaffBoxOffice';
import './StaffDashboard.css';

const StaffTerminal = () => {
    const { user } = useAuth();
    const { success, error: showError } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('scanner');
    const [selectedEventId, setSelectedEventId] = useState('');
    const [events, setEvents] = useState([]);
    
    const [ticketCode, setTicketCode] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [accessPoint, setAccessPoint] = useState(() => localStorage.getItem('staff_access_point') || 'Puerta Principal - Acceso 1');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['scanner', 'helpdesk', 'boxoffice'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/staff?tab=${tab}`);
    };

    const sessionStats = {
        total: scanHistory.length,
        valids: scanHistory.filter(h => h.status === 'valid' || h.status === 'used' || (h.valid && !h.alreadyUsed)).length,
        invalids: scanHistory.filter(h => h.status === 'invalid' || (!h.valid && !h.alreadyUsed)).length,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    useEffect(() => {
        fetchEvents();
        const savedHistory = localStorage.getItem('staff_scan_history');
        if (savedHistory) {
            try {
                setScanHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error parsing scan history', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('staff_scan_history', JSON.stringify(scanHistory));
    }, [scanHistory]);

    const fetchEvents = async () => {
        try {
            const data = await api.event.getAll({ status_filter: 'published' });
            setEvents(data);
            if (data.length > 0) setSelectedEventId(data[0].id);
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    };

    const handleVerifyTicket = async (code) => {
        const codeToVerify = code || ticketCode;
        if (!codeToVerify || !codeToVerify.trim()) {
            setAlert({ type: 'error', message: 'Ingresa un código de boleto para continuar' });
            return;
        }

        setLoading(true);
        setAlert(null);
        setIsScanning(false);

        try {
            const context = {
                platform: 'WEB_OPERATOR',
                accessPoint: accessPoint,
                selectedEventId: selectedEventId ? Number(selectedEventId) : null,
                operatorName: user?.name || 'Staff Operador'
            };
            const response = await api.ticket.verify(codeToVerify, context);
            
            let mappedStatus = 'invalid';
            if (response.actionable || (response.valid && !response.alreadyUsed)) mappedStatus = 'valid';
            else if (response.alreadyUsed || response.statusCode === 'ALREADY_REDEEMED') mappedStatus = 'used';
            else if (response.statusCode === 'FUTURE_EVENT') mappedStatus = 'future';
            else if (response.statusCode === 'CONCLUDED_EVENT') mappedStatus = 'concluded';
            else if (response.statusCode === 'WRONG_FUNCTION') mappedStatus = 'warning';

            const result = {
                valid: response.valid || false,
                actionable: response.actionable !== undefined ? response.actionable : (response.valid && !response.alreadyUsed),
                isError: response.isError || false,
                statusCode: response.statusCode || mappedStatus,
                statusTitle: response.statusTitle || null,
                operatorMessage: response.operatorMessage || response.message || null,
                timeRemainingSeconds: response.timeRemainingSeconds || 0,
                status: mappedStatus,
                ticketCode: codeToVerify,
                eventName: response.event?.name || response.eventName || 'Evento Asignado',
                customerName: response.customer?.name || response.customerName || 'Asistente Registrado',
                ticketType: response.ticketType || response.ticket_type || 'Acceso General',
                sectionName: response.sectionName || response.section_name || 'General',
                seatId: response.seatId || response.seat_id || 'N/A',
                purchaseDate: response.purchaseDate || response.purchase_date || new Date().toISOString(),
                scannedAt: new Date().toISOString(),
                alreadyUsed: response.alreadyUsed || response.already_used || false,
                ticketId: response.id || response.ticketId,
                message: response.operatorMessage || response.message
            };

            setVerificationResult(result);
            setTicketCode('');
            setScanHistory(prev => [result, ...prev.slice(0, 29)]);

            if (result.actionable || (result.valid && !result.alreadyUsed)) {
                success('Acceso Autorizado • Boleto válido en ventana permitida');
            } else if (result.alreadyUsed || result.statusCode === 'ALREADY_REDEEMED') {
                showError('ALERTA DE SEGURIDAD • Boleto previamente canjeado');
            } else if (result.statusCode === 'FUTURE_EVENT') {
                showError('ALERTA DE HORARIO • El evento aún no abre puertas');
            } else if (result.statusCode === 'CONCLUDED_EVENT') {
                showError('ALERTA TEMPORAL • Evento ya concluido');
            } else if (result.statusCode === 'WRONG_FUNCTION') {
                showError('ALERTA DE EVENTO • Corresponde a otra función');
            } else {
                showError('ACCESO DENEGADO • Boleto inválido o revocado');
            }
        } catch (error) {
            console.error('Error al verificar:', error);
            setAlert({ type: 'error', message: error.message || 'Fallo en conexión con el servidor de validación' });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemTicket = async () => {
        if (!verificationResult || (!verificationResult.actionable && !verificationResult.valid) || verificationResult.alreadyUsed) return;
        try {
            const context = {
                platform: 'WEB_OPERATOR',
                accessPoint: accessPoint,
                selectedEventId: selectedEventId ? Number(selectedEventId) : null,
                operatorName: user?.name || 'Staff Operador'
            };
            await api.ticket.redeem(verificationResult.ticketCode, context);
            success('Ingreso registrado y canjeado exitosamente');
            setVerificationResult(prev => ({ ...prev, alreadyUsed: true, actionable: false, status: 'used', statusCode: 'REDEEMED_SUCCESS', statusTitle: 'INGRESO REGISTRADO', message: 'Boleto canjeado exitosamente en el punto de acceso.' }));
            setScanHistory(prev => prev.map((item, index) =>
                index === 0 ? { ...item, alreadyUsed: true, actionable: false, status: 'used', statusCode: 'REDEEMED_SUCCESS', statusTitle: 'INGRESO REGISTRADO' } : item
            ));
        } catch (error) {
            showError(error.message || 'Error al procesar el registro de ingreso');
        }
    };

    const resetScanner = () => {
        setVerificationResult(null);
        setAlert(null);
        setTicketCode('');
        setIsScanning(true);
    };

    return (
        <PermissionWall permission="canValidateTickets" label="Terminal de Validación">
            <div className="staff-terminal-container">
                <header className="staff-header">
                    <div className="staff-header-content">
                        <h1>
                            <ShieldCheck size={28} color="var(--staff-accent-primary)" />
                            Terminal de Control en Campo
                        </h1>
                        <p className="staff-subtitle">Consola en tiempo real para validación, soporte en puerta y venta en taquilla</p>
                    </div>
                    
                    <div className="staff-event-selector">
                        <label htmlFor="select-event">Evento en Operación:</label>
                        <select 
                            id="select-event"
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="staff-select-input"
                        >
                            {events.length === 0 ? (
                                <option value="">Sin eventos publicados disponibles</option>
                            ) : (
                                events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)
                            )}
                        </select>
                    </div>
                </header>

                <div className="staff-health-strip">
                    <div className="staff-health-info">
                        <div className="staff-health-item">
                            <span className="staff-health-label">Punto de Control</span>
                            <div className="staff-health-value">
                                <Activity size={16} color="var(--staff-status-valid)" />
                                <span>{accessPoint}</span>
                                <button
                                    type="button" 
                                    className="staff-edit-btn" 
                                    title="Modificar Punto de Acceso"
                                    onClick={() => {
                                        const p = prompt('Ingresa el nombre del Punto de Acceso actual:', accessPoint);
                                        if (p && p.trim()) {
                                            setAccessPoint(p.trim());
                                            localStorage.setItem('staff_access_point', p.trim());
                                        }
                                    }}
                                >
                                    <Icon name="edit" size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="staff-health-item">
                            <span className="staff-health-label">Estado de Red</span>
                            <div className="staff-health-value">
                                <div className="staff-status-dot online"></div>
                                <span>Sincronización Activa</span>
                            </div>
                        </div>
                    </div>

                    <div className="staff-nav-tabs">
                        <button 
                            type="button"
                            className={`staff-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
                            onClick={() => handleTabChange('scanner')}
                        >
                            <Camera size={16} /> Validación de Entradas
                        </button>
                        <button 
                            type="button"
                            className={`staff-tab-btn ${activeTab === 'helpdesk' ? 'active' : ''}`}
                            onClick={() => handleTabChange('helpdesk')}
                        >
                            <Search size={16} /> Soporte en Puerta
                        </button>
                        <button 
                            type="button"
                            className={`staff-tab-btn ${activeTab === 'boxoffice' ? 'active' : ''}`}
                            onClick={() => handleTabChange('boxoffice')}
                        >
                            <ShoppingBag size={16} /> Taquilla Presencial
                        </button>
                    </div>
                </div>

                <div className="staff-metrics-grid">
                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Procesados en Turno</span>
                            <div className="staff-metric-number"><AnimatedCounter value={sessionStats.total} /></div>
                        </div>
                        <div className="staff-metric-icon"><Icon name="checkCircle" size={20} /></div>
                    </div>
                    
                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Ingresos Válidos</span>
                            <div className="staff-metric-number" style={{ color: 'var(--staff-status-valid)' }}><AnimatedCounter value={sessionStats.valids} /></div>
                        </div>
                        <div className="staff-metric-icon success"><Icon name="check" size={20} /></div>
                    </div>
                    
                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Alertas de Ingreso</span>
                            <div className="staff-metric-number" style={{ color: 'var(--staff-status-error)' }}><AnimatedCounter value={sessionStats.invalids} /></div>
                        </div>
                        <div className="staff-metric-icon error"><Icon name="alertTriangle" size={20} /></div>
                    </div>
                    
                    <div className="staff-metric-card">
                        <div className="staff-metric-data">
                            <span className="staff-metric-label">Flujo Operativo</span>
                            <div className="staff-metric-number">
                                <AnimatedCounter value={Math.floor(sessionStats.total / Math.max(1, (new Date() - new Date(new Date().setHours(new Date().getHours() - 1))) / 60000)) || 0} /> <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.6 }}>/min</span>
                            </div>
                        </div>
                        <div className="staff-metric-icon"><Activity size={20} /></div>
                    </div>
                </div>

                <div className="staff-content-area">
                    {activeTab === 'scanner' && (
                        <div className="staff-scanner-view">
                            {alert && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', borderRadius: '8px', background: 'var(--staff-status-error-bg)', border: '1px solid var(--staff-status-error)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff', fontWeight: 600 }}>
                                    <AlertCircle color="var(--staff-status-error)" size={20} />
                                    <span>{alert.message}</span>
                                </div>
                            )}

                            {!verificationResult ? (
                                <div className="staff-scanner-container">
                                    {isScanning ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <QRScanner onScanSuccess={(text) => handleVerifyTicket(text)} />
                                            <Button variant="secondary" fullWidth onClick={() => setIsScanning(false)}>
                                                Cambiar a Ingreso Manual
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="staff-scanner-trigger" onClick={() => setIsScanning(true)} role="button" tabIndex={0}>
                                                <Camera size={56} className="staff-scanner-icon" />
                                                <p className="staff-scanner-text">Tocar para Activar Lector Óptico (Camara / QR)</p>
                                            </div>

                                            <div className="staff-divider">INGRESO MANUAL DE CÓDIGO</div>

                                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyTicket(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <Input
                                                    label="Identificador de Boleto (Código Alfanumérico)"
                                                    value={ticketCode}
                                                    onChange={(e) => setTicketCode(e.target.value)}
                                                    placeholder="Ej. TKT-89324701-XY"
                                                    fullWidth
                                                />
                                                <Button type="submit" variant="primary" size="large" fullWidth loading={loading} disabled={!ticketCode.trim()}>
                                                    Verificar e Inspeccionar Boleto
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`staff-result-card ${verificationResult.status}`}>
                                    <StatusMessage 
                                        status={verificationResult.status} 
                                        statusCode={verificationResult.statusCode} 
                                        statusTitle={verificationResult.statusTitle} 
                                        message={verificationResult.operatorMessage || verificationResult.message} 
                                        timeRemainingSeconds={verificationResult.timeRemainingSeconds} 
                                    />
                                    <TicketInfo ticket={verificationResult} />
                                    
                                    {(verificationResult.actionable || (verificationResult.status === 'valid' && !verificationResult.alreadyUsed)) && (
                                        <Button variant="success" size="large" fullWidth onClick={handleRedeemTicket} style={{ marginBottom: '0.75rem' }}>
                                            Confirmar Acceso • Registrar Canje
                                        </Button>
                                    )}
                                    
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                        <Button variant="secondary" style={{ flex: 1, minWidth: '160px' }} onClick={() => {
                                            api.ticket.resendTicket(verificationResult.ticketCode);
                                            success('Confirmación de boleto reenviada al correo del asistente');
                                        }}>
                                            Reenviar Comprobante
                                        </Button>
                                        <Button variant="primary" style={{ flex: 1, minWidth: '160px' }} onClick={resetScanner}>
                                            Procesar Siguiente Boleto
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2.5rem' }}>
                                <StaffStats history={scanHistory} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'helpdesk' && (
                        <StaffHelpDesk eventId={selectedEventId} />
                    )}

                    {activeTab === 'boxoffice' && (
                        <StaffBoxOffice eventId={selectedEventId} />
                    )}
                </div>
            </div>
        </PermissionWall>
    );
};

export default StaffTerminal;
