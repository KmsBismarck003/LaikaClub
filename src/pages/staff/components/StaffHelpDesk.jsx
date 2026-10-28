import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, RefreshCw, CheckCircle2, Mail, Hash, User } from 'lucide-react';
import { BentoCard, BentoHeader, BentoBadge } from '../../../components/Bento';
import { managerAPI } from '../../../services/managerService';
import { ticketAPI } from '../../../services/ticketService';
import { useNotification } from '../../../context/NotificationContext';
import '../StaffDashboard.css';

/**
 * StaffHelpDesk - Mesa de Soporte de Entrada Bento Box.
 * Permite al operador localizar asistentes por nombre, email o boleto y autorizar accesos manuales.
 */
const StaffHelpDesk = ({ eventId }) => {
  const { success, error: showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [redeemingTicket, setRedeemingTicket] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const allAttendees = await managerAPI.getAttendees(eventId);
      const q = searchQuery.toLowerCase().trim();
      const filtered = (allAttendees || []).filter((a) =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.ticket && a.ticket.toLowerCase().includes(q))
      );
      setResults(filtered);
    } catch (error) {
      showError('Error al consultar el padrón de asistentes del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRedeem = async (ticketCode) => {
    if (!ticketCode) return;
    setRedeemingTicket(ticketCode);
    try {
      await ticketAPI.redeem(ticketCode, {
        platform: 'WEB_OPERATOR',
        validationMode: 'MANUAL_HELPDESK'
      });
      success('Acceso manual validado y registrado en la bitácora oficial');
      // Actualizar estado local inmediatamente
      setResults((prev) =>
        prev.map((item) =>
          item.ticket === ticketCode ? { ...item, status: 'checked-in' } : item
        )
      );
    } catch (error) {
      showError(error.message || 'Fallo al procesar validación manual en servidor');
    } finally {
      setRedeemingTicket(null);
    }
  };

  return (
    <div className="staff-help-desk-bento">
      {/* ── Barra de Búsqueda Bento ─────────────────────────────────── */}
      <div className="staff-helpdesk-search-bar">
        <form onSubmit={handleSearch} className="staff-helpdesk-form">
          <div className="staff-helpdesk-input-wrapper">
            <Search size={18} className="staff-helpdesk-search-icon" />
            <input
              type="text"
              id="helpdesk-query-input"
              className="staff-helpdesk-input"
              placeholder="Buscar por Nombre, Correo Electrónico o Código de Boleto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="staff-helpdesk-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setHasSearched(false);
                  setResults([]);
                }}
                title="Limpiar búsqueda"
              >
                Limpiar
              </button>
            )}
          </div>
          <button
            type="submit"
            className="staff-helpdesk-submit-btn"
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="staff-spin-icon" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Localizar Asistente</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Estado Inicial: Sin Búsqueda Activa ──────────────────────── */}
      {!hasSearched && (
        <div className="staff-helpdesk-standby">
          <div className="staff-helpdesk-standby-icon">
            <UserCheck size={36} />
          </div>
          <h3 className="staff-helpdesk-standby-title">Mesa de Ayuda y Soporte de Acceso</h3>
          <p className="staff-helpdesk-standby-desc">
            Si un asistente no dispone de su código QR o presenta dificultades ópticas con su pantalla,
            ingresa sus datos para validar su identidad en el padrón del evento y autorizar su ingreso.
          </p>
        </div>
      )}

      {/* ── Resultados de la Búsqueda ───────────────────────────────── */}
      {hasSearched && (
        <div className="staff-helpdesk-results-container">
          <div className="staff-helpdesk-results-header">
            <h4 className="staff-helpdesk-results-title">
              Registros Encontrados ({results.length})
            </h4>
            <span className="staff-helpdesk-results-meta">
              Criterio: &ldquo;{searchQuery}&rdquo;
            </span>
          </div>

          {results.length === 0 ? (
            <div className="staff-helpdesk-empty">
              <AlertCircle size={32} className="staff-helpdesk-empty-icon" />
              <h4 className="staff-helpdesk-empty-title">Sin coincidencias registradas</h4>
              <p className="staff-helpdesk-empty-desc">
                No se encontraron asistentes con esos datos en este evento. Verifica posibles errores de escritura o confirma que el evento seleccionado en cabecera sea el correcto.
              </p>
            </div>
          ) : (
            <div className="staff-helpdesk-grid">
              {results.map((attendee, index) => {
                const isCheckedIn = attendee.status === 'checked-in';
                const isRedeeming = redeemingTicket === attendee.ticket;

                return (
                  <div key={attendee.ticket || index} className="staff-helpdesk-card">
                    <div className="staff-helpdesk-card-main">
                      <div className="staff-helpdesk-avatar">
                        <User size={20} />
                      </div>
                      <div className="staff-helpdesk-details">
                        <h5 className="staff-helpdesk-name">{attendee.name || 'Asistente Registrado'}</h5>
                        <div className="staff-helpdesk-meta-row">
                          <span className="staff-helpdesk-meta-item">
                            <Mail size={13} />
                            {attendee.email || 'Sin correo asociado'}
                          </span>
                          <span className="staff-helpdesk-meta-item">
                            <Hash size={13} />
                            <code className="staff-ticket-code-pill">{attendee.ticket || 'N/A'}</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="staff-helpdesk-card-actions">
                      <BentoBadge variant={isCheckedIn ? 'success' : 'warning'}>
                        {isCheckedIn ? 'INGRESADO EN PUERTA' : 'PENDIENTE DE ACCESO'}
                      </BentoBadge>

                      {!isCheckedIn ? (
                        <button
                          type="button"
                          className="staff-helpdesk-redeem-btn"
                          disabled={isRedeeming}
                          onClick={() => handleManualRedeem(attendee.ticket)}
                        >
                          <CheckCircle2 size={16} />
                          <span>{isRedeeming ? 'Validando...' : 'Autorizar Ingreso Manual'}</span>
                        </button>
                      ) : (
                        <span className="staff-helpdesk-checked-tag">
                          <CheckCircle2 size={14} /> Canjeado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffHelpDesk;
