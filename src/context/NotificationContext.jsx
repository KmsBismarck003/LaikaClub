import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import NotificationDetailModal from '../components/Notifications/NotificationDetailModal';

const NotificationContext = createContext(null);

// Patrones que identifican notificaciones internas/técnicas que solo deben ser visibles para administradores
const TECHNICAL_PATTERNS = [
  /respaldo/i,
  /restauraci[oó]n/i,
  /nosql/i,
  /sql/i,
  /base de datos/i,
  /database/i,
  /mongo/i,
  /mysql/i,
  /auditor[ií]a/i,
  /tabla(s)?/i,
  /configuraci[oó]n del sistema/i,
  /smtp/i,
  /token(s)? push/i,
  /gateway/i,
  /microservicio/i,
  /b[oó]veda cloud/i,
  /boveda cloud/i,
  /falla de conexi[oó]n/i,
  /limpiar cach[eé]/i,
  /optimizar db/i
];

export const isTechnicalNotification = (item) => {
  if (!item) return false;
  const content = `${item.title || ''} ${item.message || ''} ${item.detail || ''}`;
  return TECHNICAL_PATTERNS.some(regex => regex.test(content));
};

const getStorageKey = (uid) => uid ? `laika_notifications_${uid}` : 'laika_notifications_guest';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [history, setHistory] = useState([]);

  // Identificador único del usuario activo
  const currentUserId = user?.id || user?.userId || user?._id || user?.email || null;

  // Cargar historial segmentado cuando cambie el usuario activo
  useEffect(() => {
    const key = getStorageKey(currentUserId);
    const saved = localStorage.getItem(key);

    // Limpieza de compatibilidad: eliminar el antiguo almacenamiento global no segmentado
    if (localStorage.getItem('notification_history')) {
      localStorage.removeItem('notification_history');
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          return;
        }
      } catch (e) {
        console.warn('Error parseando historial de notificaciones:', e);
      }
    }

    // Si es un usuario autenticado y no tiene historial previo, inicializar con bienvenida amigable
    if (currentUserId && user) {
      const isClient = user.role === 'usuario' || !user.role;
      const initial = isClient ? [
        {
          id: `welcome-${currentUserId}`,
          userId: currentUserId,
          role: 'usuario',
          title: '¡Bienvenido a LaikaClub!',
          message: `Hola ${user.firstName || user.name || 'Fan'}, tu cuenta está lista. Aquí recibirás el estado de tus compras, boletos y accesos.`,
          detail: 'Revisa tu Bóveda Digital para consultar tus boletos o visita Laika Shop para adquirir mercancía oficial.',
          actionUrl: '/user/tickets',
          actionLabel: 'Ver Bóveda Digital',
          type: 'info',
          read: false,
          timestamp: Date.now()
        }
      ] : [
        {
          id: `welcome-staff-${currentUserId}`,
          userId: currentUserId,
          role: user.role || 'admin',
          title: 'Panel Operativo Conectado',
          message: `Sesión iniciada con privilegios de ${user.role?.toUpperCase() || 'ADMIN'}.`,
          detail: 'Las alertas operativas y registros de auditoría se sincronizarán en este apartado.',
          actionUrl: user.role === 'admin' ? '/admin' : (user.role === 'gestor' ? '/gestor' : '/operador'),
          actionLabel: 'Ir al Dashboard',
          type: 'info',
          read: false,
          timestamp: Date.now()
        }
      ];

      localStorage.setItem(key, JSON.stringify(initial));
      setHistory(initial);
    } else {
      setHistory([]);
    }
  }, [currentUserId, user?.role, user?.firstName, user?.name]);

  // Filtrado de seguridad y rol del historial
  const filteredHistory = useMemo(() => {
    return history.filter(n => {
      // 1. Aislamiento por usuario: si la notificación tiene userId y hay usuario logueado, debe coincidir
      if (n.userId && currentUserId && String(n.userId) !== String(currentUserId)) {
        return false;
      }

      const isAdmin = user?.role === 'admin';

      // 2. Seguridad y Privacidad: Mensajes técnicos SOLO para el administrador
      if (isTechnicalNotification(n) && !isAdmin) {
        return false;
      }

      // 3. Notificaciones exclusivas de rol admin
      if (n.role === 'admin' && !isAdmin) {
        return false;
      }

      // 4. Si el usuario es cliente normal o visitante, ocultar alertas dirigidas a staff
      if ((!user || user.role === 'usuario') && ['admin', 'gestor', 'operador', 'matis'].includes(n.role)) {
        return false;
      }

      // 5. Difusiones globales limpias
      if (n.role === 'all') return true;

      // 6. Si no hay usuario logueado
      if (!user) return false;

      // 7. Coincidencia exacta de rol
      return n.role === user.role;
    });
  }, [history, currentUserId, user]);

  const unreadCount = filteredHistory.filter(n => !n.read).length;

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification) => {
    const timestamp = Date.now();
    const id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    const activeUserId = user?.id || user?.userId || user?._id || user?.email || null;
    const currentRole = user?.role || 'usuario';

    // Detección automática de contenido técnico
    const isTech = isTechnicalNotification(notification);

    // Determinar rol destinatario:
    // - Si notification.role viene explícito, se respeta (salvo si es técnico y dice 'all', que se acota a 'admin')
    // - Si es técnico o el usuario es admin -> 'admin'
    // - Si el usuario es gestor -> 'gestor'
    // - Si el usuario es operador -> 'operador'
    // - Por defecto -> 'usuario' (NUNCA 'all' por omisión)
    let assignedRole = notification.role;
    if (!assignedRole || (assignedRole === 'all' && isTech)) {
      if (isTech || currentRole === 'admin') {
        assignedRole = 'admin';
      } else if (currentRole === 'gestor') {
        assignedRole = 'gestor';
      } else if (currentRole === 'operador') {
        assignedRole = 'operador';
      } else {
        assignedRole = 'usuario';
      }
    }

    const newNotification = {
      type: 'info',
      title: 'Nueva Notificación',
      message: '',
      detail: '',
      duration: 5000,
      read: false,
      ...notification,
      id,
      userId: notification.userId || activeUserId,
      role: assignedRole,
      timestamp
    };

    // Guardar en el historial del usuario activo
    setHistory(prev => {
      // Evitar duplicados idénticos consecutivos en menos de 1 minuto
      if (prev.length > 0) {
        const last = prev[0];
        if (last.title === newNotification.title &&
          last.message === newNotification.message &&
          (newNotification.timestamp - last.timestamp) < 60000) {
          return prev;
        }
      }
      const updated = [newNotification, ...prev].slice(0, 40);
      const key = getStorageKey(activeUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });

    return id;
  }, [user]);

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(n => n.id !== id);
      const key = getStorageKey(currentUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [currentUserId]);

  const markAsRead = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const key = getStorageKey(currentUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [currentUserId]);

  const markAllAsRead = useCallback(() => {
    setHistory(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const key = getStorageKey(currentUserId);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [currentUserId]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    const key = getStorageKey(currentUserId);
    localStorage.removeItem(key);
  }, [currentUserId]);

  const success = useCallback((message, options = {}) => addNotification({ type: 'success', message, ...options }), [addNotification]);
  const error = useCallback((message, options = {}) => addNotification({ type: 'error', message, ...options }), [addNotification]);
  const warning = useCallback((message, options = {}) => addNotification({ type: 'warning', message, ...options }), [addNotification]);
  const info = useCallback((message, options = {}) => addNotification({ type: 'info', message, ...options }), [addNotification]);

  const showNotification = useCallback((first, second, third, options = {}) => {
    if (third !== undefined) {
      addNotification({ title: first, message: second, type: third, ...options });
    } else if (second !== undefined) {
      const isType = ['success', 'error', 'warning', 'info'].includes(second);
      if (isType) {
        addNotification({ title: 'Aviso', message: first, type: second, ...options });
      } else {
        addNotification({ title: first, message: second, type: 'info', ...options });
      }
    } else {
      addNotification({ title: 'Aviso', message: first, type: 'info', ...options });
    }
  }, [addNotification]);

  const value = {
    notifications,
    history: filteredHistory,
    unreadCount,
    selectedNotification,
    addNotification,
    removeNotification,
    removeFromHistory,
    markAsRead,
    markAllAsRead,
    clearHistory,
    setSelectedNotification,
    success,
    error,
    warning,
    info,
    showNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export default NotificationContext;
