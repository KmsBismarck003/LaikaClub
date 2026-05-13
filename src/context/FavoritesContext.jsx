import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
    return useContext(FavoritesContext);
};

const getFavoritesKey = (user) => user ? `favorites_${user.id}` : 'favorites_guest';

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const { success, info } = useNotification();
    const { user } = useAuth();

    // Open/Close logic
    const openFavorites = useCallback(() => setIsFavoritesOpen(true), []);
    const closeFavorites = useCallback(() => setIsFavoritesOpen(false), []);
    const toggleFavorites = useCallback(() => setIsFavoritesOpen(prev => !prev), []);

    // Load favorites from LocalStorage
    useEffect(() => {
        const favKey = getFavoritesKey(user);
        const storedFavs = localStorage.getItem(favKey);

        if (storedFavs) {
            try {
                setFavorites(JSON.parse(storedFavs));
            } catch (e) {
                console.error("Error loading favorites", e);
                setFavorites([]);
            }
        } else {
            setFavorites([]);
        }
    }, [user]);

    // Save favorites to LocalStorage
    useEffect(() => {
        const favKey = getFavoritesKey(user);
        localStorage.setItem(favKey, JSON.stringify(favorites));
    }, [favorites, user]);

    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const isFav = prev.some(item => item.id === product.id);
            if (isFav) {
                info(`${product.name} eliminado de favoritos`);
                return prev.filter(item => item.id !== product.id);
            } else {
                success(`${product.name} añadido a favoritos`);
                return [...prev, product];
            }
        });
    };

    const isFavorite = (productId) => {
        return favorites.some(item => item.id === productId);
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            favoritesCount: favorites.length,
            isFavoritesOpen,
            openFavorites,
            closeFavorites,
            toggleFavorites,
            toggleFavorite,
            isFavorite,
            clearFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};
