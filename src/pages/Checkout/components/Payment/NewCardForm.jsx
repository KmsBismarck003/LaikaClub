import React, { useState } from 'react';
import Icon from '../../../../components/Icons/Icons';

const NewCardForm = ({ cardData, handleCardChange }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Auto formatting handlers
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
        }
        return v;
    };

    const onInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiry') {
            formattedValue = formatExpiry(value);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/[^0-9]/gi, '').slice(0, 4);
        } else if (name === 'name') {
            formattedValue = value.replace(/[^a-zA-Z\s]/gi, '').toUpperCase();
        }

        handleCardChange({ target: { name, value: formattedValue } });
    };

    // Detect card brand for mock card preview
    const detectCardBrand = (num = '') => {
        const digits = num.replace(/\D/g, '');
        if (digits.startsWith('4')) return 'VISA';
        if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
        if (/^3[47]/.test(digits)) return 'AMERICANEXPRESS';
        return 'UNKNOWN';
    };

    const cardBrand = detectCardBrand(cardData.number || '');

    return (
        <div className="new-card-form-grid">
            
            {/* Dynamic 3D Credit Card Mockup Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                <div className={`mockup-card-wrapper ${isFlipped ? 'flipped' : ''}`}>
                    <div className="mockup-card-inner">
                        
                        {/* Front of the Card */}
                        <div className="mockup-card-front">
                            {/* Visual glowing aura */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent, transparent)', pointerEvents: 'none', borderRadius: '14px' }} />
                            
                            {/* Card Chip & Network Brand */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                                {/* Chip */}
                                <div style={{ width: '44px', height: '32px', background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', borderRadius: '6px', relative: 'overflow-hidden', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33%', right: '33%', borderLeft: '1px solid rgba(0,0,0,0.15)', borderRight: '1px solid rgba(0,0,0,0.15)' }} />
                                    <div style={{ position: 'absolute', left: 0, right: 0, top: '33%', bottom: '33%', borderTop: '1px solid rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(0,0,0,0.15)' }} />
                                </div>

                                {/* Network Logo */}
                                <div style={{ height: '32px', display: 'flex', alignItems: 'center', zIndex: 10, color: '#ffffff', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.05em' }}>
                                    {cardBrand === 'VISA' && (
                                        <span style={{ color: '#60a5fa', fontFamily: 'serif', fontSize: '18px', letterSpacing: 'normal' }}>VISA</span>
                                    )}
                                    {cardBrand === 'MASTERCARD' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.9)' }} />
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.8)', marginLeft: '-12px' }} />
                                        </div>
                                    )}
                                    {cardBrand === 'AMERICANEXPRESS' && (
                                        <span style={{ color: '#22d3ee', fontSize: '10px', padding: '2px 6px', border: '1px solid rgba(34, 211, 238, 0.4)', borderRadius: '4px' }}>AMEX</span>
                                    )}
                                    {cardBrand === 'UNKNOWN' && (
                                        <Icon name="creditCard" size={22} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    )}
                                </div>
                            </div>

                            {/* Card Number */}
                            <div style={{ fontSize: '18px', fontFamily: 'monospace', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.95)', zIndex: 10, padding: '1rem 0', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                {cardData.number || '•••• •••• •••• ••••'}
                            </div>

                            {/* Cardholder Name & Expiry */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '70%' }}>
                                    <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Titular de la tarjeta</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {cardData.name || 'NOMBRE COMPLETO'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                    <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Vence</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)' }}>
                                        {cardData.expiry || 'MM/YY'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Back of the Card */}
                        <div className="mockup-card-back">
                            {/* Magnetic Strip */}
                            <div style={{ width: '100%', height: '40px', backgroundColor: 'rgba(0,0,0,0.85)', marginTop: '8px' }} />

                            {/* Signature and CVV container */}
                            <div style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Firma Autorizada</span>
                                    <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Código CVV</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {/* White signature box */}
                                    <div style={{ flexGrow: 1, height: '34px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                                        <div style={{ width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'linear-gradient(45deg, transparent 45%, #ffffff 45%, #ffffff 55%, transparent 55%)', backgroundSize: '10px 10px' }} />
                                    </div>
                                    {/* CVV digits */}
                                    <div style={{ width: '50px', height: '30px', backgroundColor: '#fbbf24', color: '#000000', fontFamily: 'monospace', fontWeight: '900', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', fontSize: '13px' }}>
                                        {cardData.cvv || '•••'}
                                    </div>
                                </div>
                            </div>

                            {/* Safe/Encrypted Badge */}
                            <div style={{ padding: '0 1.25rem', fontSize: '8px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                <Icon name="lock" size={8} />
                                Conexión Cifrada SSL de Alta Seguridad de 256 bits
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Fields (7 columns) */}
            <div className="new-card-fields-wrapper">
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Número de Tarjeta
                    </label>
                    <div className="new-card-input-container">
                        <span className="new-card-input-icon">
                            <Icon name="creditCard" size={16} />
                        </span>
                        <input 
                            type="text" 
                            name="number" 
                            value={cardData.number || ''} 
                            onChange={onInputChange} 
                            placeholder="0000 0000 0000 0000" 
                            maxLength="19" 
                            className="new-card-input-field"
                            required
                        />
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Nombre en la Tarjeta
                    </label>
                    <div className="new-card-input-container">
                        <span className="new-card-input-icon">
                            <Icon name="user" size={16} />
                        </span>
                        <input 
                            type="text" 
                            name="name" 
                            value={cardData.name || ''} 
                            onChange={onInputChange} 
                            placeholder="COMO APARECE EN LA TARJETA" 
                            className="new-card-input-field"
                            required
                        />
                    </div>
                </div>

                <div className="new-card-fields-row">
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Vencimiento
                        </label>
                        <input 
                            type="text" 
                            name="expiry" 
                            value={cardData.expiry || ''} 
                            onChange={onInputChange} 
                            placeholder="MM/YY" 
                            maxLength="5" 
                            className="new-card-input-field"
                            required
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            CVV
                        </label>
                        <input 
                            type="password" 
                            name="cvv" 
                            value={cardData.cvv || ''} 
                            onChange={onInputChange} 
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)}
                            placeholder="123" 
                            maxLength="4" 
                            className="new-card-input-field"
                            required
                        />
                    </div>
                </div>

                {/* Checkbox: Save Card */}
                <div style={{ paddingTop: '8px' }}>
                    <label className="new-card-checkbox-label">
                        <input 
                            type="checkbox" 
                            name="saveCard" 
                            checked={cardData.saveCard || false} 
                            onChange={(e) => handleCardChange({ target: { name: 'saveCard', value: e.target.checked }})} 
                        />
                        <div className="new-card-checkbox-custom">
                            {cardData.saveCard && (
                                <span className="new-card-checkbox-check">
                                    <Icon name="check" size={12} style={{ strokeWidth: '3px' }} />
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', userSelect: 'none' }}>
                            Guardar esta tarjeta para futuras compras de manera segura
                        </span>
                    </label>
                </div>
            </div>

        </div>
    );
};

export default NewCardForm;
