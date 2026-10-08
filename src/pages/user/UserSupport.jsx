import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icons/Icons';
import './UserSupport.css';

const FAQS = [
  {
    categoria: 'Cuenta y seguridad',
    icon: 'shield',
    items: [
      {
        pregunta: '¿Cómo creo mi cuenta?',
        respuesta: 'Ve a [[/register|registro]], completa tus datos. Recibirás acceso inmediato a tu Bóveda LAIKA, logros e historial de compras.'
      },
      {
        pregunta: '¿Qué es la protección biométrica?',
        respuesta: 'Nuestra app LaikaMobil utiliza Face ID o huella dactilar para acceder a tu bóveda de boletos. Esto garantiza que solo tú puedas ver y usar tus accesos, incluso si pierdes tu celular.'
      },
      {
        pregunta: 'No puedo iniciar sesión, mi cuenta está bloqueada',
        respuesta: 'Por tu seguridad, tras múltiples intentos fallidos el sistema bloquea el acceso temporalmente para evitar ataques. Espera 15 minutos o restablece tu contraseña.'
      },
      {
        pregunta: '¿Puedo entrar con Google o Apple?',
        respuesta: 'Sí, la vinculación es automática si utilizas el mismo correo. Te recomendamos esta opción para un inicio de sesión más rápido y seguro.'
      }
    ]
  },
  {
    categoria: 'Boletos y Accesos',
    icon: 'ticket',
    items: [
      {
        pregunta: '¿Cómo funcionan los códigos QR?',
        respuesta: 'Utilizamos tecnología de códigos QR dinámicos antifraude. Tu código se actualiza constantemente, por lo que **las capturas de pantalla no funcionarán en la puerta**. Debes mostrarlo directamente desde la web o LaikaMobil.'
      },
      {
        pregunta: '¿Puedo ver mis boletos sin internet?',
        respuesta: 'Sí. Si descargas la app **LaikaMobil**, tus boletos se guardan en el dispositivo y pueden ser escaneados en puerta totalmente offline.'
      },
      {
        pregunta: '¿Puedo transferir o regalar un boleto?',
        respuesta: 'Sí, desde [[/user/tickets|Mis Boletos]] puedes generar un link seguro de transferencia. Si te equivocas de persona, puedes cancelar el envío siempre y cuando el destinatario aún no lo haya reclamado.'
      }
    ]
  },
  {
    categoria: 'Pagos y Facturación',
    icon: 'creditCard',
    items: [
      {
        pregunta: '¿Es seguro pagar en LAIKA Club?',
        respuesta: 'Totalmente. Tanto la web como LaikaMobil implementan "SSL Pinning" de grado bancario. Esto asegura que la comunicación entre tu dispositivo y nuestros servidores sea imposible de interceptar por terceros.'
      },
      {
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex). Los cobros aparecerán en tu estado de cuenta bajo el nombre "LAIKA CLUB".'
      },
      {
        pregunta: '¿Puedo solicitar factura (CFDI)?',
        respuesta: 'Sí. Una vez procesado tu pago, tienes hasta 30 días naturales para ingresar a tu historial de compras y generar tu factura electrónica con tus datos fiscales.'
      },
      {
        pregunta: 'Mi pago fue rechazado, ¿por qué?',
        respuesta: 'Generalmente sucede por bloqueos preventivos del banco. Intenta llamar a tu banco para autorizar compras en LAIKA, o utiliza otra tarjeta.'
      }
    ]
  },
  {
    categoria: 'Día del evento',
    icon: 'mapPin',
    items: [
      {
        pregunta: '¿Cómo es el proceso de entrada?',
        respuesta: 'Presenta el QR de tu boleto con el brillo alto. Nuestros operadores en puerta utilizan el sistema interno *Laika-Operador* que verifica la autenticidad del QR en milisegundos.'
      },
      {
        pregunta: '¿Qué pasa si intentan usar mi boleto dos veces?',
        respuesta: 'El sistema invalida el QR instantáneamente después del primer escaneo. Si alguien intenta ingresar con una copia o captura antigua de tu boleto, la terminal del operador marcará "Boleto ya utilizado" y denegará el acceso.'
      },
      {
        pregunta: '¿Puedo comprar merch del evento?',
        respuesta: 'Sí, durante el proceso de compra puedes añadir artículos exclusivos (playeras, gorras). Se entregarán en los módulos de merch el día del evento mostrando tu mismo código QR.'
      }
    ]
  },
  {
    categoria: 'Políticas y Reembolsos',
    icon: 'info',
    items: [
      {
        pregunta: '¿Qué pasa si el evento se cancela?',
        respuesta: 'Si el organizador cancela definitivamente, LAIKA procesará un reembolso automático del 100% a la tarjeta original en un plazo de 5 a 10 días hábiles.'
      },
      {
        pregunta: 'Me equivoqué al comprar, ¿hay devolución?',
        respuesta: 'Por política general no hay devoluciones por errores del comprador. Sin embargo, revisa la [[/info/devoluciones|Política de devoluciones]] de tu evento particular para conocer excepciones.'
      }
    ]
  }
];

