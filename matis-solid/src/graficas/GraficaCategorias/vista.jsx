import { createSignal, createResource, createMemo, For, Show } from "solid-js";
// Importación de las funciones para llamadas de API de datos de categorías
import { fetchCategoryPerformance, fetchCategoryPerformanceDetails } from "../../funciones/api";
// Importación de utilidades para dar formato legible de moneda y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de preparadores lógicos y utilidades matemáticas para coordenadas
import { prepareCategoryData, calculateBarLayout } from "./funciones";
// Importación del componente visual SVG
import Componente from "./componente";

// MODO DE EMERGENCIA (PLANTILLAS ALTERNAS)
// Cambia "default" por: "barras", "linea", "dona", "pastel", "dispersion", "histograma", "boxplot", "mapacalor", "area"
const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  // Señal reactiva para gestionar la métrica actual seleccionada: "revenue" (Ingresos) o "tickets" (Cantidad de boletos)
  const [metric, setMetric] = createSignal("revenue");
  
  // Recurso reactivo para obtener los datos de la base de datos de rendimiento de categorías
  const [data] = createResource(fetchCategoryPerformance);
  
  // ============================================================================
  // LÓGICA DE DRILL-DOWN (INTERACTIVIDAD AL CLIC)
  // ============================================================================
  // selectedCategory guarda el nombre de la categoría en la que el usuario hizo clic.
  // Si es null, significa que estamos en la vista general (Resumen).
  const [selectedCategory, setSelectedCategory] = createSignal(null);
  
  // Recurso reactivo que se activa SOLO cuando selectedCategory tiene un valor.
  // Llama a la API fetchCategoryPerformanceDetails para traer los eventos exactos.
  const [detailsData] = createResource(selectedCategory, fetchCategoryPerformanceDetails);
  // ============================================================================
  
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
    return calculateBarLayout(prepared(), 500, 300, { top: 45, right: 20, bottom: 55, left: 85 });
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
      
      {/* Contenedor principal donde se renderiza la gráfica SVG */}
      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Mensaje de carga mientras se consulta la base de datos
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Analizando base de datos...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={data()} preparedData={prepared()} />
          }>
            {/* Renderiza el SVG pasándole las coordenadas calculadas y la métrica activa */}
            <Componente 
              bars={bars()} 
              metric={metric()} 
              onHover={handleMouseMove} 
              onLeave={handleMouseLeave}
              // Al hacer clic, alterna la categoría. Si haces clic en la misma, la deselecciona (vuelve a null)
              onClick={(cat) => setSelectedCategory(cat === selectedCategory() ? null : cat)}
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

      {/* Tabla detallada al pie del gráfico para auditoría y verificación rápida */}
      <div class="table-container" style="margin-top: 1.5rem; border-top: 2px solid var(--border-color); padding-top: 1rem;">
        
        {/* Renderizado condicional (Show):
            - Si hay una categoría seleccionada y los detalles ya cargaron, muestra la tabla de desglose.
            - Si no (fallback), muestra la tabla del resumen general de categorías.
        */}
        <Show when={selectedCategory() && detailsData()} fallback={
          <>
            <h4 style="margin-bottom: 1rem; font-weight: 700; color: #000;">Resumen General de Categorías</h4>
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
                    // Decide the value to show based on metric
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
