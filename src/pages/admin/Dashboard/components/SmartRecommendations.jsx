import React, { useEffect } from 'react';
import {
  Brain, TrendingUp, GitBranch, Layers, Network, BarChart2,
  Lightbulb, AlertTriangle, CheckCircle, Info, Clock, Target,
  Zap, ArrowUpRight, ArrowDownRight, Minus, Activity, RefreshCw, Loader
} from 'lucide-react';
import { useRecommendations } from '../hooks/useRecommendations';
import './SmartRecommendations.css';

/* ══════════════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════════ */
const MiniBar = ({ value, max, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 6, height: 6, width: '100%', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.6s ease' }} />
  </div>
);

const Tag = ({ label, color = '#3b82f6', bg = '#eff6ff' }) => (
  <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: bg, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
    {label}
  </span>
);

const Stat = ({ label, value, sub, accent }) => (
  <div className="rec-card__stat">
    <span className="rec-card__stat-label">{label}</span>
    <span className="rec-card__stat-value" style={accent ? { color: accent } : {}}>{value}</span>
    {sub && <span style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{sub}</span>}
  </div>
);

const TrendIcon = ({ val }) => {
  if (val > 0) return <ArrowUpRight size={14} color="#10b981" />;
  if (val < 0) return <ArrowDownRight size={14} color="#ef4444" />;
  return <Minus size={14} color="#9ca3af" />;
};

/* ══════════════════════════════════════════════════════════════
   TARJETAS POR MODO DE ANÁLISIS
══════════════════════════════════════════════════════════════ */

/* ──── COMPONENTES DE SOPORTE PARA SQL ──────────────────────── */
const MaintenanceFromSQL = ({ data }) => {
  if (!data) return null;
  const safeHours = data.safe_hours || [];
  return (
    <div className="rec-card rec-card--info">
      <div className="rec-card__header">
        <Clock size={22} color="#3b82f6" />
        <div>
          <h3 className="rec-card__title">Ventana de Mantenimiento</h3>
          <Tag label="DATOS SQLITE" />
        </div>
      </div>
      <p className="rec-card__text" style={{fontSize: '0.75rem'}}>{data.recommendation}</p>
      <div className="rec-card__stats-row">
        <Stat label="Hora Valle" value={`${data.valley_hour}:00`} accent="#10b981" />
        <Stat label="Ventana" value={`${safeHours[0]}:00 - ${safeHours[safeHours.length-1]+1}:00`} />
      </div>
    </div>
  );
};

/* ──── 2D EXPLORACIÓN ─────────────────────────────────────── */
const ExplorationInsights = ({ canonicalData, sqlRecs }) => {
  if (!canonicalData || canonicalData.length === 0) return null;

  const values   = canonicalData.map(d => d.val_num || 0);
  const total    = values.reduce((a, b) => a + b, 0);
  const avg      = total / values.length;
  const max      = Math.max(...values);
  const maxItem  = canonicalData.find(d => d.val_num === max);
  const stdDev   = Math.sqrt(values.map(v => (v - avg) ** 2).reduce((a,b) => a+b, 0) / values.length);
  const cv       = ((stdDev / avg) * 100).toFixed(1);

  return (
    <div className="smart-recs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {/* 1. MÉTRICAS CLAVE (INFO) */}
      <div className="rec-card rec-card--info">
        <div className="rec-card__header">
          <Activity size={20} color="#3b82f6" />
          <h3 className="rec-card__title">Métricas de Volumen</h3>
        </div>
        <div className="rec-card__stats-row" style={{ marginTop: '0.5rem' }}>
          <Stat label="Total Global" value={`$${total.toLocaleString()}`} accent="#000" />
          <Stat label="Ticket Prom." value={`$${avg.toFixed(0)}`} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Coeficiente de Variación</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: cv > 50 ? '#ef4444' : '#10b981' }}>{cv}%</span>
          </div>
          <MiniBar value={cv} max={100} color={cv > 50 ? '#ef4444' : '#3b82f6'} />
        </div>
      </div>

      {/* 2. ESTRATEGIA IA (ESTILO UNIFICADO CON ACENTO) */}
      <div className="rec-card rec-card--ai">
        <div className="rec-card__header">
          <div className="rec-card__icon" style={{ color: '#8b5cf6' }}>
            <Brain size={20} />
          </div>
          <h3 className="rec-card__title">ESTRATEGIA IA</h3>
          <span className="rec-card__badge rec-card__badge--ai">MÉTODO: BI</span>
        </div>
        <p className="rec-card__text" style={{ color: '#4b5563', fontWeight: 500 }}>
          {cv > 50 
            ? `Detectamos alta dependencia en "${maxItem?.producto}". Riesgo de rentabilidad si el stock fluctúa.`
            : `Flujo estable detectado. Datos óptimos para predicciones de alta fidelidad.`}
        </p>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
          Basado en histórico actual.
        </div>
      </div>


      {/* 4. IMPACTO (CHART) */}
      <div className="rec-card rec-card--warning">
        <div className="rec-card__header">
          <TrendingUp size={20} color="#f59e0b" />
          <h3 className="rec-card__title">Impacto Estimado</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, marginBottom: '2px' }}>
              <span>CONVERSIÓN</span>
              <span color="#10b981">+12.4%</span>
            </div>
            <MiniBar value={85} max={100} color="#10b981" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, marginBottom: '2px' }}>
              <span>RETORNO (ROI)</span>
              <span>4.2x</span>
            </div>
            <MiniBar value={60} max={100} color="#f59e0b" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──── REGRESIÓN ML ───────────────────────────────────────── */
const RegressionInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Regresión ML" />;

  const r2    = mlData.r2_score ?? mlData.score ?? mlData.metrics?.r2 ?? null;
  const rmse  = mlData.rmse ?? mlData.metrics?.rmse ?? null;
  const coefArr = mlData.coefficients ?? mlData.coef ?? [];
  const preds = mlData.predictions ?? mlData.y_pred ?? [];
  const actuals = mlData.actuals ?? mlData.y_test ?? [];

  const r2Pct   = r2 != null ? (r2 * 100).toFixed(1) : null;
  const quality = r2 == null ? 'sin datos' : r2 >= 0.9 ? 'Excelente' : r2 >= 0.75 ? 'Bueno' : r2 >= 0.5 ? 'Moderado' : 'Bajo';
  const qualityColor = r2 == null ? '#9ca3af' : r2 >= 0.9 ? '#10b981' : r2 >= 0.75 ? '#3b82f6' : r2 >= 0.5 ? '#f59e0b' : '#ef4444';

  const sortedCoef = [...coefArr].sort((a,b) => Math.abs(b.coef ?? b.value ?? b) - Math.abs(a.coef ?? a.value ?? a));
  const maxCoef = sortedCoef.length > 0 ? Math.abs(sortedCoef[0].coef ?? sortedCoef[0].value ?? sortedCoef[0]) : 1;

  return (
    <div className="smart-recs-grid">
      {/* Score del modelo */}
      <div className="rec-card rec-card--info">
        <div className="rec-card__header">
          <TrendingUp size={22} color="#3b82f6" />
          <div>
            <h3 className="rec-card__title">Rendimiento del Modelo</h3>
            <Tag label="REGRESIÓN ML" color="#1d4ed8" bg="#eff6ff" />
          </div>
          <Activity size={15} color="#3b82f6" />
        </div>
        <div className="rec-card__stats-row">
          {r2Pct != null && <Stat label="R² Score" value={`${r2Pct}%`} sub={quality} accent={qualityColor} />}
          {rmse   != null && <Stat label="RMSE" value={rmse.toFixed ? rmse.toFixed(2) : rmse} sub="Error medio" />}
          <Stat label="Predicciones" value={preds.length > 0 ? preds.length : (mlData.sample_size ?? '—')} sub="puntos calculados" />
        </div>
        <div style={{ margin: '0.75rem 0 0.5rem', height: 4, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: r2Pct ? `${r2Pct}%` : '0%', background: qualityColor, borderRadius: 4, transition: 'width 0.8s ease' }} />
        </div>
        <p className="rec-card__insight">
          <Lightbulb size={12} style={{marginRight:5}} />
          {r2 == null
            ? 'El backend no retornó métricas. Verifica que el endpoint de Regresión esté devolviendo r2_score.'
            : r2 >= 0.9
              ? `Modelo de alta precisión (R²=${r2Pct}%). Puedes usar estas predicciones para planificar inventario y precios con confianza.`
              : r2 >= 0.75
                ? `Buen modelo (R²=${r2Pct}%). Agrega más features o limpia outliers para superar el 90%.`
                : `Modelo débil (R²=${r2Pct}%). Considera usar el Árbol de Decisión o la Red Neuronal para este dataset.`}
        </p>
      </div>

      {/* Importancia de variables */}
      {sortedCoef.length > 0 && (
        <div className="rec-card rec-card--success">
          <div className="rec-card__header">
            <Zap size={22} color="#10b981" />
            <div>
              <h3 className="rec-card__title">Variables Más Influyentes</h3>
              <Tag label="COEFICIENTES" color="#065f46" bg="#f0fdf4" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {sortedCoef.slice(0,5).map((c, i) => {
              const coefVal = c.coef ?? c.value ?? c;
              const name    = c.feature ?? c.name ?? `Variable ${i+1}`;
              const isPos   = coefVal >= 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TrendIcon val={coefVal} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 3 }}>{name}</div>
                    <MiniBar value={Math.abs(coefVal)} max={maxCoef} color={isPos ? '#10b981' : '#ef4444'} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: isPos ? '#10b981' : '#ef4444' }}>
                    {isPos ? '+' : ''}{typeof coefVal === 'number' ? coefVal.toFixed(3) : coefVal}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="rec-card__insight" style={{marginTop: '0.75rem'}}>
            <Lightbulb size={12} style={{marginRight:5}} />
            Las variables con coeficiente positivo impulsan el resultado. Prioriza "{sortedCoef[0]?.feature ?? sortedCoef[0]?.name ?? 'Variable 1'}" para maximizar el impacto.
          </p>
        </div>
      )}
    </div>
  );
};

