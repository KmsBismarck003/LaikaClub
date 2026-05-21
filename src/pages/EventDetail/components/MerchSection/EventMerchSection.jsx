import React, { useState, useEffect } from 'react';
import { Button, Icon } from "../../../../components";
import { merchService } from "../../../../services/merch.service";
import { useCart } from "../../../../context/CartContext";
import { useNotification } from "../../../../context/NotificationContext";

export const MerchProductCard = ({ item, onSelect }) => {
  const [cardColorIdx, setCardColorIdx] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  // Adapt to real schema: item.image_url instead of nested colors.images
  const cardImg = item.image_url || '';
  const price = item.variants?.[0]?.price || 0;


  return (
    <div
      className="merch-product-card"
      style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      onClick={() => onSelect(cardColorIdx)}
      onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'}
      onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}
    >
      {/* Photo Container */}
      <div style={{ width: '100%', aspectRatio: '1/1', background: '#111', overflow: 'hidden', position: 'relative' }}>
        <img src={cardImg} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, transition: 'opacity 0.3s' }} />
        
        {/* NEW Badge */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#22c55e', color: '#000', fontSize: '0.4rem', fontWeight: 900, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          NEW
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 10 }}
        >
          <Icon name="heart" size={18} fill={isFavorite ? "#ff4444" : "none"} stroke={isFavorite ? "#ff4444" : "#fff"} style={{ opacity: 1, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }} />
        </button>
      </div>

      {/* Color swatches omitted for simplicity, real schema might not have nested colors array */}


      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1, textAlign: 'left', paddingLeft: '2px', marginBottom: '0.4rem' }}>
        <h4 style={{ fontSize: '0.48rem', color: '#fff', margin: 0, fontWeight: 700, lineHeight: 1.1 }}>{item.name}</h4>
        <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 900 }}>${parseFloat(price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
      </div>

      {/* AGREGAR Button */}
      <button
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.42rem', fontWeight: 900, padding: '10px 0', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto', borderRadius: '6px', backdropFilter: 'blur(4px)' }}
        onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
        onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      >
        AGREGAR AL CARRITO
      </button>
    </div>
  );
};

