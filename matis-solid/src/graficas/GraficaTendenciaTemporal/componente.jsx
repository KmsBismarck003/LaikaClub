// Importación de bucles y condicionales reactivos de SolidJS
import { For, Show } from "solid-js";
// Importación del formateador de dinero global
import { formatCurrency } from "../../funciones/formatters";
// Importación del archivo local de estilos CSS
import "./estilo.css";

export default function Componente(props) {
  // Dimensiones fijas del lienzo SVG
  const width = 500;
  const height = 300;
  // Márgenes para acomodar etiquetas sin recortes
  const padding = { top: 40, right: 20, bottom: 55, left: 90 };

  let svgRef;

  // Detecta el punto más cercano al cursor
  const handleSvgMouseMove = (e) => {
    if (!svgRef || !props.layout || !props.layout.coords) return;
    const pt = svgRef.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.getScreenCTM().inverse());

    let closest = null;
    let minDist = Infinity;
    for (const c of props.layout.coords) {
      const dist = Math.hypot(c.x - svgP.x, c.y - svgP.y);
      if (dist < minDist) {
        minDist = dist;
        closest = c;
      }
    }

    if (minDist < 35 && closest) {
      const outPt = svgRef.createSVGPoint();
      outPt.x = closest.x;
      outPt.y = closest.y;
      const screenPt = outPt.matrixTransform(svgRef.getScreenCTM());
      props.onHover(closest.monthName, closest.revenue, "#1d4ed8", screenPt.x, screenPt.y);
    } else {
      props.onLeave();
    }
  };

  const handleSvgClick = (e) => {
    if (!svgRef || !props.layout || !props.layout.coords || !props.onClick) return;
    const pt = svgRef.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.getScreenCTM().inverse());

    let closest = null;
    let minDist = Infinity;
    for (const c of props.layout.coords) {
      const dist = Math.hypot(c.x - svgP.x, c.y - svgP.y);
      if (dist < minDist) {
        minDist = dist;
        closest = c;
      }
    }

    if (minDist < 35 && closest) {
      props.onClick({ raw: closest.originalMonth, label: closest.monthName });
    }
  };


  // 4 niveles del eje Y
  const yLevels = () => {
    const max = props.layout.maxValue || 1;
    const chartH = height - padding.top - padding.bottom;
    return [
      { label: formatCurrency(max),        y: padding.top },
      { label: formatCurrency(max * 0.66), y: padding.top + chartH * 0.34 },
      { label: formatCurrency(max * 0.33), y: padding.top + chartH * 0.67 },
      { label: "$0",                        y: height - padding.bottom },
    ];
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", display: "block", cursor: props.onClick ? "pointer" : "default" }}
      onMouseMove={handleSvgMouseMove}
      onMouseLeave={props.onLeave}
      onClick={handleSvgClick}
      aria-label="Tendencia mensual de ingresos en pesos"
    >
      {/* 
        ================================================================
        DISEÑO: COLOR Y DEGRADADO DE LA GRÁFICA
        ================================================================
        Si necesitas cambiar el color principal de la línea o del relleno:
        1. Cambia el 'stop-color' aquí abajo (actualmente "#1d4ed8" que es azul).
        2. Ve al archivo 'estilo.css' y cambia los colores en .gtt-line y .gtt-point.
      */}
      <defs>
        <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      {/* CUADRÍCULA HORIZONTAL — 4 niveles */}
      <For each={yLevels()}>
        {(level) => (
          <line
            x1={padding.left}
            y1={level.y}
            x2={width - padding.right}
            y2={level.y}
            class="gtt-grid-line"
          />
        )}
      </For>

      {/* EJES */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gtt-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gtt-axis" />


      {/* ESCALA EJE Y — con fondo blanco para visibilidad en cuadrícula */}
      <For each={yLevels()}>
        {(level) => (
          <g>
            <rect
              x={0}
              y={level.y - 9}
              width={padding.left - 4}
              height={14}
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={padding.left - 6}
              y={level.y + 4}
              class="gtt-text"
              text-anchor="end"
            >
              {level.label}
            </text>
          </g>
        )}
      </For>

      {/* ÁREA RELLENA (Debajo de la curva) */}
      <Show when={props.layout.areaPath}>
        <path d={props.layout.areaPath} fill="url(#trend-gradient)" class="gtt-area" />
      </Show>

      {/* 
        CURVA DE TENDENCIA (La línea principal) 
        El grosor y color exacto de la línea se controlan en estilo.css bajo la clase '.gtt-line'.
        Si quieres hacerla más gruesa, busca 'stroke-width' en estilo.css.
      */}
      <Show when={props.layout.linePath}>
        <path d={props.layout.linePath} class="gtt-line" />
      </Show>

      {/* 
        PUNTOS DE DATOS (Los círculos interactivos)
        El tamaño de los círculos se define aquí en 'r={7}'.
        El color y comportamiento al pasar el mouse se controla en estilo.css bajo '.gtt-point'.
      */}
      <For each={props.layout.coords}>
        {(pt) => (
          <circle
            cx={pt.x}
            cy={pt.y}
            r={7}
            class="gtt-point"
            style="pointer-events: none;"
          />
        )}
      </For>

      {/* ETIQUETAS DE MES — con fondo blanco para sobrevivir proyector */}
      <For each={props.layout.coords}>
        {(pt) => (
          <g>
            <rect
              x={pt.x - 18}
              y={height - padding.bottom + 8}
              width="36"
              height="15"
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={pt.x}
              y={height - padding.bottom + 21}
              class="gtt-text"
              text-anchor="middle"
            >
              {pt.monthName}
            </text>
          </g>
        )}
      </For>

      {/* ANOTACIÓN DEL PICO MÁXIMO */}
      <Show when={props.layout.coords && props.layout.coords.length > 0}>
        {(() => {
          const peak = [...props.layout.coords].sort((a, b) => b.revenue - a.revenue)[0];
          if (!peak) return null;
          const labelX = Math.min(Math.max(peak.x, padding.left + 55), width - padding.right - 55);
          const labelY = peak.y - 16;
          return (
            <g>
              <line
                x1={peak.x}
                y1={peak.y - 7}
                x2={peak.x}
                y2={labelY + 2}
                stroke="#0f172a"
                stroke-width="1.5"
                stroke-dasharray="3,3"
              />
              <rect
                x={labelX - 58}
                y={labelY - 13}
                width="116"
                height="17"
                rx="3"
                fill="#0f172a"
              />
              <text
                x={labelX}
                y={labelY - 1}
                fill="#ffffff"
                style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase;"
              >
                Máx: {peak.monthName} — {formatCurrency(peak.revenue)}
              </text>
            </g>
          );
        })()}
      </Show>
      {/* TÍTULO EJE VERTICAL — fondo blanco para legibilidad en proyector */}
      <rect
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2) - 40}
        y={4}
        width="80"
        height="16"
        fill="#ffffff"
        opacity="0.85"
      />
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={16}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Ingresos Mensuales (MXN)
      </text>

      {/* TÍTULO EJE HORIZONTAL */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 8}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Mes de Registro
      </text>
    </svg>
  );
}
