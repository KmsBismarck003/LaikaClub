import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icons/Icons';
import './UserSupport.css';

const FAQS = [
  {
    categoria: 'Cuenta y acceso',
    icon: 'user',
    items: [
      {
        pregunta: '¿Cómo creo mi cuenta?',
        respuesta: 'Ve a /register, completa nombre, correo y contraseña. Recibirás acceso inmediato a Mi LAIKA (boletos, logros e historial).'
      },
      {
        pregunta: 'No puedo iniciar sesión, ¿qué hago?',
        respuesta: 'Verifica correo y contraseña. Usa “¿Olvidaste tu contraseña?” en /login. Tras 5 intentos fallidos la cuenta se bloquea temporalmente por seguridad.'
      },
      {
        pregunta: 'Mi cuenta está bloqueada, ¿cuánto dura?',
        respuesta: 'El bloqueo es temporal (unos minutos). Espera e intenta de nuevo o escríbenos desde /info/contacto si persiste.'
      }
    ]
  },
  {
    categoria: 'Compra de boletos',
    icon: 'ticket',
    items: [
      {
        pregunta: '¿Cómo compro boletos?',
        respuesta: 'Elige un evento, selecciona zona/asientos, agrega al carrito y continúa a /checkout. Puedes comprar con o sin cuenta (modo invitado).'
      },
      {
        pregunta: '¿Recibiré boletos físicos?',
        respuesta: 'No. Son e-tickets con QR. Los verás en /user/tickets (Mis Boletos) y también llegan a tu correo. Revisa spam si no los ves.'
      },
      {
        pregunta: 'No recibí mis boletos, ¿dónde están?',
        respuesta: 'Revisa spam y luego entra a Mis Boletos (/user/tickets). Si el pago fue aprobado, ahí estarán disponibles con su QR.'
      }
    ]
  },
  {
    categoria: 'Pagos y reembolsos',
    icon: 'creditCard',
    items: [
      {
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Tarjetas Visa, Mastercard y American Express, además de métodos locales según tu ubicación. El cargo aparece como LAIKA Club.'
      },
      {
        pregunta: 'Mi pago fue rechazado, ¿por qué?',
        respuesta: 'Suele ser fondos insuficientes, datos incorrectos o bloqueo del banco. Verifica los datos o contacta a tu banco.'
      },
      {
        pregunta: '¿Puedo cancelar y pedir reembolso?',
        respuesta: 'Depende del evento. Revisa /info/devoluciones y gestiona tu caso en /user/refunds (Reembolsos). Solo eventos cancelados por el organizador tienen reembolso del 100% en 3-5 días hábiles.'
      }
    ]
  },
  {
    categoria: 'Soporte técnico',
    icon: 'shield',
    items: [
      {
        pregunta: '¿Es seguro comprar en LAIKA Club?',
        respuesta: 'Sí. Usamos cifrado, pagos seguros, QR únicos y validación en puerta por operadores.'
      },
      {
        pregunta: 'La página o el QR no cargan, ¿qué hago?',
        respuesta: 'Recarga, prueba otro navegador y verifica tu conexión. Si tu boleto no muestra QR, reabre Mis Boletos o pide ayuda en /info/contacto.'
      }
    ]
  }
];

export default function UserSupport() {
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [abierta, setAbierta] = useState(null);

  const categorias = useMemo(() => ['Todas', ...FAQS.map(f => f.categoria)], []);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS
      .filter(g => categoriaActiva === 'Todas' || g.categoria === categoriaActiva)
      .map(g => ({
        ...g,
        items: g.items.filter(
          it =>
            !q ||
            it.pregunta.toLowerCase().includes(q) ||
            it.respuesta.toLowerCase().includes(q)
        )
      }))
      .filter(g => g.items.length > 0);
  }, [query, categoriaActiva]);

  const totalRespuestas = resultados.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="usupport-wrapper">
      <div className="usupport-header">
        <span className="usupport-label">AYUDA · SOPORTE</span>
        <h2 className="usupport-title">Preguntas frecuentes</h2>
        <p className="usupport-subtitle">
          Respuestas rápidas a tus dudas recurrentes, sin crear un ticket.
        </p>
      </div>

      <div className="usupport-search">
        <Icon name="search" size={16} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar: pago, boletos, cuenta bloqueada…"
          aria-label="Buscar en preguntas frecuentes"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="usupport-cats">
        {categorias.map(c => (
          <button
            key={c}
            type="button"
            className={`usupport-cat ${categoriaActiva === c ? 'active' : ''}`}
            onClick={() => { setCategoriaActiva(c); setAbierta(null); }}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="usupport-count">
        {totalRespuestas} respuesta{totalRespuestas === 1 ? '' : 's'}
        {query && <> para “{query}”</>}
      </p>

      {resultados.length === 0 ? (
        <div className="usupport-empty">
          <Icon name="searchEmpty" size={36} />
          <p>Sin resultados. Prueba con “boleto”, “pago” o “cuenta”.</p>
          <Link to="/info/contacto">Contactar a soporte</Link>
        </div>
      ) : (
        resultados.map(grupo => (
          <section key={grupo.categoria} className="usupport-group">
            <h3 className="usupport-group-title">
              <Icon name={grupo.icon} size={15} /> {grupo.categoria}
            </h3>
            {grupo.items.map((it, idx) => {
              const id = `${grupo.categoria}-${idx}`;
              const open = abierta === id;
              return (
                <div key={id} className={`usupport-item ${open ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="usupport-q"
                    onClick={() => setAbierta(open ? null : id)}
                    aria-expanded={open}
                  >
                    <span>{it.pregunta}</span>
                    <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} />
                  </button>
                  {open && <p className="usupport-a">{it.respuesta}</p>}
                </div>
              );
            })}
          </section>
        ))
      )}

      <div className="usupport-footer">
        <Icon name="info" size={14} />
        <p>¿No encuentras tu respuesta? <Link to="/info/contacto">Contáctanos</Link> o revisa <Link to="/info/devoluciones">Devoluciones</Link>.</p>
      </div>
    </div>
  );
}
