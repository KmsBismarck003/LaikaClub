import React from 'react';
import Icon from '../../components/Icons/Icons';
import { useCheckoutFlow } from './hooks/useCheckoutFlow';
import './Checkout.css';
import './components/Payment/Payment.css';

import CheckoutStepper from './components/CheckoutStepper';
import PhaseSummary from './components/PhaseSummary';
import PhaseDelivery from './components/PhaseDelivery';
import PhasePayment from './components/PhasePayment';
import PhaseConfirmation from './components/PhaseConfirmation';
import Step4_Success from './components/Step4_Success';

const Checkout = () => {
    const {
        cart,
        ticketItems,
        merchItems,
        hasMerch,
        hasTickets,
        orderType,
        checkoutPhases,
        currentPhase,
        currentPhaseIndex,
        goToNextPhase,
        goToPrevPhase,
        jumpToPhase,
        total,
        serviceFee,
        discount,
        finalTotal,
        shippingCost,
        grandTotal,
        checkoutError,
        setCheckoutError,
        deliveryType,
        setDeliveryType,
        needsShippingForm,
        shippingData,
        handleShippingChange,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        saveNewAddress,
        setSaveNewAddress,
        editingAddressId,
        setEditingAddressId,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        paymentMethod,
        setPaymentMethod,
        processing,
        cardData,
        handleCardChange,
        savedCards,
        removeCard,
        updateCard,
        editingCardId,
        setEditingCardId,
        handleFinalPayment,
    } = useCheckoutFlow();

    // Resolver nombre del siguiente paso para el botón de resumen
    const getNextPhaseLabel = () => {
        const nextKey = checkoutPhases[currentPhaseIndex + 1];
        if (nextKey === 'delivery') return 'Logística de Entrega';
        if (nextKey === 'payment') return 'Método de Pago';
        if (nextKey === 'confirmation') return 'Confirmación Final';
        return 'Siguiente Paso';
    };

    return (
        <div className="checkout-page-container">
            {/* Encabezado principal de la página (solo si no se ha terminado la compra) */}
            {currentPhase !== 'success' && (
                <header className="checkout-main-header">
                    <h1 className="checkout-page-title">Caja Rápida de LaikaClub</h1>
                    <span className="checkout-page-subtitle">
                        {orderType === 'digital_only' ? 'Proceso ágil de boletos digitales' : 'Proceso unificado de compra y logística'}
                    </span>
                </header>
            )}

            {/* Barra de Progreso Inteligente */}
            <CheckoutStepper
                phases={checkoutPhases}
                currentPhaseIndex={currentPhaseIndex}
                onSelectStep={jumpToPhase}
            />

            {/* Banner de error de pago o validación */}
            {checkoutError && currentPhase !== 'success' && (
                <div className="checkout-error-banner animate-fade-in" role="alert">
                    <div className="checkout-error-banner-content">
                        <Icon name="alertTriangle" size={18} className="error-icon" />
                        <span>{checkoutError}</span>
                    </div>
                    <button 
                        type="button" 
                        className="checkout-error-banner-close"
                        onClick={() => setCheckoutError(null)}
                        title="Cerrar aviso"
                    >
                        <Icon name="x" size={16} />
                    </button>
                </div>
            )}

            {/* Contenedor de Fase Activa */}
            <main className="checkout-phase-wrapper">
                {currentPhase === 'summary' && (
                    <PhaseSummary
                        ticketItems={ticketItems}
                        merchItems={merchItems}
                        total={total}
                        serviceFee={serviceFee}
                        discount={discount}
                        shippingCost={shippingCost}
                        grandTotal={grandTotal}
                        onNext={goToNextPhase}
                        orderType={orderType}
                        nextPhaseName={getNextPhaseLabel()}
                    />
                )}

                {currentPhase === 'delivery' && (
                    <PhaseDelivery
                        deliveryType={deliveryType}
                        setDeliveryType={setDeliveryType}
                        hasMerch={hasMerch}
                        needsShippingForm={needsShippingForm}
                        shippingData={shippingData}
                        handleShippingChange={handleShippingChange}
                        savedAddresses={savedAddresses}
                        selectedAddressId={selectedAddressId}
                        setSelectedAddressId={setSelectedAddressId}
                        saveNewAddress={saveNewAddress}
                        setSaveNewAddress={setSaveNewAddress}
                        editingAddressId={editingAddressId}
                        setEditingAddressId={setEditingAddressId}
                        addAddress={addAddress}
                        updateAddress={updateAddress}
                        removeAddress={removeAddress}
                        setDefaultAddress={setDefaultAddress}
                        onNext={goToNextPhase}
                        onPrev={goToPrevPhase}
                    />
                )}

                {currentPhase === 'payment' && (
                    <PhasePayment
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        cardData={cardData}
                        handleCardChange={handleCardChange}
                        savedCards={savedCards}
                        removeCard={removeCard}
                        updateCard={updateCard}
                        editingCardId={editingCardId}
                        setEditingCardId={setEditingCardId}
                        onNext={goToNextPhase}
                        onPrev={goToPrevPhase}
                    />
                )}

                {currentPhase === 'confirmation' && (
                    <PhaseConfirmation
                        cart={cart}
                        ticketItems={ticketItems}
                        merchItems={merchItems}
                        orderType={orderType}
                        deliveryType={deliveryType}
                        shippingData={shippingData}
                        paymentMethod={paymentMethod}
                        cardData={cardData}
                        savedCards={savedCards}
                        total={total}
                        serviceFee={serviceFee}
                        shippingCost={shippingCost}
                        discount={discount}
                        grandTotal={grandTotal}
                        processing={processing}
                        onConfirm={goToNextPhase}
                        onPrev={goToPrevPhase}
                        onJumpToPhase={jumpToPhase}
                    />
                )}

                {currentPhase === 'success' && (
                    <Step4_Success
                        paymentMethod={paymentMethod}
                        lastReference={cardData.lastReference}
                    />
                )}
            </main>
        </div>
    );
};

export default Checkout;
