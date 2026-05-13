import React from 'react';
import { Button, Skeleton } from '../../../../components';

const DatabaseHeader = ({ activeView, setActiveView, loading }) => {
    return (
        <div className="database-mgmt__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            {loading ? (
                <Skeleton type="text" width="300px" height="28px" style={{ margin: 0 }} />
            ) : (
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '-0.03em' }}>
                    GESTIÓN DE BASE DE DATOS
                </h1>
            )}

            <div className="view-toggle-premium" style={{ display: 'flex', background: loading ? '#f0f0f0' : '#e0e0e0', padding: '4px', borderRadius: '8px', border: '1px solid #ccc' }}>
                {loading ? (
                    <>
                        <Skeleton width="90px" height="30px" borderRadius="6px" style={{ marginRight: '4px' }} />
                        <Skeleton width="90px" height="30px" borderRadius="6px" />
                    </>
                ) : (
                    <>
                        <Button 
                            size="small" 
                            onClick={() => setActiveView('sql')}
                            style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 900, 
                                minWidth: '90px', 
                                background: activeView === 'sql' ? '#111111' : 'transparent',
                                color: activeView === 'sql' ? '#ffffff' : '#444444',
                                border: 'none',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                height: '30px'
                            }}
                        >
                            SQL
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => setActiveView('nosql')}
                            style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 900, 
                                minWidth: '90px', 
                                background: activeView === 'nosql' ? '#111111' : 'transparent',
                                color: activeView === 'nosql' ? '#ffffff' : '#444444',
                                border: 'none',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                                height: '30px'
                            }}
                        >
                            NOSQL
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DatabaseHeader;
