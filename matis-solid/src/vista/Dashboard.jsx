import { createSignal, createResource, createMemo, Show, For } from "solid-js";
import { fetchProductSales, fetchExecutiveKPIs, fetchTicketBuyers } from "../funciones/api";
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
  const [showBuyersModal, setShowBuyersModal] = createSignal(false);
  const [buyersData] = createResource(() => showBuyersModal() ? true : false, fetchTicketBuyers);

  const [currentPage, setCurrentPage] = createSignal(1);
  const ITEMS_PER_PAGE = 10;
  
  const paginatedBuyers = createMemo(() => {
    if (!buyersData()) return [];
    const start = (currentPage() - 1) * ITEMS_PER_PAGE;
    return buyersData().slice(start, start + ITEMS_PER_PAGE);
  });
  
  const totalPages = createMemo(() => {
    if (!buyersData()) return 1;
    return Math.ceil(buyersData().length / ITEMS_PER_PAGE) || 1;
  });

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
          Kms Bismarck
        </div>
      </header>

      {/* KPI Highlight Cards */}
      <section class="kpi-grid">
        <div class="kpi-card" style="cursor: pointer; position: relative;" onClick={() => { setShowBuyersModal(true); setCurrentPage(1); }}>
          <span class="kpi-label">Ingresos Totales (Boletería)</span>
          <span class="kpi-value">
            {kpisData.loading ? "Cargando..." : formatCurrency(kpisData()?.total_revenue)}
          </span>
          <span class="kpi-subtext">Acumulado Histórico Completo</span>
          <div style="position: absolute; top: 1rem; right: 1rem; opacity: 0.5;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
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
          Comparación
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

      {/* Modal de Compradores de Boletos */}
      <Show when={showBuyersModal()}>
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px);">
          <div style="background: var(--bg-primary); padding: 2rem; border-radius: 8px; width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column; border: 2px solid var(--border-color); box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
              <h2 style="margin: 0; font-size: 1.5rem; font-weight: 800;">Listado de Compradores (Boletería)</h2>
              <button onClick={() => setShowBuyersModal(false)} style="background: none; border: none; font-size: 1.5rem; cursor: pointer; font-weight: bold; color: var(--text-primary);">&times;</button>
            </div>
            
            <div style="overflow-y: auto; flex-grow: 1;">
              {buyersData.loading ? (
                <div style="text-align: center; padding: 2rem; font-weight: bold;">Cargando listado de compradores...</div>
              ) : (
                <table class="bw-table" style="width: 100%; border-collapse: collapse;">
                  <thead style="position: sticky; top: 0; background: var(--bg-primary); z-index: 1;">
                    <tr>
                      <th style="text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--border-color);">Usuario</th>
                      <th style="text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--border-color);">Email</th>
                      <th style="text-align: center; padding: 0.75rem; border-bottom: 2px solid var(--border-color);">Boletos Comprados</th>
                      <th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--border-color);">Total Invertido (MXN)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={paginatedBuyers()}>
                      {(buyer) => (
                        <tr style="border-bottom: 1px solid var(--border-color);">
                          <td style="padding: 0.75rem; font-weight: 600;">{buyer.name}</td>
                          <td style="padding: 0.75rem; color: var(--text-secondary);">{buyer.email}</td>
                          <td style="padding: 0.75rem; text-align: center; font-weight: bold;">{formatInteger(buyer.tickets_bought)}</td>
                          <td style="padding: 0.75rem; text-align: right; font-weight: 700;">{formatCurrency(buyer.total_spent)}</td>
                        </tr>
                      )}
                    </For>
                    <Show when={buyersData()?.length === 0}>
                      <tr>
                        <td colspan="4" style="text-align: center; padding: 2rem;">No se encontraron registros de compradores.</td>
                      </tr>
                    </Show>
                  </tbody>
                </table>
              )}
            </div>
            
            <Show when={!buyersData.loading && buyersData()?.length > 0}>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 2px solid var(--border-color); margin-top: 1rem;">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage() === 1}
                  style={{
                    padding: "0.5rem 1rem", 
                    border: "2px solid var(--border-color)", 
                    background: currentPage() === 1 ? "var(--bg-secondary)" : "var(--bg-primary)", 
                    cursor: currentPage() === 1 ? "not-allowed" : "pointer", 
                    "font-weight": "bold", 
                    "border-radius": "4px",
                    opacity: currentPage() === 1 ? 0.5 : 1
                  }}
                >
                  Anterior
                </button>
                <span style="font-weight: bold;">
                  Página {currentPage()} de {totalPages()}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages(), p + 1))}
                  disabled={currentPage() === totalPages()}
                  style={{
                    padding: "0.5rem 1rem", 
                    border: "2px solid var(--border-color)", 
                    background: currentPage() === totalPages() ? "var(--bg-secondary)" : "var(--bg-primary)", 
                    cursor: currentPage() === totalPages() ? "not-allowed" : "pointer", 
                    "font-weight": "bold", 
                    "border-radius": "4px",
                    opacity: currentPage() === totalPages() ? 0.5 : 1
                  }}
                >
                  Siguiente
                </button>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      <footer style="margin-top: 4rem; padding-top: 1.5rem; border-top: 1.5px solid var(--border-color); text-align: center; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">
        MATIS ANALYTICS PLATFORM • LAIKA CLUB 2026
      </footer>
    </div>
  );
}
