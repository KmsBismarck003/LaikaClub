import React from 'react';
import { Button, Skeleton, Icon } from '../../../../components';

const DashboardHeader = ({ isLoading, displayText, currentTime, handleResetOrder }) => {
    return (
        <header className="dashboard-header">
            <div className="welcome-banner">
                <h1 className="welcome-greeting">
                    {isLoading ? <Skeleton width="220px" height="32px" /> : displayText}
                </h1>
                {isLoading ? (
                    <Skeleton width="300px" height="14px" style={{ marginTop: '8px' }} />
                ) : (
                    <p className="welcome-date">
                        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} | {currentTime.toLocaleTimeString('es-ES')}
                    </p>
                )}
            </div>
            <div className="header-actions">
                {isLoading ? (
                    <Skeleton width="100px" height="26px" style={{ borderRadius: '4px' }} />
                ) : (
                    <Button
                        variant="ghost"
                        size="small"
                        onClick={handleResetOrder}
                        className="premium-reset-btn"
                    >
                        <Icon name="refreshCw" size={12} />
                        <span>RESTABLECER ORDEN</span>
                    </Button>
                )}
            </div>
        </header>
    );
};

export default DashboardHeader;
