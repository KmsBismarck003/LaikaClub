import React, { useState } from 'react';
import { 
    Info, RefreshCw, Zap, Star, Shield, Sparkles, FileText, ChevronDown 
} from 'lucide-react';

// --- SEGMENTED CONTROL COMPONENT (BACKUP STYLE) ---
export const SegmentedControl = ({ options, value, onChange }) => (
    <div className="segmented-control">
        {options.map(opt => (
            <button 
                key={opt.value} 
                className={value === opt.value ? 'active' : ''} 
                onClick={() => onChange(opt.value)}
            >
                {opt.label.toUpperCase()}
            </button>
        ))}
    </div>
);

// --- ACORDEON SIMULADO DE VISTA PÚBLICA (CRISTAL) ---
export const AccordionLive = ({ title, icon, children, defaultOpen }) => {
    const [open, setOpen] = useState(defaultOpen);
    const renderIcon = () => {
        switch(icon) {
            case 'star': return <Star size={14} />;
            case 'info': return <Info size={14} />;
            case 'fileText': return <FileText size={14} />;
            case 'sparkles': return <Sparkles size={14} />;
            case 'shield': return <Shield size={14} />;
            case 'refresh': return <RefreshCw size={14} />;
            case 'zap': return <Zap size={14} />;
            default: return null;
        }
    };
    return (
        <div className="merch-slim-accordion laika-accordion-item" style={{ border: open ? '1px solid rgba(255,255,255,0.08)' : '' }}>
            <button className="laika-accordion-header" onClick={() => setOpen(!open)}>
                <div className="laika-accordion-title">
                    {renderIcon()}
                    <span>{title}</span>
                </div>
                <ChevronDown className="accordion-toggle-icon" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            {open && <div className="laika-accordion-content">{children}</div>}
        </div>
    );
};

// --- MONITOR PRINCIPAL EN VIVO (EVENT DETAIL REPLICA) ---
export const StorePreview = ({ item }) => {
    const isSoldOut = item.status === 'sold_out';
    const firstPrice = item.variants?.[0]?.price || 0;
    const priceStr = parseFloat(firstPrice).toFixed(2);
    const priceInt = Math.floor(firstPrice).toString();
    const priceDec = (parseFloat(firstPrice) - Math.floor(firstPrice)).toFixed(2).substring(2);
    
    const hasDiscount = item.discount && parseInt(item.discount) > 0;
    const discountPrice = hasDiscount ? (parseFloat(firstPrice) * (1 - parseInt(item.discount) / 100)).toFixed(2) : priceStr;
    const dInt = Math.floor(discountPrice).toString();
    const dDec = (parseFloat(discountPrice) - Math.floor(discountPrice)).toFixed(2).substring(2);

    return (
        <div className="glass-monitor-wrapper">
          <div className="live-preview-badge"><div className="dot-live" /> LIVE PREVIEW</div>
          
          <div className="merch-modal-glass" style={{ margin: 'auto' }}>
            <div className="merch-v-thumbs">
                <div className="merch-v-thumb" style={{ opacity: 1 }}><img src={item.image_url || 'https://via.placeholder.com/150'} alt="T1" style={{width:'100%', height:'100%', objectFit:'cover'}}/></div>
            </div>

            <div className="merch-stage" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.image_url || 'https://via.placeholder.com/600'} alt="Stage" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                
                <div className="merch-status-tags" style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: '8px' }}>
                    {item.isNew && <span className="merch-tag" style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '4px 10px', fontSize: '10px', fontWeight: 900, borderRadius: '4px' }}>NEW</span>}
                    {isSoldOut && <span className="merch-tag" style={{ background: 'rgba(200,0,0,0.8)', color: '#fff', padding: '4px 10px', fontSize: '10px', fontWeight: 900, borderRadius: '4px' }}>SOLD OUT</span>}
                </div>
            </div>

            <div className="merch-control-deck">
                <div className="merch-info-header">
                    <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px' }}>{item.category || 'TIPO'} OFICIAL</span>
                    <h2 style={{ color: '#fff', margin: '0.2rem 0', fontWeight: 900, fontSize: '1.25rem', textTransform: 'uppercase', lineHeight: 1.1 }}>{item.name || 'SIN NOMBRE'}</h2>
                    
                    <div className="amazon-price-tag" style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'flex-start', color: '#fff', fontStyle: 'italic', fontWeight: 900 }}>
                        {hasDiscount ? (
                            <>
                              <span style={{ fontSize:'0.7rem', color:'#aaa', textDecoration:'line-through', marginRight: '8px', alignSelf: 'center' }}>${priceStr}</span>
                              <span style={{ color:'#2ecc71', fontSize:'0.7rem', alignSelf:'center', marginRight:'12px', border:'1px solid #2ecc71', padding:'2px 4px', borderRadius:'3px' }}>-{item.discount}%</span>
                              <span style={{ fontSize:'1rem' }}>$</span><span style={{ fontSize:'2.2rem', lineHeight: 0.9 }}>{dInt}</span><span style={{ fontSize:'0.9rem' }}>{dDec}</span>
                            </>
                        ) : (
                            <>
                              <span style={{ fontSize:'1rem' }}>$</span><span style={{ fontSize:'2.2rem', lineHeight: 0.9 }}>{priceInt}</span><span style={{ fontSize:'0.9rem' }}>{priceDec}</span>
                            </>
                        )}
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, alignSelf: 'center', marginLeft: '6px', fontStyle: 'normal' }}>MXN</span>
                    </div>
                </div>

                <div className="merch-selection-section" style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Variantes Activas</p>
                    <div className="size-grid-technical" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '8px' }}>
                        {item.variants?.map((v, idx) => (
                            <button key={idx} className="size-box-btn" style={{ opacity: v.stock > 0 ? 1 : 0.4 }}>
                                <span style={{ fontSize: v.size.length > 2 ? '10px' : '14px', fontWeight: 900, color: '#fff' }}>{v.size}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="merch-accordions-group">
                    <AccordionLive title="DESTACADOS" icon="star" defaultOpen={true}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'4px' }}><Shield size={12} color="#EAB308"/> <span>SEGURO</span></div>
                            <div style={{ display:'flex', alignItems:'center', gap:'4px' }}><RefreshCw size={12} color="#EAB308"/> <span>DEVOLUCIÓN</span></div>
                        </div>
                    </AccordionLive>
                    <AccordionLive title="DETALLES" icon="info">
                        <p style={{ margin:0 }}>{item.details || 'Llena los detalles en el formulario.'}</p>
                    </AccordionLive>
                </div>

                <div className="merch-actions-box" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button className="merch-btn-buy-premium" disabled={isSoldOut}>
                        <Zap size={14} style={{ marginRight: '6px' }} />
                        {isSoldOut ? 'AGOTADO' : 'COMPRAR'}
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};
