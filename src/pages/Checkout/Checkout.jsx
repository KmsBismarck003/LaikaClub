import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { ticketAPI, paymentAPI } from '../../services/api';
import Icon from '../../components/Icons/Icons';
import Step1_Identity from './components/Step1_Identity';
import Step2_Shipping from './components/Step2_Shipping';
import Step3_Payment from './components/Step3_Payment';
import Step4_Success from './components/Step4_Success';
import './Checkout.css';

const Checkout = () => {
    const { 
        cart, total, serviceFee, discount, finalTotal, 
        appliedCoupon, clearCart, consumeAppliedCoupon,
        addCard, savedCards
    } = useCart();

    const ticketItems = React.useMemo(() => cart.filter(item => item.sectionId !== 'MERCH'), [cart]);
    const merchItems = React.useMemo(() => cart.filter(item => item.sectionId === 'MERCH'), [cart]);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { success, error, info } = useNotification();

    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('checkout_form');
        if (saved) return JSON.parse(saved);
        return {
            nombre: user?.name || '',
            apellidos: '',
            calle: '',
            numeroExterior: '',
            codigoPostal: '',
            colonia: '',
            ciudad: '',
            region: 'México',
            email: user?.email || '',
            telefono: '',
            observaciones: '',
            newsletter: false
        };
    });

    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem('checkout_step');
        return saved ? parseInt(saved) : 1;
    });

    const [shippingMethod, setShippingMethod] = useState('tienda');
    const [shippingCost, setShippingCost] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        saveCard: false,
        selectedSavedCard: null
    });

    useEffect(() => {
        if (cart.length === 0 && step !== 4) {
            navigate('/cart');
        }
    }, [cart, step, navigate]);

    useEffect(() => {
        if (step < 4) {
            localStorage.setItem('checkout_form', JSON.stringify(formData));
            localStorage.setItem('checkout_step', step.toString());
        }
    }, [formData, step]);

    useEffect(() => {
        const costs = {
            tienda: 0,
            standard: 99,
            recoleccion: 99,
            express: 129
        };
        setShippingCost(costs[shippingMethod] || 0);
    }, [shippingMethod]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.nombre || !formData.calle || !formData.codigoPostal || !formData.email) {
                error('Por favor completa los campos obligatorios (*)');
                return;
            }
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFinalPayment = async () => {
        if (paymentMethod === 'card' && !cardData.selectedSavedCard && (!cardData.number || !cardData.cvv)) {
            error('Por favor ingresa los datos de tu tarjeta');
            return;
        }

        setProcessing(true);
        info('Iniciando transacción segura...');

        try {
            // 1. Crear intención de pago en el backend
            const amount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + shippingCost;
            const eventId = cart.find(item => item.eventId)?.eventId || 1;
            const intentResp = await paymentAPI.createIntent({
                amount: amount,
                method: paymentMethod,
                eventId: eventId,
                event_id: eventId
            });

            const paymentId = intentResp.payment_id || intentResp.reference;
            
            // 2. Si es tarjeta, simulamos la confirmación del gateway
            if (paymentMethod === 'card') {
                info('Validando con el banco...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                await paymentAPI.confirm(paymentId);

                // Guardar la tarjeta si el usuario lo solicitó y es una tarjeta nueva
                if (!cardData.selectedSavedCard && cardData.saveCard) {
                    addCard({
                        number: cardData.number,
                        holder: cardData.name || `${formData.nombre} ${formData.apellidos}`,
                        expiry: cardData.expiry
                    });
                }
            }

            // 3. Procesar la compra de los tickets
            const purchaseItems = [];
            for (const item of cart) {
                if (item.seats && item.seats.length > 0) {
                    for (const seat of item.seats) {
                        purchaseItems.push({
                            eventId: item.eventId,
                            quantity: 1,
                            functionId: item.functionId,
                            sectionId: item.sectionId,
                            sectionName: item.sectionName,
                            price: item.price,
                            seatId: seat
                        });
                    }
                } else {
                    for (let i = 0; i < item.quantity; i++) {
                        purchaseItems.push({
                            eventId: item.eventId,
                            quantity: 1,
                            functionId: item.functionId,
                            sectionId: item.sectionId,
                            sectionName: item.sectionName,
                            price: item.price,
                            seatId: null
                        });
                    }
                }
            }

            const purchaseData = {
                items: purchaseItems,
                paymentMethod: paymentMethod,
                paymentId: paymentId,
                shippingInfo: formData,
                shippingMethod: shippingMethod
            };

            const result = await ticketAPI.purchase(purchaseData);
            
            if (appliedCoupon) await consumeAppliedCoupon();
            
            // Guardamos la referencia de Oxxo si existe para mostrarla en el éxito
            if (paymentMethod === 'oxxo') {
                setCardData(prev => ({ ...prev, lastReference: paymentId }));
            }

            success('¡Transacción completada con éxito!');
            clearCart();
            localStorage.removeItem('checkout_form');
            localStorage.removeItem('checkout_step');
            setStep(4);
        } catch (err) {
            console.error('Error en Checkout:', err);
            error(err.response?.data?.detail || 'Error en el procesamiento del pago.');
        } finally {
            setProcessing(false);
        }
    };

    const grandTotal = finalTotal + shippingCost;

    return (
        <div className="checkout-page-container">
            <header className="checkout-main-header">
                <div className="steps-indicator">
                    <span className={step >= 1 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>DATOS</span>
                    <Icon name="chevronRight" size={14} />
                    <span className={step >= 2 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>ENVÍO</span>
                    <Icon name="chevronRight" size={14} />
                    <span className={step >= 3 ? 'active' : ''} style={{ color: '#ffffff', opacity: 1 }}>PAGO</span>
                </div>
            </header>

            <div className="checkout-layout">
                <main className="checkout-main-content">
                    {step === 1 && (
                        <Step1_Identity 
                            formData={formData} 
                            handleInputChange={handleInputChange} 
                            nextStep={nextStep} 
                        />
                    )}
                    {step === 2 && (
                        <Step2_Shipping 
                            formData={formData} 
                            shippingMethod={shippingMethod} 
                            setShippingMethod={setShippingMethod} 
                            setStep={setStep} 
                            prevStep={prevStep} 
                            nextStep={nextStep} 
                        />
                    )}
                    {step === 3 && (
                        <Step3_Payment 
                            formData={formData} 
                            shippingMethod={shippingMethod} 
                            paymentMethod={paymentMethod} 
                            setPaymentMethod={setPaymentMethod} 
                            cardData={cardData} 
                            handleCardChange={handleCardChange} 
                            processing={processing} 
                            setStep={setStep} 
                            prevStep={prevStep} 
                            handleFinalPayment={handleFinalPayment} 
                        />
                    )}
                    {step === 4 && (
                        <Step4_Success 
                            paymentMethod={paymentMethod} 
                            lastReference={cardData.lastReference} 
                        />
                    )}
                </main>

                {step < 4 && (
                    <aside className="checkout-summary-sidebar">
                        <div className="order-summary-card">
                            <header className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase">Pedido</h3>
                                <span className="text-[10px] uppercase">{cart.length} productos</span>
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
                                            <div key={`${item.eventId}-${item.sectionId}-${item.functionId}`} className="summary-item">
                                                <div className="item-img">
                                                    <img src={item.image} alt={item.eventName} />
                                                </div>
                                                <div className="item-details">
                                                    <h4 className="text-[11px] font-black uppercase leading-none mb-2">{item.eventName}</h4>
                                                    <div className="item-meta text-[9px] uppercase space-y-1">
                                                        <p>Detalle: {item.sectionName?.replace('MERCH: ', '') || 'PRODUCTO'}</p>
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
                )}
            </div>
        </div>
    );
};

export default Checkout;
