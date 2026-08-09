export function prepareComparisonData(eventAData, eventBData) {
  if (!eventAData || !eventBData) return { dates: [], eventA: [], eventB: [] };

  const salesA = eventAData.sales || [];
  const salesB = eventBData.sales || [];

  // Get union of all dates, sorted chronologically
  const allDates = [...new Set([
    ...salesA.map(s => s.date),
    ...salesB.map(s => s.date)
  ])].sort();

  // Create mappings for fast lookup
  const mapA = new Map(salesA.map(s => [s.date, s.revenue]));
  const mapB = new Map(salesB.map(s => [s.date, s.revenue]));

  // Build sequential data points (cumulative or daily - let's do cumulative to see growth over time)
  let cumulativeA = 0;
  let cumulativeB = 0;

  const pointsA = [];
  const pointsB = [];

  allDates.forEach(date => {
    // Add daily revenue to cumulative totals
    cumulativeA += mapA.get(date) || 0;
    cumulativeB += mapB.get(date) || 0;

    pointsA.push({ date, value: cumulativeA });
    pointsB.push({ date, value: cumulativeB });
  });

  return {
    dates: allDates,
    pointsA,
    pointsB
  };
}

export function calculateLinePaths(data, width, height, padding) {
  const { dates, pointsA, pointsB } = data;
  if (dates.length === 0) return { pathA: "", pathB: "", points: [] };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value in both series
  const maxVal = Math.max(
    ...pointsA.map(p => p.value),
    ...pointsB.map(p => p.value),
    1
  );

  const getCoordinates = (points) => {
    return points.map((p, index) => {
      const x = padding.left + (index / (dates.length - 1 || 1)) * chartWidth;
      const y = height - padding.bottom - (p.value / maxVal) * chartHeight;
      return { x, y, date: p.date, value: p.value };
    });
  };

  const coordsA = getCoordinates(pointsA);
  const coordsB = getCoordinates(pointsB);

  // Generate SVG path string "M x y L x y ..."
  const generatePath = (coords) => {
    if (coords.length === 0) return "";
    return coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, "");
  };

  return {
    pathA: generatePath(coordsA),
    pathB: generatePath(coordsB),
    coordsA,
    coordsB,
    maxValue: maxVal
  };
}
