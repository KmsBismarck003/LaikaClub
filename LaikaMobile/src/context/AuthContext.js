import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const standardizeUser = (u) => {
    if (!u) return null;
    return {
      ...u,
      firstName: u.firstName || u.first_name || '',
      lastName: u.lastName || u.last_name || '',
      avatarUrl: u.avatarUrl || u.avatar_url || '',
      laikaPoints: u.laikaPoints || u.laika_points || 0,
      role: u.role || 'usuario',
    };
  };

  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Helper to persist auth data
  const saveAuthData = async (token, userObj) => {
    try {
      await AsyncStorage.setItem('token', token);
      const stdUser = standardizeUser(userObj);
      await AsyncStorage.setItem('user', JSON.stringify(stdUser));
      setUserState(stdUser);
    } catch (e) {
      console.error('Error saving auth data:', e);
    }
  };

  const logout = useCallback(async (redirect = true) => {
    if (redirect) {
      setLoggingOut(true);
    }

    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Could not register logout in server:', err);
    }

    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error('Error removing auth items:', e);
    }

    setUserState(null);
    setLoggingOut(false);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (!token || !storedUser) {
        setUserState(null);
        setLoading(false);
        return;
      }

      setUserState(standardizeUser(JSON.parse(storedUser)));

      try {
        const data = await authAPI.verifyToken();
        if (data.valid && data.user) {
          const std = standardizeUser(data.user);
          await AsyncStorage.setItem('user', JSON.stringify(std));
          setUserState(std);
        } else {
          throw { status: 401, message: 'Token inválido' };
        }
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          throw error;
        }
        console.warn('Server offline, keeping local user details');
      }
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        console.warn('Session expired:', error.message);
        await logout(false);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      await saveAuthData(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        status: error.status,
        error: error.message || 'Error de conexión con el servidor',
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      await saveAuthData(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión con el servidor',
      };
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUserState(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (Array.isArray(roles)) return roles.includes(user.role);
      return user.role === roles;
    },
    [user]
  );

  const isAuthenticated = useCallback(() => !!user, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAuthenticated,
    loggingOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;
