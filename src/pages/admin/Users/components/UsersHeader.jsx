import React from 'react';
import { Button, Icon } from '../../../../components';

const UsersHeader = ({ onRefresh, onCreateNew }) => {
    return (
        <div className="user-mgmt__header" style={{ marginBottom: '0.8rem' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                GESTIÓN DE USUARIOS
            </h1>
            <div className="user-mgmt__header-actions" style={{ display: 'flex', gap: '10px' }}>
                <Button 
                    variant="ghost" 
                    size="small" 
                    onClick={onRefresh} 
                    style={{ height: '32px', fontSize: '0.75rem', fontWeight: 800 }}
                >
                    REFRESCAR
                </Button>
                <Button 
                    variant="primary" 
                    size="small" 
                    onClick={onCreateNew} 
                    style={{ height: '32px', fontSize: '0.75rem', fontWeight: 800 }}
                >
                    <Icon name="plus" size={14} className="mr-2" /> NUEVO USUARIO
                </Button>
            </div>
        </div>
    );
};

export default UsersHeader;
