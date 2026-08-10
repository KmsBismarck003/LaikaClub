export function prepareTrendData(data) {
  if (!data || data.length === 0) return [];
  
  // Format months and revenues
  return data.map(item => ({
    monthName: formatMonthName(item.month),
    revenue: item.revenue || 0,
    count: item.count || 0,
    originalMonth: item.month
  }));
}

function formatMonthName(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const index = parseInt(parts[1], 10) - 1;
  return months[index] || parts[1];
}

export function calculateAreaPath(preparedData, width, height, padding) {
  if (preparedData.length === 0) return { linePath: "", areaPath: "", coords: [], maxVal: 1 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...preparedData.map(d => d.revenue), 1);
  const baselineY = height - padding.bottom;
  
  const coords = preparedData.map((d, index) => {
    const x = padding.left + (index / (preparedData.length - 1 || 1)) * chartWidth;
    const y = baselineY - (d.revenue / maxVal) * chartHeight;
    return { x, y, monthName: d.monthName, revenue: d.revenue, originalMonth: d.originalMonth };
  });
  
  // Line Path: M x0 y0 L x1 y1 ...
  const linePath = coords.reduce((acc, c, i) => {
    return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, "");
  
  // Area Path: closed polygon starting at (firstX, baselineY), moving to line coordinates, then (lastX, baselineY), then Z
  let areaPath = "";
  if (coords.length > 0) {
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    areaPath = `M ${firstX} ${baselineY} ` + coords.reduce((acc, c) => `${acc} L ${c.x} ${c.y}`, "") + ` L ${lastX} ${baselineY} Z`;
  }
  
  return {
    linePath,
    areaPath,
    coords,
    maxValue: maxVal
  };
}
