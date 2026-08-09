import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ticketAPI, paymentAPI } from '../../../services/api';
import { merchService } from '../../../services/merch.service';
import { apiClient } from '../../../services/apiClient';

// Costos de envío por método
const SHIPPING_COSTS = {
    digital: 0,    // Boleto digital - sin costo
    tienda: 0,     // Recoger en taquilla/tienda - sin costo
    standard: 99,  // Envío estándar
    recoleccion: 99,
    express: 129,  // Envío express
};

export const useCheckoutFlow = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error, info } = useNotification();
    const {
        cart, total, serviceFee, discount, finalTotal,
        appliedCoupon, clearCart, consumeAppliedCoupon,
        addCard, savedCards, updateCard, removeCard,
        savedAddresses, addAddress, updateAddress, removeAddress, setDefaultAddress
    } = useCart();

    // Clasificación de items e identificación del tipo de compra
    const ticketItems = useMemo(() => cart.filter(item => item.sectionId !== 'MERCH'), [cart]);
    const merchItems  = useMemo(() => cart.filter(item => item.sectionId === 'MERCH'), [cart]);
    const hasMerch    = merchItems.length > 0;
    const hasTickets  = ticketItems.length > 0;

    // Tipo de compra: digital_only, physical_only, o mixed
    const orderType = useMemo(() => {
        if (hasTickets && !hasMerch) return 'digital_only';
        if (hasMerch && !hasTickets) return 'physical_only';
        return 'mixed';
    }, [hasTickets, hasMerch]);

    // Flujo Inteligente: fases dinámicas adaptadas al contenido del carrito
    const checkoutPhases = useMemo(() => {
        if (orderType === 'digital_only') {
            // Boletos digitales: no solicitar dirección ni envío
            return ['summary', 'payment', 'confirmation', 'success'];
        }
        // Mercancía física o mixto: incluir fase de entrega y dirección
        return ['summary', 'delivery', 'payment', 'confirmation', 'success'];
    }, [orderType]);

    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const currentPhase = checkoutPhases[currentPhaseIndex] || 'summary';
    const [checkoutError, setCheckoutError] = useState(null);

    // Método de entrega (predeterminado a standard si hay merch, digital si solo boletos)
    const [deliveryType, setDeliveryType] = useState(() => hasMerch ? 'standard' : 'digital');

    useEffect(() => {
        if (orderType === 'digital_only' && deliveryType !== 'digital') {
            setDeliveryType('digital');
        } else if ((orderType === 'physical_only' || orderType === 'mixed') && deliveryType === 'digital') {
            setDeliveryType('standard');
        }
    }, [orderType]); // eslint-disable-line

    const needsShippingForm = hasMerch || (deliveryType !== 'digital' && deliveryType !== 'tienda');
    const shippingCost = SHIPPING_COSTS[deliveryType] ?? 0;

    // --- Gestión Inteligente de Direcciones ---
    const [selectedAddressId, setSelectedAddressId] = useState(() => {
        const def = savedAddresses?.find(a => a.isDefault);
        if (def) return def.id;
        return savedAddresses?.length > 0 ? savedAddresses[0].id : 'new';
    });

    const [saveNewAddress, setSaveNewAddress] = useState(true);
    const [editingAddressId, setEditingAddressId] = useState(null);

    // Datos de envío en formulario activo
    const [shippingData, setShippingData] = useState(() => {
        const def = savedAddresses?.find(a => a.isDefault) || (savedAddresses?.length > 0 ? savedAddresses[0] : null);
        if (def) {
            return {
                alias: def.alias || 'Dirección Principal',
                nombre: def.nombre || '',
                apellidos: def.apellidos || '',
                calle: def.calle || '',
                numeroExterior: def.numeroExterior || '',
                codigoPostal: def.codigoPostal || '',
                colonia: def.colonia || '',
                ciudad: def.ciudad || '',
                region: def.region || 'México',
                email: def.email || user?.email || '',
                telefono: def.telefono || '',
                observaciones: def.observaciones || '',
            };
        }
        const saved = localStorage.getItem('checkout_shipping');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        return {
            alias: 'Mi Dirección',
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

    // Sincronizar shippingData cuando se selecciona una dirección guardada
    useEffect(() => {
        if (selectedAddressId && selectedAddressId !== 'new') {
            const found = savedAddresses.find(a => a.id === selectedAddressId);
            if (found) {
                setShippingData({
                    alias: found.alias || '',
                    nombre: found.nombre || '',
                    apellidos: found.apellidos || '',
                    calle: found.calle || '',
                    numeroExterior: found.numeroExterior || '',
                    codigoPostal: found.codigoPostal || '',
                    colonia: found.colonia || '',
                    ciudad: found.ciudad || '',
                    region: found.region || 'México',
                    email: found.email || user?.email || '',
                    telefono: found.telefono || '',
                    observaciones: found.observaciones || '',
                });
            }
        }
    }, [selectedAddressId, savedAddresses, user]);

    // Persistencia temporal en localStorage
    useEffect(() => {
        if (currentPhase !== 'success') {
            localStorage.setItem('checkout_shipping', JSON.stringify(shippingData));
        }
    }, [shippingData, currentPhase]);

    // --- Gestión de Métodos de Pago ---
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);

    const [cardData, setCardData] = useState({
        number: '',
        name: user?.name ? user.name.toUpperCase() : '',
        expiry: '',
        cvv: '',
        saveCard: true,
        selectedSavedCard: null,
        lastReference: '',
    });

    // Auto-seleccionar primera tarjeta guardada cuando corresponda
    useEffect(() => {
        if (savedCards?.length > 0 && !cardData.selectedSavedCard && !cardData.number) {
            const defCard = savedCards[0];
            setCardData(prev => ({ ...prev, selectedSavedCard: defCard.id }));
        }
    }, [savedCards]); // eslint-disable-line

    // Redirigir si carrito está vacío y no se ha completado la compra
    useEffect(() => {
        if (cart.length === 0 && currentPhase !== 'success') {
            navigate('/cart');
        }
    }, [cart, currentPhase, navigate]);

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

    // Validaciones por fase
    const validateDelivery = () => {
        if (!needsShippingForm) return true;
        const { nombre, calle, codigoPostal, email, ciudad, numeroExterior } = shippingData;
        if (!nombre || !calle || !codigoPostal || !email || !ciudad || !numeroExterior) {
            error('Por favor completa los campos obligatorios de entrega (*) para continuar.');
            return false;
        }
        return true;
    };

    const validatePayment = () => {
        if (paymentMethod !== 'card') return true;
        if (cardData.selectedSavedCard) return true;

        const num = (cardData.number || '').replace(/\s/g, '');
        const exp = (cardData.expiry || '').trim();
        const cvv = (cardData.cvv || '').trim();
        const name = (cardData.name || '').trim();

        if (num.length < 15 || !exp.includes('/') || cvv.length < 3 || name.length < 3) {
            error('Por favor ingresa los datos completos de tu tarjeta.');
            return false;
        }
        return true;
    };

    // Control de navegación entre fases
    const goToNextPhase = () => {
        setCheckoutError(null);
        if (currentPhase === 'summary') {
            if (cart.length === 0) {
                error('Tu carrito está vacío.');
                return;
            }
            setCurrentPhaseIndex(prev => Math.min(prev + 1, checkoutPhases.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentPhase === 'delivery') {
            if (!validateDelivery()) return;

            // Si es una dirección nueva y está activada la opción de guardar, registrarla
            if (selectedAddressId === 'new' && saveNewAddress && needsShippingForm) {
                const added = addAddress(shippingData);
                setSelectedAddressId(added.id);
            } else if (editingAddressId) {
                updateAddress(editingAddressId, shippingData);
                setEditingAddressId(null);
            }
            setCurrentPhaseIndex(prev => Math.min(prev + 1, checkoutPhases.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentPhase === 'payment') {
            if (!validatePayment()) return;
            if (paymentMethod === 'card' && !cardData.selectedSavedCard && cardData.saveCard) {
                addCard({
                    number: cardData.number,
                    holder: cardData.name || shippingData.nombre || user?.name || 'Titular de la Tarjeta',
                    expiry: cardData.expiry,
                });
            }
            setCurrentPhaseIndex(prev => Math.min(prev + 1, checkoutPhases.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentPhase === 'confirmation') {
            handleFinalPayment();
        }
    };

    const goToPrevPhase = () => {
        setCheckoutError(null);
        setCurrentPhaseIndex(prev => Math.max(0, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const jumpToPhase = (index) => {
        // Solo se permite navegar a pasos anteriores o el actual
        if (index < currentPhaseIndex) {
            setCurrentPhaseIndex(index);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFinalPayment = async () => {
        if (currentPhase === 'delivery' && !validateDelivery()) return;
        if (!validatePayment()) return;

        setCheckoutError(null);
        setProcessing(true);
        info('Procesando transacción segura...');

        try {
            const amount = finalTotal + shippingCost;
            const eventId = cart.find(item => item.eventId)?.eventId || 1;

            // 1. Crear intención de pago en backend
            const intentResp = await paymentAPI.createIntent({
                amount,
                method: paymentMethod,
                eventId,
                event_id: eventId,
            });
            const paymentId = intentResp.payment_id || intentResp.reference;

            // 2. Confirmar pago y guardar tarjeta si se seleccionó
            if (paymentMethod === 'card') {
                await new Promise(resolve => setTimeout(resolve, 1200));
                await paymentAPI.confirm(paymentId);

                if (!cardData.selectedSavedCard && cardData.saveCard) {
                    addCard({
                        number: cardData.number,
                        holder: cardData.name || shippingData.nombre || 'Titular de la Tarjeta',
                        expiry: cardData.expiry,
                    });
                }
            }

            // 3. Procesar compra de boletos
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
                    shippingInfo: (needsShippingForm || deliveryType !== 'digital') ? shippingData : null,
                    shippingMethod: deliveryType,
                });
            }

            // 4. Procesar orden de mercancía
            if (merchItems.length > 0) {
                await merchService.createOrder({
                    manager_id: 1,
                    customer_name: `${shippingData.nombre} ${shippingData.apellidos}`.trim() || user?.name || 'Cliente',
                    customer_email: shippingData.email || user?.email,
                    total_amount: merchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    items: merchItems.map(item => ({
                        merchandise_id: item.merchId || item.eventId.toString().replace('merch_', ''),
                        variant_id: item.variantId || null,
                        quantity: item.quantity,
                        price_at_purchase: item.price,
                    })),
                });
            }

            if (appliedCoupon) await consumeAppliedCoupon();

            if (paymentMethod === 'oxxo') {
                setCardData(prev => ({ ...prev, lastReference: paymentId }));
            }

            // 5. Enviar confirmación de compra y boletos por correo electrónico SMTP al email proporcionado
            try {
                const targetEmail = shippingData?.email || user?.email || 'redjar481@gmail.com';
                const itemsListHtml = cart.map(item => 
                    `<li><strong>${item.quantity}x ${item.eventName || item.name || 'Acceso'}</strong> - $${(item.price * item.quantity).toFixed(2)} MXN</li>`
                ).join('');
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0c10; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #1f2833;">
                        <h2 style="color: #00fff2; text-transform: uppercase; margin-bottom: 10px;">Confirmación de Compra - LaikaClub</h2>
                        <p style="color: #c5c6c7; font-size: 14px; line-height: 1.5;">Hola <strong>${shippingData?.nombre || user?.name || 'Fan LaikaClub'}</strong>,<br/>Tu pago por <strong>$${(finalTotal + shippingCost).toFixed(2)} MXN</strong> ha sido procesado exitosamente y tus accesos han sido generados en tu Bóveda Digital.</p>
                        <div style="background: #1f2833; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #66fcf1; margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px;">Resumen de tu Orden:</h4>
                            <ul style="color: #ffffff; font-size: 13px; padding-left: 20px; line-height: 1.6;">
                                ${itemsListHtml}
                            </ul>
                        </div>
                        <p style="color: #c5c6c7; font-size: 13px;">Para mostrar tus códigos QR de ingreso en puerta o consultar tu credencial de sala en vivo, ingresa a la sección <strong>Mis Entradas / Bóveda de Accesos</strong> en nuestra plataforma web, móvil o LaikaWear.</p>
                        <p style="color: #66fcf1; font-weight: bold; margin-top: 30px; font-size: 12px;">GRACIAS POR SER PARTE DEL ECOSISTEMA LAIKACLUB</p>
                    </div>
                `;
                apiClient.post('/admin/emails/send', {
                    email: targetEmail,
                    subject: `Tus boletos de LaikaClub están listos - Orden #${paymentId.toString().slice(-8)}`,
                    htmlContent: emailHtml
                }).catch(e => console.warn('Servicio SMTP no disponible en este momento:', e));
            } catch (mailErr) {
                console.warn('No se pudo iniciar envío de correo SMTP:', mailErr);
            }

            // Disparar Notificación Push Automática (Ticket Purchase)
            import('../../../specialFun/PushNotifications').then(module => {
                const eventName = ticketItems.length > 0 ? (ticketItems[0].eventName || ticketItems[0].name || 'el evento') : 'tu compra';
                module.PushEngine.triggerSmart('TICKET_PURCHASE', {
                    eventName,
                    url: `${window.location.origin}/user/tickets`
                });
            }).catch(e => console.error("Error triggering push:", e));

            success('¡Transacción completada exitosamente!');
            clearCart();
            localStorage.removeItem('checkout_shipping');
            setCurrentPhaseIndex(checkoutPhases.indexOf('success'));
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
        // Clasificación y tipo de compra
        cart,
        ticketItems,
        merchItems,
        hasMerch,
        hasTickets,
        orderType,
        checkoutPhases,
        currentPhase,
        currentPhaseIndex,
        goToNextPhase,
        goToPrevPhase,
        jumpToPhase,

        // Totales y comisiones
        total,
        serviceFee,
        discount,
        finalTotal,
        shippingCost,
        grandTotal,
        checkoutError,
        setCheckoutError,

        // Entrega y Direcciones Guardadas
        deliveryType,
        setDeliveryType,
        needsShippingForm,
        shippingData,
        handleShippingChange,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        saveNewAddress,
        setSaveNewAddress,
        editingAddressId,
        setEditingAddressId,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,

        // Pago y Tarjetas Guardadas
        paymentMethod,
        setPaymentMethod,
        processing,
        cardData,
        handleCardChange,
        savedCards,
        removeCard,
        updateCard,
        editingCardId,
        setEditingCardId,

        // Acciones
        handleFinalPayment,
    };
};
