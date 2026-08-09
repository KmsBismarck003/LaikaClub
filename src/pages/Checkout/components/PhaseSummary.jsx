import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/Icons/Icons';
import { useCart } from '../../../context/CartContext';

const PhaseSummary = ({
    ticketItems,
    merchItems,
    total,
    serviceFee,
    discount,
    shippingCost,
    grandTotal,
    onNext,
    orderType,
    nextPhaseName
}) => {
    const navigate = useNavigate();
    const { appliedCoupon, applyCoupon, removeCoupon, availableCoupons } = useCart();
    const [couponInput, setCouponInput] = useState('');
    const [showCouponList, setShowCouponList] = useState(false);

    const hasTickets = ticketItems && ticketItems.length > 0;
    const hasMerch   = merchItems && merchItems.length > 0;
    const totalItemsCount = (ticketItems?.reduce((a, i) => a + i.quantity, 0) || 0) + 
                            (merchItems?.reduce((a, i) => a + i.quantity, 0) || 0);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (couponInput.trim()) {
            applyCoupon(couponInput.trim());
            setCouponInput('');
        }
    };

    return (
        <div className="phase-container animate-fade-in">
            <header className="phase-header">
                <div className="phase-header-left">
                    <h2 className="phase-title">Resumen de tu Pedido</h2>
                    <p className="phase-subtitle">
                        Revisa los productos en tu carrito antes de seleccionar tu método de {orderType === 'digital_only' ? 'pago' : 'entrega'}.
                    </p>
                </div>
                <button 
                    type="button" 
                    className="back-to-cart-btn" 
                    onClick={() => navigate('/cart')}
                    title="Modificar artículos o cantidades"
                >
                    <Icon name="shoppingCart" size={14} />
                    <span>Editar Carrito</span>
                </button>
            </header>

            <div className="phase-summary-grid">
                {/* Lista de productos */}
                <div className="summary-items-column">
                    {hasTickets && (
                        <div className="order-group-card">
                            <div className="order-group-header">
                                <Icon name="ticket" size={16} className="text-blue-500" />
                                <span>Boletos Digitales ({ticketItems.reduce((a, i) => a + i.quantity, 0)})</span>
                                <span className="order-tag digital-tag">Entrega Instantánea</span>
                            </div>

                            <div className="order-items-list">
                                {ticketItems.map(item => (
                                    <div key={`${item.eventId}-${item.sectionId}-${item.functionId || ''}`} className="summary-card-item">
                                        <div className="summary-item-media">
                                            {item.image ? <img src={item.image} alt={item.eventName} loading="lazy" /> : <Icon name="ticket" size={24} />}
                                        </div>
                                        <div className="summary-item-info">
                                            <h4 className="item-title">{item.eventName}</h4>
                                            <p className="item-meta">
                                                {[
                                                    item.sectionName && `Sección: ${item.sectionName}`,
                                                    item.functionDate && `Fecha: ${item.functionDate}`,
                                                    item.venueName && `Recinto: ${item.venueName}`,
                                                ].filter(Boolean).join(' · ')}
                                            </p>
                                            <div className="item-qty-tag">
                                                Cantidad: <strong>{item.quantity}</strong>
                                            </div>
                                        </div>
                                        <div className="summary-item-pricing">
                                            <span className="item-unit-price">${item.price.toFixed(2)} c/u</span>
                                            <span className="item-total-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hasMerch && (
                        <div className="order-group-card mt-4">
                            <div className="order-group-header">
                                <Icon name="shoppingBag" size={16} className="text-amber-500" />
                                <span>Mercancía Física ({merchItems.reduce((a, i) => a + i.quantity, 0)})</span>
                                <span className="order-tag physical-tag">Requiere Entrega</span>
                            </div>

                            <div className="order-items-list">
                                {merchItems.map(item => (
                                    <div key={`${item.eventId}-${item.sectionId}-${item.id || ''}`} className="summary-card-item">
                                        <div className="summary-item-media">
                                            {item.image ? <img src={item.image} alt={item.eventName} loading="lazy" /> : <Icon name="package" size={24} />}
                                        </div>
                                        <div className="summary-item-info">
                                            <h4 className="item-title">{item.eventName}</h4>
                                            <p className="item-meta">
                                                {item.sectionName?.replace('MERCH: ', '') || 'Producto Oficial'}
                                            </p>
                                            <div className="item-qty-tag">
                                                Cantidad: <strong>{item.quantity}</strong>
                                            </div>
                                        </div>
                                        <div className="summary-item-pricing">
                                            <span className="item-unit-price">${item.price.toFixed(2)} c/u</span>
                                            <span className="item-total-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Banner informativo de flujo inteligente */}
                    <div className="smart-flow-banner mt-4">
                        <Icon name="zap" size={18} className="smart-icon" />
                        <div className="smart-flow-text">
                            <strong>Experiencia Optimizada para tu Compra</strong>
                            <p>
                                {orderType === 'digital_only' 
                                    ? 'Tu carrito contiene exclusivamente boletos digitales. Hemos omitido los formularios de dirección y envío para agilizar tu compra.'
                                    : orderType === 'physical_only'
                                    ? 'Tu carrito contiene mercancía oficial. En el siguiente paso te pediremos únicamente los datos necesarios para programar tu entrega.'
                                    : 'Tu compra combina boletos digitales y artículos físicos. Recibirás tus accesos de inmediato y coordinaremos el envío para tus productos.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Columna de totales y cupones */}
                <div className="summary-totals-column">
                    <div className="totals-panel-card">
                        <h3 className="totals-header-title">
                            <span>Desglose Económico</span>
                            <span className="items-count-badge">{totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}</span>
                        </h3>

                        <div className="totals-list">
                            <div className="total-item-row">
                                <span>Subtotal de productos</span>
                                <span>${total.toFixed(2)} MXN</span>
                            </div>
                            <div className="total-item-row text-blue">
                                <span>Comisión por servicio (10%)</span>
                                <span>+${serviceFee.toFixed(2)} MXN</span>
                            </div>
                            
                            {shippingCost > 0 && (
                                <div className="total-item-row text-amber">
                                    <span>Envío y logística</span>
                                    <span>+${shippingCost.toFixed(2)} MXN</span>
                                </div>
                            )}

                            {orderType === 'digital_only' && (
                                <div className="total-item-row text-green">
                                    <span>Entrega Digital de Boletos</span>
                                    <span>GRATIS</span>
                                </div>
                            )}

                            {discount > 0 && (
                                <div className="total-item-row discount-row">
                                    <span>Descuento Promocional</span>
                                    <span>-${discount.toFixed(2)} MXN</span>
                                </div>
                            )}
                        </div>

                        {/* Sección de cupones */}
                        <div className="coupon-section">
                            {!appliedCoupon ? (
                                <>
                                    <form onSubmit={handleApplyCoupon} className="coupon-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Código promocional..." 
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            className="coupon-input"
                                        />
                                        <button type="submit" className="coupon-submit-btn" disabled={!couponInput.trim()}>
                                            Aplicar
                                        </button>
                                    </form>
                                    {availableCoupons && availableCoupons.length > 0 && (
                                        <div className="available-coupons-toggle">
                                            <button 
                                                type="button" 
                                                className="toggle-coupons-btn"
                                                onClick={() => setShowCouponList(!showCouponList)}
                                            >
                                                <Icon name="tag" size={12} />
                                                <span>{showCouponList ? 'Ocultar cupones disponibles' : 'Ver cupones disponibles'}</span>
                                            </button>
                                            
                                            {showCouponList && (
                                                <div className="coupons-dropdown">
                                                    {availableCoupons.map(c => (
                                                        <div key={c.id || c.code} className="coupon-chip" onClick={() => applyCoupon(c.code || c.coupon_code)}>
                                                            <span className="coupon-code-label">{c.code || c.coupon_code}</span>
                                                            <span className="coupon-apply-action">Aplicar</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="applied-coupon-badge">
                                    <div className="applied-coupon-info">
                                        <Icon name="tag" size={14} className="text-green-500" />
                                        <span>Cupón aplicado: <strong>{appliedCoupon.code || appliedCoupon}</strong></span>
                                    </div>
                                    <button type="button" onClick={removeCoupon} className="remove-coupon-btn" title="Remover cupón">
                                        <Icon name="x" size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grand-total-divider" />

                        <div className="grand-total-row">
                            <span className="grand-total-label">Total Estimado</span>
                            <div className="grand-total-value">
                                <span className="price-amount">${grandTotal.toFixed(2)}</span>
                                <span className="currency-label">MXN / IVA incluido</span>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            className="phase-continue-btn primary-btn-glow" 
                            onClick={onNext}
                        >
                            <span>Continuar a {nextPhaseName || 'Siguiente Paso'}</span>
                            <Icon name="arrowRight" size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseSummary;
