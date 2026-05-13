import React, { useState, useEffect, useRef, memo } from 'react';
import { useMapGeometry } from './hooks/useMapGeometry';
import { useMapInteraction } from './hooks/useMapInteraction';

// Components
import MapToolbar from './components/MapToolbar';
import MapZone from './components/MapZone';
import { Icon } from '..'; 

const VenueMapSVG = memo(({ 
    selectedSeats = [], 
    onSeatToggle,
    isEditMode = false,
    zones = [],
    onUpdateGeometry,
    selectedZoneId,
    onZoneSelect,
    mapView = { zoom: 1.15, pan: { x: 0, y: 0 } },
    onZoneColorChange,
    busySeats = [],
    rouletteActive = false,
    winnerSeatId = null,
    activeScannerZoneId = null,
    activeScannerSeatId = null,
    onRouletteComplete,
    setHoveredSeat,
    isAdminView = false // Nueva prop
}) => {
    const svgRef = useRef(null);
    const [persistentSeatInfo, setPersistentSeatInfo] = useState(null);
    const [initialZoneState, setInitialZoneState] = useState(null);
    const [processingAction, setProcessingAction] = useState(null); // 'refunding' | 'resending'
    const [actionStatus, setActionStatus] = useState(null); // 'success'

    // Hooks
    const { getMousePos, distToSegment, getPathData } = useMapGeometry(svgRef);
    
    const {
        draggingToolbar,
        alignmentGuides,
        toolbarPos,
        editSubMode,
        setEditSubMode,
        setDraggingToolbar,
        handleMouseDownPoint,
        handleMouseDownZone,
        handleMouseDownRotate,
        handleMouseDownText,
        handleMouseDownTextRotate,
        handleMouseDownCurve,
        handleSplitEdge,
        handleMouseMove,
        handleMouseUp,
        handlePathClick
    } = useMapInteraction(isEditMode, zones, onUpdateGeometry, onZoneSelect, getMousePos, distToSegment);

    // Initial State Backup for Undo
    useEffect(() => {
        if (selectedZoneId && zones.length > 0) {
            const z = zones.find(x => x.id === selectedZoneId);
            if (z && (!initialZoneState || initialZoneState.id !== selectedZoneId)) {
                setInitialZoneState(JSON.parse(JSON.stringify(z)));
            }
        } else if (!selectedZoneId) {
            setInitialZoneState(null);
        }
    }, [selectedZoneId, zones, initialZoneState]);

    // Lógica de Acciones del HUD
    const handleAdminAction = (action) => {
        setProcessingAction(action);
        setActionStatus(null);
        
        // Simulación de delay de API
        setTimeout(() => {
            setProcessingAction(null);
            setActionStatus('success');
            
            // Limpiar mensaje de éxito tras 3 segundos
            setTimeout(() => setActionStatus(null), 3000);
        }, 1500);
    };

    // Cerrar HUD reseteando estados
    const closeHUD = () => {
        setPersistentSeatInfo(null);
        setProcessingAction(null);
        setActionStatus(null);
    };

    return (
        <div 
            className="venue-map-svg-container" 
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp} 
            onMouseLeave={handleMouseUp} 
            style={{ 
                width: '100%', height: '100%', 
                cursor: draggingToolbar ? 'grabbing' : 'default', 
                position: 'relative', background: 'transparent' 
            }}
        >
            {isEditMode && selectedZoneId && (
                <MapToolbar 
                    toolbarPos={toolbarPos}
                    setDraggingToolbar={setDraggingToolbar}
                    editSubMode={editSubMode}
                    setEditSubMode={setEditSubMode}
                    selectedZoneId={selectedZoneId}
                    zones={zones}
                    onZoneColorChange={onZoneColorChange}
                    initialZoneState={initialZoneState}
                    onUpdateGeometry={onUpdateGeometry}
                    onZoneSelect={onZoneSelect}
                />
            )}

            <style>{`
                @keyframes marchingAnts { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
                .marching-ants { stroke-dasharray: 6, 4; stroke-linecap: round; }
            `}</style>

            <svg 
                ref={svgRef} 
                viewBox="0 0 800 600" 
                className="venue-map-svg" 
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                onClick={(e) => {
                    // Solo deseleccionar si el clic es directamente en el fondo del SVG
                    if (e.target === svgRef.current || e.target.tagName === 'svg') {
                        onZoneSelect(null);
                    }
                }}
            >
                <g transform={`translate(${mapView.pan.x}, ${mapView.pan.y}) scale(${mapView.zoom})`} style={{ transition: 'transform 0.3s' }}>
                    <defs>
                        <linearGradient id="stageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#999', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>

                    {zones.map(zone => (
                        <MapZone 
                            key={zone.id}
                            zone={zone}
                            isSelected={selectedZoneId === zone.id}
                            isEditMode={isEditMode}
                            isAdminView={isAdminView} // PASAR PROP
                            editSubMode={editSubMode}
                            activeScannerZoneId={activeScannerZoneId}
                            activeScannerSeatId={activeScannerSeatId}
                            busySeats={busySeats}
                            selectedSeats={selectedSeats}
                            rouletteActive={rouletteActive}
                            winnerSeatId={winnerSeatId}
                            getPathData={getPathData}
                            handleMouseDownZone={handleMouseDownZone}
                            handleMouseDownText={handleMouseDownText}
                            handleMouseDownPoint={handleMouseDownPoint}
                            handleMouseDownRotate={handleMouseDownRotate}
                            handleMouseDownTextRotate={handleMouseDownTextRotate}
                            handleMouseDownCurve={handleMouseDownCurve}
                            handleSplitEdge={handleSplitEdge}
                            onZoneSelect={onZoneSelect}
                            onSeatToggle={onSeatToggle}
                            setHoveredSeat={setHoveredSeat}
                            setPersistentSeatInfo={setPersistentSeatInfo}
                        />
                    ))}

                    {alignmentGuides.x.map((x, i) => <line key={`gx-${i}`} x1={x} y1="-2000" x2={x} y2="2000" stroke="#ff0000" strokeWidth="1" strokeDasharray="3,2" style={{ opacity: 0.9 }} />)}
                    {alignmentGuides.y.map((y, i) => <line key={`gy-${i}`} x1="-2000" y1={y} x2="2000" y2={y} stroke="#ff0000" strokeWidth="1" strokeDasharray="3,2" style={{ opacity: 0.9 }} />)}
                </g>
            </svg>

            {/* HUD DE INTELIGENCIA ADMIN (Persistent Info) */}
            {isAdminView && persistentSeatInfo && (
                <div 
                    className="admin-intel-hud"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '280px',
                        background: 'rgba(5, 5, 5, 0.95)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#fff',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        animation: 'fadeInSlide 0.3s ease-out'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                                width: '10px', height: '10px', borderRadius: '50%', 
                                background: persistentSeatInfo.status === 'VENDIDO' ? '#F31260' : '#FFA500' 
                            }} />
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                                {persistentSeatInfo.status}
                            </span>
                        </div>
                        <button 
                            onClick={closeHUD}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.5 }}
                        >
                            <Icon name="x" size={14} />
                        </button>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 4px 0', textTransform: 'uppercase', color: '#fff' }}>
                        {persistentSeatInfo.id}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px 0' }}>
                        {persistentSeatInfo.zoneName} • {persistentSeatInfo.price}
                    </p>

                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block' }}>Comprador</label>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{persistentSeatInfo.user || 'Ulises Garcia'}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block' }}>Email</label>
                            <span style={{ fontSize: '12px', color: '#0ea5e9' }}>{persistentSeatInfo.email || 'ulises@laika.club'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block' }}>Método</label>
                                <span style={{ fontSize: '11px' }}>{persistentSeatInfo.paidWith || 'VISA **** 4242'}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block' }}>Fecha</label>
                                <span style={{ fontSize: '11px', color: '#fff' }}>{persistentSeatInfo.date || '05/04 14:20'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', position: 'relative' }}>
                        {actionStatus === 'success' ? (
                            <div style={{ 
                                width: '100%', padding: '8px', borderRadius: '6px', 
                                background: '#17C964', color: '#000', fontSize: '10px', 
                                fontWeight: '950', textAlign: 'center', animation: 'fadeInSlide 0.3s' 
                            }}>
                                <Icon name="check" size={12} style={{ marginRight: '6px' }} />
                                ACCIÓN COMPLETADA CON ÉXITO
                            </div>
                        ) : (
                            <>
                                <button 
                                    disabled={processingAction === 'refunding'}
                                    onClick={() => handleAdminAction('refunding')}
                                    style={{ 
                                        flex: 1, padding: '8px', borderRadius: '6px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        background: 'transparent', color: '#fff', fontSize: '10px', 
                                        cursor: processingAction ? 'not-allowed' : 'pointer',
                                        opacity: processingAction === 'refunding' ? 0.5 : 1
                                    }}
                                >
                                    {processingAction === 'refunding' ? 'PROCESANDO...' : 'REEMBOLSAR'}
                                </button>
                                <button 
                                    disabled={processingAction === 'resending'}
                                    onClick={() => handleAdminAction('resending')}
                                    style={{ 
                                        flex: 1, padding: '8px', borderRadius: '6px', border: 'none', 
                                        background: '#fff', color: '#000', fontSize: '10px', 
                                        fontWeight: 'bold', 
                                        cursor: processingAction ? 'not-allowed' : 'pointer',
                                        opacity: processingAction === 'resending' ? 0.5 : 1
                                    }}
                                >
                                    {processingAction === 'resending' ? 'ENVIANDO...' : 'RE-ENVIAR'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default VenueMapSVG;
