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
            description: 'Gestión integral de usuarios y permisos críticos'
        },
        {
            id: 'events',
            label: 'DESPLIEGUE OPERATIVO',
            title: 'EVENTOS',
            icon: 'calendar',
            path: '/admin/events',
            description: 'Gestión de recintos, fechas y logística de staff'
        },
        {
            id: 'monitoring',
            label: 'ESTADO DEL SISTEMA',
            title: 'MONITOREO',
            icon: 'monitor',
            path: '/admin/monitoring',
            description: 'Monitoreo realtime de infraestructura y servicios'
        },
        {
            id: 'bigdata',
            label: 'INTELIGENCIA DE DATOS',
            title: 'BIG DATA',
            icon: 'chart',
            path: '/admin/big-data',
            description: 'Análisis Spark, tendencias y volumetría 3D'
        },
        {
            id: 'sales',
            label: 'BALANCE FINANCIERO',
            title: 'VENTAS',
            icon: 'dollarSign',
            path: '/admin/sales',
            description: 'Reportes de ingresos, tickets y métricas'
        },
        {
            id: 'venues',
            label: 'INFRAESTRUCTURA FÍSICA',
            title: 'RECINTOS',
            icon: 'map',
            path: '/admin/venues',
            description: 'Gestión de estadios, teatros y mapas'
        },
        {
            id: 'ads',
            label: 'ALCANCE COMERCIAL',
            title: 'PUBLICIDAD',
            icon: 'megaphone',
            path: '/admin/ads',
            description: 'Campañas, banners y gestión de anuncios'
        },
        {
            id: 'audit',
            label: 'SEGURIDAD Y AUDITORÍA',
            title: 'ACCESOS',
            icon: 'shieldCheck',
            path: '/admin/auth-audit',
            description: 'Historial de ingresos y protección de datos'
        },
        {
            id: 'logs',
            label: 'TRAZABILIDAD TÉCNICA',
            title: 'LOGS',
            icon: 'fileText',
            path: '/admin/logs',
            description: 'Depuración y eventos del servidor en tiempo real'
        },
        {
            id: 'database',
            label: 'NÚCLEO DE DATOS',
            title: 'ESTRUCTURA',
            icon: 'database',
            path: '/admin/database',
            description: 'Mantenimiento de DB, backups y seguridad'
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
            label: 'RENDIMIENTO',
            title: 'ANALÍTICAS',
            icon: 'chart',
            path: '/manager/analytics',
            description: 'Métricas de ventas y comportamiento de audiencia'
        },
        {
            id: 'g_attendees',
            label: 'LOGÍSTICA',
            title: 'ASISTENTES',
            icon: 'users',
            path: '/manager/attendees',
            description: 'Control de censo y validación de accesos'
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
            label: 'SHOP Y PRODUCTOS',
            title: 'MERCANCÍA',
            icon: 'shoppingBag',
            path: '/manager/merchandise',
            description: 'Constructor de productos y control de inventario'
        },
        {
            id: 'g_transactions',
            label: 'FINANZAS',
            title: 'TRANSACCIONES',
            icon: 'dollarSign',
            path: '/manager/transactions',
            description: 'Auditoría de ventas y movimientos de saldo'
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
