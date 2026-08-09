// Importa los componentes lógicos de bucles y condicionales de SolidJS
import { For, Show } from "solid-js";
// Importa las funciones formateadoras de moneda y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importa el archivo de estilos local del componente
import "./estilo.css";

export default function Componente(props) {
  // Define el ancho total del lienzo SVG
  const width = 500;
  // Define el alto total del lienzo SVG
  const height = 300;
  // Establece los márgenes de seguridad para albergar los títulos de ejes y etiquetas sin desbordamientos
  const padding = { top: 35, right: 20, bottom: 45, left: 75 };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      
      {/* LÍNEAS DE CUADRÍCULA HORIZONTALES (MÁXIMO 100% DE ALTURA) */}
      {/* Guía horizontal superior de fondo (delimitador del 100% de la escala del gráfico) */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={width - padding.right} 
        y2={padding.top} 
        stroke="var(--border-color)" 
        stroke-width="1" 
        stroke-dasharray="5,5" 
      />
      {/* Guía horizontal media de fondo (delimitador del 50% de la escala) */}
      <line 
        x1={padding.left} 
        y1={(height - padding.bottom + padding.top) / 2} 
        x2={width - padding.right} 
        y2={(height - padding.bottom + padding.top) / 2} 
        stroke="var(--border-color)" 
        stroke-width="1" 
        stroke-dasharray="5,5" 
      />

      {/* EJES PRINCIPALES */}
      {/* Eje horizontal (X) que delimita la base de las categorías */}
      <line 
        x1={padding.left} 
        y1={height - padding.bottom} 
        x2={width - padding.right} 
        y2={height - padding.bottom} 
        class="gc-axis" 
      />
      {/* Eje vertical (Y) que sirve de referencia para las magnitudes de datos */}
      <line 
        x1={padding.left} 
        y1={padding.top} 
        x2={padding.left} 
        y2={height - padding.bottom} 
        class="gc-axis" 
      />

      {/* TÍTULO DE EJE VERTICAL (Rotado -90 grados para alinearse lateralmente) */}
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={20}
        fill="var(--text-secondary)"
        style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        {props.metric === "revenue" ? "Ingresos Recaudados (Pesos MXN)" : "Cantidad de Boletos Vendidos"}
      </text>

      {/* TÍTULO DE EJE HORIZONTAL (Centrado al pie del gráfico) */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 6}
        fill="var(--text-secondary)"
        style="font-size: 9px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Categorías de Eventos
      </text>

      {/* BUCLE DE RENDERIZADO DE BARRAS DE DATOS */}
      <For each={props.bars}>
        {(bar, index) => (
          <g>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              class={index() === 0 ? "gc-bar gc-bar-highlight" : "gc-bar"}
              onMouseMove={(e) => props.onHover(e, bar.label, bar.value)}
              onMouseLeave={props.onLeave}
            />
            {/* Etiqueta de valor directo arriba de la barra (facilita leer el dato sin adivinar) */}
            <text
              x={bar.x + bar.width / 2}
              y={bar.y - 8}
              class="gc-value-label"
            >
              {props.metric === "revenue" ? formatCurrency(bar.value) : formatInteger(bar.value)}
            </text>
            {/* Etiqueta de texto de la categoría debajo del eje X */}
            <text
              x={bar.x + bar.width / 2}
              y={height - padding.bottom + 18}
              class="gc-label"
              text-anchor="middle"
            >
              {bar.label}
            </text>
          </g>
        )}
      </For>

      {/* ANOTACIÓN DIRECTA EN EL SVG (Para dar contexto inmediato en menos de 5 segundos) */}
      <g transform={`translate(${width - 210}, ${padding.top + 10})`}>
        {/* Recuadro de fondo de la anotación */}
        <rect width="130" height="30" fill="var(--bg-main)" stroke="var(--border-color)" stroke-width="1" rx="4" />
        {/* Título de la anotación */}
        <text x="8" y="12" fill="var(--text-primary)" style="font-size: 7.5px; font-weight: 800; text-transform: uppercase;">
          Nota de Distribución
        </text>
        {/* Cuerpo explicativo de la anotación */}
        <text x="8" y="22" fill="var(--text-secondary)" style="font-size: 7px; font-weight: 600;">
          Música representa >70% del total
        </text>
      </g>
    </svg>
  );
}
