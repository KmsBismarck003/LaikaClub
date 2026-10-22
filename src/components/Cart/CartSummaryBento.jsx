import React, { useState } from 'react';
import Icon from '../Icons/Icons';

/**
 * CartSummaryBento - Columna de Resumen Bento Box para el Carrito
 * Módulos integrados: Meta de beneficio/envío, Cupón promocional,
 * Desglose de costos (con corrección ortográfica), Hero Total y Garantía de compra.
 */
const CartSummaryBento = ({
    total = 0,
    serviceFee = 0,
    serviceFeePercent = 10,
    appliedCoupon = null,
    discount = 0,
    finalTotal = 0,
    applyCoupon,
    removeCoupon,
    onCheckout,
    hasUnavailableItems = false,
    cartCount = 0
}) => {
    const [couponInput, setCouponInput] = useState('');
    const shippingThreshold = 1500;
    const remainingForFreeShipping = Math.max(0, shippingThreshold - finalTotal);
    const shippingProgress = Math.min(100, (finalTotal / shippingThreshold) * 100);

    const handleApplyCoupon = (e) => {
        e?.preventDefault();
        const cleanCode = couponInput.trim();
        if (cleanCode && applyCoupon) {
            applyCoupon(cleanCode);
            setCouponInput('');
        }
    };

    return (
        <aside className="bento-summary-panel">
            {/* Bento Tile 1: Beneficio de Envío / VIP Perk */}
            {finalTotal < shippingThreshold && (
                <div className="bento-cell bento-cell-perk">
                    <div className="bento-perk-header">
                        <Icon name="truck" size={16} className="bento-perk-icon" />
                        <span className="bento-perk-title">Envío Express Gratis</span>
                    </div>
                    <p className="bento-perk-text">
                        Agrega <strong>${remainingForFreeShipping.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong> más para desbloquear envío gratuito en mercancía oficial.
                    </p>
                    <div className="bento-progress-track">
                        <div
                            className="bento-progress-fill"
                            style={{ width: `${shippingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Bento Tile 2: Código Promocional */}
            <div className="bento-cell bento-cell-coupon">
                <div className="bento-cell-label">
                    <Icon name="tag" size={13} />
                    <span>Código Promocional</span>
                </div>

                {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="bento-coupon-form">
                        <input
                            type="text"
                            placeholder="Ingresa tu cupón"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="bento-coupon-input"
                            aria-label="Código promocional"
                        />
                        <button
                            type="submit"
                            disabled={!couponInput.trim()}
                            className="bento-coupon-btn"
                        >
                            Aplicar
                        </button>
                    </form>
                ) : (
                    <div className="bento-coupon-applied">
                        <div className="bento-coupon-pill">
                            <Icon name="checkCircle" size={13} className="bento-coupon-success-icon" />
                            <span className="bento-coupon-code">{appliedCoupon}</span>
                        </div>
                        <button
                            type="button"
                            onClick={removeCoupon}
                            className="bento-coupon-remove-btn"
                            title="Quitar cupón"
                            aria-label="Quitar cupón"
                        >
                            <Icon name="close" size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Bento Tile 3: Desglose Financiero */}
            <div className="bento-cell bento-cell-breakdown">
                <span className="bento-cell-label-simple">Desglose de Pago</span>

                <div className="bento-breakdown-rows">
                    <div className="bento-breakdown-row">
                        <span>Subtotal ({cartCount} {cartCount === 1 ? 'artículo' : 'artículos'})</span>
                        <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="bento-breakdown-row">
                        <span>Cargo por servicio ({serviceFeePercent}%)</span>
                        <span>+${serviceFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {appliedCoupon && discount > 0 && (
                        <div className="bento-breakdown-row bento-row--discount">
                            <span>Descuento aplicado</span>
                            <span>-${discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bento Tile 4: Hero Total & Acción de Pago */}
            <div className="bento-cell bento-cell-hero">
                <div className="bento-hero-header">
                    <span className="bento-hero-label">Total a Pagar</span>
                    <span className="bento-currency-badge">MXN</span>
                </div>

                <div className="bento-hero-price">
                    ${finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>

                <button
                    type="button"
                    disabled={hasUnavailableItems}
                    onClick={onCheckout}
                    className={`bento-checkout-btn ${hasUnavailableItems ? 'bento-checkout-btn--disabled' : ''}`}
                >
                    <span>
                        {hasUnavailableItems ? 'Artículos agotados en carrito' : 'Continuar al Pago'}
                    </span>
                    {!hasUnavailableItems && (
                        <Icon name="arrowRight" size={16} className="bento-btn-icon" />
                    )}
                </button>
            </div>

            {/* Bento Tile 5: Garantía de Seguridad / Confianza */}
            <div className="bento-cell bento-cell-trust">
                <Icon name="shieldCheck" size={16} className="bento-trust-icon" />
                <div className="bento-trust-info">
                    <strong>Compra 100% Protegida</strong>
                    <span>Encriptación SSL de 256 bits y boletos digitales oficiales con garantía de acceso.</span>
                </div>
            </div>
        </aside>
    );
};

export default CartSummaryBento;
