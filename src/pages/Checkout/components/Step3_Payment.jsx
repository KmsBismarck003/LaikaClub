import React, { useEffect } from 'react';
import Icon from '../../../components/Icons/Icons';
import { useCart } from '../../../context/CartContext';
import { 
    PaymentMethodItem, 
    SavedCardsSection, 
    NewCardForm, 
    DirectPaymentButton 
} from './Payment';

const Step3_Payment = ({ 
    formData, 
    shippingMethod, 
    paymentMethod, 
    setPaymentMethod, 
    cardData, 
    handleCardChange, 
    processing, 
    setStep, 
    prevStep, 
    handleFinalPayment 
}) => {
    const { cart, savedCards, removeCard } = useCart();

    // Default select first saved card if any exist and none is currently selected
    useEffect(() => {
        if (paymentMethod === 'card' && savedCards && savedCards.length > 0 && !cardData.selectedSavedCard) {
            // Check if user has explicitly chosen to use new card previously
            const hasChosenNewCard = cardData.selectedSavedCard === null && (cardData.number || cardData.name);
            if (!hasChosenNewCard) {
                handleCardChange({ target: { name: 'selectedSavedCard', value: savedCards[0].id } });
            }
        }
    }, [savedCards, paymentMethod]);

    // Validation to determine if the direct payment button should be disabled
    const isPaymentDisabled = () => {
        if (paymentMethod !== 'card') return true;

        if (cardData.selectedSavedCard) {
            // A saved card is selected; we can proceed with direct payment immediately
            return false;
        }

        // Validate new card form fields
        const num = (cardData.number || '').replace(/\s/g, '');
        const exp = (cardData.expiry || '').trim();
        const cvv = (cardData.cvv || '').trim();
        const name = (cardData.name || '').trim();

        const isNumValid = num.length >= 15 && num.length <= 16;
        const isExpValid = exp.length === 5 && exp.includes('/');
        const isCvvValid = cvv.length >= 3 && cvv.length <= 4;
        const isNameValid = name.length >= 3;

        return !(isNumValid && isExpValid && isCvvValid && isNameValid);
    };

    return (
        <div className="checkout-step animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Step 1 Billing Summary */}
            <div className="step-header flex justify-between items-center">
                <h2 className="step-title flex items-center gap-2 text-white font-black uppercase text-sm md:text-base tracking-wider" style={{ color: '#ffffff', opacity: 1 }}>
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-mono">1</span>
                    DATOS DE FACTURACIÓN
                </h2>
                <button 
                    type="button" 
                    className="text-primary hover:text-primary/80 text-xs font-extrabold uppercase tracking-wider transition-colors" 
                    onClick={() => setStep(1)}
                >
                    CAMBIAR
                </button>
            </div>
            <div className="summary-data mb-6 p-4 rounded-xl border border-white/5 bg-white/[0.01]" style={{ background: '#0c0c0e', borderColor: '#27272a' }}>
                <p className="text-xs uppercase font-extrabold tracking-wider text-white">
                    {formData.nombre} {formData.apellidos}
                </p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">
                    {formData.calle}, {formData.numeroExterior}, {formData.colonia}, {formData.codigoPostal} • {formData.email}
                </p>
            </div>

            {/* Step 2 Shipping Summary */}
            <div className="step-header flex justify-between items-center">
                <h2 className="step-title flex items-center gap-2 text-white font-black uppercase text-sm md:text-base tracking-wider" style={{ color: '#ffffff', opacity: 1 }}>
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white text-xs flex items-center justify-center font-mono">2</span>
                    MÉTODO DE ENVÍO
                </h2>
                <button 
                    type="button" 
                    className="text-primary hover:text-primary/80 text-xs font-extrabold uppercase tracking-wider transition-colors" 
                    onClick={() => setStep(2)}
                >
                    CAMBIAR
                </button>
            </div>
            <div className="summary-data mb-8 p-4 rounded-xl border border-white/5 bg-white/[0.01]" style={{ background: '#0c0c0e', borderColor: '#27272a' }}>
                <p className="text-xs uppercase font-extrabold tracking-wider text-white">
                    {shippingMethod === 'tienda' ? 'Entrega a tienda' : shippingMethod === 'express' ? 'Envío Express' : shippingMethod === 'standard' ? 'Envío Estándar' : 'Punto de recolección'}
                </p>
            </div>

            {/* Step 3 Payment Details */}
            <h2 className="step-title flex items-center gap-2 text-white font-black uppercase text-sm md:text-base tracking-wider mb-4" style={{ color: '#ffffff', opacity: 1 }}>
                <span className="w-5 h-5 rounded-full bg-primary text-black text-xs flex items-center justify-center font-black">3</span>
                ¿CÓMO QUIERES PAGAR?
            </h2>

            <div className="method-list space-y-4">
                
                {/* Method 1: Card Payment (Credit/Debit) */}
                <PaymentMethodItem
                    id="card"
                    title="Con tarjeta de crédito o débito"
                    description="Pago directo y seguro procesado al instante por gateway de alta seguridad."
                    active={paymentMethod === 'card'}
                    disabled={false}
                    icon={
                        <div className="flex gap-2 items-center">
                            <svg width="28" height="18" viewBox="0 0 30 20" className="rounded-[3px] shadow-sm"><rect width="30" height="20" rx="3" fill="#1A1F71"/><path d="M11 13l1-5h2l-1 5h-2zm7-5c-.6 0-1 .2-1.3.6l-.2-.5h-1.6l1.2 5h1.8l.2-1.3h2l.1 1.3h1.8l-.8-5h-1.3zm.2 1.3h-.7l.2 1.3h.6l-.1-1.3z" fill="white"/></svg>
                            <svg width="28" height="18" viewBox="0 0 30 20" className="rounded-[3px] shadow-sm"><rect width="30" height="20" rx="3" fill="#EB001B"/><circle cx="12" cy="10" r="7" fill="#EB001B"/><circle cx="18" cy="10" r="7" fill="#F79E1B" fillOpacity="0.8"/></svg>
                        </div>
                    }
                    onClick={() => setPaymentMethod('card')}
                >
                    {/* Saved Cards lists */}
                    {savedCards && savedCards.length > 0 ? (
                        <div className="space-y-6">
                            <SavedCardsSection
                                savedCards={savedCards}
                                selectedSavedCard={cardData.selectedSavedCard}
                                onSelectCard={(id) => {
                                    handleCardChange({ target: { name: 'selectedSavedCard', value: id } });
                                }}
                                onSelectNewCard={() => {
                                    handleCardChange({ target: { name: 'selectedSavedCard', value: null } });
                                }}
                                onDeleteCard={(id) => {
                                    removeCard(id);
                                    // Reset selection if the currently selected card is deleted
                                    if (cardData.selectedSavedCard === id) {
                                        handleCardChange({ target: { name: 'selectedSavedCard', value: null } });
                                    }
                                }}
                            />
                            
                            {/* Render New Card Form below when New Card option is selected */}
                            {!cardData.selectedSavedCard && (
                                <div className="border-t border-white/5 pt-4">
                                    <NewCardForm 
                                        cardData={cardData} 
                                        handleCardChange={handleCardChange} 
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Directly show new card form if there are no saved cards */
                        <NewCardForm 
                            cardData={cardData} 
                            handleCardChange={handleCardChange} 
                        />
                    )}
                </PaymentMethodItem>

                {/* Method 2: Aplazo (Disabled / Coming Soon) */}
                <PaymentMethodItem
                    id="aplazo"
                    title="A meses con Aplazo"
                    description="Compra ahora y paga en 5 plazos quincenales sin tarjeta de crédito."
                    active={paymentMethod === 'aplazo'}
                    disabled={true}
                    badgeText="PRÓXIMAMENTE"
                    icon={<Icon name="calendar" size={20} className="text-white/40" />}
                    onClick={() => setPaymentMethod('aplazo')}
                />

                {/* Method 3: Oxxo Pay (Disabled / Coming Soon) */}
                <PaymentMethodItem
                    id="oxxo"
                    title="En efectivo con Oxxo Pay"
                    description="Genera una referencia y realiza tu pago en efectivo en cualquier sucursal OXXO."
                    active={paymentMethod === 'oxxo'}
                    disabled={true}
                    badgeText="PRÓXIMAMENTE"
                    icon={
                        <div className="flex gap-2 items-center opacity-60">
                            <div className="px-1.5 py-0.5 bg-red-600 rounded text-white font-black text-[9px] tracking-tight">OXXO</div>
                            <span className="px-1.5 py-0.5 bg-blue-600 text-[9px] font-black italic rounded text-white tracking-tighter">PAY</span>
                        </div>
                    }
                    onClick={() => setPaymentMethod('oxxo')}
                />

                {/* Method 4: Cash Payments (Disabled / Coming Soon) */}
                <PaymentMethodItem
                    id="cash"
                    title="En efectivo en otros puntos"
                    description="Paga en efectivo en Farmacias del Ahorro, Walmart, Sam's Club, Bodega Aurrera."
                    active={paymentMethod === 'cash'}
                    disabled={true}
                    badgeText="PRÓXIMAMENTE"
                    icon={
                        <div className="flex gap-2 items-center opacity-40 grayscale">
                             <img src="https://iconape.com/wp-content/png_logo_vector/farmacias-del-ahorro-logo.png" alt="FA" className="h-3.5 brightness-0 invert" />
                             <img src="https://www.vectorlogo.zone/logos/walmart/walmart-ar21.svg" alt="Walmart" className="h-3" />
                        </div>
                    }
                    onClick={() => setPaymentMethod('cash')}
                />

            </div>

            {/* Actions Panel */}
            <div className="checkout-actions" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                    type="button"
                    className="secondary-btn" 
                    onClick={prevStep}
                    disabled={processing}
                    style={{ flex: 1, minWidth: '100px', maxWidth: '150px' }}
                >
                    VOLVER
                </button>
                
                <div style={{ flex: 2, width: '100%', maxWidth: '380px' }}>
                    <DirectPaymentButton
                        onClick={handleFinalPayment}
                        processing={processing}
                        disabled={isPaymentDisabled()}
                        totalAmount={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + (shippingMethod === 'tienda' ? 0 : shippingMethod === 'express' ? 129 : 99)}
                    />
                </div>
            </div>

        </div>
    );
};

export default Step3_Payment;
