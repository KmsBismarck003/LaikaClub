import React from 'react'
import InfoLayout from './InfoLayout'

const Cookies = () => {
  return (
    <InfoLayout 
      title="Política de Cookies y Tecnologías de Almacenamiento" 
      subtitle="Explicación detallada y transparente sobre cómo utilizamos cookies y almacenamiento local para brindarte una experiencia fluida, rápida y segura en LAIKA Club."
      badge="Privacidad y Tecnologías Web"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. ¿Qué son las Cookies y Almacenamiento Local?</h2>
        <p>
          Las cookies y los elementos de almacenamiento local (Local Storage y Session Storage) son pequeños archivos de datos seguros 
          que los sitios web guardan en el navegador de tu computadora o dispositivo móvil al interactuar con ellos.
        </p>
        <p>
          En <strong>LAIKA Club</strong> utilizamos estas tecnologías de manera responsable, estricta y transparente, exclusivamente para 
          mantener tu sesión protegida, recordar tus preferencias y asegurar que tus compras de boletos se completen sin interrupciones.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Clasificación de Cookies que Empleamos</h2>
        <div className="info-grid-2">
          <div className="info-grid-card">
            <h4>Cookies Técnicas y Esenciales</h4>
            <p>
              Indispensables para la navegación. Mantienen tu sesión iniciada de manera cifrada (tokens JWT), gestionan el carrito de 
              compra y reservan tus asientos en tiempo real mientras completas el pago.
            </p>
          </div>
          <div className="info-grid-card">
            <h4>Cookies de Preferencias</h4>
            <p>
              Recuerdan tu configuración visual, como la selección entre el modo oscuro (Dark Mode) y modo claro (Light Mode), así como tu 
              ciudad predilecta para ver eventos cercanos.
            </p>
          </div>
          <div className="info-grid-card">
            <h4>Seguridad y Prevención de Fraude</h4>
            <p>
              Verifican la autenticidad de las peticiones para proteger tu cuenta y la plataforma contra ataques de denegación de servicio 
              o duplicación no autorizada de compras.
            </p>
          </div>
          <div className="info-grid-card">
            <h4>Rendimiento y Métricas Anónimas</h4>
            <p>
              Recopilan información agregada y completamente disociada sobre velocidad de carga de la web y respuesta de los servidores para 
              optimizar la plataforma continuamente.
            </p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>3. Compromiso de Cero Rastreo Publicitario Invasivo</h2>
        <div className="info-callout">
          <p>
            <strong>Privacidad Garantizada:</strong> En LAIKA Club <strong>no utilizamos cookies de rastreo invasivo de terceros ni redes publicitarias que comercialicen tu perfil</strong> o vendan tu historial de eventos a empresas de publicidad cruzada.
          </p>
        </div>
      </div>

      <div className="info-section">
        <h2>4. Cómo Administrar o Deshabilitar las Cookies</h2>
        <p>
          Puedes configurar, bloquear o eliminar las cookies instaladas en tu navegador en cualquier momento a través de sus opciones de configuración:
        </p>
        <ul>
          <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
          <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio.</li>
          <li><strong>Apple Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
          <li><strong>Microsoft Edge:</strong> Configuración &gt; Permisos del sitio &gt; Cookies y datos del sitio.</li>
        </ul>
        <p>
          <em>Nota técnica:</em> Dado que las cookies técnicas son indispensables para mantener tu cuenta conectada y procesar pagos en vivo, desactivarlas por completo podría impedir la compra de boletos en la plataforma.
        </p>
      </div>

      <div className="info-section">
        <h2>5. Dudas y Aclaraciones Técnicas</h2>
        <p>
          Para cualquier duda sobre el tratamiento técnico de cookies o privacidad en LAIKA Club, contáctanos en nuestros canales autorizados:
        </p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Seguridad y Privacidad Digital</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Cookies
