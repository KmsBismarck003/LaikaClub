import { createSignal, createResource, createMemo, For, Show } from "solid-js";
// Importación de las funciones para llamadas de API de datos de categorías
import { fetchCategoryPerformance } from "../../funciones/api";
// Importación de utilidades para dar formato legible de moneda y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos y utilidades matemáticas para coordenadas
import { prepareCategoryData, calculateBarLayout } from "./funciones";
// Importación del componente visual SVG
import Componente from "./componente";

export default function Vista() {
  // Señal reactiva para gestionar la métrica actual seleccionada: "revenue" (Ingresos) o "tickets" (Cantidad de boletos)
  const [metric, setMetric] = createSignal("revenue");
  
  // Recurso reactivo para obtener los datos de la base de datos de rendimiento de categorías
  const [data] = createResource(fetchCategoryPerformance);
  
  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, val) => {
    const container = e.currentTarget.closest('.chart-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formatted = metric() === "revenue" ? formatCurrency(val) : `${formatInteger(val)} boletos`;
    const pct = totalValue() > 0 ? ` (${((val / totalValue()) * 100).toFixed(1)}%)` : "";
    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name,
      value: `${formatted}${pct}`
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  // Memo reactivo que prepara y ordena los datos según la métrica elegida
  const prepared = createMemo(() => {
    if (!data()) return []; // Si no hay datos cargados, retorna un arreglo vacío
    return prepareCategoryData(data(), metric()); // Retorna los datos limpios y ordenados
  });

  // Memo reactivo que calcula el ancho, alto y coordenadas (X, Y) de cada barra en el SVG de 500x300
  const bars = createMemo(() => {
    // Retorna las barras con márgenes definidos para dar espacio a títulos de ejes y etiquetas
    return calculateBarLayout(prepared(), 500, 300, { top: 35, right: 20, bottom: 45, left: 75 });
  });

  // Memo reactivo para calcular la sumatoria de todos los valores y poder derivar los porcentajes
  const totalValue = createMemo(() => {
    return prepared().reduce((sum, item) => sum + item.value, 0) || 1; // Evita división por cero
  });

  // Memo reactivo para el título dinámico autodescriptivo (evita confusión en menos de 5 segundos)
  const chartTitle = createMemo(() => {
    return metric() === "revenue"
      ? "Ingresos en Pesos (MXN) por Categoría de Evento"
      : "Cantidad de Boletos Vendidos por Categoría de Evento";
  });

  // Memo reactivo para el subtítulo explicativo de contexto
  const chartSubtitle = createMemo(() => {
    return metric() === "revenue"
      ? "Muestra el total de dinero recaudado en taquilla según el género del espectáculo musical o cultural"
      : "Muestra la cantidad acumulada de boletos entregados según el género del espectáculo";
  });

  return (
    <div class="chart-card">
      {/* Cabecera del gráfico con títulos claros e inmediatos */}
      <div class="chart-header">
        <h3 class="chart-title">{chartTitle()}</h3>
        <p class="chart-subtitle">{chartSubtitle()}</p>
      </div>
      
      {/* Panel de control de filtros interactivos */}
      <div class="chart-controls">
        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Métrica Visualizada</label>
          <select 
            class="filter-select" 
            value={metric()} 
            // Manejador del cambio de selección de la métrica
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="revenue">Ingresos Totales (MXN)</option>
            <option value="tickets">Boletos Vendidos</option>
          </select>
        </div>
      </div>
      
      {/* Contenedor principal donde se renderiza la gráfica SVG */}
      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Mensaje de carga mientras se consulta la base de datos
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando base de datos...
          </div>
        ) : (
          // Renderiza el SVG pasándole las coordenadas calculadas y la métrica activa
          <>
            <Componente 
              bars={bars()} 
              metric={metric()} 
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

      {/* Tabla detallada al pie del gráfico para auditoría y verificación rápida */}
      <div class="table-container" style="margin-top: 1.5rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
        <table class="bw-table">
          <thead>
            <tr>
              <th>Categoría de Evento</th>
              <th style="text-align: right;">{metric() === "revenue" ? "Ingresos Totales" : "Boletos Vendidos"}</th>
              <th style="text-align: right;">Participación porcentual</th>
            </tr>
          </thead>
          <tbody>
            {/* Itera sobre los datos preparados para rellenar las filas de la tabla */}
            <For each={prepared()}>
              {(item) => (
                <tr>
                  <td style="font-weight: 700;">{item.label}</td>
                  <td style="text-align: right;">
                    {/* Da formato correspondiente según el tipo de métrica en la tabla */}
                    {metric() === "revenue" ? formatCurrency(item.value) : formatInteger(item.value)}
                  </td>
                  <td style="text-align: right; font-weight: 700;">
                    {/* Calcula la proporción porcentual */}
                    {((item.value / totalValue()) * 100).toFixed(1)}%
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