export default function EventMerchSection({
  event,
  selectedMerchItem,
  setSelectedMerchItem,
  merchAttributes,
  setMerchAttributes,
  merchQty,
  setMerchQty,
  addToCart: propAddToCart,
  success: propSuccess,
  openCart: propOpenCart
}) {
  const [merchItems, setMerchItems] = useState([]);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const { addToCart: hookAddToCart, openCart: hookOpenCart } = useCart();
  const { success: hookSuccess } = useNotification();

  const addToCart = (typeof propAddToCart === 'function') ? propAddToCart : hookAddToCart;
  const openCart = (typeof propOpenCart === 'function') ? propOpenCart : hookOpenCart;
  const success = (typeof propSuccess === 'function') ? propSuccess : hookSuccess;

  useEffect(() => {
    if (event?.id && event?.merch_enabled) {
      merchService.getAllMerchandise(null, 'published', event.id, 'approved')
        .then(data => setMerchItems(data || []))
        .catch(console.error);
    }
  }, [event]);

  if (!event?.merch_enabled || merchItems.length === 0) return null;

  return (
    <>
      <div className="event-merch-section" style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
        <h3 className="section-label-premium" style={{ marginBottom: '1rem' }}>
          <Icon name="shoppingBag" size={16} /> Laika Shop
        </h3>
        <div className="merch-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {merchItems.slice(0, 6).map(item => (
              <MerchProductCard
                key={item.id}
                item={{...item, image_url: item.image_url ? item.image_url.split(',')[0] : ''}}
                onSelect={() => {
                  setSelectedMerchItem(item);
                  setGalleryIdx(0);
                  
                  // Initialize default attributes based on schema
                  const defaultAttrs = {};
                  if (item.attributes_schema) {
                    Object.entries(item.attributes_schema).forEach(([key, values]) => {
                       if (values && values.length > 0) defaultAttrs[key] = values[0];
                    });
                  }
                  setMerchAttributes(defaultAttrs);
                  setMerchQty(1);
                }}
              />
            ))}
        </div>
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {selectedMerchItem && (() => {
        const galleryImages = selectedMerchItem.image_url ? selectedMerchItem.image_url.split(',') : [];
        
        // Find matching variant
        let activeVariant = selectedMerchItem.variants?.[0];
        if (selectedMerchItem.variants && selectedMerchItem.attributes_schema) {
            activeVariant = selectedMerchItem.variants.find(v => {
                if (!v.attributes) return false;
                for (const key in merchAttributes) {
                    if (v.attributes[key] !== merchAttributes[key]) return false;
                }
                return true;
            }) || activeVariant;
        }
        
        const activePrice = activeVariant?.price || 0;
        
        return (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setSelectedMerchItem(null)}
          >
            <div
              className="glass-card"
              style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '24px', width: '860px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', position: 'relative', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={() => setSelectedMerchItem(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

              {/* LEFT — Image Gallery */}
              <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '0', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', padding: '1.5rem', alignItems: 'center' }}>
                <div 
                   style={{ width: '100%', flex: 1, overflow: 'hidden', borderRadius: '16px', position: 'relative', cursor: 'zoom-in', background: '#000' }}
                   onMouseMove={(e) => {
                     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                     const x = ((e.clientX - left) / width) * 100;
                     const y = ((e.clientY - top) / height) * 100;
                     const img = e.currentTarget.querySelector('img');
                     if (img) {
                       img.style.transformOrigin = `${x}% ${y}%`;
                       img.style.transform = 'scale(2.2)';
                     }
                   }}
                   onMouseLeave={(e) => {
                     const img = e.currentTarget.querySelector('img');
                     if (img) {
                       img.style.transformOrigin = 'center center';
                       img.style.transform = 'scale(1)';
                     }
                   }}
                >
                  <img
                    src={galleryImages[galleryIdx] || ''}
                    alt={selectedMerchItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.1s ease-out' }}
                  />
                </div>
                {galleryImages.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setGalleryIdx(idx)}
                        style={{ 
                           width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0,
                           border: galleryIdx === idx ? '2px solid #fff' : '2px solid transparent',
                           cursor: 'pointer', background: '#000', padding: 0, transition: 'all 0.2s'
                        }}
                      >
                         <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: galleryIdx === idx ? 1 : 0.6 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Product Info */}
              <div style={{ width: '340px', flexShrink: 0, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px' }}>{selectedMerchItem.category || 'MERCANCÍA'}</span>
                  <h2 style={{ color: '#fff', margin: '0.3rem 0 0', fontWeight: 900, fontSize: '1.25rem', textTransform: 'uppercase', lineHeight: 1.2 }}>{selectedMerchItem.name}</h2>
                  <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, margin: '0.6rem 0 0' }}>
                    ${parseFloat(activePrice).toLocaleString("es-MX")}
                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 400, marginLeft: '6px' }}>MXN</span>
                  </p>
                  
                  {selectedMerchItem.description && (
                     <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.8rem', lineHeight: 1.4 }}>
                        {selectedMerchItem.description}
                     </p>
                  )}
                </div>

                {/* Dynamic Attributes */}
                {selectedMerchItem.attributes_schema && Object.entries(selectedMerchItem.attributes_schema).map(([attrName, attrValues]) => (
                  <div key={attrName}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.6rem' }}>{attrName}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {attrValues.map(val => {
                        const isSelected = merchAttributes[attrName] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => setMerchAttributes(prev => ({ ...prev, [attrName]: val }))}
                            style={{
                              minWidth: '44px', height: '44px', padding: '0 12px',
                              border: `1px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.15)'}`,
                              background: isSelected ? '#fff' : 'transparent',
                              color: isSelected ? '#000' : '#aaa',
                              fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >{val}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Logistics */}
                {selectedMerchItem.delivery_methods && selectedMerchItem.delivery_methods.length > 0 && (
                   <div>
                       <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.6rem' }}>Entrega</p>
                       <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {selectedMerchItem.delivery_methods.includes('PICKUP_AT_EVENT') && (
                              <span style={{ fontSize: '0.7rem', color: '#fff', background: 'rgba(34, 197, 94, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.5)' }}>Recoger en Evento</span>
                          )}
                          {selectedMerchItem.delivery_methods.includes('HOME_DELIVERY') && (
                              <span style={{ fontSize: '0.7rem', color: '#fff', background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.5)' }}>Envío a Domicilio</span>
                          )}
                       </div>
                   </div>
                )}

                {/* Quantity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0' }}>Cantidad</p>
                    {selectedMerchItem.max_per_person && (
                        <p style={{ fontSize: '0.55rem', color: '#ffaa00', margin: 0, fontWeight: 700 }}>MÁX. {selectedMerchItem.max_per_person} POR PERSONA</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    <button
                      onClick={() => setMerchQty(q => Math.max(1, q - 1))}
                      style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}
                    >−</button>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', width: '48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', borderLeft: 'none', borderRight: 'none', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{merchQty}</span>
                    <button
                      onClick={() => {
                        const limit = selectedMerchItem.max_per_person || 99;
                        setMerchQty(q => Math.min(limit, q + 1));
                      }}
                      style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}
                    >+</button>
                    <span style={{ marginLeft: 'auto', color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
                      ${(activePrice * merchQty).toLocaleString("es-MX")}
                    </span>
                  </div>
                </div>

                {/* Add to cart */}
                <Button
                  variant="primary"
                  fullWidth
                  size="large"
                  style={{ fontWeight: 900, letterSpacing: '2px', marginTop: 'auto' }}
                  onClick={() => {
                    const attrsLabel = Object.entries(merchAttributes).map(([k,v]) => `${v}`).join(' | ');
                    const nameLabel = attrsLabel ? `${selectedMerchItem.name} (${attrsLabel})` : selectedMerchItem.name;
                    
                    addToCart(
                      {
                        id: `merch_${activeVariant?.id || selectedMerchItem.id}`,
                        variant_id: activeVariant?.id,
                        name: nameLabel,
                        price: activePrice,
                        image: selectedMerchItem.image_url,
                        isMerch: true
                      },
                      merchQty,
                      null,
                      { id: 'MERCH', name: `LAIKA SHOP: ${selectedMerchItem.category || 'MERCANCÍA'}`, price: activePrice }
                    );
                    setSelectedMerchItem(null);
                    success(`¡${nameLabel} agregado al carrito!`);
                    openCart();
                  }}
                >
                  AÑADIR AL CARRITO
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

