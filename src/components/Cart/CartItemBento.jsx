import React from 'react';
import Icon from '../Icons/Icons';

/**
 * CartItemBento - Componente individual para items de carrito (Boletos o Mercancía)
 * Diseñado con estética Bento Box, microinteracciones y feedback de disponibilidad.
 */
const CartItemBento = ({
    item,
    isAvailable = true,
    onUpdateQuantity,
    onDelete
}) => {
    // Normalización de nombres y variantes
    const nameMatch = item.eventName?.match(/^(.+?)\s*\((.+)\)$/);
    const displayName = nameMatch ? nameMatch[1] : (item.eventName || item.name || 'Experiencia');
    const displayVariant = nameMatch ? nameMatch[2] : null;
    const isMerch = item.sectionId === 'MERCH' || item.type === 'merch' || item.isMerch;

    const unitPrice = Number(item.price) || 0;
    const itemTotal = unitPrice * item.quantity;
    const imageSrc = item.image || item.imageUrl || item.ticket_image_url;

    return (
        <article className={`cart-bento-item ${!isAvailable ? 'cart-bento-item--unavailable' : ''}`}>
            {/* Lado izquierdo: Media con badge contextual */}
            <div className="bento-item-media">
                {imageSrc ? (
                    <img src={imageSrc} alt={displayName} className="bento-item-img" />
                ) : (
                    <div className="bento-item-placeholder">
                        <Icon name={isMerch ? 'shoppingBag' : 'ticket'} size={24} className="bento-media-icon" />
                    </div>
                )}
                <span className={`bento-media-tag ${isMerch ? 'bento-tag--merch' : 'bento-tag--ticket'}`}>
                    {isMerch ? 'MERCH' : 'BOLETO'}
                </span>
            </div>

            {/* Centro: Información del evento / producto */}
            <div className="bento-item-content">
                <div className="bento-item-header-row">
                    <h4 className="bento-item-title" title={displayName}>
                        {displayName}
                    </h4>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="bento-delete-btn"
                        title="Eliminar artículo del carrito"
                        aria-label="Eliminar artículo"
                    >
                        <Icon name="trash2" size={15} />
                    </button>
                </div>

                {/* Badges de zona o variantes */}
                <div className="bento-item-meta-row">
                    {displayVariant && (
                        <span className="bento-badge-variant">
                            {displayVariant}
                        </span>
                    )}
                    {!displayVariant && item.sectionName && (
                        <span className={`bento-badge-section ${item.sectionName.toLowerCase().includes('vip') ? 'bento-badge-vip' : ''}`}>
                            {item.sectionName}
                        </span>
                    )}
                    {item.functionDate && (
                        <span className="bento-date-badge">
                            <Icon name="calendar" size={11} />
                            {item.functionDate}
                        </span>
                    )}
                </div>

                {/* Advertencia si no está disponible en inventario */}
                {!isAvailable && (
                    <div className="bento-item-warning">
                        <Icon name="alertTriangle" size={13} />
                        <span>Agotado o no disponible</span>
                    </div>
                )}

                {/* Fila inferior: Controles de cantidad y precio */}
                <div className="bento-item-footer">
                    <div className="bento-stepper">
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(-1)}
                            className="bento-stepper-btn"
                            disabled={item.quantity <= 1}
                            title="Disminuir cantidad"
                            aria-label="Disminuir cantidad"
                        >
                            <Icon name="minus" size={12} />
                        </button>
                        <span className="bento-stepper-qty">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(1)}
                            className="bento-stepper-btn"
                            disabled={!isAvailable}
                            title="Aumentar cantidad"
                            aria-label="Aumentar cantidad"
                        >
                            <Icon name="plus" size={12} />
                        </button>
                    </div>

                    <div className="bento-item-pricing">
                        {item.quantity > 1 && (
                            <span className="bento-unit-price">
                                ${unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u
                            </span>
                        )}
                        <span className="bento-total-price">
                            ${itemTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            <span className="bento-currency">MXN</span>
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default CartItemBento;
