import React, { useState, useEffect } from 'react';
import VenueMapSVG from '../../components/VenueMapSVG';
import Skeleton from '../../components/Skeleton';
import { venueAPI } from '../../services/api';

const LiveMapViewer = ({ eventId, roomId }) => {
    const [loading, setLoading] = useState(true);
    const [zones, setZones] = useState([]);
    const [seatTypes, setSeatTypes] = useState([]);
    const [mapView, setMapView] = useState({ zoom: 1, pan: { x: 0, y: 0 } });

    useEffect(() => {
        const fetchMap = async () => {
            setLoading(true);
            try {
                const [typesResponse, response] = await Promise.all([
                    venueAPI.getSeatTypes(),
                    venueAPI.getRoomMap(roomId)
                ]);
                setSeatTypes(typesResponse || []);

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
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchMap();
        }
    }, [roomId]);

    const handleZoom = (delta) => setMapView(prev => ({ ...prev, zoom: Math.min(Math.max(prev.zoom + delta, 0.5), 3) }));
    const handlePan = (dx, dy) => setMapView(prev => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
    const resetView = () => setMapView({ zoom: 1, pan: { x: 0, y: 0 } });
    const handleZoomIn = () => handleZoom(0.1);
    const handleZoomOut = () => handleZoom(-0.1);

    if (loading) {
        return (
            <div style={{ width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton style={{ width: '100%', height: '100%', borderRadius: '12px' }} animate />
            </div>
        );
    }

    if (zones.length === 0) {
        return <div className="p-4 text-center">No hay mapa configurado para esta sala.</div>;
    }

    return (
        <div className="admin-map-wrapper" style={{ background: '#050505', borderRadius: '8px', height: '600px', position: 'relative' }}>
            <div className="premium-zoom-pill">
                <button className="zoom-pill-btn plus" onClick={handleZoomIn}>+</button>
                <div className="zoom-pill-divider" />
                <div className="zoom-pill-value">{Math.round(mapView.zoom * 100)}%</div>
                <div className="zoom-pill-divider" />
                <button className="zoom-pill-btn minus active" onClick={handleZoomOut}>-</button>
            </div>
            
            <VenueMapSVG 
                selectedSeats={[]}
                onSeatToggle={() => {}}
                isEditMode={false}
                zones={zones}
                setZones={() => {}}
                onUpdateGeometry={() => {}}
                onZoneColorChange={() => {}}
                selectedZoneId={null}
                onZoneSelect={() => {}}
                mapView={mapView}
                seatTypes={seatTypes}
                busySeats={[]} // Aquí eventualmente cargaríamos los asientos ocupados desde tickets_service
            />
        </div>
    );
};

export default LiveMapViewer;
