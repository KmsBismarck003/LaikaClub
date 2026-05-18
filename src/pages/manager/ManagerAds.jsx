import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { Card, Table, Button, Badge, Input, Modal, Alert } from '../../components';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../../components';

const ManagerAds = () => {
    const { success, error: showError } = useNotification();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [myEvents, setMyEvents] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link_url: '',
        position: 'main',
        active: true,
        event_id: ''
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch manager's events first
                const eventsData = await api.event.getAll({ manager_id: user.id });
                const filteredEvents = eventsData.filter(e => e.ads_enabled);
                setMyEvents(filteredEvents);

                // Fetch ads and filter by the manager's events
                const adsData = await api.ads.getAll({ manager_id: user.id });
                const managerEventIds = filteredEvents.map(e => String(e.id));
                const filteredAds = adsData.filter(ad => managerEventIds.includes(String(ad.event_id)));
                setAds(filteredAds);
            } catch (error) {
                console.error('Error loading manager ads data:', error);
                showError('Error al cargar la información de publicidad');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const data = await api.event.getAll({ manager_id: user.id });
            const filtered = data.filter(e => e.ads_enabled);
            setMyEvents(filtered);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const data = await api.ads.getAll({ manager_id: user.id });
            const managerEventIds = myEvents.map(e => String(e.id));
            const filteredAds = data.filter(ad => managerEventIds.includes(String(ad.event_id)));
            setAds(filteredAds);
        } catch (error) {
            console.error('Error fetching ads:', error);
            showError('Error al cargar tus anuncios');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                title: ad.title || '',
                image_url: ad.image_url || '',
                link_url: ad.link_url || '',
                position: ad.position || 'main',
                active: Boolean(ad.active),
                event_id: ad.event_id || ''
            });
        } else {
            setEditingAd(null);
            setFormData({
                title: '',
                image_url: '',
                link_url: '',
                position: 'main',
                active: true,
                event_id: myEvents.length > 0 ? myEvents[0].id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar límite de anuncios por evento
        const selectedEvent = myEvents.find(ev => String(ev.id) === String(formData.event_id));
        if (selectedEvent) {
            const eventAdsCount = ads.filter(a => String(a.event_id) === String(selectedEvent.id)).length;
            if (!editingAd && eventAdsCount >= (selectedEvent.max_ads || 5)) {
                showError(`Has alcanzado el límite de ${selectedEvent.max_ads || 5} anuncios para este evento.`);
                return;
            }
        }

        try {
            if (editingAd) {
                await api.ads.update(editingAd.id, formData);
                success('Anuncio actualizado');
            } else {
                await api.ads.create(formData);
                success('Anuncio creado');
            }
            setIsModalOpen(false);
            fetchAds();
        } catch (error) {
            showError('Error al guardar el anuncio');
        }
    };

    const columns = [
        {
            key: 'image_url',
            header: 'Miniatura',
            render: (url) => (
                <div style={{ width: '80px', height: '45px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={getImageUrl(url)} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )
        },
        { key: 'title', header: 'Título' },
        { 
            key: 'event_id', 
            header: 'Evento Asociado',
            render: (id) => {
                const ev = myEvents.find(e => String(e.id) === String(id));
                if (!ev) return <span style={{color: '#ef4444', fontWeight: 600}}>⚠️ Evento no disponible / Sin permisos</span>;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600 }}>{ev.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Publicidad Habilitada (Límite: {ev.max_ads || 5})</span>
                    </div>
                );
            }
        },
        {
            key: 'active',
            header: 'Estado',
            render: (active) => <Badge variant={active ? 'success' : 'secondary'}>{active ? 'Activo' : 'Pausado'}</Badge>
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button size="small" variant="outline" onClick={() => handleOpenModal(row)}>Editar</Button>
                </div>
            )
        }
    ];

    return (
        <div className="manager-ads-page" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Gestión de Publicidad</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Promociona tus eventos con banners personalizados</p>
                </div>
                <Button onClick={() => handleOpenModal()} variant="primary" disabled={myEvents.length === 0}>
                    <Icon name="plus" size={16} className="mr-2" /> Nuevo Anuncio
                </Button>
            </div>

            {myEvents.length === 0 && !loading && (
                <Alert variant="warning" title="Sin Permisos de Publicidad">
                    Actualmente no tienes eventos con publicidad habilitada por el administrador. 
                    Contacta al soporte para habilitar este paquete en tus misiones.
                </Alert>
            )}

            <Card className="glass-panel" style={{ padding: 0 }}>
                <Table columns={columns} data={ads} loading={loading} />
            </Card>

            {isModalOpen && (
                <Modal isOpen={true} title={editingAd ? 'Editar Anuncio' : 'Nuevo Anuncio'} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="block text-sm font-medium mb-1">Evento Asociado</label>
                            <select 
                                className="w-full p-2 border rounded"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                value={formData.event_id}
                                onChange={e => {
                                    const evId = e.target.value
                                    setFormData({
                                        ...formData, 
                                        event_id: evId,
                                        link_url: evId ? `/event/${evId}` : ''
                                    })
                                }}
                                required
                            >
                                <option value="">-- Elige un evento --</option>
                                {myEvents.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.name} (Límite: {ev.max_ads || 5})</option>
                                ))}
                            </select>
                        </div>

                        <Input 
                            label="Título del Anuncio" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            required 
                        />

                        <div className="form-group">
                            <label className="block text-sm font-medium mb-1">Posición</label>
                            <select 
                                className="w-full p-2 border rounded"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                value={formData.position}
                                onChange={e => setFormData({...formData, position: e.target.value})}
                            >
                                <option value="main">Carrusel Principal (Landing)</option>
                                <option value="side_right">Lateral Derecho (Detalle Evento)</option>
                                <option value="side_left">Lateral Izquierdo (Detalle Evento)</option>
                            </select>

                            {/* Dynamic Recommended Dimensions Banner */}
                            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>📏</span>
                                <div>
                                    <strong>Medidas sugeridas:</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>{formData.position === 'main' ? '1098x342 px (Horizontal / Principal)' : '160x600 px (Vertical / Lateral)'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="block text-sm font-medium mb-1">Imagen del Anuncio</label>
                            <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', background: '#f8fafc' }}>
                                <Input 
                                    type="file" 
                                    onChange={async (e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            try {
                                                const objectUrl = URL.createObjectURL(file)
                                                setFormData({ ...formData, image_url: objectUrl })
                                                const response = await api.ads.upload(file)
                                                const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/api$/, '')
                                                const finalUrl = response.url.startsWith('http')
                                                    ? response.url
                                                    : `${baseUrl}${response.url}`
                                                setFormData(prev => ({ ...prev, image_url: finalUrl }))
                                                success('Imagen subida correctamente')
                                            } catch (err) {
                                                console.error('Upload error:', err)
                                                showError('Error al subir imagen')
                                            }
                                        }
                                    }}
                                    accept="image/*"
                                />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0' }}>
                                    O ingresa una URL manualmente:
                                </p>
                                <Input 
                                    value={formData.image_url} 
                                    onChange={e => setFormData({...formData, image_url: e.target.value})} 
                                    required 
                                    placeholder="https://..."
                                />
                            </div>
                            {formData.image_url && (
                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Previsualización en Vivo:</span>
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: formData.position === 'main' ? '120px' : '220px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        background: '#0f172a',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <img 
                                            src={getImageUrl(formData.image_url)} 
                                            alt="Preview" 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: formData.position === 'main' ? 'cover' : 'contain',
                                                opacity: 0.85
                                            }} 
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '8px 12px',
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                                            color: '#fff',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px'
                                        }}>
                                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{formData.title || 'Título del anuncio'}</span>
                                            <span style={{ fontSize: '0.65rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {formData.position === 'main' ? 'Carrusel Principal' : 'Banner Lateral'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input 
                            label="URL de Redirección (Generada automáticamente al elegir evento)" 
                            value={formData.link_url} 
                            onChange={e => setFormData({...formData, link_url: e.target.value})} 
                            placeholder="https://..."
                        />

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="ad-active"
                                checked={formData.active} 
                                onChange={e => setFormData({...formData, active: e.target.checked})} 
                            />
                            <label htmlFor="ad-active">Anuncio Activo</label>
                        </div>

                        <div className="flex justify-end gap-3 mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="primary">Guardar Anuncio</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ManagerAds;
