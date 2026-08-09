// Importación de bucles y condicionales reactivos de SolidJS
import { For, Show } from "solid-js";
// Importación del formateador de dinero global
import { formatCurrency } from "../../funciones/formatters";
// Importación del archivo local de estilos CSS
import "./estilo.css";

export default function Componente(props) {
  // Define las dimensiones fijas del lienzo de dibujo
  const width = 500;
  const height = 300;
  // Define márgenes calculados para los títulos de ejes y etiquetas
  const padding = { top: 30, right: 20, bottom: 45, left: 80 };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      <defs>
        {/* Gradiente degradado suave bajo la curva para darle un aspecto ejecutivo y moderno */}
        <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent-color)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--accent-color)" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      {/* LÍNEAS DE CUADRÍCULA HORIZONTALES (Para facilitar lecturas de magnitud en proyectores) */}
      <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} class="gtt-grid-line" />
      <line x1={padding.left} y1={(height - padding.bottom + padding.top) / 2} x2={width - padding.right} y2={(height - padding.bottom + padding.top) / 2} class="gtt-grid-line" />

      {/* EJES PRINCIPALES */}
      {/* Eje horizontal X */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gtt-axis" />
      {/* Eje vertical Y */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gtt-axis" />

      {/* TÍTULO DE EJE VERTICAL (Rotado lateralmente a la izquierda) */}
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={20}
        fill="var(--text-secondary)"
        style="font-size: 8.5px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Ingresos Mensuales en Pesos (MXN)
      </text>

      {/* TÍTULO DE EJE HORIZONTAL (Centrado en la parte inferior) */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 6}
        fill="var(--text-secondary)"
        style="font-size: 8.5px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Meses de Registro (Historial YTD)
      </text>

      {/* ETIQUETAS DE GRADUACIÓN EJE VERTICAL Y */}
      {/* Valor máximo */}
      <text x={padding.left - 10} y={padding.top + 4} class="gtt-text" text-anchor="end">
        {formatCurrency(props.layout.maxValue)}
      </text>
      {/* Valor medio (50%) */}
      <text x={padding.left - 10} y={(height - padding.bottom + padding.top) / 2 + 4} class="gtt-text" text-anchor="end">
        {formatCurrency(props.layout.maxValue / 2)}
      </text>
      {/* Valor cero */}
      <text x={padding.left - 10} y={height - padding.bottom + 4} class="gtt-text" text-anchor="end">
        $0
      </text>

      {/* DIBUJO DEL ÁREA RELLENA CON GRADIENTE BAJO LA LÍNEA */}
      <Show when={props.layout.areaPath}>
        <path d={props.layout.areaPath} fill="url(#trend-gradient)" class="gtt-area" />
      </Show>

      {/* DIBUJO DE LA CURVA DE TENDENCIA (Línea Azul Continua) */}
      <Show when={props.layout.linePath}>
        <path d={props.layout.linePath} class="gtt-line" />
      </Show>

      <For each={props.layout.coords}>
        {(pt) => (
          <circle
            cx={pt.x}
            cy={pt.y}
            r={6}
            class="gtt-point"
            onMouseMove={(e) => props.onHover(e, pt.monthName, pt.revenue)}
            onMouseLeave={props.onLeave}
          />
        )}
      </For>

      {/* ETIQUETAS DE TEXTO DE CADA MES EN EL EJE HORIZONTAL */}
      <For each={props.layout.coords}>
        {(pt) => (
          <text
            x={pt.x}
            y={height - padding.bottom + 18}
            class="gtt-text"
            text-anchor="middle"
          >
            {pt.monthName}
          </text>
        )}
      </For>

      {/* ANOTACIÓN DINÁMICA SOBRE EL PICO MÁS ALTO (Para guiar al lector en menos de 5 segundos) */}
      <Show when={props.layout.coords && props.layout.coords.length > 0}>
        {(() => {
          // Ordena de mayor a menor y extrae la coordenada con el valor de ingresos máximo
          const sortedCoords = [...props.layout.coords].sort((a, b) => b.revenue - a.revenue);
          const peak = sortedCoords[0];
          if (!peak) return null;
          
          return (
            <g transform={`translate(${peak.x - 45}, ${peak.y - 28})`}>
              {/* Recuadro de fondo de la nota de pico */}
              <rect width="90" height="18" fill="var(--bg-main)" stroke="var(--border-color)" stroke-width="1" rx="4" />
              {/* Texto de resalte en color de contraste naranja preatentivo */}
              <text x="45" y="11" fill="var(--color-preattentive)" style="font-size: 7.5px; font-weight: 800; text-anchor: middle;">
                Pico de ventas YTD
              </text>
            </g>
          );
        })()}
      </Show>
    </svg>
  );
}
