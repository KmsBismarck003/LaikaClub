import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

// Service fee percentage (configurable)
const SERVICE_FEE_PERCENT = 10;

// Helper functions for user-scoped localStorage keys
const getCartKey = (user) => {
    if (!user) return 'cart_guest';
    const userId = user.id || user._id || user.email || 'unknown';
    return `cart_${userId}`;
};
const getCardsKey = (user) => {
    if (!user) return 'savedCards_guest';
    const userId = user.id || user._id || user.email || 'unknown';
    return `savedCards_${userId}`;
};
const getAddressesKey = (user) => {
    if (!user) return 'savedAddresses_guest';
    const userId = user.id || user._id || user.email || 'unknown';
    return `savedAddresses_${userId}`;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [savedCards, setSavedCards] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const { success, info } = useNotification();
    const { user } = useAuth();

    // Ref to prevent user cart overwriting during transition
    const loadedUserRef = useRef(undefined);

    // Coupon state
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [serviceFee, setServiceFee] = useState(0);

    // Global Cart Visibility State
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

    // Cargar carrito, tarjetas y direcciones guardadas desde LocalStorage cuando el usuario cambia
    useEffect(() => {
        const cartKey = getCartKey(user);
        const cardsKey = getCardsKey(user);
        const addressesKey = getAddressesKey(user);

        const storedCart = localStorage.getItem(cartKey);
        const storedCards = localStorage.getItem(cardsKey);
        const storedAddresses = localStorage.getItem(addressesKey);

        let parsedCart = [];
        if (storedCart) {
            try {
                parsedCart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error cargando carrito", e);
            }
        }

        // Si el usuario inicia sesión y hay artículos de invitado en localStorage, los transferimos/fusionamos
        if (user) {
            const guestCartStr = localStorage.getItem('cart_guest');
            if (guestCartStr) {
                try {
                    const guestCart = JSON.parse(guestCartStr);
                    if (Array.isArray(guestCart) && guestCart.length > 0) {
                        const mergedCart = [...parsedCart];
                        guestCart.forEach(guestItem => {
                            const existingIndex = mergedCart.findIndex(item =>
                                item.eventId === guestItem.eventId &&
                                item.functionId === guestItem.functionId &&
                                item.sectionId === guestItem.sectionId
                            );
                            if (existingIndex > -1) {
                                mergedCart[existingIndex].quantity += guestItem.quantity;
                                if (guestItem.seats) {
                                    mergedCart[existingIndex].seats = [
                                        ...(mergedCart[existingIndex].seats || []),
                                        ...guestItem.seats
                                    ];
                                }
                            } else {
                                mergedCart.push(guestItem);
                            }
                        });
                        parsedCart = mergedCart;
                        // Guardar inmediatamente en localStorage bajo el usuario
                        localStorage.setItem(cartKey, JSON.stringify(parsedCart));
                        // Limpiar el carrito de invitado
                        localStorage.setItem('cart_guest', JSON.stringify([]));
                    }
                } catch (err) {
                    console.error("Error al fusionar carrito de invitado:", err);
                }
            }
        }

        let parsedCards = [];
        if (storedCards) {
            try {
                parsedCards = JSON.parse(storedCards);
            } catch (e) {
                console.error("Error cargando tarjetas guardadas", e);
            }
        }

        // Si el usuario inicia sesión y hay tarjetas de invitado en localStorage, transferirlas
        if (user) {
            const guestCardsStr = localStorage.getItem('savedCards_guest');
            if (guestCardsStr) {
                try {
                    const guestCards = JSON.parse(guestCardsStr);
                    if (Array.isArray(guestCards) && guestCards.length > 0) {
                        const mergedCards = [...parsedCards];
                        guestCards.forEach(guestCard => {
                            const exists = mergedCards.some(c => c.rawLastFour === guestCard.rawLastFour && c.expiry === guestCard.expiry);
                            if (!exists) mergedCards.push(guestCard);
                        });
                        parsedCards = mergedCards;
                        localStorage.setItem(cardsKey, JSON.stringify(parsedCards));
                        localStorage.setItem('savedCards_guest', JSON.stringify([]));
                    }
                } catch (err) {
                    console.error("Error al fusionar tarjetas de invitado:", err);
                }
            }
        }

        let parsedAddresses = [];
        if (storedAddresses) {
            try {
                parsedAddresses = JSON.parse(storedAddresses);
            } catch (e) {
                console.error("Error cargando direcciones guardadas", e);
            }
        } else if (user && parsedAddresses.length === 0) {
            // Check if there's legacy checkout_shipping in localStorage to migrate as initial saved address
            const oldShipping = localStorage.getItem('checkout_shipping');
            if (oldShipping) {
                try {
                    const parsedOld = JSON.parse(oldShipping);
                    if (parsedOld.calle && parsedOld.ciudad) {
                        parsedAddresses = [{
                            id: Date.now(),
                            alias: 'Dirección Principal',
                            nombre: parsedOld.nombre || user.name || '',
                            apellidos: parsedOld.apellidos || '',
                            email: parsedOld.email || user.email || '',
                            telefono: parsedOld.telefono || '',
                            calle: parsedOld.calle || '',
                            numeroExterior: parsedOld.numeroExterior || '',
                            codigoPostal: parsedOld.codigoPostal || '',
                            colonia: parsedOld.colonia || '',
                            ciudad: parsedOld.ciudad || '',
                            region: parsedOld.region || 'México',
                            observaciones: parsedOld.observaciones || '',
                            isDefault: true
                        }];
                        localStorage.setItem(addressesKey, JSON.stringify(parsedAddresses));
                    }
                } catch (e) {
                    console.error("Error migrando direccion previa", e);
                }
            }
        }

        setCart(parsedCart);
        setSavedCards(parsedCards);
        setSavedAddresses(parsedAddresses);

        // Update the ref to the current user's ID
        loadedUserRef.current = user ? (user.id || user._id || user.email || 'unknown') : 'guest';

        // Limpiar cupón al cambiar de usuario
        setAppliedCoupon(null);
        setDiscount(0);
    }, [user]);

    // Guardar carrito en LocalStorage cuando cambia y recalcular total
    useEffect(() => {
        const currentUserKey = user ? (user.id || user._id || user.email || 'unknown') : 'guest';
        if (loadedUserRef.current !== currentUserKey) {
            return;
        }

        const cartKey = getCartKey(user);
        localStorage.setItem(cartKey, JSON.stringify(cart));

        // Recalcular subtotal
        const newTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(newTotal);

        // Recalcular service fee
        const fee = Math.round(newTotal * (SERVICE_FEE_PERCENT / 100) * 100) / 100;
        setServiceFee(fee);
    }, [cart, user]);

    // Guardar tarjetas en LocalStorage cuando cambien
    useEffect(() => {
        const currentUserKey = user ? (user.id || user._id || user.email || 'unknown') : 'guest';
        if (loadedUserRef.current !== currentUserKey) {
            return;
        }

        const cardsKey = getCardsKey(user);
        localStorage.setItem(cardsKey, JSON.stringify(savedCards));
    }, [savedCards, user]);

    // Guardar direcciones en LocalStorage cuando cambien
    useEffect(() => {
        const currentUserKey = user ? (user.id || user._id || user.email || 'unknown') : 'guest';
        if (loadedUserRef.current !== currentUserKey) {
            return;
        }

        const addressesKey = getAddressesKey(user);
        localStorage.setItem(addressesKey, JSON.stringify(savedAddresses));
    }, [savedAddresses, user]);

    // Load available coupons when user logs in
    useEffect(() => {
        if (user) {
            loadCoupons();
        } else {
            setAvailableCoupons([]);
            setAppliedCoupon(null);
            setDiscount(0);
        }
    }, [user]);

    const loadCoupons = useCallback(async () => {
        try {
            const { achievementsAPI } = await import('../services/api');
            const coupons = await achievementsAPI.getCoupons();
            setAvailableCoupons(Array.isArray(coupons) ? coupons : []);
        } catch (e) {
            // Fail silently - achievements module might not be available
            setAvailableCoupons([]);
        }
    }, []);

    const applyCoupon = useCallback(async (couponCode) => {
        if (total <= 0) return;

        try {
            const { achievementsAPI } = await import('../services/api');
            const result = await achievementsAPI.validateCoupon(couponCode, total, SERVICE_FEE_PERCENT);

            if (result.valid) {
                setAppliedCoupon({
                    code: couponCode,
                    ...result
                });
                setDiscount(result.discount);
                success('Cupon aplicado exitosamente');
            }
        } catch (e) {
            console.error('Error applying coupon:', e);
            setAppliedCoupon(null);
            setDiscount(0);
        }
    }, [total, success]);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setDiscount(0);
    }, []);

    const consumeAppliedCoupon = useCallback(async () => {
        if (!appliedCoupon) return;
        try {
            const { achievementsAPI } = await import('../services/api');
            await achievementsAPI.consumeCoupon(appliedCoupon.code, total, SERVICE_FEE_PERCENT);
        } catch (e) {
            // Non-critical, log and continue
            console.error('Error consuming coupon:', e);
        }
    }, [appliedCoupon, total]);

    const addToCart = (event, quantity = 1, functionData = null, sectionData = null, seats = []) => {
        setCart(prevCart => {
            const functionId = functionData ? functionData.id : null;
            const sectionId = sectionData ? sectionData.id : null;
            const existingItem = prevCart.find(item =>
                item.eventId === event.id && item.functionId === functionId && item.sectionId === sectionId
            );

            // Determinar si devolvemos el mapping o creamos nuevo
            if (existingItem) {
                info(`Se actualizó la cantidad de boletos para ${event.name}`);
                return prevCart.map(item =>
                    (item.eventId === event.id && item.functionId === functionId && item.sectionId === sectionId)
                        ? { ...item, quantity: item.quantity + quantity, seats: [...(item.seats || []), ...seats] }
                        : item
                );
            } else {
                success(`Boletos para ${event.name} agregados al carrito`);
                return [...prevCart, {
                    eventId: event.id,
                    type: event.id.toString().startsWith('merch_') ? 'merch' : 'ticket',
                    functionId: functionId,
                    sectionId: sectionId,
                    eventName: event.name,
                    sectionName: sectionData ? sectionData.name : null,
                    functionDate: functionData ? functionData.date : null,
                    functionTime: functionData ? functionData.time : null,
                    venueName: functionData ? functionData.venue_name : null, // Store venue for display
                    price: sectionData ? parseFloat(sectionData.price) : parseFloat(event.price),
                    quantity,
                    seats: seats || [], // Store selected seats
                    image: event.image_url || event.image
                }];
            }
        });
        // Clear coupon when cart changes
        removeCoupon();
    };

    const addMerchToCart = (product, variant, quantity = 1) => {
        const sizeLabel = variant?.size ? ` | Talla ${variant.size}` : '';
        const colorLabel = variant?.color ? ` | Color ${variant.color}` : '';
        const label = `${sizeLabel}${colorLabel}`;

        addToCart(
            {
                id: `merch_${product.id}`,
                name: `${product.name}${label}`,
                price: parseFloat(variant?.price || product.price || 0),
                image: product.image_url || product.image
            },
            quantity,
            null,
            { id: 'MERCH', name: `MERCH: ${product.category || product.type || 'MERCANCÍA'}`, price: parseFloat(variant?.price || product.price || 0) }
        );
    };

    const removeFromCart = (eventId, functionId = null, sectionId = null) => {
        setCart(prevCart => prevCart.filter(item => !(item.eventId === eventId && item.functionId === functionId && item.sectionId === sectionId)));
        removeCoupon();
    };

    const updateQuantity = (eventId, newQuantity, functionId = null, sectionId = null) => {
        if (newQuantity < 1) return;
        setCart(prevCart =>
            prevCart.map(item =>
                (item.eventId === eventId && item.functionId === functionId && item.sectionId === sectionId)
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
        removeCoupon();
    };

    const clearCart = () => {
        setCart([]);
        removeCoupon();
    };

    // --- Tarjetas Guardadas ---
    const addCard = (card) => {
        const newCard = {
            id: card.id || Date.now(),
            number: card.number?.includes('****') ? card.number : `**** **** **** ${card.number.slice(-4)}`,
            rawLastFour: card.number ? card.number.slice(-4) : '0000',
            holder: card.holder,
            expiry: card.expiry,
            type: 'visa'
        };
        setSavedCards(prev => {
            const exists = prev.some(c => c.rawLastFour === newCard.rawLastFour && c.expiry === newCard.expiry);
            if (exists) {
                return prev.map(c => (c.rawLastFour === newCard.rawLastFour && c.expiry === newCard.expiry) ? { ...c, ...newCard } : c);
            }
            return [...prev, newCard];
        });
        success('Método de pago guardado de forma segura');
        return newCard;
    };

    const updateCard = (cardId, updatedData) => {
        setSavedCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updatedData } : c));
        success('Método de pago actualizado');
    };

    const removeCard = (cardId) => {
        setSavedCards(prev => prev.filter(c => c.id !== cardId));
        info('Método de pago eliminado');
    };

    // --- Direcciones Guardadas ---
    const addAddress = (addressData) => {
        const isFirst = savedAddresses.length === 0;
        const newAddr = {
            ...addressData,
            id: addressData.id || Date.now(),
            isDefault: addressData.isDefault || isFirst,
            alias: addressData.alias || `Dirección #${savedAddresses.length + 1}`
        };
        setSavedAddresses(prev => {
            if (newAddr.isDefault) {
                return [...prev.map(a => ({ ...a, isDefault: false })), newAddr];
            }
            return [...prev, newAddr];
        });
        success('Dirección guardada exitosamente');
        return newAddr;
    };

    const updateAddress = (addressId, updatedData) => {
        setSavedAddresses(prev => {
            const nextList = prev.map(a => a.id === addressId ? { ...a, ...updatedData } : a);
            if (updatedData.isDefault) {
                return nextList.map(a => a.id === addressId ? a : { ...a, isDefault: false });
            }
            return nextList;
        });
        success('Dirección actualizada');
    };

    const removeAddress = (addressId) => {
        setSavedAddresses(prev => {
            const nextList = prev.filter(a => a.id !== addressId);
            if (nextList.length > 0 && !nextList.some(a => a.isDefault)) {
                nextList[0].isDefault = true;
            }
            return nextList;
        });
        info('Dirección eliminada');
    };

    const setDefaultAddress = (addressId) => {
        setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addressId })));
        success('Dirección principal actualizada');
    };

    const finalTotal = Math.max(0, total + serviceFee - discount);

    return (
        <CartContext.Provider value={{
            cart,
            total,
            savedCards,
            savedAddresses,
            addToCart,
            addMerchToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            addCard,
            updateCard,
            removeCard,
            addAddress,
            updateAddress,
            removeAddress,
            setDefaultAddress,
            cartCount: cart.reduce((acc, item) => acc + item.quantity, 0),

            // Coupon & fee state
            serviceFee,
            serviceFeePercent: SERVICE_FEE_PERCENT,
            availableCoupons,
            appliedCoupon,
            discount,
            finalTotal,
            applyCoupon,
            removeCoupon,
            consumeAppliedCoupon,
            loadCoupons,
            
            // Cart Visibility
            isCartOpen,
            openCart,
            closeCart,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

