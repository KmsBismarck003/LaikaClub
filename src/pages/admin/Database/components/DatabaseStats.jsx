import React from 'react';
import { Skeleton } from '../../../../components';

const DatabaseStats = ({ backups, totalSize, lastBackup, loading }) => {
    return (
        <div className="database-mgmt__stats-banner" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '160px', background: '#f8f8f8', border: '1px solid #eee' }}>
                {loading ? <Skeleton type="text" width="40px" height="30px" /> : <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000' }}>{backups.length}</span>}
                <div>
                    {loading ? (
                        <>
                            <Skeleton type="text" width="60px" height="8px" style={{ marginBottom: '4px' }} />
                            <Skeleton type="text" width="80px" height="10px" />
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, fontWeight: 900 }}>Respaldos</div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Disponibles</div>
                        </>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '160px', background: '#f8f8f8', border: '1px solid #eee' }}>
                {loading ? <Skeleton type="text" width="55px" height="30px" /> : <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000' }}>{totalSize}</span>}
                <div>
                    {loading ? (
                        <>
                            <Skeleton type="text" width="50px" height="8px" style={{ marginBottom: '4px' }} />
                            <Skeleton type="text" width="90px" height="10px" />
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, fontWeight: 900 }}>MB Total</div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Almacenados</div>
                        </>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px', background: '#f8f8f8', border: '1px solid #eee' }}>
                {loading ? <Skeleton type="text" width="90px" height="30px" /> : <span style={{ fontSize: '1rem', fontWeight: '800', color: '#000' }}>{lastBackup}</span>}
                <div>
                    {loading ? (
                        <>
                            <Skeleton type="text" width="40px" height="8px" style={{ marginBottom: '4px' }} />
                            <Skeleton type="text" width="70px" height="10px" />
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, fontWeight: 900 }}>Último</div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Respaldo</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseStats;
