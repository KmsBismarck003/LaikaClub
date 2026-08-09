// Importa la directiva For de SolidJS para mapear arreglos en el SVG
import { For } from "solid-js";
// Importa el archivo de estilos local
import "./estilo.css";

export default function Componente(props) {
  // Define las dimensiones del lienzo de dibujo
  const width = 500;
  const height = 300;
  // Define el centro geométrico del pastel
  const cx = 250;
  const cy = 150;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style="width: 100%; height: 100%; display: block;">
      
      {/* BUCLE PARA RENDERIZAR LAS REBANADAS DEL PASTEL */}
      <For each={props.slices}>
        {(slice) => (
          <path
            // Trazado geométrico en formato SVG (M cx cy L x1 y1 A ...)
            d={slice.pathD}
            // Color de relleno asignado a la rebanada (Garantiza legibilidad y contraste)
            fill={slice.color}
            class="gvt-wedge"
            onMouseMove={(e) => props.onHover(e, `${slice.name} (${(slice.percentage * 100).toFixed(1)}%)`, slice.value)}
            onMouseLeave={props.onLeave}
          />
        )}
      </For>

      {/* CÍRCULO CONTORNO EXTERIOR (Para dar acabado suave y limpio) */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={100} 
        fill="none" 
        stroke="var(--border-color)" 
        stroke-width="1.5" 
      />
    </svg>
  );
}
