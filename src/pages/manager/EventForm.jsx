import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Badge, Icon, Modal } from '../../components';
import api, { venueAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import EventCardPreview from './EventCardPreview';
import { PresaleSection } from '../../features/presale';

const formatTime = (time) => {
    if (!time) return '';
    const str = String(time);
    if (str.includes(':')) return str.substring(0, 5);
    if (!isNaN(time)) {
        const totalSec = parseInt(time, 10);
        const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    }
    return '';
};

const EventForm = ({ event = null, onSuccess, onClose }) => {
    const location = useLocation();
    const { success, error, warning } = useNotification();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [venues, setVenues] = useState([]);
    const [rooms, setRooms] = useState([]);

    const hasAdvancedPackage = user?.role === 'admin' || user?.role === 'manager' || user?.package === 'Avanzado' || user?.package_name === 'Avanzado' || (user?.manager_package && user.manager_package.name === 'Avanzado');

    // Form state defaults
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'concert',
        event_date: '',
        event_time: '',
        location: '',
        venue: '',
        venue_id: '',
        total_tickets: 100,
        available_tickets: 100,
        price: 0,
        image_url: '',
        map_url: '',
        seat_map_url: '',
        room_id: '',
        use_seating_map: false,
        ads_enabled: false,
        max_ads: 5,
        merch_enabled: false,
        metrics_enabled: false,
        // Preventa exclusiva
        presale_enabled: false,
        presale_bank_name: '',
        presale_bins: '',
        presale_start: '',
        presale_end: '',
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [functions, setFunctions] = useState([]);
    const [newFunction, setNewFunction] = useState({ date: '', time: '', venue_id: '', room_id: '' });
    const [newFunctionRooms, setNewFunctionRooms] = useState([]);

    // Draft Auto-Save Feature
    const draftKey = event && event.id 
        ? `laika_event_draft_edit_${event.id}` 
        : 'laika_event_draft_new';

    const [hasDraft, setHasDraft] = useState(false);
    const [draftInfo, setDraftInfo] = useState(null);

    // Check for existing draft on mount or when key changes
    useEffect(() => {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && (parsed.formData?.name || parsed.formData?.description || parsed.formData?.venue_id || parsed.functions?.length > 0)) {
                    setDraftInfo(parsed);
                    setHasDraft(true);
                }
            } catch (e) {
                console.error("Error reading draft", e);
            }
        }
    }, [draftKey]);

    // Save draft periodically (debounce 800ms)
    useEffect(() => {
        if (!formData.name && !formData.description && formData.price === 0 && functions.length === 0) {
            return; // Don't save empty form as a draft
        }
        const timer = setTimeout(() => {
            const draftData = {
                formData,
                functions,
                showAdvanced
            };
            localStorage.setItem(draftKey, JSON.stringify(draftData));
        }, 800);
        return () => clearTimeout(timer);
    }, [formData, functions, showAdvanced, draftKey]);

    const handleRestoreDraft = () => {
        if (draftInfo) {
            if (draftInfo.formData) {
                setFormData(draftInfo.formData);
                if (draftInfo.formData.venue_id) {
                    loadRooms(draftInfo.formData.venue_id);
                }
            }
            if (draftInfo.functions) setFunctions(draftInfo.functions);
            if (draftInfo.showAdvanced) setShowAdvanced(draftInfo.showAdvanced);
            success('¡Borrador recuperado con éxito!');
        }
        setHasDraft(false);
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem(draftKey);
        setHasDraft(false);
        setDraftInfo(null);
        success('Borrador descartado');
    };

    // Load Venues
    useEffect(() => {
        const loadVenues = async () => {
            try {
                // Si es gestor, solo traer sus recintos asignados
                const params = { status_filter: 'active' };
                const role = user?.role?.toLowerCase();
                if (role === 'gestor' || role === 'manager') {
                    params.manager_id = user.id;
                }
                const data = await venueAPI.getAll(params);
                setVenues(data);
                
                // 1. Prioridad: Parámetro en la URL (?venue_id=X)
                const queryParams = new URLSearchParams(location.search);
                const urlVenueId = queryParams.get('venue_id');

                if (urlVenueId && !event) {
                    const v = data.find(item => String(item.id) === String(urlVenueId));
                    if (v) {
                        setFormData(prev => ({
                            ...prev,
                            venue_id: v.id,
                            venue: v.name,
                            location: v.city,
                            total_tickets: v.capacity || prev.total_tickets,
                            available_tickets: v.capacity || prev.available_tickets,
                            map_url: v.google_maps_url || '',
                            seat_map_url: v.seat_map_url || ''
                        }));
                        loadRooms(v.id);
                        return;
                    }
                }

                // 2. Pre-seleccionar si solo hay uno (y no hay parámetro en URL)
                if (data.length === 1 && !formData.venue_id && !event) {
                    const v = data[0];
                    setFormData(prev => ({
                        ...prev,
                        venue_id: v.id,
                        venue: v.name,
                        location: v.city,
                        total_tickets: v.capacity || prev.total_tickets,
                        available_tickets: v.capacity || prev.available_tickets,
                        map_url: v.google_maps_url || '',
                        seat_map_url: v.seat_map_url || ''
                    }));
                    loadRooms(v.id);
                }
            } catch (err) {
                console.error("Error loading venues", err);
            }
        };
        if (user) loadVenues();
    }, [user]);

    // Initialize if editing
    useEffect(() => {
        if (event) {
            setFormData({
                name: event.name || '',
                description: event.description || '',
                category: event.category || 'concert',
                event_date: event.event_date ? event.event_date.split('T')[0] : '',
                event_time: event.event_time ? formatTime(event.event_time) : '',
                location: event.location || '',
                venue: event.venue || '',
                venue_id: event.venue_id || '', // If backend sends it
                room_id: event.room_id || '',
                use_seating_map: !!event.use_seating_map,
                total_tickets: event.total_tickets || 100,
                price: event.price || 0,
                image_url: event.image_url || '',
                ads_enabled: !!event.ads_enabled,
                max_ads: event.max_ads || 5,
                merch_enabled: !!event.merch_enabled,
                metrics_enabled: !!event.metrics_enabled,
                // Preventa exclusiva
                presale_enabled: !!event.presale_enabled,
                presale_bank_name: event.presale_bank_name || '',
                presale_bins: event.presale_bins || '',
                presale_start: event.presale_start || '',
                presale_end: event.presale_end || '',
            });

            if (event.venue_id) {
                loadRooms(event.venue_id);
                // Si estamos editando, asegurar que tenemos las salas cargadas para el selector
            }

            if (event.functions && Array.isArray(event.functions)) {
                setFunctions(event.functions.map(f => ({
                    date: f.date.split('T')[0],
                    time: formatTime(f.time),
                    venue_id: f.venue_id
                })));
            }
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: val };
            
            // Si cambia la sala, intentar actualizar la capacidad
            if (name === 'room_id' && val) {
                const selectedRoom = rooms.find(r => String(r.id) === String(val));
                if (selectedRoom && selectedRoom.capacity) {
                    newState.total_tickets = selectedRoom.capacity;
                }
            }
            
            return newState;
        });
    };

    const loadRooms = async (venueId) => {
        try {
            const data = await venueAPI.getRooms(venueId);
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading rooms", err);
            setRooms([]);
        }
    };

    const handleVenueChange = (e) => {
        const venueId = e.target.value;
        const selected = venues.find(v => String(v.id) === String(venueId));

        if (selected) {
            setFormData(prev => ({
                ...prev,
                venue_id: venueId,
                room_id: '',
                venue: selected.name,
                location: selected.city,
                total_tickets: selected.capacity || prev.total_tickets,
                map_url: selected.google_maps_url || '',
                seat_map_url: selected.seat_map_url || ''
            }));
            loadRooms(venueId);
            // Update new function venue default as well
            setNewFunction(prev => ({ ...prev, venue_id: venueId }));
        } else {
            setFormData(prev => ({ ...prev, venue_id: '', room_id: '', venue: '', location: '' }));
            setRooms([]);
        }
    };

    const handleFunctionVenueChange = async (venueId) => {
        setNewFunction(prev => ({ ...prev, venue_id: venueId, room_id: '' }));
        if (venueId) {
            try {
                const res = await venueAPI.getRooms(venueId);
                setNewFunctionRooms(res);
            } catch (err) {
                console.error("Error loading rooms for function venue", err);
            }
        } else {
            setNewFunctionRooms([]);
        }
    };

    const handleAddFunction = () => {
        if (!newFunction.date || !newFunction.time || !newFunction.venue_id) {
            warning('Fecha, hora y recinto son requeridos para agregar una función');
            return;
        }
        setFunctions(prev => [...prev, { ...newFunction, tempId: Date.now() }]);
        setNewFunction({ ...newFunction, date: '', time: '', room_id: '' }); // Keep venue
    };

    const handleRemoveFunction = (index) => {
        setFunctions(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.manager.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: res.url }));
            success('Imagen subida correctamente');
        } catch (err) {
            console.error(err);
            error('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        console.log("Submit clicked. Form Data:", formData);
        console.log("Functions:", functions);
        console.log("New Function State:", newFunction);

        // 1. Prepare Data
        let finalFunctions = Array.isArray(functions) ? [...functions] : [];
        let finalDate = formData.event_date || '';
        let finalTime = formData.event_time || '';

        // Auto-add if user forgot to click add button (Be more aggressive with defaults)
        if (finalFunctions.length === 0 && newFunction.date) {
            const autoTime = newFunction.time || '20:00';
            const autoVenue = newFunction.venue_id || formData.venue_id;
            
            if (autoVenue) {
                console.log("Auto-adding function with defaults:", { date: newFunction.date, time: autoTime, venue_id: autoVenue });
                finalFunctions = [{ 
                    date: newFunction.date, 
                    time: autoTime, 
                    venue_id: autoVenue,
                    tempId: Date.now() 
                }];
                finalDate = newFunction.date;
                finalTime = autoTime;
            }
        } else if (finalFunctions.length > 0) {
            // Use first function as main date if not set
            const sorted = [...finalFunctions].sort((a, b) => {
                const da = a.date + 'T' + (a.time || '00:00').substring(0, 5);
                const db = b.date + 'T' + (b.time || '00:00').substring(0, 5);
                return da.localeCompare(db);
            });
            finalDate = sorted[0].date;
            finalTime = sorted[0].time;
        }

        // 2. Validation with Specific Messages
        if (!formData.name || formData.name.trim() === '') {
            warning('El nombre del evento es obligatorio.');
            return;
        }
        if (!formData.venue_id && finalFunctions.length === 0) {
            warning('Por favor selecciona un Recinto Principal.');
            return;
        }
        if (!finalDate) {
            warning('Por favor selecciona una Fecha para el evento.');
            return;
        }
        if (!finalTime) {
            warning('Por favor ingresa una Hora para el evento (ej. 20:00).');
            return;
        }

        setLoading(true);
        try {
            const payload = { 
                ...formData,
                event_date: finalDate,
                event_time: finalTime,
                functions: finalFunctions.map(f => ({
                    date: f.date,
                    time: f.time,
                    venue_id: parseInt(f.venue_id || formData.venue_id || 1),
                    room_id: f.room_id ? parseInt(f.room_id) : null
                }))
            };

            // Conversions and Defaults
            payload.price = parseFloat(formData.price) || 0;
            payload.total_tickets = parseInt(formData.total_tickets) || 100;
            payload.available_tickets = payload.total_tickets;
            payload.venue_id = parseInt(formData.venue_id) || (finalFunctions.length > 0 ? parseInt(finalFunctions[0].venue_id) : 1);
            payload.room_id = formData.room_id ? parseInt(formData.room_id) : null;
            
            if (!payload.location || payload.location.trim() === '') {
                payload.location = 'Ubicación General';
            }

            // Seating map override
            if (!hasAdvancedPackage) payload.use_seating_map = false;

            console.log("Final Payload for API:", payload);

            let result;
            if (event && event.id) {
                result = await api.manager.updateEvent(event.id, payload);
                success('Evento actualizado con éxito');
            } else {
                result = await api.manager.createEvent(payload);
                success('¡Evento creado exitosamente!');
            }

            // Clear draft on successful save
            localStorage.removeItem(draftKey);

            if (onSuccess) onSuccess(result);
        } catch (err) {
            console.error('CRITICAL ERROR saving event:', err);
            const detail = err.response?.data?.detail;
            const msg = Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : (detail || err.message);
            error('Fallo al guardar: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const getVenueName = (id) => venues.find(v => String(v.id) === String(id))?.name || 'Desconocido';
    
    // As rooms might be from different venues, this is tricky. 
    // We'll try to find it in the current rooms state or just show the ID if not found
    const getRoomName = (id, venueId) => {
        if (!id) return 'General';
        return 'Sala ' + id; // Fallback simple for now, as we don't fetch all rooms of all venues at once
    };
    
    const formContent = (
        <div className="event-form-container">
            <div className="manager-form-grid">
                {/* Left Column: Form Fields */}
                <div className="form-inputs">
                    <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div className="form-scroll-area" style={{ 
                            paddingRight: '1rem',
                            paddingBottom: '2rem'
                        }}>
                            {hasDraft && (
                                <div className="draft-banner" style={{
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>📝</span>
                                        <div style={{ textAlign: 'left' }}>
                                            <strong style={{ color: 'var(--primary, #6366f1)', fontSize: '0.9rem' }}>¡Borrador detectado!</strong>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>Tienes progreso no guardado de una sesión anterior.</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button type="button" size="small" variant="primary" onClick={handleRestoreDraft}>
                                            Recuperar
                                        </Button>
                                        <Button type="button" size="small" variant="ghost" onClick={handleDiscardDraft} style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                            Descartar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="form-group mb-4">
                            <Input
                                label="Nombre del Evento *"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ej. Concierto de Rock"
                                required
                            />
                        </div>

                        {/* Venue Selection */}
                        <div className="form-group mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recinto Principal</label>
                            <select
                                name="venue_id"
                                value={formData.venue_id}
                                onChange={handleVenueChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                            >
                                <option value="">-- Seleccionar Recinto --</option>
                                {venues.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                                ))}
                            </select>
                        </div>

                        {formData.venue_id && rooms.length > 0 && (
                            <div className="form-group mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sala del Recinto</label>
                                    <select
                                        name="room_id"
                                        value={formData.room_id}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">-- Sin Sala Específica --</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: hasAdvancedPackage ? 'pointer' : 'not-allowed', opacity: hasAdvancedPackage ? 1 : 0.6 }}>
                                        <input
                                            type="checkbox"
                                            name="use_seating_map"
                                            checked={formData.use_seating_map}
                                            onChange={handleChange}
                                            disabled={!hasAdvancedPackage || !formData.room_id}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span className="text-sm font-medium">Usar Mapa de Asientos Interactivo</span>
                                    </label>
                                    {!hasAdvancedPackage && (
                                        <span style={{ fontSize: '10px', marginLeft: '8px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                            REQUIERE PLAN AVANZADO
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-row grid grid-cols-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="concert">Concierto</option>
                                    <option value="sport">Deporte</option>
                                    <option value="theater">Teatro</option>
                                    <option value="festival">Festival</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <Input
                                    label="Ubicación (Ciudad) *"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Ej. CDMX o Puebla"
                                    disabled={!!formData.venue_id && !showAdvanced}
                                />
                                {formData.venue_id && !showAdvanced && (
                                    <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                                        📍 Tomado automáticamente del recinto.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Functions / Scheduling Section */}
                        <div className="form-group mb-6 p-4 border rounded bg-gray-50" style={{ border: '1px solid #eee', background: '#f9fafb', borderRadius: '8px', padding: '1rem' }}>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Fechas, Recintos y Salas (Multifunción)</label>

                            {functions.length > 0 && (
                                <ul className="mb-4 space-y-2">
                                    {functions.map((f, idx) => (
                                        <li key={f.tempId || idx} className="flex justify-between items-center bg-white p-2 rounded border text-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', background: '#fff', border: '1px solid #ddd', padding: '0.5rem' }}>
                                            <span>
                                                📅 <strong>{f.date}</strong> ⏰ {f.time} <br/>
                                                <small style={{ color: '#666' }}>📍 {getVenueName(f.venue_id)} {f.room_id ? `| 🚪 ${getRoomName(f.room_id)}` : ''}</small>
                                            </span>
                                            <button type="button" onClick={() => handleRemoveFunction(idx)} className="text-red-500 hover:text-red-700">❌</button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="add-function-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr 1.2fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                <div className="form-group">
                                    <label className="text-xs font-bold">Fecha</label>
                                    <input type="date" value={newFunction.date} onChange={e => setNewFunction({ ...newFunction, date: e.target.value })} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold">Hora</label>
                                    <input type="time" value={newFunction.time} onChange={e => setNewFunction({ ...newFunction, time: e.target.value })} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold">Recinto</label>
                                    <select value={newFunction.venue_id} onChange={e => handleFunctionVenueChange(e.target.value)} className="w-full p-1 border rounded text-sm">
                                        <option value="">Recinto</option>
                                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="text-xs font-bold">Sala (Opcional)</label>
                                    <select value={newFunction.room_id} onChange={e => setNewFunction({ ...newFunction, room_id: e.target.value })} className="w-full p-1 border rounded text-sm">
                                        <option value="">General</option>
                                        {newFunctionRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <Button type="button" size="small" variant="secondary" onClick={handleAddFunction}>➕</Button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">* La primera función será la principal del evento. Útil para cines, teatros con varias salas o eventos de varios días.</p>
                        </div>


                        <div className="form-row grid grid-cols-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <Input
                                    label="Precio del Boleto *"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <Input
                                    label="Total Boletos *"
                                    name="total_tickets"
                                    type="number"
                                    min="1"
                                    value={formData.total_tickets}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                placeholder="Detalles del evento..."
                            ></textarea>
                        </div>

                        <div className="form-group mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Imagen del Evento (Vector Preview)</label>

                            <div
                                className="image-upload-dropzone"
                                style={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: '#f8fafc',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onClick={() => document.getElementById('event-image-upload').click()}
                            >
                                <input
                                    id="event-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />

                                {formData.image_url ? (
                                    <div className="upload-preview-overlay">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                                            Haz clic para cambiar la foto
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                                        <p style={{ fontWeight: '600', color: '#1e293b' }}>
                                            {uploading ? 'Subiendo...' : 'Haz clic para subir la foto del evento'}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            PNG, JPG o GIF hasta 5MB
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Direct URL input as fallback */}
                            <div style={{ marginTop: '1rem' }}>
                                <Input
                                    label="O pega una URL de imagen:"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* --- GPS & MAPS --- */}
                        <div className="advanced-toggle" style={{ marginBottom: '1rem' }}>
                            <Button type="button" variant="ghost" size="small" onClick={() => setShowAdvanced(!showAdvanced)}>
                                {showAdvanced ? (
                                    <React.Fragment key="adv-hide-branch">
                                        <Icon name="chevron-up" size={14} className="mr-2" />
                                        <span>Ocultar Configuración Avanzada</span>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment key="adv-show-branch">
                                        <Icon name="settings" size={14} className="mr-2" />
                                        <span>Ajustes de Ubicación y Mapas (Opcional)</span>
                                    </React.Fragment>
                                )}
                            </Button>
                        </div>

                        {showAdvanced && (
                            <div className="form-group mb-6 p-4 border rounded bg-blue-50" style={{ border: '1px solid #dbeafe', background: '#eff6ff', borderRadius: '8px', padding: '1rem' }}>
                                <label className="block text-sm font-bold text-blue-700 mb-3">📍 Ubicación y Mapas Especiales</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input 
                                        label="Google Maps URL (Embed/Directa)" 
                                        name="map_url" 
                                        value={formData.map_url} 
                                        onChange={handleChange} 
                                        placeholder="https://www.google.com/maps/embed?..." 
                                    />
                                    <Input 
                                        label="Mapa de Asientos URL" 
                                        name="seat_map_url" 
                                        value={formData.seat_map_url} 
                                        onChange={handleChange} 
                                        placeholder="URL de la imagen del mapa de zonas" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* --- PREVENTA EXCLUSIVA --- */}
                        <PresaleSection
                            presaleData={{
                                presale_enabled: formData.presale_enabled,
                                presale_bank_name: formData.presale_bank_name,
                                presale_bins: formData.presale_bins,
                                presale_start: formData.presale_start,
                                presale_end: formData.presale_end,
                            }}
                            onChange={(field, value) =>
                                setFormData(prev => ({ ...prev, [field]: value }))
                            }
                        />

                        {/* --- ENABLED FEATURES (READ ONLY FOR MANAGER) --- */}
                        <div className="form-group mb-6 p-4 border rounded bg-purple-50" style={{ border: '1px solid #e9d5ff', background: '#f5f3ff', borderRadius: '8px', padding: '1rem' }}>
                            <label className="block text-sm font-bold text-purple-700 mb-3">🚀 Características Habilitadas (Configuradas por Admin)</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Badge variant={formData.ads_enabled ? 'success' : 'default'} rounded>
                                    <Icon name="image" size={12} className="mr-1" /> ANUNCIOS: {formData.ads_enabled ? `SÍ (${formData.max_ads} máx)` : 'NO'}
                                </Badge>
                                <Badge variant={formData.metrics_enabled ? 'success' : 'default'} rounded>
                                    <Icon name="activity" size={12} className="mr-1" /> MÉTRICAS: {formData.metrics_enabled ? 'SÍ' : 'NO'}
                                </Badge>
                                <Badge variant={formData.merch_enabled ? 'success' : 'default'} rounded>
                                    <Icon name="shopping-bag" size={12} className="mr-1" /> MERCANCÍA: {formData.merch_enabled ? 'SÍ' : 'NO'}
                                </Badge>
                            </div>
                            {formData.ads_enabled && event && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                                    <Button type="button" size="small" variant="info" onClick={() => window.location.href = `/manager/events/${event.id}/ads`}>
                                        <Icon name="external-link" size={12} className="mr-1" /> Gestionar Anuncios del Evento
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions" style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            gap: '1rem', 
                            marginTop: 'auto',
                            padding: '1.5rem 0 0.5rem 0',
                            borderTop: '1px solid #eee',
                            background: '#fff',
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 10
                        }}>
                            {onClose && (
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancelar
                                </Button>
                            )}
                            <Button type="submit" variant="primary" loading={loading} disabled={uploading}>
                                {event ? 'Guardar Cambios' : 'Crear Evento'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Live Preview */}
                <div className="preview-column">
                    <h3 className="text-lg font-semibold mb-3">Vista Previa</h3>
                    <EventCardPreview eventData={formData} />
                    <p className="text-sm text-muted text-center mt-2">
                        Así se verá tu evento en la página principal.
                    </p>
                </div>
            </div>
        </div>
    );

    if (onClose) {
        return (
            <Modal isOpen={true} onClose={onClose} title={event ? "Editar Evento" : "Crear Nuevo Evento"} size="large">
                {formContent}
            </Modal>
        );
    }

    return formContent;
};

export default EventForm;
