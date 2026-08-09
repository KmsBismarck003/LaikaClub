// Importa directivas y condicionales de SolidJS
import { For, Show } from "solid-js";
// Importa el formateador monetario global
import { formatCurrency } from "../../funciones/formatters";
// Importa el archivo de estilos local
import "./estilo.css";

export default function Componente(props) {
  // Define las dimensiones absolutas fijas del lienzo SVG
  const width = 500;
  const height = 300;
  // Define márgenes calculados para evitar que los nombres y montos se salgan de pantalla
  const padding = { top: 30, right: 120, bottom: 45, left: 80 };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      
      {/* LÍNEAS DE CUADRÍCULA HORIZONTALES (Para referenciar magnitudes monetarias) */}
      <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} class="gce-grid-line" />
      <line x1={padding.left} y1={(height - padding.bottom + padding.top) / 2} x2={width - padding.right} y2={(height - padding.bottom + padding.top) / 2} class="gce-grid-line" />

      {/* EJES PRINCIPALES */}
      {/* Eje X (Horizontal de fechas) */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gce-axis" />
      {/* Eje Y (Vertical de recaudación) */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gce-axis" />

      {/* TÍTULO DE EJE VERTICAL (Rotado lateralmente a la izquierda) */}
      <text
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2)}
        y={20}
        fill="var(--text-secondary)"
        style="font-size: 8.5px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Dinero Acumulado en Pesos (MXN)
      </text>

      {/* TÍTULO DE EJE HORIZONTAL (Centrado en la parte inferior) */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 6}
        fill="var(--text-secondary)"
        style="font-size: 8.5px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Fecha de Registro Diario (Año 2026)
      </text>

      {/* ETIQUETAS DE ESCALA DE DATOS EJE Y */}
      {/* Valor máximo (Límite superior del eje Y) */}
      <text x={padding.left - 10} y={padding.top + 4} class="gce-text" text-anchor="end">
        {formatCurrency(props.layout.maxValue)}
      </text>
      {/* Valor medio (Límite del 50% del eje Y) */}
      <text x={padding.left - 10} y={(height - padding.bottom + padding.top) / 2 + 4} class="gce-text" text-anchor="end">
        {formatCurrency(props.layout.maxValue / 2)}
      </text>
      {/* Valor cero (Punto de origen) */}
      <text x={padding.left - 10} y={height - padding.bottom + 4} class="gce-text" text-anchor="end">
        $0
      </text>

      {/* TRAZADO DE LA CURVA DEL EVENTO A (Línea Continua Azul de alto contraste) */}
      <Show when={props.layout.pathA}>
        <path d={props.layout.pathA} class="gce-line-a" />
      </Show>

      {/* TRAZADO DE LA CURVA DEL EVENTO B (Línea Punteada Naranja de alto contraste) */}
      <Show when={props.layout.pathB}>
        <path d={props.layout.pathB} class="gce-line-b" />
      </Show>

      {/* RENDERIZADO DE LOS PUNTOS DE EVENTO A (Puntos circulares con hover de foco) */}
      <For each={props.layout.coordsA}>
        {(pt) => (
          <circle
            cx={pt.x}
            cy={pt.y}
            r={5}
            class="gce-point"
            onMouseMove={(e) => props.onHover(e, props.eventNameA || "Evento A", pt.date, pt.value)}
            onMouseLeave={props.onLeave}
          />
        )}
      </For>

      {/* RENDERIZADO DE LOS PUNTOS DE EVENTO B */}
      <For each={props.layout.coordsB}>
        {(pt) => (
          <circle
            cx={pt.x}
            cy={pt.y}
            r={5}
            class="gce-point-b"
            onMouseMove={(e) => props.onHover(e, props.eventNameB || "Evento B", pt.date, pt.value)}
            onMouseLeave={props.onLeave}
          />
        )}
      </For>

      {/* ETIQUETAS DIRECTAS AL FINAL DE LAS CURVAS (Para evitar leyendas lejanas y decodificaciones complejas) */}
      {/* Etiqueta para Evento A (se posiciona justo a la derecha del último punto) */}
      <Show when={props.layout.coordsA && props.layout.coordsA.length > 0}>
        {(() => {
          const lastPtA = props.layout.coordsA[props.layout.coordsA.length - 1];
          const lastPtB = props.layout.coordsB && props.layout.coordsB.length > 0 
            ? props.layout.coordsB[props.layout.coordsB.length - 1] 
            : null;
            
          let yA = lastPtA.y + 4;
          let yB = lastPtB ? lastPtB.y + 4 : 0;
          
          // Lógica de cálculo dinámico para evitar colisiones: si están muy juntos, desplaza uno arriba y otro abajo
          if (lastPtB && Math.abs(yA - yB) < 15) {
            if (yA < yB) {
              yA -= 6;
              yB += 8;
            } else {
              yA += 8;
              yB -= 6;
            }
          }
          
          const nameA = props.eventNameA || "Evento A";
          const shortNameA = nameA.length > 15 ? `${nameA.substring(0, 13)}...` : nameA;
          
          return (
            <text
              x={lastPtA.x + 8}
              y={yA}
              fill="var(--accent-color)"
              style="font-size: 8.5px; font-weight: 800; text-transform: uppercase;"
            >
              {shortNameA}
            </text>
          );
        })()}
      </Show>
      
      {/* Etiqueta para Evento B */}
      <Show when={props.layout.coordsB && props.layout.coordsB.length > 0}>
        {(() => {
          const lastPtA = props.layout.coordsA && props.layout.coordsA.length > 0
            ? props.layout.coordsA[props.layout.coordsA.length - 1]
            : null;
          const lastPtB = props.layout.coordsB[props.layout.coordsB.length - 1];
            
          let yA = lastPtA ? lastPtA.y + 4 : 0;
          let yB = lastPtB.y + 4;
          
          // Lógica idéntica de prevención de solapamiento
          if (lastPtA && Math.abs(yA - yB) < 15) {
            if (yA < yB) {
              yA -= 6;
              yB += 8;
            } else {
              yA += 8;
              yB -= 6;
            }
          }
          
          const nameB = props.eventNameB || "Evento B";
          const shortNameB = nameB.length > 15 ? `${nameB.substring(0, 13)}...` : nameB;
          
          return (
            <text
              x={lastPtB.x + 8}
              y={yB}
              fill="var(--color-preattentive)"
              style="font-size: 8.5px; font-weight: 800; text-transform: uppercase;"
            >
              {shortNameB}
            </text>
          );
        })()}
      </Show>

      {/* RENDERIZADO DE FECHAS EN EL EJE HORIZONTAL (Imprime solo el inicio, el fin y el punto medio para no saturar) */}
      <For each={props.layout.coordsA}>
        {(pt, idx) => (
          <Show when={idx() === 0 || idx() === props.layout.coordsA.length - 1 || (props.layout.coordsA.length > 5 && idx() === Math.floor(props.layout.coordsA.length / 2))}>
            <text
              x={pt.x}
              y={height - padding.bottom + 18}
              class="gce-text"
              text-anchor="middle"
            >
              {pt.date.substring(5)} {/* Recorta para mostrar solo el formato MM-DD */}
            </text>
          </Show>
        )}
      </For>
    </svg>
  );
}
