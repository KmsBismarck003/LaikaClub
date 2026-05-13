import React from 'react';
import { Button, Skeleton } from '../../../../components';

const DatabaseActions = ({ 
    activeView, 
    loading, 
    onOpenBackup, 
    onOpenAutoConfig, 
    onOptimize, 
    onClearCache 
}) => {
    if (loading) {
        return (
            <div className="database-mgmt__actions-bar" style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                <Skeleton width="180px" height="40px" borderRadius="12px" />
                <Skeleton width="170px" height="40px" borderRadius="12px" />
                <Skeleton width="150px" height="40px" borderRadius="12px" />
                <Skeleton width="140px" height="40px" borderRadius="12px" />
            </div>
        );
    }

    return (
        <div className="database-mgmt__actions-bar" style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <Button 
                onClick={onOpenBackup} 
                style={{ 
                    background: '#111111', 
                    color: '#ffffff', 
                    border: '1px solid #ffffff',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    height: '40px'
                }}
            >
                GESTIONAR RESPALDOS
            </Button>
            
            <Button 
                variant="info" 
                style={{ 
                    color: '#ffffff', 
                    background: '#2980b9',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    height: '40px'
                }} 
                onClick={onOpenAutoConfig}
            >
                CONFIG. AUTOMÁTICA
            </Button>
            
            <Button 
                variant="warning" 
                onClick={onOptimize} 
                style={{ 
                    color: '#ffffff', 
                    background: '#f39c12',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    height: '40px'
                }}
            >
                {activeView === 'sql' ? 'OPTIMIZAR BD' : 'AUTO-COMPACTAR'}
            </Button>
            
            <Button 
                variant="danger" 
                onClick={onClearCache} 
                style={{ 
                    background: '#e74c3c', 
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    height: '40px'
                }}
            >
                LIMPIAR CACHÉ
            </Button>
        </div>
    );
};

export default DatabaseActions;
