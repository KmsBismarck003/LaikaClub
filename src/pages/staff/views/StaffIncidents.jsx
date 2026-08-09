import React, { useState } from 'react';
import { Button, Input, Icon, PermissionWall, Badge } from '../../../components';
import { useNotification } from '../../../context/NotificationContext';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import '../StaffDashboard.css';

const StaffIncidents = () => {
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'low',
    location: 'Acceso Principal'
  });

  const [history, setHistory] = useState([
    { id: 1, title: 'Boleto Illegible en Lector Óptico', location: 'Puerta A', severity: 'low', status: 'resolved', time: 'Hace 15 min' },
    { id: 2, title: 'Congestión en Punto de Revisión', location: 'Acceso Sur', severity: 'medium', status: 'pending', time: 'En revisión' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showError('Por favor completa el título y descripción detallada del reporte');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newIncident = {
        id: Date.now(),
        title: formData.title,
        location: formData.location || 'Zona General',
        severity: formData.severity,
        status: 'pending',
        time: 'Hace un momento'
      };
      setHistory([newIncident, ...history]);
      success('Reporte de incidencia enviado exitosamente a la Central de Supervisores');
      setFormData({ title: '', description: '', severity: 'low', location: 'Acceso Principal' });
      setLoading(false);
    }, 1000);
  };

  return (
    <PermissionWall 
      permission="canValidateTickets"
      title="OPERACIÓN RESTRINGIDA"
      description="No dispones de credenciales de Staff o Seguridad activas para registrar incidencias de campo."
    >
      <div className="staff-dashboard-page">
        <header className="staff-header">
          <div className="staff-header-content">
            <h1>
              <AlertTriangle size={28} color="var(--staff-status-warning)" />
              Reporte de Incidencias de Campo
            </h1>
            <p className="staff-subtitle">Comunicación prioritaria con el Centro de Supervisión y Jefes de Seguridad de LAIKA Club</p>
          </div>
        </header>

        <div className="staff-incidents-grid">
          <section aria-label="Formulario de Reporte">
            <div style={{ background: 'var(--staff-bg-card)', border: '1px solid var(--staff-border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
              <h3 className="staff-section-title"><Icon name="edit" size={16} /> Emitir Nuevo Reporte</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <Input
                    label="TÍTULO O ASUNTO *"
                    placeholder="Ej. Falla de conexión en Lector de Entrada"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                  />
                  <div className="staff-input-group" style={{ marginBottom: 0 }}>
                    <label className="staff-input-label" htmlFor="incident-severity">NIVEL DE SEVERIDAD</label>
                    <select 
                      id="incident-severity"
                      className="staff-form-select"
                      value={formData.severity}
                      onChange={e => setFormData({ ...formData, severity: e.target.value })}
                    >
                      <option value="low">BAJA • Aviso Informativo</option>
                      <option value="medium">MEDIA • Requiere Asistencia</option>
                      <option value="high">ALTA • Bloqueo Crítico o Seguridad</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="UBICACIÓN EXACTA O ZONA"
                  placeholder="Ej. Puerta Principal - Carril Izquierdo"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  fullWidth
                />

                <div className="staff-input-group" style={{ marginBottom: 0 }}>
                  <label className="staff-input-label" htmlFor="incident-desc">DESCRIPCIÓN TÉCNICA DETALLADA *</label>
                  <textarea 
                    id="incident-desc"
                    className="staff-form-textarea"
                    placeholder="Describe los hechos y si esto entorpece el ingreso continuo de los asistentes..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="primary" size="large" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  <Send size={18} className="mr-2" />
                  {loading ? 'TRANSMITIENDO A CENTRAL...' : 'ENVIAR REPORTE OFICIAL AL SUPERVISOR'}
                </Button>
              </form>
            </div>
          </section>

          <section aria-label="Historial de Alertas">
            <div style={{ background: 'var(--staff-bg-card)', border: '1px solid var(--staff-border)', borderRadius: '16px', padding: '2rem', height: '100%' }}>
              <h3 className="staff-section-title"><Icon name="history" size={16} /> Bitácora de Alertas Reportadas</h3>
              
              {history.length === 0 ? (
                <div className="staff-empty-state" style={{ padding: '2.5rem 1rem' }}>
                  <p>No se han registrado incidencias en la sesión activa.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.map(item => (
                    <div key={item.id} style={{ background: 'var(--staff-bg-elevated)', border: '1px solid var(--staff-border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>{item.title}</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--staff-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="mapPin" size={12} /> {item.location} • {item.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Badge variant={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'default'}>
                          {item.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={item.status === 'resolved' ? 'success' : 'warning'}>
                          {item.status === 'resolved' ? 'ATENDIDA' : 'RECIBIDA'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PermissionWall>
  );
};

export default StaffIncidents;
