import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../../../components';
import { Send, Eye, ShieldCheck, FileText } from 'lucide-react';
import { getTicketTemplate, getNotificationTemplate, getCustomTemplate } from '../templates';
import { apiClient } from '../../../../services/apiClient';
import { useNotification } from '../../../../context/NotificationContext';

const EmailTester = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('ticket');
    const [testEmail, setTestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useNotification();
    
    const [formData, setFormData] = useState({
        userName: 'Juan Pérez',
        eventName: 'Noche Inaugural VIP',
        eventDate: '24 Octubre 2026',
        eventTime: '22:00 hrs',
        venue: 'Laika Main Room',
        seat: 'Mesa 4 - VIP',
        title: 'Actualización de Políticas',
        message: '<p>Te informamos que hemos actualizado nuestros términos de servicio.</p>',
        actionText: 'Ver Políticas',
        actionUrl: 'https://laikaclub.com/terms',
        subject: 'Prueba de Plantilla',
        htmlContent: '<h1>Hola Mundo</h1><p>Prueba de comunicado masivo.</p>'
    });

    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        let html = '';
        if (selectedTemplate === 'ticket') html = getTicketTemplate(formData);
        if (selectedTemplate === 'notification') html = getNotificationTemplate(formData);
        if (selectedTemplate === 'custom') html = getCustomTemplate(formData);
        setPreviewHtml(html);
    }, [selectedTemplate, formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendTest = async () => {
        if (!testEmail) return showError('Ingresa un correo de destino para la prueba');
        setLoading(true);
        try {
            // Se envía el HTML renderizado al backend, o el backend debería renderizarlo. 
            // Para fines de prueba y flexibilidad, enviamos el HTML final y el asunto.
            const subject = selectedTemplate === 'ticket' ? `Tu boleto para ${formData.eventName}` :
                            selectedTemplate === 'notification' ? formData.title : formData.subject;
            
            const payload = { email: testEmail, subject, htmlContent: previewHtml };
            
            // Llama al microservicio de admin usando el apiClient para que inyecte el JWT
            const data = await apiClient.post('/admin/emails/send', payload);
            
            if (data && data.status === 'success') {
                success('Prueba enviada. Revisa tu bandeja de entrada.');
            } else {
                showError('Error al enviar la prueba: ' + (data?.message || 'Error desconocido'));
            }
        } catch (err) {
            showError('Falla al conectar con el servidor de correos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="email-tester-layout">
            <div className="tester-sidebar">
                <div className="card-header">
                    <ShieldCheck className="card-icon" />
                    <h2>Simulador de Correos</h2>
                </div>
                
                <div className="form-section">
                    <label>Plantilla a probar</label>
                    <select 
                        className="industrial-select"
                        value={selectedTemplate} 
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                        <option value="ticket">Boleto Electrónico</option>
                        <option value="notification">Notificación Genérica</option>
                        <option value="custom">Comunicado Personalizado</option>
                    </select>
                </div>

                <div className="dynamic-form">
                    <h3 className="section-subtitle">Datos de Prueba (Variables)</h3>
                    
                    {selectedTemplate === 'ticket' && (
                        <>
                            <Input label="Nombre del Usuario" name="userName" value={formData.userName} onChange={handleChange} />
                            <Input label="Evento" name="eventName" value={formData.eventName} onChange={handleChange} />
                            <Input label="Fecha" name="eventDate" value={formData.eventDate} onChange={handleChange} />
                            <Input label="Hora" name="eventTime" value={formData.eventTime} onChange={handleChange} />
                            <Input label="Zona/Asiento" name="seat" value={formData.seat} onChange={handleChange} />
                        </>
                    )}

                    {selectedTemplate === 'notification' && (
                        <>
                            <Input label="Título" name="title" value={formData.title} onChange={handleChange} />
                            <Input label="Nombre de Usuario" name="userName" value={formData.userName} onChange={handleChange} />
                            <label className="industrial-label">Mensaje (HTML)</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} className="industrial-textarea-small" />
                            <Input label="Texto del Botón" name="actionText" value={formData.actionText} onChange={handleChange} />
                            <Input label="URL del Botón" name="actionUrl" value={formData.actionUrl} onChange={handleChange} />
                        </>
                    )}

                    {selectedTemplate === 'custom' && (
                        <>
                            <Input label="Asunto" name="subject" value={formData.subject} onChange={handleChange} />
                            <label className="industrial-label">Contenido HTML</label>
                            <textarea name="htmlContent" value={formData.htmlContent} onChange={handleChange} className="industrial-textarea-small" />
                        </>
                    )}
                </div>

                <div className="test-action-box">
                    <h3 className="section-subtitle">Destino de Prueba</h3>
                    <Input 
                        placeholder="tu-correo@gmail.com" 
                        value={testEmail} 
                        onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button variant="primary" onClick={handleSendTest} loading={loading} fullWidth>
                        <Send size={18} /> Enviar Prueba Real
                    </Button>
                </div>
            </div>

            <div className="tester-preview">
                <div className="card-header">
                    <Eye className="card-icon" />
                    <h2>Vista Previa en Vivo</h2>
                </div>
                <div className="preview-container">
                    <iframe 
                        title="Email Preview"
                        srcDoc={previewHtml}
                        style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: '8px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailTester;
