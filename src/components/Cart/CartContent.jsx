import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icons/Icons';
import TicketPrinterOverlay from '../../pages/user/UserCart/TicketPrinterOverlay';
import { merchService } from '../../services/merch.service';
import useCartAvailability, { getCartItemKey } from '../../hooks/useCartAvailability';
import ConfirmDialog from '../Modals/ConfirmDialog/ConfirmDialog';
import CartItemBento from './CartItemBento';
import CartSummaryBento from './CartSummaryBento';
import CartUpsellModal from './CartUpsellModal';
import './Cart.css';

/**
 * CartContent - Orquestador principal del carrito de compras.
 * Implementa arquitectura Bento Box responsiva, separación de capas y cero mocks.
 */
const CartContent = ({ onCheckoutComplete, isModal = false, twoColumn = false }) => {
    const {
        cart, total, removeFromCart, updateQuantity,
        serviceFee, serviceFeePercent,
        appliedCoupon, discount, finalTotal,
        applyCoupon, removeCoupon,
        closeCart, addToCart, cartCount
    } = useCart();

    const { success, error } = useNotification();
    const navigate = useNavigate();
    const [itemToDelete, setItemToDelete] = useState(null);

    // Estado del overlay de impresión
    const [showPrinter, setShowPrinter] = useState(false);
    const [printingData] = useState(null);

    // Estado de venta adicional (Upsell)
    const [upsellMerch, setUpsellMerch] = useState([]);
    const [showUpsellModal, setShowUpsellModal] = useState(false);

    // Validación real en tiempo real de eventos y mercancía
    const {
        checking: checkingAvailability,
        getItemStatus,
        unavailableItems,
        partialStockItems,
        hasBlockingIssues,
        resolveAllIssues
    } = useCartAvailability(cart, { removeFromCart, updateQuantity });

    // Separación modular de tipos de artículos
    const ticketItems = cart.filter(item => item.sectionId !== 'MERCH');
    const merchItems = cart.filter(item => item.sectionId === 'MERCH');

    // Cargar artículos recomendados para el upsell basados en los eventos seleccionados
    useEffect(() => {
        const ticketEventIds = [...new Set(ticketItems.map(item => item.eventId))].filter(Boolean);
        if (ticketEventIds.length > 0) {
            Promise.all(ticketEventIds.map(id =>
                merchService.getAllMerchandise(null, null, id, 'approved')
            )).then(results => {
                const allMerch = results.flat().filter(Boolean);
                const merchInCartIds = cart.filter(item => item.sectionId === 'MERCH').map(item => item.id);
                const filteredUpsell = allMerch.filter(item => !merchInCartIds.includes(`merch_${item.id}`));
                setUpsellMerch(filteredUpsell);
            }).catch(err => console.error("Error al cargar merch de recomendación:", err));
        }
    }, [cart]);

    const handleResolveIssues = async () => {
        const { removedCount, adjustedCount } = await resolveAllIssues();
        const parts = [];
        if (removedCount > 0) {
            parts.push(`${removedCount} ${removedCount === 1 ? 'artículo no disponible retirado' : 'artículos no disponibles retirados'}`);
        }
        if (adjustedCount > 0) {
            parts.push(`${adjustedCount} ${adjustedCount === 1 ? 'cantidad ajustada al stock disponible' : 'cantidades ajustadas al stock disponible'}`);
        }
        if (parts.length > 0) {
            success(`Carrito actualizado: ${parts.join(' y ')}.`);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (checkingAvailability) return;
        if (hasBlockingIssues) {
            error('Hay artículos agotados o con stock insuficiente en tu carrito. Retíralos o ajusta las cantidades para continuar al pago.');
            return;
        }
        if (upsellMerch.length > 0) {
            setShowUpsellModal(true);
        } else {
            proceedToCheckout();
        }
    };

    const proceedToCheckout = () => {
        if (isModal && closeCart) closeCart();
        navigate('/checkout');
    };

    const handlePrintingComplete = () => {
        setShowPrinter(false);
        if (isModal && closeCart) closeCart();
        navigate('/user/tickets');
        if (onCheckoutComplete) onCheckoutComplete();
    };

    const handleAddUpsell = (merchItem, price) => {
        addToCart(
            {
                id: `merch_${merchItem.id}`,
                name: merchItem.name,
                price: price,
                image: merchItem.image_url
            },
            1,
            null,
            { id: 'MERCH', name: `MERCH: ${merchItem.category || 'MERCANCÍA'}`, price: price }
        );
        setUpsellMerch(prev => prev.filter(u => u.id !== merchItem.id));
        success(`${merchItem.name} agregado al carrito`);
    };

    // Estado cuando el carrito está completamente vacío
    if (cart.length === 0 && !showPrinter) {
        return (
            <div className="cart-empty-bento">
                <div className="empty-icon-halo">
                    <Icon name="shoppingCart" size={40} className="empty-icon-svg" />
                </div>
                <h3 className="empty-bento-title">Tu carrito está vacío</h3>
                <p className="empty-bento-desc">
                    Aún no has agregado boletos ni mercancía a tu orden.
                </p>
                <button
                    type="button"
                    onClick={() => { if (isModal && closeCart) closeCart(); navigate('/'); }}
                    className="empty-bento-cta"
                >
                    <Icon name="ticket" size={16} />
                    <span>Explorar Cartelera de Eventos</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`cart-bento-container ${isModal ? 'cart-bento--modal' : ''} ${twoColumn ? 'cart-bento--two-col' : ''}`}>
            {/* Overlay de animación de boletos */}
            <TicketPrinterOverlay
                isOpen={showPrinter}
                ticketData={printingData}
                isProcessing={false}
                onComplete={handlePrintingComplete}
            />

            {/* Modal de recomendación de mercancía (Upsell) */}
            <CartUpsellModal
                isOpen={showUpsellModal}
                items={upsellMerch}
                onClose={() => setShowUpsellModal(false)}
                onAddToCart={handleAddUpsell}
                onProceed={proceedToCheckout}
            />

            {/* Diálogo de Confirmación para eliminar */}
            <ConfirmDialog
                isOpen={Boolean(itemToDelete)}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (!itemToDelete) return;
                    removeFromCart(itemToDelete.eventId, itemToDelete.functionId, itemToDelete.sectionId);
                    setItemToDelete(null);
                    success('Artículo eliminado del carrito');
                }}
                title="¿Eliminar del carrito?"
                message="¿Estás seguro de que deseas eliminar este artículo de tu compra?"
                confirmText="Eliminar"
                cancelText="Conservar"
                variant="danger"
                itemDetails={itemToDelete ? {
                    image: itemToDelete.image || itemToDelete.imageUrl,
                    title: itemToDelete.eventName || itemToDelete.name,
                    subtitle: itemToDelete.sectionName || itemToDelete.functionDate,
                    price: `$${(itemToDelete.price * itemToDelete.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
                    quantity: itemToDelete.quantity
                } : null}
            />

            {/* Grid Bento Principal */}
            <div className="cart-bento-grid">
                {/* ── COLUMNA IZQUIERDA: Artículos en Bento Cells ──────────── */}
                <main className="cart-bento-items-col">
                    {/* Banner de alerta de disponibilidad (eventos y mercancía) */}
                    {hasBlockingIssues && (
                        <div className="cart-warning-banner" role="alert">
                            <Icon name="alertTriangle" size={18} className="cart-warning-icon" />
                            <div className="cart-warning-text">
                                <strong>
                                    {unavailableItems.length > 0 && partialStockItems.length > 0
                                        ? `${unavailableItems.length} no disponible(s) y ${partialStockItems.length} con stock limitado`
                                        : unavailableItems.length > 0
                                            ? `${unavailableItems.length} ${unavailableItems.length === 1 ? 'artículo ya no está disponible' : 'artículos ya no están disponibles'}`
                                            : `${partialStockItems.length} ${partialStockItems.length === 1 ? 'artículo supera' : 'artículos superan'} el stock disponible`}
                                </strong>
                                <p>
                                    Retira los artículos agotados o ajusta sus cantidades para poder continuar con el pago.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="cart-warning-action-btn"
                                onClick={handleResolveIssues}
                            >
                                <Icon name="trash2" size={14} />
                                <span>
                                    {partialStockItems.length > 0 && unavailableItems.length === 0
                                        ? 'Ajustar cantidades'
                                        : partialStockItems.length > 0
                                            ? 'Limpiar y ajustar'
                                            : 'Quitar no disponibles'}
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Grupo: Boletos */}
                    {ticketItems.length > 0 && (
                        <section className="cart-bento-section">
                            <header className="bento-section-header">
                                <div className="bento-section-title-wrap">
                                    <Icon name="ticket" size={14} className="bento-section-icon" />
                                    <h3 className="bento-section-title">Boletos Seleccionados</h3>
                                </div>
                                <span className="bento-section-count">
                                    {ticketItems.reduce((acc, it) => acc + (it.quantity || 1), 0)} {ticketItems.length === 1 ? 'acceso' : 'accesos'}
                                </span>
                            </header>

                            <div className={`cart-bento-items-layout ${ticketItems.length === 1 ? 'layout-single-item' : 'layout-multi-items'}`}>
                                {ticketItems.map((item) => {
                                    const itemStatus = getItemStatus(item);
                                    return (
                                        <CartItemBento
                                            key={getCartItemKey(item)}
                                            item={item}
                                            availability={itemStatus}
                                            isAvailable={itemStatus.available}
                                            onUpdateQuantity={(delta) => updateQuantity(item.eventId, item.quantity + delta, item.functionId, item.sectionId)}
                                            onAdjustToMax={(maxQty) => {
                                                updateQuantity(item.eventId, maxQty, item.functionId, item.sectionId);
                                                success(`Cantidad ajustada a ${maxQty}`);
                                            }}
                                            onDelete={() => {
                                                if (itemStatus.status === 'unavailable') {
                                                    removeFromCart(item.eventId, item.functionId, item.sectionId);
                                                    success('Artículo no disponible retirado del carrito');
                                                } else {
                                                    setItemToDelete(item);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Grupo: Mercancía / Souvenirs */}
                    {merchItems.length > 0 && (
                        <section className="cart-bento-section">
                            <header className="bento-section-header">
                                <div className="bento-section-title-wrap">
                                    <Icon name="shoppingBag" size={14} className="bento-section-icon bento-section-icon--merch" />
                                    <h3 className="bento-section-title">Mercancía Oficial</h3>
                                </div>
                                <span className="bento-section-count">
                                    {merchItems.reduce((acc, it) => acc + (it.quantity || 1), 0)} {merchItems.length === 1 ? 'producto' : 'productos'}
                                </span>
                            </header>

                            <div className={`cart-bento-items-layout ${merchItems.length === 1 ? 'layout-single-item' : 'layout-multi-items'}`}>
                                {merchItems.map((item) => {
                                    const itemStatus = getItemStatus(item);
                                    return (
                                        <CartItemBento
                                            key={getCartItemKey(item)}
                                            item={item}
                                            availability={itemStatus}
                                            isAvailable={itemStatus.available}
                                            onUpdateQuantity={(delta) => updateQuantity(item.eventId, item.quantity + delta, item.functionId, item.sectionId)}
                                            onAdjustToMax={(maxQty) => {
                                                updateQuantity(item.eventId, maxQty, item.functionId, item.sectionId);
                                                success(`Cantidad ajustada a ${maxQty}`);
                                            }}
                                            onDelete={() => {
                                                if (itemStatus.status === 'unavailable') {
                                                    removeFromCart(item.eventId, item.functionId, item.sectionId);
                                                    success('Producto agotado retirado del carrito');
                                                } else {
                                                    setItemToDelete(item);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </main>

                {/* ── COLUMNA DERECHA: Bento Summary Panel ───────────────── */}
                <CartSummaryBento
                    total={total}
                    serviceFee={serviceFee}
                    serviceFeePercent={serviceFeePercent}
                    appliedCoupon={appliedCoupon}
                    discount={discount}
                    finalTotal={finalTotal}
                    applyCoupon={applyCoupon}
                    removeCoupon={removeCoupon}
                    onCheckout={handleCheckout}
                    hasUnavailableItems={hasBlockingIssues}
                    checkingAvailability={checkingAvailability}
                    cartCount={cartCount}
                />
            </div>
        </div>
    );
};

export default CartContent;
