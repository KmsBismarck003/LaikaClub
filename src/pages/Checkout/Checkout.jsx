import React from 'react';
import { useCheckoutFlow } from './hooks/useCheckoutFlow';
import OrderSummaryPanel from './components/OrderSummaryPanel';
import PaymentPanel from './components/PaymentPanel';
import ShippingPanel from './components/ShippingPanel';
import Step4_Success from './components/Step4_Success';
import Icon from '../../components/Icons/Icons';
import './Checkout.css';

/**
 * Checkout principal — flujo lineal de una sola página:
 * 1. Resumen del pedido (siempre visible)
 * 2. Método de pago
 * 3. Opcionalmente: datos de envío (si merch o boleto físico)
 * 4. Total + botón de pago
 */
const Checkout = () => {
    const flow = useCheckoutFlow();

    if (flow.step === 2) {
        return (
            <div className="checkout-page-container">
                <Step4_Success
                    paymentMethod={flow.paymentMethod}
                    lastReference={flow.cardData.lastReference}
                />
            </div>
        );
    }

    return (
        <div className="checkout-page-container">
            <header className="checkout-main-header">
                <h1 className="checkout-page-title">Finalizar Compra</h1>
                <p className="checkout-page-subtitle">
                    Revisa tu pedido y selecciona cómo quieres pagar
                </p>
            </header>

            <div className="checkout-unified-layout">
                {/* Columna principal */}
                <main className="checkout-main-content">
                    {flow.checkoutError && (
                        <div className="checkout-error-banner animate-fade-in">
                            <div className="checkout-error-banner-content">
                                <Icon name="alert-circle" size={20} className="error-icon" />
                                <span>{flow.checkoutError}</span>
                            </div>
                            <button
                                type="button"
                                className="checkout-error-banner-close"
                                onClick={() => flow.setCheckoutError(null)}
                                aria-label="Cerrar error"
                            >
                                <Icon name="x" size={16} />
                            </button>
                        </div>
                    )}

                    {/* SECCIÓN 1: Resumen del pedido */}
                    <OrderSummaryPanel
                        ticketItems={flow.ticketItems}
                        merchItems={flow.merchItems}
                        total={flow.total}
                        serviceFee={flow.serviceFee}
                        discount={flow.discount}
                        shippingCost={flow.shippingCost}
                        grandTotal={flow.grandTotal}
                    />

                    {/* SECCIÓN 2: Método de pago */}
                    <PaymentPanel
                        paymentMethod={flow.paymentMethod}
                        setPaymentMethod={flow.setPaymentMethod}
                        cardData={flow.cardData}
                        handleCardChange={flow.handleCardChange}
                        savedCards={flow.savedCards}
                        removeCard={flow.removeCard}
                        processing={flow.processing}
                        grandTotal={flow.grandTotal}
                        handleFinalPayment={flow.handleFinalPayment}
                        // Delivery
                        deliveryType={flow.deliveryType}
                        setDeliveryType={flow.setDeliveryType}
                        hasMerch={flow.hasMerch}
                        needsShippingForm={flow.needsShippingForm}
                        // Shipping form (embedded when needed)
                        shippingData={flow.shippingData}
                        handleShippingChange={flow.handleShippingChange}
                    />
                </main>
            </div>
        </div>
    );
};

export default Checkout;
