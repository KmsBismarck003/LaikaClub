import React from 'react'
import InfoLayout from './InfoLayout'

const Accesibilidad = () => {
  return (
    <InfoLayout 
      title="Declaración de Accesibilidad Universal" 
      subtitle="Compromiso inquebrantable para que cualquier persona, con independencia de sus capacidades o tecnología de asistencia, pueda acceder a sus eventos favoritos."
      badge="Inclusión y Accesibilidad Web"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. Compromiso de Inclusión Digital</h2>
        <p>
          En <strong>LAIKA Club</strong> creemos que la cultura, la música y el entretenimiento en vivo deben estar al alcance de todos. 
          Diseñamos nuestras interfaces web y móviles bajo los principios de diseño universal y accesibilidad cognitiva y motriz.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Estándares Técnicos Aplicados (WCAG 2.1 AA)</h2>
        <p>
          Nuestras aplicaciones se desarrollan siguiendo las pautas de las <strong>Web Content Accessibility Guidelines (WCAG 2.1) Nivel AA</strong>:
        </p>
        <div className="info-grid-2">
          <div className="info-grid-card">
            <h4>Navegación por Teclado</h4>
            <p>Estructura de foco secuencial clara para que usuarios que no emplean ratón puedan explorar y comprar boletos completamente.</p>
          </div>
          <div className="info-grid-card">
            <h4>Contraste Riguroso</h4>
            <p>Relaciones de contraste cromático verificadas superiores a 4.5:1 para garantizar la lectura de textos y elementos interactivos.</p>
          </div>
          <div className="info-grid-card">
            <h4>Etiquetado Semántico</h4>
            <p>Atributos ARIA y etiquetas HTML descriptivas para lectores de pantalla de software de asistencia (NVDA, VoiceOver, TalkBack).</p>
          </div>
          <div className="info-grid-card">
            <h4>Ergonomía Táctil</h4>
            <p>Áreas de pulsación mínimas de 44x44 píxeles para facilitar la interacción táctil en dispositivos móviles sin desbordes.</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>3. Sugerencias de Accesibilidad</h2>
        <p>
          Si encuentras cualquier barrera técnica o tienes sugerencias para mejorar tu experiencia en nuestra plataforma, comunícate directamente con nuestro equipo:
        </p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Mesa de Accesibilidad e Inclusión</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Accesibilidad
