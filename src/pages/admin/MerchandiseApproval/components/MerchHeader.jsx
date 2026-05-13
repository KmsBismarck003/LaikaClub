import React from 'react';
import { Zap } from 'lucide-react';

const MerchHeader = ({ gestores }) => {
    const totalGestores = gestores.length;
    const premiumActivos = gestores.filter(g => g.is_premium).length;
    const tiendasHabilitadas = gestores.filter(g => g.settings?.is_enabled).length;

    return (
        <header className="page-header-industrial">
            <div className="header-main">
                <h1><Zap size={24} className="icon-zap" /> MONETIZACIÓN Y PERMISOS</h1>
                <p>PANEL DE CONTROL TÉCNICO PARA GESTORES Y MEMBRESÍAS</p>
            </div>

            <div className="stats-row-industrial">
                <div className="glass-stat-panel">
                    <span className="stat-value">{totalGestores}</span>
                    <div className="stat-info">
                        <span className="stat-label">GESTORES</span>
                        <span className="stat-sub">REGISTRADOS</span>
                    </div>
                </div>
                <div className="glass-stat-panel">
                    <span className="stat-value">{premiumActivos}</span>
                    <div className="stat-info">
                        <span className="stat-label">PREMIUM</span>
                        <span className="stat-sub">ACTIVOS</span>
                    </div>
                </div>
                <div className="glass-stat-panel highlight">
                    <span className="stat-value">{tiendasHabilitadas}</span>
                    <div className="stat-info">
                        <span className="stat-label">TIENDAS</span>
                        <span className="stat-sub">HABILITADAS</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MerchHeader;
