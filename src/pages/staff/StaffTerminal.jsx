import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PermissionWall, AnimatedCounter } from '../../components';
import { BentoGrid, BentoCard, BentoHeader, BentoBadge } from '../../components/Bento';
import {
  Camera,
  Search,
  ShoppingBag,
  Activity,
  ShieldCheck,
  AlertCircle,
  History,
  CheckCircle2,
  Clock,
  Radio,
  Edit3,
  QrCode
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import QRScanner from './components/QRScanner';
import TicketInfo from './components/TicketInfo';
import StatusMessage from './components/StatusMessage';
import StaffHelpDesk from './components/StaffHelpDesk';
import StaffBoxOffice from './components/StaffBoxOffice';
import './StaffDashboard.css';

/**
 * StaffTerminal - Terminal de Control en Campo Bento Box Tier-1.
 * Estación de trabajo principal para el operador de acceso, taquilla y soporte.
 */
const StaffTerminal = () => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Estado de Pestañas
  const [activeTab, setActiveTab] = useState('scanner');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [events, setEvents] = useState([]);

  // 2. Estado de Escaneo y Verificación
  const [ticketCode, setTicketCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [accessPoint, setAccessPoint] = useState(
    () => localStorage.getItem('staff_access_point') || 'Puerta Principal - Acceso 1'
  );

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
    valids: scanHistory.filter(
      (h) => h.status === 'valid' || h.status === 'used' || (h.valid && !h.alreadyUsed)
    ).length,
    invalids: scanHistory.filter(
      (h) => h.status === 'invalid' || (!h.valid && !h.alreadyUsed)
    ).length,
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const flowRate = Math.floor(
    sessionStats.total / Math.max(1, (new Date() - new Date(new Date().setHours(new Date().getHours() - 1))) / 60000)
  ) || 0;

  useEffect(() => {
    fetchEvents();
    const savedHistory = localStorage.getItem('staff_scan_history');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error al cargar historial de escaneo:', e);
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
      if (data.length > 0) setSelectedEventId(String(data[0].id));
    } catch (err) {
      console.error('Error al cargar eventos:', err);
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
        operatorName: user?.name || user?.firstName || 'Staff Operador'
      };
      const response = await api.ticket.verify(codeToVerify, context);

      let mappedStatus = 'invalid';
      if (response.actionable || (response.valid && !response.alreadyUsed)) mappedStatus = 'valid';
      else if (response.alreadyUsed || response.statusCode === 'ALREADY_REDEEMED') mappedStatus = 'used';
      else if (response.statusCode === 'FUTURE_EVENT') mappedStatus = 'future';
      else if (response.statusCode === 'CONCLUDED_EVENT') mappedStatus = 'concluded';
      else if (response.statusCode === 'WRONG_FUNCTION' || response.statusCode === 'WRONG_EVENT') mappedStatus = 'warning';

      const result = {
        valid: response.valid || false,
        actionable:
          response.actionable !== undefined
            ? response.actionable
            : response.valid && !response.alreadyUsed,
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
      setScanHistory((prev) => [result, ...prev.slice(0, 29)]);

      if (result.actionable || (result.valid && !result.alreadyUsed)) {
        success('Acceso Autorizado • Boleto válido en ventana permitida');
      } else if (result.statusCode === 'REVOKED_TICKET') {
        showError('ACCESO DENEGADO • Boleto cancelado o reembolsado');
      } else if (result.alreadyUsed || result.statusCode === 'ALREADY_REDEEMED') {
        showError('ALERTA DE SEGURIDAD • Boleto ya utilizado previamente');
      } else if (result.statusCode === 'FUTURE_EVENT') {
        showError('ALERTA DE HORARIO • Aún no es fecha ni hora para ingresar (puertas cerradas)');
      } else if (result.statusCode === 'CONCLUDED_EVENT') {
        showError('ALERTA TEMPORAL • La fecha del evento ya pasó (función concluida)');
      } else if (result.statusCode === 'WRONG_FUNCTION' || result.statusCode === 'WRONG_EVENT') {
        showError('ALERTA DE EVENTO • Este boleto corresponde a OTRO evento o función');
      } else {
        showError(result.operatorMessage || 'ACCESO DENEGADO • Boleto inválido o revocado');
      }
    } catch (error) {
      console.error('Error al verificar:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Fallo en conexión con el servidor de validación'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemTicket = async () => {
    if (
      !verificationResult ||
      (!verificationResult.actionable && !verificationResult.valid) ||
      verificationResult.alreadyUsed
    )
      return;
    try {
      const context = {
        platform: 'WEB_OPERATOR',
        accessPoint: accessPoint,
        selectedEventId: selectedEventId ? Number(selectedEventId) : null,
        operatorName: user?.name || user?.firstName || 'Staff Operador'
      };
      await api.ticket.redeem(verificationResult.ticketCode, context);
      success('Ingreso registrado y canjeado exitosamente');
      setVerificationResult((prev) => ({
        ...prev,
        alreadyUsed: true,
        actionable: false,
        status: 'used',
        statusCode: 'REDEEMED_SUCCESS',
        statusTitle: 'INGRESO REGISTRADO',
        message: 'Boleto canjeado exitosamente en el punto de acceso.'
      }));
      setScanHistory((prev) =>
        prev.map((item, index) =>
          index === 0
            ? {
                ...item,
                alreadyUsed: true,
                actionable: false,
                status: 'used',
                statusCode: 'REDEEMED_SUCCESS',
                statusTitle: 'INGRESO REGISTRADO'
              }
            : item
        )
      );
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
        {/* ── Cabecera Bento Box de la Terminal ────────────────────── */}
        <header className="staff-header">
          <div className="staff-header-content">
            <h1>
              <ShieldCheck size={28} className="staff-header-icon" />
              Terminal Operativa • Lector y Puerta
            </h1>
            <p className="staff-subtitle">
              Consola de validación óptica, soporte de incidencias y venta presencial
            </p>
          </div>

          <div className="terminal-bento-header-actions">
            {/* Selector de Evento Activo */}
            <div className="terminal-context-pill">
              <span className="terminal-context-label">EVENTO:</span>
              <select
                id="select-event"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="terminal-select-pill"
              >
                {events.length === 0 ? (
                  <option value="">Sin eventos publicados</option>
                ) : (
                  events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Selector de Puerta de Acceso */}
            <div className="terminal-context-pill">
              <span className="terminal-context-label">PUERTA:</span>
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
                <Edit3 size={14} />
              </button>
            </div>

            {/* Badge de Red */}
            <BentoBadge variant="success" dot>
              SINCRONIZADO
            </BentoBadge>
          </div>
        </header>

        {/* ── Segmented Control Bento Tabs ────────────────────────── */}
        <nav className="terminal-tabs-strip" aria-label="Secciones de la Terminal">
          <button
            type="button"
            className={`terminal-tab-pill ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => handleTabChange('scanner')}
          >
            <Camera size={16} />
            <span>Lector de Entradas</span>
          </button>
          <button
            type="button"
            className={`terminal-tab-pill ${activeTab === 'helpdesk' ? 'active' : ''}`}
            onClick={() => handleTabChange('helpdesk')}
          >
            <Search size={16} />
            <span>Soporte de Entrada</span>
          </button>
          <button
            type="button"
            className={`terminal-tab-pill ${activeTab === 'boxoffice' ? 'active' : ''}`}
            onClick={() => handleTabChange('boxoffice')}
          >
            <ShoppingBag size={16} />
            <span>Venta Presencial</span>
          </button>
        </nav>

        {/* ── Contenido Modular Bento por Pestaña ─────────────────── */}
        {activeTab === 'scanner' && (
          <BentoGrid className="terminal-bento-grid">
            {/* Columna Principal: Estación de Escaneo Bento (colSpan 8) */}
            <BentoCard colSpan={8} variant="hero" className="terminal-scanner-hero-card">
              {alert && (
                <div className="terminal-alert-banner">
                  <AlertCircle size={20} />
                  <span>{alert.message}</span>
                </div>
              )}

              {/* Modo A: Cámara activa transmitiendo QR */}
              {isScanning && !verificationResult && (
                <div className="terminal-camera-feed-box">
                  <div className="terminal-camera-header">
                    <div className="terminal-camera-pulse">
                      <span className="terminal-pulse-dot" />
                      <span>CÁMARA ÓPTICA ACTIVA</span>
                    </div>
                    <button
                      type="button"
                      className="terminal-mode-switch-btn"
                      onClick={() => setIsScanning(false)}
                    >
                      Cambiar a Ingreso Manual
                    </button>
                  </div>
                  <div className="terminal-scanner-frame">
                    <QRScanner onScanSuccess={(text) => handleVerifyTicket(text)} />
                  </div>
                </div>
              )}

              {/* Modo B: Standby esperando escaneo o código manual */}
              {!isScanning && !verificationResult && (
                <div className="terminal-standby-box">
                  <div
                    className="terminal-optical-trigger"
                    onClick={() => setIsScanning(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === 'Enter' || e.key === ' ') && setIsScanning(true)
                    }
                  >
                    <div className="terminal-trigger-icon-wrap">
                      <Camera size={40} />
                    </div>
                    <div>
                      <h3 className="terminal-trigger-title">
                        Tocar para Activar Lector Óptico (Cámara / QR)
                      </h3>
                      <p className="terminal-trigger-desc">
                        Lectura instantánea de códigos QR en smartphones y pases impresos
                      </p>
                    </div>
                    <BentoBadge variant="info">Activar Lector</BentoBadge>
                  </div>

                  <div className="terminal-bento-divider">
                    <span>O INGRESA CÓDIGO MANUAL</span>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyTicket();
                    }}
                    className="terminal-manual-form"
                  >
                    <label htmlFor="ticket-code-input" className="terminal-manual-label">
                      Identificador de Boleto (Código Alfanumérico)
                    </label>
                    <div className="terminal-input-row">
                      <input
                        id="ticket-code-input"
                        type="text"
                        className="terminal-manual-input"
                        value={ticketCode}
                        onChange={(e) => setTicketCode(e.target.value)}
                        placeholder="Ej. TKT-89324701-XY"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="terminal-verify-btn"
                        disabled={loading || !ticketCode.trim()}
                      >
                        {loading ? 'Verificando...' : 'Verificar Boleto'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Modo C: Resultado de Verificación */}
              {verificationResult && (
                <div className={`terminal-result-bento ${verificationResult.status}`}>
                  <StatusMessage
                    status={verificationResult.status}
                    statusCode={verificationResult.statusCode}
                    statusTitle={verificationResult.statusTitle}
                    message={
                      verificationResult.operatorMessage || verificationResult.message
                    }
                    timeRemainingSeconds={verificationResult.timeRemainingSeconds}
                  />
                  <TicketInfo ticket={verificationResult} />

                  {(verificationResult.actionable ||
                    (verificationResult.status === 'valid' &&
                      !verificationResult.alreadyUsed)) && (
                    <button
                      type="button"
                      className="terminal-redeem-btn"
                      onClick={handleRedeemTicket}
                    >
                      <CheckCircle2 size={22} />
                      <span>Confirmar Acceso • Registrar Canje</span>
                    </button>
                  )}

                  <div className="terminal-result-actions">
                    <button
                      type="button"
                      className="terminal-btn-secondary"
                      onClick={() => {
                        api.ticket.resendTicket(verificationResult.ticketCode);
                        success('Confirmación de boleto reenviada al correo del asistente');
                      }}
                    >
                      Reenviar Comprobante
                    </button>
                    <button
                      type="button"
                      className="terminal-btn-primary"
                      onClick={resetScanner}
                    >
                      Procesar Siguiente Boleto
                    </button>
                  </div>
                </div>
              )}
            </BentoCard>

            {/* Columna Lateral: Rendimiento en Puerta y Bitácora (colSpan 4) */}
            <div className="terminal-sidebar-col bento-card--col-4">
              {/* Tarjeta de Métricas Bento */}
              <BentoCard colSpan={12} className="terminal-metrics-card">
                <BentoHeader
                  title="Rendimiento en Puerta"
                  subtitle="Métricas de la sesión activa"
                  icon={<Activity size={18} />}
                />
                <div className="terminal-kpis-grid">
                  <div className="terminal-kpi-item">
                    <span className="terminal-kpi-label">Procesados</span>
                    <div className="terminal-kpi-value">
                      <AnimatedCounter value={sessionStats.total} />
                    </div>
                  </div>
                  <div className="terminal-kpi-item">
                    <span className="terminal-kpi-label">Autorizados</span>
                    <div className="terminal-kpi-value success">
                      <AnimatedCounter value={sessionStats.valids} />
                    </div>
                  </div>
                  <div className="terminal-kpi-item">
                    <span className="terminal-kpi-label">Alertas</span>
                    <div className="terminal-kpi-value warning">
                      <AnimatedCounter value={sessionStats.invalids} />
                    </div>
                  </div>
                  <div className="terminal-kpi-item">
                    <span className="terminal-kpi-label">Flujo / min</span>
                    <div className="terminal-kpi-value">
                      <AnimatedCounter value={flowRate} />
                    </div>
                  </div>
                </div>
              </BentoCard>

              {/* Tarjeta de Bitácora Reciente en Puerta */}
              <BentoCard colSpan={12} className="terminal-recent-scans-card">
                <BentoHeader
                  title="Bitácora en Puerta"
                  subtitle="Últimos accesos en este punto"
                  icon={<History size={18} />}
                  action={
                    <button
                      type="button"
                      className="terminal-view-history-btn"
                      onClick={() => navigate('/staff/history')}
                    >
                      Ver todo
                    </button>
                  }
                />
                <div className="terminal-recent-scans-list">
                  {scanHistory.length === 0 ? (
                    <div className="terminal-scans-empty">
                      <Clock size={28} className="terminal-empty-icon" />
                      <p>Esperando primer ingreso en esta puerta</p>
                    </div>
                  ) : (
                    scanHistory.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="terminal-recent-item">
                        <div className="terminal-recent-info">
                          <span className="terminal-recent-name">
                            {item.customerName || 'Asistente'}
                          </span>
                          <span className="terminal-recent-meta">
                            {item.ticketType || 'General'} •{' '}
                            {item.scannedAt
                              ? new Date(item.scannedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Ahora'}
                          </span>
                        </div>
                        <BentoBadge
                          variant={
                            item.actionable ||
                            (item.valid && !item.alreadyUsed) ||
                            item.status === 'valid'
                              ? 'success'
                              : item.alreadyUsed || item.status === 'used'
                              ? 'warning'
                              : 'error'
                          }
                          size="sm"
                        >
                          {item.actionable ||
                          (item.valid && !item.alreadyUsed) ||
                          item.status === 'valid'
                            ? 'Válido'
                            : item.alreadyUsed || item.status === 'used'
                            ? 'Usado'
                            : 'Rechazado'}
                        </BentoBadge>
                      </div>
                    ))
                  )}
                </div>
              </BentoCard>
            </div>
          </BentoGrid>
        )}

        {/* Pestaña: Soporte en Puerta (HelpDesk) */}
        {activeTab === 'helpdesk' && (
          <BentoCard colSpan={12} variant="hero" className="terminal-tab-content-card">
            <StaffHelpDesk eventId={selectedEventId} />
          </BentoCard>
        )}

        {/* Pestaña: Taquilla Presencial (BoxOffice) */}
        {activeTab === 'boxoffice' && (
          <BentoCard colSpan={12} variant="hero" className="terminal-tab-content-card">
            <StaffBoxOffice eventId={selectedEventId} />
          </BentoCard>
        )}
      </div>
    </PermissionWall>
  );
};

export default StaffTerminal;
