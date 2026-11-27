import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';

export const REFUND_REASONS = [
  'Cambio de planes / No podré asistir',
  'Evento cancelado por el organizador',
  'No puedo asistir por enfermedad o fuerza mayor',
  'Cambio de fecha o lugar del evento',
  'Error involuntario en la compra',
  'Otro motivo',
];

export const REFUND_STATUS_META = {
  pending:    { label: 'Pendiente',   variant: 'warning', dot: true  },
  processing: { label: 'En proceso',  variant: 'info',    dot: true  },
  approved:   { label: 'Aprobado',    variant: 'success', dot: false },
  refunded:   { label: 'Reembolsado', variant: 'success', dot: false },
  rejected:   { label: 'Rechazado',   variant: 'error',   dot: false },
  failed:     { label: 'Fallido',     variant: 'error',   dot: false },
};

export function getRefundAmount(req) {
  return parseFloat(req?.refundAmount || req?.amount || req?.price || req?.ticket?.price || 0) || 0;
}

export default function useRefundTracker() {
  const [requests, setRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ ticketId: '', reason: '', detail: '' });
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const { success, error: showError } = useNotification();

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [refsRes, ticksRes] = await Promise.allSettled([
        api.refund?.getMyRefunds?.() || Promise.resolve([]),
        api.ticket?.getMyTickets?.() || Promise.resolve([]),
      ]);

      const fetchedRefs =
        refsRes.status === 'fulfilled' && Array.isArray(refsRes.value) ? refsRes.value : [];
      const fetchedTicks =
        ticksRes.status === 'fulfilled' && Array.isArray(ticksRes.value) ? ticksRes.value : [];

      setRequests(fetchedRefs);
      setTickets(fetchedTicks);

      if (refsRes.status === 'rejected' && ticksRes.status === 'rejected') {
        setLoadError('No pudimos cargar tus solicitudes de reembolso en este momento.');
      }
    } catch (err) {
      console.error('Error cargando reembolsos:', err);
      setLoadError('Ocurrió un problema al consultar tus reembolsos.');
      setRequests([]);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cotización en tiempo real al seleccionar un boleto
  useEffect(() => {
    let active = true;
    if (!form.ticketId) {
      setQuote(null);
      setQuoteLoading(false);
      return undefined;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const q = await api.refund.getQuote(form.ticketId);
        if (active) setQuote(q);
      } catch {
        if (active) setQuote(null);
      } finally {
        if (active) setQuoteLoading(false);
      }
    };

    fetchQuote();
    return () => {
      active = false;
    };
  }, [form.ticketId]);

  const eligibleTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const st = (t.status || '').toLowerCase();
        return st === 'active' || st === 'confirmed';
      }),
    [tickets]
  );

  const { pendingCount, totalInProcess, totalRefunded, countsByFilter } = useMemo(() => {
    let pCount = 0;
    let inProcessSum = 0;
    let refundedSum = 0;
    let refundedCount = 0;
    let rejectedCount = 0;

    for (const r of requests) {
      const st = (r.status || 'pending').toLowerCase();
      const amt = getRefundAmount(r);
      if (st === 'pending' || st === 'processing') {
        pCount += 1;
        inProcessSum += amt;
      } else if (st === 'refunded' || st === 'approved') {
        refundedCount += 1;
        refundedSum += amt;
      } else if (st === 'rejected' || st === 'failed') {
        rejectedCount += 1;
      }
    }

    return {
      pendingCount: pCount,
      totalInProcess: inProcessSum,
      totalRefunded: refundedSum,
      countsByFilter: {
        all: requests.length,
        pending: pCount,
        refunded: refundedCount,
        rejected: rejectedCount,
      },
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => {
      const st = (r.status || 'pending').toLowerCase();
      if (statusFilter === 'pending') return st === 'pending' || st === 'processing';
      if (statusFilter === 'refunded') return st === 'refunded' || st === 'approved';
      if (statusFilter === 'rejected') return st === 'rejected' || st === 'failed';
      return true;
    });
  }, [requests, statusFilter]);

  const updateFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm({ ticketId: '', reason: '', detail: '' });
    setQuote(null);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!form.ticketId) {
        showError('Selecciona un boleto para continuar.');
        return;
      }
      if (!form.reason) {
        showError('Selecciona el motivo de la cancelación.');
        return;
      }
      if (quote && !quote.eligible) {
        showError(quote.rejectionReason || 'Este boleto no es elegible para cancelación.');
        return;
      }

      setSubmitting(true);
      try {
        const parsedId = Number(form.ticketId);
        await api.refund.requestRefund({
          ticket_id: !Number.isNaN(parsedId) ? parsedId : form.ticketId,
          reason: form.reason,
          detail: form.detail,
        });
        success('Solicitud de reembolso registrada correctamente');
        closeForm();
        await loadData();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'No se pudo enviar la solicitud de reembolso.';
        showError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [form, quote, showError, success, closeForm, loadData]
  );

  return {
    requests,
    filteredRequests,
    eligibleTickets,
    loading,
    loadError,
    showForm,
    setShowForm,
    closeForm,
    submitting,
    statusFilter,
    setStatusFilter,
    countsByFilter,
    form,
    updateFormField,
    quote,
    quoteLoading,
    pendingCount,
    totalInProcess,
    totalRefunded,
    handleSubmit,
    reload: loadData,
  };
}