/* ──── ÁRBOL DE DECISIÓN ──────────────────────────────────── */
const DecisionTreeInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Árbol de Decisión" />;

  const acc      = mlData.accuracy ?? mlData.metrics?.accuracy ?? null;
  const accPct   = acc != null ? (acc * 100).toFixed(1) : null;
  const rules    = mlData.rules ?? mlData.decision_rules ?? mlData.paths ?? [];
  const features = mlData.feature_importances ?? mlData.feature_importance ?? [];
  const depth    = mlData.tree_depth ?? mlData.max_depth ?? mlData.depth ?? null;
  const classes  = mlData.classes ?? mlData.class_names ?? [];

  const sortedFeat = [...features].sort((a,b) => (b.importance ?? b) - (a.importance ?? a));
  const maxFeat    = sortedFeat.length > 0 ? (sortedFeat[0].importance ?? sortedFeat[0]) : 1;

  const qualityColor = acc == null ? '#9ca3af' : acc >= 0.9 ? '#10b981' : acc >= 0.75 ? '#3b82f6' : acc >= 0.5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="smart-recs-grid">
      {/* Métricas del árbol */}
      <div className="rec-card rec-card--warning">
        <div className="rec-card__header">
          <GitBranch size={22} color="#f59e0b" />
          <div>
            <h3 className="rec-card__title">Rendimiento del Árbol</h3>
            <Tag label="ÁRBOL DE DECISIÓN" color="#b45309" bg="#fffbeb" />
          </div>
          <Activity size={15} color="#f59e0b" />
        </div>
        <div className="rec-card__stats-row">
          {accPct != null && <Stat label="Precisión" value={`${accPct}%`} accent={qualityColor} />}
          {depth  != null && <Stat label="Profundidad" value={depth} sub="niveles del árbol" />}
          {classes.length > 0 && <Stat label="Clases" value={classes.length} sub="categorías" />}
        </div>
        <p className="rec-card__insight">
          <Lightbulb size={12} style={{marginRight:5}} />
          {acc == null
            ? 'Sin métricas de precisión. Asegúrate que el backend devuelve accuracy en la respuesta del árbol.'
            : acc >= 0.85
              ? `El árbol clasifica con ${accPct}% de precisión. Las reglas son confiables para toma de decisiones automatizada.`
              : `Precisión de ${accPct}%. Ajusta la profundidad máxima o usa más datos de entrenamiento para mejorar.`}
        </p>
      </div>

      {/* Importancia de features */}
      {sortedFeat.length > 0 && (
        <div className="rec-card rec-card--info">
          <div className="rec-card__header">
            <Target size={22} color="#3b82f6" />
            <div>
              <h3 className="rec-card__title">Variables Clave de Decisión</h3>
              <Tag label="FEATURE IMPORTANCE" color="#1d4ed8" bg="#eff6ff" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {sortedFeat.slice(0,5).map((f, i) => {
              const imp  = f.importance ?? f;
              const name = f.feature ?? f.name ?? `Feature ${i+1}`;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: '0.72rem', color: i === 0 ? '#f59e0b' : '#6b7280', minWidth: 18 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: 3 }}>{name}</div>
                    <MiniBar value={imp} max={maxFeat} color="#f59e0b" />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>{(imp * 100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reglas de decisión */}
      {rules.length > 0 && (
        <div className="rec-card rec-card--success" style={{ gridColumn: '1 / -1' }}>
          <div className="rec-card__header">
            <Lightbulb size={22} color="#10b981" />
            <div>
              <h3 className="rec-card__title">Reglas de Decisión Extraídas</h3>
              <Tag label="ÁRBOL → REGLAS DE NEGOCIO" color="#065f46" bg="#f0fdf4" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {rules.slice(0,4).map((rule, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                <code style={{ fontSize: '0.72rem', color: '#374151', fontFamily: 'monospace', lineHeight: 1.5 }}>
                  {typeof rule === 'string' ? rule : JSON.stringify(rule)}
                </code>
              </div>
            ))}
          </div>
          <p className="rec-card__insight" style={{marginTop:'0.75rem'}}>
            <Lightbulb size={12} style={{marginRight:5}} />
            Estas reglas pueden implementarse como condiciones de negocio automáticas. Usa la primera variable ({sortedFeat[0]?.feature ?? 'principal'}) como punto de partida para segmentación.
          </p>
        </div>
      )}
    </div>
  );
};

/* ──── CLASIFICACIÓN (PCA + K-MEANS HUMANIZADO) ────────────── */
const PCAInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Clasificación de Fans" />;

  const clusters    = mlData.clusters ?? mlData.cluster_info ?? mlData.cluster_summary ?? [];
  const explained   = mlData.explained_variance ?? mlData.variance_ratio ?? mlData.pca_variance ?? null;
  const nClusters   = mlData.n_clusters ?? clusters.length ?? null;
  const silhouette  = mlData.silhouette_score ?? mlData.silhouette ?? null;

  const explPct = explained
    ? (Array.isArray(explained) ? explained.reduce((a,b) => a+b, 0) * 100 : explained * 100).toFixed(1)
    : null;

  return (
    <div className="smart-recs-grid">
      {/* Métricas Humanizadas */}
      <div className="rec-card rec-card--info">
        <div className="rec-card__header">
          <Layers size={22} color="#3b82f6" />
          <div>
            <h3 className="rec-card__title">Calidad de los Perfiles</h3>
            <Tag label="IA DE SEGMENTACIÓN" color="#1d4ed8" bg="#eff6ff" />
          </div>
        </div>
        <div className="rec-card__stats-row">
          {nClusters   != null && <Stat label="Tipos de Fans" value={nClusters} accent="#3b82f6" />}
          {explPct     != null && <Stat label="Fidelidad" value={`${explPct}%`} accent={parseFloat(explPct) >= 80 ? '#10b981' : '#f59e0b'} sub="nivel de certeza" />}
          {silhouette  != null && <Stat label="Precisión" value={`${(silhouette * 100).toFixed(0)}%`} sub="confiabilidad" />}
        </div>
        <p className="rec-card__insight">
          <Lightbulb size={12} style={{marginRight:5}} />
          {explPct == null
            ? 'La IA está clasificando a tus clientes...'
            : parseFloat(explPct) >= 80
              ? `Excelente nivel de certeza. Puedes confiar en estos ${nClusters ?? '?'} perfiles para diseñar tus promociones y pautas publicitarias.`
              : `La IA encontró ${nClusters ?? '?'} tipos de fans, pero los patrones son un poco difusos. Intenta con un periodo de ventas mayor.`}
        </p>
      </div>

      {/* Descripción de clusters */}
      {clusters.length > 0 && (
        <div className="rec-card rec-card--success">
          <div className="rec-card__header">
            <Target size={22} color="#10b981" />
            <div>
              <h3 className="rec-card__title">Perfiles de Compradores</h3>
              <Tag label="LISTOS PARA MARKETING" color="#065f46" bg="#f0fdf4" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {clusters.map((cl, i) => {
              const size  = cl.size ?? cl.count ?? cl.n ?? null;
              const label = cl.label ?? cl.name ?? `Perfil ${i+1}`;
              const cent  = cl.centroid_summary ?? cl.centroid ?? null;
              return (
                <div key={i} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#0a0a0a' }}>{label}</span>
                    {size != null && <Tag label={`${size} fans activos`} color="#1d4ed8" bg="#eff6ff" />}
                  </div>
                  {cent && <p style={{ fontSize: '0.68rem', color: '#6b7280', margin: 0 }}>{typeof cent === 'string' ? cent : JSON.stringify(cent).slice(0, 80) + '...'}</p>}
                </div>
              );
            })}
          </div>
          <p className="rec-card__insight" style={{marginTop:'0.75rem'}}>
            <Lightbulb size={12} style={{marginRight:5}} />
            Utiliza estos grupos para enviar emails masivos con ofertas que realmente le interesen a cada tipo de cliente.
          </p>
        </div>
      )}
    </div>
  );
};

/* ──── OPTIMIZACIÓN (ELBOW METHOD HUMANIZADO) ─────────────── */
const ElbowInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Optimización de Segmentos" />;

  const optimalK = mlData.optimal_k ?? null;
  const summary = mlData.summary ?? "Calculando segmentos ideales...";

  return (
    <div className="smart-recs-grid">
      <div className="rec-card rec-card--success" style={{ gridColumn: '1 / -1' }}>
        <div className="rec-card__header">
          <Target size={22} color="#10b981" />
          <div>
            <h3 className="rec-card__title">Recomendación del Algoritmo</h3>
            <Tag label="ESTRATEGIA INTELIGENTE" color="#065f46" bg="#f0fdf4" />
          </div>
        </div>
        <div className="rec-card__stats-row" style={{ marginTop: '1rem' }}>
          {optimalK != null && <Stat label="Grupos Ideales a Crear" value={optimalK} accent="#10b981" />}
        </div>
        <p className="rec-card__insight" style={{marginTop:'0.75rem'}}>
          <Lightbulb size={12} style={{marginRight:5}} />
          {summary}
          <br/><br/>
          <strong>¿Qué significa esto?</strong> En lugar de adivinar cuántos tipos de clientes tienes, la Inteligencia Artificial analizó matemáticamente la diferencia en el gasto de tus compradores y sugiere dividirlos exactamente en {optimalK} perfiles. Con esto asegurarás que cada grupo sea lo suficientemente único para lanzar campañas exitosas.
        </p>
      </div>
    </div>
  );
};

