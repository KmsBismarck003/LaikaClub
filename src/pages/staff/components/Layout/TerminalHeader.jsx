import React from 'react';
import { Button, Icon } from '../../../../components';
import { Camera, Search, ShoppingBag, Activity } from 'lucide-react';

const TerminalHeader = ({ 
    accessPoint, 
    setAccessPoint, 
    selectedEventId, 
    setSelectedEventId, 
    events, 
    activeTab, 
    onTabChange 
}) => {
    return (
        <>
            <div className="staff-terminal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Panel de Operación Staff</h1>
                    <div className="subtitle">Gestión de accesos y servicios en tiempo real</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#888', textTransform: 'uppercase' }}>Evento Seleccionado</span>
                        <select 
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="input-select-mini"
                            style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 16px', fontSize: '0.9rem', fontWeight: '700' }}
                        >
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="health-banner-staff">
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                        <div className="status-label">Punto de Control</div>
                        <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} color="var(--success)" />
                            {accessPoint}
                            <button onClick={() => {
                                const p = prompt('Cambiar Punto de Acceso:', accessPoint);
                                if(p) setAccessPoint(p);
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                                <Icon name="edit" size={12} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="status-label">Estado de Red</div>
                        <div className="status-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                            Sincronizado
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                        size="small" 
                        variant={activeTab === 'scanner' ? 'primary' : 'secondary'}
                        onClick={() => onTabChange('scanner')}
                    >
                        <Camera size={14} className="mr-2" /> Scanner
                    </Button>
                    <Button 
                        size="small" 
                        variant={activeTab === 'helpdesk' ? 'primary' : 'secondary'}
                        onClick={() => onTabChange('helpdesk')}
                    >
                        <Search size={14} className="mr-2" /> Ayuda
                    </Button>
                    <Button 
                        size="small" 
                        variant={activeTab === 'boxoffice' ? 'primary' : 'secondary'}
                        onClick={() => onTabChange('boxoffice')}
                    >
                        <ShoppingBag size={14} className="mr-2" /> Taquilla
                    </Button>
                </div>
            </div>
        </>
    );
};

export default TerminalHeader;
