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
        respuesta: 'Ve a [[/register|registro]], completa nombre, correo y contraseña. Recibirás acceso inmediato a Mi LAIKA (boletos, logros e historial).'
      },
      {
        pregunta: 'No puedo iniciar sesión, ¿qué hago?',
        respuesta: 'Verifica correo y contraseña. Usa “¿Olvidaste tu contraseña?” en [[/login|inicio de sesión]]. Tras 5 intentos fallidos la cuenta se bloquea temporalmente por seguridad.'
      },
      {
        pregunta: 'Mi cuenta está bloqueada, ¿cuánto dura?',
        respuesta: 'El bloqueo es temporal (unos minutos). Espera e intenta de nuevo o escríbenos desde [[/info/contacto|contacto]] si persiste.'
      },
      {
        pregunta: '¿Puedo entrar con Google o Apple?',
        respuesta: 'Sí. En [[/login|inicio de sesión]] usa los botones de Google o Apple. Se vincula a tu correo y tendrás el mismo acceso a Mi LAIKA.'
      },
      {
        pregunta: '¿Cómo cambio mi foto o mis datos?',
        respuesta: 'Entra a [[/user/profile|Mi Perfil]]: ahí actualizas avatar, nombre y datos de contacto.'
      }
    ]
  },
  {
    categoria: 'Compra de boletos',
    icon: 'ticket',
    items: [
      {
        pregunta: '¿Cómo compro boletos?',
        respuesta: 'Elige un evento, selecciona zona/asientos, agrega al carrito y continúa a [[/checkout|checkout]]. Puedes comprar con o sin cuenta (modo invitado).'
      },
      {
        pregunta: '¿Recibiré boletos físicos?',
        respuesta: 'No. Son e-tickets con QR. Los verás en [[/user/tickets|Mis Boletos]] y también llegan a tu correo. Revisa spam si no los ves.'
      },
      {
        pregunta: 'No recibí mis boletos, ¿dónde están?',
        respuesta: 'Revisa spam y luego entra a [[/user/tickets|Mis Boletos]]. Si el pago fue aprobado, ahí estarán disponibles con su QR.'
      },
      {
        pregunta: 'Compré como invitado, ¿dónde están mis boletos?',
        respuesta: 'Llegan a tu correo. Si después creas tu cuenta con el mismo correo, se vinculan solos a tu bóveda en Mis Boletos.'
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
        respuesta: 'Depende del evento. Revisa la [[/info/devoluciones|Política de Devoluciones]] y gestiona tu caso en [[/user/refunds|Reembolsos]]. Solo eventos cancelados por el organizador tienen reembolso del 100% en 3-5 días hábiles.'
      },
      {
        pregunta: '¿Qué aparece en mi estado de cuenta? ¿Es seguro?',
        respuesta: 'El cargo aparece como “LAIKA Club” en una pasarela cifrada. Nunca guardamos el CVV de tu tarjeta.'
      },
      {
        pregunta: '¿Cómo sigo mi solicitud de reembolso?',
        respuesta: 'En [[/user/refunds|Reembolsos]] verás cada solicitud con su estado (Pendiente, En proceso, Aprobado), monto y fecha.'
      }
    ]
  },
  {
    categoria: 'Día del evento',
    icon: 'mapPin',
    items: [
      {
        pregunta: '¿Cómo entro al evento con mi boleto?',
        respuesta: 'Abre [[/user/tickets|Mis Boletos]] y muestra el QR en vivo con el brillo alto. El operador lo escanea en puerta. Evita capturas: usa siempre el QR en vivo.'
      },
      {
        pregunta: '¿Puedo transferir mi boleto a otra persona?',
        respuesta: 'Sí. Desde [[/user/tickets|Mis Boletos]] genera el link de transferencia y compártelo. Quien lo recibe lo reclama con o sin cuenta y el QR pasa a su nombre.'
      },
      {
        pregunta: '¿Qué es Lucky Seat?',
        respuesta: 'Es el modo sorpresa del detalle del evento: la ruleta elige un asiento disponible por ti. Puedes confirmar el resultado o girar de nuevo.'
      },
      {
        pregunta: '¿Qué pasa si el evento se cancela o cambia de fecha?',
        respuesta: 'Si lo cancela el organizador, recibes el 100% en 3-5 días hábiles (ver [[/user/refunds|Reembolsos]]). Si se reprograma, tu boleto sigue válido o puedes pedir reembolso dentro del plazo del aviso.'
      }
    ]
  },
  {
    categoria: 'Merch y extras',
    icon: 'shoppingBag',
    items: [
      {
        pregunta: '¿Puedo comprar merch del evento?',
        respuesta: 'Sí. En la sección “Merch del evento” del detalle agregas playeras y productos al carrito junto con tus boletos.'
      },
      {
        pregunta: '¿Qué son los logros y Laika Points?',
        respuesta: 'Es la gamificación de LAIKA: ganas puntos e insignias por comprar y asistir. Revísalos en [[/user/achievements|Mis Logros]].'
      },
      {
        pregunta: '¿Dónde veo mi historial de compras?',
        respuesta: 'En [[/user/history|Historial]] tienes todas tus compras; tus boletos activos viven en [[/user/tickets|Mis Boletos]].'
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
        respuesta: 'Recarga, prueba otro navegador y verifica tu conexión. Si tu boleto no muestra QR, reabre Mis Boletos o pide ayuda en [[/info/contacto|contacto]].'
      }
    ]
  }
];

