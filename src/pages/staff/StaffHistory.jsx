import React, { useState, useEffect } from 'react';
import StaffHistoryList from './components/StaffHistoryList';
import StaffStats from './components/StaffStats';
import { History } from 'lucide-react';
import './StaffDashboard.css';

const StaffHistory = () => {
    const [scanHistory, setScanHistory] = useState([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('staff_scan_history');
        if (savedHistory) {
            try {
                setScanHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error parsing scan history', e);
            }
        }
    }, []);

    return (
        <div className="staff-dashboard-page">
            <header className="staff-header">
                <div className="staff-header-content">
                    <h1>
                        <History size={28} color="var(--staff-accent-primary)" />
                        Registro de Accesos • Bitácora de Turno
                    </h1>
                    <p className="staff-subtitle">Histories de verificación auditados en tiempo real durante tu sesión activa</p>
                </div>
            </header>

            <StaffStats history={scanHistory} />

            <div style={{ marginTop: '2.5rem' }}>
                <StaffHistoryList history={scanHistory} />
            </div>
        </div>
    );
};

export default StaffHistory;
