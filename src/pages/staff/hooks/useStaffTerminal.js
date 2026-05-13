import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

export const useStaffTerminal = () => {
    const { user } = useAuth();
    const { success, error: showError } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Navigation Logic
    const [activeTab, setActiveTab] = useState('scanner');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['scanner', 'helpdesk', 'boxoffice'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        navigate(`/staff?tab=${tab}`);
    }, [navigate]);

    // 2. Event Selection
    const [selectedEventId, setSelectedEventId] = useState('');
    const [events, setEvents] = useState([]);

    const fetchEvents = useCallback(async () => {
        try {
            const data = await api.event.getAll({ status_filter: 'published' });
            setEvents(data);
            if (data.length > 0 && !selectedEventId) {
                setSelectedEventId(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    }, [selectedEventId]);

    // 3. Scanner & Verification Logic
    const [ticketCode, setTicketCode] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [accessPoint, setAccessPoint] = useState(() => localStorage.getItem('staff_access_point') || 'Puerta Principal');

    // Persist access point
    useEffect(() => {
        localStorage.setItem('staff_access_point', accessPoint);
    }, [accessPoint]);

    // Initial Load (History and Events)
    useEffect(() => {
        fetchEvents();
        const savedHistory = localStorage.getItem('staff_scan_history');
        if (savedHistory) {
            try {
                setScanHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error parsing scan history', e);
            }
        }
    }, [fetchEvents]);

    // Sync History
    useEffect(() => {
        localStorage.setItem('staff_scan_history', JSON.stringify(scanHistory));
    }, [scanHistory]);

    const handleVerifyTicket = async (code) => {
        const codeToVerify = code || ticketCode;
        if (!codeToVerify || !codeToVerify.trim()) {
            setAlert({ type: 'error', message: 'Ingresa un código de boleto' });
            return;
        }

        setLoading(true);
        setAlert(null);
        setIsScanning(false);

        try {
            const response = await api.ticket.verify(codeToVerify);
            const result = {
                valid: response.valid || false,
                ticketCode: codeToVerify,
                eventName: response.event?.name || response.eventName || 'Evento desconocido',
                customerName: response.customer?.name || response.customerName || 'Usuario',
                ticketType: response.ticketType || response.ticket_type || 'General',
                purchaseDate: response.purchaseDate || response.purchase_date || new Date().toISOString(),
                scannedAt: new Date().toISOString(),
                alreadyUsed: response.alreadyUsed || response.already_used || false,
                ticketId: response.id || response.ticketId,
                message: response.message
            };

            setVerificationResult(result);
            setTicketCode('');

            let status = 'invalid';
            if (result.valid && !result.alreadyUsed) status = 'valid';
            else if (result.alreadyUsed) status = 'used';

            setScanHistory(prev => [{ ...result, status }, ...prev.slice(0, 19)]);

            if (result.valid && !result.alreadyUsed) {
                success('Boleto válido y listo para ingreso');
            } else if (result.alreadyUsed) {
                showError('¡ALERTA! Boleto YA USADO');
            } else {
                showError('Boleto inválido');
            }
        } catch (error) {
            console.error('Error al verificar:', error);
            setAlert({ type: 'error', message: error.message || 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemTicket = async () => {
        if (!verificationResult || !verificationResult.valid || verificationResult.alreadyUsed) return;
        try {
            await api.ticket.redeem(verificationResult.ticketCode);
            success('Entrada registrada exitosamente');
            setVerificationResult(prev => ({ ...prev, alreadyUsed: true, status: 'used' }));
            setScanHistory(prev => prev.map((item, index) =>
                index === 0 ? { ...item, alreadyUsed: true, status: 'used' } : item
            ));
        } catch (error) {
            showError(error.message || 'Error al registrar entrada');
        }
    };

    const resetScanner = useCallback(() => {
        setVerificationResult(null);
        setAlert(null);
        setTicketCode('');
        setIsScanning(true);
    }, []);

    // 4. Session Metrics
    const sessionStats = useMemo(() => {
        const now = new Date();
        const start = new Date();
        start.setHours(now.getHours() - 1); // Mock start time if not found

        return {
            total: scanHistory.length,
            valids: scanHistory.filter(h => h.status === 'valid' || h.status === 'used').length,
            invalids: scanHistory.filter(h => h.status === 'invalid').length,
            startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }, [scanHistory]);

    return {
        // State
        user,
        activeTab,
        selectedEventId,
        events,
        ticketCode,
        verificationResult,
        loading,
        alert,
        scanHistory,
        isScanning,
        accessPoint,
        sessionStats,
        
        // Setters/Handlers
        setTicketCode,
        setSelectedEventId,
        setIsScanning,
        setAccessPoint,
        setAlert,
        handleTabChange,
        handleVerifyTicket,
        handleRedeemTicket,
        resetScanner
    };
};
