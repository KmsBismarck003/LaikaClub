import React, { useState, useEffect } from 'react';

const VariantSelector = ({ product, onVariantSelected }) => {
    const schema = product.attributes_schema || {};
    const schemaKeys = Object.keys(schema);
    const variants = product.variants || [];

    // Initialize selection state
    const [selections, setSelections] = useState(() => {
        const initial = {};
        schemaKeys.forEach(key => {
            if (schema[key] && schema[key].length > 0) {
                initial[key] = schema[key][0];
            }
        });
        return initial;
    });

    const [matchedVariant, setMatchedVariant] = useState(null);

    useEffect(() => {
        if (variants.length === 0) {
            onVariantSelected(null, false);
            return;
        }

        // If no attributes schema, default to first variant
        if (schemaKeys.length === 0) {
            const first = variants[0];
            setMatchedVariant(first);
            onVariantSelected(first, first.stock <= 0);
            return;
        }

        // Find variant matching current selections
        const match = variants.find(v => {
            if (!v.attributes) return false;
            return schemaKeys.every(key => {
                const selVal = selections[key]?.toString().toLowerCase();
                const varVal = v.attributes[key]?.toString().toLowerCase();
                return selVal === varVal;
            });
        });

        setMatchedVariant(match || null);
        onVariantSelected(match || null, match ? match.stock <= 0 : true);
    }, [selections, product]);

    const handleSelectChange = (key, val) => {
        setSelections(prev => ({
            ...prev,
            [key]: val
        }));
    };

    if (schemaKeys.length === 0) {
        // No schema, but let's show status of the single variant
        const singleVariant = variants[0];
        const outOfStock = !singleVariant || singleVariant.stock <= 0;
        return (
            <div className="variant-selector-static">
                <span className="stock-badge-static">
                    {outOfStock ? 'AGOTADO' : `DISPONIBLE (${singleVariant.stock} pzas)`}
                </span>
            </div>
        );
    }

    return (
        <div className="product-variant-selector">
            <div className="selectors-container">
                {schemaKeys.map(key => {
                    const options = schema[key] || [];
                    return (
                        <div key={key} className="selector-group">
                            <label className="selector-label">{key.toUpperCase()}</label>
                            <div className="selector-options">
                                {options.map(opt => (
                                    <button
                                        key={opt}
                                        className={`selector-option-btn ${selections[key] === opt ? 'active' : ''}`}
                                        onClick={() => handleSelectChange(key, opt)}
                                        type="button"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="variant-status-display">
                {matchedVariant ? (
                    <div className="variant-detail-info">
                        <span className="variant-price-display">${parseFloat(matchedVariant.price).toFixed(2)}</span>
                        <span className={`stock-badge ${matchedVariant.stock <= 0 ? 'out-of-stock' : 'in-stock'}`}>
                            {matchedVariant.stock <= 0 ? 'AGOTADO' : `Disponible: ${matchedVariant.stock} pzas`}
                        </span>
                    </div>
                ) : (
                    <div className="variant-detail-info">
                        <span className="stock-badge out-of-stock">OPCION NO DISPONIBLE</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VariantSelector;
