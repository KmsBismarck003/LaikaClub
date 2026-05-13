import React from 'react';
import { Accordion, Icon } from "../../../../components";
import { useCart } from "../../../../context/CartContext";
import "./MerchProductModal.css";

export default function MerchProductModal({
  selectedMerchItem,
  setSelectedMerchItem,
  merchColorIdx,
  merchGalleryIdx,
  setMerchGalleryIdx,
  merchSize,
  setMerchSize,
  navigate
}) {
  const { addMerchToCart, openCart } = useCart();
  
  // ZOOM LUPA LOGIC - Hooks must be before any returns
  const [showMagnifier, setShowMagnifier] = React.useState(false);
  const [magnifierPos, setMagnifierPos] = React.useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [[stageW, stageH], setStageSize] = React.useState([0, 0]);
  const imgRef = React.useRef(null);
  const zoomLevel = 3;

  if (!selectedMerchItem) return null;

  // NORMALIZACIÓN: Asegurar que siempre tengamos un array de 'colors' consistente
  const normalizedColors = selectedMerchItem.colors || [...new Set(selectedMerchItem.variants?.map(v => v.color) || [])].map(c => ({
    name: c || "Estándar",
    hex: c || "#444",
    images: [selectedMerchItem.image_url, "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"]
  }));

  const activeColor = normalizedColors[merchColorIdx] || normalizedColors[0] || { name: 'N/A', hex: '#000', images: [] };
  const galleryImages = activeColor.images;

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;

    // Stage bounds (container)
    const { top: sTop, left: sLeft } = e.currentTarget.getBoundingClientRect();
    
    // Image bounds (actual content)
    const { top: iTop, left: iLeft, width: iWidth, height: iHeight } = imgRef.current.getBoundingClientRect();
    
    // Global mouse position
    const mouseX = e.pageX - window.pageXOffset;
    const mouseY = e.pageY - window.pageYOffset;

    // Check if over actual image pixels
    const isOverImg = (
      mouseX >= iLeft && 
      mouseX <= iLeft + iWidth && 
      mouseY >= iTop && 
      mouseY <= iTop + iHeight
    );

    if (!isOverImg) {
      setShowMagnifier(false);
      return;
    }

    setShowMagnifier(true);
    
    // Coords relative to the STAGE (for positioning the lens circle)
    const stageX = mouseX - sLeft;
    const stageY = mouseY - sTop;

    // Coords relative to the IMAGE (for background magnification)
    const imgX = mouseX - iLeft;
    const imgY = mouseY - iTop;
    
    setStageSize([iWidth, iHeight]);
    setMagnifierPos({
      x: stageX,
      y: stageY,
      bgX: (imgX / iWidth) * 100,
      bgY: (imgY / iHeight) * 100
    });
  };

  // Lógica de tallas más inclusiva
  const hasSize = selectedMerchItem.variants?.length > 1 || ['Playera','Gorra','Hoodie','Bufanda','Ropa','Accesorios'].includes(selectedMerchItem.type || selectedMerchItem.category);
  
  // Motor de Precios Dinámico para Amazon Label
  const currentPrice = selectedMerchItem.price || (selectedMerchItem.variants && selectedMerchItem.variants[0]?.price) || 0;
  const priceStr = currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 });
  const [priceInt, priceDec] = priceStr.split('.');
  
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={() => setSelectedMerchItem(null)}
    >
      <div
        className="merch-modal-glass"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={() => setSelectedMerchItem(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

        {/* COL 1: Vertical Thumbs (Amazon Style) */}
        <div className="merch-v-thumbs">
          {galleryImages.map((img, gi) => (
            <div 
              key={gi} 
              className={`merch-v-thumb ${merchGalleryIdx === gi ? 'active' : ''}`}
              onClick={() => setMerchGalleryIdx(gi)}
            >
              <img src={img} alt="" />
            </div>
          ))}
        </div>

        {/* COL 2: Hero Stage (With Magnifying Glass) */}
        <div 
          className="merch-stage" 
          onMouseEnter={() => setShowMagnifier(true)}
          onMouseLeave={() => setShowMagnifier(false)}
          onMouseMove={handleMouseMove}
        >
          <img 
            ref={imgRef}
            key={merchGalleryIdx}
            src={galleryImages[merchGalleryIdx] || galleryImages[0]} 
            alt={selectedMerchItem.name} 
            className="merch-zoom-img"
          />

          {showMagnifier && (
            <div 
              className="merch-magnifier-lens"
              style={{
                left: `${magnifierPos.x - 35}px`,
                top: `${magnifierPos.y - 35}px`,
                backgroundImage: `url(${galleryImages[merchGalleryIdx] || galleryImages[0]})`,
                backgroundPosition: `${magnifierPos.bgX}% ${magnifierPos.bgY}%`,
                backgroundSize: `${stageW * zoomLevel}px ${stageH * zoomLevel}px`
              }}
            />
          )}
        </div>

        {/* COL 3: Control Deck */}
        <div className="merch-control-deck">
          <div className="merch-info-header">
              <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px' }}>{selectedMerchItem.type} OFICIAL</span>
              <h2 style={{ color: '#fff', margin: '0.2rem 0', fontWeight: 900, fontSize: '1.25rem', textTransform: 'uppercase', lineHeight: 1.1 }}>{selectedMerchItem.name}</h2>
              
              <div className="amazon-price-tag" style={{ marginTop: '0.8rem' }}>
                  <span className="price-currency">$</span>
                  <span className="price-integer">{priceInt}</span>
                  <span className="price-decimal">{priceDec}</span>
                  <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, alignSelf: 'center', marginLeft: '6px' }}>MXN</span>
              </div>
          </div>

          {/* Size Selection (Technical Grid) - RESTORED */}
          {hasSize && (
            <div className="merch-selection-section" style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Seleccionar Talla</p>
              <div className="size-grid-technical">
                  {['S','M','L','XL'].map(sz => (
                      <button 
                        key={sz} 
                        className={`size-box-btn ${merchSize === sz ? 'active' : ''}`}
                        onClick={() => setMerchSize(sz)}
                      >
                          <span className="size-label">{sz}</span>
                          <span className="size-price">${priceInt}.{priceDec}</span>
                      </button>
                  ))}
              </div>
            </div>
          )}

          {/* Accordion System (Amazon style) - COMPACTED TITLES */}
          <div className="merch-accordions-group">
            {/* ⚡ Highlights Panel (Static) */}
            <div className="merch-slim-accordion static-panel">
              <div className="static-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="Star" size={16} />
                  <span className="static-title">DESTACADOS</span>
                </div>
              </div>
              <div className="static-panel-content">
                <div className="badge-item">
                  <Icon name="Shield" size={14} />
                  <span>PAGO SEGURO</span>
                </div>
                <div className="badge-item">
                  <Icon name="RefreshCcw" size={14} />
                  <span>DEVOLUCIONES</span>
                </div>
                <div className="badge-item">
                  <Icon name="Zap" size={14} />
                  <span>ENVÍO LAIKA</span>
                </div>
              </div>
            </div>

            <Accordion title="DETALLES" icon="info" className="merch-slim-accordion">
              <div className="merch-specs-list" style={{ marginTop: '0.4rem' }}>
                  <div className="spec-row">
                      <span className="spec-key">TEJIDO:</span>
                      <span className="spec-val">Algodón Premium</span>
                  </div>
                  <div className="spec-row">
                      <span className="spec-key">ORIGEN:</span>
                      <span className="spec-val">Importado</span>
                  </div>
              </div>
            </Accordion>

            <Accordion title="ACERCA DE" icon="fileText" className="merch-slim-accordion">
              <ul className="merch-bullet-points" style={{ marginTop: '0.4rem' }}>
                  <li>Diseño industrial exclusivo.</li>
                  <li>Tintas de alta densidad.</li>
                  <li>Corte moderno ajustable.</li>
              </ul>
            </Accordion>

            <Accordion title="ESTILO" icon="sparkles" className="merch-slim-accordion">
              <p style={{ fontSize: '10px', color: '#888', lineHeight: 1.2, margin: '0.4rem 0 0' }}>
                Línea técnica 'Micro-Technical' con acabados industriales boutique.
              </p>
            </Accordion>
          </div>

          {/* Purchase Actions (Ultra Premium Button) */}
          <div className="merch-actions-box">
              <button 
                className="merch-btn-buy-premium"
                onClick={() => {
                  const variant = selectedMerchItem.variants?.find(v => v.size === merchSize && (v.color === activeColor.name || !v.color)) 
                                 || selectedMerchItem.variants?.[0] 
                                 || { id: selectedMerchItem.id + '_v', size: merchSize, color: activeColor.name, price: currentPrice };

                  addMerchToCart(selectedMerchItem, variant, 1);
                  setSelectedMerchItem(null);
                  navigate('/cart');
                }}
              >
                  <Icon name="shoppingCart" size={14} style={{ marginRight: '6px' }} />
                  AGREGAR AL CARRITO
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
