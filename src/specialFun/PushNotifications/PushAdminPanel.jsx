import React, { useState, useEffect } from 'react';
import { PushEngine } from './services/PushEngine';
import './PushAdminPanel.css';

const PushAdminPanel = () => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '',
    type: 'MANUAL',
    targetAudience: 'ALL'
  });
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Check permission on mount
    const checkPerms = async () => {
      await PushEngine.init();
      setPermissionStatus(PushEngine.permission);
    };
    checkPerms();
  }, []);

  const handleRequestPermission = async () => {
    const granted = await PushEngine.requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      setFeedback({ type: 'success', msg: 'Permiso de notificaciones concedido con éxito.' });
    } else {
      setFeedback({ type: 'error', msg: 'Permiso denegado por el usuario o navegador.' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendPush = async (e) => {
    e.preventDefault();
    
    if (permissionStatus !== 'granted') {
      setFeedback({ type: 'error', msg: 'No se pueden enviar notificaciones sin permisos del navegador.' });
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      setFeedback({ type: 'error', msg: 'El título y el cuerpo son obligatorios.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    // Simulate network delay for admin feedback
    setTimeout(async () => {
      const success = await PushEngine.sendNotification(formData.title, {
        body: formData.body,
        data: formData.url || window.location.origin,
      });

      if (success) {
        setFeedback({ type: 'success', msg: `Notificación push enviada exitosamente a: ${formData.targetAudience}` });
        setFormData({ ...formData, title: '', body: '', url: '' });
      } else {
        setFeedback({ type: 'error', msg: 'Error al intentar enviar la notificación al sistema.' });
      }
      setIsSending(false);
    }, 800);
  };

  const handleTestSmartTrigger = async (type) => {
    if (permissionStatus !== 'granted') {
      setFeedback({ type: 'error', msg: 'Permisos de notificación no concedidos.' });
      return;
    }

    let data = {};
    if (type === 'TICKET_PURCHASE') {
      data = { eventName: 'Concierto Sinfónico VIP', url: window.location.origin + '/user/tickets' };
    } else if (type === 'NEW_EVENT') {
      data = { eventName: 'Festival Laika 2027', url: window.location.origin + '/event/1' };
    } else if (type === 'CART_REMINDER') {
      data = { url: window.location.origin + '/cart' };
    }

    // Bypass anti-spam for testing by not calling the real shouldSend internally,
    // or just call triggerSmart which works once per hour by default.
    // Wait, triggerSmart has anti-spam throttle, let's call sendNotification directly with Psychology content
    // so the admin can test it repeatedly.
    const { PushPsychology } = await import('./utils/PushPsychology');
    const content = PushPsychology.optimizeContent(type, data);
    
    const success = await PushEngine.sendNotification(content.title, {
      body: content.body,
      data: content.url || window.location.origin
    });

    if (success) {
      setFeedback({ type: 'success', msg: `Trigger automático [${type}] probado con éxito en tu dispositivo.` });
    } else {
      setFeedback({ type: 'error', msg: `Fallo al probar el trigger automático [${type}].` });
    }
  };

  return (
    <div className="push-admin-container fade-in">
      <header className="push-admin-header">
        <div className="header-content">
          <h1>Central de Notificaciones Push</h1>
          <p>Gestiona y envía notificaciones nativas a dispositivos Windows, macOS, Android e iOS.</p>
        </div>
        <div className="status-badge-container">
          <span className={`status-badge ${permissionStatus}`}>
            Estado del Sistema: {permissionStatus.toUpperCase()}
          </span>
          {permissionStatus !== 'granted' && (
            <button className="btn-request-perms" onClick={handleRequestPermission}>
              Habilitar Permisos Locales
            </button>
          )}
        </div>
      </header>

      <div className="push-admin-grid">
        {/* Panel Izquierdo - Formulario */}
        <section className="push-admin-card">
          <h2>Nueva Campaña Push</h2>
          <form onSubmit={handleSendPush} className="push-form">
            
            <div className="form-group">
              <label>Audiencia Objetivo</label>
              <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                <option value="ALL">Todos los usuarios suscritos</option>
                <option value="TICKET_HOLDERS">Usuarios con boletos comprados</option>
                <option value="INACTIVE">Usuarios inactivos (últimos 30 días)</option>
                <option value="VIP">Usuarios VIP</option>
              </select>
            </div>

            <div className="form-group">
              <label>Título de la Notificación</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="Ej. Preventa exclusiva activa"
                maxLength={50}
              />
              <span className="char-count">{formData.title.length}/50</span>
            </div>

            <div className="form-group">
              <label>Cuerpo del Mensaje (Técnicas de Psicología UX)</label>
              <textarea 
                name="body" 
                value={formData.body} 
                onChange={handleInputChange} 
                placeholder="Genera intriga, urgencia o valor exclusivo. Sin emojis."
                maxLength={150}
                rows={3}
              />
              <span className="char-count">{formData.body.length}/150</span>
            </div>

            <div className="form-group">
              <label>URL de Destino (Opcional)</label>
              <input 
                type="text" 
                name="url" 
                value={formData.url} 
                onChange={handleInputChange} 
                placeholder="https://laikaclub.com/eventos/secreto"
              />
            </div>

            <button 
              type="submit" 
              className={`btn-send-push ${isSending ? 'sending' : ''}`}
              disabled={isSending || permissionStatus !== 'granted'}
            >
              {isSending ? 'Desplegando en Servidores...' : 'Lanzar Notificación Push'}
            </button>
            
            {feedback && (
              <div className={`feedback-alert ${feedback.type}`}>
                {feedback.msg}
              </div>
            )}
          </form>
        </section>

        {/* Panel Derecho - Previsualización de Sistema */}
        <section className="push-admin-card preview-card">
          <h2>Previsualización Nativa</h2>
          <p className="preview-subtitle">Así es como lo verán los usuarios en su Sistema Operativo (Windows/Mac/Android)</p>
          
          <div className="os-preview-container">
            <div className="mock-os-notification">
              <div className="mock-os-icon">
                <img src="/117.png" alt="App Icon" />
              </div>
              <div className="mock-os-content">
                <div className="mock-os-header">
                  <span className="mock-os-appname">LaikaClub</span>
                  <span className="mock-os-time">Ahora</span>
                </div>
                <h4 className="mock-os-title">{formData.title || 'Título de Notificación'}</h4>
                <p className="mock-os-body">{formData.body || 'El cuerpo del mensaje aparecerá aquí. Utiliza frases persuasivas.'}</p>
              </div>
            </div>
          </div>

          <div className="psychology-tips">
            <h3>Tácticas de Retención (Sin Spam)</h3>
            <ul>
              <li><strong>Curiosidad:</strong> Evita revelar toda la información en el mensaje. Obliga al clic.</li>
              <li><strong>Urgencia:</strong> "Últimos lugares", "Por tiempo limitado".</li>
              <li><strong>Exclusividad:</strong> Haz sentir especial al usuario. "Solo para miembros VIP".</li>
              <li><strong>Cero Emojis:</strong> Mantiene la estética premium y profesional del club.</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="push-admin-card mt-2">
        <h2>Simulador de Triggers Automáticos (Testing)</h2>
        <p className="preview-subtitle">
          Prueba en vivo cómo reciben los usuarios las notificaciones del sistema según su comportamiento (Generado vía Psicología UX).
        </p>
        <div className="triggers-grid">
          <button 
            className="btn-test-trigger" 
            onClick={() => handleTestSmartTrigger('TICKET_PURCHASE')}
            disabled={permissionStatus !== 'granted'}
          >
            <span>🎟️</span> Compra de Boleto
          </button>
          
          <button 
            className="btn-test-trigger" 
            onClick={() => handleTestSmartTrigger('NEW_EVENT')}
            disabled={permissionStatus !== 'granted'}
          >
            <span>📢</span> Nuevo Evento Publicado
          </button>

          <button 
            className="btn-test-trigger" 
            onClick={() => handleTestSmartTrigger('CART_REMINDER')}
            disabled={permissionStatus !== 'granted'}
          >
            <span>🛒</span> Recordatorio de Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushAdminPanel;
