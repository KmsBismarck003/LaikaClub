export function prepareComparisonData(eventAData, eventBData) {
  if (!eventAData || !eventBData) return { dates: [], eventA: [], eventB: [] };

  const salesA = eventAData.sales || [];
  const salesB = eventBData.sales || [];

  if (salesA.length === 0 && salesB.length === 0) {
    return { dates: [], pointsA: [], pointsB: [] };
  }

  // Get min and max dates
  const allSalesDates = [...salesA.map(s => s.date), ...salesB.map(s => s.date)].sort();
  const minDateStr = allSalesDates[0];
  const maxDateStr = allSalesDates[allSalesDates.length - 1];

  // Generate all dates between min and max
  const allDates = [];
  let current = new Date(minDateStr + 'T12:00:00Z');
  const end = new Date(maxDateStr + 'T12:00:00Z');
  
  while (current <= end) {
    allDates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  // Create mappings for fast lookup
  const mapA = new Map(salesA.map(s => [s.date, s.revenue]));
  const mapB = new Map(salesB.map(s => [s.date, s.revenue]));

  // Build sequential data points (cumulative)
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

  // Filter to weekly points to avoid cluttering the chart
  const filteredDates = [];
  const filteredPointsA = [];
  const filteredPointsB = [];

  for (let i = 0; i < allDates.length; i += 7) {
    filteredDates.push(allDates[i]);
    filteredPointsA.push(pointsA[i]);
    filteredPointsB.push(pointsB[i]);
  }
  
  // Ensure the last date is included if not already
  if (allDates.length > 0 && filteredDates[filteredDates.length - 1] !== allDates[allDates.length - 1]) {
    filteredDates.push(allDates[allDates.length - 1]);
    filteredPointsA.push(pointsA[pointsA.length - 1]);
    filteredPointsB.push(pointsB[pointsB.length - 1]);
  }

  return {
    dates: filteredDates,
    pointsA: filteredPointsA,
    pointsB: filteredPointsB
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
