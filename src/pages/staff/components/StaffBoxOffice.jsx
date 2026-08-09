import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Icon } from '../../../components';
import { eventAPI } from '../../../services/eventService';
import { ticketAPI } from '../../../services/ticketService';
import { useNotification } from '../../../context/NotificationContext';
import '../StaffDashboard.css';

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
            } catch (err) {
                showError('Error al cargar información de taquilla y secciones del evento');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleSale = async () => {
        if (!selectedSection) return showError('Por favor selecciona una localidad del evento para proceder al cobro');
        
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
            success('Venta presencial concretada con éxito • Comprobantes generados en taquilla');
            setQuantity(1);
            setSelectedSection(null);
        } catch (err) {
            showError('No fue posible procesar la venta en taquilla en este momento');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="staff-empty-state"><p>Cargando inventario de boletos y localidades...</p></div>;
    if (!event) return (
        <div className="staff-empty-state">
            <h3 className="staff-empty-title">Sin Evento Activo Para Venta</h3>
            <p className="staff-empty-desc">Selecciona o activa un evento en el encabezado principal para consultar su disponibilidad y operar la taquilla presencial.</p>
        </div>
    );

    return (
        <div className="staff-box-office-grid">
            <section aria-label="Selector de Secciones">
                <h3 className="staff-section-title"><Icon name="grid" size={16} /> Localidades y Secciones Disponibles</h3>
                <div className="staff-sections-grid">
                    {event.sections && event.sections.length > 0 ? (
                        event.sections.map(section => (
                            <div 
                                key={section.id} 
                                className={`staff-section-card ${selectedSection?.id === section.id ? 'active' : ''}`}
                                onClick={() => setSelectedSection(section)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="staff-section-name">{section.name}</div>
                                <div className="staff-section-price">${section.price?.toLocaleString()} MXN</div>
                                <div className="staff-section-seats">{section.available_seats || 0} lugares libres en sala</div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: 'var(--staff-text-secondary)', fontSize: '0.9rem' }}>Este evento no ha definido zonas diferenciadas para venta presencial.</p>
                    )}
                </div>
            </section>

            <section aria-label="Resumen del Cobro">
                <h3 className="staff-section-title"><Icon name="shoppingBag" size={16} /> Desglose de Taquilla</h3>
                <div className="staff-summary-box">
                    <div className="staff-input-group">
                        <label className="staff-input-label" htmlFor="ticket-quantity">Cantidad de Boletos</label>
                        <Input 
                            id="ticket-quantity"
                            type="number" 
                            min="1" 
                            max="10" 
                            value={quantity} 
                            onChange={e => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value || 1, 10))))}
                            fullWidth
                        />
                    </div>
                    
                    {selectedSection ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                            <div className="staff-summary-row">
                                <span>Localidad:</span>
                                <strong style={{ color: '#ffffff' }}>{selectedSection.name}</strong>
                            </div>
                            <div className="staff-summary-row">
                                <span>Precio Unitario:</span>
                                <span>${selectedSection.price?.toLocaleString()} MXN</span>
                            </div>
                            <div className="staff-summary-row">
                                <span>Subtotal ({quantity} {quantity > 1 ? 'boletos' : 'boleto'}):</span>
                                <span>${(selectedSection.price * quantity).toLocaleString()} MXN</span>
                            </div>
                            <div className="staff-summary-total">
                                <span>TOTAL A COBRAR:</span>
                                <span style={{ color: 'var(--staff-status-valid)' }}>${(selectedSection.price * quantity).toLocaleString()} MXN</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--staff-text-muted)', fontSize: '0.9rem' }}>
                            Selecciona una localidad en el panel izquierdo para calcular el total.
                        </div>
                    )}

                    <Button 
                        variant="primary" 
                        fullWidth 
                        size="large" 
                        disabled={!selectedSection || isProcessing} 
                        loading={isProcessing}
                        onClick={handleSale}
                        style={{ marginTop: '0.5rem' }}
                    >
                        <Icon name="shoppingCart" size={18} className="mr-2" />
                        REGISTRAR COBRO Y EMITIR BOLETOS
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default StaffBoxOffice;
