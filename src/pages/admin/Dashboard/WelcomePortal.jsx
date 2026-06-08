import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Card, Icon, LoadingScreen, ConfirmationModal } from '../../../components';
import './WelcomePortal.css';

const WelcomePortal = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isEntering, setIsEntering] = useState(true);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        // Simular una carga premium de datos del sistema
        const timer = setTimeout(() => setIsEntering(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
    };

    const adminItems = [
        {
            id: 'users',
            label: 'CONTROL DE ACCESOS',
            title: 'USUARIOS',
            icon: 'users',
            path: '/admin/users',
            description: 'Administrar usuarios y sus permisos en el sistema'
        },
        {
            id: 'events',
            label: 'GESTIÓN DE EVENTOS',
            title: 'EVENTOS',
            icon: 'calendar',
            path: '/admin/events',
            description: 'Organizar recintos, fechas y personal de apoyo'
        },
        {
            id: 'monitoring',
            label: 'ESTADO DEL SISTEMA',
            title: 'MONITOREO',
            icon: 'monitor',
            path: '/admin/monitoring',
            description: 'Revisar el funcionamiento de la plataforma en vivo'
        },
        {
            id: 'bigdata',
            label: 'PREDICCIONES Y TENDENCIAS',
            title: 'TENDENCIAS',
            icon: 'chart',
            path: '/admin/big-data',
            description: 'Predicción de ingresos y comportamiento de los clientes'
        },
        {
            id: 'sales',
            label: 'REPORTES DE VENTAS',
            title: 'VENTAS',
            icon: 'dollarSign',
            path: '/admin/sales',
            description: 'Resumen de dinero recaudado y boletos vendidos'
        },
        {
            id: 'venues',
            label: 'LUGARES Y SEDES',
            title: 'RECINTOS',
            icon: 'map',
            path: '/admin/venues',
            description: 'Configurar estadios, teatros y sus ubicaciones'
        },
        {
            id: 'ads',
            label: 'PUBLICIDAD Y ANUNCIOS',
            title: 'ANUNCIOS',
            icon: 'megaphone',
            path: '/admin/ads',
            description: 'Diseñar campañas de banners y anuncios promocionales'
        },
        {
            id: 'audit',
            label: 'REGISTRO DE ACCESOS',
            title: 'SEGURIDAD',
            icon: 'shieldCheck',
            path: '/admin/auth-audit',
            description: 'Ver quién y cuándo ha ingresado al sistema'
        },
        {
            id: 'logs',
            label: 'HISTORIAL DE ACTIVIDAD',
            title: 'ACTIVIDAD',
            icon: 'fileText',
            path: '/admin/logs',
            description: 'Registro de cambios realizados por el sistema en tiempo real'
        },
        {
            id: 'database',
            label: 'COPIAS DE SEGURIDAD',
            title: 'RESPALDOS',
            icon: 'database',
            path: '/admin/database',
            description: 'Guardar y restaurar copias de la información del club'
        },
        {
            id: 'config',
            label: 'AJUSTES GLOBALES',
            title: 'CONFIGURACIÓN',
            icon: 'settings',
            path: '/admin/config',
            description: 'Parámetros del club y variables de entorno'
        }
    ];

    const gestorItems = [
        {
            id: 'g_events',
            label: 'MIS EVENTOS',
            title: 'DASHBOARD',
            icon: 'calendar',
            path: '/events/manage',
            description: 'Monitor principal de tus eventos y funciones'
        },
        {
            id: 'g_create',
            label: 'NUEVA PRODUCCIÓN',
            title: 'CREAR EVENTO',
            icon: 'plus',
            path: '/events/create',
            description: 'Lanza un nuevo evento en tus recintos asignados'
        },
        {
            id: 'g_stats',
            label: 'PREDICCIONES Y TENDENCIAS',
            title: 'TENDENCIAS',
            icon: 'chart',
            path: '/manager/analytics',
            description: 'Métricas de ventas y comportamiento de la audiencia'
        },
        {
            id: 'g_attendees',
            label: 'CONTROL DE ASISTENTES',
            title: 'ASISTENTES',
            icon: 'users',
            path: '/manager/attendees',
            description: 'Control de asistencia y accesos al evento'
        },
        {
            id: 'g_ads',
            label: 'ALCANCE COMERCIAL',
            title: 'PUBLICIDAD',
            icon: 'megaphone',
            path: '/manager/ads',
            description: 'Gestiona los anuncios para tus eventos'
        },
        {
            id: 'g_map',
            label: 'ESTRUCTURA',
            title: 'DISEÑO SALA',
            icon: 'map',
            path: '/admin/venue-map',
            description: 'Configura zonas y precios en el mapa de asientos'
        },
        {
            id: 'g_merchandise',
            label: 'DISEÑO DE TIENDA / SOUVENIRS',
            title: 'TIENDA',
            icon: 'shoppingBag',
            path: '/manager/merchandise',
            description: 'Crear productos y controlar el inventario de recuerdos'
        },
        {
            id: 'g_transactions',
            label: 'CONTROL DE VENTAS',
            title: 'VENTAS',
            icon: 'dollarSign',
            path: '/manager/transactions',
            description: 'Historial de dinero ingresado y movimientos de saldo'
        }
    ];

    const staffItems = [
        {
            id: 's_dashboard',
            label: 'ESTADO OPERATIVO',
            title: 'PANEL CONTROL',
            icon: 'monitor',
            path: '/staff/dashboard',
            description: 'Monitor central de operaciones y flujo de asistentes'
        },
        {
            id: 's_terminal',
            label: 'VERIFICACIÓN',
            title: 'TERMINAL',
            icon: 'ticket',
            path: '/staff',
            description: 'Validación de boletos y control de accesos realtime'
        },
        {
            id: 's_events',
            label: 'ASIGNACIÓN',
            title: 'MIS EVENTOS',
            icon: 'calendar',
            path: '/staff/events',
            description: 'Lista de eventos asignados para tu turno'
        },
        {
            id: 's_history',
            label: 'TRAZABILIDAD',
            title: 'HISTORIAL',
            icon: 'history',
            path: '/staff/history',
            description: 'Registro de validaciones e incidencias recientes'
        }
    ];

    const menuItems = user?.role === 'admin' 
        ? adminItems 
        : (user?.role === 'gestor' 
            ? gestorItems 
            : (user?.role === 'operador' ? staffItems : []));
    const defaultPath = user?.role === 'admin' ? '/admin' : (user?.role === 'gestor' ? '/events/manage' : '/staff/dashboard');

    if (isEntering) {
        return <LoadingScreen label="INICIANDO PORTAL" status="CARGANDO ENTRENAMIENTO DE DATOS..." />;
    }

    return (
        <div className="welcome-portal-stage">
            <button className="portal-logout-btn-fixed" onClick={handleLogoutClick} title="Cerrar Sesión">
                <Icon name="logout" size={14} />
                <span>CERRAR SESIÓN</span>
            </button>

            <div className="portal-glass-mount">
                <header className="portal-header-premium">
                    <div className="portal-header-accent" />
                    <div className="portal-brand-mini">LAIKA CLUB • INTEL</div>
                    <h1 className="portal-main-h1">
                        BIENVENIDO, <span className="admin-glow">{user?.firstName?.toUpperCase() || 'ADMINISTRADOR'}</span>
                    </h1>
                    <p className="portal-sub-p">SELECCIONA EL MÓDULO DE TRABAJO PARA COMENZAR</p>
                </header>

                <div className="portal-grid-industrial">
                    {menuItems.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="portal-unit-wrapper"
                            style={{ '--delay': `${index * 0.1}s` }}
                            onClick={() => navigate(item.path)}
                        >
                            <Card className="portal-unit-card">
                                <div className="portal-unit-icon-box">
                                    <div className="portal-unit-orb">
                                        <Icon name={item.icon} size={36} />
                                    </div>
                                </div>
                                <div className="portal-unit-text">
                                    <span className="portal-unit-label">{item.label}</span>
                                    <h3 className="portal-unit-name">{item.title}</h3>
                                    <p className="portal-unit-info">{item.description}</p>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                <footer className="portal-footer-actions">
                    <button className="portal-standard-dash-btn" onClick={() => navigate(defaultPath)}>
                        SALTAR AL PANEL DE CONTROL <Icon name="arrowRight" size={14} />
                    </button>
                </footer>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Cerrar Sesión"
                message="¿Estás seguro de que deseas salir del portal administrativo? Se guardarán todos los cambios de sesión."
                confirmText="SÍ, CERRAR SESIÓN"
                cancelText="CANCELAR"
                variant="danger"
            />
        </div>
    );
};

export default WelcomePortal;