// Convierte marcas [[ruta|texto visible]] en <Link> internos.
// El resto del string se devuelve como texto normal.
function renderRespuesta(texto) {
  const partes = texto.split(/(\[\[[^\]]+\]\])/g);
  return partes.map((p, i) => {
    const m = p.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]$/);
    if (!m) return p;
    return <Link key={i} to={m[1]} className="support-link">{m[2]}</Link>;
  });
}

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
  metodos: ['metodos', 'metodo', 'formas'],
  transferir: ['transferir', 'regalar', 'ceder', 'compartir', 'enviar'],
  reclamar: ['reclamar', 'aceptar', 'recibir'],
  merch: ['merch', 'merchandising', 'playera', 'sudadera', 'producto'],
  ruleta: ['ruleta', 'sorpresa', 'lucky', 'azar', 'asiento'],
  invitado: ['invitado', 'invitada', 'cuenta'],
  google: ['google', 'apple', 'social'],
  foto: ['foto', 'avatar', 'imagen', 'perfil'],
  historial: ['historial', 'historia', 'compras'],
  puntos: ['puntos', 'logros', 'insignia', 'recompensa'],
  puerta: ['puerta', 'entrada', 'ingreso']
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
  'como-entro-al-evento-con-mi-boleto',
  'puedo-transferir-mi-boleto-a-otra-persona'
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

      <div className="usupport-search" role="search">
        <span className="usupport-search-icon">
          <Icon name="search" size={16} />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar: pago, boletos, cuenta bloqueada…"
          aria-label="Buscar en preguntas frecuentes"
        />
        {query && (
          <button type="button" className="usupport-clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <section className="usupport-top" aria-label="Preguntas más útiles">
        <span className="usupport-top-label">Más útiles</span>
        <div className="usupport-top-row">
          {topUtiles.map(f => (
            <button key={f.slug} type="button" className="usupport-top-chip" onClick={() => irATop(f.slug)}>
              {f.pregunta}
            </button>
          ))}
        </div>
      </section>

      <section className="usupport-filters" aria-label="Filtrar por categoría">
        <span className="usupport-filters-label">Filtrar por tema</span>
        <div className="usupport-cats">
          {categorias.map(c => (
            <button
              key={c}
              type="button"
              className={`usupport-cat ${categoriaActiva === c ? 'active' : ''}`}
              aria-pressed={categoriaActiva === c}
              onClick={() => { setCategoriaActiva(c); setAbiertas(new Set()); setSearchParams({}); }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

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
                    <span className="usupport-q-text">{resaltar(it.pregunta, query)}</span>
                    <span className={`usupport-chev ${open ? 'rot' : ''}`}>
                      <Icon name="chevronDown" size={16} />
                    </span>
                  </button>
                  <div id={`ans-${id}`} className={`usupport-a-wrap ${open ? 'open' : ''}`}>
                    <div className="usupport-a-inner">
                      <p className="usupport-a">{renderRespuesta(it.respuesta)}</p>
                      {/* Pie de respuesta: feedback de utilidad + copiar link */}
                      <div className="usupport-feedback">
                        {!voto ? (
                          <div className="usupport-vote">
                            <span className="usupport-vote-label">¿Te sirvió esta respuesta?</span>
                            <div className="usupport-vote-btns">
                              <button type="button" className="usupport-pill" onClick={() => votar(id, 'util')}>Útil</button>
                              <button type="button" className="usupport-pill" onClick={() => votar(id, 'no')}>No útil</button>
                            </div>
                          </div>
                        ) : (
                          <p className="usupport-thanks">
                            Gracias por tu feedback. Votaste: <strong>{voto === 'util' ? 'ÚTIL' : 'NO ÚTIL'}</strong>
                          </p>
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
