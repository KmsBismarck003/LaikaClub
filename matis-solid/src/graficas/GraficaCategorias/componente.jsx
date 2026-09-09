// Importa los componentes lógicos de bucles y condicionales de SolidJS
import { For, Show } from "solid-js";
// Importa las funciones formateadoras de moneda, enteros y período temporal
import { formatCurrency, formatInteger, formatPeriodo } from "../../funciones/formatters";
// Importa el archivo de estilos local del componente
import "./estilo.css";

export default function Componente(props) {
  const width = 500;
  const height = 300;
  const padding = { top: 45, right: 20, bottom: 55, left: 85 };

  const maxVal = () =>
    props.bars && props.bars.length > 0
      ? Math.max(...props.bars.map((b) => b.value), 1)
      : 1;

  // 4 niveles de cuadrícula en el eje Y
  const yLevels = () => {
    const max = maxVal();
    const chartH = height - padding.top - padding.bottom;
    return [
      { label: props.metric === "revenue" ? formatCurrency(max)        : formatInteger(max),        y: padding.top },
      { label: props.metric === "revenue" ? formatCurrency(max * 0.66) : formatInteger(Math.round(max * 0.66)), y: padding.top + chartH * 0.34 },
      { label: props.metric === "revenue" ? formatCurrency(max * 0.33) : formatInteger(Math.round(max * 0.33)), y: padding.top + chartH * 0.67 },
      { label: props.metric === "revenue" ? "$0" : "0",                 y: height - padding.bottom },
    ];
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style="width: 100%; height: 100%; display: block;"
      aria-label="Ingresos o boletos por categoría de evento"
    >

      {/* CUADRÍCULA HORIZONTAL */}
      <For each={yLevels()}>
        {(level) => (
          <line
            x1={padding.left}
            y1={level.y}
            x2={width - padding.right}
            y2={level.y}
            class="gc-grid-line"
          />
        )}
      </For>

      {/* EJES */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gc-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gc-axis" />


      {/* ESCALA EJE Y — con fondo blanco para visibilidad */}
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
              class="gc-label"
              text-anchor="end"
              style="font-size: 11px;"
            >
              {level.label}
            </text>
          </g>
        )}
      </For>

      {/* BARRAS con etiqueta de valor y porcentaje */}
      <For each={props.bars}>
        {(bar, index) => {
          const totalSum = props.bars.reduce((s, b) => s + b.value, 0) || 1;
          const pct = ((bar.value / totalSum) * 100).toFixed(1);
          const valueLabel =
            props.metric === "revenue"
              ? formatCurrency(bar.value)
              : `${formatInteger(bar.value)}`;
          const spaceAbove = bar.y - padding.top;
          const labelOutside = spaceAbove >= 32;

          return (
            <g>
              {/* 
                BARRAS DE LA GRÁFICA
                Si deseas cambiar el color de las barras (incluyendo la resaltada), 
                abre 'estilo.css' de esta carpeta y modifica las clases '.gc-bar' 
                y '.gc-bar-highlight'.
              */}
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                class={index() === 0 ? "gc-bar gc-bar-highlight" : "gc-bar"}
                style={props.onClick ? "cursor: pointer;" : ""}
                onMouseMove={(e) => props.onHover(e, bar.label, bar.value)}
                onMouseLeave={props.onLeave}
                onClick={() => props.onClick && props.onClick(bar.label)}
              />
              {/* Valor encima de la barra con fondo blanco */}
              <Show when={labelOutside}>
                <rect
                  x={bar.x + bar.width / 2 - 30}
                  y={bar.y - 27}
                  width="60"
                  height="13"
                  fill="#ffffff"
                  opacity="0.9"
                />
              </Show>
              <text
                x={bar.x + bar.width / 2}
                y={labelOutside ? bar.y - 16 : bar.y + bar.height / 2 - 4}
                class="gc-value-label"
                style={labelOutside ? "" : "fill: #ffffff;"}
              >
                {valueLabel}
              </text>
              {/* Porcentaje secundario */}
              <text
                x={bar.x + bar.width / 2}
                y={labelOutside ? bar.y - 5 : bar.y + bar.height / 2 + 8}
                class="gc-pct-label"
                style={labelOutside ? "" : "fill: #e2e8f0;"}
              >
                {pct}%
              </text>
              {/* Nombre categoría con fondo blanco */}
              <rect
                x={bar.x + bar.width / 2 - 26}
                y={height - padding.bottom + 8}
                width="52"
                height="15"
                fill="#ffffff"
                opacity="0.9"
              />
              <text
                x={bar.x + bar.width / 2}
                y={height - padding.bottom + 21}
                class="gc-label"
                text-anchor="middle"
                style="font-size: 11px;"
              >
                {bar.label}
              </text>
            </g>
          );
        }}
      </For>
      {/* TÍTULO EJE VERTICAL */}
      <rect
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2) - 42}
        y={4}
        width="84"
        height="16"
        fill="#ffffff"
        opacity="0.9"
      />
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={16}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        {props.metric === "revenue" ? "Ingresos (MXN)" : "Boletos Vendidos"}
      </text>

      {/* TÍTULO EJE HORIZONTAL */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 8}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Categoría de Evento
      </text>

      {/* ── ANOTACIÓN DE PERÍODO TEMPORAL DENTRO DEL SVG ──
          Responde directamente: ¿de qué fechas son estos datos?
          Aparece en capturas de pantalla, impresiones y proyector. */}
      <Show when={props.periodo && props.periodo.fecha_inicio}>
        {() => {
          const label = ` Período: ${formatPeriodo(props.periodo)}`;
          const labelWidth = 210;
          const labelX = width - padding.right - labelWidth;
          const labelY = padding.top;
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
