// Importa la directiva lúdica For de SolidJS para mapear arreglos en SVG
import { For } from "solid-js";
// Importa el formateador de monedas para imprimir la recaudación
import { formatCurrency } from "../../funciones/formatters";
// Importa el archivo de estilos local
import "./estilo.css";

export default function Componente(props) {
  // Define las dimensiones fijas del lienzo de dibujo vectorial
  const width = 500;
  const height = 300;
  // Define márgenes amplios en el lado izquierdo para evitar el corte de los nombres largos de eventos (left: 160)
  const padding = { top: 20, right: 90, bottom: 35, left: 160 };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      
      {/* LÍNEAS DE CUADRÍCULA VERTICALES (Para facilitar la comparación visual en proyectores) */}
      <line 
        x1={padding.left + (width - padding.left - padding.right) / 2} 
        y1={padding.top} 
        x2={padding.left + (width - padding.left - padding.right) / 2} 
        y2={height - padding.bottom} 
        class="gte-grid-line" 
      />
      <line 
        x1={width - padding.right} 
        y1={padding.top} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        class="gte-grid-line" 
      />

      {/* EJES PRINCIPALES */}
      {/* Eje de referencia vertical (Y) */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={height - padding.bottom} 
        class="gte-axis" 
      />

      {/* TÍTULO DE EJE VERTICAL (Rotado lateralmente a la izquierda) */}
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={15}
        fill="var(--text-secondary)"
        style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Eventos Principales
      </text>

      {/* TÍTULO DE EJE HORIZONTAL (Centrado en el fondo) */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 6}
        fill="var(--text-secondary)"
        style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Ingresos Totales Acumulados (MXN)
      </text>

      {/* BUCLE DE RENDERIZADO DE BARRAS HORIZONTALES */}
      <For each={props.bars}>
        {(bar, index) => (
          <g>
            {/* Texto descriptivo a la izquierda (Alineado a la derecha, recortado a 22 caracteres si es muy largo) */}
            <text
              x={padding.left - 10}
              y={bar.y + bar.height / 2 + 4}
              class="gte-text"
              text-anchor="end"
            >
              {bar.name.length > 22 ? `${bar.name.substring(0, 20)}...` : bar.name}
            </text>

            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              class={index() === 0 ? "gte-bar gte-bar-highlight" : "gte-bar"}
              onMouseMove={(e) => props.onHover(e, bar.name, bar.revenue, bar.ticketsSold)}
              onMouseLeave={props.onLeave}
            />

            {/* Etiqueta de valor exacto de ingresos al costado derecho de la barra */}
            <text
              x={bar.x + bar.width + 8}
              y={bar.y + bar.height / 2 + 4}
              class="gte-value"
              text-anchor="start"
            >
              {formatCurrency(bar.revenue)}
            </text>
          </g>
        )}
      </For>

      {/* ANOTACIÓN DIRECTA DE CONTEXTO */}
      <g transform={`translate(${width - 240}, ${height - padding.bottom - 40})`}>
        <rect width="140" height="30" fill="var(--bg-main)" stroke="var(--border-color)" stroke-width="1" rx="4" />
        <text x="8" y="12" fill="var(--text-primary)" style="font-size: 7.5px; font-weight: 800; text-transform: uppercase;">
          Líder de Recaudación
        </text>
        <text x="8" y="22" fill="var(--text-secondary)" style="font-size: 7px; font-weight: 600;">
          Supera los objetivos de venta
        </text>
      </g>
    </svg>
  );
}
