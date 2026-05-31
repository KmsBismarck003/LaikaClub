import React from 'react';
import Icon from '../../../components/Icons/Icons';

/**
 * Panel de datos de envío.
 * Solo se muestra si el usuario necesita entrega física
 * (boleto físico o artículos de merch).
 */
const ShippingPanel = ({ shippingData, handleShippingChange, deliveryType }) => {
    const isPickup = deliveryType === 'tienda' || deliveryType === 'recoleccion';

    return (
        <div className="shipping-form-container">
            <p className="shipping-form-intro">
                {isPickup
                    ? 'Déjanos tus datos de contacto para coordinar la recolección.'
                    : 'Ingresa la dirección donde quieres recibir tu pedido.'}
            </p>

            <div className="checkout-form-grid">
                <FormField
                    label="Nombre *"
                    name="nombre"
                    value={shippingData.nombre}
                    onChange={handleShippingChange}
                    placeholder="Nombre"
                    colSpan={1}
                />
                <FormField
                    label="Apellidos *"
                    name="apellidos"
                    value={shippingData.apellidos}
                    onChange={handleShippingChange}
                    placeholder="Apellidos"
                    colSpan={1}
                />
                <FormField
                    label="Correo electrónico *"
                    name="email"
                    type="email"
                    value={shippingData.email}
                    onChange={handleShippingChange}
                    placeholder="correo@ejemplo.com"
                    colSpan={1}
                />
                <FormField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={shippingData.telefono}
                    onChange={handleShippingChange}
                    placeholder="Número de teléfono"
                    prefix="+52"
                    colSpan={1}
                />

                {!isPickup && (
                    <>
                        <FormField
                            label="Calle *"
                            name="calle"
                            value={shippingData.calle}
                            onChange={handleShippingChange}
                            placeholder="Calle o avenida"
                            colSpan={2}
                        />
                        <FormField
                            label="Núm. exterior *"
                            name="numeroExterior"
                            value={shippingData.numeroExterior}
                            onChange={handleShippingChange}
                            placeholder="Núm."
                            colSpan={1}
                        />
                        <FormField
                            label="Código Postal *"
                            name="codigoPostal"
                            value={shippingData.codigoPostal}
                            onChange={handleShippingChange}
                            placeholder="CP"
                            colSpan={1}
                        />
                        <FormField
                            label="Colonia"
                            name="colonia"
                            value={shippingData.colonia}
                            onChange={handleShippingChange}
                            placeholder="Colonia"
                            colSpan={1}
                        />
                        <FormField
                            label="Ciudad *"
                            name="ciudad"
                            value={shippingData.ciudad}
                            onChange={handleShippingChange}
                            placeholder="Ciudad"
                            colSpan={1}
                        />
                    </>
                )}

                <div className="form-field form-field--full">
                    <label className="form-label">Observaciones (opcional)</label>
                    <textarea
                        name="observaciones"
                        value={shippingData.observaciones}
                        onChange={handleShippingChange}
                        placeholder="Instrucciones adicionales de entrega..."
                        rows={2}
                        className="form-input form-textarea"
                    />
                </div>
            </div>
        </div>
    );
};

/* ─── Sub-component: campo de formulario reutilizable ─── */
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

export default ShippingPanel;
