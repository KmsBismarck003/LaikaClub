/**
 * MerchandiseSalesInsights.jsx
 * ─────────────────────────────────────────────────────────────────
 * Componente: Inteligencia de Ventas de Mercancía
 * Muestra qué productos se venden más, cuáles no, y qué hacer.
 * Todo en lenguaje simple y accionable para el administrador.
 */

import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../../services/miscService';
import { ShoppingBag, TrendingUp, TrendingDown, Package, Lightbulb, RefreshCw, Calendar } from 'lucide-react';

// ── Colores de tipo de recomendación ──────────────────────────────
const TYPE_STYLES = {
  success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', badge: '#dcfce7', badgeTxt: '#166534' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706', badge: '#fef3c7', badgeTxt: '#92400e' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', badge: '#dbeafe', badgeTxt: '#1e40af' },
};

// ── Barra de progreso visual ──────────────────────────────────────
const ProgressBar = ({ value, max, color = '#111827' }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ background: '#f1f5f9', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
};

// ── Tarjeta de producto ───────────────────────────────────────────
const ProductCard = ({ product, maxUnits, isTop }) => (
  <div style={{
    background: isTop ? '#fafafa' : '#fff',
    border: `1px solid ${isTop ? '#e5e7eb' : '#f0f0f0'}`,
    borderRadius: 14,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'box-shadow 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', lineHeight: 1.3, flex: 1 }}>
        {isTop && product.rank && (
          <span style={{ color: product.rank === 1 ? '#d97706' : '#6b7280', marginRight: 4 }}>
            #{product.rank}
          </span>
        )}
        {product.name}
      </span>
      {product.badge && (
        <span style={{ fontSize: '0.6rem', fontWeight: 700, background: '#111827', color: '#fff', padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap' }}>
          {product.badge}
        </span>
      )}
    </div>

    <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: '#475569' }}>
      <span><b style={{ color: '#111827' }}>{(product.units || 0).toLocaleString()}</b> Pzs</span>
      <span><b style={{ color: '#111827' }}>${(product.revenue || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</b> MXN</span>
    </div>

    <ProgressBar value={product.units || 0} max={maxUnits} color={isTop ? '#111827' : '#d1d5db'} />

    {product.action && (
      <p style={{ margin: '6px 0 0 0', fontSize: '0.68rem', color: '#64748b', lineHeight: 1.4, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
        {product.action}
      </p>
    )}
  </div>
);

// ── Tarjeta de recomendación ──────────────────────────────────────
const RecommendationCard = ({ rec }) => {
  const s = TYPE_STYLES[rec.type] || TYPE_STYLES.info;
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 16,
      padding: '16px 18px',
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    }}>
      {rec.icon && <div style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>{rec.icon}</div>}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>{rec.title}</h4>
          {rec.tag && (
            <span style={{ fontSize: '0.58rem', fontWeight: 700, background: s.badge, color: s.badgeTxt, padding: '2px 7px', borderRadius: 99 }}>
              {rec.tag}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#374151', lineHeight: 1.65 }}>{rec.body}</p>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────
const MerchandiseSalesInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState('recommendations'); // recommendations | products | categories

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsAPI.getMerchSalesInsights(dateFrom || null, dateTo || null);
      setData(result);
    } catch (e) {
      setError('No se pudo conectar con el motor de análisis. Verifica que el servicio esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const maxTopUnits = data?.top_products?.[0]?.units || 1;
  const maxLowUnits = Math.max(...(data?.low_products?.map(p => p.units || 0) || [1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem 0' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.4rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#111827', color: '#fff', padding: 10, borderRadius: 14, display: 'flex' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              ¿Qué te está dejando más dinero tu tienda?
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Análisis de ventas de mercancía · Recomendaciones automáticas basadas en tus datos reales
            </p>
          </div>
        </div>

        {/* Filtros de fecha + botón */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '6px 10px' }}>
            <Calendar size={13} color="#64748b" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#334155', outline: 'none' }} />
            <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#334155', outline: 'none' }} />
          </div>
          <button onClick={load} disabled={loading} style={{
            background: '#111827', color: '#fff', border: 'none', borderRadius: 12,
            padding: '8px 16px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Analizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* ── ERROR ──────────────────────────────────────────── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 16, padding: '1rem 1.4rem', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* ── LOADING ────────────────────────────────────────── */}
      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          Consultando tus ventas de mercancía...
        </div>
      )}

      {/* ── TARJETAS RESUMEN ───────────────────────────────── */}
      {data?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Productos analizados', value: data.summary.total_products_analyzed, icon: <Package size={16} />, color: '#6366f1' },
            { label: 'Unidades vendidas', value: (data.summary.total_units_sold || 0).toLocaleString(), icon: <TrendingUp size={16} />, color: '#10b981' },
            { label: 'Ingresos totales', value: `$${(data.summary.total_revenue || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, icon: <ShoppingBag size={16} />, color: '#f59e0b' },
            { label: 'Promedio por orden', value: `$${(data.summary.avg_per_order || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, icon: <TrendingDown size={16} />, color: '#3b82f6' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: m.color }}>
                {m.icon}
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABS ───────────────────────────────────────────── */}
      {data && (
        <>
          <div style={{ display: 'flex', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 4, width: 'fit-content' }}>
            {[
              { id: 'recommendations', label: 'Qué hacer', icon: <Lightbulb size={13} /> },
              { id: 'products', label: 'Por producto', icon: <Package size={13} /> },
              { id: 'categories', label: 'Por categoría', icon: <TrendingUp size={13} /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.73rem',
                background: activeTab === tab.id ? '#111827' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: RECOMENDACIONES ─────────────────────────── */}
          {activeTab === 'recommendations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recommendations?.length > 0
                ? data.recommendations.map((rec, i) => <RecommendationCard key={i} rec={rec} />)
                : <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No hay datos suficientes para generar recomendaciones. Registra ventas de mercancía primero.
                  </div>
              }
            </div>
          )}

          {/* ── TAB: PRODUCTOS ───────────────────────────────── */}
          {activeTab === 'products' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* Estrellas */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.2rem 1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid #f1f5f9' }}>
                  <TrendingUp size={16} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>Los más vendidos</h3>
                  <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 99 }}>TOP {data.top_products?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.top_products?.length > 0
                    ? data.top_products.map((p, i) => <ProductCard key={i} product={p} maxUnits={maxTopUnits} isTop />)
                    : <p style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center', padding: '1rem 0' }}>Sin datos suficientes</p>
                  }
                </div>
              </div>

              {/* Dormidos */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.2rem 1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid #f1f5f9' }}>
                  <TrendingDown size={16} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>Necesitan un empujón</h3>
                  <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 99 }}>
                    {data.low_products?.length || 0} productos
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.low_products?.length > 0
                    ? data.low_products.map((p, i) => <ProductCard key={i} product={p} maxUnits={maxLowUnits} isTop={false} />)
                    : <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#10b981', fontSize: '0.82rem', fontWeight: 700 }}>
                        Todos tus productos tienen ventas saludables
                      </div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: CATEGORÍAS ──────────────────────────────── */}
          {activeTab === 'categories' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '1.2rem 1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 800, color: '#111827', paddingBottom: '0.6rem', borderBottom: '1px solid #f1f5f9' }}>
                Ingresos por categoría de producto
              </h3>
              {data.category_insights?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.category_insights.map((cat, i) => {
                    const maxRev = data.category_insights[0]?.revenue || 1;
                    const pct = Math.round((cat.revenue / maxRev) * 100);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>{cat.category}</span>
                          <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: '#64748b' }}>
                            <span><b style={{ color: '#111827' }}>{cat.units}</b> Pzs</span>
                            <span><b style={{ color: '#111827' }}>${cat.revenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</b> MXN</span>
                            <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : '#64748b' }}>{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar value={cat.revenue} max={maxRev} color={i === 0 ? '#111827' : '#94a3b8'} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  Sin datos de categorías para mostrar.
                </p>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MerchandiseSalesInsights;
