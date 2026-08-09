export function filterAndLimitEvents(data, limit, category) {
  if (!data || data.length === 0) return [];
  
  let filtered = [...data];
  
  // Filter by category if specified
  if (category && category !== "ALL") {
    filtered = filtered.filter(item => item.category === category);
  }
  
  // Sort descending by revenue
  filtered.sort((a, b) => b.revenue - a.revenue);
  
  // Limit results
  return filtered.slice(0, limit);
}

export function calculateHorizontalBarLayout(preparedData, width, height, padding) {
  if (preparedData.length === 0) return [];
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxValue = Math.max(...preparedData.map(d => d.revenue), 1);
  const barHeight = Math.floor(chartHeight / preparedData.length) - 10;
  
  return preparedData.map((d, index) => {
    const barWidth = (d.revenue / maxValue) * chartWidth;
    const x = padding.left;
    const y = padding.top + index * (chartHeight / preparedData.length) + 5;
    
    return {
      id: d.id,
      name: d.name,
      revenue: d.revenue,
      ticketsSold: d.tickets_sold,
      x,
      y,
      width: Math.max(barWidth, 5),
      height: Math.max(barHeight, 8)
    };
  });
}
