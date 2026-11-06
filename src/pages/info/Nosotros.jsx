import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import './Nosotros.css'

const VALORES = [
  {
    num: '01',
    titulo: 'Responsabilidad',
    texto: 'Cumplimos con excelencia cada compromiso adquirido con nuestros clientes y usuarios. La responsabilidad no es una postura, es el mínimo que nos exigimos en cada línea de código y cada acceso emitido.',
  },
  {
    num: '02',
    titulo: 'Compromiso',
    texto: 'Dedicación total para asegurar el éxito de cada evento gestionado a través de nuestra plataforma. El compromiso no termina cuando el evento inicia, sino cuando el último asistente sale satisfecho.',
  },
  {
    num: '03',
    titulo: 'Innovación',
    texto: 'Búsqueda constante de mejores soluciones tecnológicas y creativas. No nos conformamos con lo que funciona hoy si existe una manera más rápida, limpia y segura de hacerlo mañana.',
  },
  {
    num: '04',
    titulo: 'Seguridad',
    texto: 'Protección absoluta de la información y los activos de nuestros usuarios. La confianza que depositan en nosotros se sostiene en sistemas robustos, encriptación de datos y protocolos antifraude rigurosos.',
  },
]

const PILARES_OPERATIVOS = [
  'Venta de boletos sin fricciones, 100% digital y en tiempo real.',
  'Códigos QR dinámicos antifraude con trazabilidad por entrada.',
  'Herramientas integrales para que el organizador controle accesos y aforos.',
  'Soporte técnico y atención humana personalizada ante cualquier eventualidad.',
]

const Nosotros = () => {
  const { isDark } = useTheme()
  const logo = isDark ? '/LogoClaro.png' : '/LogoOsc.png'

  return (
    <div className="nosotros-page">
      {/* Hero full-width */}
      <section className="nosotros-hero">
        <img src={logo} alt="LAIKA Club" className="nosotros-hero-logo" />
        <span className="nosotros-kicker">Filosofía Corporativa</span>
        <h1>Tecnología al servicio de experiencias inolvidables</h1>
        <p className="nosotros-hero-desc">
          Conoce el propósito, la visión y los principios que guían el desarrollo de la plataforma integral de eventos LAIKA Club.
        </p>
        <div style={{ marginTop: '1.25rem' }}>
          <a 
            href="https://laikaweb.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#ef4444', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              textDecoration: 'none',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '6px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}
          >
            Visitar Portal Institucional Oficial: laikaweb.vercel.app &rarr;
          </a>
        </div>
      </section>

      {/* Misión: texto izquierda, imagen derecha */}
      <section className="nosotros-seccion">
        <div className="nosotros-contenido nosotros-fila">
          <div className="nosotros-texto">
            <span className="nosotros-kicker">Nuestro Propósito</span>
            <h2>Misión</h2>
            <p>
              Ofrecer un sistema integral que permita la creación, administración y venta de boletos de forma segura y eficiente, 
              optimizando todo el ciclo de vida del evento.
            </p>
            <p>
              Cada evento que gestionamos representa una <strong>promesa cumplida</strong> entre el organizador y su audiencia. 
              Nuestra misión es que esa promesa sea posible gracias a tecnología confiable, clara y a la medida de cualquier producción.
            </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/vision-laika.png" alt="Misión LAIKA Club" />
          </div>
        </div>
      </section>

      {/* Visión: imagen izquierda, texto derecha */}
      <section className="nosotros-seccion nosotros-seccion-alt">
        <div className="nosotros-contenido nosotros-fila nosotros-fila-inv">
          <div className="nosotros-texto">
            <span className="nosotros-kicker">Hacia Dónde Vamos</span>
            <h2>Visión</h2>
            <p>
              Consolidarse como una de las mejores plataformas de gestión de eventos del mercado, destacando por su calidad técnica e innovación.
            </p>
            <p>
              No aspiramos únicamente a estar presentes en el mercado; aspiramos a <strong>definir el estándar</strong> de lo que una plataforma 
              de ticketing y gestión debe ser capaz de hacer, combinando robustez de microservicios con una experiencia de usuario sin fricciones.
            </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/mision-laika.jpg" alt="Visión LAIKA Club" />
          </div>
        </div>
      </section>

      {/* Objetivo: texto izquierda, imagen derecha */}
      <section className="nosotros-seccion">
        <div className="nosotros-contenido nosotros-fila">
          <div className="nosotros-texto">
            <span className="nosotros-kicker">La Meta Concreta</span>
            <h2>Objetivo del Sistema</h2>
            <p>
              Facilitar la administración de eventos y garantizar que la compra de boletos sea un proceso confiable, accesible y completamente digital.
            </p>
            <p>
              Un proceso de compra que falla no solo pierde una venta: pierde la confianza del fan y compromete el evento. Nuestro objetivo 
              es que eso nunca ocurra, aportando trazabilidad, prevención de duplicados y transparencia para organizadores y asistentes.
            </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/quienes-somos.png" alt="Objetivo LAIKA Club" />
          </div>
        </div>
        <div className="nosotros-contenido">
          <div className="nosotros-grid">
            {PILARES_OPERATIVOS.map((item) => (
              <div className="nosotros-card" key={item}>
                <span className="nosotros-check" style={{ color: '#ef4444', fontWeight: 'bold' }}>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="nosotros-seccion nosotros-seccion-alt">
        <div className="nosotros-contenido">
          <span className="nosotros-kicker">Nuestros Pilares</span>
          <h2>Valores Fundamentales</h2>
          <div className="nosotros-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {VALORES.map((v) => (
              <div className="nosotros-card nosotros-valor" key={v.titulo}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em' }}>{v.num}</span>
                <h3 style={{ margin: '0.3rem 0 0.5rem 0' }}>{v.titulo}</h3>
                <p>{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Nosotros
