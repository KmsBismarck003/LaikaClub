import { createSignal, createResource, createMemo, For, Show } from "solid-js";
import { fetchProductSales } from "../../funciones/api";
import { formatCurrency, formatInteger, formatPeriodo } from "../../funciones/formatters";
import { prepareProductData, calculateBars } from "./funciones";
import Componente from "./componente";

const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  const [metric, setMetric] = createSignal("revenue");
  const [dateFrom, setDateFrom] = createSignal("");
  const [dateTo, setDateTo] = createSignal("");
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  // Los filtros de fecha actúan como fuente reactiva — al cambiar re-consulta la API
  const filtrosFecha = createMemo(() => ({ dateFrom: dateFrom(), dateTo: dateTo() }));
  const [data] = createResource(filtrosFecha, fetchProductSales);

  const rawProducts = createMemo(() => data()?.products_sales ?? []);
  const periodo = createMemo(() => data()?.periodo ?? { fecha_inicio: null, fecha_fin: null });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest(".chart-body");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formatted = metric() === "revenue" ? formatCurrency(val) : `${formatInteger(val)} unidades`;
    setTooltip({ show: true, x: e.clientX - rect.left, y: e.clientY - rect.top, name, value: formatted });
  };

  const handleMouseLeave = () => setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });

  const prepared = createMemo(() => {
    if (!rawProducts().length) return [];
    return prepareProductData(rawProducts(), metric());
  });

  const bars = createMemo(() =>
    calculateBars(prepared(), 500, 300, { top: 20, right: 100, bottom: 45, left: 260 })
  );

  const chartTitle = createMemo(() =>
    metric() === "revenue"
      ? "Ingresos Totales (MXN) por Producto en LaikaShop"
      : "Total de Unidades Vendidas por Producto en LaikaShop"
  );

  const chartSubtitle = createMemo(() =>
    metric() === "revenue"
      ? "Muestra la repartición del dinero cobrado por la venta de artículos de merchandising"
      : "Muestra la cantidad de piezas de merch entregadas a los clientes según el artículo"
  );

  const handleLimpiar = () => {
    setDateFrom("");
    setDateTo("");
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
            <option value="units">Unidades Vendidas</option>
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
            title={chartTitle()}
            subtitle={chartSubtitle()}
            chartSelector=".chart-body"
            tableSelector=".bw-table"
            filename={`Reporte_VentasTienda_${metric()}.pdf`}
          />
        </div>
      </div>

      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando inventario y ventas...
          </div>
        ) : rawProducts().length === 0 ? (
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-secondary); text-align: center; padding: 2rem;">
            No hay datos de ventas de merchandise disponibles para el período seleccionado.
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={prepared()} />
          }>
            <Componente
              bars={bars()}
              isRevenue={metric() === "revenue"}
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

      <div class="table-container" style="border-top: 2px solid var(--border-color); padding-top: 1rem; margin-top: 1.5rem;">
        <Show when={rawProducts().length > 0} fallback={
          <p style="font-size: 0.85rem; color: var(--text-secondary); padding: 0.5rem 0;">
            Sin datos de merchandise para mostrar.
          </p>
        }>
          <table class="bw-table">
            <thead>
              <tr>
                <th>Artículo Merch</th>
                <th style="text-align: right;">Precio Unitario</th>
                <th style="text-align: right;">Unidades vendidas</th>
                <th style="text-align: right;">Ingresos Totales (MXN)</th>
              </tr>
            </thead>
            <tbody>
              <For each={prepared()}>
                {(orig) => (
                  <tr>
                    <td style="font-weight: 700;">{orig.name}</td>
                    <td style="text-align: right;">{orig.price > 0 ? formatCurrency(orig.price) : "N/A"}</td>
                    <td style="text-align: right;">{formatInteger(orig.units_sold)} uds</td>
                    <td style="text-align: right; font-weight: 700;">{formatCurrency(orig.total_revenue)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
