import React from 'react'
import InfoLayout from './InfoLayout'

const Seguridad = () => {
  return (
    <InfoLayout 
      title="Protocolos de Seguridad y Ciberprotección" 
      subtitle="Infraestructura blindada, encriptación de extremo a extremo y validación criptográfica de accesos para tu tranquilidad."
      badge="Seguridad Tecnológica"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. Compromiso con la Integridad del Sistema</h2>
        <p>
          En <strong>LAIKA Club</strong> la seguridad de tus transacciones y la trazabilidad de tus accesos es nuestra máxima prioridad. 
          Desarrollamos nuestra infraestructura sobre microservicios contenerizados y puertas de enlace (API Gateways) con defensas multicapa.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Encriptación y Procesamiento de Pagos PCI-DSS</h2>
        <p>
          Toda la comunicación en la plataforma web y la aplicación móvil viaja a través de túneles cifrados con certificados SSL/TLS de alta graduación. 
          El procesamiento de pagos electrónicos se realiza mediante pasarelas auditadas con el estándar <strong>PCI-DSS Nivel 1</strong>.
        </p>
        <div className="info-callout">
          <p>
            <strong>Cero Almacenamiento Bancario:</strong> Ningún servidor o base de datos de LAIKA Club conserva números de tarjeta de crédito, débito o CVVs.
          </p>
        </div>
      </div>

      <div className="info-section">
        <h2>3. Códigos QR Dinámicos y Prevención de Clonación</h2>
        <p>
          Nuestros boletos digitales implementan firmas criptográficas que se refrescan periódicamente y se validan en tiempo real en los accesos del recinto. 
          Esto previene de raíz la duplicación de accesos, reventas ilícitas o boletos apócrifos.
        </p>
      </div>

      <div className="info-section">
        <h2>4. Reporte de Vulnerabilidades y Soporte de Seguridad</h2>
        <p>
          Si detectas una actividad inusual en tu cuenta o deseas notificar una aclaración de seguridad, comunícate de inmediato:
        </p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Mesa de Seguridad Informática</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Seguridad
