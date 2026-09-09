import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { fetchCategoryPerformance, fetchCategoryPerformanceDetails } from "../../funciones/api";
import { formatCurrency, formatInteger, formatPeriodo } from "../../funciones/formatters";
import { prepareCategoryData, calculateBarLayout } from "./funciones";
import Componente from "./componente";

const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  const [metric, setMetric] = createSignal("revenue");
  const [dateFrom, setDateFrom] = createSignal("");
  const [dateTo, setDateTo] = createSignal("");

  // Los filtros de fecha se convierten en la "fuente" reactiva del recurso.
  // Cada vez que cambien, createResource vuelve a llamar a la API automáticamente.
  const filtros = createMemo(() => ({ dateFrom: dateFrom(), dateTo: dateTo() }));
  const [data] = createResource(filtros, fetchCategoryPerformance);

  const rawPerformance = createMemo(() => data()?.performance ?? []);
  const periodo = createMemo(() => data()?.periodo ?? { fecha_inicio: null, fecha_fin: null });

  const [selectedCategory, setSelectedCategory] = createSignal(null);

  // El drill-down pasa también el rango de fechas activo para coherencia
  const drilldownSource = createMemo(() =>
    selectedCategory() ? { cat: selectedCategory(), dateFrom: dateFrom(), dateTo: dateTo() } : null
  );
  const [detailsData] = createResource(drilldownSource, (src) =>
    fetchCategoryPerformanceDetails(src.cat, { dateFrom: src.dateFrom, dateTo: src.dateTo })
  );

  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest(".chart-body");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formatted = metric() === "revenue" ? formatCurrency(val) : `${formatInteger(val)} boletos`;
    const pct = totalValue() > 0 ? ` (${((val / totalValue()) * 100).toFixed(1)}%)` : "";
    setTooltip({ show: true, x: e.clientX - rect.left, y: e.clientY - rect.top, name, value: `${formatted}${pct}` });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });

  const prepared = createMemo(() => {
    if (!rawPerformance().length) return [];
    return prepareCategoryData(rawPerformance(), metric());
  });

  const bars = createMemo(() =>
    calculateBarLayout(prepared(), 500, 300, { top: 45, right: 20, bottom: 55, left: 85 })
  );

  const totalValue = createMemo(() =>
    prepared().reduce((sum, item) => sum + item.value, 0) || 1
  );

  const chartTitle = createMemo(() =>
    metric() === "revenue"
      ? "Ingresos en Pesos (MXN) por Categoría de Evento"
      : "Cantidad de Boletos Vendidos por Categoría de Evento"
  );

  const chartSubtitle = createMemo(() =>
    metric() === "revenue"
      ? "Muestra el total de dinero recaudado en taquilla según el género del espectáculo musical o cultural"
      : "Muestra la cantidad acumulada de boletos entregados según el género del espectáculo"
  );

  const handleAplicar = () => {
    // Los filtros ya son reactivos — solo resetear la selección de drill-down al cambiar fechas
    setSelectedCategory(null);
  };

  const handleLimpiar = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedCategory(null);
  };

  return (
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">{chartTitle()}</h3>
        <p class="chart-subtitle">{chartSubtitle()}</p>
        <Show when={!data.loading && periodo()?.fecha_inicio}>
          <div class="chart-periodo-badge">
            <span class="chart-periodo-label">Período de datos:</span>
            <strong class="chart-periodo-valor">{formatPeriodo(periodo())}</strong>
          </div>
        </Show>
      </div>

      <div class="chart-controls">
        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Métrica Visualizada</label>
          <select class="filter-select" value={metric()} onChange={(e) => setMetric(e.target.value)}>
            <option value="revenue">Ingresos Totales (MXN)</option>
            <option value="tickets">Boletos Vendidos</option>
          </select>
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Desde</label>
          <input
            type="date"
            class="filter-input"
            value={dateFrom()}
            onInput={(e) => { setDateFrom(e.target.value); handleAplicar(); }}
          />
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Hasta</label>
          <input
            type="date"
            class="filter-input"
            value={dateTo()}
            onInput={(e) => { setDateTo(e.target.value); handleAplicar(); }}
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
            title={chartTitle()}
            subtitle={chartSubtitle()}
            chartSelector=".chart-body"
            tableSelector=".bw-table"
            filename={`Reporte_Categorias_${metric()}.pdf`}
          />
        </div>
      </div>

      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando base de datos...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={data()} preparedData={prepared()} />
          }>
            <Componente
              bars={bars()}
              metric={metric()}
              periodo={periodo()}
              onHover={handleMouseMove}
              onLeave={handleMouseLeave}
              onClick={(cat) => setSelectedCategory(cat === selectedCategory() ? null : cat)}
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
        <Show when={selectedCategory() && detailsData()} fallback={
          <>
            <h4 style="margin-bottom: 1rem; font-weight: 700; color: #000;">
              Resumen General de Categorías
              <span style="margin-left: 1rem; font-size: 0.75rem; font-weight: 600; color: #555; vertical-align: middle;">
                {formatPeriodo(periodo())}
              </span>
            </h4>
            <table class="bw-table">
              <thead>
                <tr>
                  <th>Categoría de Evento</th>
                  <th style="text-align: right;">{metric() === "revenue" ? "Ingresos Totales" : "Boletos Vendidos"}</th>
                  <th style="text-align: right;">Participación porcentual</th>
                </tr>
              </thead>
              <tbody>
                <For each={prepared()}>
                  {(item) => (
                    <tr>
                      <td style="font-weight: 700;">{item.label}</td>
                      <td style="text-align: right;">
                        {metric() === "revenue" ? formatCurrency(item.value) : formatInteger(item.value)}
                      </td>
                      <td style="text-align: right; font-weight: 700;">
                        {((item.value / totalValue()) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </>
        }>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-weight: 700; color: #000;">Desglose de Eventos: {selectedCategory()}</h4>
            <button
              onClick={() => setSelectedCategory(null)}
              style="padding: 4px 8px; border: 2px solid #000; background: transparent; font-weight: 700; cursor: pointer; font-size: 0.8rem; text-transform: uppercase;"
            >
              Volver al Resumen
            </button>
          </div>
          <table class="bw-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th style="text-align: right;">{metric() === "revenue" ? "Ingresos (MXN)" : "Boletos"}</th>
              </tr>
            </thead>
            <tbody>
              <Show when={!detailsData.loading} fallback={<tr><td colspan="2">Cargando desglose...</td></tr>}>
                <For each={detailsData()}>
                  {(item) => {
                    const val = metric() === "revenue" ? item.revenue : item.tickets_sold;
                    return (
                      <tr>
                        <td style="font-weight: 700;">{item.name}</td>
                        <td style="text-align: right;">
                          {metric() === "revenue" ? formatCurrency(val) : formatInteger(val)}
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </Show>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
