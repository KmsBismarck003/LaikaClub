import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import { transferAPI } from '../../../services/transfer.service';
import {
  isTicketCancelled,
  isTicketTransferred,
  isTicketUpcoming,
  isTicketCourtesy,
  getTicketDate,
  getTicketEventName,
  getTicketVenue,
  getTicketCode,
} from '../components/Wallet/walletUtils';

const SEEN_COURTESIES_KEY = 'laika_seen_courtesies';

export default function useUserWallet() {
  const [tickets, setTickets] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [giftCourtesyTicket, setGiftCourtesyTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoadError(null);
    try {
      const [respTickets, respIncoming, respOutgoing] = await Promise.all([
        api.ticket.getMyTickets(),
        transferAPI.getIncoming().catch(() => []),
        transferAPI.getOutgoing().catch(() => []),
      ]);

      const rawTickets = Array.isArray(respTickets) ? respTickets : [];
      setTickets(rawTickets);
      setIncomingTransfers(Array.isArray(respIncoming) ? respIncoming : []);
      setOutgoingTransfers(Array.isArray(respOutgoing) ? respOutgoing : []);

      // Detección automática de cortesías no vistas para desplegar la experiencia de regalo
      try {
        const seenIds = JSON.parse(localStorage.getItem(SEEN_COURTESIES_KEY) || '[]');
        const unacknowledged = rawTickets.find(
          (t) =>
            isTicketCourtesy(t) &&
            (t.status || '').toLowerCase() === 'active' &&
            !seenIds.includes(t.id)
        );
        if (unacknowledged) {
          setGiftCourtesyTicket(unacknowledged);
        }
      } catch (storageErr) {
        console.warn('No se pudo leer el historial de cortesías vistas:', storageErr);
      }
    } catch (err) {
      console.error('Error cargando Mis Boletos:', err);
      setLoadError('No pudimos cargar tus boletos en este momento. Intenta de nuevo.');
      setTickets([]);
      setIncomingTransfers([]);
      setOutgoingTransfers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const markCourtesySeen = useCallback((ticketId) => {
    if (!ticketId) return;
    try {
      const seen = JSON.parse(localStorage.getItem(SEEN_COURTESIES_KEY) || '[]');
      if (!seen.includes(ticketId)) {
        localStorage.setItem(SEEN_COURTESIES_KEY, JSON.stringify([...seen, ticketId]));
      }
    } catch (storageErr) {
      console.warn('No se pudo guardar la cortesía como vista:', storageErr);
    }
  }, []);

  const { upcoming, past, cancelled, nextEventTicket } = useMemo(() => {
    const up = [];
    const pa = [];
    const ca = [];

    for (const ticket of tickets) {
      if (isTicketCancelled(ticket) || isTicketTransferred(ticket)) {
        ca.push(ticket);
      } else if (isTicketUpcoming(ticket)) {
        up.push(ticket);
      } else {
        pa.push(ticket);
      }
    }

    // Orden cronológico ascendente para próximos (lo más cercano primero = menor fricción cognitiva)
    up.sort((a, b) => {
      const da = getTicketDate(a) ? new Date(getTicketDate(a)).getTime() : Number.MAX_SAFE_INTEGER;
      const db = getTicketDate(b) ? new Date(getTicketDate(b)).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });

    // Orden cronológico descendente para pasados (recuerdo más reciente primero)
    pa.sort((a, b) => {
      const da = getTicketDate(a) ? new Date(getTicketDate(a)).getTime() : 0;
      const db = getTicketDate(b) ? new Date(getTicketDate(b)).getTime() : 0;
      return db - da;
    });

    return {
      upcoming: up,
      past: pa,
      cancelled: ca,
      nextEventTicket: up[0] || null,
    };
  }, [tickets]);

  const activeList = useMemo(() => {
    const base = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;

    return base.filter((t, idx) => {
      const name = getTicketEventName(t).toLowerCase();
      const venue = getTicketVenue(t).toLowerCase();
      const code = getTicketCode(t, idx).toLowerCase();
      return name.includes(q) || venue.includes(q) || code.includes(q);
    });
  }, [tab, upcoming, past, cancelled, searchQuery]);

  return {
    tickets,
    incomingTransfers,
    outgoingTransfers,
    loading,
    loadError,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    upcoming,
    past,
    cancelled,
    nextEventTicket,
    activeList,
    giftCourtesyTicket,
    setGiftCourtesyTicket,
    markCourtesySeen,
    fetchTickets,
  };
}

