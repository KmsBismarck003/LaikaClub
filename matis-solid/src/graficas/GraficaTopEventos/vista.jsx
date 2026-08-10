import { createSignal, createResource, createMemo, For, Show } from "solid-js";
// Importación de la llamada de API para obtener los eventos ordenados por recaudación
import { fetchTopRevenueEvents } from "../../funciones/api";
// Importación de las utilidades globales para dar formato a dinero y enteros
import { formatCurrency, formatInteger } from "../../funciones/formatters";
// Importación de utilidades lógicas locales para filtrar y computar coordenadas de barra horizontal
import { filterAndLimitEvents, calculateHorizontalBarLayout } from "./funciones";
// Importación del componente de visualización SVG del gráfico
import Componente from "./componente";

// MODO DE EMERGENCIA (PLANTILLAS ALTERNAS)
// Cambia "default" por: "barras", "linea", "dona", "pastel", "dispersion", "histograma", "boxplot", "mapacalor", "area"
const TIPO_GRAFICA = "default";
import GraficaEmergencia from "../PlantillasAlternas/MotorGraficoEmergencia";
import { BotonExportarPDF } from "../../matispdf";

export default function Vista() {
  // Señal reactiva para limitar la cantidad de barras visibles (Top 5 o Top 10)
  const [limit, setLimit] = createSignal(5);
  // Señal reactiva para filtrar por una categoría específica de evento ("ALL" o el género seleccionado)
  const [category, setCategory] = createSignal("ALL");
  // Recurso reactivo que consulta de forma asíncrona la lista de eventos y su recaudación
  const [data] = createResource(fetchTopRevenueEvents);

  // Señal reactiva para el tooltip flotante interactivo
  const [tooltip, setTooltip] = createSignal({ show: false, x: 0, y: 0, name: "", value: "" });

  const handleMouseMove = (e, name, revenue, ticketsSold) => {
    const container = e.currentTarget.closest('.chart-body');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const formattedVal = `${formatCurrency(revenue)} (${formatInteger(ticketsSold)} boletos)`;
    setTooltip({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name,
      value: formattedVal
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: "", value: "" });
  };

  // Memo reactivo que ejecuta la lógica de filtrado y recorte de datos al cambiar filtros
  const filteredData = createMemo(() => {
    if (!data()) return []; // Retorna arreglo vacío si los datos no han terminado de cargar
    return filterAndLimitEvents(data(), limit(), category()); // Aplica filtro y límite
  });

  // Memo reactivo que calcula las coordenadas exactas de las barras horizontales para el SVG de 500x300
  const bars = createMemo(() => {
    // Retorna la disposición con márgenes adaptados a nombres largos de eventos a la izquierda (left: 240)
    return calculateHorizontalBarLayout(filteredData(), 500, 300, { top: 20, right: 100, bottom: 45, left: 240 });
  });

  // Memo reactivo que extrae la lista única de categorías disponibles para alimentar el filtro desplegable
  const categoriesList = createMemo(() => {
    if (!data()) return []; // Retorna vacío si no hay datos
    const list = data().map(item => item.category).filter(Boolean); // Mapea categorías ignorando nulos
    return ["ALL", ...new Set(list)]; // Elimina duplicados agregando la opción "ALL" al inicio
  });

  return (
    <div class="chart-card">
      {/* Cabecera informativa con títulos  */}
      <div class="chart-header">
        <h3 class="chart-title">Eventos con Mayor Recaudación de Dinero por Venta de Boletos</h3>
        <p class="chart-subtitle">Muestra los eventos principales que han generado mayores ingresos totales acumulados en pesos (MXN)</p>
      </div>

      {/* Selectores y controles para filtrar e interactuar con el gráfico */}
      <div class="chart-controls">
        <div class="filter-group" style="min-width: 120px; flex: none;">
          <label class="filter-label">Ver Top</label>
          <select 
            class="filter-select" 
            value={limit()} 
            // Manejador reactivo para actualizar el número de elementos mostrados
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>
        </div>

        <div class="filter-group" style="min-width: 160px; flex: none;">
          <label class="filter-label">Categoría del Espectáculo</label>
          <select 
            class="filter-select" 
            value={category()} 
            // Manejador reactivo para filtrar por categoría
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">Todas las categorías</option>
            {/* Genera las opciones dinámicamente mapeando la lista calculada de categorías */}
            {categoriesList().filter(c => c !== "ALL").map(c => (
              <option value={c}>{c}</option>
            ))}
          </select>
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

      {/* Cuerpo principal del gráfico */}
      <div class="chart-body" style="height: 480px; display: flex; align-items: center; justify-content: center; position: relative;">
        {data.loading ? (
          // Spinner simple para indicar estado de consulta activa
          <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem;">
            Calculando top de ventas...
          </div>
        ) : (
          <Show when={TIPO_GRAFICA === "default"} fallback={
            <GraficaEmergencia tipo={TIPO_GRAFICA} rawData={filteredData()} />
          }>
            <Componente 
              bars={bars()} 
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

      {/* Tabla detallada al pie para permitir auditoría manual y visualización tabular rápida */}
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
            {/* Genera una fila por cada evento filtrado */}
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
