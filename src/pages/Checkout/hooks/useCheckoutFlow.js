import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ticketAPI, paymentAPI } from '../../../services/api';
import { merchService } from '../../../services/merch.service';

export const useCheckoutFlow = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error, info } = useNotification();
    const { 
        cart, total, serviceFee, discount, finalTotal, 
        appliedCoupon, clearCart, consumeAppliedCoupon, addCard
    } = useCart();

    // 1. Step Logic
    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem('checkout_step');
        return saved ? parseInt(saved) : 1;
    });

    // 2. Form States
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

    const [shippingMethod, setShippingMethod] = useState('tienda');
    const [shippingCost, setShippingCost] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        lastReference: ''
    });

    // 3. Cart & Step Sync
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
        const costs = { tienda: 0, standard: 99, recoleccion: 99, express: 129 };
        setShippingCost(costs[shippingMethod] || 0);
    }, [shippingMethod]);

    // 4. Handlers
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleCardChange = useCallback((e) => {
        const { name, value } = e.target;
        setCardData(prev => ({ ...prev, [name]: value }));
    }, []);

    const nextStep = useCallback(() => {
        if (step === 1) {
            if (!formData.nombre || !formData.calle || !formData.codigoPostal || !formData.email) {
                error('Por favor completa los campos obligatorios (*)');
                return;
            }
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    }, [step, formData, error]);

    const prevStep = useCallback(() => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    }, []);

    // 5. THE BRAIN: handleFinalPayment (Orchestration)
    const handleFinalPayment = async () => {
        if (paymentMethod === 'card') {
            if (!cardData.selectedSavedCard && (!cardData.number || !cardData.cvv)) {
                error('Por favor ingresa los datos de tu tarjeta');
                return;
            }
        }

        setProcessing(true);
        info('Iniciando transacción segura...');

        try {
            const ticketItems = cart.filter(item => item.type === 'ticket');
            const merchItems = cart.filter(item => item.type === 'merch');
            const amount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + shippingCost;
            
            // 1. Create Payment Intent
            const eventId = cart.find(item => item.eventId)?.eventId || 1;
            const intentResp = await paymentAPI.createIntent({
                amount: amount,
                method: paymentMethod,
                eventId: eventId,
                event_id: eventId
            });

            const paymentId = intentResp.payment_id || intentResp.reference;
            
            // 2. Simulation for Cards
            if (paymentMethod === 'card') {
                info('Validando con el banco...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                await paymentAPI.confirm(paymentId);
            }

            // 3. Purchase Tickets
            if (ticketItems.length > 0) {
                await ticketAPI.purchase({
                    items: ticketItems.map(item => ({
                        eventId: item.eventId,
                        quantity: item.quantity,
                        functionId: item.functionId,
                        sectionId: item.sectionId,
                        sectionName: item.sectionName,
                        price: item.price,
                        seatId: item.seatId
                    })),
                    paymentMethod,
                    paymentId,
                    shippingInfo: formData,
                    shippingMethod
                });
            }

            // 4. Create Merch Order
            if (merchItems.length > 0) {
                await merchService.createOrder({
                    manager_id: 1,
                    customer_name: `${formData.nombre} ${formData.apellidos}`,
                    customer_email: formData.email,
                    total_amount: merchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    items: merchItems.map(item => ({
                        merchandise_id: item.merchId,
                        variant_id: item.variantId,
                        quantity: item.quantity,
                        price_at_purchase: item.price
                    }))
                });
            }
            
            if (appliedCoupon) await consumeAppliedCoupon();
            
            if (paymentMethod === 'oxxo') {
                setCardData(prev => ({ ...prev, lastReference: paymentId }));
            }
            
            if (paymentMethod === 'card' && cardData.saveCard) {
                addCard(cardData);
                info('Tarjeta guardada exitosamente.');
            }

            success('¡Transacción completada con éxito!');
            clearCart();
            localStorage.removeItem('checkout_form');
            localStorage.removeItem('checkout_step');
            setStep(4);
        } catch (err) {
            console.error('[Checkout Flow Error]', err);
            error(err.response?.data?.detail || 'Error en el procesamiento del pago.');
        } finally {
            setProcessing(false);
        }
    };

    const grandTotal = finalTotal + shippingCost;

    return {
        // State
        step,
        formData,
        shippingMethod,
        shippingCost,
        paymentMethod,
        processing,
        cardData,
        grandTotal,
        cart,
        
        // Handlers
        setStep,
        setShippingMethod,
        setPaymentMethod,
        handleInputChange,
        handleCardChange,
        nextStep,
        prevStep,
        handleFinalPayment
    };
};
