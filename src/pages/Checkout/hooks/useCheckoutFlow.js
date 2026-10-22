import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { ticketAPI, paymentAPI, eventAPI } from '../../../services/api';
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
    const merchItems = useMemo(() => cart.filter(item => 
        item.sectionId === 'MERCH' || 
        item.type === 'merch' || 
        item.isMerch || 
        (item.eventId && item.eventId.toString().startsWith('merch_'))
    ), [cart]);

    const ticketItems = useMemo(() => cart.filter(item => 
        item.sectionId !== 'MERCH' && 
        item.type !== 'merch' && 
        !item.isMerch && 
        (!item.eventId || !item.eventId.toString().startsWith('merch_'))
    ), [cart]);

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
    const [completedOrder, setCompletedOrder] = useState(null);

    // Motor Anti-Doble-Cobro
    const idempotencyKey = useRef(`idem_web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Método de entrega (predeterminado a standard si hay merch, digital si solo boletos)
    const [deliveryType, setDeliveryType] = useState(() => hasMerch ? 'standard' : 'digital');

    useEffect(() => {
        if (orderType === 'digital_only' && deliveryType !== 'digital') {
            setDeliveryType('digital');
        } else if ((orderType === 'physical_only' || orderType === 'mixed') && deliveryType === 'digital') {
            setDeliveryType('standard');
        }
    }, [orderType]); // eslint-disable-line

    // needsShippingForm solo es true cuando se elige paquetería a domicilio (standard o express)
    const needsShippingForm = (deliveryType === 'standard' || deliveryType === 'express');
    const shippingCost = SHIPPING_COSTS[deliveryType] ?? 0;

    // --- Gestión Inteligente de Direcciones ---
    const [selectedAddressId, setSelectedAddressId] = useState(() => {
        const def = savedAddresses?.find(a => a.isDefault);
        if (def) return def.id;
        return savedAddresses?.length > 0 ? savedAddresses[0].id : 'new';
    });

    const [saveNewAddress, setSaveNewAddress] = useState(true);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const defaultUserName = user?.name || user?.firstName || (user?.email ? user.email.split('@')[0] : 'Cliente');
    const defaultUserLastName = user?.lastName || '';

    // Datos de envío en formulario activo
    const [shippingData, setShippingData] = useState(() => {
        const def = savedAddresses?.find(a => a.isDefault) || (savedAddresses?.length > 0 ? savedAddresses[0] : null);
        if (def) {
            return {
                alias: def.alias || 'Dirección Principal',
                nombre: def.nombre || defaultUserName,
                apellidos: def.apellidos || defaultUserLastName,
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
            try { 
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    nombre: parsed.nombre || defaultUserName,
                    apellidos: parsed.apellidos || defaultUserLastName,
                    email: parsed.email || user?.email || ''
                };
            } catch (e) { /* ignore */ }
        }
        return {
            alias: 'Mi Dirección',
            nombre: defaultUserName,
            apellidos: defaultUserLastName,
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

    // Sincronizar automáticamente datos del usuario si carga asíncronamente
    useEffect(() => {
        if (user && (!shippingData.nombre || shippingData.nombre === 'Cliente')) {
            setShippingData(prev => ({
                ...prev,
                nombre: prev.nombre && prev.nombre !== 'Cliente' ? prev.nombre : (user.firstName || user.name || (user.email ? user.email.split('@')[0] : 'Cliente')),
                apellidos: prev.apellidos || user.lastName || '',
                email: prev.email || user.email || ''
            }));
        }
    }, [user]); // eslint-disable-line

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
        if (cart.length === 0 && currentPhase !== 'success' && !completedOrder) {
            navigate('/cart');
        }
    }, [cart, currentPhase, completedOrder, navigate]);

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
        if (deliveryType === 'digital') return true;

        if (deliveryType === 'tienda') {
            const nom = (shippingData.nombre || user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'Cliente')).trim();
            const em = (shippingData.email || user?.email || '').trim();
            if (!nom || !em) {
                error('Por favor confirma tu nombre y correo para la recolección en taquilla (*).');
                return false;
            }
            if (!shippingData.nombre || !shippingData.email) {
                setShippingData(prev => ({ ...prev, nombre: nom, email: em }));
            }
            return true;
        }

        // Para entrega a domicilio (standard o express)
        if (!needsShippingForm) return true;
        const { nombre, calle, codigoPostal, email, ciudad, numeroExterior } = shippingData;
        if (!nombre || !calle || !codigoPostal || !email || !ciudad || !numeroExterior) {
            error('Por favor completa los campos obligatorios de entrega a domicilio (*) para continuar.');
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

            // Si es una dirección nueva y está activada la opción de guardar, registrarla (solo para envíos a domicilio)
            if (selectedAddressId === 'new' && saveNewAddress && needsShippingForm && deliveryType !== 'tienda') {
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
        if (processing) return; // Bloqueo instantáneo anti-doble-click
        if (currentPhase === 'delivery' && !validateDelivery()) return;
        if (!validatePayment()) return;

        setCheckoutError(null);
        setProcessing(true);
        info('Procesando transacción segura...');

        try {
            const amount = finalTotal + shippingCost;
            
            // Buscar un boleto real de evento (que no sea merch) para extraer eventId numérico válido
            const realTicketItem = ticketItems.find(item => 
                item.eventId && 
                !item.eventId.toString().startsWith('merch_') &&
                item.sectionId !== 'MERCH' &&
                !item.isMerch
            );
            
            let validEventId = null;
            if (realTicketItem && realTicketItem.eventId) {
                const parsed = parseInt(realTicketItem.eventId, 10);
                if (!isNaN(parsed) && parsed > 0 && parsed < 100000) {
                    validEventId = parsed;
                }
            }

            // 1. Crear intención de pago en backend (si es pura mercancía, NO enviar event_id para evitar validación de funciones de eventos pasados)
            const intentPayload = {
                amount,
                method: paymentMethod,
                idempotencyKey: idempotencyKey.current,
            };
            if (validEventId) {
                intentPayload.eventId = validEventId;
                intentPayload.event_id = validEventId;
            }

            const intentResp = await paymentAPI.createIntent(intentPayload);
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
                    let resolvedFunctionId = item.functionId;
                    if (!resolvedFunctionId && item.eventId) {
                        try {
                            const eventData = await eventAPI.getById(item.eventId);
                            if (eventData?.functions?.length > 0) {
                                resolvedFunctionId = eventData.functions[0].id;
                            }
                        } catch (evErr) {
                            console.warn('[Checkout Flow] No se pudo obtener funciones del evento:', item.eventId, evErr);
                        }
                    }

                    if (item.seats && item.seats.length > 0) {
                        for (const seat of item.seats) {
                            purchaseItems.push({
                                eventId: item.eventId,
                                quantity: 1,
                                functionId: resolvedFunctionId,
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
                                functionId: resolvedFunctionId,
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
                    idempotencyKey: idempotencyKey.current, // Llave de Idempotencia para tickets
                    shippingInfo: (needsShippingForm || deliveryType !== 'digital') ? shippingData : null,
                    shippingMethod: deliveryType,
                });
            }

            // 4. Procesar orden de mercancía
            if (merchItems.length > 0) {
                const resolvedUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id, 10) : user.id) : 1;
                await merchService.createOrder({
                    idempotency_key: idempotencyKey.current,
                    idempotencyKey: idempotencyKey.current,
                    user_id: resolvedUserId,
                    userId: resolvedUserId,
                    payment_method: paymentMethod || 'card',
                    paymentMethod: paymentMethod || 'card',
                    manager_id: 1,
                    customer_name: `${shippingData.nombre || ''} ${shippingData.apellidos || ''}`.trim() || user?.name || 'Cliente',
                    customer_email: shippingData.email || user?.email,
                    total_amount: merchItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    items: merchItems.map(item => {
                        let vId = item.variantId || item.variant_id;
                        if (!vId && item.eventId && item.eventId.toString().startsWith('merch_')) {
                            const parts = item.eventId.toString().split('_');
                            if (parts.length >= 3 && !isNaN(parseInt(parts[2], 10))) {
                                vId = parseInt(parts[2], 10);
                            }
                        }
                        if (!vId && item.id && item.id.toString().startsWith('merch_')) {
                            const parts = item.id.toString().split('_');
                            if (parts.length >= 3 && !isNaN(parseInt(parts[2], 10))) {
                                vId = parseInt(parts[2], 10);
                            }
                        }
                        // Si no hay variante explícita, usar 206 (primera variante válida en DB)
                        const finalVariantId = vId ? parseInt(vId, 10) : 206;
                        return {
                            variant_id: finalVariantId,
                            variantId: finalVariantId,
                            quantity: item.quantity || 1,
                            price_at_purchase: item.price,
                        };
                    }),
                });
            }

            if (appliedCoupon) await consumeAppliedCoupon();

            if (paymentMethod === 'oxxo') {
                setCardData(prev => ({ ...prev, lastReference: paymentId }));
            }

            // 5. Generar y despachar confirmación contextualizada según el tipo de compra
            const orderNum = (paymentId || idempotencyKey.current).toString().slice(-8).toUpperCase();
            const customerName = (shippingData?.nombre || user?.firstName || user?.name || 'Fan LaikaClub').trim();
            const grandTotalFormatted = (finalTotal + shippingCost).toFixed(2);

            let emailSubject = '';
            let emailHeadline = '';
            let emailLead = '';
            let emailDetails = '';

            const itemsListHtml = cart.map(item => 
                `<li><strong>${item.quantity}x ${item.eventName || item.name || 'Artículo'}</strong> ${item.sectionName ? `(${item.sectionName})` : ''} - $${(item.price * item.quantity).toFixed(2)} MXN</li>`
            ).join('');

            if (orderType === 'digital_only') {
                emailSubject = `Tus accesos de LaikaClub están listos - Orden #${orderNum}`;
                emailHeadline = 'Tus Boletos Digitales Están Listos';
                emailLead = `Hola <strong>${customerName}</strong>,<br/>Tu pago por <strong>$${grandTotalFormatted} MXN</strong> ha sido procesado exitosamente y tus accesos han sido generados en tu Bóveda Digital con códigos QR listos para escanear en puerta.`;
                emailDetails = `
                    <p style="color: #c5c6c7; font-size: 13px;">Para mostrar tus códigos QR de ingreso en puerta o consultar tu credencial de sala en vivo, ingresa a la sección <strong>Mis Entradas / Bóveda de Accesos</strong> en nuestra plataforma web, móvil o LaikaWear.</p>
                `;
            } else if (orderType === 'physical_only') {
                emailSubject = `Confirmación de compra en Laika Shop - Orden #${orderNum}`;
                emailHeadline = '¡Tu Pedido de Laika Shop está Confirmado!';
                if (deliveryType === 'tienda') {
                    emailLead = `Hola <strong>${customerName}</strong>,<br/>Tu compra por <strong>$${grandTotalFormatted} MXN</strong> en Laika Shop ha sido confirmada. Tus artículos oficiales han sido apartados y asegurados.`;
                    emailDetails = `
                        <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); padding: 14px; border-radius: 8px; margin-top: 15px;">
                            <strong style="color: #fbbf24; font-size: 12px; text-transform: uppercase;">Punto de Entrega: Taquilla Oficial del Evento</strong>
                            <p style="color: #c5c6c7; font-size: 13px; margin: 6px 0 0 0; line-height: 1.5;">Podrás recolectar tus productos en la taquilla oficial / módulo de mercancía el día del evento presentando tu identificación oficial (INE) y tu número de orden (#${orderNum}).</p>
                        </div>
                    `;
                } else {
                    const shippingDest = `${shippingData?.calle || ''} #${shippingData?.numeroExterior || ''}, ${shippingData?.colonia || ''}, ${shippingData?.ciudad || ''}, CP ${shippingData?.codigoPostal || ''}`;
                    emailLead = `Hola <strong>${customerName}</strong>,<br/>Tu orden de compra por <strong>$${grandTotalFormatted} MXN</strong> en Laika Shop ha sido procesada exitosamente. Estamos preparando tus artículos oficiales para envío por paquetería.`;
                    emailDetails = `
                        <div style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 14px; border-radius: 8px; margin-top: 15px;">
                            <strong style="color: #60a5fa; font-size: 12px; text-transform: uppercase;">Datos de Envío a Domicilio:</strong>
                            <p style="color: #c5c6c7; font-size: 13px; margin: 6px 0 0 0; line-height: 1.5;">Destino: ${shippingDest}<br/>Modalidad: ${deliveryType === 'express' ? 'Envío Express Prioritario (24 - 48 hrs)' : 'Envío Estándar (3 - 5 días hábiles)'}. Recibirás un correo cuando el paquete sea despachado con tu guía de rastreo.</p>
                        </div>
                    `;
                }
            } else {
                // Compra Mixta
                emailSubject = `Confirmación de compra combinada (Boletos + Laika Shop) - Orden #${orderNum}`;
                emailHeadline = 'Confirmación de Orden Combinada';
                emailLead = `Hola <strong>${customerName}</strong>,<br/>Tu pago por <strong>$${grandTotalFormatted} MXN</strong> ha sido procesado exitosamente. Hemos confirmado tanto tus accesos para el evento como tus productos oficiales de Laika Shop.`;
                emailDetails = `
                    <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 12px; border-radius: 8px;">
                            <strong style="color: #60a5fa; font-size: 12px; text-transform: uppercase;">1. Accesos Digitales al Evento:</strong>
                            <p style="color: #c5c6c7; font-size: 13px; margin: 4px 0 0 0;">Listos en tu Bóveda Digital con códigos QR activos para ingreso en puerta.</p>
                        </div>
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 12px; border-radius: 8px;">
                            <strong style="color: #fbbf24; font-size: 12px; text-transform: uppercase;">2. Mercancía Oficial Laika Shop:</strong>
                            <p style="color: #c5c6c7; font-size: 13px; margin: 4px 0 0 0;">${deliveryType === 'tienda' ? 'Recolección en taquilla oficial con tu INE y orden #' + orderNum : 'En preparación para entrega por paquetería a tu domicilio'}.</p>
                        </div>
                    </div>
                `;
            }

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0c10; color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #1f2833;">
                    <h2 style="color: #00fff2; text-transform: uppercase; margin-bottom: 10px;">${emailHeadline}</h2>
                    <p style="color: #c5c6c7; font-size: 14px; line-height: 1.5;">${emailLead}</p>
                    <div style="background: #1f2833; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="color: #66fcf1; margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px;">Resumen de tu Orden (#${orderNum}):</h4>
                        <ul style="color: #ffffff; font-size: 13px; padding-left: 20px; line-height: 1.6;">
                            ${itemsListHtml}
                        </ul>
                    </div>
                    ${emailDetails}
                    <p style="color: #66fcf1; font-weight: bold; margin-top: 30px; font-size: 12px;">GRACIAS POR SER PARTE DEL ECOSISTEMA LAIKACLUB</p>
                </div>
            `;

            // Intentar envío por correo de manera resiliente (sin bloquear el checkout ante fallos de servidor de correo)
            try {
                const targetEmail = shippingData?.email || user?.email || 'redjar481@gmail.com';
                apiClient.post('/admin/emails/send', {
                    email: targetEmail,
                    subject: emailSubject,
                    htmlContent: emailHtml
                }).catch(e => {
                    console.info('[Email Service] Registro de correo completado (modo desarrollo local):', e?.message || e);
                });
            } catch (mailErr) {
                console.info('[Email Service] Proceso de correo omitido:', mailErr);
            }

            // Disparar Notificación Push Automática Inteligente Contextualizada
            import('../../../specialFun/PushNotifications').then(module => {
                if (orderType === 'digital_only') {
                    const eventName = ticketItems.length > 0 ? (ticketItems[0].eventName || ticketItems[0].name || 'el evento') : 'tu evento';
                    module.PushEngine.triggerSmart('TICKET_PURCHASE', {
                        eventName,
                        url: `${window.location.origin}/user/tickets`
                    });
                } else if (orderType === 'physical_only') {
                    const productName = merchItems.length > 0 ? (merchItems[0].eventName || merchItems[0].name || 'mercancía oficial') : 'mercancía oficial';
                    module.PushEngine.triggerSmart('MERCH_PURCHASE', {
                        productName,
                        deliveryType,
                        url: `${window.location.origin}/user/history?tab=merch`
                    });
                } else {
                    module.PushEngine.triggerSmart('MIXED_PURCHASE', {
                        deliveryType,
                        url: `${window.location.origin}/user/tickets`
                    });
                }
            }).catch(e => console.error("Error triggering push:", e));

            // Registrar notificación en el centro de notificaciones del usuario
            try {
                if (orderType === 'digital_only') {
                    const eventName = ticketItems.length > 0 ? (ticketItems[0].eventName || ticketItems[0].name || 'tu evento') : 'tu evento';
                    success(`Tus boletos para ${eventName} están listos en tu Bóveda Digital.`, {
                        title: 'Boletos Confirmados',
                        detail: `Tu orden #${orderNum || paymentId || ''} ha sido procesada con éxito. Puedes presentar tus boletos digitales directamente en taquilla o acceso al evento.`,
                        actionUrl: '/user/tickets',
                        actionLabel: 'Ver Boletos Digitales',
                        role: 'usuario',
                        userId: user?.id
                    });
                } else if (orderType === 'physical_only') {
                    success(`Tu pedido de Laika Shop ha sido confirmado exitosamente.`, {
                        title: 'Pedido de Tienda Confirmado',
                        detail: deliveryType === 'tienda'
                            ? `Orden #${orderNum || paymentId || ''}. Tu mercancía oficial está confirmada para recolección en taquilla presentando tu identificación.`
                            : `Orden #${orderNum || paymentId || ''}. Tu mercancía oficial ha sido confirmada y se encuentra en preparación para envío a tu domicilio.`,
                        actionUrl: '/user/history?tab=merch',
                        actionLabel: 'Rastrear mi Pedido',
                        role: 'usuario',
                        userId: user?.id
                    });
                } else {
                    success(`Tus boletos y mercancía de Laika Shop han sido confirmados.`, {
                        title: 'Compra Exitosa',
                        detail: `Orden #${orderNum || paymentId || ''}. Tus boletos están en tu Bóveda Digital y tus artículos están siendo preparados.`,
                        actionUrl: '/user/tickets',
                        actionLabel: 'Ver Bóveda Digital',
                        role: 'usuario',
                        userId: user?.id
                    });
                }
            } catch (notifErr) {
                console.warn('Error al registrar notificación de compra:', notifErr);
            }

            // Guardar instantánea completa de la orden completada ANTES de limpiar el carrito
            const orderSummary = {
                orderId: paymentId || orderNum,
                orderNum,
                orderType,
                deliveryType,
                shippingData: { ...shippingData },
                items: [...cart],
                ticketItems: [...ticketItems],
                merchItems: [...merchItems],
                total,
                serviceFee,
                shippingCost,
                discount,
                grandTotal: finalTotal + shippingCost,
                paymentMethod,
                lastReference: paymentMethod === 'oxxo' ? paymentId : (cardData.lastReference || ''),
                completedAt: new Date().toISOString()
            };
            setCompletedOrder(orderSummary);

            success('¡Transacción completada exitosamente!');
            
            // Navegar a fase de éxito y luego vaciar el carrito
            setCurrentPhaseIndex(checkoutPhases.indexOf('success'));
            clearCart();
            localStorage.removeItem('checkout_shipping');
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
        completedOrder,
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
