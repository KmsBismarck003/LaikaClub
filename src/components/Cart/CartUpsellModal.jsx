import React from 'react';
import Icon from '../Icons/Icons';

/**
 * CartUpsellModal - Modal de venta adicional (Merchandising / Souvenirs oficiales)
 * Se muestra antes de pasar al checkout para invitar al usuario a complementar su boleto.
 * Sin emojis, con diseño Dark Glassmorphism de alta gama.
 */
const CartUpsellModal = ({
    isOpen = false,
    items = [],
    onClose,
    onAddToCart,
    onProceed
}) => {
    if (!isOpen || items.length === 0) return null;

    return (
        <div className="bento-upsell-backdrop" onClick={onClose}>
            <div className="bento-upsell-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bento-upsell-header">
                    <div className="bento-upsell-badge">
                        <Icon name="sparkles" size={14} />
                        <span>Exclusivo para Asistentes</span>
                    </div>
                    <h2 className="bento-upsell-title">
                        ¿Deseas agregar un recuerdo oficial?
                    </h2>
                    <p className="bento-upsell-desc">
                        Merchandising de edición limitada disponible para entrega o recolección el día del evento.
                    </p>
                </div>

                {/* Lista de productos recomendados */}
                <div className="bento-upsell-list">
                    {items.map((item) => {
                        const price = item.variants?.[0]?.price || item.price || 0;
                        const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0;

                        return (
                            <div key={item.id} className="bento-upsell-item">
                                <div className="bento-upsell-img-wrap">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="bento-upsell-img" />
                                    ) : (
                                        <Icon name="shoppingBag" size={24} className="bento-upsell-placeholder-icon" />
                                    )}
                                </div>

                                <div className="bento-upsell-details">
                                    <span className="bento-upsell-category">
                                        {item.category || 'MERCANCÍA'}
                                    </span>
                                    <h4 className="bento-upsell-name">{item.name}</h4>
                                    <span className="bento-upsell-price">
                                        ${numPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onAddToCart(item, numPrice)}
                                    className="bento-upsell-add-btn"
                                >
                                    <Icon name="plus" size={13} />
                                    <span>Agregar</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer con acciones */}
                <div className="bento-upsell-footer">
                    <button
                        type="button"
                        onClick={onProceed}
                        className="bento-upsell-skip-btn"
                    >
                        No, continuar al pago
                    </button>
                    <button
                        type="button"
                        onClick={onProceed}
                        className="bento-upsell-proceed-btn"
                    >
                        <span>Listo, ir a pagar</span>
                        <Icon name="arrowRight" size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartUpsellModal;
