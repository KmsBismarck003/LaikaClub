import React, { useEffect } from 'react';
import Icon from '../../../components/Icons/Icons';
import ShippingPanel from './ShippingPanel';
import {
    PaymentMethodItem,
    SavedCardsSection,
    NewCardForm,
    DirectPaymentButton,
} from './Payment';

/**
 * Panel central de pago.
 * Contiene:
 *   2. Método de pago (tarjeta, OXXO, etc.)
 *   3. Tipo de entrega para boletos (solo si NO hay merch)
 *   4. Datos de envío (condicional: aparece si entrega física o merch)
 *   5. Botón final de compra
 */
const PaymentPanel = ({
    // Pago
    paymentMethod,
    setPaymentMethod,
    cardData,
    handleCardChange,
    savedCards,
    removeCard,
    processing,
    grandTotal,
    handleFinalPayment,
    // Entrega
    deliveryType,
    setDeliveryType,
    hasMerch,
    needsShippingForm,
    // Formulario de envío
    shippingData,
    handleShippingChange,
}) => {
    // Auto-seleccionar primera tarjeta guardada
    useEffect(() => {
        if (
            paymentMethod === 'card' &&
            savedCards?.length > 0 &&
            !cardData.selectedSavedCard &&
            !cardData.number
        ) {
            handleCardChange('selectedSavedCard', savedCards[0].id);
        }
    }, [savedCards, paymentMethod]); // eslint-disable-line

    const isPaymentReady = () => {
        if (paymentMethod !== 'card') return false; // otros métodos deshabilitados aún
        if (cardData.selectedSavedCard) return true;

        const num = (cardData.number || '').replace(/\s/g, '');
        const exp = (cardData.expiry || '').trim();
        const cvv = (cardData.cvv || '').trim();
        const name = (cardData.name || '').trim();

        return num.length >= 15 && exp.includes('/') && cvv.length >= 3 && name.length >= 3;
    };

    // Evento proxy para adaptarse al handleCardChange del hook (field, value)
    const onCardInputChange = (e) => {
        handleCardChange(e.target.name, e.target.value);
    };

    // Proxy SavedCards espera handleCardChange como evento sintético
    const proxyCardChange = (e) => {
        handleCardChange(e.target.name, e.target.value);
    };

    return (
        <div className="payment-panel-wrapper">

            {/* ── SECCIÓN 2: Método de pago ── */}
            <section className="checkout-section" aria-label="Método de pago">
                <h2 className="checkout-section-title">
                    <span className="section-number">2</span>
                    ¿Cómo quieres pagar?
                </h2>

                <div className="method-list space-y-4">
                    {/* Tarjeta */}
                    <PaymentMethodItem
                        id="card"
                        title="Con tarjeta de crédito o débito"
                        description="Pago directo y seguro procesado al instante."
                        active={paymentMethod === 'card'}
                        disabled={false}
                        icon={<CardBrandIcons />}
                        onClick={() => setPaymentMethod('card')}
                    >
                        {savedCards?.length > 0 ? (
                            <div className="space-y-6">
                                <SavedCardsSection
                                    savedCards={savedCards}
                                    selectedSavedCard={cardData.selectedSavedCard}
                                    onSelectCard={(id) => handleCardChange('selectedSavedCard', id)}
                                    onSelectNewCard={() => handleCardChange('selectedSavedCard', null)}
                                    onDeleteCard={(id) => {
                                        removeCard(id);
                                        if (cardData.selectedSavedCard === id) {
                                            handleCardChange('selectedSavedCard', null);
                                        }
                                    }}
                                />
                                {!cardData.selectedSavedCard && (
                                    <div className="border-t border-white/5 pt-4">
                                        <NewCardForm cardData={cardData} handleCardChange={proxyCardChange} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NewCardForm cardData={cardData} handleCardChange={proxyCardChange} />
                        )}
                    </PaymentMethodItem>

                    {/* Aplazo — próximamente */}
                    <PaymentMethodItem
                        id="aplazo"
                        title="A meses con Aplazo"
                        description="Paga en plazos quincenales sin tarjeta de crédito."
                        active={false}
                        disabled
                        badgeText="PRÓXIMAMENTE"
                        icon={<Icon name="calendar" size={20} className="text-white/40" />}
                        onClick={() => {}}
                    />

                    {/* OXXO — próximamente */}
                    <PaymentMethodItem
                        id="oxxo"
                        title="En efectivo con Oxxo Pay"
                        description="Genera una referencia y paga en cualquier OXXO."
                        active={false}
                        disabled
                        badgeText="PRÓXIMAMENTE"
                        icon={
                            <div className="flex gap-2 items-center opacity-60">
                                <div className="px-1.5 py-0.5 bg-red-600 rounded text-white font-black text-[9px] tracking-tight">OXXO</div>
                                <span className="px-1.5 py-0.5 bg-blue-600 text-[9px] font-black italic rounded text-white tracking-tighter">PAY</span>
                            </div>
                        }
                        onClick={() => {}}
                    />
                </div>
            </section>

            {/* ── SECCIÓN 3: Tipo de entrega para boletos ── */}
            <section className="checkout-section" aria-label="Tipo de entrega">
                <h2 className="checkout-section-title">
                    <span className="section-number">3</span>
                    ¿Cómo quieres recibir tus boletos?
                    {hasMerch && (
                        <span className="section-title-note">y artículos</span>
                    )}
                </h2>

                <div className="delivery-options">
                    <DeliveryOption
                        id="digital"
                        icon="smartphone"
                        title="Boleto digital"
                        description="Recibe tus boletos en la app o por correo electrónico. Sin costo adicional."
                        cost="GRATIS"
                        costFree
                        selected={deliveryType === 'digital'}
                        disabled={hasMerch} // Si hay merch siempre necesita envío
                        onSelect={() => setDeliveryType('digital')}
                    />
                    <DeliveryOption
                        id="tienda"
                        icon="home"
                        title="Recoger en taquilla"
                        description="Recoge tus boletos el día del evento en la taquilla del recinto."
                        cost="GRATIS"
                        costFree
                        selected={deliveryType === 'tienda'}
                        onSelect={() => setDeliveryType('tienda')}
                    />
                    <DeliveryOption
                        id="standard"
                        icon="truck"
                        title="Envío estándar"
                        description="Recibe tus boletos físicos en tu domicilio en 3-5 días hábiles."
                        cost="$99.00"
                        selected={deliveryType === 'standard'}
                        onSelect={() => setDeliveryType('standard')}
                    />
                    <DeliveryOption
                        id="express"
                        icon="zap"
                        title="Envío express"
                        description="Entrega en 24-48 horas hábiles."
                        cost="$129.00"
                        selected={deliveryType === 'express'}
                        onSelect={() => setDeliveryType('express')}
                    />
                </div>

                {hasMerch && deliveryType === 'digital' && (
                    <div className="delivery-merch-notice">
                        <Icon name="info" size={14} />
                        <span>
                            Tu carrito incluye artículos físicos. Selecciona un método de envío para recibirlos.
                        </span>
                    </div>
                )}
            </section>

            {/* ── SECCIÓN 4: Datos de envío (condicional) ── */}
            {needsShippingForm && (
                <section className="checkout-section checkout-section--shipping" aria-label="Datos de entrega">
                    <h2 className="checkout-section-title">
                        <span className="section-number">4</span>
                        Datos de entrega
                    </h2>
                    <ShippingPanel
                        shippingData={shippingData}
                        handleShippingChange={handleShippingChange}
                        deliveryType={deliveryType}
                    />
                </section>
            )}

            {/* ── CTA: Botón de pago ── */}
            <div className="checkout-cta-bar">
                <DirectPaymentButton
                    onClick={handleFinalPayment}
                    processing={processing}
                    disabled={!isPaymentReady()}
                    totalAmount={grandTotal}
                />
                <p className="checkout-cta-security">
                    <Icon name="lock" size={12} />
                    Pago seguro con encriptación SSL
                </p>
            </div>
        </div>
    );
};

/* ─── Sub-components ─── */

const CardBrandIcons = () => (
    <div className="flex gap-2 items-center">
        <svg width="28" height="18" viewBox="0 0 30 20" className="rounded-[3px] shadow-sm">
            <rect width="30" height="20" rx="3" fill="#1A1F71"/>
            <path d="M11 13l1-5h2l-1 5h-2zm7-5c-.6 0-1 .2-1.3.6l-.2-.5h-1.6l1.2 5h1.8l.2-1.3h2l.1 1.3h1.8l-.8-5h-1.3zm.2 1.3h-.7l.2 1.3h.6l-.1-1.3z" fill="white"/>
        </svg>
        <svg width="28" height="18" viewBox="0 0 30 20" className="rounded-[3px] shadow-sm">
            <rect width="30" height="20" rx="3" fill="#EB001B"/>
            <circle cx="12" cy="10" r="7" fill="#EB001B"/>
            <circle cx="18" cy="10" r="7" fill="#F79E1B" fillOpacity="0.8"/>
        </svg>
    </div>
);

const DeliveryOption = ({ id, icon, title, description, cost, costFree, selected, disabled, onSelect }) => (
    <button
        type="button"
        id={`delivery-${id}`}
        className={`delivery-option ${selected ? 'delivery-option--selected' : ''} ${disabled ? 'delivery-option--disabled' : ''}`}
        onClick={disabled ? undefined : onSelect}
        disabled={disabled}
        aria-pressed={selected}
    >
        <div className="delivery-option-radio">
            {selected && <div className="delivery-option-dot" />}
        </div>
        <Icon name={icon} size={18} className="delivery-option-icon" />
        <div className="delivery-option-content">
            <span className="delivery-option-title">{title}</span>
            <span className="delivery-option-desc">{description}</span>
        </div>
        <span className={`delivery-option-cost ${costFree ? 'delivery-option-cost--free' : ''}`}>
            {cost}
        </span>
    </button>
);

export default PaymentPanel;
