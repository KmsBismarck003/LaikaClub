import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

// Normaliza texto: minusculas y sin acentos para busqueda difusa
const normalize = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Sinonimos minimos para dudas recurrentes en espanol
const SINONIMOS = {
  llegan: ['recibi', 'recibir', 'llegar', 'llego'],
  llegar: ['recibi', 'recibir', 'llegar'],
  boleto: ['boleto', 'ticket', 'qr', 'entrada'],
  boletos: ['boleto', 'ticket', 'qr', 'entrada'],
  pago: ['pago', 'pagar', 'tarjeta', 'cobro'],
  cuenta: ['cuenta', 'sesion', 'login', 'acceso'],
  bloqueada: ['bloqueada', 'bloqueo', 'bloqueada'],
  metodos: ['metodos', 'metodo', 'formas']
};

const expande = (token) => [token, ...(SINONIMOS[token] || [])];

const slugify = (s = '') =>
  normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Puntaje difuso: fraccion de tokens de la query presentes (o via sinonimo)
function fuzzyScore(pregunta, respuesta, query) {
  const tokens = normalize(query).split(/\s+/).filter(t => t.length >= 2);
  if (!tokens.length) return 1;
  const hay = normalize(`${pregunta} ${respuesta}`);
  let ok = 0;
  tokens.forEach(t => { if (expande(t).some(v => hay.includes(v))) ok += 1; });
  return ok / tokens.length;
}

// Resalta tokens coincidentes con <mark> manteniendo texto original
function resaltar(texto, query) {
  const tokens = normalize(query).split(/\s+/).filter(t => t.length >= 2);
  if (!tokens.length) return texto;
  const partes = texto.split(/(\s+)/);
  return partes.map((p, i) => {
    const n = normalize(p);
    const hit = tokens.some(t => expande(t).some(v => v.length >= 3 && n.includes(v)));
    return hit ? <mark key={i} className="usupport-mark">{p}</mark> : <span key={i}>{p}</span>;
  });
}

export default function UserSupport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [abierta, setAbierta] = useState(null);
  const [votos, setVotos] = useState({}); // { [id]: 'util' | 'no' }
  const [ticketMsg, setTicketMsg] = useState('');

  const categorias = useMemo(() => ['Todas', ...FAQS.map(f => f.categoria)], []);

  const resultados = useMemo(() => {
    const q = query.trim();
    return FAQS
      .filter(g => categoriaActiva === 'Todas' || g.categoria === categoriaActiva)
      .map(g => ({
        ...g,
        items: g.items
          .map((it, idx) => ({ ...it, _idx: idx, _score: q ? fuzzyScore(it.pregunta, it.respuesta, q) : 1 }))
          .filter(it => !q || it._score >= 0.5)
      }))
      .filter(g => g.items.length > 0);
  }, [query, categoriaActiva]);

  const totalRespuestas = resultados.reduce((n, g) => n + g.items.length, 0);

  // Deep link: si la URL trae ?q=slug, abre esa pregunta al cargar
  useEffect(() => {
    const slug = searchParams.get('q');
    if (!slug) return;
    for (const g of FAQS) {
      for (let i = 0; i < g.items.length; i++) {
        if (slugify(g.items[i].pregunta) === slug) {
          setCategoriaActiva('Todas');
          setAbierta(`${g.categoria}-${i}`);
          return;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id, pregunta) => {
    const next = abierta === id ? null : id;
    setAbierta(next);
    if (next) setSearchParams({ q: slugify(pregunta) });
    else setSearchParams({});
  };

  const votar = (id, valor) => setVotos(p => ({ ...p, [id]: valor }));

  // Acciones simuladas: solo frontend, sin backend
  const simularTicket = () => {
    console.log('[soporte] ticket simulado: usuario abriria ticket desde FAQ');
    setTicketMsg('Ticket simulado registrado. Te contactaremos por correo.');
  };
  const simularChat = () => {
    console.log('[soporte] chat simulado con agente');
    setTicketMsg('Chat simulado: un agente te atendera en breve.');
  };

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
            onClick={() => { setCategoriaActiva(c); setAbierta(null); setSearchParams({}); }}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="usupport-count" aria-live="polite">
        {totalRespuestas} respuesta{totalRespuestas === 1 ? '' : 's'}
        {query && <> para “{query}”</>}
      </p>

      {resultados.length === 0 ? (
        <div className="usupport-empty">
          <Icon name="searchEmpty" size={36} />
          <p>No encontramos resultados para ‘{query}’. Intenta con otras palabras o contáctanos.</p>
          <Link to="/info/contacto">Contactar a soporte</Link>
        </div>
      ) : (
        resultados.map(grupo => (
          <section key={grupo.categoria} className="usupport-group">
            <h3 className="usupport-group-title">
              <Icon name={grupo.icon} size={15} /> {grupo.categoria}
            </h3>
            {grupo.items.map(it => {
              const id = `${grupo.categoria}-${it._idx}`;
              const open = abierta === id;
              const voto = votos[id];
              return (
                <div key={id} className={`usupport-item ${open ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="usupport-q"
                    onClick={() => toggle(id, it.pregunta)}
                    aria-expanded={open}
                    aria-controls={`ans-${id}`}
                  >
                    <span>{resaltar(it.pregunta, query)}</span>
                    <span className={`usupport-chev ${open ? 'rot' : ''}`}>
                      <Icon name="chevronDown" size={16} />
                    </span>
                  </button>
                  <div id={`ans-${id}`} className={`usupport-a-wrap ${open ? 'open' : ''}`}>
                    <div className="usupport-a-inner">
                      <p className="usupport-a">{it.respuesta}</p>
                      {!voto ? (
                        <div className="usupport-vote">
                          <span>¿Te sirvió esta respuesta?</span>
                          <button type="button" onClick={() => votar(id, 'util')}>Útil</button>
                          <button type="button" onClick={() => votar(id, 'no')}>No útil</button>
                        </div>
                      ) : (
                        <p className="usupport-thanks">Gracias por tu feedback</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ))
      )}

      <div className="usupport-cta">
        <h3>¿No encontraste lo que buscabas?</h3>
        <p>Abre un ticket o habla con un agente. Acción simulada, sin backend.</p>
        <div className="usupport-cta-row">
          <button type="button" className="usupport-btn primary" onClick={simularTicket}>
            Abrir ticket de soporte
          </button>
          <button type="button" className="usupport-btn" onClick={simularChat}>
            Chatear con un agente
          </button>
        </div>
        {ticketMsg && <p className="usupport-thanks">{ticketMsg}</p>}
      </div>

      <div className="usupport-footer">
        <Icon name="info" size={14} />
        <p>¿No encuentras tu respuesta? <Link to="/info/contacto">Contáctanos</Link> o revisa <Link to="/info/devoluciones">Devoluciones</Link>.</p>
      </div>
    </div>
  );
}
