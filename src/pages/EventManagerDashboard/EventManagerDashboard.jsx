import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Icon, AnimatedCounter, Button, Modal } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import EventList from '../manager/EventList';
import { useSearchParams } from 'react-router-dom';
import VenueMapSVG from '../../components/VenueMapSVG';


const EventManagerDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab');
    const { user } = useAuth();

    // Venue & Rooms Modal state
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showRoomsModal, setShowRoomsModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const [selectedRoomForMap, setSelectedRoomForMap] = useState(null);
    const [roomMapData, setRoomMapData] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);

    const handleOpenRoomsModal = async (venue) => {
        setSelectedVenue(venue);
        setShowRoomsModal(true);
        setLoadingRooms(true);
        setSelectedRoomForMap(null);
        setRoomMapData([]);
        try {
            const data = await api.venue.getRooms(venue.id);
            setRooms(data || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    };

    const handleViewRoomMap = async (room) => {
        setSelectedRoomForMap(room);
        setLoadingMap(true);
        setRoomMapData([]);
        try {
            const response = await api.venue.getRoomMap(room.id);
            if (response && response.layout_json?.components) {
                setRoomMapData(response.layout_json.components);
            } else {
                setRoomMapData([]);
            }
        } catch (error) {
            console.error('Error fetching room map:', error);
            setRoomMapData([]);
        } finally {
            setLoadingMap(false);
        }
    };

    const { info } = useNotification();
    const [stats, setStats] = useState({
        totalEvents: 0,
        publishedEvents: 0,
        totalSold: 0,
        totalRevenue: 0
    });
    const [myVenues, setMyVenues] = useState([]);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [displayText, setDisplayText] = useState('');
    const fullText = `¡Hola, ${user?.firstName || 'Gestor'}!`;

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setDisplayText(fullText.slice(0, index + 1));
            index++;
            if (index >= fullText.length) clearInterval(timer);
        }, 100);
        return () => clearInterval(timer);
    }, [fullText]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const events = await api.manager.getMyEvents();
                const totalSold = events.reduce((acc, curr) => acc + (parseInt(curr.tickets_sold) || 0), 0);
                const totalRevenue = events.reduce((acc, curr) => acc + (parseFloat(curr.revenue) || 0), 0);
                
                setStats({
                    totalEvents: events.length,
                    publishedEvents: events.filter(e => e.status === 'published').length,
                    totalSold,
                    totalRevenue
                });
            } catch (error) {
                console.error('Error fetching manager stats:', error);
            }
        };

        const fetchVenues = async () => {
            setLoadingVenues(true);
            try {
                // Filtrar por manager_id si es gestor
                const params = { status_filter: 'active' };
                if (user?.role === 'gestor') {
                    params.manager_id = user.id;
                }
                const data = await api.venue.getAll(params);
                setMyVenues(data);
            } catch (error) {
                console.error('Error fetching manager venues:', error);
            } finally {
                setLoadingVenues(false);
            }
        };

        fetchStats();
        fetchVenues();
    }, [user]);

    const shortcuts = [
        { id: 'events', label: 'Mis Eventos', path: '/events/manage?tab=list', icon: 'calendar' },
        { id: 'stats', label: 'Analíticas', path: '/manager/analytics', icon: 'chart' },
        { id: 'transactions', label: 'Ventas', path: '/manager/transactions', icon: 'dollarSign' },
        { id: 'attendees', label: 'Asistentes', path: '/manager/attendees', icon: 'users' },
        { id: 'create', label: 'Nuevo Evento', path: '/events/create', icon: 'plus' },
        { id: 'ads', label: 'Publicidad', path: '/manager/ads', icon: 'image' },
        { id: 'map', label: 'Diseño de Sala', path: '/events/manage?tab=venues', icon: 'map' }
    ];

    if (activeTab === 'list') {
        return (
            <div className="admin-dashboard-page">
                <header className="dashboard-header" style={{ marginBottom: '1rem' }}>
                    <Button variant="ghost" onClick={() => navigate('/events/manage')}>
                        <Icon name="arrowLeft" size={16} className="mr-2" /> VOLVER AL MONITOR
                    </Button>
                </header>
                <EventList />
            </div>
        );
    }

    return (

        <div className="admin-dashboard-page">
            <header className="dashboard-header">
                <div className="welcome-banner">
                    <h1 className="welcome-greeting">{displayText}</h1>
                    <p className="welcome-date">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </header>

            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-info">
                        <p className="stat-label">Total Eventos</p>
                        <h2 className="stat-value"><AnimatedCounter value={stats.totalEvents} /></h2>
                    </div>
                    <div className="stat-icon"><Icon name="calendar" size={20} /></div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-info">
                        <p className="stat-label">Boletos Vendidos</p>
                        <h2 className="stat-value"><AnimatedCounter value={stats.totalSold} /></h2>
                    </div>
                    <div className="stat-icon"><Icon name="ticket" size={20} /></div>
                </Card>

                <Card className="stat-card hero-stat-dark">
                    <div className="stat-info">
                        <p className="stat-label">Recaudación</p>
                        <h2 className="stat-value">$<AnimatedCounter value={stats.totalRevenue} /></h2>
                    </div>
                    <div className="stat-icon"><Icon name="dollarSign" size={20} /></div>
                </Card>

                <Card className="stat-card">
                    <div className="stat-info">
                        <p className="stat-label">Publicados</p>
                        <h2 className="stat-value"><AnimatedCounter value={stats.publishedEvents} /></h2>
                    </div>
                    <div className="stat-icon"><Icon name="checkCircle" size={20} /></div>
                </Card>
            </div>

            <div className="dashboard-shortcuts">
                <div className="shortcuts-section">
                    <h3 className="section-title"><Icon name="grid" size={16} /> Panel de Control</h3>
                    <div className="shortcuts-grid">
                        {shortcuts.map(item => (
                            <div key={item.id} className="shortcut-card" onClick={() => navigate(item.path)}>
                                <p className="shortcut-label">{item.label}</p>
                                <div className="icon-container"><Icon name={item.icon} size={18} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="dashboard-shortcuts" style={{ marginTop: '2rem' }}>
                <div className="shortcuts-section">
                    <h3 className="section-title"><Icon name="map" size={16} /> Mis Recintos Asignados</h3>
                    <div className="venues-horizontal-list">
                        {loadingVenues ? (
                            <div className="loading-placeholder">Cargando recintos...</div>
                        ) : myVenues.length === 0 ? (
                            <div className="empty-venues-msg">
                                <p>No tienes recintos asignados todavía. Contacta al administrador.</p>
                            </div>
                        ) : (
                            myVenues.map(venue => (
                                <Card key={venue.id} className="venue-mini-card">
                                    <div className="venue-card-content">
                                        <div className="venue-info-main">
                                            <h4 className="venue-name-h4">{venue.name}</h4>
                                            <p className="venue-location-p"><Icon name="map-pin" size={10} /> {venue.city}</p>
                                        </div>
                                        <div className="venue-card-actions" style={{ display: 'flex', gap: '8px' }}>
                                            <Button 
                                                size="small" 
                                                variant="primary" 
                                                onClick={() => navigate(`/events/create?venue_id=${venue.id}`)}
                                                className="quick-event-btn"
                                                style={{ flex: 1 }}
                                            >
                                                <Icon name="plus" size={12} className="mr-1" /> CREAR EVENTO
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant="outline" 
                                                onClick={() => handleOpenRoomsModal(venue)}
                                                className="quick-event-btn"
                                                style={{ flex: 1 }}
                                            >
                                                <Icon name="map" size={12} className="mr-1" /> MAPA
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-footer-grid">
                <div className="health-panel premium-vitals" style={{ background: '#fff' }}>
                    <div className="health-item">
                        <div className="status-dot online"></div>
                        <div>
                            <span className="health-label">Estado Gestor</span>
                            <div className="health-value">ACTIVO</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms View & Map Modal */}
            <Modal
                isOpen={showRoomsModal}
                onClose={() => {
                    setShowRoomsModal(false);
                    setSelectedVenue(null);
                    setSelectedRoomForMap(null);
                    setRoomMapData([]);
                }}
                title={`Salas de ${selectedVenue?.name || 'Recinto'}`}
                size="large"
            >
                <div className="rooms-modal-layout">
                    <div className="rooms-list-panel">
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: '#1a1a1a', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                            🚪 Selecciona una Sala
                        </h3>
                        {loadingRooms ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>Cargando salas...</div>
                        ) : rooms.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                                No hay salas registradas para este recinto.
                            </div>
                        ) : (
                            rooms.map(room => (
                                <div 
                                    key={room.id} 
                                    className={`room-item-card ${selectedRoomForMap?.id === room.id ? 'active' : ''}`}
                                    onClick={() => handleViewRoomMap(room)}
                                >
                                    <div className="room-item-info">
                                        <span className="room-item-name">{room.name}</span>
                                        <span className="room-item-capacity">
                                            <Icon name="users" size={10} style={{ marginRight: '4px' }} />
                                            Capacidad: {room.capacity || room.total_capacity || 'N/D'}
                                        </span>
                                    </div>
                                    <div className="room-item-actions" onClick={(e) => e.stopPropagation()}>
                                        <Button 
                                            size="small" 
                                            variant="outline"
                                            onClick={() => navigate(`/manager/venues/${selectedVenue.id}/rooms/${room.id}/map`)}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="map-preview-panel">
                        {loadingMap ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#666' }}>
                                <div className="avm-loading-spinner" />
                                <span style={{ fontSize: '0.8rem' }}>Cargando mapa de asientos...</span>
                            </div>
                        ) : !selectedRoomForMap ? (
                            <div className="modal-no-map">
                                <span className="modal-no-map-icon">🗺️</span>
                                <span className="modal-no-map-title">Vista del Mapa de Asientos</span>
                                <span className="modal-no-map-desc">Selecciona una sala a la izquierda para ver su mapa interactivo.</span>
                            </div>
                        ) : roomMapData.length > 0 ? (
                            <div style={{ width: '100%', height: '360px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>
                                    <span>Distribución de: {selectedRoomForMap.name}</span>
                                    <span style={{ color: '#a855f7' }}>Modo Lectura</span>
                                </div>
                                <VenueMapSVG mapData={roomMapData} readOnly={true} height="100%" />
                            </div>
                        ) : (
                            <div className="modal-no-map">
                                <span className="modal-no-map-icon">✏️</span>
                                <span className="modal-no-map-title">Sin mapa de asientos</span>
                                <span className="modal-no-map-desc">Esta sala no cuenta con un mapa interactivo configurado actualmente.</span>
                                <Button 
                                    size="small" 
                                    variant="primary"
                                    onClick={() => navigate(`/manager/venues/${selectedVenue.id}/rooms/${selectedRoomForMap.id}/map`)}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    Diseñar Mapa Ahora
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
            
            <style>{`
                .section-title { font-size: 0.8rem; font-weight: 900; letter-spacing: 0.15em; color: #000; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
                .health-label { font-size: 0.6rem; font-weight: 800; color: #999; }
                .health-value { font-size: 0.75rem; font-weight: 800; color: #000; }
                
                .venues-horizontal-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .venue-mini-card { border: 1px solid #f0f0f0; transition: transform 0.2s; background: #fff; }
                .venue-mini-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .venue-card-content { display: flex; flex-direction: column; gap: 1rem; }
                .venue-name-h4 { font-size: 0.9rem; font-weight: 800; color: #1a1a1a; margin: 0; }
                .venue-location-p { font-size: 0.75rem; color: #666; margin: 0.2rem 0 0 0; display: flex; align-items: center; gap: 4px; }
                .venue-card-actions { border-top: 1px solid #f9f9f9; padding-top: 0.75rem; }
                .quick-event-btn { width: 100%; font-weight: 700; font-size: 0.7rem; }
                .empty-venues-msg { padding: 2rem; text-align: center; color: #999; font-size: 0.8rem; background: #fcfcfc; border-radius: 10px; border: 1px dashed #ddd; width: 100%; }

                /* Rooms & Map Modal Styles */
                .rooms-modal-layout {
                    display: flex;
                    gap: 1.5rem;
                    min-height: 400px;
                }
                .rooms-list-panel {
                    flex: 2;
                    border-right: 1px solid #f0f0f0;
                    padding-right: 1.5rem;
                    max-height: 500px;
                    overflow-y: auto;
                }
                .map-preview-panel {
                    flex: 3;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #fafafa;
                    border-radius: 12px;
                    padding: 1rem;
                    border: 1px solid #eaeaea;
                    min-height: 400px;
                }
                .room-item-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .room-item-card:hover {
                    border-color: #a855f7;
                    background: #fbf8ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(168,85,247,0.05);
                }
                .room-item-card.active {
                    border-color: #a855f7;
                    background: #f3e8ff;
                    box-shadow: 0 4px 12px rgba(168,85,247,0.08);
                }
                .room-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .room-item-name {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #1a1a1a;
                }
                .room-item-capacity {
                    font-size: 0.75rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .room-item-actions {
                    display: flex;
                    gap: 8px;
                }
                .modal-no-map {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: #666;
                    text-align: center;
                    padding: 2rem;
                }
                .modal-no-map-icon {
                    font-size: 2.5rem;
                    opacity: 0.5;
                }
                .modal-no-map-title {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #333;
                }
                .modal-no-map-desc {
                    font-size: 0.8rem;
                    color: #888;
                    max-width: 250px;
                }
                .avm-loading-spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid rgba(0,0,0,0.1);
                    border-top-color: #a855f7;
                    border-radius: 50%;
                    animation: avm-spin 1s linear infinite;
                }
                @keyframes avm-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default EventManagerDashboard;
