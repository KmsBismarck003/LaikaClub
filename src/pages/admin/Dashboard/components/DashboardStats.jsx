import React from 'react';
import { Card, AnimatedCounter, Icon, Skeleton } from '../../../../components';

const DashboardStats = ({ isLoading, stats }) => {
    const statCards = [
        { label: 'Usuarios Totales', value: stats.totalUsers, icon: 'users', key: 'users' },
        { label: 'Eventos', value: stats.totalEvents, icon: 'calendar', key: 'events' },
        { label: 'Ventas Totales', value: stats.totalSales, icon: 'dollarSign', key: 'sales' },
        { label: 'Online', value: stats.activeUsers, icon: 'checkCircle', key: 'online' },
    ];

    return (
        <div className="stats-grid">
            {statCards.map((s) => (
                <Card key={s.key} className="stat-card">
                    <div className="stat-content">
                        <div className="stat-info">
                            {isLoading ? (
                                <Skeleton width="90px" height="12px" style={{ marginBottom: '6px' }} />
                            ) : (
                                <p className="stat-label">{s.label}</p>
                            )}
                            <h2 className="stat-value">
                                {isLoading ? (
                                    <Skeleton width="60px" height="24px" />
                                ) : s.value !== null ? (
                                    <AnimatedCounter value={s.value} />
                                ) : (
                                    '-'
                                )}
                            </h2>
                        </div>
                        <div className="stat-icon">
                            {isLoading ? <Skeleton width="24px" height="24px" /> : <Icon name={s.icon} size={12} />}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;
