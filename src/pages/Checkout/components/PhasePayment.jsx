import React, { useState } from 'react';
import Icon from '../../../components/Icons/Icons';
import {
    PaymentMethodItem,
    SavedCardsSection,
    NewCardForm,
} from './Payment';

const PhasePayment = ({
    paymentMethod,
    setPaymentMethod,
    cardData,
    handleCardChange,
    savedCards,
    removeCard,
    updateCard,
    onNext,
    onPrev
}) => {
    // Estado para modal/panel de edición de tarjeta guardada
    const [editingCard, setEditingCard] = useState(null);
    const [editForm, setEditForm] = useState({ holder: '', expiry: '' });

    const handleStartEdit = (card) => {
        setEditingCard(card);
        setEditForm({
            holder: card.holder || '',
            expiry: card.expiry || ''
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (editingCard) {
            updateCard(editingCard.id, {
                holder: editForm.holder.trim().toUpperCase(),
                expiry: editForm.expiry.trim()
            });
            setEditingCard(null);
        }
    };

    // Proxy para adaptarse al formato esperado en los componentes subyacentes
    const proxyCardChange = (e) => {
        handleCardChange(e.target.name, e.target.value);
    };

    return (
        <div className="phase-container animate-fade-in">
            <header className="phase-header">
                <div className="phase-header-left">
                    <h2 className="phase-title">Método de Pago</h2>
                    <p className="phase-subtitle">
                        Selecciona o captura tu método de pago seguro. Tu tarjeta solo se cargará tras confirmar en el siguiente paso.
                    </p>
                </div>
            </header>

            <div className="payment-phase-layout">
                <section className="phase-sub-section">
                    <h3 className="section-small-heading">
                        <Icon name="creditCard" size={16} className="heading-icon" />
                        <span>Opciones Disponibles</span>
                    </h3>

                    <div className="method-list space-y-4">
                        {/* Tarjeta de Crédito / Débito */}
                        <PaymentMethodItem
                            id="card"
                            title="Con Tarjeta de Crédito o Débito"
                            description="Transacción instantánea cifrada de extremo a extremo con autenticación bancaria."
                            active={paymentMethod === 'card'}
                            disabled={false}
                            icon={<CardBrandIcons />}
                            onClick={() => setPaymentMethod('card')}
                        >
                            {savedCards && savedCards.length > 0 ? (
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
                                        onEditCard={handleStartEdit}
                                    />
                                    
                                    {!cardData.selectedSavedCard && (
                                        <div className="new-card-form-wrapper pt-6 border-t border-white/10 animate-fade-in">
                                            <h4 className="new-card-title mb-4">Captura de nueva tarjeta</h4>
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
                            title="A meses sin tarjeta con Aplazo"
                            description="Divide tu compra en plazos quincenales congelados."
                            active={false}
                            disabled
                            badgeText="PRÓXIMAMENTE"
                            icon={<Icon name="calendar" size={20} className="text-white/40" />}
                            onClick={() => {}}
                        />

                        {/* OXXO — próximamente */}
                        <PaymentMethodItem
                            id="oxxo"
                            title="Pago en Efectivo OXXO Pay"
                            description="Genera una referencia bancaria digital para pagar en tienda."
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

                {/* Banner de Confianza y Seguridad SSL */}
                <div className="security-trust-badge">
                    <div className="trust-icon-box">
                        <Icon name="lock" size={22} className="text-emerald-400" />
                    </div>
                    <div className="trust-text">
                        <strong>Encriptación SSL de Grado Bancario 256-Bit</strong>
                        <p>Tus datos financieros están protegidos bajo los estándares PCI-DSS e ISO 27001. Nuncaalmacenamos el CVV en nuestros servidores.</p>
                    </div>
                    <div className="trust-logos">
                        <span className="trust-pill">PCI-DSS Verified</span>
                    </div>
                </div>

                {/* ── Modal / Panel para Editar Tarjeta Guardada ── */}
                {editingCard && (
                    <div className="card-edit-modal-overlay">
                        <div className="card-edit-modal animate-scale-up">
                            <header className="modal-header">
                                <h4>Editar Tarjeta Guardada</h4>
                                <button type="button" className="modal-close-btn" onClick={() => setEditingCard(null)}>
                                    <Icon name="x" size={16} />
                                </button>
                            </header>
                            <form onSubmit={handleSaveEdit} className="modal-form-body">
                                <div className="card-preview-mini">
                                    <span className="mini-card-num">{editingCard.number}</span>
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Nombre del Titular</label>
                                    <input 
                                        type="text"
                                        value={editForm.holder}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, holder: e.target.value }))}
                                        placeholder="Nombre en tarjeta"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Fecha de Expiración (MM/AA)</label>
                                    <input 
                                        type="text"
                                        value={editForm.expiry}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, expiry: e.target.value }))}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setEditingCard(null)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary-small">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Botones de Navegación de Fase ── */}
                <div className="phase-navigation-bar">
                    <button type="button" className="phase-prev-btn" onClick={onPrev}>
                        <Icon name="arrowLeft" size={16} />
                        <span>Volver a Paso Anterior</span>
                    </button>
                    <button type="button" className="phase-next-btn primary-btn-glow" onClick={onNext}>
                        <span>Revisar y Confirmar Pedido</span>
                        <Icon name="arrowRight" size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

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

export default PhasePayment;
