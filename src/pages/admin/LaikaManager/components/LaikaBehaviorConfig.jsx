import React from 'react';
import { Card } from '../../../../components';

const LaikaBehaviorConfig = ({ soundEnabled, setSoundEnabled, typingSpeed, setTypingSpeed }) => {
    const speeds = ['Lento', 'Normal', 'Instántaneo'];

    const handleSoundChange = (e) => {
        const enabled = e.target.checked;
        setSoundEnabled(enabled);
        localStorage.setItem('laika_sound_enabled', enabled.toString());
        window.dispatchEvent(new Event('storage'));
    };

    const handleSpeedChange = (speed) => {
        const s = speed.toLowerCase();
        setTypingSpeed(s);
        localStorage.setItem('laika_typing_speed', s);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <Card title="Comportamiento y Sonido" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div className="laika-setting-item">
                    <strong style={{ 
                        display: 'block', marginBottom: '10px', 
                        textTransform: 'uppercase', fontSize: '0.75rem', 
                        letterSpacing: '1px' 
                    }}>Efectos de Sonido</strong>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={handleSoundChange}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="laika-setting-item">
                    <strong style={{ 
                        display: 'block', marginBottom: '10px', 
                        textTransform: 'uppercase', fontSize: '0.75rem', 
                        letterSpacing: '1px' 
                    }}>Velocidad de Escritura</strong>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {speeds.map(s => (
                            <button
                                key={s}
                                className={`theme-badge ${typingSpeed === s.toLowerCase() ? 'active' : ''}`}
                                onClick={() => handleSpeedChange(s)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    flex: 1,
                                    background: typingSpeed === s.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.03)',
                                    color: typingSpeed === s.toLowerCase() ? '#000' : '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontWeight: '950',
                                    textTransform: 'uppercase',
                                    fontSize: '0.65rem',
                                    letterSpacing: '1.5px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default LaikaBehaviorConfig;
