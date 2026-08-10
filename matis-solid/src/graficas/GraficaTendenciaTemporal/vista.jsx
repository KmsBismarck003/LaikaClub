import { createResource, createMemo, For, Show, createSignal } from "solid-js";
// Importación del recurso de API para obtener la tendencia mensual de ventas
import { fetchSalesTrend, fetchSalesTrendDetails } from "../../funciones/api";
// Importación de las utilidades de formato numérico de moneda y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos y utilidades de renderizado de curvas y áreas
import { prepareTrendData, calculateAreaPath } from "./funciones";
// Importación del componente visual SVG
import Componente from "./componente";

// MODO DE EMERGENCIA (PLANTILLAS ALTERNAS)
// Cambia "default" por: "barras", "linea", "dona", "pastel", "dispersion", "histograma", "boxplot", "mapacalor", "area"
const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  // Recurso reactivo para consultar el histórico mensual de ventas desde la base de datos
  const [data] = createResource(fetchSalesTrend);

  // ============================================================================
  // LÓGICA DE DRILL-DOWN (INTERACTIVIDAD AL CLIC)
  // ============================================================================
  // selectedMonth guarda el objeto { raw, label } del mes en el que el usuario hizo clic.
  // Si es null, muestra la vista general de meses.
  const [selectedMonth, setSelectedMonth] = createSignal(null);
  
  // Recurso que consulta la API fetchSalesTrendDetails SOLO cuando hay un mes seleccionado.
  const [detailsData] = createResource(() => selectedMonth()?.raw, fetchSalesTrendDetails);
  // ============================================================================

  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });
  let containerRef;

  const handleHover = (name, val, color, clientX, clientY) => {
    if (!containerRef) return;
    const rect = containerRef.getBoundingClientRect();
    
    // Find the original item to get sales_count/transactions
    const originalItem = data()?.find(item => item.month.includes(name) || name.includes(item.month));
    const extraInfo = originalItem ? ` (${formatInteger(originalItem.sales_count)} tx)` : "";

    setTooltip({
      show: true,
      x: clientX - rect.left,
      y: clientY - rect.top,
      name,
      value: `${formatCurrency(val)}${extraInfo}`,
      color: color
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  // Memo reactivo que calcula el área rellena y la curva del trazo para el SVG de 500x300
  const layout = createMemo(() => {
    // Si no hay datos, retorna valores vacíos por defecto
    if (!data()) return { linePath: "", areaPath: "", coords: [], maxValue: 1 };
    // Prepara e integra el histórico mensual de ingresos
    const prepared = prepareTrendData(data());
    // Calcula coordenadas del trazado adaptando los márgenes
    return calculateAreaPath(prepared, 500, 300, { top: 40, right: 20, bottom: 55, left: 90 });
  });

  return (
    <div class="chart-card">
      {/* Cabecera del gráfico con títulos claros e inmediatos (menos de 5 segundos) */}
      <div class="chart-header">
        <h3 class="chart-title">Tendencia Mensual de Ingresos por Venta de Boletos</h3>
        <p class="chart-subtitle">Historial de dinero recaudado en pesos (MXN) mes a mes para todos los eventos</p>
      </div>

      <div class="chart-controls">
        <div style="margin-left: auto;">
          <BotonExportarPDF 
            title="Tendencia Mensual de Ingresos por Venta de Boletos" 
            subtitle="Historial de dinero recaudado en pesos (MXN) mes a mes para todos los eventos" 
            chartSelector=".chart-body" 
            tableSelector=".bw-table" 
            filename="Reporte_TendenciaTemporal.pdf" 
          />
        </div>
      </div>

      {/* Contenedor principal donde se renderiza la curva temporal */}
      <div class="chart-body" ref={containerRef} style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Mensaje de carga asíncrona
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando tendencias históricas...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={data()} />
          }>
            <Componente 
              layout={layout()} 
              onHover={handleHover} 
              onLeave={handleMouseLeave} 
              // Alterna la selección del mes. Si se hace clic en el mismo mes, se limpia la selección.
              onClick={(monthObj) => setSelectedMonth(selectedMonth()?.raw === monthObj.raw ? null : monthObj)}
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
                {/* Etiqueta de contexto — negro puro sobre blanco, sin color */}
                <div style="font-size: 0.75rem; font-weight: 700; color: #000000; text-transform: uppercase; letter-spacing: 0.04em;">
                  Ingresos de {tooltip().name}
                </div>
                {/* Valor principal — negro negrita, grande y legible */}
                <div style="font-size: 0.95rem; font-weight: 800; color: #000000; margin-top: 3px; letter-spacing: -0.01em;">
                  {tooltip().value}
                </div>
              </div>
            </Show>
          </Show>
        )}
      </div>

      {/* Tabla detallada del comportamiento mensual de taquilla */}
      <div class="table-container" style="margin-top: 1.5rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
        
        {/* Renderizado condicional (Show):
            - Si el usuario seleccionó un mes y ya se cargaron los detalles, muestra la tabla de desglose.
            - Si no (fallback), muestra la tabla del resumen general de meses.
        */}
        <Show when={selectedMonth() && detailsData()} fallback={
          <>
            <h4 style="margin-bottom: 1rem; font-weight: 700; color: #000;">Resumen General de Meses</h4>
            <table class="bw-table">
              <thead>
                <tr>
                  <th>Mes del Año</th>
                  <th style="text-align: right;">Transacciones Registradas</th>
                  <th style="text-align: right;">Ingresos Totales (MXN)</th>
                  <th style="text-align: right;">Ticket Promedio por Transacción</th>
                </tr>
              </thead>
              <tbody>
                {/* Genera las filas mensuales iterando la respuesta de la base de datos */}
                <For each={data() || []}>
                  {(item) => {
                    // Calcula el costo promedio cobrado por boleto en el mes
                    const avgTicket = item.revenue / (item.sales_count || 1);
                    return (
                      <tr>
                        <td style="font-weight: 700;">{item.month}</td>
                        <td style="text-align: right;">{formatInteger(item.sales_count)} tx.</td>
                        <td style="text-align: right; font-weight: 700;">{formatCurrency(item.revenue)}</td>
                        <td style="text-align: right;">{formatCurrency(avgTicket)}</td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </>
        }>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-weight: 700; color: #000;">Desglose de Eventos en {selectedMonth()?.label}</h4>
            <button 
              onClick={() => setSelectedMonth(null)}
              style="padding: 4px 8px; border: 2px solid #000; background: transparent; font-weight: 700; cursor: pointer; font-size: 0.8rem; text-transform: uppercase;"
            >
              Volver al Resumen
            </button>
          </div>
          <table class="bw-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th style="text-align: right;">Ingresos (MXN)</th>
                <th style="text-align: right;">Boletos Vendidos</th>
              </tr>
            </thead>
            <tbody>
              <Show when={!detailsData.loading} fallback={<tr><td colspan="3">Cargando desglose...</td></tr>}>
                <For each={detailsData()}>
                  {(item) => (
                    <tr>
                      <td style="font-weight: 700;">{item.name}</td>
                      <td style="text-align: right; font-weight: 700;">{formatCurrency(item.revenue)}</td>
                      <td style="text-align: right;">{formatInteger(item.tickets_sold)}</td>
                    </tr>
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
