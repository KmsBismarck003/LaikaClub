import React from 'react';
import { Target, CreditCard, Edit3 } from 'lucide-react';
import { Card, Badge, Button } from '../../../../components';

const MerchTable = ({ filteredGestores, updatingId, togglePremium, setEditingSettings }) => {
    return (
        <Card className="industrial-table-card">
            <div className="table-wrapper-industrial">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>IDENTIDAD GESTOR</th>
                            <th>MEMBRESÍA PRO</th>
                            <th>ESTADO TIENDA</th>
                            <th>LÍMITE PROD.</th>
                            <th>COMISIÓN</th>
                            <th style={{ textAlign: 'right' }}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGestores.map(g => (
                            <tr key={g.id}>
                                <td>
                                    <div className="user-identity">
                                        <span className="u-name">{g.first_name} {g.last_name}</span>
                                        <span className="u-email">{g.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={`tech-switch ${g.is_premium ? 'on' : 'off'} ${updatingId === g.id ? 'loading' : ''}`}
                                         onClick={() => !updatingId && togglePremium(g.id, g.is_premium)}>
                                        <div className="switch-knob" />
                                        <span className="switch-status">{g.is_premium ? 'PREMIUM' : 'ESTÁNDAR'}</span>
                                    </div>
                                </td>
                                <td>
                                    <Badge variant={g.settings?.is_enabled ? 'success' : 'secondary'} rounded>
                                        {g.settings?.is_enabled ? 'HABILITADA' : 'BLOQUEADA'}
                                    </Badge>
                                </td>
                                <td>
                                    <span className="product-limit-display">
                                        <Target size={12} /> {g.settings?.product_limit || 50}
                                    </span>
                                </td>
                                <td>
                                    <div className="commission-badge">
                                        <CreditCard size={12} /> {g.settings?.commission_percentage || 10}%
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <Button 
                                        variant="info" 
                                        size="small" 
                                        onClick={() => setEditingSettings({...g})}
                                        className="action-btn"
                                    >
                                        <Edit3 size={14} /> AJUSTAR
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default MerchTable;
