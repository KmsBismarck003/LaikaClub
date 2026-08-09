// Importación de módulos y constructores lógicos de SolidJS
import { createSignal, createResource, createMemo, For, Show } from "solid-js";
// Importación del recurso de API para obtener las ventas de productos
import { fetchProductSales } from "../../funciones/api";
// Importación del recurso de API para obtener las ventas de productos
// Importación de formateadores legibles para números enteros y moneda mexicana
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos (límitador de 4 sectores y agregador "Otros artículos")
import { prepareProductData, calculatePieSlices } from "./funciones";
// Importación del renderizador de vectores SVG
import Componente from "./componente";

export default function Vista() {
  // Señal reactiva que gestiona el filtro de visualización: "revenue" (ingresos en pesos) o "units" (unidades vendidas)
  const [metric, setMetric] = createSignal("revenue");
  // Recurso reactivo para invocar asíncronamente las ventas de productos desde la base de datos
  const [data] = createResource(fetchProductSales);

  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest('.chart-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formatted = metric() === "revenue" ? formatCurrency(val) : `${formatInteger(val)} unidades`;
    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name,
      value: formatted
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  // Memo reactivo que procesa la respuesta: ordena y agrupa los productos past el top 3 en "Otros artículos"
  const prepared = createMemo(() => {
    if (!data()) return []; // Retorna arreglo vacío si los datos siguen cargando
    return prepareProductData(data(), metric()); // Ejecuta la consolidación
  });

  // Memo reactivo que dibuja la geometría y posiciones angulares de las rebanadas del pastel
  const slices = createMemo(() => {
    // Retorna las rebanadas con centro en (250, 150) y radio de 100px
    return calculatePieSlices(prepared(), 250, 150, 100);
  });

  // Memo reactivo para generar el título de fácil lectura (<5 segundos de decodificación)
  const chartTitle = createMemo(() => {
    return metric() === "revenue"
      ? "Ingresos en Pesos (MXN) por Tipo de Producto en LaikaShop"
      : "Total de Unidades Vendidas por Tipo de Producto en LaikaShop";
  });

  // Memo reactivo para el subtítulo aclaratorio
  const chartSubtitle = createMemo(() => {
    return metric() === "revenue"
      ? "Muestra la repartición del dinero cobrado por la venta de artículos de merchandising de la tienda oficial"
      : "Muestra la cantidad de piezas de merch entregadas a los clientes según el tipo de artículo";
  });

  return (
    <div class="chart-card">
      {/* Cabecera descriptiva e inmediata */}
      <div class="chart-header">
        <h3 class="chart-title">{chartTitle()}</h3>
        <p class="chart-subtitle">{chartSubtitle()}</p>
      </div>

      {/* Controles interactivos de filtros */}
      <div class="chart-controls">
        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Analizar Por</label>
          <select 
            class="filter-select" 
            value={metric()} 
            // Manejador del cambio de métrica de dinero vs volumen
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="revenue">Ingresos Totales (MXN)</option>
            <option value="units">Unidades Vendidas</option>
          </select>
        </div>
      </div>

      {/* Área del gráfico */}
      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Mensaje de carga para evitar pantallas vacías
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando inventario y ventas...
          </div>
        ) : (
          // Renderiza el SVG del pastel pasándole los cortes calculados
          <>
            <Componente 
              slices={slices()} 
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
                <div style="color: var(--text-secondary); font-size: 0.7rem;">{tooltip().name}</div>
                <div style="color: var(--color-preattentive, #ff6b00); font-size: 0.85rem; font-weight: 800; margin-top: 2px;">
                  {tooltip().value}
                </div>
              </div>
            </Show>
          </>
        )}
      </div>

      {/* Leyenda aclaratoria que mapea los colores correspondientes */}
      <div class="chart-legend" style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; margin-bottom: 1.5rem;">
        <For each={slices()}>
          {(slice) => (
            <div class="legend-item" style="margin-bottom: 0.25rem;">
              {/* Caja de color de la leyenda */}
              <div 
                class="legend-marker" 
                style={`background-color: ${slice.color}; border-color: ${slice.color};`} 
              />
              <span style="font-size: 0.75rem;">
                {slice.name} ({metric() === "revenue" ? formatCurrency(slice.value) : `${formatInteger(slice.value)} u.`})
              </span>
            </div>
          )}
        </For>
      </div>

      {/* Tabla detallada al pie para comprobación manual e impresión */}
      <div class="table-container" style="border-top: 2px solid var(--border-color); padding-top: 1rem;">
        <table class="bw-table">
          <thead>
            <tr>
              <th>Artículo Merch</th>
              <th style="text-align: right;">Precio Unitario promedio</th>
              <th style="text-align: right;">Unidades vendidas</th>
              <th style="text-align: right;">Ingresos Totales (MXN)</th>
              <th style="text-align: right;">Participación</th>
            </tr>
          </thead>
          <tbody>
            {/* Itera sobre los cortes calculados */}
            <For each={slices()}>
              {(slice) => {
                // Recupera el registro consolidado equivalente
                const orig = prepared().find(p => p.name === slice.name) || { price: 0, units_sold: 0, total_revenue: 0 };
                return (
                  <tr>
                    <td style="font-weight: 700;">{slice.name}</td>
                    {/* Imprime N/A en el precio de la fila agregadora "Otros artículos" */}
                    <td style="text-align: right;">{orig.price > 0 ? formatCurrency(orig.price) : "N/A"}</td>
                    <td style="text-align: right;">{formatInteger(orig.units_sold)} u.</td>
                    <td style="text-align: right; font-weight: 700;">{formatCurrency(orig.total_revenue)}</td>
                    <td style="text-align: right; font-weight: 700;">{(slice.percentage * 100).toFixed(1)}%</td>
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
