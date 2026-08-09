export function prepareProductData(data, sortBy) {
  if (!data || data.length === 0) return [];
  
  // Sort descending by selected metric first
  const sorted = [...data].sort((a, b) => {
    const valA = sortBy === "revenue" ? (a.total_revenue || 0) : (a.units_sold || 0);
    const valB = sortBy === "revenue" ? (b.total_revenue || 0) : (b.units_sold || 0);
    return valB - valA;
  });
  
  if (sorted.length <= 4) {
    return sorted.map(item => ({
      name: item.name || "Producto",
      value: sortBy === "revenue" ? (item.total_revenue || 0) : (item.units_sold || 0),
      price: item.price || 0,
      units_sold: item.units_sold || 0,
      total_revenue: item.total_revenue || 0
    }));
  }
  
  const top3 = sorted.slice(0, 3).map(item => ({
    name: item.name || "Producto",
    value: sortBy === "revenue" ? (item.total_revenue || 0) : (item.units_sold || 0),
    price: item.price || 0,
    units_sold: item.units_sold || 0,
    total_revenue: item.total_revenue || 0
  }));
  
  const others = sorted.slice(3);
  const othersRevenue = others.reduce((acc, item) => acc + (item.total_revenue || 0), 0);
  const othersUnits = others.reduce((acc, item) => acc + (item.units_sold || 0), 0);
  
  const othersItem = {
    name: "Otros artículos",
    value: sortBy === "revenue" ? othersRevenue : othersUnits,
    price: 0,
    units_sold: othersUnits,
    total_revenue: othersRevenue
  };
  
  return [...top3, othersItem];
}

export function calculatePieSlices(preparedData, cx, cy, radius) {
  if (preparedData.length === 0) return [];
  
  const total = preparedData.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return [];
  
  let currentAngle = -Math.PI / 2; // Start at 12 o'clock
  const colors = ["#3b82f6", "#f97316", "#10b981", "#94a3b8"]; // Modern distinct colors
  
  return preparedData.map((d, index) => {
    const percentage = d.value / total;
    const angleDelta = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDelta;
    currentAngle = endAngle;
    
    // Coordinates
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    
    // Large arc flag
    const largeArcFlag = angleDelta > Math.PI ? 1 : 0;
    
    // SVG Path
    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    return {
      name: d.name,
      value: d.value,
      percentage,
      pathD,
      color: colors[index % colors.length]
    };
  });
}