// Convierte marcas [[ruta|texto visible]] en <Link> internos.
function renderRespuesta(texto) {
  const partes = texto.split(/(\[\[[^\]]+\]\])/g);
  return partes.map((p, i) => {
    const m = p.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]$/);
    if (!m) return p;
    return <Link key={i} to={m[1]} className="support-link">{m[2]}</Link>;
  });
}

const normalize = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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

function fuzzyScore(pregunta, respuesta, query) {
  const tokens = normalize(query).split(/\s+/).filter(t => t.length >= 2);
  if (!tokens.length) return 1;
  const hay = normalize(`${pregunta} ${respuesta}`);
  let ok = 0;
  tokens.forEach(t => { if (expande(t).some(v => hay.includes(v))) ok += 1; });
  return ok / tokens.length;
}

function resaltar(texto, query) {
  const tokens = normalize(query).split(/\s+/).filter(t => t.length >= 2);
  if (!tokens.length) return texto;
  const partes = texto.split(/(\s+)/);
  return partes.map((p, i) => {
    const n = normalize(p);
    const hit = tokens.some(t => expande(t).some(v => v.length >= 3 && n.includes(v)));
    return hit ? <mark key={i} className="support-mark">{p}</mark> : <span key={i}>{p}</span>;
  });
}

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

const DEFAULT_TOP = [
  'no-recibi-mis-boletos-donde-estan',
  'como-entro-al-evento-con-mi-boleto',
  'puedo-transferir-mi-boleto-a-otra-persona'
];

/* --- Componentes UI Reutilizables --- */

