import React from 'react';
import { Settings, Maximize, Palette, Eye, Box, Triangle, Circle } from 'lucide-react';

const VisualSettingsToolbar = ({ 
    barWidth, setBarWidth, 
    markerSize, setMarkerSize, 
    customColor, setCustomColor, 
    opacity, setOpacity, 
    buildingShape, setBuildingShape,
    analysisMode
}) => {
    if (analysisMode !== '2D_EXPLORATION') return null;

    return (
        <div className="visual-settings-toolbar">
            {/* Sección: Geometría */}
            <div className="toolbar-section">
                <Settings size={16} color="#94a3b8" />
                
                <div className="slider-horizontal-premium">
                    <label>Grosor Barras</label>
                    <input 
                        type="range" 
                        min="0.05" max="0.5" step="0.01" 
                        value={barWidth} 
                        onChange={(e) => setBarWidth(parseFloat(e.target.value))} 
                        className="slider-premium" 
                    />
                </div>

                <div className="slider-horizontal-premium">
                    <label>Grosor Puntos</label>
                    <input 
                        type="range" 
                        min="4" max="24" step="1" 
                        value={markerSize} 
                        onChange={(e) => setMarkerSize(parseInt(e.target.value))} 
                        className="slider-premium" 
                    />
                </div>
            </div>

            {/* Sección: Apariencia */}
            <div className="toolbar-section">
                <Palette size={16} color="#94a3b8" />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="slider-horizontal-premium">
                        <label>Opacidad</label>
                        <input 
                            type="range" 
                            min="0.1" max="1" step="0.05" 
                            value={opacity} 
                            onChange={(e) => setOpacity(parseFloat(e.target.value))} 
                            className="slider-premium" 
                        />
                    </div>
                    </div>
                </div>

            {/* Sección: Estilo de Elementos (Segmented Control) */}
            <div className="toolbar-section">
                <div className="segmented-group">
                    <button 
                        className={`segmented-btn ${buildingShape === 'cube' ? 'active' : ''}`}
                        onClick={() => setBuildingShape('cube')}
                        title="Bloques (Cubos)"
                    >
                        <Box size={14} />
                        Cubo
                    </button>
                    <button 
                        className={`segmented-btn ${buildingShape === 'points' ? 'active' : ''}`}
                        onClick={() => setBuildingShape('points')}
                        title="Puntos"
                    >
                        <Circle size={14} />
                        Puntos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualSettingsToolbar;
