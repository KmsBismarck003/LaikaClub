import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ticketAPI, paymentAPI } from '../../../services/api';
import { merchService } from '../../../services/merch.service';

// Costos de envío por método
const SHIPPING_COSTS = {
    digital: 0,    // Boleto digital - sin costo
    tienda: 0,     // Recoger en tienda - sin costo
    standard: 99,
    recoleccion: 99,
    express: 129,
};

export const useCheckoutFlow = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error, info } = useNotification();
    const {
        cart, total, serviceFee, discount, finalTotal,
        appliedCoupon, clearCart, consumeAppliedCoupon, addCard, savedCards, removeCard
    } = useCart();

    // Clasificación de items
    const ticketItems = cart.filter(item => item.sectionId !== 'MERCH');
    const merchItems  = cart.filter(item => item.sectionId === 'MERCH');
    const hasMerch    = merchItems.length > 0;

    // Estado del flujo (1=pago, 2=éxito)
    const [step, setStep] = useState(1);
    const [checkoutError, setCheckoutError] = useState(null);

    // Método de entrega: 'digital' para boletos electrónicos, otros requieren dirección
    const [deliveryType, setDeliveryType] = useState('digital');

    // Solo mostrar formulario de envío si hay merch O si escoge entrega física
    const needsShippingForm = hasMerch || (deliveryType !== 'digital');
    const shippingCost = SHIPPING_COSTS[deliveryType] ?? 0;

    // Método de pago
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);

    // Datos de tarjeta
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        saveCard: true,
        selectedSavedCard: null,
        lastReference: '',
    });

    // Datos de envío (solo requeridos si needsShippingForm)
    const [shippingData, setShippingData] = useState(() => {
        const saved = localStorage.getItem('checkout_shipping');
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
        };
    });

    // Persistencia del formulario de envío
    useEffect(() => {
        if (step < 2) {
            localStorage.setItem('checkout_shipping', JSON.stringify(shippingData));
        }
    }, [shippingData, step]);

    // Redirigir si carrito vacío
    useEffect(() => {
        if (cart.length === 0 && step !== 2) {
            navigate('/cart');
        }
    }, [cart, step, navigate]);

    const handleShippingChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setShippingData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleCardChange = useCallback((field, value) => {
        setCardData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Validación del formulario de envío
    const validateShipping = () => {
        if (!needsShippingForm) return true;
        const { nombre, calle, codigoPostal, email, ciudad } = shippingData;
        if (!nombre || !calle || !codigoPostal || !email || !ciudad) {
            error('Por favor completa todos los campos de envío obligatorios (*)');
            return false;
        }
        return true;
    };

    // Validación del método de pago
    const validatePayment = () => {
        if (paymentMethod !== 'card') return true;
        if (cardData.selectedSavedCard) return true;

        const num = (cardData.number || '').replace(/\s/g, '');
        const exp = (cardData.expiry || '').trim();
        const cvv = (cardData.cvv || '').trim();
        const name = (cardData.name || '').trim();

        if (num.length < 15 || !exp.includes('/') || cvv.length < 3 || name.length < 3) {
            error('Por favor ingresa los datos completos de tu tarjeta');
            return false;
        }
        return true;
    };

    const handleFinalPayment = async () => {
        if (!validateShipping()) return;
        if (!validatePayment()) return;

        setCheckoutError(null);
        setProcessing(true);
        info('Iniciando transacción segura...');

        try {
            const amount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + shippingCost;
            const eventId = cart.find(item => item.eventId)?.eventId || 1;

            // 1. Crear intención de pago
            const intentResp = await paymentAPI.createIntent({
                amount,
                method: paymentMethod,
                eventId,
                event_id: eventId,
            });
            const paymentId = intentResp.payment_id || intentResp.reference;

            // 2. Confirmar pago con tarjeta
            if (paymentMethod === 'card') {
                info('Validando con el banco...');
                await new Promise(resolve => setTimeout(resolve, 1500));
                await paymentAPI.confirm(paymentId);

                if (!cardData.selectedSavedCard && cardData.saveCard) {
                    addCard({
                        number: cardData.number,
                        holder: cardData.name || shippingData.nombre,
                        expiry: cardData.expiry,
                    });
                }
            }

            // 3. Comprar boletos
            if (ticketItems.length > 0) {
                const purchaseItems = [];
                for (const item of ticketItems) {
                    if (item.seats && item.seats.length > 0) {
                        for (const seat of item.seats) {
                            purchaseItems.push({
                                eventId: item.eventId,
                                quantity: 1,
                                functionId: item.functionId,
                                sectionId: item.sectionId,
                                sectionName: item.sectionName,
                                price: item.price,
                                seatId: seat,
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
                                seatId: null,
                            });
                        }
                    }
                }
                await ticketAPI.purchase({
                    items: purchaseItems,
                    paymentMethod,
                    paymentId,
                    shippingInfo: needsShippingForm ? shippingData : null,
                    shippingMethod: deliveryType,
                });
            }

            // 4. Procesar merch
            if (merchItems.length > 0) {
                await merchService.createOrder({
                    manager_id: 1,
                    customer_name: `${shippingData.nombre} ${shippingData.apellidos}`.trim(),
                    customer_email: shippingData.email,
                    total_amount: merchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    items: merchItems.map(item => ({
                        merchandise_id: item.merchId,
                        variant_id: item.variantId,
                        quantity: item.quantity,
                        price_at_purchase: item.price,
                    })),
                });
            }

            if (appliedCoupon) await consumeAppliedCoupon();

            if (paymentMethod === 'oxxo') {
                setCardData(prev => ({ ...prev, lastReference: paymentId }));
            }

            // Disparar Notificación Push Automática (Ticket Purchase)
            import('../../../specialFun/PushNotifications').then(module => {
                const eventName = ticketItems.length > 0 ? (ticketItems[0].eventName || ticketItems[0].name || 'el evento') : 'tu compra';
                module.PushEngine.triggerSmart('TICKET_PURCHASE', {
                    eventName,
                    url: `${window.location.origin}/user/tickets`
                });
            }).catch(e => console.error("Error triggering push:", e));

            success('¡Transacción completada con éxito!');
            clearCart();
            localStorage.removeItem('checkout_shipping');
            setStep(2);
        } catch (err) {
            console.error('[Checkout Flow Error]', err);
            const errMsg = err.message || (typeof err === 'string' ? err : 'Error en el procesamiento del pago.');
            setCheckoutError(errMsg);
            error(errMsg);
        } finally {
            setProcessing(false);
        }
    };

    const grandTotal = finalTotal + shippingCost;

    return {
        // Cart items
        cart,
        ticketItems,
        merchItems,
        hasMerch,

        // Totals
        total,
        serviceFee,
        discount,
        finalTotal,
        shippingCost,
        grandTotal,

        // Step
        step,
        setStep,
        checkoutError,
        setCheckoutError,

        // Delivery
        deliveryType,
        setDeliveryType,
        needsShippingForm,

        // Payment
        paymentMethod,
        setPaymentMethod,
        processing,
        cardData,
        handleCardChange,
        savedCards,
        removeCard,

        // Shipping form
        shippingData,
        handleShippingChange,

        // Actions
        handleFinalPayment,
    };
};
