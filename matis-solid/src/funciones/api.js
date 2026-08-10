async function fetchJson(endpoint) {
  const bases = [
    "http://localhost:8000/api/analytics/matis",
    "http://localhost:8009/api/analytics/matis",
    "http://localhost:8007/api/analytics/matis"
  ];
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

export async function fetchExecutiveKPIs() {
  const data = await fetchJson("/executive/kpis");
  return data.kpis || {};
}

export async function fetchCategoryPerformance() {
  const data = await fetchJson("/executive/category-performance");
  return data.performance || [];
}

export async function fetchTopRevenueEvents() {
  const data = await fetchJson("/events/top-revenue");
  return data.top_events || [];
}

export async function fetchProductSales() {
  const data = await fetchJson("/products/sales");
  return data.products_sales || [];
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
  let query = `/events/compare?event_a=${eventA}&event_b=${eventB}`;
  if (dateFrom) query += `&date_from=${dateFrom}`;
  if (dateTo) query += `&date_to=${dateTo}`;
  return await fetchJson(query);
}

export async function fetchCategoryPerformanceDetails(category) {
  const data = await fetchJson(`/executive/category-performance/details?category=${encodeURIComponent(category)}`);
  return data.events || [];
}

export async function fetchSalesTrendDetails(month) {
  const data = await fetchJson(`/executive/sales-trend/details?month=${encodeURIComponent(month)}`);
  return data.events || [];
}