const SupportHero = ({ query, setQuery }) => (
  <section className="support-hero">
    <h1 className="support-hero-title">¿Cómo podemos ayudarte?</h1>
    <div className="support-search-wrapper">
      <Icon name="search" size={20} className="support-search-icon" />
      <input
        type="text"
        className="support-search-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar un tema, problema o pregunta..."
        aria-label="Buscar en preguntas frecuentes"
      />
      {query && (
        <button className="support-search-clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  </section>
);

const CategoryCard = ({ categoria, icon, isActive, onClick }) => (
  <button 
    className={`support-category-card ${isActive ? 'active' : ''}`}
    onClick={onClick}
    type="button"
  >
    <div className="support-category-icon">
      <Icon name={icon} size={28} />
    </div>
    <span className="support-category-name">{categoria}</span>
  </button>
);

const FaqItem = ({ item, query, isOpen, toggle, votar, voto, copiarRespuesta, copiado }) => (
  <div className={`support-faq-item ${isOpen ? 'open' : ''}`}>
    <button 
      type="button" 
      className="support-faq-question" 
      onClick={() => toggle(item.slug)}
      aria-expanded={isOpen}
    >
      <span className="support-faq-text">{resaltar(item.pregunta, query)}</span>
      <span className="support-faq-icon">
        <Icon name="chevronDown" size={20} />
      </span>
    </button>
    <div className="support-faq-answer-wrapper">
      <div className="support-faq-answer-inner">
        <p className="support-faq-answer-text">{renderRespuesta(item.respuesta)}</p>
        <div className="support-faq-feedback">
          {!voto ? (
            <div className="support-vote-section">
              <span className="support-vote-label">¿Te fue útil esta respuesta?</span>
              <div className="support-vote-btns">
                <button type="button" className="support-vote-btn" onClick={() => votar(item.slug, 'util')}>Sí</button>
                <button type="button" className="support-vote-btn" onClick={() => votar(item.slug, 'no')}>No</button>
              </div>
            </div>
          ) : (
            <span className="support-vote-thanks">
              Gracias por tu feedback.
            </span>
          )}
          <button type="button" className="support-copy-btn" onClick={() => copiarRespuesta(item.slug, item.respuesta)}>
            <Icon name="copy" size={14} />
            {copiado === item.slug ? 'Respuesta copiada' : 'Copiar respuesta'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function UserSupport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [abiertas, setAbiertas] = useState(() => new Set());
  const [votos, setVotos] = useState(leerVotos);
  const [ticketMsg, setTicketMsg] = useState('');
  const [copiado, setCopiado] = useState(null);

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
    setTimeout(() => {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }, 100);
  };

  const expandirTodo = () => {
    const ids = resultados.flatMap(g => g.items.map(it => it.slug));
    setAbiertas(new Set(ids));
  };

  const colapsarTodo = () => {
    setAbiertas(new Set());
    setSearchParams({});
  };

  const votar = (slug, valor) => {
    setVotos(prev => {
      const next = { ...prev, [slug]: valor };
      try { localStorage.setItem(VOTOS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const copiarRespuesta = async (slug, texto) => {
    // Eliminar las marcas de enlace interno [[ruta|texto]] para copiar texto limpio
    const textoLimpio = texto.replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1');
    try { await navigator.clipboard.writeText(textoLimpio); } catch {}
    setCopiado(slug);
    setTimeout(() => setCopiado(null), 2000);
  };

  // Acciones: Eliminada la simulación, ahora utiliza directamente un mailto real.

  return (
    <div className="support-wrapper">
      
      <SupportHero query={query} setQuery={setQuery} />

      {!query && (
        <>
          <section className="support-categories-grid">
            {FAQS.map(g => (
              <CategoryCard 
                key={g.categoria}
                categoria={g.categoria}
                icon={g.icon}
                isActive={categoriaActiva === g.categoria}
                onClick={() => setCategoriaActiva(prev => prev === g.categoria ? 'Todas' : g.categoria)}
              />
            ))}
          </section>

          {categoriaActiva === 'Todas' && (
            <section className="support-top-articles">
              <h2 className="support-section-title">Artículos destacados</h2>
              <div className="support-top-grid">
                {topUtiles.map(f => (
                  <button key={f.slug} className="support-top-card" onClick={() => irATop(f.slug)}>
                    <span className="support-top-card-text">{f.pregunta}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="support-content">
        {(query || categoriaActiva !== 'Todas') && (
          <div className="support-tools-row">
            <span className="support-tools-count">
              {totalRespuestas} {totalRespuestas === 1 ? 'resultado' : 'resultados'} {query && `para "${query}"`}
            </span>
            <div className="support-tools-actions">
              <button className="support-tool-btn" onClick={expandirTodo}>Expandir todo</button>
              <button className="support-tool-btn" onClick={colapsarTodo}>Colapsar</button>
            </div>
          </div>
        )}

        {resultados.length === 0 ? (
          <div className="support-empty">
            <Icon name="search" size={48} />
            <p>No encontramos resultados para "{query}".</p>
          </div>
        ) : (
          resultados.map(grupo => (
            <div key={grupo.categoria} className="support-faq-group">
              <h2 className="support-faq-group-title">{grupo.categoria}</h2>
              <div className="support-faq-list">
                {grupo.items.map(it => (
                  <FaqItem 
                    key={it.slug}
                    item={it}
                    query={query}
                    isOpen={abiertas.has(it.slug)}
                    toggle={toggle}
                    votar={votar}
                    voto={votos[it.slug]}
                    copiarRespuesta={copiarRespuesta}
                    copiado={copiado}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="support-cta-box">
        <h3>¿Aún necesitas ayuda?</h3>
        <p>Si no encontraste la respuesta que buscabas, escríbenos directamente y te ayudaremos lo antes posible.</p>
        <div className="support-cta-buttons">
          <a 
            href="mailto:redjar481@gmail.com?subject=Solicitud%20de%20Soporte%20-%20LAIKA%20Club" 
            className="support-btn primary"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Enviar correo de soporte
          </a>
        </div>
      </div>
      
    </div>
  );
}

