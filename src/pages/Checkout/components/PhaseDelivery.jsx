import React, { useState } from 'react';
import Icon from '../../../components/Icons/Icons';

const PhaseDelivery = ({
    deliveryType,
    setDeliveryType,
    hasMerch,
    needsShippingForm,
    shippingData,
    handleShippingChange,
    savedAddresses = [],
    selectedAddressId,
    setSelectedAddressId,
    saveNewAddress,
    setSaveNewAddress,
    editingAddressId,
    setEditingAddressId,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    onNext,
    onPrev
}) => {
    // Modo edición o creación de dirección
    const isCreatingNew = selectedAddressId === 'new';
    const isEditing = editingAddressId !== null;
    const showForm = isCreatingNew || isEditing;

    const handleStartEdit = (address, e) => {
        e.stopPropagation();
        setEditingAddressId(address.id);
        setSelectedAddressId(address.id);
    };

    const handleCancelEdit = () => {
        setEditingAddressId(null);
        if (selectedAddressId === 'new' && savedAddresses.length > 0) {
            setSelectedAddressId(savedAddresses[0].id);
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar esta dirección guardada?')) {
            removeAddress(id);
            if (selectedAddressId === id) {
                const remaining = savedAddresses.filter(a => a.id !== id);
                setSelectedAddressId(remaining.length > 0 ? remaining[0].id : 'new');
            }
        }
    };

    const handleSetDefault = (id, e) => {
        e.stopPropagation();
        setDefaultAddress(id);
    };

    return (
        <div className="phase-container animate-fade-in">
            <header className="phase-header">
                <div className="phase-header-left">
                    <h2 className="phase-title">Logística de Entrega</h2>
                    <p className="phase-subtitle">
                        Selecciona cómo deseas recibir tus productos físicos y confirma tu dirección de entrega.
                    </p>
                </div>
            </header>

            <div className="delivery-phase-layout">
                {/* ── SECCIÓN A: Método de Envío ── */}
                <section className="phase-sub-section">
                    <h3 className="section-small-heading">
                        <Icon name="truck" size={16} className="heading-icon" />
                        <span>Elige un método de envío</span>
                    </h3>

                    <div className="delivery-options-grid">
                        <DeliveryOptionCard
                            id="standard"
                            title="Envío Estándar a Domicilio"
                            description="Entrega en tu domicilio entre 3 y 5 días hábiles a través de paquetería certificada."
                            price="$99.00 MXN"
                            selected={deliveryType === 'standard'}
                            onSelect={() => setDeliveryType('standard')}
                            icon="truck"
                        />
                        <DeliveryOptionCard
                            id="express"
                            title="Envío Express Prioritorio"
                            description="Entrega urgente en 24 a 48 horas hábiles con monitoreo en tiempo real."
                            price="$129.00 MXN"
                            selected={deliveryType === 'express'}
                            onSelect={() => setDeliveryType('express')}
                            icon="zap"
                        />
                        <DeliveryOptionCard
                            id="tienda"
                            title="Recoger en Taquilla / Punto Oficial"
                            description="Recoge tus artículos el día del evento presentando tu identificación oficial."
                            price="GRATIS"
                            costFree
                            selected={deliveryType === 'tienda'}
                            onSelect={() => setDeliveryType('tienda')}
                            icon="home"
                        />
                    </div>
                </section>

                {/* ── SECCIÓN B: Gestión Inteligente de Direcciones ── */}
                {needsShippingForm && (
                    <section className="phase-sub-section mt-6">
                        <div className="section-header-with-actions">
                            <h3 className="section-small-heading">
                                <Icon name="mapPin" size={16} className="heading-icon" />
                                <span>{deliveryType === 'tienda' ? 'Datos de Contacto y Autorización' : 'Dirección de Envío'}</span>
                            </h3>

                            {!isCreatingNew && !isEditing && savedAddresses.length > 0 && (
                                <button
                                    type="button"
                                    className="add-new-addr-btn"
                                    onClick={() => {
                                        setSelectedAddressId('new');
                                        setEditingAddressId(null);
                                    }}
                                >
                                    <Icon name="plus" size={14} />
                                    <span>Nueva Dirección</span>
                                </button>
                            )}
                        </div>

                        {/* Libreta de Direcciones Guardadas */}
                        {!showForm && savedAddresses.length > 0 && (
                            <div className="saved-addresses-grid">
                                {savedAddresses.map((addr) => {
                                    const isSelected = selectedAddressId === addr.id;
                                    return (
                                        <div
                                            key={addr.id}
                                            className={`address-card-item ${isSelected ? 'address--selected' : ''}`}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="address-card-header">
                                                <div className="address-alias-badge">
                                                    <Icon name="home" size={12} />
                                                    <span>{addr.alias || 'Dirección Guardada'}</span>
                                                    {addr.isDefault && <span className="default-pill">Principal</span>}
                                                </div>
                                                <div className="address-card-actions">
                                                    {!addr.isDefault && (
                                                        <button
                                                            type="button"
                                                            className="addr-action-btn"
                                                            onClick={(e) => handleSetDefault(addr.id, e)}
                                                            title="Hacer dirección principal"
                                                        >
                                                            <Icon name="star" size={13} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="addr-action-btn"
                                                        onClick={(e) => handleStartEdit(addr, e)}
                                                        title="Editar dirección"
                                                    >
                                                        <Icon name="edit2" size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="addr-action-btn danger-hover"
                                                        onClick={(e) => handleDelete(addr.id, e)}
                                                        title="Eliminar dirección"
                                                    >
                                                        <Icon name="trash2" size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="address-card-body">
                                                <p className="recipient-name"><strong>{addr.nombre} {addr.apellidos}</strong></p>
                                                <p className="address-street">{addr.calle} #{addr.numeroExterior}, {addr.colonia || 'Centro'}</p>
                                                <p className="address-city">{addr.ciudad}, CP {addr.codigoPostal} · {addr.region || 'México'}</p>
                                                {addr.telefono && <p className="address-phone">Teléfono: {addr.telefono}</p>}
                                                {addr.email && <p className="address-email">Correo: {addr.email}</p>}
                                            </div>

                                            <div className="address-card-footer">
                                                <div className="radio-select-circle">
                                                    {isSelected && <div className="radio-dot" />}
                                                </div>
                                                <span className="select-status-label">{isSelected ? 'Dirección Seleccionada para Envío' : 'Haz clic para usar esta dirección'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Formulario de Dirección (Crear o Editar) */}
                        {(showForm || savedAddresses.length === 0) && (
                            <div className="address-form-box animate-fade-in">
                                <div className="form-box-header">
                                    <h4>{isEditing ? 'Editar Dirección Guardada' : 'Capturar Nueva Dirección de Envío'}</h4>
                                    {(savedAddresses.length > 0 || isEditing) && (
                                        <button type="button" className="cancel-form-btn" onClick={handleCancelEdit}>
                                            <span>Cancelar y usar guardada</span>
                                            <Icon name="x" size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="checkout-form-grid">
                                    <FormField
                                        label="Alias de dirección"
                                        name="alias"
                                        value={shippingData.alias || ''}
                                        onChange={handleShippingChange}
                                        placeholder="Ej: Mi Casa, Oficina, Departamento"
                                        colSpan={1}
                                    />
                                    <FormField
                                        label="Nombre del destinatario *"
                                        name="nombre"
                                        value={shippingData.nombre || ''}
                                        onChange={handleShippingChange}
                                        placeholder="Nombre(s)"
                                        colSpan={1}
                                    />
                                    <FormField
                                        label="Apellidos *"
                                        name="apellidos"
                                        value={shippingData.apellidos || ''}
                                        onChange={handleShippingChange}
                                        placeholder="Apellidos"
                                        colSpan={1}
                                    />
                                    <FormField
                                        label="Correo electrónico de notificación *"
                                        name="email"
                                        type="email"
                                        value={shippingData.email || ''}
                                        onChange={handleShippingChange}
                                        placeholder="correo@ejemplo.com"
                                        colSpan={1}
                                    />
                                    <FormField
                                        label="Teléfono de contacto para paquetería"
                                        name="telefono"
                                        type="tel"
                                        value={shippingData.telefono || ''}
                                        onChange={handleShippingChange}
                                        placeholder="Número celular de 10 dígitos"
                                        prefix="+52"
                                        colSpan={1}
                                    />

                                    {deliveryType !== 'tienda' && (
                                        <>
                                            <FormField
                                                label="Calle y Número *"
                                                name="calle"
                                                value={shippingData.calle || ''}
                                                onChange={handleShippingChange}
                                                placeholder="Calle, Avenida o Boulevard"
                                                colSpan={1}
                                            />
                                            <FormField
                                                label="Núm. Exterior / Interior *"
                                                name="numeroExterior"
                                                value={shippingData.numeroExterior || ''}
                                                onChange={handleShippingChange}
                                                placeholder="Ej: 104, Depto 302"
                                                colSpan={1}
                                            />
                                            <FormField
                                                label="Código Postal *"
                                                name="codigoPostal"
                                                value={shippingData.codigoPostal || ''}
                                                onChange={handleShippingChange}
                                                placeholder="Código de 5 dígitos"
                                                colSpan={1}
                                            />
                                            <FormField
                                                label="Colonia / Fraccionamiento *"
                                                name="colonia"
                                                value={shippingData.colonia || ''}
                                                onChange={handleShippingChange}
                                                placeholder="Colonia"
                                                colSpan={1}
                                            />
                                            <FormField
                                                label="Ciudad / Municipio *"
                                                name="ciudad"
                                                value={shippingData.ciudad || ''}
                                                onChange={handleShippingChange}
                                                placeholder="Ciudad o Delegación"
                                                colSpan={1}
                                            />
                                            <FormField
                                                label="Estado / Región *"
                                                name="region"
                                                value={shippingData.region || 'México'}
                                                onChange={handleShippingChange}
                                                placeholder="Estado o Provincia"
                                                colSpan={1}
                                            />
                                        </>
                                    )}

                                    <div className="form-field form-field--full">
                                        <label className="form-label">Observaciones e indicaciones adicionales</label>
                                        <textarea
                                            name="observaciones"
                                            value={shippingData.observaciones || ''}
                                            onChange={handleShippingChange}
                                            placeholder="Referencias de entrega: entre qué calles, color de fachada, horarios permitidos..."
                                            rows={2}
                                            className="form-input form-textarea"
                                        />
                                    </div>
                                </div>

                                {isCreatingNew && (
                                    <div className="save-address-option mt-4">
                                        <label className="custom-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={saveNewAddress}
                                                onChange={(e) => setSaveNewAddress(e.target.checked)}
                                            />
                                            <div className="checkbox-indicator">
                                                {saveNewAddress && <Icon name="check" size={12} />}
                                            </div>
                                            <span className="checkbox-text">
                                                <strong>Guardar esta dirección en mi libreta</strong>
                                                <small>Podrás seleccionarla al instante con un solo clic en tus futuras compras.</small>
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* ── Botones de Navegación de Fase ── */}
                <div className="phase-navigation-bar">
                    <button type="button" className="phase-prev-btn" onClick={onPrev}>
                        <Icon name="arrowLeft" size={16} />
                        <span>Volver a Resumen</span>
                    </button>
                    <button type="button" className="phase-next-btn primary-btn-glow" onClick={onNext}>
                        <span>Continuar a Método de Pago</span>
                        <Icon name="arrowRight" size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeliveryOptionCard = ({ id, title, description, price, costFree, selected, onSelect, icon }) => (
    <div
        className={`delivery-option-card ${selected ? 'option--selected' : ''}`}
        onClick={onSelect}
        role="radio"
        aria-checked={selected}
        tabIndex={0}
    >
        <div className="option-icon-box">
            <Icon name={icon || 'truck'} size={20} />
        </div>
        <div className="option-content-box">
            <div className="option-title-row">
                <span className="option-title">{title}</span>
                <span className={`option-price ${costFree ? 'price-free' : ''}`}>{price}</span>
            </div>
            <p className="option-desc">{description}</p>
        </div>
        <div className="option-radio-indicator">
            {selected && <div className="radio-dot" />}
        </div>
    </div>
);

const FormField = ({ label, name, type = 'text', value, onChange, placeholder, prefix, colSpan = 1 }) => (
    <div className={`form-field ${colSpan === 2 ? 'form-field--full' : ''}`}>
        <label className="form-label">{label}</label>
        {prefix ? (
            <div className="form-phone-input">
                <span className="form-phone-prefix">{prefix}</span>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="form-input"
                />
            </div>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-input"
            />
        )}
    </div>
);

export default PhaseDelivery;
