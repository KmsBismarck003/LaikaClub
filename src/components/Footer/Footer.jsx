import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'
import Icon from '../Icons/Icons'
import { useSkeletonContext } from '../../context/SkeletonContext'
import { SkeletonFooter } from '../Skeleton/Skeleton'

const Footer = () => {
  const { showSkeleton } = useSkeletonContext()
  const currentYear = new Date().getFullYear()

  if (showSkeleton) return <SkeletonFooter />

  return (
    <footer className='footer'>
      <div className='footer-container'>
        
        {/* COLUMNA 1: IDENTIDAD Y PORTAL INSTITUCIONAL */}
        <div className='footer-section footer-brand-section'>
          <img src="/logob.png" alt="LAIKA Club" className="footer-logo" />
          <p className="footer-tagline">
            Sistema integral de gestión de eventos, control de accesos y venta de boletos digitales.
          </p>
          <div className="footer-contact-info">
            <div><strong>Teléfono:</strong> <a href="tel:7222390967">722 239 0967</a></div>
            <div><strong>Correo:</strong> <a href="mailto:jreyes6458@gmail.com">jreyes6458@gmail.com</a></div>
            <div>
              <strong>Portal Corporativo:</strong>{' '}
              <a href="https://laikaweb.vercel.app/" target="_blank" rel="noopener noreferrer" className="footer-highlight-link">
                laikaweb.vercel.app &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: INSTITUCIONAL (CONTENIDO DEL SITIO WEB) */}
        <div className='footer-section'>
          <h4>Institucional</h4>
          <ul>
            <li><Link to='/info/nosotros'>Sobre Nosotros</Link></li>
            <li><a href="https://laikaweb.vercel.app/mision.html" target="_blank" rel="noopener noreferrer">Misión</a></li>
            <li><a href="https://laikaweb.vercel.app/vision.html" target="_blank" rel="noopener noreferrer">Visión</a></li>
            <li><a href="https://laikaweb.vercel.app/valores.html" target="_blank" rel="noopener noreferrer">Valores Corporativos</a></li>
            <li><a href="https://laikaweb.vercel.app/objetivo.html" target="_blank" rel="noopener noreferrer">Objetivo del Sistema</a></li>
            <li><a href="https://laikaweb.vercel.app/fan.html" target="_blank" rel="noopener noreferrer">Para el Fan</a></li>
            <li><a href="https://laikaweb.vercel.app/organizador.html" target="_blank" rel="noopener noreferrer">Para el Organizador</a></li>
            <li><a href="https://laikaweb.vercel.app/documentacion.html" target="_blank" rel="noopener noreferrer">Documentación Técnica</a></li>
          </ul>
        </div>

        {/* COLUMNA 3: LEGAL Y POLÍTICAS */}
        <div className='footer-section'>
          <h4>Legal & Políticas</h4>
          <ul>
            <li><Link to='/legal/privacidad'>Aviso de Privacidad</Link></li>
            <li><Link to='/legal/terminos'>Términos y Condiciones</Link></li>
            <li><Link to='/info/devoluciones'>Política de Devoluciones</Link></li>
            <li><Link to='/legal/cookies'>Política de Cookies</Link></li>
            <li>
              <a href="https://laikaweb.vercel.app/eliminar-cuenta.html" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444' }}>
                Eliminar Cuenta
              </a>
            </li>
            <li><Link to='/legal/seguridad'>Protocolos de Seguridad</Link></li>
            <li><Link to='/info/accesibilidad'>Accesibilidad</Link></li>
          </ul>
        </div>

        {/* COLUMNA 4: ASISTENCIA Y REDES */}
        <div className='footer-section'>
          <h4>Soporte & Redes</h4>
          <ul>
            <li><Link to='/info/contacto'>Contacto Directo</Link></li>
            <li><Link to='/info/faq'>Preguntas Frecuentes</Link></li>
            <li><Link to='/info/soporte'>Soporte Técnico</Link></li>
            <li><Link to='/ayuda'>Centro de Ayuda</Link></li>
            <li><Link to='/info/mapa-del-sitio'>Mapa del Sitio</Link></li>
          </ul>
          
          <div className='footer-social' style={{ marginTop: '16px' }}>
            <a 
              href='https://www.facebook.com/people/Laika-Club/61581326425324/' 
              target='_blank' 
              rel='noopener noreferrer' 
              aria-label='Facebook'
            >
              <Icon name="facebook" size={20} />
            </a>
            <a 
              href='https://www.instagram.com/laika__club' 
              target='_blank' 
              rel='noopener noreferrer' 
              aria-label='Instagram'
            >
              <Icon name="instagram" size={20} />
            </a>
          </div>

          <div className="footer-map-container" style={{ marginTop: '16px' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.8222306761336!2d-99.65698299999998!3d19.290095400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cd89ea9f7cd297%3A0xa29b8785b09a6143!2sCentro%2C%2050000%20Toluca%20de%20Lerdo%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1773019646399!5m2!1ses-419!2smx" 
              width="100%" 
              height="110" 
              style={{ border: 0, borderRadius: '8px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación LAIKA"
            ></iframe>
          </div>
        </div>

      </div>

      <div className='footer-bottom'>
        <p>&copy; {currentYear} LAIKA Club. Todos los derechos reservados. | Operado por Reyes de la Rosa José Ángel y Vazquez Nava Brandon</p>
      </div>
    </footer>
  )
}

export default Footer
