export function prepareProductData(data, sortBy) {
  if (!data || data.length === 0) return [];
  
  // Sort descending by selected metric first
  const sorted = [...data].sort((a, b) => {
    const valA = sortBy === "revenue" ? (a.total_revenue || 0) : (a.units_sold || 0);
    const valB = sortBy === "revenue" ? (b.total_revenue || 0) : (b.units_sold || 0);
    return valB - valA;
  });
  
  // Take top 10 items instead of 3 + Others
  return sorted.slice(0, 10).map(item => ({
    name: item.name || "Producto",
    value: sortBy === "revenue" ? (item.total_revenue || 0) : (item.units_sold || 0),
    price: item.price || 0,
    units_sold: item.units_sold || 0,
    total_revenue: item.total_revenue || 0
  }));
}

export function calculateBars(preparedData, width, height, padding) {
  if (preparedData.length === 0) return [];
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...preparedData.map(d => d.value), 1);
  const barHeight = Math.min(24, (chartHeight / preparedData.length) * 0.7);
  
  return preparedData.map((d, index) => {
    const y = padding.top + index * (chartHeight / preparedData.length) + (chartHeight / preparedData.length - barHeight) / 2;
    const barWidth = (d.value / maxVal) * chartWidth;
    
    return {
      name: d.name,
      value: d.value,
      x: padding.left,
      y,
      width: barWidth,
      height: barHeight,
      revenue: d.total_revenue,
      units: d.units_sold,
      price: d.price
    };
  });
}
