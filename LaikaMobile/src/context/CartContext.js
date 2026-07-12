import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from AsyncStorage on start
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('laika_cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  const saveCart = async (newItems) => {
    try {
      setCartItems(newItems);
      await AsyncStorage.setItem('laika_cart', JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  };

  const addToCart = (item) => {
    // Check if item is already in cart (same event, section, and seat details)
    const exists = cartItems.some(
      (i) =>
        i.event_id === item.event_id &&
        i.section === item.section &&
        i.row === item.row &&
        i.column === item.column
    );

    if (exists) return false;

    const newItems = [...cartItems, item];
    saveCart(newItems);
    return true;
  };

  const removeFromCart = (eventId, seatKey) => {
    // seatKey can be row-col or specific ID
    const newItems = cartItems.filter(
      (item) => !(item.event_id === eventId && `${item.row}-${item.column}` === seatKey)
    );
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};

export default CartContext;
