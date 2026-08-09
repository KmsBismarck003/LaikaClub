import { createResource, createMemo, For, Show, createSignal } from "solid-js";
// Importación del recurso de API para obtener la tendencia mensual de ventas
import { fetchSalesTrend } from "../../funciones/api";
// Importación de las utilidades de formato numérico de moneda y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos y utilidades de renderizado de curvas y áreas
import { prepareTrendData, calculateAreaPath } from "./funciones";
// Importación del componente visual SVG
import Componente from "./componente";

export default function Vista() {
  // Recurso reactivo para consultar el histórico mensual de ventas desde la base de datos
  const [data] = createResource(fetchSalesTrend);

  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest('.chart-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    // Find the original item to get sales_count/transactions
    const originalItem = data()?.find(item => item.month.includes(name) || name.includes(item.month));
    const extraInfo = originalItem ? ` (${formatInteger(originalItem.sales_count)} tx)` : "";

    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name,
      value: `${formatCurrency(val)}${extraInfo}`
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
    return calculateAreaPath(prepared, 500, 300, { top: 30, right: 20, bottom: 45, left: 80 });
  });

  return (
    <div class="chart-card">
      {/* Cabecera del gráfico con títulos claros e inmediatos (menos de 5 segundos) */}
      <div class="chart-header">
        <h3 class="chart-title">Tendencia Mensual de Ingresos por Venta de Boletos</h3>
        <p class="chart-subtitle">Historial de dinero recaudado en pesos (MXN) mes a mes para todos los eventos</p>
      </div>

      {/* Contenedor principal donde se renderiza la curva temporal */}
      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Mensaje de carga asíncrona
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando tendencias históricas...
          </div>
        ) : (
          // Pasa las coordenadas calculadas al componente SVG
          <>
            <Componente 
              layout={layout()} 
              onHover={handleMouseMove} 
              onLeave={handleMouseLeave} 
            />
            <Show when={tooltip().show}>
              <div 
                class="chart-tooltip" 
                style={{
                  position: 'absolute',
                  left: `${tooltip().x}px`,
                  top: `${tooltip().y}px`,
                  transform: 'translate(-50%, -100%) translateY(-10px)',
                  'pointer-events': 'none',
                  'background-color': 'var(--bw-black)',
                  color: 'var(--bw-white)',
                  padding: '0.6rem 1rem',
                  'border-radius': '6px',
                  'font-size': '0.75rem',
                  'text-transform': 'uppercase',
                  'font-weight': '700',
                  'z-index': 100,
                  'box-shadow': '0 4px 12px rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  'white-space': 'nowrap',
                  'line-height': '1.4'
                }}
              >
                <div style="color: var(--text-secondary); font-size: 0.7rem;">Ingresos de {tooltip().name}</div>
                <div style="color: var(--color-preattentive, #ff6b00); font-size: 0.85rem; font-weight: 800; margin-top: 2px;">
                  {tooltip().value}
                </div>
              </div>
            </Show>
          </>
        )}
      </div>

      {/* Tabla detallada del comportamiento mensual de taquilla */}
      <div class="table-container" style="margin-top: 1.5rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
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
      </div>
    </div>
  );
}
