import React from 'react'
import InfoLayout from './InfoLayout'

const Devoluciones = () => {
  return (
    <InfoLayout 
      title="Política de Devoluciones y Reembolsos" 
      subtitle="Lineamientos claros, justos y transparentes para la gestión de cancelaciones, reprogramaciones y aclaraciones de compra en LAIKA Club."
      badge="Garantía de Compra y Reembolsos"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. Principios Generales</h2>
        <p>
          En <strong>LAIKA Club</strong> operamos como una plataforma tecnológica segura entre organizadores de eventos y asistentes. 
          Nuestra prioridad es garantizar la certidumbre de tus compras y proteger tus derechos como consumidor conforme a las disposiciones 
          de la <strong>Procuraduría Federal del Consumidor (PROFECO)</strong> y las mejores prácticas de la industria de boletaje digital.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Cancelación Definitiva de Eventos</h2>
        <p>
          Si un evento es cancelado definitivamente por el organizador, artista, promotor o por mandatos de protección civil y fuerza mayor:
        </p>
        <div className="info-grid-2">
          <div className="info-grid-card">
            <h4>Reembolso Automático</h4>
            <p>El reembolso del costo facial del boleto se gestiona de forma automática al método de pago original con el que se realizó la transacción.</p>
          </div>
          <div className="info-grid-card">
            <h4>Sin Trámites Engorrosos</h4>
            <p>No requieres realizar filas físicas ni entregar boletos impresos; la cancelación de los códigos QR digitales se efectúa en el sistema.</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>3. Reprogramación o Cambio de Recinto</h2>
        <p>
          En caso de que un evento deba cambiar de fecha, horario o sede:
        </p>
        <ul>
          <li><strong>Validez Inmediata:</strong> Tus boletos digitales conservan su total validez y asiento/zona para la nueva fecha establecida, sin necesidad de canje alguno.</li>
          <li><strong>Ventana de Reembolso:</strong> Si por cualquier motivo no te es posible acudir en la nueva fecha anunciada, contarás con un plazo de <strong>15 a 30 días naturales</strong> (según se informe en el comunicado oficial del evento) para solicitar tu reembolso íntegro a través de nuestro soporte técnico.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>4. Compras Confirmadas y Causas Personales</h2>
        <p>
          Debido a la naturaleza de los espectáculos en vivo y el bloqueo de aforo en tiempo real:
        </p>
        <div className="info-callout">
          <p>
            <strong>Causas Personales o No Asistencia:</strong> Una vez completada y confirmada la orden de compra, no es posible emitir reembolsos por arrepentimiento, error de selección de zona atribuible al comprador o inasistencia voluntaria. Te sugerimos revisar cuidadosamente la fecha, horario y zona antes de finalizar tu pago.
          </p>
        </div>
        <p>
          <strong>Transferencia Segura en Billetera LAIKA:</strong> Si no puedes asistir, recuerda que nuestra plataforma permite la 
          transferencia segura de tus boletos a otro usuario registrado desde la sección <em>Mis Boletos</em> de tu cuenta.
        </p>
      </div>

      <div className="info-section">
        <h2>5. Plazos de Procesamiento y Acreditación</h2>
        <p>
          Una vez validada y autorizada la solicitud de reembolso por nuestro equipo financiero:
        </p>
        <div className="info-steps-grid">
          <div className="info-step-card">
            <span className="info-step-num">Fase 1</span>
            <div className="info-step-title">Validación del Folio</div>
            <p className="info-step-desc">Se comprueba la titularidad y estado del boleto digital (plazo: 24 a 48 hrs hábiles).</p>
          </div>
          <div className="info-step-card">
            <span className="info-step-num">Fase 2</span>
            <div className="info-step-title">Instrucción Bancaria</div>
            <p className="info-step-desc">Se envía la orden de dispersión a la pasarela bancaria que procesó el cobro original.</p>
          </div>
          <div className="info-step-card">
            <span className="info-step-num">Fase 3</span>
            <div className="info-step-title">Acreditación en Cuenta</div>
            <p className="info-step-desc">El monto se refleja en tu estado de cuenta entre 3 y 7 días hábiles (según las políticas de tu banco).</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>6. ¿Cómo Solicitar una Aclaración o Devolución?</h2>
        <p>
          Si tu evento califica para reembolso o requieres asistencia con una compra no reconocida, comunícate con nosotros indicando tu 
          <strong> número de orden o folio de compra</strong>:
        </p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Mesa de Aclaraciones y Reembolsos</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
          <a href="tel:7222390967" className="info-channel-item">
            <div className="info-channel-icon">#</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Línea Directa de Atención</span>
              <span className="info-channel-value">722 239 0967</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Devoluciones
