import React from 'react'
import InfoLayout from './InfoLayout'
import { Link } from 'react-router-dom'
import './MapaDelSitio.css'

const MapaDelSitio = () => {
  return (
    <InfoLayout 
      title="Mapa del Sitio" 
      subtitle="Índice completo de navegación para acceder rápidamente a todas las secciones, servicios y políticas del ecosistema LAIKA Club."
      badge="Directorio y Navegación"
      lastUpdated="Noviembre 2026"
    >
      <div className="mapa-bento-grid">
        
        {/* BLOQUE 1: PLATAFORMA */}
        <div className="mapa-card">
          <div className="mapa-card-header">
            <span className="mapa-card-badge">Plataforma</span>
            <h3>Accesos Principales</h3>
          </div>
          <ul className="mapa-links-list">
            <li><Link to="/">Cartelera de Eventos y Boletos</Link></li>
            <li><Link to="/login">Iniciar Sesión en tu Cuenta</Link></li>
            <li><Link to="/register">Registro de Nuevo Usuario</Link></li>
            <li><Link to="/user/dashboard">Panel del Usuario (Dashboard)</Link></li>
            <li><Link to="/user/tickets">Billetera de Boletos (Mis Entradas)</Link></li>
            <li><Link to="/cart">Carrito de Compras</Link></li>
          </ul>
        </div>

        {/* BLOQUE 2: INSTITUCIONAL */}
        <div className="mapa-card">
          <div className="mapa-card-header">
            <span className="mapa-card-badge">Institucional</span>
            <h3>Nosotros y Filosofía</h3>
          </div>
          <ul className="mapa-links-list">
            <li><Link to="/info/nosotros">Misión, Visión y Valores</Link></li>
            <li>
              <a href="https://laikaweb.vercel.app/" target="_blank" rel="noopener noreferrer">
                Portal Corporativo Oficial (laikaweb.vercel.app) &rarr;
              </a>
            </li>
            <li>
              <a href="https://laikaweb.vercel.app/fan.html" target="_blank" rel="noopener noreferrer">
                Beneficios para el Fan &rarr;
              </a>
            </li>
            <li>
              <a href="https://laikaweb.vercel.app/organizador.html" target="_blank" rel="noopener noreferrer">
                Soluciones para Organizadores &rarr;
              </a>
            </li>
            <li>
              <a href="https://laikaweb.vercel.app/documentacion.html" target="_blank" rel="noopener noreferrer">
                Documentación Técnica &rarr;
              </a>
            </li>
          </ul>
        </div>

        {/* BLOQUE 3: LEGAL */}
        <div className="mapa-card">
          <div className="mapa-card-header">
            <span className="mapa-card-badge">Legal</span>
            <h3>Políticas y Normativa</h3>
          </div>
          <ul className="mapa-links-list">
            <li><Link to="/legal/privacidad">Aviso de Privacidad Integral</Link></li>
            <li><Link to="/legal/terminos">Términos y Condiciones de Uso</Link></li>
            <li><Link to="/info/devoluciones">Política de Devoluciones y Reembolsos</Link></li>
            <li><Link to="/legal/cookies">Política de Cookies</Link></li>
            <li><Link to="/legal/seguridad">Protocolos de Seguridad</Link></li>
            <li>
              <a href="https://laikaweb.vercel.app/eliminar-cuenta.html" target="_blank" rel="noopener noreferrer">
                Solicitud de Eliminación de Cuenta &rarr;
              </a>
            </li>
          </ul>
        </div>

        {/* BLOQUE 4: SOPORTE */}
        <div className="mapa-card">
          <div className="mapa-card-header">
            <span className="mapa-card-badge">Soporte</span>
            <h3>Atención y Ayuda</h3>
          </div>
          <ul className="mapa-links-list">
            <li><Link to="/info/contacto">Contacto y Atención Directa</Link></li>
            <li><Link to="/info/faq">Preguntas Frecuentes (FAQ)</Link></li>
            <li><Link to="/info/soporte">Mesa de Soporte Técnico</Link></li>
            <li><Link to="/ayuda">Centro de Ayuda</Link></li>
            <li><Link to="/info/accesibilidad">Declaración de Accesibilidad</Link></li>
          </ul>
        </div>

      </div>
    </InfoLayout>
  )
}

export default MapaDelSitio
