import { For, Show } from "solid-js";
import { formatCurrency, formatInteger, formatPeriodo } from "../../funciones/formatters";
import "./estilo.css";

export default function Componente(props) {
  const width = 500;
  const height = 400;
  const padding = { top: 20, right: 80, bottom: 45, left: 240 };

  const chartWidth = width - padding.left - padding.right;

  const maxVal = () => {
    if (!props.bars || props.bars.length === 0) return 1;
    return Math.max(...props.bars.map((b) => (props.isRevenue ? b.revenue : b.units)), 1);
  };

  // 3 niveles de escala en el eje X para evitar que los números largos se amontonen
  const xLevels = () => {
    const max = maxVal();
    return [0, 0.5, 1].map((frac) => ({
      label: frac === 0
        ? (props.isRevenue ? "$0" : "0")
        : (props.isRevenue ? formatCurrency(max * frac) : `${formatInteger(Math.round(max * frac))} uds`),
      x: padding.left + frac * chartWidth,
    }));
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style="width: 100%; height: 100%; display: block;"
      aria-label="Ventas de artículos LaikaShop por producto"
    >

      {/* CUADRÍCULA VERTICAL */}
      <For each={xLevels()}>
        {(level) => (
          <line
            x1={level.x}
            y1={padding.top}
            x2={level.x}
            y2={height - padding.bottom}
            class="gvt-grid-line"
          />
        )}
      </For>

      {/* EJES */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gvt-axis" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gvt-axis" />


      {/* ESCALA DEL EJE X — con fondo blanco */}
      <For each={xLevels()}>
        {(level) => (
          <g>
            <rect
              x={level.x - 28}
              y={height - padding.bottom + 5}
              width="56"
              height="14"
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={level.x}
              y={height - padding.bottom + 17}
              class="gvt-scale-label"
              text-anchor="middle"
            >
              {level.label}
            </text>
          </g>
        )}
      </For>

      {/* BARRAS Y ETIQUETAS */}
      <For each={props.bars}>
        {(bar, index) => {
          const val = props.isRevenue ? bar.revenue : bar.units;
          const displayVal = props.isRevenue
            ? formatCurrency(val)
            : `${formatInteger(val)} uds`;
          return (
            <g>
              {/* Nombre del artículo — con fondo blanco */}
              <rect
                x={0}
                y={bar.y + bar.height / 2 - 9}
                width={padding.left - 6}
                height="14"
                fill="#ffffff"
                opacity="0.9"
              />
              <text
                x={padding.left - 8}
                y={bar.y + bar.height / 2 + 3}
                class="gvt-label"
                text-anchor="end"
              >
                {bar.name.length > 26 ? `${bar.name.substring(0, 24)}…` : bar.name}
              </text>

              {/* 
                BARRA HORIZONTAL
                Para cambiar su color normal y su color cuando es el #1,
                abre 'estilo.css' y modifica '.gvt-bar' y '.gvt-bar-highlight'
              */}
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                class={index() === 0 ? "gvt-bar gvt-bar-highlight" : "gvt-bar"}
                onMouseMove={(e) =>
                  props.onHover(e, bar.name, props.isRevenue ? bar.revenue : bar.units)
                }
                onMouseLeave={props.onLeave}
              />

              {/* Valor con fondo blanco */}
              <rect
                x={bar.x + bar.width + 4}
                y={bar.y + bar.height / 2 - 9}
                width="90"
                height="14"
                fill="#ffffff"
                opacity="0.9"
              />
              <text
                x={bar.x + bar.width + 8}
                y={bar.y + bar.height / 2 + 3}
                class="gvt-value"
                text-anchor="start"
              >
                {displayVal}
              </text>
            </g>
          );
        }}
      </For>
      {/* TÍTULO EJE Y */}
      <rect
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2) - 32}
        y={4}
        width="64"
        height="14"
        fill="#ffffff"
        opacity="0.9"
      />
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={15}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Artículos LaikaShop
      </text>

      {/* TÍTULO EJE X */}
      <text
        x={padding.left + chartWidth / 2}
        y={height - 7}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        {props.isRevenue ? "Ingresos Totales (MXN)" : "Unidades Vendidas"}
      </text>

      {/* ── ANOTACIÓN DE PERÍODO TEMPORAL DENTRO DEL SVG ──
          Responde directamente: ¿de qué fechas son estos datos?
          Aparece en capturas de pantalla, impresiones y proyector. */}
      <Show when={props.periodo && props.periodo.fecha_inicio}>
        {() => {
          const label = `Período: ${formatPeriodo(props.periodo)}`;
          const labelWidth = 210;
          const labelX = width - padding.right - labelWidth;
          const labelY = padding.top + 14;
          return (
            <g>
              <rect
                x={labelX - 4}
                y={labelY - 13}
                width={labelWidth + 8}
                height={18}
                rx={4}
                fill="#f0f4ff"
                stroke="#c7d2fe"
                stroke-width="1"
                opacity="0.95"
              />
              <text
                x={labelX + labelWidth / 2}
                y={labelY}
                fill="#1e3a8a"
                style="font-size: 9.5px; font-weight: 800; text-anchor: middle; letter-spacing: 0.03em;"
              >
                {label}
              </text>
            </g>
          );
        }}
      </Show>
    </svg>
  );
}
