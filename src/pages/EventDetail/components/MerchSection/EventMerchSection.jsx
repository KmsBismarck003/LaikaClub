import React from 'react';
import { Button, Icon } from "../../../../components";
import { MOCK_MERCH } from "../../constants/mockData";

export const MerchProductCard = ({ item, onSelect }) => {
  const [cardColorIdx, setCardColorIdx] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const cardImg = item.colors[cardColorIdx]?.images[0] || '';

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

      {/* Color swatches - below photo, aligned left */}
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-start', marginTop: '2px', paddingLeft: '2px' }} onClick={e => e.stopPropagation()}>
        {item.colors.map((c, ci) => (
          <button
            key={ci}
            title={c.name}
            onClick={e => { e.stopPropagation(); setCardColorIdx(ci); }}
            style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: c.hex.startsWith('linear') ? c.hex : c.hex,
              border: cardColorIdx === ci ? '1.5px solid #fff' : '1.5px solid #444',
              cursor: 'pointer', padding: 0, transition: 'border-color 0.15s', flexShrink: 0
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', flex: 1, textAlign: 'left', paddingLeft: '2px', marginBottom: '0.4rem' }}>
        <h4 style={{ fontSize: '0.48rem', color: '#fff', margin: 0, fontWeight: 700, lineHeight: 1.1 }}>{item.name}</h4>
        <span style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 900 }}>${item.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
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
  merchSize,
  setMerchSize,
  merchQty,
  setMerchQty,
  merchColorIdx,
  setMerchColorIdx,
  merchGalleryIdx,
  setMerchGalleryIdx,
  addToCart,
  success,
  openCart
}) {
  if (!event?.merch_enabled) return null;

  return (
    <>
      <div className="event-merch-section" style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
        <h3 className="section-label-premium" style={{ marginBottom: '1rem' }}>
          <Icon name="shoppingBag" size={16} /> Mercancía Oficial
        </h3>
        <div className="merch-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {MOCK_MERCH.slice(0, 6).map(item => (
              <MerchProductCard
                key={item.id}
                item={item}
                onSelect={(cardColorIdx) => {
                  setSelectedMerchItem(item);
                  setMerchSize('M');
                  setMerchQty(1);
                  setMerchColorIdx(cardColorIdx);
                  setMerchGalleryIdx(0);
                }}
              />
            ))}
        </div>
      </div>

      {/* ── PRODUCT DETAIL MODAL (gallery left + info right) ── */}
      {selectedMerchItem && (() => {
        const activeColor = selectedMerchItem.colors[merchColorIdx] || selectedMerchItem.colors[0];
        const galleryImages = activeColor.images;
        const hasSize = ['Playera','Gorra','Hoodie','Bufanda'].includes(selectedMerchItem.type);
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
              <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '0', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                {/* Main image */}
                <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                  <img
                    src={galleryImages[merchGalleryIdx] || galleryImages[0]}
                    alt={selectedMerchItem.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s' }}
                  />
                </div>
                {/* Thumbnails strip */}
                {galleryImages.length > 1 && (
                  <div style={{ display: 'flex', height: '70px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {galleryImages.map((img, gi) => (
                      <div
                        key={gi}
                        onClick={() => setMerchGalleryIdx(gi)}
                        style={{ flex: 1, overflow: 'hidden', cursor: 'pointer', opacity: merchGalleryIdx === gi ? 1 : 0.45, transition: 'opacity 0.2s', borderRight: gi < galleryImages.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                      >
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Product Info */}
              <div style={{ width: '340px', flexShrink: 0, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px' }}>{selectedMerchItem.type}</span>
                  <h2 style={{ color: '#fff', margin: '0.3rem 0 0', fontWeight: 900, fontSize: '1.25rem', textTransform: 'uppercase', lineHeight: 1.2 }}>{selectedMerchItem.name}</h2>
                  <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, margin: '0.6rem 0 0' }}>
                    ${selectedMerchItem.price.toLocaleString("es-MX")}
                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 400, marginLeft: '6px' }}>MXN</span>
                  </p>
                </div>

                {/* Color selector */}
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.6rem' }}>
                    Color: <span style={{ color: '#fff' }}>{activeColor.name}</span>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedMerchItem.colors.map((c, ci) => (
                      <button
                        key={ci}
                        title={c.name}
                        onClick={() => { setMerchColorIdx(ci); setMerchGalleryIdx(0); }}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: c.hex.startsWith('linear') ? c.hex : c.hex,
                          border: `2px solid ${merchColorIdx === ci ? '#fff' : '#444'}`,
                          cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
                          boxShadow: merchColorIdx === ci ? '0 0 0 3px rgba(255,255,255,0.15)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size selector */}
                {hasSize && (
                  <div>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.6rem' }}>Talla</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['XS','S','M','L','XL','XXL'].map(s => (
                        <button
                          key={s}
                          onClick={() => setMerchSize(s)}
                          style={{
                            minWidth: '44px', height: '44px', padding: '0 8px',
                            border: `1px solid ${merchSize === s ? '#fff' : 'rgba(255,255,255,0.15)'}`,
                            background: merchSize === s ? '#fff' : 'transparent',
                            color: merchSize === s ? '#000' : '#aaa',
                            fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 0.6rem' }}>Cantidad</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    <button
                      onClick={() => setMerchQty(q => Math.max(1, q - 1))}
                      style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}
                    >−</button>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', width: '48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', borderLeft: 'none', borderRight: 'none', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{merchQty}</span>
                    <button
                      onClick={() => setMerchQty(q => q + 1)}
                      style={{ width: '40px', height: '40px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}
                    >+</button>
                    <span style={{ marginLeft: 'auto', color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
                      ${(selectedMerchItem.price * merchQty).toLocaleString("es-MX")}
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
                    const colorLabel = activeColor.name;
                    const sizeLabel = hasSize ? ` | Talla ${merchSize}` : '';
                    addToCart(
                      {
                        id: `merch_${selectedMerchItem.id}_${merchColorIdx}`,
                        name: `${selectedMerchItem.name} (${colorLabel}${sizeLabel})`,
                        price: selectedMerchItem.price,
                        image: activeColor.images[0]
                      },
                      merchQty,
                      null,
                      { id: 'MERCH', name: `MERCH: ${selectedMerchItem.type}`, price: selectedMerchItem.price }
                    );
                    setSelectedMerchItem(null);
                    success(`¡${selectedMerchItem.name} agregado al carrito!`);
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
