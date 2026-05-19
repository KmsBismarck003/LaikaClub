import React from 'react';
import Icon from '../../../../components/Icons/Icons';

const PaymentMethodItem = ({ 
    id, 
    title, 
    description, 
    icon, 
    active, 
    disabled, 
    badgeText = "PRÓXIMAMENTE", 
    onClick,
    children 
}) => {
    return (
        <div className="payment-method-wrapper">
            <div 
                className={`method-card ${active ? 'active-method' : ''} ${disabled ? 'method-disabled' : ''}`}
                onClick={disabled ? undefined : onClick}
            >
                {/* Visual Glassmorphism Highlight */}
                {active && (
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '96px', height: '96px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none' }} />
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                    {/* Custom Radio Button */}
                    <div className="method-radio-circle">
                        {active && <div className="method-radio-dot animate-scale-up" />}
                    </div>

                    {/* Left Icon / Branding */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {icon}
                    </div>

                    {/* Method Info */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                            {title}
                            {disabled && (
                                <span style={{ fontSize: '8px', fontWeight: '900', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase', marginLeft: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
                                    {badgeText}
                                </span>
                            )}
                        </span>
                        {description && (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Right Extra Icon/Branding */}
                    {id === 'aplazo' && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.8)' }}>
                                aplazo
                            </div>
                            <div style={{ fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                Info <Icon name="info" size={8} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Inner Content (e.g. Card Form or Saved Cards) */}
            {active && children && (
                <div className="method-inner-content animate-slide-down">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodItem;
