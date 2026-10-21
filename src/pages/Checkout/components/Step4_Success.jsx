import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icons/Icons';

const Step4_Success = ({
    completedOrder,
    orderType = 'digital_only',
    deliveryType = 'digital',
    shippingData,
    ticketItems = [],
    merchItems = [],
    paymentMethod = 'card',
    lastReference = ''
}) => {
    const navigate = useNavigate();

    // Resolver contexto de la orden completada
    const resolvedOrderType = completedOrder?.orderType || orderType;
    const resolvedDeliveryType = completedOrder?.deliveryType || deliveryType;
    const resolvedShipping = completedOrder?.shippingData || shippingData;
    const resolvedTicketItems = completedOrder?.ticketItems || ticketItems || [];
    const resolvedMerchItems = completedOrder?.merchItems || merchItems || [];
    const resolvedOrderId = completedOrder?.orderNum || completedOrder?.orderId || lastReference || 'LK-SUCCESS';
    const resolvedTotal = completedOrder?.grandTotal != null ? completedOrder.grandTotal : 0;
    const resolvedPaymentMethod = completedOrder?.paymentMethod || paymentMethod;
    const resolvedOxxoRef = completedOrder?.lastReference || lastReference;

    const isDigitalOnly = resolvedOrderType === 'digital_only';
    const isPhysicalOnly = resolvedOrderType === 'physical_only';
    const isMixed = resolvedOrderType === 'mixed';

    // Resolver textos principales según tipo de compra
    const getHeroBadge = () => {
        if (isDigitalOnly) {
            return {
                label: 'Accesos Digitales Confirmados',
                icon: 'ticket',
                tagClass: 'badge-digital'
            };
        }
        if (isPhysicalOnly) {
            return {
                label: 'Mercancía Oficial Laika Shop',
                icon: 'shoppingBag',
                tagClass: 'badge-physical'
            };
        }
        return {
            label: 'Compra Combinada (Boletos + Laika Shop)',
            icon: 'sparkles',
            tagClass: 'badge-mixed'
        };
    };

    const getHeroTitle = () => {
        if (isDigitalOnly) return '¡TUS ACCESOS ESTÁN LISTOS!';
        if (isPhysicalOnly) return '¡TU PEDIDO DE LAIKA SHOP ESTÁ ASEGURADO!';
        return '¡COMPRA COMBINADA CONFIRMADA!';
    };

    const getHeroSubtitle = () => {
        if (isDigitalOnly) {
            return 'Tu pago ha sido validado exitosamente. Tus accesos digitales con códigos QR encriptados ya se encuentran disponibles en tu Bóveda Digital.';
        }
        if (isPhysicalOnly) {
            if (resolvedDeliveryType === 'tienda') {
                return 'Tu compra ha sido procesada exitosamente. Tus artículos de mercancía oficial han sido apartados y reservados para recolección en taquilla oficial el día del evento.';
            }
            return 'Tu orden ha sido procesada con éxito. Tus artículos de mercancía oficial están siendo preparados para entrega por paquetería a tu domicilio registrado.';
        }
        return 'Hemos procesado tu pago con éxito. Confirmamos tanto tus accesos digitales para el evento como tus productos oficiales adquiridos en Laika Shop.';
    };

    const badge = getHeroBadge();

    return (
        <div className="success-phase-container animate-fade-in">
            {/* Header / Hero de Éxito */}
            <div className="success-hero-card">
                <div className="success-icon-glow-ring">
                    <div className="success-icon-inner">
                        <Icon name="check" size={38} className="text-emerald-400" />
                    </div>
                </div>

                <div className={`success-type-pill ${badge.tagClass}`}>
                    <Icon name={badge.icon} size={13} />
                    <span>{badge.label}</span>
                </div>

                <h1 className="success-main-title">{getHeroTitle()}</h1>
                <p className="success-lead-text">{getHeroSubtitle()}</p>

                <div className="success-order-meta-pill">
                    <span className="order-meta-label">ID de Transacción:</span>
                    <span className="order-meta-code">#{resolvedOrderId}</span>
                    {resolvedTotal > 0 && (
                        <>
                            <span className="meta-separator">·</span>
                            <span className="order-meta-amount">${resolvedTotal.toFixed(2)} MXN</span>
                        </>
                    )}
                </div>
            </div>

            {/* Voucher OXXO Pay si aplica */}
            {resolvedPaymentMethod === 'oxxo' && (
                <div className="oxxo-voucher-card animate-fade-in">
                    <div className="oxxo-voucher-header">
                        <div className="oxxo-brand-badge">
                            <span>OXXO PAY</span>
                        </div>
                        <span className="oxxo-status-tag">Pendiente de pago en caja</span>
                    </div>

                    <div className="oxxo-voucher-body">
                        <div className="oxxo-ref-box">
                            <span className="oxxo-ref-label">Número de Referencia Bancaria:</span>
                            <span className="oxxo-ref-code">{resolvedOxxoRef || resolvedOrderId}</span>
                        </div>
                        <p className="oxxo-amount-line">
                            Monto a pagar: <strong>${resolvedTotal.toFixed(2)} MXN</strong>
                        </p>

                        <div className="oxxo-steps-list">
                            <div className="oxxo-step-item">
                                <span className="step-num">1</span>
                                <span>Acude a cualquier tienda OXXO de la República Mexicana.</span>
                            </div>
                            <div className="oxxo-step-item">
                                <span className="step-num">2</span>
                                <span>Indica al cajero que realizarás un pago de servicio <strong>OXXO Pay</strong>.</span>
                            </div>
                            <div className="oxxo-step-item">
                                <span className="step-num">3</span>
                                <span>Proporciona el número de referencia y abona el monto exacto en efectivo.</span>
                            </div>
                            <div className="oxxo-step-item">
                                <span className="step-num">4</span>
                                <span>La confirmación de tu compra se acreditará automáticamente en menos de 5 minutos.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Bloques Logísticos Contextuales */}
            <div className="success-details-grid">
                {/* Bloque 1: Boletos Digitales (solo si hay boletos) */}
                {(isDigitalOnly || isMixed) && resolvedTicketItems.length > 0 && (
                    <div className="success-info-panel panel-tickets">
                        <div className="panel-header">
                            <div className="panel-title-group">
                                <div className="panel-icon-box box-tickets">
                                    <Icon name="ticket" size={18} />
                                </div>
                                <div>
                                    <h3 className="panel-heading">Accesos en Bóveda Digital</h3>
                                    <span className="panel-subheading">Códigos QR listos para escanear en puerta</span>
                                </div>
                            </div>
                            <span className="status-badge-active">ACTIVO</span>
                        </div>

                        <div className="panel-body">
                            <p className="panel-instruction-text">
                                Tus credenciales de acceso cuentan con tecnología anti-captura. No requieres imprimir nada; solo muestra tu código QR desde tu celular o LaikaWear al ingresar.
                            </p>

                            <div className="panel-items-list">
                                {resolvedTicketItems.map((item, idx) => (
                                    <div key={idx} className="panel-item-row">
                                        <div className="item-main-info">
                                            <span className="item-qty-badge">{item.quantity}x</span>
                                            <div>
                                                <span className="item-name">{item.eventName}</span>
                                                <span className="item-subdetail">
                                                    {item.sectionName || 'Acceso General'} {item.seats?.length ? `· Asientos: ${item.seats.join(', ')}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="item-cost">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-footer">
                            <button
                                type="button"
                                className="panel-action-btn btn-view-tickets"
                                onClick={() => navigate('/user/tickets')}
                            >
                                <Icon name="ticket" size={16} />
                                <span>Ver mis Boletos en Bóveda</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Bloque 2: Mercancía Oficial Laika Shop (solo si hay productos) */}
                {(isPhysicalOnly || isMixed) && resolvedMerchItems.length > 0 && (
                    <div className="success-info-panel panel-merch">
                        <div className="panel-header">
                            <div className="panel-title-group">
                                <div className="panel-icon-box box-merch">
                                    <Icon name={resolvedDeliveryType === 'tienda' ? 'mapPin' : 'truck'} size={18} />
                                </div>
                                <div>
                                    <h3 className="panel-heading">
                                        {resolvedDeliveryType === 'tienda'
                                            ? 'Recolección Oficial en Taquilla'
                                            : 'Logística de Envío a Domicilio'}
                                    </h3>
                                    <span className="panel-subheading">
                                        {resolvedDeliveryType === 'tienda'
                                            ? 'Entrega presencial el día del evento'
                                            : 'Despacho por paquetería certificada'}
                                    </span>
                                </div>
                            </div>
                            <span className="status-badge-pending">
                                {resolvedDeliveryType === 'tienda' ? 'EN TAQUILLA' : 'EN PREPARACIÓN'}
                            </span>
                        </div>

                        <div className="panel-body">
                            {resolvedDeliveryType === 'tienda' ? (
                                <div className="pickup-notice-box">
                                    <Icon name="shieldCheck" size={18} className="text-amber-400 flex-shrink-0" />
                                    <div className="pickup-notice-text">
                                        <strong>Instrucciones para recolección:</strong>
                                        <p>
                                            Acude al módulo oficial de <strong>Laika Shop</strong> ubicado junto a la taquilla del evento. Presenta tu <strong>identificación oficial vigente (INE o Pasaporte)</strong> a nombre de <strong>{resolvedShipping?.nombre || 'Titular'} {resolvedShipping?.apellidos || ''}</strong> junto con tu número de orden <strong>#{resolvedOrderId}</strong>.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="shipping-notice-box">
                                    <Icon name="truck" size={18} className="text-blue-400 flex-shrink-0" />
                                    <div className="shipping-notice-text">
                                        <strong>Dirección de destino registrada:</strong>
                                        <p>
                                            {resolvedShipping?.calle || 'Domicilio'} #{resolvedShipping?.numeroExterior || ''}, {resolvedShipping?.colonia || ''}, {resolvedShipping?.ciudad || ''}, CP {resolvedShipping?.codigoPostal || ''}
                                        </p>
                                        <span className="shipping-eta">
                                            Tiempo estimado: {resolvedDeliveryType === 'express' ? '24 a 48 horas hábiles' : '3 a 5 días hábiles'}.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="panel-items-list mt-3">
                                {resolvedMerchItems.map((item, idx) => (
                                    <div key={idx} className="panel-item-row">
                                        <div className="item-main-info">
                                            <span className="item-qty-badge qty-merch">{item.quantity}x</span>
                                            <div>
                                                <span className="item-name">{item.eventName || item.name}</span>
                                                <span className="item-subdetail">Artículo Oficial Laika Shop</span>
                                            </div>
                                        </div>
                                        <span className="item-cost">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-footer">
                            <button
                                type="button"
                                className="panel-action-btn btn-view-merch"
                                onClick={() => navigate('/user/history?tab=merch')}
                            >
                                <Icon name="shoppingBag" size={16} />
                                <span>Ver mis Pedidos de Laika Shop</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Barra de Acciones Globales */}
            <div className="success-action-bar">
                {isDigitalOnly && (
                    <>
                        <button
                            type="button"
                            className="success-btn-primary"
                            onClick={() => navigate('/user/tickets')}
                        >
                            <Icon name="ticket" size={18} />
                            <span>VER MIS BOLETOS EN BÓVEDA</span>
                        </button>
                        <button
                            type="button"
                            className="success-btn-secondary"
                            onClick={() => navigate('/')}
                        >
                            <span>VOLVER AL INICIO</span>
                        </button>
                    </>
                )}

                {isPhysicalOnly && (
                    <>
                        <button
                            type="button"
                            className="success-btn-primary btn-gold"
                            onClick={() => navigate('/user/history?tab=merch')}
                        >
                            <Icon name="shoppingBag" size={18} />
                            <span>VER MIS PEDIDOS / COMPRAS</span>
                        </button>
                        <button
                            type="button"
                            className="success-btn-secondary"
                            onClick={() => navigate('/shop')}
                        >
                            <span>SEGUIR EXPLORANDO LAIKA SHOP</span>
                        </button>
                        <button
                            type="button"
                            className="success-btn-tertiary"
                            onClick={() => navigate('/')}
                        >
                            <span>VOLVER AL INICIO</span>
                        </button>
                    </>
                )}

                {isMixed && (
                    <>
                        <button
                            type="button"
                            className="success-btn-primary"
                            onClick={() => navigate('/user/tickets')}
                        >
                            <Icon name="ticket" size={18} />
                            <span>VER MIS BOLETOS</span>
                        </button>
                        <button
                            type="button"
                            className="success-btn-secondary"
                            onClick={() => navigate('/user/history?tab=merch')}
                        >
                            <Icon name="shoppingBag" size={18} />
                            <span>VER PEDIDOS DE TIENDA</span>
                        </button>
                        <button
                            type="button"
                            className="success-btn-tertiary"
                            onClick={() => navigate('/')}
                        >
                            <span>VOLVER AL INICIO</span>
                        </button>
                    </>
                )}
            </div>

            <p className="success-footer-note">
                Hemos enviado una copia detallada de esta confirmación a tu correo <strong>{resolvedShipping?.email || 'registrado'}</strong>.
            </p>
        </div>
    );
};

export default Step4_Success;
