import { createSignal, createResource, createMemo, Show } from "solid-js";
import { fetchProductSales, fetchExecutiveKPIs } from "../funciones/api";
import { formatCurrency, formatInteger } from "../funciones/formatters";
import GraficaCategorias from "../graficas/GraficaCategorias/vista";
import GraficaTopEventos from "../graficas/GraficaTopEventos/vista";
import GraficaComparacionEventos from "../graficas/GraficaComparacionEventos/vista";
import GraficaVentasTienda from "../graficas/GraficaVentasTienda/vista";
import GraficaTendenciaTemporal from "../graficas/GraficaTendenciaTemporal/vista";
import "../estilos/global.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = createSignal("categorias");
  const [kpisData] = createResource(fetchExecutiveKPIs);
  const [productsData] = createResource(fetchProductSales);

  const totalMerchSold = createMemo(() => {
    if (!productsData()) return 0;
    return productsData().reduce((acc, item) => acc + (item.units_sold || 0), 0);
  });

  return (
    <div class="dashboard-container">
      {/* Executive Header */}
      <header class="dashboard-header" style="border-bottom: 2.5px solid var(--border-color);">
        <div class="header-title-section">
          <h1>MATIS</h1>
          <p>Consola de Inteligencia Ejecutiva y Analítica de Negocio</p>
        </div>
        <div style="font-weight: 700; text-transform: uppercase; font-size: 0.8rem; background-color: var(--bw-hover); color: var(--text-primary); padding: 0.5rem 1rem; border-radius: 9999px; letter-spacing: 0.05em;">
          Rol: Directivo / CEO
        </div>
      </header>

      {/* KPI Highlight Cards */}
      <section class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Ingresos Totales (Boletería)</span>
          <span class="kpi-value">
            {kpisData.loading ? "Cargando..." : formatCurrency(kpisData()?.total_revenue)}
          </span>
          <span class="kpi-subtext">Acumulado Histórico Completo</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Boletos Emitidos</span>
          <span class="kpi-value">
            {kpisData.loading ? "Cargando..." : formatInteger(kpisData()?.tickets_sold)}
          </span>
          <span class="kpi-subtext">Asistencia Registrada</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Artículos LaikaShop Vendidos</span>
          <span class="kpi-value">
            {productsData.loading ? "Cargando..." : formatInteger(totalMerchSold())}
          </span>
          <span class="kpi-subtext">Merchandising y Tienda</span>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav class="dashboard-tabs">
        <button 
          class={activeTab() === "categorias" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("categorias")}
        >
          Categorías de Evento
        </button>
        <button 
          class={activeTab() === "top" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("top")}
        >
          Top Eventos
        </button>
        <button 
          class={activeTab() === "comparacion" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("comparacion")}
        >
          Comparativa
        </button>
        <button 
          class={activeTab() === "tienda" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("tienda")}
        >
          LaikaShop
        </button>
        <button 
          class={activeTab() === "tendencia" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("tendencia")}
        >
          Tendencia Temporal
        </button>
      </nav>

      {/* Main Container showing only the Active Chart */}
      <main class="single-chart-container">
        <Show when={activeTab() === "categorias"}>
          <GraficaCategorias />
        </Show>
        <Show when={activeTab() === "top"}>
          <GraficaTopEventos />
        </Show>
        <Show when={activeTab() === "comparacion"}>
          <GraficaComparacionEventos />
        </Show>
        <Show when={activeTab() === "tienda"}>
          <GraficaVentasTienda />
        </Show>
        <Show when={activeTab() === "tendencia"}>
          <GraficaTendenciaTemporal />
        </Show>
      </main>

      <footer style="margin-top: 4rem; padding-top: 1.5rem; border-top: 1.5px solid var(--border-color); text-align: center; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">
        MATIS ANALYTICS PLATFORM • LAIKA CLUB 2026
      </footer>
    </div>
  );
}
