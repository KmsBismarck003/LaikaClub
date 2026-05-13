import React from 'react';
import Icon from '../../../components/Icons';

const CheckoutSummary = ({ 
    cartCount, 
    ticketItems, 
    merchItems, 
    total, 
    serviceFee, 
    shippingCost, 
    discount, 
    grandTotal 
}) => {
    return (
        <aside className="checkout-summary-sidebar">
            <div className="order-summary-card">
                <header className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase">Pedido</h3>
                    <span className="text-[10px] uppercase">{cartCount} productos</span>
                </header>

                <div className="summary-items scrollbar-hide">
                    {ticketItems.length > 0 && (
                        <div className="summary-group-section">
                            <h4 className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-blue-500/20 pb-1">
                                <Icon name="ticket" size={10} /> Boletos
                            </h4>
                            {ticketItems.map(item => (
                                <div key={`${item.eventId}-${item.sectionId}-${item.functionId}`} className="summary-item">
                                    <div className="item-img">
                                        <img src={item.image} alt={item.eventName} />
                                    </div>
                                    <div className="item-details">
                                        <h4 className="text-[11px] font-black uppercase leading-none mb-2">{item.eventName}</h4>
                                        <div className="item-meta text-[9px] uppercase space-y-1">
                                            <p>Sección: {item.sectionName || 'GENERAL'}</p>
                                            {item.functionDate && <p>Fecha: {item.functionDate}</p>}
                                            <p>Cant: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="item-price text-[11px] font-black">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {merchItems.length > 0 && (
                        <div className="summary-group-section mt-4">
                            <h4 className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-1">
                                <Icon name="shoppingBag" size={10} /> Artículos
                            </h4>
                            {merchItems.map(item => (
                                <div key={`${item.merchId || item.id}-${item.variantId}`} className="summary-item">
                                    <div className="item-img">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h4 className="text-[11px] font-black uppercase leading-none mb-2">{item.name}</h4>
                                        <div className="item-meta text-[9px] uppercase space-y-1">
                                            <p>Detalle: {item.size || 'Talla Única'} {item.color ? ` - ${item.color}` : ''}</p>
                                            <p>Cant: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="item-price text-[11px] font-black">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="summary-totals">
                    <div className="total-row">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                        <span>Comisión de Servicio</span>
                        <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                        <span>Envío</span>
                        <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="total-row text-green-500 font-bold">
                            <span>Descuento aplicado</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="grand-total-row">
                        <span>TOTAL</span>
                        <div className="text-right">
                            <div className="price">${grandTotal.toFixed(2)}</div>
                            <div className="iva">IVA incluido</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CheckoutSummary;
