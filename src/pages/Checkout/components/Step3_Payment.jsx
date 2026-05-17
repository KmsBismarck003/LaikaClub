import React from 'react';
import Icon from '../../../components/Icons/Icons';
import { useCart } from '../../../context/CartContext';

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
    const { savedCards } = useCart();
    return (
        <div className="checkout-step animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="step-header">
                <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>1. DATOS DE FACTURACIÓN</h2>
                <button className="text-blue-500 text-xs font-bold uppercase" onClick={() => setStep(1)}>CAMBIAR</button>
            </div>
            <div className="summary-data mb-6" style={{ background: '#0c0c0e', borderColor: '#27272a' }}>
                <p className="text-xs uppercase font-bold" style={{ color: '#ffffff' }}>{formData.nombre} {formData.apellidos}</p>
            </div>

            <div className="step-header">
                <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>2. MÉTODO DE ENVÍO</h2>
                <button className="text-blue-500 text-xs font-bold uppercase" onClick={() => setStep(2)}>CAMBIAR</button>
            </div>
            <div className="summary-data mb-12" style={{ background: '#0c0c0e', borderColor: '#27272a' }}>
                <p className="text-xs uppercase font-bold" style={{ color: '#ffffff' }}>
                    {shippingMethod === 'tienda' ? 'Entrega a tienda' : shippingMethod === 'express' ? 'Envío Express' : 'Envío Estándar'}
                </p>
            </div>

            <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>3. ¿CÓMO QUIERES PAGAR?</h2>
            <div className="method-list">
                <div 
                    className={`method-card h-auto py-6 ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                >
                    <div className="radio-circle"></div>
                    <div className="flex-1">
                        <span className="font-bold block mb-1">Con tarjeta de crédito o débito</span>
                        <div className="flex gap-2 items-center">
                             <svg width="30" height="20" viewBox="0 0 30 20"><rect width="30" height="20" rx="3" fill="#1A1F71"/><path d="M11 13l1-5h2l-1 5h-2zm7-5c-.6 0-1 .2-1.3.6l-.2-.5h-1.6l1.2 5h1.8l.2-1.3h2l.1 1.3h1.8l-.8-5h-1.3zm.2 1.3h-.7l.2 1.3h.6l-.1-1.3z" fill="white"/></svg>
                             <svg width="30" height="20" viewBox="0 0 30 20"><rect width="30" height="20" rx="3" fill="#EB001B"/><circle cx="12" cy="10" r="7" fill="#EB001B"/><circle cx="18" cy="10" r="7" fill="#F79E1B" fillOpacity="0.8"/></svg>
                        </div>
                    </div>
                </div>

                {paymentMethod === 'card' && (
                    <div className="card-form animate-in fade-in slide-in-from-top-2 duration-300 p-6 bg-secondary/5 border border-white/10 rounded-lg mt-2 mb-4">
                        {savedCards && savedCards.length > 0 && (
                            <div className="saved-cards-list mb-4">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', opacity: 0.8 }}>Tarjetas Guardadas</label>
                                {savedCards.map(card => (
                                    <div 
                                        key={card.id} 
                                        onClick={() => handleCardChange({ target: { name: 'selectedSavedCard', value: card.id } })}
                                        style={{ 
                                            padding: '12px', 
                                            border: cardData.selectedSavedCard === card.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '8px', 
                                            marginBottom: '8px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            background: cardData.selectedSavedCard === card.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <span>{card.number}</span>
                                        <span>{card.expiry}</span>
                                    </div>
                                ))}
                                <div 
                                    onClick={() => handleCardChange({ target: { name: 'selectedSavedCard', value: null } })}
                                    style={{ 
                                        padding: '12px', 
                                        border: !cardData.selectedSavedCard ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                        background: !cardData.selectedSavedCard ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                    }}
                                >
                                    <span>Usar nueva tarjeta</span>
                                </div>
                            </div>
                        )}

                        {!cardData.selectedSavedCard && (
                            <>
                                <div className="form-group mb-4">
                                    <label>Número de Tarjeta</label>
                                    <input type="text" name="number" value={cardData.number} onChange={handleCardChange} placeholder="0000 0000 0000 0000" maxLength="16" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vencimiento</label>
                                        <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" maxLength="5" />
                                    </div>
                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="123" maxLength="3" />
                                    </div>
                                </div>
                                <div className="form-group mt-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="saveCard" 
                                        name="saveCard" 
                                        checked={cardData.saveCard || false} 
                                        onChange={(e) => handleCardChange({ target: { name: 'saveCard', value: e.target.checked }})} 
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    <label htmlFor="saveCard" style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                                        Guardar esta tarjeta para futuras compras
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div 
                    className={`method-card h-auto py-6 ${paymentMethod === 'aplazo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('aplazo')}
                >
                    <div className="radio-circle"></div>
                    <div className="flex-1">
                        <span className="font-bold block mb-1">A meses con Aplazo</span>
                        <p className="text-[10px]">Compra ahora y paga en 5 plazos quincenales. Sin tarjeta.</p>
                    </div>
                    <div className="text-right">
                        <div className="font-black text-sm">aplazo</div>
                        <div className="text-[8px] flex items-center justify-end gap-1">Más info <Icon name="info" size={10} /></div>
                    </div>
                </div>

                <div 
                    className={`method-card h-auto py-6 ${paymentMethod === 'oxxo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('oxxo')}
                >
                    <div className="radio-circle"></div>
                    <div className="flex-1">
                        <span className="font-bold block mb-1">En efectivo con Oxxo</span>
                        <p className="text-[10px]">Recuerda que tienes 24 horas para realizar el pago.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="px-2 py-1 bg-red-600 rounded text-white font-black text-[10px]">OXXO</div>
                        <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black italic rounded text-white">PAY</span>
                    </div>
                </div>

                <div 
                    className={`method-card h-auto py-6 ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                >
                    <div className="radio-circle"></div>
                    <div className="flex-1">
                        <span className="font-bold block mb-1">En efectivo</span>
                        <p className="text-[10px]">Recuerda que tienes 24 horas para realizar el pago.</p>
                    </div>
                    <div className="flex gap-3 items-center">
                         <img src="https://iconape.com/wp-content/png_logo_vector/farmacias-del-ahorro-logo.png" alt="FA" className="h-5 brightness-0 invert" />
                         <img src="https://www.vectorlogo.zone/logos/walmart/walmart-ar21.svg" alt="Walmart" className="h-4" />
                    </div>
                </div>
            </div>
            <div className="checkout-actions">
                <button 
                    className="secondary-btn disabled:opacity-30" 
                    style={{ color: '#ffffff', opacity: 1 }}
                    onClick={prevStep}
                    disabled={processing}
                >
                    VOLVER
                </button>
                <button 
                    className={`primary-btn ${processing ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleFinalPayment}
                    disabled={processing}
                >
                    {processing ? 'PROCESANDO...' : 'CONTINUAR CON EL PAGO'}
                </button>
            </div>
        </div>
    );
};

export default Step3_Payment;
