import React from 'react';
import Icon from '../../../../components/Icons/Icons';

const DirectPaymentButton = ({ 
    onClick, 
    processing, 
    disabled, 
    totalAmount 
}) => {
    return (
        <button 
            type="button"
            onClick={onClick}
            disabled={processing || disabled}
            className="direct-payment-btn"
        >
            {/* Glossy Reflective overlay */}
            {!processing && !disabled && (
                <div className="btn-shine-overlay" />
            )}

            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                <Icon 
                    name={processing ? "loader" : "shieldCheck"} 
                    size={18} 
                    className={processing ? "animate-spin" : ""} 
                    style={{ color: '#ffffff' }} 
                />
                <span>
                    {processing 
                        ? 'PROCESANDO PAGO SEGURO...' 
                        : `PROCEDER CON EL PAGO DIRECTO ($${parseFloat(totalAmount).toFixed(2)})`}
                </span>
            </span>
        </button>
    );
};

export default DirectPaymentButton;
