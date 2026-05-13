import React from 'react';
import { Move, Crosshair, CornerUpRight, Type, Check, RotateCcw, X } from 'lucide-react';

const MapToolbar = ({
    toolbarPos,
    setDraggingToolbar,
    editSubMode,
    setEditSubMode,
    selectedZoneId,
    zones,
    onZoneColorChange,
    initialZoneState,
    onUpdateGeometry,
    onZoneSelect
}) => {
    const selectedZone = zones.find(z => z.id === selectedZoneId);

    const handleToolbarMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            setDraggingToolbar({ offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
        }
    };

    return (
        <div 
            className="edit-submode-toolbar" 
            onMouseDown={handleToolbarMouseDown}
            style={{
                position: 'absolute', 
                top: toolbarPos.y !== null ? `${toolbarPos.y}px` : '15px', 
                left: toolbarPos.x !== null ? `${toolbarPos.x}px` : '50%', 
                transform: toolbarPos.x !== null ? 'none' : 'translateX(-50%)',
                backgroundColor: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                padding: '4px', display: 'flex', gap: '4px', zIndex: 999,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
        >
            {[
                { id: 'move', label: 'Mover', icon: <Move size={13} strokeWidth={2.5} />, color: '#fff' },
                { id: 'points', label: 'Puntos', icon: <Crosshair size={13} strokeWidth={2.5} />, color: '#ce2c2c' },
                { id: 'curves', label: 'Curvas', icon: <CornerUpRight size={13} strokeWidth={2.5} />, color: '#8b5cf6' },
                { id: 'text', label: 'Texto', icon: <Type size={13} strokeWidth={2.5} />, color: '#0ea5e9' }
            ].map(b => (
                <button 
                    key={b.id}
                    title={b.label}
                    onClick={(e) => { e.stopPropagation(); setEditSubMode(b.id); }}
                    style={{
                        padding: '7px 9px', borderRadius: '8px', border: 'none',
                        backgroundColor: editSubMode === b.id ? b.color : 'transparent',
                        color: editSubMode === b.id ? '#000' : '#d4d4d8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: editSubMode === b.id ? '#000' : b.color }}>{b.icon}</span>
                </button>
            ))}

            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '6px', marginRight: '6px', alignSelf: 'center' }} />
            
            <div style={{ display: 'flex', gap: '4px', alignSelf: 'center' }}>
                {[
                    { id: 'platino', color: '#E5E4E2', gradient: 'linear-gradient(145deg, #FFFFFF 0%, #E5E4E2 45%, #A0A0A0 100%)', title: 'Platino Metálico' },
                    { id: 'oro', color: '#FFD700', gradient: 'linear-gradient(145deg, #FFEF96 0%, #FFD700 45%, #B8860B 100%)', title: 'Oro Metálico' },
                    { id: 'plata', color: '#C0C0C0', gradient: 'linear-gradient(145deg, #F5F5F5 0%, #C0C0C0 45%, #808080 100%)', title: 'Plata Metálica' },
                    { id: 'bronce', color: '#CD7F32', gradient: 'linear-gradient(145deg, #E2A76F 0%, #CD7F32 45%, #8B4513 100%)', title: 'Bronce Metálico' }
                ].map(preset => (
                    <button
                        key={preset.id}
                        title={preset.title}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onZoneColorChange) onZoneColorChange(selectedZoneId, preset.color);
                        }}
                        style={{
                            width: '18px', height: '18px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)',
                            background: preset.gradient, cursor: 'pointer', flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
                            transition: 'transform 0.1s'
                        }}
                    />
                ))}
            </div>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '6px', marginRight: '6px', alignSelf: 'center' }} />
            
            <div style={{ position: 'relative', width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.8)', cursor: 'pointer', flexShrink: 0, alignSelf: 'center', backgroundColor: (selectedZone?.color || '#eab308') }}>
                <input 
                    type="color" 
                    value={(selectedZone?.color || '#eab308').toLowerCase()}
                    onChange={(e) => onZoneColorChange(selectedZoneId, e.target.value)}
                    style={{ position: 'absolute', top: -10, left: -10, width: '45px', height: '45px', cursor: 'pointer', border: 'none', padding: 0, opacity: 0 }}
                />
            </div>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: '6px', marginRight: '6px', alignSelf: 'center' }} />
            
            {initialZoneState && (
                <button onClick={(e) => { e.stopPropagation(); onUpdateGeometry(initialZoneState.id, initialZoneState); }} style={{ padding: '7px 9px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#a1a1aa' }} title="Deshacer">
                    <RotateCcw size={12} strokeWidth={2.5} />
                </button>
            )}
            
            <button onClick={(e) => { e.stopPropagation(); if (initialZoneState) onUpdateGeometry(initialZoneState.id, initialZoneState); onZoneSelect(null); }} style={{ padding: '7px 9px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: '#a1a1aa' }} title="Cancelar">
                <X size={12} strokeWidth={2.5} />
            </button>
            
            <button onClick={(e) => { e.stopPropagation(); onZoneSelect(null); }} style={{ padding: '7px 11px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#fff', cursor: 'pointer' }} title="Aceptar">
                <Check size={12} strokeWidth={3} />
            </button>
        </div>
    );
};

export default MapToolbar;
