import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Sliders } from 'lucide-react';
import EmailTester from './components/EmailTester';
import './EmailManager.css';

const EmailManager = () => {
    const [activeTab, setActiveTab] = useState('tester');

    return (
        <div className="email-manager-container animate-fade-in">
            <div className="admin-header">
                <h1 className="admin-title">
                    <Mail className="title-icon" />
                    Central de Comunicaciones
                </h1>
                <p className="admin-subtitle">Gestión de plantillas, envíos masivos y pruebas SMTP</p>
            </div>

            <div className="email-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                    onClick={() => setActiveTab('config')}
                >
                    <Sliders size={18} />
                    Plantillas del Sistema
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'tester' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tester')}
                >
                    <Send size={18} />
                    Simulador & Pruebas
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'config' && (
                    <div className="config-section">
                        <h2>Configuración de Plantillas Activas</h2>
                        <p className="section-desc">Selecciona qué diseño se utilizará para los correos automáticos del sistema. Los cambios aplican inmediatamente.</p>
                        
                        <div className="template-cards-grid">
                            <div className="template-config-card active-card">
                                <div className="status-badge"><CheckCircle size={14} /> Activa</div>
                                <h3>Plantilla de Boletos</h3>
                                <p>Usada cuando el usuario compra o reserva su acceso a un evento.</p>
                                <select className="industrial-select mt-10">
                                    <option>Diseño Clásico VIP</option>
                                    <option>Diseño Minimalista</option>
                                    <option>Diseño Neón</option>
                                </select>
                            </div>

                            <div className="template-config-card active-card">
                                <div className="status-badge"><CheckCircle size={14} /> Activa</div>
                                <h3>Notificaciones del Sistema</h3>
                                <p>Usada para cancelaciones, cambios de horario o alertas de seguridad.</p>
                                <select className="industrial-select mt-10">
                                    <option>Estándar Laika</option>
                                    <option>Urgente (Rojo)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tester' && (
                    <EmailTester />
                )}
            </div>
        </div>
    );
};

export default EmailManager;
