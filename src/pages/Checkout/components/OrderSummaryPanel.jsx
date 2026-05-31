import React from 'react';
import Icon from '../../../components/Icons/Icons';

/**
 * Panel de resumen del pedido.
 * Muestra boletos, merch, subtotales y total final.
 * Este es lo PRIMERO que ve el usuario al hacer checkout.
 */
const OrderSummaryPanel = ({
    ticketItems,
    merchItems,
    total,
    serviceFee,
    discount,
    shippingCost,
    grandTotal,
}) => {
    const hasTickets = ticketItems.length > 0;
    const hasMerch   = merchItems.length > 0;

    return (
        <section className="checkout-section" aria-label="Resumen del pedido">
            <h2 className="checkout-section-title">
                <span className="section-number">1</span>
                Tu Pedido
            </h2>

            <div className="order-items-container">
                {/* --- BOLETOS --- */}
                {hasTickets && (
                    <div className="order-group">
                        <div className="order-group-header">
                            <Icon name="ticket" size={13} />
                            <span>Boletos ({ticketItems.reduce((a, i) => a + i.quantity, 0)})</span>
                        </div>

                        {ticketItems.map(item => (
                            <OrderItem
                                key={`${item.eventId}-${item.sectionId}-${item.functionId}`}
                                image={item.image}
                                title={item.eventName}
                                subtitle={[
                                    item.sectionName && `Sección: ${item.sectionName}`,
                                    item.functionDate && `Fecha: ${item.functionDate}`,
                                    `Cant: ${item.quantity}`,
                                ].filter(Boolean).join(' · ')}
                                price={item.price * item.quantity}
                                badge="DIGITAL"
                                badgeColor="blue"
                            />
                        ))}
                    </div>
                )}

                {/* --- MERCH --- */}
                {hasMerch && (
                    <div className="order-group">
                        <div className="order-group-header">
                            <Icon name="shoppingBag" size={13} />
                            <span>Artículos ({merchItems.reduce((a, i) => a + i.quantity, 0)})</span>
                        </div>

                        {merchItems.map(item => (
                            <OrderItem
                                key={`${item.eventId}-${item.sectionId}-${item.functionId}`}
                                image={item.image}
                                title={item.eventName}
                                subtitle={[
                                    item.sectionName?.replace('MERCH: ', '') || 'PRODUCTO',
                                    `Cant: ${item.quantity}`,
                                ].filter(Boolean).join(' · ')}
                                price={item.price * item.quantity}
                                badge="ENVÍO"
                                badgeColor="amber"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Totales */}
            <div className="order-totals">
                <TotalRow label="Subtotal" value={total} />
                <TotalRow label="Comisión de servicio" value={serviceFee} />
                {shippingCost > 0 && (
                    <TotalRow label="Envío" value={shippingCost} />
                )}
                {discount > 0 && (
                    <TotalRow label="Descuento aplicado" value={-discount} accent="green" />
                )}
                <div className="order-grand-total">
                    <span>TOTAL</span>
                    <div className="order-grand-total-price">
                        <span className="grand-price">${grandTotal.toFixed(2)}</span>
                        <span className="grand-iva">IVA incluido</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ─── Sub-components ─── */

const OrderItem = ({ image, title, subtitle, price, badge, badgeColor }) => (
    <div className="order-item">
        <div className="order-item-img">
            {image && <img src={image} alt={title} loading="lazy" />}
        </div>
        <div className="order-item-details">
            <div className="order-item-top">
                <h4 className="order-item-name">{title}</h4>
                {badge && (
                    <span className={`order-item-badge badge-${badgeColor}`}>{badge}</span>
                )}
            </div>
            <p className="order-item-meta">{subtitle}</p>
        </div>
        <span className="order-item-price">${price.toFixed(2)}</span>
    </div>
);

const TotalRow = ({ label, value, accent }) => (
    <div className={`total-row ${accent ? `total-row--${accent}` : ''}`}>
        <span>{label}</span>
        <span>{value < 0 ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`}</span>
    </div>
);

export default OrderSummaryPanel;
