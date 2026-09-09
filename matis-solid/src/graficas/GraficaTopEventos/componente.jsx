// Importa la directiva For de SolidJS
import { For, Show } from "solid-js";
// Importa el formateador de monedas y período temporal
import { formatCurrency, formatPeriodo } from "../../funciones/formatters";
// Importa el archivo de estilos local
import "./estilo.css";

export default function Componente(props) {
  const width = 500;
  const height = 400;
  const padding = { top: 20, right: 80, bottom: 45, left: 240 };

  const chartWidth = width - padding.left - padding.right;

  const maxVal = () =>
    props.bars && props.bars.length > 0
      ? Math.max(...props.bars.map((b) => b.revenue), 1)
      : 1;

  // 3 posiciones de escala en el eje X para evitar empalme con números completos
  const xLevels = () => {
    const max = maxVal();
    return [0, 0.5, 1].map((frac) => ({
      label: frac === 0 ? "$0" : formatCurrency(max * frac),
      x: padding.left + frac * chartWidth,
    }));
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style="width: 100%; height: 100%; display: block;"
      aria-label="Eventos con mayor recaudación por venta de boletos"
    >

      {/* CUADRÍCULA VERTICAL */}
      <For each={xLevels()}>
        {(level) => (
          <line
            x1={level.x}
            y1={padding.top}
            x2={level.x}
            y2={height - padding.bottom}
            class="gte-grid-line"
          />
        )}
      </For>

      {/* EJES */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gte-axis" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gte-axis" />


      {/* ESCALA DEL EJE X — con fondo blanco */}
      <For each={xLevels()}>
        {(level) => (
          <g>
            <rect
              x={level.x - 25}
              y={height - padding.bottom + 5}
              width="50"
              height="14"
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={level.x}
              y={height - padding.bottom + 17}
              class="gte-scale-label"
              text-anchor="middle"
            >
              {level.label}
            </text>
          </g>
        )}
      </For>

      {/* BARRAS Y ETIQUETAS */}
      <For each={props.bars}>
        {(bar, index) => (
          <g>
            {/* Nombre del evento — con fondo blanco para sobrevivir proyector */}
            <rect
              x={0}
              y={bar.y + bar.height / 2 - 10}
              width={padding.left - 6}
              height="14"
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={padding.left - 8}
              y={bar.y + bar.height / 2 + 3}
              class="gte-text"
              text-anchor="end"
            >
              {bar.name.length > 22 ? `${bar.name.substring(0, 20)}…` : bar.name}
            </text>

            {/* 
              BARRA HORIZONTAL
              Para cambiar su color normal y su color cuando es el #1,
              abre 'estilo.css' y modifica '.gte-bar' y '.gte-bar-highlight'
            */}
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              class={index() === 0 ? "gte-bar gte-bar-highlight" : "gte-bar"}
              onMouseMove={(e) =>
                props.onHover(e, bar.name, bar.revenue, bar.ticketsSold)
              }
              onMouseLeave={props.onLeave}
            />

            {/* Valor con fondo blanco para evitar que se pierda sobre la cuadrícula */}
            <rect
              x={bar.x + bar.width + 4}
              y={bar.y + bar.height / 2 - 9}
              width="84"
              height="14"
              fill="#ffffff"
              opacity="0.9"
            />
            <text
              x={bar.x + bar.width + 8}
              y={bar.y + bar.height / 2 + 3}
              class="gte-value"
              text-anchor="start"
            >
              {formatCurrency(bar.revenue)}
            </text>
          </g>
        )}
      </For>
      {/* TÍTULO EJE VERTICAL */}
      <rect
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2) - 22}
        y={4}
        width="44"
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
        Eventos
      </text>

      {/* TÍTULO EJE HORIZONTAL */}
      <text
        x={padding.left + chartWidth / 2}
        y={height - 7}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Ingresos Totales (MXN)
      </text>

      {/* ── ANOTACIÓN DE PERÍODO TEMPORAL DENTRO DEL SVG ──
          Responde directamente: ¿de qué fechas son estos datos?
          Aparece en capturas de pantalla, impresiones y proyector. */}
      <Show when={props.periodo && props.periodo.fecha_inicio}>
        {() => {
          const label = ` Período: ${formatPeriodo(props.periodo)}`;
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
