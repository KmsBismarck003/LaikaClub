import React from 'react';
import { Card } from '../../../../components';
import Icon from '../../../../components/Icons';

const LaikaIdentity = ({ isEnabled, laikaAvatar, handleToggleLaika, handleAvatarChange }) => {
    return (
        <Card title="Identidad de Laika">
            <div className="avatar-manager-content" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="avatar-preview-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={laikaAvatar}
                        alt="Laika"
                        style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid var(--primary)',
                            marginBottom: '20px',
                            padding: '5px',
                            background: 'rgba(0,0,0,0.2)'
                        }}
                    />
                    <label className="avatar-edit-btn" style={{
                        position: 'absolute',
                        bottom: '25px',
                        right: '5px',
                        background: 'var(--primary)',
                        color: '#000',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.8)'
                    }}>
                        <Icon name="camera" size={18} />
                        <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                    </label>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>LAIKA AI v2.6.7</h2>
                <div 
                    className="laika-status-badge" 
                    onClick={handleToggleLaika}
                    style={{
                        display: 'inline-block',
                        marginTop: '15px',
                        padding: '8px 20px',
                        background: isEnabled ? 'rgba(0, 255, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)',
                        border: `1px solid ${isEnabled ? '#00FF00' : '#FF0000'}`,
                        borderRadius: '30px',
                        color: isEnabled ? '#00FF00' : '#FF0000',
                        fontWeight: '800',
                        fontSize: '0.7rem',
                        letterSpacing: '2px',
                        cursor: 'pointer'
                    }}
                >
                    {isEnabled ? '● SISTEMA GLOBAL ACTIVO' : '○ SISTEMA GLOBAL OFF'}
                </div>
            </div>
        </Card>
    );
};

export default LaikaIdentity;
