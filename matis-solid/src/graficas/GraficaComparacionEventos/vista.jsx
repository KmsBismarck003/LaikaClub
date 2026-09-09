// Importación de señales, recursos, efectos y bucles de SolidJS
import { createSignal, createResource, createMemo, createEffect, For, Show } from "solid-js";
// Importación de las llamadas a la API de consulta de eventos y comparaciones
import { fetchEventsList, fetchEventComparison } from "../../funciones/api";
// Importación de utilidades globales de formato monetario e impresiones enteras
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos y utilidades de renderizado de curvas acumulativas
import { prepareComparisonData, calculateLinePaths } from "./funciones";
// Importación del componente de dibujo vectorial SVG
import Componente from "./componente";

// MODO DE EMERGENCIA (PLANTILLAS ALTERNAS)
// Cambia "default" por: "barras", "linea", "dona", "pastel", "dispersion", "histograma", "boxplot", "mapacalor", "area"
const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  // Señales reactivas para almacenar la clave ID del evento A y el evento B
  const [eventA, setEventA] = createSignal(1);
  const [eventB, setEventB] = createSignal(2);
  // Señales reactivas para el rango de fechas a contrastar
  const [dateFrom, setDateFrom] = createSignal("2026-01-01");
  const [dateTo, setDateTo] = createSignal("2026-08-01");

  // Recurso reactivo para solicitar el listado general de eventos (almacena la respuesta en un recurso)
  const [eventsData] = createResource(fetchEventsList);

  // Efecto que inicializa la selección por defecto con los dos primeros eventos una vez cargados
  createEffect(() => {
    const list = eventsData(); // Extrae la lista obtenida de la base de datos
    if (list && list.length > 0) {
      if (list[0]) setEventA(list[0].id); // Selecciona el primero para la curva A
      if (list[1]) setEventB(list[1].id); // Selecciona el segundo para la curva B
      else if (list[0]) setEventB(list[0].id); // Si solo hay un evento, repite
    }
  });

  // Memo reactivo que empaqueta los parámetros de consulta para disparar la recarga del recurso
  const queryParams = createMemo(() => ({
    a: eventA(),
    b: eventB(),
    from: dateFrom(),
    to: dateTo()
  }));

  // Recurso reactivo que consulta de forma asíncrona los históricos al cambiar los parámetros
  const [compareData] = createResource(
    queryParams,
    ({ a, b, from, to }) => fetchEventComparison(a, b, from, to)
  );

  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });
  let containerRef;

  const handleHover = (eventName, date, val, clientX, clientY) => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    
    setTooltip({
      show: true,
      x: clientX - rect.left,
      y: clientY - rect.top,
      name: `${eventName} (${date})`,
      value: `Acumulado: ${formatCurrency(val)}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  // Memo reactivo que genera las curvas matemáticas y su escala para el SVG de 500x300
  const layout = createMemo(() => {
    // Retorna coordenadas vacías si el recurso no ha cargado los datos del cruce
    if (!compareData() || !compareData().event_a || !compareData().event_b) {
      return { pathA: "", pathB: "", coordsA: [], coordsB: [], maxValue: 1 };
    }
    // Prepara e integra el histórico diario acumulado de ambos espectáculos
    const prepared = prepareComparisonData(compareData().event_a, compareData().event_b);
    // Retorna las curvas calculadas ensanchando el margen derecho (right: 120) para las etiquetas integradas
    return calculateLinePaths(prepared, 500, 300, { top: 40, right: 130, bottom: 55, left: 90 });
  });

  // Memo reactivo que unifica los dos flujos de venta diaria para renderizar la tabla comparativa al pie
  const tableRows = createMemo(() => {
    const evA = compareData()?.event_a;
    const evB = compareData()?.event_b;
    if (!evA || !evB) return [];

    const salesA = evA.sales || [];
    const salesB = evB.sales || [];

    // Extrae y ordena el universo completo de fechas registradas en ambos conjuntos
    const allDates = [...new Set([
      ...salesA.map(s => s.date),
      ...salesB.map(s => s.date)
    ])].sort();

    // Mapas auxiliares para búsquedas ultrarrápidas O(1) de registros por fecha
    const mapA = new Map(salesA.map(s => [s.date, s]));
    const mapB = new Map(salesB.map(s => [s.date, s]));

    // Genera un registro consolidado para cada fecha
    return allDates.map(date => {
      const dayA = mapA.get(date) || { revenue: 0, tickets_sold: 0 };
      const dayB = mapB.get(date) || { revenue: 0, tickets_sold: 0 };
      return {
        date,
        revA: dayA.revenue,
        tixA: dayA.tickets_sold,
        revB: dayB.revenue,
        tixB: dayB.tickets_sold,
        diff: dayA.revenue - dayB.revenue // Diferencial neto de recaudación (A - B)
      };
    });
  });

  return (
    <div class="chart-card full-width-chart">
      {/* Cabecera del gráfico con títulos explícitos y autodescriptivos */}
      <div class="chart-header">
        <h3 class="chart-title">Comparación de venta de boletos entre dos eventos seleccionados</h3>
        <p class="chart-subtitle">Permite ver semana a semana la recaudación acumulada generada por cada espectáculo</p>
      </div>

      {/* Selectores de filtros interactivos de eventos y rango de fechas */}
      <div class="chart-controls">
        <div class="filter-group" style="min-width: 200px;">
          <label class="filter-label">Evento A — Línea Continua, Puntos ●</label>
          <select 
            class="filter-select" 
            value={eventA()} 
            // Actualiza la selección del evento A
            onChange={(e) => setEventA(parseInt(e.target.value))}
          >
            <For each={eventsData()}>
              {(ev) => <option value={ev.id}>{ev.name}</option>}
            </For>
          </select>
        </div>

        <div class="filter-group" style="min-width: 200px;">
          <label class="filter-label">Evento B — Línea Guionada, Puntos ◆</label>
          <select 
            class="filter-select" 
            value={eventB()} 
            // Actualiza la selección del evento B
            onChange={(e) => setEventB(parseInt(e.target.value))}
          >
            <For each={eventsData()}>
              {(ev) => <option value={ev.id}>{ev.name}</option>}
            </For>
          </select>
        </div>

        <div class="filter-group" style="min-width: 140px; flex: none;">
          <label class="filter-label">Fecha Inicial</label>
          <input 
            type="date" 
            class="filter-input" 
            value={dateFrom()} 
            // Actualiza la fecha desde
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div class="filter-group" style="min-width: 140px; flex: none;">
          <label class="filter-label">Fecha Final</label>
          <input 
            type="date" 
            class="filter-input" 
            value={dateTo()} 
            // Actualiza la fecha hasta
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div style="margin-left: auto;">
          <BotonExportarPDF 
            title="Comparación de Venta Acumulada de Boletos" 
            subtitle="Permite ver semana a semana la recaudación acumulada generada por cada espectáculo" 
            chartSelector=".chart-body" 
            tableSelector=".bw-table" 
            filename={`Reporte_Comparacion.pdf`} 
          />
        </div>
      </div>

      {/* Contenedor del gráfico vectorial */}
      <div class="chart-body" ref={containerRef} style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {compareData.loading ? (
          // Mensaje durante el cálculo de cruce de datos
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Cruzando datos de venta...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={compareData()} />
          }>
            <Componente 
              layout={layout()} 
              eventNameA={compareData()?.event_a?.name} 
              eventNameB={compareData()?.event_b?.name} 
              onHover={handleHover} 
              onLeave={handleMouseLeave} 
            />
            <Show when={tooltip().show}>
              <div
                class="chart-tooltip"
                style={{
                  position: 'absolute',
                  left: `${tooltip().x}px`,
                  top: `${tooltip().y}px`,
                  transform: 'translate(-50%, -100%) translateY(-12px)',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.5'
                }}
              >
                <div style="font-size: 0.75rem; font-weight: 700; color: #000000; text-transform: uppercase; letter-spacing: 0.04em;">
                  {tooltip().name}
                </div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #000000; margin-top: 3px;">
                  {tooltip().value}
                </div>
              </div>
            </Show>
          </Show>
        )}
      </div>

      {/* Leyenda aclaratoria que replica las convenciones visuales (colores e interlineados) */}
      {/* Leyenda con doble codificación: forma + color + tipo de línea */}
      <div class="chart-legend" style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <div class="legend-item">
          {/* Línea continua azul + círculo */}
          <svg width="32" height="12" style="flex-shrink:0;">
            <line x1="0" y1="6" x2="32" y2="6" stroke="#1d4ed8" stroke-width="3" />
            <circle cx="16" cy="6" r="5" fill="#ffffff" stroke="#1d4ed8" stroke-width="2.5" />
          </svg>
          <span style="color:#0f172a; font-weight:700;">● {compareData()?.event_a?.name || "Evento A"} (línea continua)</span>
        </div>
        <div class="legend-item">
          {/* Línea guionada naranja + diamante */}
          <svg width="32" height="12" style="flex-shrink:0;">
            <line x1="0" y1="6" x2="32" y2="6" stroke="#c2410c" stroke-width="3" stroke-dasharray="7,4" />
            <rect x="11" y="2" width="10" height="10" transform="rotate(45,16,7)" fill="#ffffff" stroke="#c2410c" stroke-width="2.5" />
          </svg>
          <span style="color:#0f172a; font-weight:700;">◆ {compareData()?.event_b?.name || "Evento B"} (línea guionada)</span>
        </div>
      </div>

      {/* Tabla detallada del comportamiento diario de recaudación */}
      <div class="table-container" style="border-top: 2px solid var(--border-color); padding-top: 1rem;">
        <h4 style="margin-bottom: 0.75rem; text-transform: uppercase; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.05em; color: var(--text-primary);">
          Detalle Semanal de Recaudación Comparativa
        </h4>
        <table class="bw-table">
          <thead>
            <tr>
              <th>Fecha de Venta</th>
              <th style="text-align: right;">Boletos A</th>
              <th style="text-align: right;">Ingresos A (MXN)</th>
              <th style="text-align: right;">Boletos B</th>
              <th style="text-align: right;">Ingresos B (MXN)</th>
              <th style="text-align: right;">Diferencial (A - B)</th>
            </tr>
          </thead>
          <tbody>
            <For each={tableRows()}>
              {(row) => (
                <tr>
                  <td style="font-weight: 700;">{row.date}</td>
                  <td style="text-align: right;">{formatInteger(row.tixA)}</td>
                  <td style="text-align: right;">{formatCurrency(row.revA)}</td>
                  <td style="text-align: right;">{formatInteger(row.tixB)}</td>
                  <td style="text-align: right;">{formatCurrency(row.revB)}</td>
                  {/* Pinta en verde si la diferencia favorece al Evento A, o en naranja si favorece al Evento B */}
                  <td style={`text-align: right; font-weight: 700; color: ${row.diff >= 0 ? "var(--accent-color)" : "var(--color-preattentive)"};`}>
                    {row.diff >= 0 ? "+" : ""}{formatCurrency(row.diff)}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
