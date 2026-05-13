import React from 'react';
import Icon from '../../../components/Icons';

const CheckoutHeader = ({ step }) => {
    return (
        <header className="checkout-main-header">
            <div className="steps-indicator">
                <span className={step >= 1 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>DATOS</span>
                <Icon name="chevronRight" size={14} />
                <span className={step >= 2 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>ENVÍO</span>
                <Icon name="chevronRight" size={14} />
                <span className={step >= 3 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>PAGO</span>
            </div>
        </header>
    );
};

export default CheckoutHeader;
