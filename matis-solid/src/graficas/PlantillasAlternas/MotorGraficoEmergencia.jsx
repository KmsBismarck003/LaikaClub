import { createMemo, For, Show } from "solid-js";

// Utilidad para extraer un array estandarizado [{label: "...", value: 123}] de cualquier origen de datos
const normalizarDatos = (rawData, preparedData) => {
  if (preparedData && Array.isArray(preparedData) && preparedData.length > 0) {
    return preparedData.map(d => ({
      label: String(d.label || d.name || d.month || "Item"),
      value: Number(d.value !== undefined ? d.value : (d.revenue || d.ticketsSold || d.units || 0))
    }));
  }
  if (rawData && Array.isArray(rawData) && rawData.length > 0) {
    return rawData.map(d => ({
      label: String(d.month || d.category || d.name || "Item"),
      value: Number(d.revenue !== undefined ? d.revenue : (d.sales_count || d.count || 0))
    }));
  }
  // Para casos especiales como Comparación de Eventos
  if (rawData && rawData.event_a && rawData.event_b) {
    return rawData.event_a.sales.map((s, i) => ({
      label: String(s.date),
      value: Number(s.revenue + (rawData.event_b.sales[i]?.revenue || 0))
    }));
  }
  return [{label: "Sin datos", value: 0}];
};

const formatVal = (v) => {
  if (typeof v !== 'number' || isNaN(v)) return v;
  if (v >= 1000000) return `$${(v/1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v/1000).toFixed(1)}k`;
  return v.toFixed(0);
};

