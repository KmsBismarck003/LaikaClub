import React from 'react';
import Icon from '../../../components/Icons/Icons';

const PhaseConfirmation = ({
    cart,
    ticketItems,
    merchItems,
    orderType,
    deliveryType,
    shippingData,
    paymentMethod,
    cardData,
    savedCards,
    total,
    serviceFee,
    shippingCost,
    discount,
    grandTotal,
    processing,
    onConfirm,
    onPrev,
    onJumpToPhase
}) => {
    // Resolver descripción del método de pago
    const getPaymentSummary = () => {
        if (paymentMethod === 'card') {
            if (cardData.selectedSavedCard) {
                const card = savedCards?.find(c => c.id === cardData.selectedSavedCard);
                return `Tarjeta ${card ? card.number : 'Guardada'}`;
            }
            const last4 = cardData.number ? cardData.number.replace(/\s/g, '').slice(-4) : '****';
            return `Nueva Tarjeta terminación ${last4}`;
        }
        if (paymentMethod === 'oxxo') return 'Efectivo OXXO Pay (Referencia bancaria)';
        return 'Aplazo (Meses sin tarjeta)';
    };

    // Resolver descripción de entrega
    const getDeliverySummary = () => {
        if (orderType === 'digital_only' || deliveryType === 'digital') {
            return 'Entrega Digital Automática (Bóveda Digital y Correo Electrónico)';
        }
        if (deliveryType === 'tienda') {
            return 'Recogida en Taquilla / Punto de Entrega Oficial en Evento';
        }
        if (deliveryType === 'express') {
            return 'Envío Express Prioritorio (24 - 48 horas hábiles)';
        }
        return 'Envío Estándar a Domicilio (3 - 5 días hábiles)';
    };

    return (
        <div className="phase-container animate-fade-in">
            <header className="phase-header">
                <div className="phase-header-left">
                    <h2 className="phase-title">Revisión y Confirmación Final</h2>
                    <p className="phase-subtitle">
                        Verifica los detalles de tu orden antes de autorizar el cobro. Todo está listo para procesarse con máxima seguridad.
                    </p>
                </div>
            </header>

            <div className="confirmation-grid">
                {/* Columna Izquierda: Resumen ejecutivo por bloques */}
                <div className="confirmation-details-col">
                    
                    {/* Bloque 1: Productos en la orden */}
                    <div className="confirm-section-card">
                        <div className="confirm-card-header">
                            <div className="confirm-card-title">
                                <Icon name="shoppingBag" size={16} className="text-indigo-400" />
                                <span>Artículos en tu pedido ({cart.reduce((acc, i) => acc + i.quantity, 0)})</span>
                            </div>
                            <button 
                                type="button" 
                                className="confirm-edit-link"
                                onClick={() => onJumpToPhase(0)} // Saltar a fase de resumen
                            >
                                Modificar
                            </button>
                        </div>

                        <div className="confirm-items-preview">
                            {ticketItems.length > 0 && (
                                <div className="preview-group">
                                    <span className="preview-group-label">Boletos de Acceso:</span>
                                    {ticketItems.map((item, idx) => (
                                        <div key={idx} className="preview-item-row">
                                            <span className="preview-item-name">
                                                <strong>{item.quantity}x</strong> {item.eventName} ({item.sectionName || 'Acceso General'})
                                            </span>
                                            <span className="preview-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {merchItems.length > 0 && (
                                <div className="preview-group mt-3 pt-3 border-t border-white/10">
                                    <span className="preview-group-label">Mercancía Oficial:</span>
                                    {merchItems.map((item, idx) => (
                                        <div key={idx} className="preview-item-row">
                                            <span className="preview-item-name">
                                                <strong>{item.quantity}x</strong> {item.eventName}
                                            </span>
                                            <span className="preview-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bloque 2: Datos y Método de Entrega */}
                    <div className="confirm-section-card mt-4">
                        <div className="confirm-card-header">
                            <div className="confirm-card-title">
                                <Icon name="truck" size={16} className="text-amber-400" />
                                <span>Logística de Entrega</span>
                            </div>
                            {orderType !== 'digital_only' && (
                                <button 
                                    type="button" 
                                    className="confirm-edit-link"
                                    onClick={() => onJumpToPhase(1)} // Saltar a fase de entrega
                                >
                                    Modificar
                                </button>
                            )}
                        </div>

                        <div className="confirm-info-body">
                            <p className="highlight-text">{getDeliverySummary()}</p>
                            
                            {orderType !== 'digital_only' && deliveryType !== 'tienda' && shippingData && (
                                <div className="shipping-address-summary mt-2">
                                    <span className="recipient">Destinario: <strong>{shippingData.nombre} {shippingData.apellidos}</strong></span>
                                    <span className="street-line">{shippingData.calle} #{shippingData.numeroExterior}, {shippingData.colonia}</span>
                                    <span className="city-line">{shippingData.ciudad}, CP {shippingData.codigoPostal} · {shippingData.region}</span>
                                    {shippingData.telefono && <span className="contact-line">Teléfono: {shippingData.telefono}</span>}
                                    <span className="contact-line">Correo: {shippingData.email}</span>
                                </div>
                            )}

                            {(orderType === 'digital_only' || deliveryType === 'tienda') && (
                                <p className="sub-note mt-1">
                                    Tus accesos e indicaciones se enviarán de inmediato a tu cuenta y al correo <strong>{shippingData?.email || 'registrado en LaikaClub'}</strong>.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bloque 3: Método de Pago Autorizado */}
                    <div className="confirm-section-card mt-4">
                        <div className="confirm-card-header">
                            <div className="confirm-card-title">
                                <Icon name="creditCard" size={16} className="text-emerald-400" />
                                <span>Método de Pago</span>
                            </div>
                            <button 
                                type="button" 
                                className="confirm-edit-link"
                                onClick={() => onJumpToPhase(orderType === 'digital_only' ? 1 : 2)} // Saltar a fase de pago
                            >
                                Modificar
                            </button>
                        </div>

                        <div className="confirm-info-body flex items-center justify-between">
                            <div>
                                <p className="highlight-text">{getPaymentSummary()}</p>
                                <p className="sub-note">Cobro único verificado con encriptación TLS 1.3 y certificación antifraude.</p>
                            </div>
                            <div className="ssl-lock-icon">
                                <Icon name="shieldCheck" size={24} className="text-emerald-400 opacity-80" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Columna Derecha: Tarjeta de cobro final */}
                <div className="confirmation-action-col">
                    <div className="final-pay-card">
                        <h3 className="pay-card-heading">Resumen de Cobro</h3>

                        <div className="pay-card-breakdown">
                            <div className="breakdown-line">
                                <span>Subtotal de productos</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="breakdown-line text-blue">
                                <span>Comisión LaikaClub</span>
                                <span>+${serviceFee.toFixed(2)}</span>
                            </div>
                            {shippingCost > 0 ? (
                                <div className="breakdown-line text-amber">
                                    <span>Envío y paquetería</span>
                                    <span>+${shippingCost.toFixed(2)}</span>
                                </div>
                            ) : (
                                <div className="breakdown-line text-green">
                                    <span>Logística y entrega</span>
                                    <span>GRATIS</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="breakdown-line discount-line">
                                    <span>Descuento aplicado</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="breakdown-separator" />
                            <div className="breakdown-total">
                                <span className="total-title">Total a Pagar</span>
                                <div className="total-val-box">
                                    <span className="big-num">${grandTotal.toFixed(2)}</span>
                                    <span className="curr-label">MXN / IVA incluido</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón Maestro de Autorización de Compra */}
                        <div className="pay-cta-wrapper mt-6">
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={processing}
                                className={`master-confirm-pay-btn ${processing ? 'is-processing' : ''}`}
                            >
                                {processing ? (
                                    <div className="spinner-wrapper">
                                        <div className="loading-spinner" />
                                        <span>Procesando Pago Seguro...</span>
                                    </div>
                                ) : (
                                    <div className="btn-content-flow">
                                        <span>Confirmar y Pagar ${grandTotal.toFixed(2)} MXN</span>
                                        <Icon name="lock" size={16} />
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="guarantee-footer">
                            <Icon name="lock" size={12} className="text-emerald-400" />
                            <span>Al confirmar, aceptas los términos de compra de LaikaClub. Transacción 100% segura y garantizada por nuestro protocolo de protección al fan.</span>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button type="button" className="simple-prev-link" onClick={onPrev} disabled={processing}>
                            <Icon name="arrowLeft" size={14} />
                            <span>Volver y revisar método de pago</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseConfirmation;
