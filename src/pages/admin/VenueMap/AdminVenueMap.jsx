import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VenueMapSVG from '../../../components/VenueMapSVG';
import { Badge, Button, Icon } from '../../../components';
import Skeleton from '../../../components/Skeleton';
import { venueAPI } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import './AdminVenueMap.css';

const AdminVenueMap = () => {
    const { venueId, roomId } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isEditMode, setIsEditMode] = useState(true);

    const [zones, setZones] = useState([]);
    const [selectedZoneId, setSelectedZoneId] = useState(null);
    const [mapView, setMapView] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
    const [seatTypes, setSeatTypes] = useState([]);
    const [seatGenConfig, setSeatGenConfig] = useState({ rows: 5, cols: 10, startRow: 'A', startNum: 1 });
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [quickGenData, setQuickGenData] = useState(null);
    const [totalCapacity, setTotalCapacity] = useState(0);
    const [roomInfo, setRoomInfo] = useState({ name: 'Sala' });
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);
    const [clipboard, setClipboard] = useState(null);

    const fetchMap = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch the room details for the title (optional, could be passed or fetched)
            // For now just assume we have the room map
            const [typesResponse, response] = await Promise.all([
                venueAPI.getSeatTypes(),
                venueAPI.getRoomMap(roomId)
            ]);
            setSeatTypes(typesResponse || []);
            
            if (response) {
                setRoomInfo(response);
                setTotalCapacity(response.total_capacity || response.capacity || 0);
            }

            if (response && response.zones && response.zones.length > 0) {
                const mappedZones = response.zones.map(z => ({
                    backend_id: z.id,
                    id: z.frontend_id,
                    name: z.name,
                    count: z.capacity,
                    type: z.geometry_json?.type || 'seating',
                    points: z.geometry_json?.points || [],
                    textPos: z.geometry_json?.textPos,
                    textAngle: z.geometry_json?.textAngle,
                    curveAmounts: z.geometry_json?.curveAmounts,
                    tier: z.tier,
                    color: z.color_hex,
                    price: `$${z.base_price}`,
                    blocks: z.blocks?.map(b => ({
                        backend_id: b.id,
                        id: b.frontend_id,
                        name: b.name,
                        layout_json: b.layout_json,
                        seats: b.seats?.map(s => ({
                            backend_id: s.id,
                            id: s.frontend_id,
                            row_label: s.row_label,
                            seat_number: s.seat_number,
                            x_pos: s.x_pos,
                            y_pos: s.y_pos,
                            is_active: s.is_active,
                            seat_type_id: s.seat_type_id || (typesResponse?.[0]?.id || 1)
                        })) || []
                    })) || []
                }));
                setZones(mappedZones);
                if (response.layout_metadata) {
                    setMapView({
                        zoom: response.layout_metadata.zoom || 1,
                        pan: response.layout_metadata.pan || { x: 0, y: 0 }
                    });
                }
            } else {
                // Empty state or default initialization
                setZones([]);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status !== 404) {
                showError('Error al cargar el mapa');
            }
        } finally {
            setLoading(false);
        }
    }, [roomId, showError]);

    useEffect(() => {
        if (roomId) {
            fetchMap();
        }
    }, [roomId, fetchMap]);

    const addToHistory = useCallback((currentZones) => {
        setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(zones))]);
        setFuture([]);
    }, [zones]);

    const undo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setFuture(prev => [JSON.parse(JSON.stringify(zones)), ...prev]);
        setHistory(prev => prev.slice(0, -1));
        setZones(previous);
    }, [history, zones]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory(prev => [...prev, JSON.parse(JSON.stringify(zones))]);
        setFuture(prev => prev.slice(1));
        setZones(next);
    }, [future, zones]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                if (selectedZoneId) {
                    const zone = zones.find(z => z.id === selectedZoneId);
                    if (zone) setClipboard(JSON.parse(JSON.stringify(zone)));
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (clipboard) {
                    addToHistory(zones);
                    const newId = `zone-${Date.now()}`;
                    const newZone = {
                        ...JSON.parse(JSON.stringify(clipboard)),
                        id: newId,
                        backend_id: null,
                        points: clipboard.points.map(p => ({ x: p.x + 20, y: p.y + 20 })),
                        name: `${clipboard.name} COPIA`
                    };
                    setZones(prev => [...prev, newZone]);
                    setSelectedZoneId(newId);
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedSeats.length > 0 && isEditMode) {
                    addToHistory(zones);
                    setZones(prev => prev.map(z => {
                        const newBlocks = z.blocks?.map(b => {
                            const remainingSeats = b.seats.filter(s => !selectedSeats.includes(s.id));
                            // Recorrer asientos: re-asignar seat_number para que sean continuos por fila
                            const rowGroups = {};
                            remainingSeats.forEach(s => {
                                if (!rowGroups[s.row_label]) rowGroups[s.row_label] = [];
                                rowGroups[s.row_label].push(s);
                            });

                            Object.keys(rowGroups).forEach(row => {
                                // Ordenar por posición original (grid_u o x_pos)
                                rowGroups[row].sort((a, b) => (a.grid_u || a.x_pos) - (b.grid_u || b.x_pos));
                                rowGroups[row].forEach((s, idx) => {
                                    s.seat_number = (idx + 1).toString();
                                });
                            });

                            return { ...b, seats: remainingSeats };
                        }) || [];
                        return { ...z, blocks: newBlocks };
                    }));
                    setSelectedSeats([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedSeats, isEditMode, zones, addToHistory]);

    const handleAdjustPrice = (zoneId, delta) => {
        setZones(prevZones => prevZones.map(z => {
            if (z.id === zoneId) {
                const currentVal = parseFloat(String(z.price || '').replace('$', '').replace(',', '') || 0);
                const newVal = Math.max(0, currentVal + delta);
                return { ...z, price: `$${newVal.toLocaleString('en-US')}` };
            }
            return z;
        }));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            // Flatten the nested structure for the backend
            const flatZones = [];
            const flatBlocks = [];
            const flatSeats = [];

            zones.forEach(z => {
                const zoneId = z.backend_id || (typeof z.id === 'number' ? z.id : null);
                flatZones.push({
                    id: zoneId,
                    name: z.name,
                    color_hex: z.color || '#cccccc',
                    geometry_json: {
                        type: z.type,
                        points: z.points,
                        textPos: z.textPos,
                        textAngle: z.textAngle,
                        curveAmounts: z.curveAmounts
                    }
                });

                if (z.blocks) {
                    z.blocks.forEach(b => {
                        const blockId = b.backend_id || (typeof b.id === 'number' ? b.id : null);
                        flatBlocks.push({
                            id: blockId,
                            name: b.name || 'Bloque',
                            x_position: 0, // Backend expects these, though we might not use them if we use layout_json
                            y_position: 0,
                            rotation: 0,
                            config: b.layout_json || {}
                        });

                        if (b.seats) {
                            b.seats.forEach(s => {
                                flatSeats.push({
                                    id: s.backend_id || (typeof s.id === 'number' ? s.id : null),
                                    block_id: blockId,
                                    zone_id: zoneId,
                                    seat_type_id: s.seat_type_id || 1,
                                    seat_label: `${s.row_label || ''}${s.seat_number || ''}`,
                                    x_position: s.x_pos || 0,
                                    y_position: s.y_pos || 0,
                                    status: s.is_active === false ? 'maintenance' : 'active'
                                });
                            });
                        }
                    });
                }
            });

            const payload = {
                layout_mode: 'map',
                layout_metadata: {
                    pan: mapView.pan,
                    zoom: mapView.zoom
                },
                zones: flatZones,
                blocks: flatBlocks,
                seats: flatSeats
            };

            await venueAPI.saveRoomMap(roomId, payload);
            success('¡Mapa guardado exitosamente en la base de datos!');
            // Re-fetch to sync IDs and ensure state is fresh
            await fetchMap();
        } catch (err) {
            console.error(err);
            showError('Error al guardar el mapa: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeZone = () => {
        if (!selectedZoneId) return;
        const zoneToDelete = zones.find(z => z.id === selectedZoneId);
        if (!zoneToDelete) return;

        if (window.confirm(`¿Estás seguro de que quieres eliminar la zona "${zoneToDelete.name.toUpperCase()}"? Se eliminarán todos sus bloques y asientos.`)) {
            setZones(zones.filter(z => z.id !== selectedZoneId));
            setSelectedZoneId(null);
        }
    };

    const handleZoom = (delta) => setMapView(prev => ({ ...prev, zoom: Math.min(Math.max(prev.zoom + delta, 0.5), 3) }));
    const handlePan = (dx, dy) => setMapView(prev => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
    const resetView = () => setMapView({ zoom: 1, pan: { x: 0, y: 0 } });
    const handleZoomIn = () => handleZoom(0.1);
    const handleZoomOut = () => handleZoom(-0.1);

    const addZone = (type, rect = null) => {
        addToHistory(zones);
        const id = `zone-${Date.now()}`;
        const points = rect ? [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ] : [ {x: 350, y: 200}, {x: 450, y: 200}, {x: 450, y: 300}, {x: 350, y: 300} ];

        const newZone = {
            id,
            name: `NUEVA ZONA ${type.toUpperCase()}`,
            type,
            points,
            price: type === 'seating' ? '$500' : 'N/A',
            count: 0,
            blocks: []
        };
        setZones([...zones, newZone]);
        setSelectedZoneId(id);
        setIsDrawingMode(false);
        return id;
    };

    const handleDrawZone = (rect) => {
        setQuickGenData({ rect, rows: 5, cols: 10, type: 'seating' });
    };

    const confirmQuickGen = () => {
        if (!quickGenData) return;
        const { rect, rows, cols, type } = quickGenData;
        
        if (type === 'seating') {
            const currentCount = zones.reduce((sum, z) => sum + (z.blocks?.reduce((bSum, b) => bSum + (b.seats?.length || 0), 0) || 0), 0);
            if (totalCapacity > 0 && currentCount + (rows * cols) > totalCapacity) {
                showError(`¡Límite excedido! Solo quedan ${totalCapacity - currentCount} asientos disponibles.`);
                setQuickGenData(null);
                setIsDrawingMode(false);
                return;
            }
        }

        addToHistory(zones);
        const zoneId = addZone(type, rect);
        
        // Generar asientos inmediatamente solo si es tipo seating
        if (type === 'seating') {
            setTimeout(() => {
                generateSeatsForZone(zoneId, rows, cols);
                setQuickGenData(null);
            }, 50);
        } else {
            setQuickGenData(null);
        }
    };

    const updateZoneGeometry = (zoneId, newPoints, textPos, textAngle, curveAmounts) => {
        if (!isEditMode) return;
        setZones(prev => prev.map(z => {
            if (z.id !== zoneId) return z;
            
            // Si la zona tiene bloques con asientos elásticos (grid_u/grid_v), los recalculamos
            const updatedBlocks = z.blocks?.map(b => ({
                ...b,
                seats: b.seats.map(s => {
                    if (s.grid_u === undefined || s.grid_v === undefined) return s;
                    
                    const u = s.grid_u;
                    const v = s.grid_v;
                    const p1 = newPoints[0];
                    const p2 = newPoints[1];
                    const p3 = newPoints[2];
                    const p4 = newPoints[3] || newPoints[0]; // Fallback por si no hay 4 puntos

                    const x = (1 - u) * (1 - v) * p1.x + u * (1 - v) * p2.x + u * v * p3.x + (1 - u) * v * p4.x;
                    const y = (1 - u) * (1 - v) * p1.y + u * (1 - v) * p2.y + u * v * p3.y + (1 - u) * v * p4.y;
                    
                    return { ...s, x_pos: x, y_pos: y };
                })
            })) || [];

            return { 
                ...z, 
                points: newPoints,
                blocks: updatedBlocks,
                textPos: textPos !== undefined ? textPos : z.textPos,
                textAngle: textAngle !== undefined ? textAngle : z.textAngle,
                curveAmounts: curveAmounts !== undefined ? curveAmounts : z.curveAmounts
            };
        }));
    };

    const adjustPosition = (dx, dy) => {
        if (!selectedZoneId) return;
        const zone = zones.find(z => z.id === selectedZoneId);
        if (!zone) return;
        const newPoints = zone.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
        updateZoneGeometry(selectedZoneId, newPoints);
    };

    // Función mejorada para generar asientos con configuración
    const generateSeatsForZone = (targetId = null, customRows = null, customCols = null) => {
        const zoneId = targetId || selectedZoneId;
        if (!zoneId) return;

        setZones(prev => prev.map(z => {
            if (z.id !== zoneId) return z;
            if (z.type !== 'seating') return z;

            const { rows: configRows, cols: configCols, startRow, startNum } = seatGenConfig;
            const rows = customRows || configRows;
            const cols = customCols || configCols;
            
            const newSeats = [];
            const rowStartCharCode = (startRow || 'A').charCodeAt(0);

            for (let r = 0; r < rows; r++) {
                const rowLabel = String.fromCharCode(rowStartCharCode + r);
                const v = (r + 0.5) / rows; // Posición vertical relativa

                for (let c = 0; c < cols; c++) {
                    const u = (c + 0.5) / cols; // Posición horizontal relativa
                    const seatNum = startNum + c;
                    
                    // Calculamos posición usando interpolación bilineal basada en los 4 puntos de la zona
                    const p1 = z.points[0];
                    const p2 = z.points[1];
                    const p3 = z.points[2];
                    const p4 = z.points[3];

                    const x = (1 - u) * (1 - v) * p1.x + u * (1 - v) * p2.x + u * v * p3.x + (1 - u) * v * p4.x;
                    const y = (1 - u) * (1 - v) * p1.y + u * (1 - v) * p2.y + u * v * p3.y + (1 - u) * v * p4.y;

                    newSeats.push({
                        id: `seat-${z.id}-${r}-${c}-${Date.now()}`,
                        row_label: rowLabel,
                        seat_number: seatNum.toString(),
                        x_pos: x,
                        y_pos: y,
                        grid_u: u, // Guardamos la posición relativa para que sea elástica
                        grid_v: v,
                        is_active: true,
                        seat_type_id: seatTypes[0]?.id || 1
                    });
                }
            }

            const newBlock = {
                id: `block-${z.id}-${Date.now()}`,
                name: 'Bloque Principal',
                seats: newSeats
            };

            return { ...z, blocks: [newBlock], count: newSeats.length };
        }));
    };

    return (
        <div className="admin-venue-map-page">
            <header className="admin-page-header">
                <div className="header-left">
                    <Button variant="ghost" size="small" onClick={() => navigate('/admin/venues')} style={{ color: 'rgba(255,255,255,0.5)' }}>
                        <Icon name="arrow-left" size={14} /> VOLVER
                    </Button>
                    <h1>{roomInfo.name} <span style={{ opacity: 0.3, fontWeight: 400 }}>| Editor de Mapa</span></h1>
                </div>

                <div className="header-center">
                    <div className="editor-tabs-premium">
                        <button className={isEditMode ? 'active' : ''} onClick={() => setIsEditMode(true)}>Diseño de Mapa</button>
                        <button className={!isEditMode ? 'active' : ''} onClick={() => setIsEditMode(false)}>Asignar Tickets</button>
                    </div>
                </div>

                <div className="header-actions">
                    <Button variant="ghost" size="small" onClick={resetView} title="Resetear Vista">
                        <Icon name="maximize" size={14} />
                    </Button>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }} />
                    <Button variant="primary" size="small" onClick={saveChanges} disabled={saving} className="save-changes-btn-premium">
                        <Icon name="save" size={14} /> <span>{saving ? 'GUARDANDO...' : 'GUARDAR'}</span>
                    </Button>
                </div>
            </header>


            <div className="admin-map-container-main" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="admin-map-main-layout">
                    <div className="zone-management-sidebar premium">
                        <div className="sidebar-header">
                            <h3>ELEMENTOS DEL MAPA</h3>
                            <Badge variant="outline" size="small">{zones.length} OBJETOS</Badge>
                        </div>
                        
                        <div className="editor-help-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ marginBottom: '8px', color: '#eab308', fontWeight: 800 }}>⚙️ EDITOR DE SALA:</p>
                            <p>Usa la herramienta <strong>Pantalla</strong> para orientar la sala. Luego añade <strong>Filas</strong> y usa el control de curvatura para dar forma.</p>
                        </div>

                        <div className="zones-list-mini">
                            {zones.map(z => (
                                <div key={z.id} className={`zone-mini-item ${selectedZoneId === z.id ? 'active' : ''}`} onClick={() => setSelectedZoneId(z.id)}>
                                    <Icon name={z.type === 'seating' ? 'armchair' : z.type === 'screen' ? 'monitor' : 'box'} size={12} />
                                    <span>{z.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="admin-map-wrapper" style={{ background: '#050505', borderRadius: '8px', position: 'relative' }}>
                        {isEditMode && (
                            <div className="construction-toolbar-premium">
                                <button 
                                    className={isDrawingMode ? 'active' : ''} 
                                    onClick={() => { setIsDrawingMode(!isDrawingMode); setSelectedZoneId(null); }} 
                                    title="Dibujar Nueva Zona (Click y Arrastre)"
                                >
                                    <Icon name="edit" size={18} />
                                    <span>Dibujar</span>
                                </button>
                                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                                <button onClick={() => addZone('seating')} title="Añadir Fila Estándar">
                                    <Icon name="armchair" size={18} />
                                    <span>Fila</span>
                                </button>
                                <button onClick={() => addZone('table')} title="Añadir Mesa Circular">
                                    <Icon name="circle" size={18} />
                                    <span>Mesa</span>
                                </button>
                                <button onClick={() => addZone('screen')} title="Añadir Pantalla">
                                    <Icon name="monitor" size={18} />
                                    <span>Pantalla</span>
                                </button>
                                <button onClick={() => addZone('stage')} title="Añadir Escenario">
                                    <Icon name="box" size={18} />
                                    <span>Escenario</span>
                                </button>
                            </div>
                        )}
                        <div className="premium-zoom-pill">
                            <button className="zoom-pill-btn plus" onClick={handleZoomIn}><Icon name="plus" size={16} /></button>
                            <div className="zoom-pill-divider" />
                            <div className="zoom-pill-value">{Math.round(mapView.zoom * 100)}%</div>
                            <div className="zoom-pill-divider" />
                            <button className="zoom-pill-btn minus active" onClick={handleZoomOut}><Icon name="minus" size={16} /></button>
                        </div>
                        <div className="minimal-pan-joystick persistent premium-joystick compact">
                            <div className="joystick-wrapper">
                                <button className="joystick-btn up" onClick={() => handlePan(0, -50)}><Icon name="chevronUp" size={16} /></button>
                                <div className="joystick-middle-row">
                                    <button className="joystick-btn left" onClick={() => handlePan(-50, 0)}><Icon name="chevronLeft" size={16} /></button>
                                    <button className="joystick-btn center" onClick={resetView}><Icon name="maximize" size={14} /></button>
                                    <button className="joystick-btn right" onClick={() => handlePan(50, 0)}><Icon name="chevronRight" size={16} /></button>
                                </div>
                                <button className="joystick-btn down" onClick={() => handlePan(0, 50)}><Icon name="chevronDown" size={16} /></button>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Skeleton style={{ width: '100%', height: '100%', borderRadius: '12px' }} animate />
                            </div>
                        ) : (
                            <>
                                    <div className="capacity-monitor-premium" onClick={() => {
                                        if (totalCapacity === 0) {
                                            const val = prompt('Ingresa la capacidad total de la sala:', '100');
                                            if (val) setTotalCapacity(parseInt(val));
                                        }
                                    }} style={{ cursor: totalCapacity === 0 ? 'pointer' : 'default' }}>
                                        <div className="capacity-info">
                                            <span className="label">CAPACIDAD TOTAL</span>
                                            <span className="value">
                                                {zones.reduce((sum, z) => sum + (z.blocks?.reduce((bSum, b) => bSum + (b.seats?.length || 0), 0) || 0), 0)} / {totalCapacity || '---'}
                                            </span>
                                        </div>
                                        <div className="capacity-bar-bg">
                                            <div className="capacity-bar-fill" style={{ width: `${Math.min(100, (zones.reduce((sum, z) => sum + (z.blocks?.reduce((bSum, b) => bSum + (b.seats?.length || 0), 0) || 0), 0) / (totalCapacity || 1)) * 100)}%` }} />
                                        </div>
                                        {totalCapacity === 0 && <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '4px' }}>Click para configurar</div>}
                                    </div>
                                    <VenueMapSVG 
                                        selectedSeats={selectedSeats}
                                        onSeatToggle={(id) => setSelectedSeats(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                                        isEditMode={isEditMode}
                                        zones={zones}
                                        setZones={setZones}
                                        onUpdateGeometry={updateZoneGeometry}
                                        onZoneColorChange={(zoneId, color) => {
                                            setZones(zones.map(z => z.id === zoneId ? { ...z, color: color, tier: null } : z));
                                        }}
                                        selectedZoneId={selectedZoneId}
                                        onZoneSelect={setSelectedZoneId}
                                        mapView={mapView}
                                        seatTypes={seatTypes}
                                        isDrawing={isDrawingMode}
                                        onDrawZone={handleDrawZone}
                                    />

                                    {quickGenData && (
                                        <div className="quick-gen-dialog" style={{ 
                                            left: `${quickGenData.rect.x * mapView.zoom + mapView.pan.x}px`, 
                                            top: `${(quickGenData.rect.y + quickGenData.rect.height) * mapView.zoom + mapView.pan.y + 20}px` 
                                        }}>
                                            <h4><Icon name="plus-circle" size={16} /> NUEVO COMPONENTE</h4>
                                            <div className="form-group">
                                                <label>Tipo:</label>
                                                <select 
                                                    value={quickGenData.type} 
                                                    onChange={(e) => setQuickGenData({ ...quickGenData, type: e.target.value })}
                                                >
                                                    <option value="seating">Zona de Asientos</option>
                                                    <option value="screen">Pantalla / Proyector</option>
                                                    <option value="stage">Escenario / Tarima</option>
                                                </select>
                                            </div>

                                            {quickGenData.type === 'seating' && (
                                                <>
                                                    <div className="form-group">
                                                        <label>Filas:</label>
                                                        <input 
                                                            type="number" 
                                                            value={quickGenData.rows} 
                                                            onChange={(e) => setQuickGenData({ ...quickGenData, rows: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Asientos:</label>
                                                        <input 
                                                            type="number" 
                                                            value={quickGenData.cols} 
                                                            onChange={(e) => setQuickGenData({ ...quickGenData, cols: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div className="dialog-actions">
                                                <Button size="small" variant="ghost" onClick={() => { setQuickGenData(null); setIsDrawingMode(false); }}>Cancelar</Button>
                                                <Button size="small" variant="primary" onClick={confirmQuickGen}>Generar</Button>
                                            </div>
                                        </div>
                                    )}

                                    {isEditMode && selectedZoneId && (
                                        <div className="properties-panel-premium">
                                            <h4><Icon name="settings" size={16} /> Propiedades</h4>
                                            {(() => {
                                                const zone = zones.find(z => z.id === selectedZoneId);
                                                if (!zone) return null;
                                                return (
                                                    <div className="properties-content">
                                                        <div className="input-group-premium">
                                                            <label>Nombre de Zona</label>
                                                            <input 
                                                                type="text" 
                                                                value={zone.name} 
                                                                onChange={(e) => setZones(zones.map(z => z.id === zone.id ? { ...z, name: e.target.value } : z))}
                                                            />
                                                        </div>
                                                        {zone.type === 'seating' && (
                                                            <>
                                                                <div className="input-group-premium">
                                                                    <label>Precio Base</label>
                                                                    <div className="price-input-wrapper">
                                                                        <input 
                                                                            type="number" 
                                                                            value={zone.price?.replace('$', '').replace(',', '')} 
                                                                            onChange={(e) => setZones(zones.map(z => z.id === zone.id ? { ...z, price: `$${e.target.value}` } : z))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '15px 0', paddingTop: '15px' }}>
                                                                    <label style={{ fontSize: '10px', color: '#eab308', fontWeight: 900, textTransform: 'uppercase' }}>Generar Asientos</label>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                                                        <div className="input-group-premium">
                                                                            <label>Filas</label>
                                                                            <input type="number" value={seatGenConfig.rows} onChange={e => setSeatGenConfig({...seatGenConfig, rows: parseInt(e.target.value) || 0})} />
                                                                        </div>
                                                                        <div className="input-group-premium">
                                                                            <label>Cols</label>
                                                                            <input type="number" value={seatGenConfig.cols} onChange={e => setSeatGenConfig({...seatGenConfig, cols: parseInt(e.target.value) || 0})} />
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="primary" size="small" onClick={generateSeatsForZone} style={{ width: '100%', marginTop: '10px' }}>
                                                                        REGENERAR GRID
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                        <Button variant="danger" size="small" onClick={removeZone} style={{ width: '100%', marginTop: '20px', opacity: 0.7 }}>
                                                            Eliminar Objeto
                                                        </Button>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                {selectedSeats.length > 0 && isEditMode && (
                                    <div className="seat-bulk-actions" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedSeats.length} Asientos</span>
                                        <select 
                                            style={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
                                            onChange={(e) => {
                                                const typeId = parseInt(e.target.value);
                                                if (isNaN(typeId)) return;
                                                setZones(prev => prev.map(z => ({
                                                    ...z,
                                                    blocks: z.blocks?.map(b => ({
                                                        ...b,
                                                        seats: b.seats.map(s => selectedSeats.includes(s.id) ? { ...s, seat_type_id: typeId } : s)
                                                    })) || []
                                                })));
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Asignar Tipo...</option>
                                            {seatTypes.map(st => (
                                                <option key={st.id} value={st.id}>{st.name}</option>
                                            ))}
                                        </select>
                                        <Button variant="outline" size="small" onClick={() => {
                                            setZones(prev => prev.map(z => ({
                                                ...z,
                                                blocks: z.blocks?.map(b => {
                                                    const hasSelected = b.seats.some(s => selectedSeats.includes(s.id));
                                                    if (!hasSelected) return b;
                                                    return {
                                                        ...b,
                                                        seats: b.seats.map(s => {
                                                            if (!selectedSeats.includes(s.id)) return s;
                                                            return { ...s, is_active: !s.is_active };
                                                        })
                                                    };
                                                }) || []
                                            })));
                                        }}>Activar/Desactivar</Button>
                                        <Button variant="danger" size="small" onClick={() => {
                                            setZones(prev => prev.map(z => ({
                                                ...z,
                                                blocks: z.blocks?.map(b => ({
                                                    ...b,
                                                    seats: b.seats.filter(s => !selectedSeats.includes(s.id))
                                                })) || []
                                            })));
                                            setSelectedSeats([]);
                                        }}>Eliminar</Button>
                                        <Button variant="outline" size="small" onClick={() => setSelectedSeats([])}>Deseleccionar</Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVenueMap;
