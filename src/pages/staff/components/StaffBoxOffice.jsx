import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Check, Plus, Minus, CreditCard, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import { BentoBadge } from '../../../components/Bento';
import { eventAPI } from '../../../services/eventService';
import { ticketAPI } from '../../../services/ticketService';
import { useNotification } from '../../../context/NotificationContext';
import '../StaffDashboard.css';

/**
 * StaffBoxOffice - Módulo Bento Box de Taquilla y Venta Presencial en Puerta.
 * Diseñado para cobro rápido de asistentes rezagados con ergonomía táctil Tier-1.
 */
const StaffBoxOffice = ({ eventId }) => {
  const { success, error: showError } = useNotification();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const data = await eventAPI.getById(eventId);
        setEvent(data);
        if (data?.sections && data.sections.length > 0) {
          setSelectedSection(data.sections[0]);
        }
      } catch (err) {
        showError('Error al cargar inventario de taquilla del evento');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSale = async () => {
    if (!selectedSection) {
      showError('Selecciona una localidad del evento para procesar la venta');
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        event_id: eventId,
        section_id: selectedSection.id,
        quantity: parseInt(quantity, 10),
        payment_method: 'cash_onsite',
        is_staff_sale: true
      };

      await ticketAPI.purchase(saleData);
      success(`Venta completada exitosamente • Se emitieron ${quantity} boleto(s) para ${selectedSection.name}`);
      setQuantity(1);
    } catch (err) {
      showError('No fue posible registrar la venta en taquilla en este momento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-boxoffice-loading">
        <RefreshCw size={28} className="staff-spin-icon" />
        <p>Cargando disponibilidad y localidades en taquilla...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="staff-boxoffice-empty">
        <AlertCircle size={36} className="staff-empty-icon" />
        <h3 className="staff-empty-title">Sin Evento Seleccionado</h3>
        <p className="staff-empty-desc">
          Selecciona un evento vigente en la barra superior para consultar sus localidades y habilitar la venta en puerta.
        </p>
      </div>
    );
  }

  const sections = event.sections || [];
  const unitPrice = selectedSection?.price || 0;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="staff-boxoffice-bento-layout">
      {/* ── Columna Izquierda: Cuadrícula de Secciones y Localidades ── */}
      <div className="staff-boxoffice-sections-col">
        <div className="staff-boxoffice-col-header">
          <div className="staff-boxoffice-col-title-wrap">
            <Ticket size={20} className="staff-boxoffice-col-icon" />
            <div>
              <h4 className="staff-boxoffice-col-title">Localidades y Zonas Disponibles</h4>
              <p className="staff-boxoffice-col-subtitle">
                Selecciona la zona solicitada por el asistente
              </p>
            </div>
          </div>
          <BentoBadge variant="primary">
            {sections.length} {sections.length === 1 ? 'Zona' : 'Zonas'}
          </BentoBadge>
        </div>

        {sections.length === 0 ? (
          <div className="staff-boxoffice-no-sections">
            <p>Este evento no cuenta con localidades configuradas para taquilla presencial.</p>
          </div>
        ) : (
          <div className="staff-boxoffice-sections-grid">
            {sections.map((section) => {
              const isSelected = selectedSection?.id === section.id;
              const seatsLeft = section.available_seats !== undefined ? section.available_seats : (section.capacity || 0);

              return (
                <div
                  key={section.id}
                  className={`staff-section-bento-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedSection(section)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedSection(section)}
                >
                  <div className="staff-section-card-top">
                    <span className="staff-section-name">{section.name}</span>
                    {isSelected && (
                      <span className="staff-section-check">
                        <Check size={16} />
                      </span>
                    )}
                  </div>

                  <div className="staff-section-price-row">
                    <span className="staff-section-price">
                      ${Number(section.price || 0).toLocaleString()} <span className="staff-currency">MXN</span>
                    </span>
                  </div>

                  <div className="staff-section-footer">
                    <Users size={13} />
                    <span>{seatsLeft} lugares libres</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Columna Derecha: Panel de Cobro y Liquidación Rápida ──────── */}
      <div className="staff-boxoffice-checkout-col">
        <div className="staff-boxoffice-checkout-card">
          <div className="staff-boxoffice-checkout-header">
            <ShoppingBag size={20} />
            <h4>Liquidación en Puerta</h4>
          </div>

          {/* Selector de Cantidad Táctil */}
          <div className="staff-boxoffice-stepper-wrap">
            <label className="staff-stepper-label">Cantidad de Entradas</label>
            <div className="staff-stepper">
              <button
                type="button"
                className="staff-stepper-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isProcessing}
                title="Reducir cantidad"
              >
                <Minus size={16} />
              </button>
              <div className="staff-stepper-value">{quantity}</div>
              <button
                type="button"
                className="staff-stepper-btn"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10 || isProcessing}
                title="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Desglose de Operación */}
          <div className="staff-boxoffice-breakdown">
            <div className="staff-breakdown-row">
              <span className="staff-breakdown-label">Localidad Seleccionada</span>
              <span className="staff-breakdown-val highlight">
                {selectedSection?.name || 'Ninguna seleccionada'}
              </span>
            </div>
            <div className="staff-breakdown-row">
              <span className="staff-breakdown-label">Precio Unitario</span>
              <span className="staff-breakdown-val">
                ${Number(unitPrice).toLocaleString()} MXN
              </span>
            </div>
            <div className="staff-breakdown-row">
              <span className="staff-breakdown-label">Modalidad de Pago</span>
              <span className="staff-breakdown-val staff-payment-tag">
                <CreditCard size={13} /> Efectivo / En Puerta
              </span>
            </div>

            <div className="staff-breakdown-divider" />

            <div className="staff-breakdown-total-row">
              <span className="staff-total-label">TOTAL A COBRAR</span>
              <span className="staff-total-value">
                ${Number(totalPrice).toLocaleString()} <span className="staff-total-curr">MXN</span>
              </span>
            </div>
          </div>

          {/* Botón de Cobro de Alta Ergonomía */}
          <button
            type="button"
            className="staff-boxoffice-charge-btn"
            disabled={!selectedSection || isProcessing}
            onClick={handleSale}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={18} className="staff-spin-icon" />
                <span>Procesando Emisión...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Confirmar Cobro y Emitir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffBoxOffice;
