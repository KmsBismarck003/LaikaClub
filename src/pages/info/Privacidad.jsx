import React from 'react'
import InfoLayout from './InfoLayout'

const Privacidad = () => {
  return (
    <InfoLayout 
      title="Aviso de Privacidad Integral" 
      subtitle="Tu privacidad y la seguridad de tus accesos son nuestra máxima prioridad. Conoce con total transparencia cómo protegemos tu información."
      badge="Marco Legal y Protección de Datos"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. Identidad y Compromiso del Responsable</h2>
        <p>
          En <strong>LAIKA Club</strong> (representada por Reyes de la Rosa José Ángel y Vazquez Nava Brandon), 
          con domicilio operativo en Toluca de Lerdo, Estado de México, somos responsables del uso, 
          tratamiento y protección confidencial de tus datos personales, en estricto cumplimiento con la 
          <strong> Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> 
          y las normativas internacionales de protección al consumidor y tiendas de aplicaciones digitales.
        </p>
        <p>
          Esta política aplica a todos los usuarios de nuestra plataforma web de venta de boletos (
          <a href="https://laika-club.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>
            laika-club.vercel.app
          </a>
          ), nuestro portal corporativo (
          <a href="https://laikaweb.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>
            laikaweb.vercel.app
          </a>
          ) y nuestra aplicación móvil oficial <strong>LaikaMobil</strong>.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Información que Recopilamos</h2>
        <p>
          Para brindarte un servicio ágil y seguro en la compra y validación de tus boletos, recopilamos únicamente los datos indispensables:
        </p>
        <div className="info-grid-2">
          <div className="info-grid-card">
            <h4>Datos de Cuenta y Perfil</h4>
            <p>Nombre completo, dirección de correo electrónico, número de teléfono de contacto y contraseña cifrada.</p>
          </div>
          <div className="info-grid-card">
            <h4>Historial de Accesos</h4>
            <p>Eventos adquiridos, tipo de zona, folios de transacción, cortesías canjeadas y códigos QR dinámicos de entrada.</p>
          </div>
        </div>

        <div className="info-callout">
          <p>
            <strong>Protección de Datos Financieros:</strong> LAIKA Club <strong>nunca almacena</strong> los números completos de tus tarjetas bancarias, fechas de vencimiento ni códigos de seguridad (CVV). Todos los cobros se procesan a través de pasarelas de pago certificadas con el estándar internacional PCI-DSS y cifrado bancario de punto a punto.
          </p>
        </div>
      </div>

      <div className="info-section">
        <h2>3. Finalidades del Tratamiento de Datos</h2>
        <p>Tus datos personales se utilizan exclusivamente para los siguientes propósitos esenciales:</p>
        <ul>
          <li><strong>Generación y Entrega de Boletos:</strong> Emisión de accesos digitales con código QR único y seguro para ingreso al recinto.</li>
          <li><strong>Validación en Puerta:</strong> Autenticación de tus boletos mediante escáneres en los accesos del evento para prevenir duplicados o fraudes.</li>
          <li><strong>Notificaciones Importantes:</strong> Avisos sobre confirmación de compra, cambios de horario, cancelaciones o reprogramaciones del evento.</li>
          <li><strong>Soporte y Atención al Cliente:</strong> Asistencia técnica ante dudas de compra, aclaraciones o solicitudes de reembolso.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>4. Transferencia y Confidencialidad de Datos</h2>
        <p>
          En LAIKA Club <strong>no vendemos, no rentamos ni comercializamos tus datos personales con terceros para fines publicitarios</strong>.
        </p>
        <p>
          Únicamente compartimos la lista de asistentes con el <strong>organizador verificado del evento específico</strong> para el control exclusivo de acceso en taquilla, y con las autoridades competentes en caso de mandato judicial expreso.
        </p>
      </div>

      <div className="info-section">
        <h2>5. Derechos ARCO y Eliminación Definitiva de Cuenta</h2>
        <p>
          Tienes en todo momento el derecho de <strong>Acceder, Rectificar, Cancelar u Oponerte (Derechos ARCO)</strong> al tratamiento de tu información personal, así como de eliminar tu cuenta y todos sus registros asociados.
        </p>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <span className="info-step-num">Vía In-App</span>
            <div className="info-step-title">Desde la App Móvil</div>
            <p className="info-step-desc">Inicia sesión en LaikaMobil, ve a tu Perfil y pulsa el botón «Eliminar Cuenta».</p>
          </div>
          <div className="info-step-card">
            <span className="info-step-num">Vía Web Oficial</span>
            <div className="info-step-title">Portal de Baja</div>
            <p className="info-step-desc">
              Accede a{' '}
              <a href="https://laikaweb.vercel.app/eliminar-cuenta.html" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>
                laikaweb.vercel.app/eliminar-cuenta.html
              </a>{' '}
              para solicitar la supresión de datos en línea.
            </p>
          </div>
          <div className="info-step-card">
            <span className="info-step-num">Vía Correo Directo</span>
            <div className="info-step-title">Atención Personalizada</div>
            <p className="info-step-desc">Envíanos un correo a jreyes6458@gmail.com con el asunto «Solicitud ARCO / Baja de Cuenta».</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>6. Canales de Contacto Oficial</h2>
        <p>Si tienes preguntas sobre este aviso o sobre el resguardo de tu información:</p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Correo Oficial de Privacidad</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
          <a href="tel:7222390967" className="info-channel-item">
            <div className="info-channel-icon">#</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Atención Telefónica</span>
              <span className="info-channel-value">722 239 0967</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Privacidad
