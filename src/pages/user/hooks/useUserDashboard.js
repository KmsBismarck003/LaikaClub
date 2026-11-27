import { useState, useEffect, useCallback, useMemo } from 'react';
import { ticketAPI, eventAPI } from '../../../services/api';
import { isTicketUpcoming, getTicketDate } from '../components/Wallet/walletUtils';

function getTierInfo(ticketCount) {
  if (ticketCount >= 10) return { icon: 'crown', label: 'Nivel Elite', variant: 'warning' };
  if (ticketCount >= 5) return { icon: 'zap', label: 'Nivel Pro Fan', variant: 'info' };
  if (ticketCount >= 1) return { icon: 'star', label: 'Nivel Fan', variant: 'success' };
  return { icon: 'sparkles', label: 'Nuevo Miembro', variant: 'neutral' };
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function useUserDashboard() {
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const [eventsRes, ticketsRes] = await Promise.allSettled([
        eventAPI.getPublic(),
        ticketAPI.getMyTickets(),
      ]);

      const fetchedEvents =
        eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)
          ? eventsRes.value
          : [];
      const fetchedTickets =
        ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value)
          ? ticketsRes.value
          : [];

      setEvents(fetchedEvents);
      setMyTickets(fetchedTickets);

      if (eventsRes.status === 'rejected' && ticketsRes.status === 'rejected') {
        setLoadError('No pudimos conectar con el servidor para cargar tu inicio.');
      }
    } catch (err) {
      console.error('Error cargando inicio de usuario:', err);
      setLoadError('Ocurrió un problema al cargar tu resumen. Intenta nuevamente.');
      setEvents([]);
      setMyTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const { upcomingTickets, nextTicket, moreUpcomingCount } = useMemo(() => {
    const activeUpcoming = myTickets
      .filter((t) => isTicketUpcoming(t))
      .sort((a, b) => {
        const da = getTicketDate(a) ? new Date(getTicketDate(a)).getTime() : Number.MAX_SAFE_INTEGER;
        const db = getTicketDate(b) ? new Date(getTicketDate(b)).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      });

    return {
      upcomingTickets: activeUpcoming,
      nextTicket: activeUpcoming[0] || null,
      moreUpcomingCount: Math.max(0, activeUpcoming.length - 1),
    };
  }, [myTickets]);

  const tier = useMemo(() => getTierInfo(myTickets.length), [myTickets.length]);
  const greeting = useMemo(() => getTimeGreeting(), []);
  const discoverEvents = useMemo(() => events.slice(0, 6), [events]);
  const recentTickets = useMemo(() => myTickets.slice(0, 3), [myTickets]);

  return {
    events,
    myTickets,
    upcomingTickets,
    nextTicket,
    moreUpcomingCount,
    discoverEvents,
    recentTickets,
    tier,
    greeting,
    loading,
    loadError,
    reload: loadDashboard,
  };
}

