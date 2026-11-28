async function fetchJson(endpoint) {
  const isLocalHost = typeof window !== 'undefined' && window.location &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const envApi = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_PILGRIM_API_URL || import.meta.env.VITE_API_URL)
    : null;
  const bases = envApi
    ? [`${envApi.replace(/\/+$/, '')}/analytics/matis`]
    : isLocalHost
      ? [
          "http://localhost:8000/api/analytics/matis",
          "http://localhost:8303/api/analytics/matis"
        ]
      : ["/api/analytics/matis"];
  let lastError;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${endpoint}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed to connect to backend analytics services.");
}

function buildQuery(base, params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

export async function fetchExecutiveKPIs() {
  const data = await fetchJson("/executive/kpis");
  return data.kpis || {};
}

export async function fetchCategoryPerformance({ dateFrom, dateTo } = {}) {
  const url = buildQuery("/executive/category-performance", { date_from: dateFrom, date_to: dateTo });
  const data = await fetchJson(url);
  return {
    performance: data.performance || [],
    periodo: data.periodo || { fecha_inicio: null, fecha_fin: null }
  };
}

export async function fetchTopRevenueEvents({ dateFrom, dateTo } = {}) {
  const url = buildQuery("/events/top-revenue", { date_from: dateFrom, date_to: dateTo });
  const data = await fetchJson(url);
  return {
    top_events: data.top_events || [],
    periodo: data.periodo || { fecha_inicio: null, fecha_fin: null }
  };
}

export async function fetchProductSales({ dateFrom, dateTo } = {}) {
  const url = buildQuery("/products/sales", { date_from: dateFrom, date_to: dateTo });
  const data = await fetchJson(url);
  return {
    products_sales: data.products_sales || [],
    periodo: data.periodo || { fecha_inicio: null, fecha_fin: null }
  };
}

export async function fetchSalesTrend() {
  const data = await fetchJson("/executive/sales-trend");
  return data.trend || [];
}

export async function fetchEventsList() {
  const data = await fetchJson("/events/list");
  return data.events || [];
}

export async function fetchEventComparison(eventA, eventB, dateFrom, dateTo) {
  const url = buildQuery("/events/compare", { event_a: eventA, event_b: eventB, date_from: dateFrom, date_to: dateTo });
  return await fetchJson(url);
}

export async function fetchCategoryPerformanceDetails(category, { dateFrom, dateTo } = {}) {
  const url = buildQuery(`/executive/category-performance/details`, { category, date_from: dateFrom, date_to: dateTo });
  const data = await fetchJson(url);
  return data.events || [];
}

export async function fetchSalesTrendDetails(month) {
  const data = await fetchJson(`/executive/sales-trend/details?month=${encodeURIComponent(month)}`);
  return data.events || [];
}

export async function fetchTicketBuyers() {
  const data = await fetchJson("/executive/ticket-buyers");
  return data.buyers || [];
}
