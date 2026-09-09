// Importa directivas y condicionales de SolidJS
import { For, Show } from "solid-js";
// Importa el formateador monetario global
import { formatCurrency } from "../../funciones/formatters";
// Importa el archivo de estilos local
import "./estilo.css";

export default function Componente(props) {
  // Dimensiones absolutas fijas del lienzo SVG
  const width = 500;
  const height = 300;
  // Margen derecho amplio para etiquetas directas al final de cada curva
  const padding = { top: 40, right: 130, bottom: 55, left: 90 };

  let svgRef;

  const handleSvgMouseMove = (e) => {
    if (!svgRef || !props.layout) return;
    const pt = svgRef.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.getScreenCTM().inverse());

    const allCoords = [
      ...(props.layout.coordsA || []).map(c => ({ ...c, series: "A" })),
      ...(props.layout.coordsB || []).map(c => ({ ...c, series: "B" })),
    ];
    if (allCoords.length === 0) return;

    let closest = null;
    let minDist = Infinity;
    for (const c of allCoords) {
      const dist = Math.hypot(c.x - svgP.x, c.y - svgP.y);
      if (dist < minDist) {
        minDist = dist;
        closest = c;
      }
    }

    if (minDist < 35) {
      const outPt = svgRef.createSVGPoint();
      outPt.x = closest.x;
      outPt.y = closest.y;
      const screenPt = outPt.matrixTransform(svgRef.getScreenCTM());
      const eventName =
        closest.series === "A"
          ? props.eventNameA || "Evento A"
          : props.eventNameB || "Evento B";
      props.onHover(eventName, closest.date, closest.value, screenPt.x, screenPt.y);
    } else {
      props.onLeave();
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

  // Posición Y de etiquetas finales sin solapamiento
  const endLabels = () => {
    const coordsA = props.layout.coordsA || [];
    const coordsB = props.layout.coordsB || [];
    if (coordsA.length === 0 && coordsB.length === 0) return { yA: 0, yB: 0 };
    const lastA = coordsA[coordsA.length - 1];
    const lastB = coordsB[coordsB.length - 1];
    let yA = lastA ? lastA.y + 5 : 0;
    let yB = lastB ? lastB.y + 5 : 0;
    if (lastA && lastB && Math.abs(yA - yB) < 18) {
      if (yA <= yB) { yA -= 10; yB += 10; }
      else          { yA += 10; yB -= 10; }
    }
    return { yA, yB };
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      style="width: 100%; height: 100%; display: block;"
      onMouseMove={handleSvgMouseMove}
      onMouseLeave={props.onLeave}
      aria-label="Comparación de recaudación acumulada entre dos eventos"
    >

      {/* CUADRÍCULA HORIZONTAL — 4 niveles */}
      <For each={yLevels()}>
        {(level) => (
          <line
            x1={padding.left}
            y1={level.y}
            x2={width - padding.right}
            y2={level.y}
            class="gce-grid-line"
          />
        )}
      </For>

      {/* EJES */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} class="gce-axis" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} class="gce-axis" />


      {/* ESCALA EJE Y — con fondo blanco */}
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
              class="gce-text"
              text-anchor="end"
            >
              {level.label}
            </text>
          </g>
        )}
      </For>

      {/* 
        CURVAS (Líneas de los eventos)
        El color y grosor de estas líneas se controlan en 'estilo.css' 
        bajo las clases '.gce-line-a' y '.gce-line-b'.
      */}
      <Show when={props.layout.pathA}>
        <path d={props.layout.pathA} class="gce-line-a" />
      </Show>
      <Show when={props.layout.pathB}>
        <path d={props.layout.pathB} class="gce-line-b" />
      </Show>

      {/* Los puntos individuales se eliminaron — las líneas (pathA / pathB) ya representan la serie completa */}

      {/* ETIQUETAS DIRECTAS AL FINAL DE CADA CURVA
          Con fondo blanco opaco para sobrevivir cualquier proyector */}
      <Show when={props.layout.coordsA && props.layout.coordsA.length > 0}>
        {(() => {
          const lastA = props.layout.coordsA[props.layout.coordsA.length - 1];
          const { yA } = endLabels();
          const nameA = props.eventNameA || "Evento A";
          const shortA = nameA.length > 13 ? `${nameA.substring(0, 11)}…` : nameA;
          const labelText = `● ${shortA}`;
          return (
            <g>
              {/* Fondo blanco sólido — esencial para legibilidad en proyector */}
              <rect x={lastA.x + 7} y={yA - 12} width="108" height="16" rx="2" fill="#ffffff" opacity="0.95" />
              <rect x={lastA.x + 7} y={yA - 12} width="108" height="16" rx="2" fill="none" stroke="#1d4ed8" stroke-width="1.5" />
              <text
                x={lastA.x + 11}
                y={yA}
                fill="#1d4ed8"
                style="font-size: 9px; font-weight: 800; text-transform: uppercase;"
              >
                {labelText}
              </text>
            </g>
          );
        })()}
      </Show>

      <Show when={props.layout.coordsB && props.layout.coordsB.length > 0}>
        {(() => {
          const lastB = props.layout.coordsB[props.layout.coordsB.length - 1];
          const { yB } = endLabels();
          const nameB = props.eventNameB || "Evento B";
          const shortB = nameB.length > 13 ? `${nameB.substring(0, 11)}…` : nameB;
          const labelText = `◆ ${shortB}`;
          return (
            <g>
              <rect x={lastB.x + 7} y={yB - 12} width="108" height="16" rx="2" fill="#ffffff" opacity="0.95" />
              <rect x={lastB.x + 7} y={yB - 12} width="108" height="16" rx="2" fill="none" stroke="#c2410c" stroke-width="1.5" />
              <text
                x={lastB.x + 11}
                y={yB}
                fill="#c2410c"
                style="font-size: 9px; font-weight: 800; text-transform: uppercase;"
              >
                {labelText}
              </text>
            </g>
          );
        })()}
      </Show>

      {/* FECHAS EN EJE X — inicio, medio y fin — con fondo blanco */}
      <For each={props.layout.coordsA}>
        {(pt, idx) => (
          <Show
            when={
              idx() === 0 ||
              idx() === props.layout.coordsA.length - 1 ||
              (props.layout.coordsA.length > 4 &&
                idx() === Math.floor(props.layout.coordsA.length / 2))
            }
          >
            {(() => {
              const parts = pt.date ? pt.date.split("-") : [];
              const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
              const label = parts.length >= 3
                ? `${parts[2]} ${months[parseInt(parts[1], 10) - 1]}`
                : (pt.date || "");
              return (
                <g>
                  <rect
                    x={pt.x - 20}
                    y={height - padding.bottom + 8}
                    width="40"
                    height="15"
                    fill="#ffffff"
                    opacity="0.9"
                  />
                  <text
                    x={pt.x}
                    y={height - padding.bottom + 21}
                    class="gce-text"
                    text-anchor="middle"
                  >
                    {label}
                  </text>
                </g>
              );
            })()}
          </Show>
        )}
      </For>
      {/* TÍTULO EJE VERTICAL */}
      <rect
        transform="rotate(-90)"
        x={-((height - padding.bottom + padding.top) / 2) - 38}
        y={4}
        width="76"
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
        Dinero Acumulado (MXN)
      </text>

      {/* TÍTULO EJE HORIZONTAL */}
      <text
        x={(width - padding.left - padding.right) / 2 + padding.left}
        y={height - 8}
        fill="#0f172a"
        style="font-size: 10px; font-weight: 800; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.05em;"
      >
        Semana de Registro (2026)
      </text>
    </svg>
  );
}
