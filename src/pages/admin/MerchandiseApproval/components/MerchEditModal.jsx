import React from 'react';
import { ShieldCheck, Target, CreditCard, Save } from 'lucide-react';
import { Button } from '../../../../components';

const MerchEditModal = ({ editingSettings, setEditingSettings, handleSaveSettings }) => {
    if (!editingSettings) return null;

    return (
        <div className="industrial-modal-overlay">
            <div className="industrial-modal">
                <div className="modal-header">
                    <h2><ShieldCheck size={20} /> CONFIGURACIÓN DE PERMISOS</h2>
                    <button className="close-btn" onClick={() => setEditingSettings(null)}>&times;</button>
                </div>
                
                <form onSubmit={handleSaveSettings} className="industrial-form">
                    <div className="form-info-panel">
                        <span className="label">GESTOR:</span>
                        <span className="value">{editingSettings.first_name} {editingSettings.last_name}</span>
                    </div>

                    <div className="form-grid">
                        <div className="form-group-industrial">
                            <label>TIENDA HABILITADA</label>
                            <label className="tech-checkbox">
                                <input 
                                    type="checkbox"
                                    checked={editingSettings.settings.is_enabled}
                                    onChange={(e) => setEditingSettings(prev => ({
                                        ...prev, 
                                        settings: { ...prev.settings, is_enabled: e.target.checked }
                                    }))}
                                />
                                <span className="checkmark" />
                                <span className="check-label">{editingSettings.settings.is_enabled ? 'SÍ, ACTIVAR ACCESO' : 'NO, BLOQUEAR'}</span>
                            </label>
                        </div>

                        <div className="form-group-industrial">
                            <label>CUOTA DE ACTIVACIÓN</label>
                            <label className="tech-checkbox">
                                <input 
                                    type="checkbox"
                                    checked={editingSettings.settings.activation_fee_paid}
                                    onChange={(e) => setEditingSettings(prev => ({
                                        ...prev, 
                                        settings: { ...prev.settings, activation_fee_paid: e.target.checked }
                                    }))}
                                />
                                <span className="checkmark" />
                                <span className="check-label">{editingSettings.settings.activation_fee_paid ? 'PAGADA' : 'PENDIENTE'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group-industrial">
                            <label>LÍMITE DE PRODUCTOS</label>
                            <div className="input-with-icon">
                                <Target size={16} />
                                <input 
                                    type="number" 
                                    value={editingSettings.settings.product_limit || 50}
                                    onChange={(e) => setEditingSettings(prev => ({
                                        ...prev, 
                                        settings: { ...prev.settings, product_limit: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>

                        <div className="form-group-industrial">
                            <label>COMISIÓN LAIKA (%)</label>
                            <div className="input-with-icon">
                                <CreditCard size={16} />
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={editingSettings.settings.commission_percentage || 10}
                                    onChange={(e) => setEditingSettings(prev => ({
                                        ...prev, 
                                        settings: { ...prev.settings, commission_percentage: e.target.value }
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <Button variant="secondary" onClick={() => setEditingSettings(null)}>DESCARTAR</Button>
                        <Button type="submit" variant="primary">
                            <Save size={16} /> APLICAR CAMBIOS PRO
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MerchEditModal;
