import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api, { venueAPI } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import {
  INITIAL_EVENT_FORM,
  normalizeEventToForm,
  normalizeEventFunctions,
  resolveAndValidateEventForm,
  buildHomePreviewEvent,
} from '../utils/eventFormUtils';

export default function useManagerEventForm({ event = null, onSuccess }) {
  const location = useLocation();
  const { success, error, warning } = useNotification();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  const [roomsByVenue, setRoomsByVenue] = useState({});

  const hasAdvancedPackage = useMemo(() => {
    const role = (user?.role || '').toLowerCase();
    return (
      role === 'admin' ||
      role === 'manager' ||
      user?.package === 'Avanzado' ||
      user?.package_name === 'Avanzado' ||
      user?.manager_package?.name === 'Avanzado'
    );
  }, [user]);

  const [formData, setFormData] = useState(() => normalizeEventToForm(event));
  const [functions, setFunctions] = useState(() => normalizeEventFunctions(event));
  const [newFunction, setNewFunction] = useState({ date: '', time: '', venue_id: '', room_id: '' });
  const [rules, setRules] = useState(() => (Array.isArray(event?.rules) ? event.rules : []));
  const [newRule, setNewRule] = useState({ title: '', description: '', icon: 'info' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const draftKey =
    event && event.id ? `laika_event_draft_edit_${event.id}` : 'laika_event_draft_new';

  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState(null);

  const loadRoomsForVenue = useCallback(async (venueId) => {
    if (!venueId) return [];
    try {
      const data = await venueAPI.getRooms(venueId);
      const list = Array.isArray(data) ? data : [];
      setRoomsByVenue((prev) => ({ ...prev, [String(venueId)]: list }));
      return list;
    } catch (err) {
      console.error('Error loading rooms:', err);
      setRoomsByVenue((prev) => ({ ...prev, [String(venueId)]: [] }));
      return [];
    }
  }, []);

  // Recuperar borrador existente
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        (parsed.formData?.name ||
          parsed.formData?.description ||
          parsed.formData?.venue_id ||
          parsed.functions?.length > 0)
      ) {
        setDraftInfo(parsed);
        setHasDraft(true);
      }
    } catch (err) {
      console.warn('Error reading event draft:', err);
    }
  }, [draftKey]);

  // Auto-guardado de borrador (debounce 800ms)
  useEffect(() => {
    if (
      !formData.name &&
      !formData.description &&
      Number(formData.price) === 0 &&
      functions.length === 0
    ) {
      return undefined;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ formData, functions, rules, showAdvanced })
        );
      } catch {
        /* ignore quota errors */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData, functions, rules, showAdvanced, draftKey]);

  // Cargar recintos activos
  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadVenues = async () => {
      try {
        const params = { status_filter: 'active' };
        const role = user?.role?.toLowerCase();
        if (role === 'gestor' || role === 'manager') {
          params.manager_id = user.id;
        }
        const data = await venueAPI.getAll(params);
        if (!active) return;

        const venueList = Array.isArray(data) ? data : [];
        setVenues(venueList);

        const queryParams = new URLSearchParams(location.search);
        const urlVenueId = queryParams.get('venue_id');

        if (urlVenueId && !event) {
          const v = venueList.find((item) => String(item.id) === String(urlVenueId));
          if (v) {
            setFormData((prev) => ({
              ...prev,
              venue_id: String(v.id),
              venue: v.name,
              location: v.city || prev.location,
              total_tickets: v.capacity || prev.total_tickets,
              available_tickets: v.capacity || prev.available_tickets,
              map_url: v.google_maps_url || '',
              seat_map_url: v.seat_map_url || '',
            }));
            setNewFunction((prev) => ({ ...prev, venue_id: String(v.id) }));
            loadRoomsForVenue(v.id);
            return;
          }
        }

        if (venueList.length === 1 && !event) {
          const v = venueList[0];
          setFormData((prev) => {
            if (prev.venue_id) return prev;
            return {
              ...prev,
              venue_id: String(v.id),
              venue: v.name,
              location: v.city || prev.location,
              total_tickets: v.capacity || prev.total_tickets,
              available_tickets: v.capacity || prev.available_tickets,
              map_url: v.google_maps_url || '',
              seat_map_url: v.seat_map_url || '',
            };
          });
          setNewFunction((prev) => (prev.venue_id ? prev : { ...prev, venue_id: String(v.id) }));
          loadRoomsForVenue(v.id);
        }
      } catch (err) {
        console.error('Error loading venues:', err);
      }
    };

    loadVenues();
    return () => {
      active = false;
    };
  }, [user, event, location.search, loadRoomsForVenue]);

  // Sincronizar cuando cambia el evento en modo edición
  useEffect(() => {
    if (!event) return;
    setFormData(normalizeEventToForm(event));
    const normalizedFns = normalizeEventFunctions(event);
    setFunctions(normalizedFns);
    setRules(Array.isArray(event.rules) ? event.rules : []);

    const venueIdsToLoad = new Set();
    if (event.venue_id) {
      venueIdsToLoad.add(String(event.venue_id));
      setNewFunction((prev) => ({ ...prev, venue_id: String(event.venue_id) }));
    }
    normalizedFns.forEach((f) => {
      if (f.venue_id) venueIdsToLoad.add(String(f.venue_id));
    });
    venueIdsToLoad.forEach((vId) => loadRoomsForVenue(vId));
  }, [event, loadRoomsForVenue]);

  const primaryRooms = useMemo(
    () => (formData.venue_id ? roomsByVenue[String(formData.venue_id)] || [] : []),
    [formData.venue_id, roomsByVenue]
  );

  const functionVenueRooms = useMemo(() => {
    const targetVenue = newFunction.venue_id || formData.venue_id;
    return targetVenue ? roomsByVenue[String(targetVenue)] || [] : [];
  }, [newFunction.venue_id, formData.venue_id, roomsByVenue]);

  const handleRestoreDraft = useCallback(() => {
    if (draftInfo) {
      if (draftInfo.formData) {
        setFormData({ ...INITIAL_EVENT_FORM, ...draftInfo.formData });
        if (draftInfo.formData.venue_id) {
          loadRoomsForVenue(draftInfo.formData.venue_id);
          setNewFunction((prev) => ({
            ...prev,
            venue_id: String(draftInfo.formData.venue_id),
          }));
        }
      }
      if (Array.isArray(draftInfo.functions)) setFunctions(draftInfo.functions);
      if (Array.isArray(draftInfo.rules)) setRules(draftInfo.rules);
      if (draftInfo.showAdvanced) setShowAdvanced(true);
      success('Borrador recuperado correctamente');
    }
    setHasDraft(false);
  }, [draftInfo, loadRoomsForVenue, success]);

  const handleDiscardDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
    setDraftInfo(null);
    success('Borrador descartado');
  }, [draftKey, success]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;

      setFormData((prev) => {
        const next = { ...prev, [name]: val };
        if (name === 'room_id') {
          if (!val) {
            next.use_seating_map = false;
          } else {
            const selectedRoom = primaryRooms.find((r) => String(r.id) === String(val));
            if (selectedRoom?.capacity) {
              next.total_tickets = selectedRoom.capacity;
            }
          }
        }
        return next;
      });
    },
    [primaryRooms]
  );

  const handleVenueChange = useCallback(
    (e) => {
      const venueId = e.target.value;
      const selected = venues.find((v) => String(v.id) === String(venueId));

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          venue_id: String(venueId),
          room_id: '',
          use_seating_map: false,
          venue: selected.name,
          location: selected.city || prev.location,
          total_tickets: selected.capacity || prev.total_tickets,
          map_url: selected.google_maps_url || '',
          seat_map_url: selected.seat_map_url || '',
        }));
        loadRoomsForVenue(venueId);
        setNewFunction((prev) => ({ ...prev, venue_id: String(venueId), room_id: '' }));
      } else {
        setFormData((prev) => ({
          ...prev,
          venue_id: '',
          room_id: '',
          use_seating_map: false,
          venue: '',
          location: '',
        }));
      }
    },
    [venues, loadRoomsForVenue]
  );

  const handleFunctionVenueChange = useCallback(
    (venueId) => {
      setNewFunction((prev) => ({ ...prev, venue_id: venueId, room_id: '' }));
      if (venueId && !roomsByVenue[String(venueId)]) {
        loadRoomsForVenue(venueId);
      }
    },
    [roomsByVenue, loadRoomsForVenue]
  );

  const handleAddFunction = useCallback(() => {
    const resolvedVenue = newFunction.venue_id || formData.venue_id;
    if (!newFunction.date || !newFunction.time || !resolvedVenue) {
      warning('Completa fecha, hora y recinto para agregar una función.');
      return;
    }

    setFunctions((prev) => [
      ...prev,
      {
        date: newFunction.date,
        time: newFunction.time,
        venue_id: String(resolvedVenue),
        room_id: newFunction.room_id || '',
        tempId: Date.now(),
      },
    ]);
    setNewFunction((prev) => ({
      ...prev,
      date: '',
      time: '',
      venue_id: String(resolvedVenue),
      room_id: '',
    }));
  }, [newFunction, formData.venue_id, warning]);

  const handleRemoveFunction = useCallback((index) => {
    setFunctions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddRule = useCallback(() => {
    const title = newRule.title.trim();
    if (!title) {
      warning('Escribe un título para la regla de acceso.');
      return;
    }
    setRules((prev) => [
      ...prev,
      { title, description: newRule.description.trim(), icon: newRule.icon || 'info' },
    ]);
    setNewRule({ title: '', description: '', icon: 'info' });
  }, [newRule, warning]);

  const handleRemoveRule = useCallback((index) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        error('La imagen supera el límite de 5 MB.');
        return;
      }

      setUploading(true);
      try {
        const res = await api.manager.uploadImage(file);
        setFormData((prev) => ({ ...prev, image_url: res.url }));
        success('Portada subida correctamente');
      } catch (err) {
        console.error(err);
        error('Error al subir la imagen del evento.');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [success, error]
  );

  const handlePresaleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const validation = resolveAndValidateEventForm({
        formData,
        functions,
        newFunction,
        rules,
        hasAdvancedPackage,
        isEditing: Boolean(event && event.id),
      });

      if (!validation.valid) {
        warning(validation.error);
        return;
      }

      setLoading(true);
      try {
        let result;
        if (event && event.id) {
          result = await api.manager.updateEvent(event.id, validation.payload);
          success('Evento actualizado con éxito');
        } else {
          result = await api.manager.createEvent(validation.payload);
          success('Evento creado exitosamente');
        }

        localStorage.removeItem(draftKey);
        if (onSuccess) onSuccess(result);
      } catch (err) {
        console.error('Error saving event:', err);
        const detail = err?.response?.data?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : detail || err?.message || 'Error inesperado';
        error(`No se pudo guardar el evento: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [formData, functions, newFunction, rules, hasAdvancedPackage, event, draftKey, onSuccess, warning, success, error]
  );

  const getVenueName = useCallback(
    (id) => venues.find((v) => String(v.id) === String(id))?.name || 'Recinto asignado',
    [venues]
  );

  const getRoomName = useCallback(
    (roomId, venueId) => {
      if (!roomId) return 'General';
      const venueRooms = venueId ? roomsByVenue[String(venueId)] || [] : primaryRooms;
      const found = venueRooms.find((r) => String(r.id) === String(roomId));
      return found?.name || `Sala #${roomId}`;
    },
    [roomsByVenue, primaryRooms]
  );

  const previewEvent = useMemo(
    () => buildHomePreviewEvent(formData, functions, newFunction),
    [formData, functions, newFunction]
  );

  return {
    formData,
    venues,
    primaryRooms,
    functionVenueRooms,
    functions,
    newFunction,
    setNewFunction,
    rules,
    newRule,
    setNewRule,
    showAdvanced,
    setShowAdvanced,
    hasAdvancedPackage,
    hasDraft,
    loading,
    uploading,
    previewEvent,
    handleRestoreDraft,
    handleDiscardDraft,
    handleChange,
    handleVenueChange,
    handleFunctionVenueChange,
    handleAddFunction,
    handleRemoveFunction,
    handleAddRule,
    handleRemoveRule,
    handleImageUpload,
    handlePresaleChange,
    handleSubmit,
    getVenueName,
    getRoomName,
  };
}
