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

// Lista plana con slug estable por pregunta (sobrevive a reordenamientos)
const FLAT_FAQS = FAQS.flatMap(g =>
  g.items.map(it => ({ ...it, categoria: g.categoria, slug: slugify(it.pregunta) }))
);

const VOTOS_KEY = 'usupport-votos';

function leerVotos() {
  try {
    return JSON.parse(localStorage.getItem(VOTOS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Atajos por defecto si aun no hay votos locales
const DEFAULT_TOP = [
  'no-recibi-mis-boletos-donde-estan',
  'que-metodos-de-pago-aceptan',
  'mi-cuenta-esta-bloqueada-cuanto-dura'
];

export default function UserSupport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [abiertas, setAbiertas] = useState(() => new Set());
  // Votos persistentes en localStorage: { [slug]: 'util' | 'no' }
  const [votos, setVotos] = useState(leerVotos);
  const [ticketMsg, setTicketMsg] = useState('');
  const [copiado, setCopiado] = useState(null);

  const categorias = useMemo(() => ['Todas', ...FAQS.map(f => f.categoria)], []);

  const resultados = useMemo(() => {
    const q = query.trim();
    return FAQS
      .filter(g => categoriaActiva === 'Todas' || g.categoria === categoriaActiva)
      .map(g => ({
        ...g,
        items: g.items
          .map(it => {
            const slug = slugify(it.pregunta);
            return { ...it, slug, _score: q ? fuzzyScore(it.pregunta, it.respuesta, q) : 1 };
          })
          .filter(it => !q || it._score >= 0.5)
      }))
      .filter(g => g.items.length > 0);
  }, [query, categoriaActiva]);

  const totalRespuestas = resultados.reduce((n, g) => n + g.items.length, 0);

  // Top 3 mas utiles: primero las votadas util, luego atajos por defecto
  const topUtiles = useMemo(() => {
    const votadasUtil = FLAT_FAQS.filter(f => votos[f.slug] === 'util');
    const lista = [...votadasUtil];
    for (const slug of DEFAULT_TOP) {
      if (lista.length >= 3) break;
      const f = FLAT_FAQS.find(x => x.slug === slug);
      if (f && !lista.some(x => x.slug === slug)) lista.push(f);
    }
    return lista.slice(0, 3);
  }, [votos]);

  // Deep link: si la URL trae ?q=slug, abre esa pregunta al cargar
  useEffect(() => {
    const slug = searchParams.get('q');
    if (!slug) return;
    const hit = FLAT_FAQS.find(f => f.slug === slug);
    if (hit) {
      setCategoriaActiva('Todas');
      setAbiertas(new Set([slug]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (slug) => {
    setAbiertas(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
        setSearchParams({});
      } else {
        next.add(slug);
        setSearchParams({ q: slug });
      }
      return next;
    });
  };

  const irATop = (slug) => {
    setQuery('');
    setCategoriaActiva('Todas');
    setAbiertas(new Set([slug]));
    setSearchParams({ q: slug });
  };

  const expandirTodo = () => {
    const ids = resultados.flatMap(g => g.items.map(it => it.slug));
    setAbiertas(new Set(ids));
  };

  const colapsarTodo = () => {
    setAbiertas(new Set());
    setSearchParams({});
  };

  // Voto persistente: se puede cambiar de opinion, queda en localStorage
  const votar = (slug, valor) => {
    setVotos(prev => {
      const next = { ...prev, [slug]: valor };
      try {
        localStorage.setItem(VOTOS_KEY, JSON.stringify(next));
      } catch {
        // almacenamiento no disponible: se mantiene solo en memoria
      }
      return next;
    });
  };

  const copiarLink = async (slug) => {
    const url = `${window.location.origin}/user/support?q=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      console.log('[soporte] link para compartir:', url);
    }
    setCopiado(slug);
    setTimeout(() => setCopiado(cur => (cur === slug ? null : cur)), 2000);
  };

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

      <div className="usupport-top">
        <span className="usupport-top-label">Más útiles</span>
        <div className="usupport-top-row">
          {topUtiles.map(f => (
            <button key={f.slug} type="button" className="usupport-top-chip" onClick={() => irATop(f.slug)}>
              {f.pregunta}
            </button>
          ))}
        </div>
      </div>

      <div className="usupport-cats">
        {categorias.map(c => (
          <button
            key={c}
            type="button"
            className={`usupport-cat ${categoriaActiva === c ? 'active' : ''}`}
            onClick={() => { setCategoriaActiva(c); setAbiertas(new Set()); setSearchParams({}); }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="usupport-tools">
        <p className="usupport-count" aria-live="polite">
          {totalRespuestas} respuesta{totalRespuestas === 1 ? '' : 's'}
          {query && <> para “{query}”</>}
        </p>
        <div className="usupport-tools-row">
          <button type="button" className="usupport-tool" onClick={expandirTodo}>
            Expandir todo
          </button>
          <button type="button" className="usupport-tool" onClick={colapsarTodo}>
            Colapsar todo
          </button>
        </div>
      </div>

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
              const id = it.slug;
              const open = abiertas.has(id);
              const voto = votos[id];
              return (
                <div key={id} className={`usupport-item ${open ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="usupport-q"
                    onClick={() => toggle(id)}
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
                      <div className="usupport-actions">
                        {!voto ? (
                          <div className="usupport-vote">
                            <span>¿Te sirvió esta respuesta?</span>
                            <button type="button" onClick={() => votar(id, 'util')}>Útil</button>
                            <button type="button" onClick={() => votar(id, 'no')}>No útil</button>
                          </div>
                        ) : (
                          <div className="usupport-vote">
                            <span className="usupport-thanks">Gracias por tu feedback</span>
                            <button type="button" onClick={() => votar(id, 'util')}>
                              {voto === 'util' ? 'Votaste útil' : 'Útil'}
                            </button>
                            <button type="button" onClick={() => votar(id, 'no')}>
                              {voto === 'no' ? 'Votaste no útil' : 'No útil'}
                            </button>
                          </div>
                        )}
                        <button type="button" className="usupport-copy" onClick={() => copiarLink(id)}>
                          <Icon name="copy" size={13} />
                          {copiado === id ? 'Link copiado' : 'Copiar link'}
                        </button>
                      </div>
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
