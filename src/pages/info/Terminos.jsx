import React from 'react'
import InfoLayout from './InfoLayout'

const Terminos = () => {
  return (
    <InfoLayout 
      title="Términos y Condiciones de Uso" 
      subtitle="Condiciones contractuales que rigen el acceso, compra de boletos digitales y uso de las plataformas web y móviles de LAIKA Club."
      badge="Marco Jurídico de Operación"
      lastUpdated="Noviembre 2026"
    >
      <div className="info-section">
        <h2>1. Aceptación de los Términos</h2>
        <p>
          El presente documento constituye un contrato vinculante entre el usuario y <strong>LAIKA Club</strong> 
          (operada por Reyes de la Rosa José Ángel y Vazquez Nava Brandon). Al navegar, crear una cuenta o adquirir boletos 
          a través de nuestros sitios web oficiales (
          <a href="https://laika-club.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>
            laika-club.vercel.app
          </a>{' '}
          y{' '}
          <a href="https://laikaweb.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline' }}>
            laikaweb.vercel.app
          </a>
          ) o mediante nuestra aplicación móvil oficial <strong>LaikaMobil</strong>, declaras ser mayor de edad con plena capacidad jurídica y 
          aceptas cumplir a cabalidad estos Términos y Condiciones.
        </p>
      </div>

      <div className="info-section">
        <h2>2. Cuenta de Usuario y Seguridad</h2>
        <p>
          Para adquirir boletos y acceder a tu billetera digital (Wallet), es necesario crear una cuenta personal. Eres el único responsable 
          de salvaguardar la confidencialidad de tus credenciales de acceso. Cualquier actividad, compra o transferencia efectuada desde tu cuenta 
          se presumirá realizada legítimamente por ti.
        </p>
      </div>

      <div className="info-section">
        <h2>3. Venta de Boletos y Pagos Electrónicos</h2>
        <p>
          Todos los precios exhibidos en la plataforma están expresados en pesos mexicanos (MXN) e incluyen los impuestos aplicables. 
          Al confirmar tu orden:
        </p>
        <div className="info-grid-2">
          <div className="info-grid-card">
            <h4>Procesamiento Cifrado</h4>
            <p>Los pagos se procesan en tiempo real mediante pasarelas bancarias reguladas con certificación de máxima seguridad PCI-DSS.</p>
          </div>
          <div className="info-grid-card">
            <h4>Bloqueo de Aforo</h4>
            <p>El sistema reserva tus boletos temporalmente mientras concluyes la transacción para evitar sobreventas o duplicidad de asientos.</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>4. Boletos Digitales y Tecnología QR Antifraude</h2>
        <p>
          Los boletos emitidos por LAIKA Club son <strong>100% digitales</strong> y cuentan con un sistema de código QR dinámico protegido con 
          firmas criptográficas.
        </p>
        <ul>
          <li><strong>Acceso Único:</strong> Cada código QR permite un único acceso al recinto por cada entrada emitida; una vez validado y escaneado por el personal de staff en puerta, queda inhabilitado automáticamente.</li>
          <li><strong>Prohibición de Reventa Ilícita:</strong> Queda estrictamente prohibida la clonación, alteración o comercialización no autorizada de boletos. LAIKA Club se reserva el derecho de cancelar cualquier código QR adulterado sin derecho a reembolso.</li>
        </ul>
      </div>

      <div className="info-section">
        <h2>5. Derecho de Admisión y Políticas del Recinto</h2>
        <p>
          La adquisición de un boleto otorga el derecho de acceso al evento sujeto a los reglamentos internos del inmueble, del promotor y de 
          las autoridades de protección civil (restricciones de objetos prohibidos, control de edad y filtros de seguridad).
        </p>
      </div>

      <div className="info-section">
        <h2>6. Propiedad Intelectual</h2>
        <p>
          Los logotipos, marcas, código fuente, interfaces visuales, nombres comerciales y tecnología del ecosistema LAIKA Club son propiedad 
          exclusiva de sus desarrolladores y están protegidos por el Instituto Mexicano de la Propiedad Industrial (IMPI) y las leyes de derechos 
          de autor. Queda prohibida su reproducción sin autorización por escrito.
        </p>
      </div>

      <div className="info-section">
        <h2>7. Jurisdicción y Legislación Aplicable</h2>
        <p>
          Para la interpretación y cumplimiento de los presentes Términos y Condiciones, las partes se someten expresamente a las leyes 
          aplicables de los Estados Unidos Mexicanos y a la competencia de los tribunales competentes en la ciudad de <strong>Toluca de Lerdo, 
          Estado de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
        </p>
      </div>

      <div className="info-section">
        <h2>8. Contacto Legal</h2>
        <p>Para notificaciones o dudas respecto a este documento:</p>
        <div className="info-channels">
          <a href="mailto:jreyes6458@gmail.com" className="info-channel-item">
            <div className="info-channel-icon">@</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Asuntos Legales y Normativos</span>
              <span className="info-channel-value">jreyes6458@gmail.com</span>
            </div>
          </a>
          <a href="tel:7222390967" className="info-channel-item">
            <div className="info-channel-icon">#</div>
            <div className="info-channel-details">
              <span className="info-channel-label">Atención Directa</span>
              <span className="info-channel-value">722 239 0967</span>
            </div>
          </a>
        </div>
      </div>
    </InfoLayout>
  )
}

export default Terminos
