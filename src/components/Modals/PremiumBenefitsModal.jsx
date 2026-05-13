import React from 'react';
import { 
    Zap, ShieldCheck, BarChart3, Globe, 
    Clock, Smartphone, Rocket, X 
} from 'lucide-react';
import { Modal, Button } from '../index';
import './PremiumBenefitsModal.css';

const PremiumBenefitsModal = ({ isOpen, onClose }) => {
    const plans = [
        {
            name: 'PROFESIONAL',
            price: '$299',
            period: '/mes',
            description: 'Ideal para gestores individuales y eventos medianos.',
            features: [
                'Inventario ilimitado',
                'Analíticas básicas',
                'Soporte vía Email',
                '1 Usuario'
            ],
            recommended: false
        },
        {
            name: 'INDUSTRIAL',
            price: '$799',
            period: '/mes',
            description: 'Potencia total para empresas de eventos masivos.',
            features: [
                'Todo lo de Profesional',
                'Big Data en tiempo real',
                'Soporte 24/7',
                'Usuarios ilimitados',
                'Acceso al API Pro'
            ],
            recommended: true
        }
    ];

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="SISTEMA DE MEMBRESÍAS LAIKA PRO"
            maxWidth="900px"
        >
            <div className="premium-modal-content">
                <header className="pm-header">
                    <Rocket size={40} className="pm-rocket-icon" />
                    <h2>ELEVA TU GESTIÓN AL SIGUIENTE NIVEL</h2>
                    <p>Desbloquea herramientas de grado industrial y optimiza tus ingresos.</p>
                </header>

                <div className="pm-plans-grid">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`pm-plan-card ${plan.recommended ? 'recommended' : ''}`}>
                            {plan.recommended && <div className="pm-plan-badge">RECOMENDADO</div>}
                            <div className="pm-plan-header">
                                <h3>{plan.name}</h3>
                                <div className="pm-price">
                                    <span className="pm-currency">$</span>
                                    <span className="pm-amount">{plan.price.replace('$', '')}</span>
                                    <span className="pm-period">{plan.period}</span>
                                </div>
                                <p className="pm-plan-desc">{plan.description}</p>
                            </div>
                            
                            <ul className="pm-features-list">
                                {plan.features.map((f, i) => (
                                    <li key={i}>
                                        <ShieldCheck size={16} className="f-icon" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button 
                                variant={plan.recommended ? 'primary' : 'secondary'} 
                                className="pm-plan-btn"
                                onClick={() => alert('Integrando con pasarela de pago...')}
                            >
                                SELECCIONAR PLAN {plan.name}
                            </Button>
                        </div>
                    ))}
                </div>

                <footer className="pm-footer">
                    <div className="pm-trust-badges">
                        <div className="t-badge"><Clock size={14} /> <span>Activación Instantánea</span></div>
                        <div className="t-badge"><Globe size={14} /> <span>Acceso Global</span></div>
                        <div className="t-badge"><Smartphone size={14} /> <span>App Móvil Incluida</span></div>
                    </div>
                </footer>
            </div>
        </Modal>
    );
};

export default PremiumBenefitsModal;
