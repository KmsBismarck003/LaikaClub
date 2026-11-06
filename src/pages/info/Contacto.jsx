import React, { useState } from 'react'
import InfoLayout from './InfoLayout'
import './Contacto.css'

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState({ submitted: false, loading: false })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus({ submitted: false, loading: true })
    
    // Simulación de envío con confirmación visual limpia
    setTimeout(() => {
      setStatus({ submitted: true, loading: false })
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 600)
  }

  return (
    <InfoLayout 
      title="Contacto y Atención al Usuario" 
      subtitle="¿Tienes dudas con tus boletos, necesitas asistencia técnica o representas a un evento? Nuestro equipo está a tu disposición."
      badge="Canales de Comunicación Oficial"
      lastUpdated="Noviembre 2026"
    >
      <div className="contacto-bento-grid">
        
        {/* COLUMNA 1: CANALES DIRECTOS */}
        <div className="contacto-channels-panel">
          <div className="contacto-panel-header">
            <h3>Canales Directos</h3>
            <p>Comunícate de manera inmediata por cualquiera de nuestros medios verificados:</p>
          </div>

          <div className="contacto-cards-list">
            <a href="tel:7222390967" className="contacto-card-link">
              <div className="contacto-icon-box">
                <span>Tel</span>
              </div>
              <div className="contacto-text-box">
                <span className="contacto-tag">Línea Telefónica</span>
                <strong>722 239 0967</strong>
                <span className="contacto-sub">Lunes a Sábado de 9:00 a 19:00 hrs</span>
              </div>
            </a>

            <a href="mailto:jreyes6458@gmail.com" className="contacto-card-link">
              <div className="contacto-icon-box">
                <span>Mail</span>
              </div>
              <div className="contacto-text-box">
                <span className="contacto-tag">Correo Electrónico</span>
                <strong>jreyes6458@gmail.com</strong>
                <span className="contacto-sub">Respuesta en menos de 24 hrs hábiles</span>
              </div>
            </a>

            <a href="https://laikaweb.vercel.app/" target="_blank" rel="noopener noreferrer" className="contacto-card-link">
              <div className="contacto-icon-box">
                <span>Web</span>
              </div>
              <div className="contacto-text-box">
                <span className="contacto-tag">Portal Corporativo</span>
                <strong>laikaweb.vercel.app</strong>
                <span className="contacto-sub">Misión, visión, documentación y legal</span>
              </div>
            </a>

            <div className="contacto-card-static">
              <div className="contacto-icon-box">
                <span>Sede</span>
              </div>
              <div className="contacto-text-box">
                <span className="contacto-tag">Ubicación Operativa</span>
                <strong>Toluca de Lerdo, Estado de México</strong>
                <span className="contacto-sub">México (Centro)</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: FORMULARIO */}
        <div className="contacto-form-panel">
          <div className="contacto-panel-header">
            <h3>Envíanos un Mensaje</h3>
            <p>Escribe tu consulta y un asesor te responderá a la brevedad.</p>
          </div>

          {status.submitted ? (
            <div className="contacto-success-banner">
              <h4>Mensaje Enviado con Éxito</h4>
              <p>Gracias por contactarnos. Hemos recibido tu consulta y nos comunicaremos contigo al correo proporcionado.</p>
              <button 
                type="button" 
                className="contacto-reset-btn"
                onClick={() => setStatus({ submitted: false, loading: false })}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contacto-form">
              <div className="contacto-field-group">
                <label htmlFor="contacto-name">Nombre Completo</label>
                <input
                  id="contacto-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. José Ángel Reyes"
                  required
                />
              </div>

              <div className="contacto-field-group">
                <label htmlFor="contacto-email">Correo Electrónico</label>
                <input
                  id="contacto-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>

              <div className="contacto-field-group">
                <label htmlFor="contacto-subject">Asunto</label>
                <input
                  id="contacto-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Ej. Duda sobre boleto / Solicitud organizador"
                  required
                />
              </div>

              <div className="contacto-field-group">
                <label htmlFor="contacto-message">Mensaje o Detalle</label>
                <textarea
                  id="contacto-message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Explícanos tu consulta, número de orden o evento de interés..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="contacto-submit-btn" 
                disabled={status.loading}
              >
                {status.loading ? 'Enviando mensaje...' : 'Enviar Mensaje Directo'}
              </button>
            </form>
          )}
        </div>

      </div>
    </InfoLayout>
  )
}

export default Contacto
