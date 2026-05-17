import React from 'react';
import Icon from '../../../components/Icons/Icons';

const Step2_Shipping = ({ 
    formData, 
    shippingMethod, 
    setShippingMethod, 
    setStep, 
    prevStep, 
    nextStep 
}) => {
    const shippingMethods = [
        { id: 'tienda', title: 'Entrega a tienda', icon: 'home', cost: 0, costLabel: 'GRATIS' },
        { id: 'standard', title: 'Envío estándar', icon: 'truck', cost: 99, costLabel: '$99.00' },
        { id: 'recoleccion', title: 'Punto de recolección', icon: 'mapPin', cost: 99, costLabel: '$99.00' },
        { id: 'express', title: 'Envío express', icon: 'zap', cost: 129, costLabel: '$129.00' }
    ];

    return (
        <div className="checkout-step animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="step-header">
                <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>1. DATOS DE FACTURACIÓN</h2>
                <button className="text-blue-500 text-xs font-bold uppercase" onClick={() => setStep(1)}>CAMBIAR</button>
            </div>
            <div className="summary-data mb-12">
                <p className="font-bold">{formData.nombre} {formData.apellidos}</p>
                <p className="uppercase text-xs">{formData.calle}, {formData.numeroExterior}, {formData.colonia}, {formData.codigoPostal}</p>
                <p className="uppercase text-xs">{formData.ciudad}, {formData.region}</p>
                <p className="text-xs">{formData.email}</p>
                <p className="text-xs">{formData.telefono}</p>
            </div>

            <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>2. ¿CÓMO QUIERES RECIBIR EL PEDIDO?</h2>
            <div className="method-list">
                {shippingMethods.map(method => (
                    <div 
                        key={method.id} 
                        className={`method-card ${shippingMethod === method.id ? 'active' : ''}`}
                        onClick={() => setShippingMethod(method.id)}
                    >
                        <div className="radio-circle"></div>
                        <Icon name={method.icon} size={20} />
                        <span className="flex-1 font-bold">{method.title}</span>
                        <span className={`cost ${method.cost === 0 ? 'text-success' : ''}`}>{method.costLabel}</span>
                    </div>
                ))}
            </div>
            <div className="checkout-actions">
                <button className="secondary-btn" style={{ color: '#ffffff', opacity: 1 }} onClick={prevStep}>VOLVER</button>
                <button className="primary-btn" onClick={nextStep}>CONTINUAR AL PAGO</button>
            </div>
        </div>
    );
};

export default Step2_Shipping;
