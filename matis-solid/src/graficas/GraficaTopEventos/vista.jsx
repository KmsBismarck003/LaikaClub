import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { fetchTopRevenueEvents } from "../../funciones/api";
import { formatCurrency, formatInteger, formatPeriodo } from "../../funciones/formatters";
import { filterAndLimitEvents, calculateHorizontalBarLayout } from "./funciones";
import Componente from "./componente";

const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  const [limit, setLimit] = createSignal(5);
  const [category, setCategory] = createSignal("ALL");
  const [dateFrom, setDateFrom] = createSignal("");
  const [dateTo, setDateTo] = createSignal("");

  // El objeto de filtros de fecha actúa como fuente reactiva del recurso.
  // Al cambiar cualquier fecha, createResource vuelve a llamar a la API.
  const filtrosFecha = createMemo(() => ({ dateFrom: dateFrom(), dateTo: dateTo() }));
  const [data] = createResource(filtrosFecha, fetchTopRevenueEvents);

  const rawEvents = createMemo(() => data()?.top_events ?? []);
  const periodo = createMemo(() => data()?.periodo ?? { fecha_inicio: null, fecha_fin: null });

  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, revenue, ticketsSold) => {
    const container = e.currentTarget.closest(".chart-body");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formattedVal = `${formatCurrency(revenue)} (${formatInteger(ticketsSold)} boletos)`;
    setTooltip({ show: true, x: e.clientX - rect.left, y: e.clientY - rect.top, name, value: formattedVal });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });

  // El filtro de categoría y límite aplica en memoria sobre los datos ya cargados del backend
  const filteredData = createMemo(() => {
    if (!rawEvents().length) return [];
    return filterAndLimitEvents(rawEvents(), limit(), category());
  });

  const bars = createMemo(() =>
    calculateHorizontalBarLayout(filteredData(), 500, 300, { top: 20, right: 100, bottom: 45, left: 240 })
  );

  const categoriesList = createMemo(() => {
    if (!rawEvents().length) return [];
    const list = rawEvents().map((item) => item.category).filter(Boolean);
    return ["ALL", ...new Set(list)];
  });

  const handleLimpiar = () => {
    setDateFrom("");
    setDateTo("");
    setCategory("ALL");
    setLimit(5);
  };

  return (
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Eventos con Mayor Recaudación de Dinero por Venta de Boletos</h3>
        <p class="chart-subtitle">Muestra los eventos principales que han generado mayores ingresos totales acumulados en pesos (MXN)</p>
        <Show when={!data.loading && periodo()?.fecha_inicio}>
          <div class="chart-periodo-badge">
            <span class="chart-periodo-label">Período de datos:</span>
            <strong class="chart-periodo-valor">{formatPeriodo(periodo())}</strong>
          </div>
        </Show>
      </div>

      <div class="chart-controls">
        <div class="filter-group" style="min-width: 120px; flex: none;">
          <label class="filter-label">Ver Top</label>
          <select class="filter-select" value={limit()} onChange={(e) => setLimit(parseInt(e.target.value))}>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Categoría del Espectáculo</label>
          <select class="filter-select" value={category()} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">Todas las categorías</option>
            {categoriesList().filter((c) => c !== "ALL").map((c) => (
              <option value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Desde</label>
          <input
            type="date"
            class="filter-input"
            value={dateFrom()}
            onInput={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Hasta</label>
          <input
            type="date"
            class="filter-input"
            value={dateTo()}
            onInput={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div class="filter-group" style="flex: none; justify-content: flex-end;">
          <label class="filter-label">&nbsp;</label>
          <button
            class="filter-select"
            style="cursor: pointer; font-weight: 700; text-transform: uppercase;"
            onClick={handleLimpiar}
          >
            Limpiar filtros
          </button>
        </div>

        <div style="margin-left: auto;">
          <BotonExportarPDF
            title="Eventos con Mayor Recaudación de Dinero por Venta de Boletos"
            subtitle="Muestra los eventos principales que han generado mayores ingresos totales acumulados en pesos (MXN)"
            chartSelector=".chart-body"
            tableSelector=".bw-table"
            filename={`Reporte_TopEventos_${category()}.pdf`}
          />
        </div>
      </div>

      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Calculando top de ventas...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={filteredData()} />
          }>
            <Componente
              bars={bars()}
              periodo={periodo()}
              onHover={handleMouseMove}
              onLeave={handleMouseLeave}
            />
            <Show when={tooltip().show}>
              <div
                class="chart-tooltip"
                style={{
                  position: "absolute",
                  left: `${tooltip().x}px`,
                  top: `${tooltip().y}px`,
                  transform: "translate(-50%, -100%) translateY(-12px)",
                  whiteSpace: "nowrap",
                  lineHeight: "1.5"
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

      <div class="table-container" style="margin-top: 1.5rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
        <table class="bw-table">
          <thead>
            <tr>
              <th style="width: 60px; text-align: center;">Posición</th>
              <th>Nombre del Evento</th>
              <th>Categoría</th>
              <th style="text-align: right;">Boletos Vendidos</th>
              <th style="text-align: right;">Ingresos Totales (MXN)</th>
            </tr>
          </thead>
          <tbody>
            <For each={filteredData()}>
              {(item, index) => (
                <tr>
                  <td style="text-align: center; font-weight: 800;">#{index() + 1}</td>
                  <td style="font-weight: 700;">{item.name}</td>
                  <td>{item.category}</td>
                  <td style="text-align: right;">{formatInteger(item.tickets_sold)}</td>
                  <td style="text-align: right; font-weight: 700;">{formatCurrency(item.revenue)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