/* ──── ANTI-BOT (ISOLATION FOREST HUMANIZADO) ─────────────── */
const AnomalyInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Seguridad Anti-Bot" />;

  const anomalies = mlData.anomalies ?? [];
  const totalAnalyzed = mlData.total_users_analyzed ?? 0;
  
  return (
    <div className="smart-recs-grid">
      <div className="rec-card rec-card--warning" style={{ gridColumn: '1 / -1' }}>
        <div className="rec-card__header">
          <AlertTriangle size={22} color="#ef4444" />
          <div>
            <h3 className="rec-card__title">Alerta de Cuentas Sospechosas</h3>
            <Tag label="INTELIGENCIA ANTI-REVENTA" color="#991b1b" bg="#fef2f2" />
          </div>
        </div>
        <div className="rec-card__stats-row" style={{ marginTop: '1rem' }}>
          <Stat label="Cuentas Revisadas" value={totalAnalyzed} />
          <Stat label="Bloqueos Recomendados" value={anomalies.length} accent="#ef4444" />
        </div>
        
        {anomalies.length > 0 ? (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {anomalies.slice(0, 5).map((anom, idx) => (
              <div key={idx} style={{ padding: '10px 14px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#7f1d1d' }}>{anom.name} ({anom.email})</span>
                  <Tag label="Riesgo de Reventa" color="#ef4444" bg="#fee2e2" />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', lineHeight: 1.4 }}>
                  Adquirió <strong>{anom.total_tickets} boletos</strong> para {anom.distinct_events} eventos diferentes, invirtiendo <strong>${anom.total_spent.toLocaleString()}</strong>.
                  Este comportamiento es irreal para un humano y coincide con el patrón de granjas de bots o revendedores.
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rec-card__insight" style={{marginTop:'0.75rem'}}>
            <CheckCircle size={12} color="#10b981" style={{marginRight:5}} />
            <strong>Tu plataforma está protegida.</strong> El escáner de IA no encontró comportamientos de reventa o bots masivos en tu base de clientes actual.
          </p>
        )}
      </div>
    </div>
  );
};

/* ──── RED NEURONAL ───────────────────────────────────────── */
const NeuralNetworkInsights = ({ mlData }) => {
  if (!mlData) return <EmptyState mode="Red Neuronal" />;

  const acc      = mlData.accuracy ?? mlData.val_accuracy ?? mlData.metrics?.accuracy ?? null;
  const loss     = mlData.loss ?? mlData.val_loss ?? mlData.metrics?.loss ?? null;
  const epochs   = mlData.epochs_trained ?? mlData.epochs ?? null;
  const history  = mlData.history ?? mlData.training_history ?? null;
  const arch     = mlData.architecture ?? mlData.layers ?? null;
  const testAcc  = mlData.test_accuracy ?? acc;

  const accPct   = acc != null ? (acc > 1 ? acc.toFixed(1) : (acc * 100).toFixed(1)) : null;
  const qualityColor = acc == null ? '#9ca3af' : (acc > 1 ? acc : acc * 100) >= 90 ? '#10b981' : (acc > 1 ? acc : acc * 100) >= 75 ? '#3b82f6' : '#f59e0b';

  // Extraer curva de entrenamiento si existe
  const trainAcc  = history?.accuracy ?? history?.acc ?? [];
  const valAcc    = history?.val_accuracy ?? history?.val_acc ?? [];
  const lastEpoch = Math.max(trainAcc.length, valAcc.length, epochs ?? 0);
  const overfit   = trainAcc.length > 0 && valAcc.length > 0
    ? trainAcc[trainAcc.length-1] - valAcc[valAcc.length-1]
    : null;

  return (
    <div className="smart-recs-grid">
      {/* Métricas de entrenamiento */}
      <div className="rec-card rec-card--info">
        <div className="rec-card__header">
          <Network size={22} color="#8b5cf6" />
          <div>
            <h3 className="rec-card__title">Entrenamiento de la Red</h3>
            <Tag label="RED NEURONAL" color="#6d28d9" bg="#f5f3ff" />
          </div>
          <Activity size={15} color="#8b5cf6" />
        </div>
        <div className="rec-card__stats-row">
          {accPct  != null && <Stat label="Precisión Final" value={`${accPct}%`} accent={qualityColor} />}
          {loss    != null && <Stat label="Loss Final" value={typeof loss === 'number' ? loss.toFixed(4) : loss} sub="cross-entropy" />}
          {lastEpoch > 0  && <Stat label="Épocas" value={lastEpoch} />}
        </div>
        {accPct != null && (
          <div style={{ margin: '0.75rem 0 0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#9ca3af', marginBottom: 4 }}>
              <span>Precisión de entrenamiento</span><span>{accPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${accPct}%`, background: qualityColor, borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
          </div>
        )}
        <p className="rec-card__insight">
          <Lightbulb size={12} style={{marginRight:5}} />
          {acc == null
            ? 'El backend no devuelve métricas de la red. Verifica que el endpoint /neural-network retorne accuracy y loss.'
            : overfit != null && overfit > 0.1
              ? `Sobreajuste detectado (diferencia ${(overfit*100).toFixed(1)}%): la red memoriza el entrenamiento. Agrega Dropout o reduce épocas.`
              : `Red bien entrenada con ${accPct}% de precisión. Considera aumentar épocas si el loss sigue bajando.`}
        </p>
      </div>

      {/* Arquitectura */}
      {arch && (
        <div className="rec-card rec-card--success" style={{ gridColumn: arch.length > 2 ? '1 / -1' : undefined }}>
          <div className="rec-card__header">
            <Layers size={22} color="#10b981" />
            <div>
              <h3 className="rec-card__title">Arquitectura de la Red</h3>
              <Tag label="CAPAS" color="#065f46" bg="#f0fdf4" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {(Array.isArray(arch) ? arch : Object.entries(arch)).map((layer, i) => {
              const name  = layer.name ?? layer.type ?? (Array.isArray(layer) ? layer[0] : `Capa ${i+1}`);
              const units = layer.units ?? layer.neurons ?? (Array.isArray(layer) ? layer[1] : null);
              return (
                <React.Fragment key={i}>
                  <div style={{ textAlign: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #a7f3d0', minWidth: 70 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>{name}</div>
                    {units && <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0a0a0a' }}>{units}</div>}
                  </div>
                  {i < (Array.isArray(arch) ? arch : Object.entries(arch)).length - 1 && (
                    <span style={{ color: '#d1d5db', fontWeight: 700 }}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ──── ESTADO VACÍO ───────────────────────────────────────── */
const EmptyState = ({ mode }) => (
  <div className="smart-recs-empty">
    <Brain size={48} style={{ opacity: 0.15 }} />
    <p>Ejecuta el análisis de <strong>{mode}</strong> para ver las recomendaciones inteligentes aquí.</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   HEADER DEL PANEL + ETIQUETAS DE MODO
══════════════════════════════════════════════════════════════ */
const MODE_META = {
  '2D_EXPLORATION':     { label: 'Exploración 2D',     icon: <BarChart2 size={18} />,  color: '#3b82f6' },
  'ML_REGRESSION':      { label: 'Proyección de Ventas',        icon: <TrendingUp size={18} />, color: '#10b981' },
  'ML_DECISION_TREE':   { label: 'Predicción de Abandono',   icon: <GitBranch size={18} />,  color: '#f59e0b' },
  'ML_PCA':             { label: 'Clasificación de Fans',      icon: <Layers size={18} />,     color: '#3b82f6' },
  'ML_NEURAL_NETWORK':  { label: 'Red Neuronal',        icon: <Network size={18} />,    color: '#8b5cf6' },
  'ML_ELBOW':           { label: 'Optimización de Segmentos', icon: <Target size={18} />, color: '#f43f5e' },
  'ML_ANOMALY':         { label: 'Seguridad Anti-Bot', icon: <AlertTriangle size={18} />, color: '#ef4444' },
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
const SmartRecommendations = ({ 
    analysisMode = '2D_EXPLORATION', 
    mlData = null, 
    canonicalData = null,
    externalFilters = null 
}) => {
  const {
    loading, error, data: sqlData,
    fetchRecommendations
  } = useRecommendations();

  // Carga las recomendaciones de SQLite sincronizadas con filtros externos
  useEffect(() => {
    if (analysisMode === '2D_EXPLORATION') {
      const dFrom = externalFilters?.date_from;
      const dTo = externalFilters?.date_to;
      fetchRecommendations(dFrom, dTo);
    }
  }, [analysisMode, externalFilters?.date_from, externalFilters?.date_to, fetchRecommendations]);

  const meta = MODE_META[analysisMode] ?? MODE_META['2D_EXPLORATION'];

  const renderContent = () => {
    switch (analysisMode) {
      case '2D_EXPLORATION':
        return <ExplorationInsights canonicalData={canonicalData} sqlRecs={sqlData} />;
      case 'ML_REGRESSION':
        return <RegressionInsights mlData={mlData} />;
      case 'ML_DECISION_TREE':
        return <DecisionTreeInsights mlData={mlData} />;
      case 'ML_PCA':
        return <PCAInsights mlData={mlData} />;
      case 'ML_NEURAL_NETWORK':
        return <NeuralNetworkInsights mlData={mlData} />;
      case 'ML_ELBOW':
        return <ElbowInsights mlData={mlData} />;
      case 'ML_ANOMALY':
        return <AnomalyInsights mlData={mlData} />;
      default:
        return <EmptyState mode={meta.label} />;
    }
  };

  return (
    <section className="smart-recs-section">
      {/* Header */}
      <div className="smart-recs-header">
        <div className="smart-recs-header__left">
          <Brain size={28} color="#000" />
          <div>
            <h2 className="smart-recs-header__title">Recomendaciones Inteligentes</h2>
            <p className="smart-recs-header__sub">
              Análisis activo:
              <span style={{ color: meta.color, fontWeight: 800, marginLeft: 6 }}>
                {meta.label}
              </span>
              {sqlData?.generated_at && analysisMode === '2D_EXPLORATION' &&
                ` · ${new Date(sqlData.generated_at).toLocaleTimeString('es-MX')}`}
            </p>
          </div>
        </div>

        {/* ACCIÓN PRIORITARIA INTEGRADA (Sugerencia del usuario) */}
        {analysisMode === '2D_EXPLORATION' && canonicalData?.length > 0 && (
          <div className="smart-recs-header__action-banner">
            <div className="action-banner__icon">
              <Zap size={16} fill="#10b981" color="#10b981" />
            </div>
            <div className="action-banner__content">
              <span className="action-banner__label">ACCIÓN RECOMENDADA:</span>
              <span className="action-banner__text">
                {(() => {
                  const values = canonicalData.map(d => d.val_num || 0);
                  const total = values.reduce((a, b) => a + b, 0);
                  const avg = total / values.length;
                  const stdDev = Math.sqrt(values.map(v => (v - avg) ** 2).reduce((a,b) => a+b, 0) / values.length);
                  const cv = ((stdDev / avg) * 100);
                  return cv > 50 
                    ? "Diversificar inventario y lanzar promo en categorías secundarias." 
                    : "Escalar presupuesto de anuncios en un 15% para los TOP 3 productos.";
                })()}
              </span>
            </div>
            <button className="action-banner__btn">
              EJECUTAR AHORA
            </button>
          </div>
        )}

        {/* Controles: Solo mostrar el badge de modo activo */}
        <div className="smart-recs-filters">
          {/* Badge del modo activo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: `${meta.color}15`, border: `1px solid ${meta.color}30`, borderRadius: 12, color: meta.color, fontWeight: 700, fontSize: '0.75rem' }}>
            {meta.icon}
            {meta.label}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && analysisMode === '2D_EXPLORATION' && (
        <div className="smart-recs-error">
          <AlertTriangle size={15} />
          <span>No se pudo conectar al endpoint de recomendaciones. Mostrando análisis local.</span>
        </div>
      )}

      {/* Contenido según modo */}
      {renderContent()}
    </section>
  );
};

export default SmartRecommendations;
