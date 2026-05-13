import React from 'react';
import { Icon, Skeleton } from '../../../../components';

const DashboardMetrics = ({ showSkeleton, navigate }) => {
    return (
        <div className="dashboard-footer-grid">
            <div className="metric-card" onClick={() => navigate('/admin/monitoring')}>
                <div className="metric-card-header">
                    <span className="metric-title">MEMORIA RAM</span>
                    <div className="metric-icon-box">
                        <Icon name="server" size={14} />
                    </div>
                </div>
                <div className="metric-card-body">
                    {showSkeleton ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton width="40%" height="10px" />
                            <Skeleton width="80%" height="24px" />
                            <Skeleton width="100%" height="8px" style={{ borderRadius: '4px' }} />
                        </div>
                    ) : (
                        <>
                            <div className="metric-info-row">
                                <span className="metric-subtitle">USO DE MEMORIA VOLÁTIL</span>
                                <span className="metric-value">87.7%</span>
                            </div>
                            <div className="metric-progress-wrapper">
                                <div 
                                    className="metric-progress-bar" 
                                    style={{ width: '87.7%', backgroundColor: '#ef4444' }} 
                                ></div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="metric-card" onClick={() => navigate('/admin/monitoring')}>
                <div className="metric-card-header">
                    <span className="metric-title">CPU CORE</span>
                    <div className="metric-icon-box">
                        <Icon name="cpu" size={14} />
                    </div>
                </div>
                <div className="metric-card-body">
                    {showSkeleton ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Skeleton width="40%" height="10px" />
                            <Skeleton width="80%" height="24px" />
                            <Skeleton width="100%" height="8px" style={{ borderRadius: '4px' }} />
                        </div>
                    ) : (
                        <>
                            <div className="metric-info-row">
                                <span className="metric-subtitle">CARGA DE PROCESAMIENTO</span>
                                <span className="metric-value">56%</span>
                            </div>
                            <div className="metric-progress-wrapper">
                                <div 
                                    className="metric-progress-bar" 
                                    style={{ width: '56%', backgroundColor: '#eab308' }} 
                                ></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardMetrics;
