import { useState, useEffect } from 'react';
import { managerAPI } from '../../../../services/managerService';

export const useEventSalesData = (eventId) => {
    const [loading, setLoading] = useState(true);
    const [ticketSummary, setTicketSummary] = useState(null);
    const [revenueSummary, setRevenueSummary] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!eventId) return;
        setLoading(true);
        setError(null);
        try {
            const [ticketsData, revenueData, attendeesData] = await Promise.all([
                managerAPI.getEventTickets(eventId),
                managerAPI.getEventRevenue(eventId),
                managerAPI.getAttendees(eventId)
            ]);

            setTicketSummary(ticketsData || null);
            setRevenueSummary(revenueData || null);
            setAttendees(Array.isArray(attendeesData) ? attendeesData : []);
        } catch (err) {
            console.error('Error fetching event sales metrics:', err);
            setError('Error al cargar la información de ventas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [eventId]);

    return {
        loading,
        ticketSummary,
        revenueSummary,
        attendees,
        error,
        refresh: fetchData
    };
};
