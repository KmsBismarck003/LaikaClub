export function prepareCategoryData(data, metric) {
  if (!data || data.length === 0) return [];
  
  // Extract categories and values
  const formatted = data.map(item => ({
    label: item.category || "General",
    value: metric === "revenue" ? (item.revenue || 0) : (item.tickets_sold || 0)
  }));
  
  // Sort descending
  formatted.sort((a, b) => b.value - a.value);
  return formatted;
}

export function calculateBarLayout(preparedData, width, height, padding) {
  if (preparedData.length === 0) return [];
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxValue = Math.max(...preparedData.map(d => d.value), 1);
  const barWidth = Math.floor(chartWidth / preparedData.length) - 20;
  
  return preparedData.map((d, index) => {
    const barHeight = (d.value / maxValue) * chartHeight;
    const x = padding.left + index * (chartWidth / preparedData.length) + 10;
    const y = height - padding.bottom - barHeight;
    
    return {
      label: d.label,
      value: d.value,
      x,
      y,
      width: Math.max(barWidth, 10),
      height: Math.max(barHeight, 2)
    };
  });
}
