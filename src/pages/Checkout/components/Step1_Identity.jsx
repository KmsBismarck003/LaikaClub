import React from 'react';

const Step1_Identity = ({ formData, handleInputChange, nextStep }) => {
    return (
        <div className="checkout-step animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="step-title" style={{ color: '#ffffff', opacity: 1 }}>1. ¿PARA QUIÉN ES EL PEDIDO?</h2>
            <div className="checkout-form">
                <div className="form-row">
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Nombre *</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Apellidos *</label>
                        <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} placeholder="Apellidos" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group flex-[2]">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Calle o cerrada *</label>
                        <input type="text" name="calle" value={formData.calle} onChange={handleInputChange} placeholder="Calle o cerrada" />
                    </div>
                    <div className="form-group flex-1">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Número exterior *</label>
                        <input type="text" name="numeroExterior" value={formData.numeroExterior} onChange={handleInputChange} placeholder="Número exterior" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Código Postal *</label>
                        <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} placeholder="Código Postal" />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Colonia *</label>
                        <input type="text" name="colonia" value={formData.colonia} onChange={handleInputChange} placeholder="Colonia" />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Ciudad *</label>
                        <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} placeholder="Ciudad" />
                    </div>
                    <div className="form-group">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Región *</label>
                        <select name="region" value={formData.region} onChange={handleInputChange}>
                            <option value="México">México</option>
                        </select>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Correo electrónico *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Correo electrónico" />
                    </div>
                    <div className="form-group flex-1">
                        <label style={{ color: '#ffffff', opacity: 1 }}>Número de teléfono *</label>
                        <div className="phone-input">
                            <span className="prefix">+52</span>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Número de teléfono" />
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label style={{ color: '#ffffff', opacity: 1 }}>Observaciones para la entrega (opcional)</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Observaciones para la entrega"></textarea>
                </div>
                <div className="form-checkbox">
                    <input type="checkbox" id="newsletter" name="newsletter" checked={formData.newsletter} onChange={handleInputChange} />
                    <label htmlFor="newsletter" style={{ color: '#ffffff', opacity: 1 }}>Quiero suscribirme al Newsletter</label>
                </div>
                <button className="primary-btn mt-8" onClick={nextStep}>GUARDAR Y CONTINUAR</button>
            </div>
        </div>
    );
};

export default Step1_Identity;
