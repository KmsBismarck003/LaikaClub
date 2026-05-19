import React from 'react';
import Icon from '../../../../components/Icons/Icons';

const SavedCardsSection = ({ 
    savedCards = [], 
    selectedSavedCard, 
    onSelectCard, 
    onSelectNewCard,
    onDeleteCard 
}) => {
    // Helper to identify Visa vs MasterCard (or default)
    const getCardBrand = (number = '') => {
        if (number.includes('4') || number.toLowerCase().includes('visa')) return 'VISA';
        if (number.includes('5') || number.toLowerCase().includes('master')) return 'MASTERCARD';
        return 'CARD';
    };

    return (
        <div className="saved-cards-section">
            <h3 className="saved-cards-title">
                <Icon name="creditCard" size={14} style={{ color: '#6366f1' }} />
                Tus tarjetas guardadas
            </h3>

            <div className="saved-cards-grid">
                {savedCards.map(card => {
                    const brand = getCardBrand(card.number);
                    const isSelected = selectedSavedCard === card.id;

                    return (
                        <div 
                            key={card.id}
                            className={`saved-card-item ${isSelected ? 'selected-card' : ''}`}
                            onClick={() => onSelectCard(card.id)}
                        >
                            {/* Card Chip Visual */}
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.12 }}>
                                <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
                                    <rect width="36" height="26" rx="4" fill="white" />
                                    <path d="M0 8H36M0 18H36M12 0V26M24 0V26" stroke="black" strokeWidth="0.5" />
                                </svg>
                            </div>

                            {/* Card Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Método de pago</span>
                                        <span className="card-brand-label">
                                            {brand === 'VISA' ? 'Visa Débito / Crédito' : brand === 'MASTERCARD' ? 'Mastercard' : 'Tarjeta Guardada'}
                                        </span>
                                    </div>
                                    
                                    {/* Delete Button */}
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Avoid selecting card when deleting
                                            if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
                                                onDeleteCard(card.id);
                                            }
                                        }}
                                        className="card-trash-btn"
                                        title="Eliminar tarjeta"
                                    >
                                        <Icon name="trash2" size={14} />
                                    </button>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <span className="card-number-display">
                                        {card.number}
                                    </span>
                                    
                                    <div className="card-meta-row">
                                        <span className="card-holder-name">{card.holder || 'Titular de la tarjeta'}</span>
                                        <span>EXP: {card.expiry}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Radio Circle Overlay */}
                            <div className="saved-card-radio">
                                {isSelected && <div className="saved-card-radio-dot animate-scale-up" />}
                            </div>
                        </div>
                    );
                })}

                {/* Add New Card Button */}
                <div 
                    onClick={onSelectNewCard}
                    className={`add-card-slot ${!selectedSavedCard ? 'active-slot' : ''}`}
                >
                    <div className="add-card-icon-circle">
                        <Icon name="plus" size={16} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usar nueva tarjeta</span>
                    <p style={{ fontSize: '10px', opacity: 0.6, margin: '2px 0 0 0' }}>Ingresa datos de otra tarjeta de crédito o débito</p>
                </div>
            </div>
        </div>
    );
};

export default SavedCardsSection;
