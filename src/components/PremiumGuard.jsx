import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Zap, Lock } from 'lucide-react';
import { Button } from './index';
import './PremiumGuard.css';

const PremiumGuard = ({ children, featureName = "esta herramienta premium" }) => {
    const { user } = useAuth();
    const isPremium = user?.isPremium;

    // DESACTIVACIÓN SOLICITADA POR EL USUARIO: Permitir acceso total a funciones Premium
    return <>{children}</>;

    return (
        <div className="premium-guard-container">
            {/* Capa de contenido desenfocada */}
            <div className="premium-blurred-content">
                {children}
            </div>

            {/* Capa del Muro de Pago */}
            <div className="premium-overlay">
                <div className="premium-card glass-panel-premium">
                    <div className="premium-header">
                        <div className="p-icon-ring">
                            <Lock size={32} className="p-icon" />
                        </div>
                        <h2>MEMBRESÍA REQUERIDA</h2>
                        <p>No tienes acceso a <strong>{featureName}</strong></p>
                    </div>

                    <div className="premium-details">
                        <div className="benefit-item">
                            <Zap size={16} className="highlight-text" />
                            <span>Sincronización en tiempo real</span>
                        </div>
                        <div className="benefit-item">
                            <ShieldCheck size={16} className="highlight-text" />
                            <span>Seguridad de activos nivel Industrial</span>
                        </div>
                    </div>

                    <div className="premium-actions">
                        <Button 
                            variant="primary" 
                            className="btn-premium-upgrade"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-premium-modal'))}
                        >
                            VER PLANES DE SUSCRIPCIÓN
                        </Button>
                        <span className="premium-hint">Activa tu cuenta para desbloquear.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumGuard;
