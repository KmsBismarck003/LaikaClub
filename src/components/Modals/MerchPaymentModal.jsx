import React, { useState } from 'react';
import { CreditCard, ShieldCheck, ShoppingBag, X, Loader2 } from 'lucide-react';
import './MerchPaymentModal.css';

const MerchPaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
    const [step, setStep] = useState('form'); // form, processing, success
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    if (!isOpen) return null;

    const handlePayment = (e) => {
        e.preventDefault();
        setStep('processing');
        
        // Simular procesamiento Spark de seguridad y pago
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
            }, 2000);
        }, 3000);
    };

    return (
        <div className="merch-modal-overlay">
            <div className="merch-modal-card glassmorphism page-transition">
                <button className="close-btn" onClick={onClose}><X size={20}/></button>

                {step === 'form' && (
                    <div className="modal-content">
                        <div className="modal-header">
                            <ShoppingBag className="header-icon" />
                            <h2>Activación E-Commerce</h2>
                            <p>Licencia para el Módulo de Mercancía Oficial</p>
                        </div>
                        
                        <div className="payment-summary">
                            <span>Monto a pagar:</span>
                            <span className="price-tag">$49.00 USD <small>/ pago único</small></span>
                        </div>

                        <form onSubmit={handlePayment} className="payment-form">
                            <div className="form-group">
                                <label>Número de Tarjeta</label>
                                <div className="input-with-icon">
                                    <CreditCard size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000" 
                                        required 
                                        maxLength="19"
                                        value={cardData.number}
                                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Vencimiento</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        required 
                                        maxLength="5"
                                        value={cardData.expiry}
                                        onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input 
                                        type="password" 
                                        placeholder="***" 
                                        required 
                                        maxLength="3"
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nombre en el Plástico</label>
                                <input 
                                    type="text" 
                                    placeholder="NOMBRE COMPLETO" 
                                    required 
                                    value={cardData.name}
                                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="laika-btn primary full-width py-4">
                                PAGAR Y ACTIVAR AHORA
                            </button>
                            
                            <div className="secure-badge">
                                <ShieldCheck size={14} />
                                <span>SSL Encriptación Industrial (Spark Pay)</span>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="modal-content processing-state">
                        <Loader2 size={64} className="animate-spin text-white mb-4" />
                        <h3>Verificando Pago</h3>
                        <p className="opacity-60">Sincronizando con la red bancaria central...</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="modal-content success-state">
                        <div className="success-circle">
                            <ShieldCheck size={48} />
                        </div>
                        <h3>¡Módulo Activado!</h3>
                        <p>Tu tienda de mercancía ya está lista para usarse.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchPaymentModal;
