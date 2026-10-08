import React from 'react'
import { useTheme } from '../../context/ThemeContext'
import './Nosotros.css'

const VALORES = [
  {
    titulo: 'Innovación',
    texto: 'Buscamos constantemente nuevas formas de mejorar la experiencia de nuestros usuarios.',
  },
  {
    titulo: 'Transparencia',
    texto: 'Creemos en la honestidad y claridad en todas nuestras transacciones y comunicaciones.',
  },
  {
    titulo: 'Pasión',
    texto: 'Amamos lo que hacemos y eso se refleja en la calidad de nuestro servicio.',
  },
]

const OFRECEMOS = [
  'Una experiencia de compra fluida y segura.',
  'Atención al cliente excepcional.',
  'Innovación constante en nuestras herramientas tecnológicas.',
]

const Nosotros = () => {
  const { isDark } = useTheme()
  const logo = isDark ? '/LogoClaro.png' : '/LogoOsc.png'

  return (
    <div className="nosotros-page">
      {/* Hero full-width */}
      <section className="nosotros-hero">
        <img src={logo} alt="LaikaEvents" className="nosotros-hero-logo" />
        <p className="nosotros-kicker">Sobre Nosotros</p>
        <h1>Conectamos personas con experiencias inolvidables</h1>
      </section>

      {/* Misión: texto izquierda, imagen derecha */}
      <section className="nosotros-seccion">
        <div className="nosotros-contenido nosotros-fila">
          <div className="nosotros-texto">
            <p className="nosotros-kicker">Misión</p>
            <h2>Nuestra Misión</h2>
            <p>
              En LaikaEvents, nuestra misión es conectar a las personas con experiencias inolvidables.
              Nos dedicamos a facilitar el acceso a los mejores eventos culturales, deportivos y de entretenimiento,
              proporcionando una plataforma segura, confiable y fácil de usar.
            </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/vision-laika.png" alt="Nuestra misión LaikaEvents" />
          </div>
        </div>
      </section>

      {/* Visión: imagen izquierda, texto derecha */}
      <section className="nosotros-seccion nosotros-seccion-alt">
        <div className="nosotros-contenido nosotros-fila nosotros-fila-inv">
          <div className="nosotros-texto">
            <p className="nosotros-kicker">Visión</p>
            <h2>Nuestra Visión</h2>
            <p>
              Revolucionar la forma en que las personas descubren y asisten a eventos,
              siendo la plataforma de referencia en experiencias culturales, deportivas y de entretenimiento.
            </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/mision-laika.jpg" alt="Visión LaikaEvents" />
          </div>
        </div>
      </section>

      {/* Historia: texto izquierda, imagen derecha */}
      <section className="nosotros-seccion">
        <div className="nosotros-contenido nosotros-fila">
          <div className="nosotros-texto">
          <p className="nosotros-kicker">Nuestra historia</p>
          <h2>¿Quiénes Somos?</h2>
          <p>
            Somos un equipo apasionado por la tecnología y el entretenimiento. Fundada en 2024,
            LaikaEvents nació con la visión de revolucionar la forma en que las personas descubren y asisten a eventos.
          </p>
          <p>
            Trabajamos incansablemente para ofrecer:
          </p>
          </div>
          <div className="nosotros-media nosotros-media-libre">
            <img src="/quienes-somos.png" alt="Equipo LaikaEvents" />
          </div>
        </div>
        <div className="nosotros-contenido">
          <div className="nosotros-grid">
            {OFRECEMOS.map((item) => (
              <div className="nosotros-card" key={item}>
                <span className="nosotros-check">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="nosotros-seccion nosotros-seccion-alt">
        <div className="nosotros-contenido">
          <p className="nosotros-kicker">Valores</p>
          <h2>Nuestros Valores</h2>
          <div className="nosotros-grid">
            {VALORES.map((v) => (
              <div className="nosotros-card nosotros-valor" key={v.titulo}>
                <h3>{v.titulo}</h3>
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
