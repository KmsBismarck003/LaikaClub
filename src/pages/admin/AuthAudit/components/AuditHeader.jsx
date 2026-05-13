import React from 'react';
import { Button, Skeleton } from '../../../../components';

const AuditHeader = ({ loading, filteredCount, onRefresh }) => {
    return (
        <div className="audit-header-flex">
            <div className="audit-title-group">
                <h1 className="admin-title">AUDITORÍA DE ACCESOS</h1>
                <div className="audit-status-badge">
                    {loading ? (
                        <Skeleton style={{ height: '12px', width: '80px', borderRadius: '0px' }} animate />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />
                            <span>{filteredCount} REGISTRO{filteredCount !== 1 ? 'S' : ''} FILTRADOS</span>
                        </div>
                    )}
                </div>
            </div>
            <Button 
                variant="outline" 
                size="small" 
                onClick={onRefresh} 
                loading={loading}
                className="tech-btn"
            >
                ACTUALIZAR SISTEMA
            </Button>
        </div>
    );
};

export default AuditHeader;
