import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Icon from '../Icons/Icons';
import CartContent from './CartContent';
import './Cart.css';

/**
 * CartModal - Contenedor Modal de Alto Impacto para el Carrito Bento
 * Controla el bloqueo de scroll del fondo, animaciones de entrada y cierre.
 */
const CartModal = () => {
    const { isCartOpen, closeCart, cartCount } = useCart();

    // Bloqueo de scroll en body mientras el modal está abierto
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <div
            className="cart-modal-backdrop"
            onClick={closeCart}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-modal-title"
        >
            <div
                className="cart-modal-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header del Modal ──────────────────────────────── */}
                <header className="cart-modal-header">
                    <div className="cart-modal-title-wrap">
                        <div className="cart-modal-icon-badge">
                            <Icon name="shoppingCart" size={17} />
                        </div>
                        <h2 id="cart-modal-title" className="cart-modal-title">
                            Mi Carrito
                        </h2>
                        {cartCount > 0 && (
                            <span className="cart-modal-count-pill" aria-label={`${cartCount} artículos`}>
                                {cartCount}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        title="Cerrar carrito"
                        aria-label="Cerrar carrito"
                        className="cart-modal-close-btn"
                    >
                        <Icon name="close" size={16} />
                    </button>
                </header>

                {/* ── Cuerpo del Modal con layout Bento Box ──────────── */}
                <div className="cart-modal-body">
                    <CartContent
                        isModal={true}
                        onCheckoutComplete={closeCart}
                        twoColumn={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default CartModal;
