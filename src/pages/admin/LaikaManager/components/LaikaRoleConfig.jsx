import React from 'react';
import { Card } from '../../../../components';

const LaikaRoleConfig = ({ isEnabled, roleSettings, handleToggleLaika, handleToggleRole }) => {
    const mainRoles = ['gestor', 'operador', 'usuario'];

    return (
        <Card title="Activación por Roles">
            <div className="role-switches-container">
                <div className="laika-setting-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '15px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div className="s-info">
                        <strong style={{ display: 'block' }}>General (Admin)</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Control maestro del asistente</span>
                    </div>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={isEnabled} onChange={handleToggleLaika} />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                {mainRoles.map(role => (
                    <div key={role} className="laika-setting-item" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '15px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div className="s-info">
                            <strong style={{ display: 'block', textTransform: 'capitalize' }}>Rol: {role}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Habilitar Laika para este rol</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={roleSettings[role]}
                                onChange={() => handleToggleRole(role)}
                                disabled={!isEnabled}
                            />
                            <span className="toggle-slider" style={{ opacity: isEnabled ? 1 : 0.5 }}></span>
                        </label>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default LaikaRoleConfig;
