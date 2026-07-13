import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { LoadingScreen, Icon } from '../../../components';
import './EventHistory.css';

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchHistoricalEvents();
  }, []);

  const fetchHistoricalEvents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/events/historical');
      setEvents(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error fetching historical events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (eventId) => {
    try {
      setLoadingAnalytics(true);
      const [ticketsRes, revenueRes] = await Promise.all([
        apiClient.get(`/events/manager/events/${eventId}/tickets`),
        apiClient.get(`/events/manager/events/${eventId}/revenue`)
      ]);
      setAnalytics({
        tickets: ticketsRes,
        revenue: revenueRes
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    fetchAnalytics(event.id);
  };

  if (loading) return <LoadingScreen label="Cargando Historial..." />;

  if (selectedEvent) {
    return (
      <div className="event-history-details-container fade-in">
        <button className="back-btn" onClick={() => setSelectedEvent(null)}>
          <Icon name="arrowLeft" /> Volver al Historial
        </button>
        
        <div className="event-history-header">
          {selectedEvent.image_url && <img src={selectedEvent.image_url.startsWith('http') ? selectedEvent.image_url : `${process.env.REACT_APP_API_HOST || 'http://localhost:8000'}${selectedEvent.image_url}`} alt={selectedEvent.name} className="event-history-cover" />}
          <div className="event-history-info">
            <h2>{selectedEvent.name}</h2>
            <p className="event-date-loc"><Icon name="calendar" size={14}/> Finalizado el {selectedEvent.event_date}</p>
            <p className="event-date-loc"><Icon name="mapPin" size={14}/> {selectedEvent.venue_name || 'Sin sede'}</p>
            <span className="badge-finished">Evento Concluido</span>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="analytics-loading">Cargando métricas...</div>
        ) : analytics ? (
          <div className="analytics-dashboard">
            <div className="metric-card">
              <div className="metric-icon revenue"><Icon name="dollarSign" /></div>
              <div className="metric-info">
                <h3>Ingresos Totales</h3>
                <p className="metric-value">${analytics.revenue?.gross?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon tickets"><Icon name="ticket" /></div>
              <div className="metric-info">
                <h3>Boletos Vendidos</h3>
                <p className="metric-value">{analytics.tickets?.sold || 0}</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon scan"><Icon name="checkCircle" /></div>
              <div className="metric-info">
                <h3>Asistencias (Scaneados)</h3>
                <p className="metric-value">{analytics.tickets?.used || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-error">No se pudieron cargar las métricas.</div>
        )}
      </div>
    );
  }

  return (
    <div className="event-history-container fade-in">
      <div className="event-history-topbar">
        <h1>Historial de Eventos Finalizados</h1>
        <p>Consulta métricas y auditoría de eventos que ya concluyeron.</p>
      </div>

      {events.length === 0 ? (
        <div className="no-historical-events">
          <Icon name="history" size={48} />
          <h3>Sin eventos finalizados</h3>
          <p>Los eventos aparecerán aquí automáticamente una vez que su fecha y hora hayan concluido.</p>
        </div>
      ) : (
        <div className="historical-events-grid">
          {events.map(event => (
            <div key={event.id} className="historical-event-card" onClick={() => handleSelectEvent(event)}>
              <div className="card-image-wrap">
                {event.image_url ? (
                  <img src={event.image_url.startsWith('http') ? event.image_url : `${process.env.REACT_APP_API_HOST || 'http://localhost:8000'}${event.image_url}`} alt={event.name} />
                ) : (
                  <div className="card-image-placeholder"><Icon name="image" /></div>
                )}
                <div className="card-overlay">
                  <span className="view-details-btn">Ver Resultados</span>
                </div>
              </div>
              <div className="card-content">
                <h4>{event.name}</h4>
                <p><Icon name="calendar" size={14} /> {event.event_date}</p>
                <p><Icon name="mapPin" size={14} /> {event.venue_name || 'Sin sede'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventHistory;