export default function MotorGraficoEmergencia(props) {
  const dataset = createMemo(() => normalizarDatos(props.rawData, props.preparedData));
  
  const width = 600;
  const height = 350;
  const pad = { top: 40, right: 40, bottom: 60, left: 70 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxVal = createMemo(() => Math.max(...dataset().map(d => d.value), 1));
  
  // Generador de Ejes y Cuadrícula Universal
  const Ejes = () => (
    <g>
      {/* Cuadrícula Horizontal y Etiquetas Y */}
      <For each={[0, 0.25, 0.5, 0.75, 1]}>
        {(frac) => {
          const y = pad.top + chartH - (chartH * frac);
          const val = maxVal() * frac;
          return (
            <g>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#cbd5e1" stroke-dasharray="4,4" />
              <text x={pad.left - 10} y={y + 4} fill="#64748b" font-size="10" font-weight="bold" text-anchor="end">
                {formatVal(val)}
              </text>
            </g>
          );
        }}
      </For>
      {/* Líneas Base (X e Y) */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="#475569" stroke-width="2" />
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="#475569" stroke-width="2" />
    </g>
  );

  // --- SUBCOMPONENTES DE GRÁFICAS COMPLETAS ---

  const Barras = () => (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      <Ejes />
      <For each={dataset()}>
        {(item, i) => {
          const barW = (chartW / dataset().length) * 0.8;
          const spacing = (chartW / dataset().length) * 0.2;
          const barH = (item.value / maxVal()) * chartH;
          const x = pad.left + (i() * (chartW / dataset().length)) + spacing / 2;
          const y = height - pad.bottom - barH;
          return (
            <g>
              <rect x={x} y={y} width={barW} height={barH} fill="#3b82f6" rx="2" />
              {/* Etiqueta X */}
              <text x={x + barW/2} y={height - pad.bottom + 16} fill="#334155" font-size="10" text-anchor="middle">
                {item.label.substring(0, 10)}{item.label.length > 10 ? "…" : ""}
              </text>
              {/* Valor sobre la barra */}
              <text x={x + barW/2} y={y - 6} fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">
                {formatVal(item.value)}
              </text>
            </g>
          );
        }}
      </For>
    </svg>
  );

  const Linea = () => {
    const points = createMemo(() => dataset().map((d, i) => {
      const step = dataset().length > 1 ? chartW / (dataset().length - 1) : chartW / 2;
      const x = pad.left + i * step;
      const y = pad.top + chartH - (d.value / maxVal()) * chartH;
      return `${x},${y}`;
    }).join(" "));

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
        <Ejes />
        <polyline points={points()} fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <For each={dataset()}>
          {(d, i) => {
            const step = dataset().length > 1 ? chartW / (dataset().length - 1) : chartW / 2;
            const x = pad.left + i() * step;
            const y = pad.top + chartH - (d.value / maxVal()) * chartH;
            return (
              <g>
                <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#ef4444" stroke-width="2" />
                <text x={x} y={height - pad.bottom + 16} fill="#334155" font-size="10" text-anchor="middle">
                  {d.label.substring(0, 10)}
                </text>
                <text x={x} y={y - 12} fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">
                  {formatVal(d.value)}
                </text>
              </g>
            );
          }}
        </For>
      </svg>
    );
  };

  const Area = () => {
    const points = createMemo(() => dataset().map((d, i) => {
      const step = dataset().length > 1 ? chartW / (dataset().length - 1) : chartW / 2;
      const x = pad.left + i * step;
      const y = pad.top + chartH - (d.value / maxVal()) * chartH;
      return `${x},${y}`;
    }));
    
    const areaPath = createMemo(() => {
      const pts = points();
      if (pts.length === 0) return "";
      const path = pts.join(" L ");
      return `M ${pts[0].split(",")[0]},${height - pad.bottom} L ${path} L ${pts[pts.length-1].split(",")[0]},${height - pad.bottom} Z`;
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
        <Ejes />
        <path d={areaPath()} fill="#10b981" opacity="0.3" />
        <path d={`M ${points().join(" L ")}`} fill="none" stroke="#059669" stroke-width="3" />
        <For each={dataset()}>
          {(d, i) => {
            const step = dataset().length > 1 ? chartW / (dataset().length - 1) : chartW / 2;
            const x = pad.left + i() * step;
            const y = pad.top + chartH - (d.value / maxVal()) * chartH;
            return (
              <g>
                <circle cx={x} cy={y} r="4" fill="#059669" />
                <text x={x} y={height - pad.bottom + 16} fill="#334155" font-size="10" text-anchor="middle">
                  {d.label.substring(0, 10)}
                </text>
              </g>
            );
          }}
        </For>
      </svg>
    );
  };

  const Dona = () => {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - 30;
    const holeR = r * 0.55;
    const total = createMemo(() => dataset().reduce((s, a) => s + a.value, 0) || 1);
    
    let acc = 0;
    const colors = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#38bdf8", "#818cf8", "#a78bfa", "#f472b6"];
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
        <For each={dataset()}>
          {(d, i) => {
            const pct = d.value / total();
            const startAngle = acc * 2 * Math.PI - Math.PI / 2;
            acc += pct;
            const endAngle = acc * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = pct > 0.5 ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            
            // Posición para la etiqueta exterior
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const labelX = cx + (r + 20) * Math.cos(midAngle);
            const labelY = cy + (r + 20) * Math.sin(midAngle);
            const isRight = Math.cos(midAngle) > 0;

            if (pct === 0) return null;

            return (
              <g>
                <path d={path} fill={colors[i() % colors.length]} stroke="#ffffff" stroke-width="2" />
                <text x={labelX} y={labelY} fill="#1e293b" font-size="10" font-weight="bold" text-anchor={isRight ? "start" : "end"}>
                  {d.label} ({(pct*100).toFixed(1)}%)
                </text>
              </g>
            );
          }}
        </For>
        <circle cx={cx} cy={cy} r={holeR} fill="#f8fafc" />
        <text x={cx} y={cy - 5} fill="#64748b" font-size="12" font-weight="bold" text-anchor="middle">TOTAL</text>
        <text x={cx} y={cy + 15} fill="#0f172a" font-size="16" font-weight="bold" text-anchor="middle">{formatVal(total())}</text>
      </svg>
    );
  };

  const Dispersion = () => (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      <Ejes />
      <For each={dataset()}>
        {(item, i) => {
          const step = chartW / dataset().length;
          // Scatter index a bit for visual distribution
          const x = pad.left + (i() * 1.5 % dataset().length) * step + step/2;
          const y = pad.top + chartH - (item.value / maxVal()) * chartH;
          return (
            <g>
              <circle cx={x} cy={y} r="8" fill="#8b5cf6" opacity="0.7" stroke="#5b21b6" stroke-width="1.5" />
              <text x={x} y={y - 12} fill="#4c1d95" font-size="9" font-weight="bold" text-anchor="middle">
                {item.label.substring(0,8)}
              </text>
            </g>
          );
        }}
      </For>
    </svg>
  );

  const Histograma = () => (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      <Ejes />
      <For each={dataset()}>
        {(item, i) => {
          const barW = chartW / dataset().length; // sin gap
          const barH = (item.value / maxVal()) * chartH;
          const x = pad.left + i() * barW;
          const y = height - pad.bottom - barH;
          return (
            <g>
              <rect x={x} y={y} width={barW} height={barH} fill="#0ea5e9" stroke="#ffffff" stroke-width="1" opacity="0.8" />
              <text x={x + barW/2} y={height - pad.bottom + 16} fill="#334155" font-size="9" text-anchor="middle">
                {item.label.substring(0,6)}
              </text>
            </g>
          );
        }}
      </For>
    </svg>
  );

  const Boxplot = () => {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
        <Ejes />
        <For each={dataset()}>
          {(item, i) => {
            const stepX = chartW / dataset().length;
            const x = pad.left + i() * stepX + stepX/2;
            const valH = (item.value / maxVal()) * chartH;
            const y = height - pad.bottom - valH;
            
            // Falsificamos la caja para demo
            const q1 = y + valH * 0.15;
            const q3 = y - valH * 0.15;
            
            return (
              <g>
                <line x1={x} y1={height - pad.bottom} x2={x} y2={y - 15} stroke="#64748b" stroke-width="2" stroke-dasharray="2,2"/>
                <rect x={x - 12} y={Math.min(q1, q3)} width="24" height={Math.abs(q1-q3)} fill="#e2e8f0" stroke="#475569" stroke-width="2" rx="2" />
                <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke="#f43f5e" stroke-width="3" />
                <text x={x} y={height - pad.bottom + 16} fill="#334155" font-size="10" text-anchor="middle">
                  {item.label.substring(0,8)}
                </text>
              </g>
            );
          }}
        </For>
      </svg>
    );
  };

  const MapaDeCalor = () => {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
        <For each={dataset()}>
          {(item, i) => {
            const cols = Math.min(8, dataset().length);
            const row = Math.floor(i() / cols);
            const col = i() % cols;
            const cellW = (width - 40) / cols;
            const cellH = 50;
            const x = 20 + col * cellW;
            const y = 40 + row * cellH;
            
            const intensity = 0.1 + 0.9 * (item.value / maxVal());
            return (
              <g>
                <rect x={x+2} y={y+2} width={cellW-4} height={cellH-4} fill={`rgba(234, 88, 12, ${intensity})`} rx="4" />
                <text x={x + cellW/2} y={y + cellH/2 - 2} fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5)">
                  {formatVal(item.value)}
                </text>
                <text x={x + cellW/2} y={y + cellH/2 + 12} fill="#ffffff" font-size="9" text-anchor="middle" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5)">
                  {item.label.substring(0, 10)}
                </text>
              </g>
            );
          }}
        </For>
      </svg>
    );
  };

  return (
    <div style="width:100%; height: 100%; min-height: 400px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 1rem;">
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <h3 style="margin: 0; color: #475569; font-size: 0.9rem; text-transform: uppercase;">
          MODO DE EMERGENCIA
        </h3>
        <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
          {props.tipo.toUpperCase()}
        </span>
      </div>
      
      <div style="flex: 1; width: 100%; position: relative;">
        <Show when={props.tipo === "barras"}><Barras /></Show>
        <Show when={props.tipo === "linea"}><Linea /></Show>
        <Show when={props.tipo === "dona" || props.tipo === "pastel"}><Dona /></Show>
        <Show when={props.tipo === "dispersion"}><Dispersion /></Show>
        <Show when={props.tipo === "histograma"}><Histograma /></Show>
        <Show when={props.tipo === "boxplot"}><Boxplot /></Show>
        <Show when={props.tipo === "mapacalor"}><MapaDeCalor /></Show>
        <Show when={props.tipo === "area"}><Area /></Show>
        
        <Show when={!["barras", "linea", "dona", "pastel", "dispersion", "histograma", "boxplot", "mapacalor", "area"].includes(props.tipo)}>
          <div style="display:flex; height:100%; align-items:center; justify-content:center;">
            <p style="color: #ef4444; font-weight: bold;">Tipo de gráfica no soportado: "{props.tipo}"</p>
          </div>
        </Show>
      </div>
    </div>
  );
}
