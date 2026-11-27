/**
 * Utility functions for generating seating geometries (Curves, Arcs, etc.)
 */

/**
 * Calculates a point on a Quadratic Bezier Curve.
 * @param {number} t - Interpolation parameter (0 to 1)
 * @param {Object} p0 - Start point {x, y}
 * @param {Object} p1 - Control point {x, y}
 * @param {Object} p2 - End point {x, y}
 * @returns {Object} - The point {x, y} on the curve
 */
export function getQuadraticBezierPoint(t, p0, p1, p2) {
  const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
  const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
  return { x, y };
}

/**
 * Calculates the length of a Quadratic Bezier Curve approximately.
 */
export function getBezierLength(p0, p1, p2, steps = 100) {
  let length = 0;
  let prevPoint = getQuadraticBezierPoint(0, p0, p1, p2);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const currentPoint = getQuadraticBezierPoint(t, p0, p1, p2);
    const dx = currentPoint.x - prevPoint.x;
    const dy = currentPoint.y - prevPoint.y;
    length += Math.sqrt(dx * dx + dy * dy);
    prevPoint = currentPoint;
  }
  return length;
}

/**
 * Generates points along a Quadratic Bezier Curve evenly spaced.
 */
export function generateBezierPoints(count, p0, p1, p2) {
  if (count <= 1) return [getQuadraticBezierPoint(0.5, p0, p1, p2)];
  
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    points.push(getQuadraticBezierPoint(t, p0, p1, p2));
  }
  return points;
}

/**
 * Generates an arc of seats (e.g. for an amphitheater or stadium curve)
 * @param {number} centerX - X of the arc center (focus point)
 * @param {number} centerY - Y of the arc center (focus point)
 * @param {number} radius - Distance from center
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @param {number} seatCount - Number of seats in this row
 * @returns {Array} Array of points {x, y, rotation}
 */
export function generateArcPoints(centerX, centerY, radius, startAngle, endAngle, seatCount) {
  const points = [];
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const angleStep = seatCount > 1 ? (endRad - startRad) / (seatCount - 1) : 0;

  for (let i = 0; i < seatCount; i++) {
    const currentAngle = startRad + i * angleStep;
    const x = centerX + radius * Math.cos(currentAngle);
    const y = centerY + radius * Math.sin(currentAngle);
    const rotation = (currentAngle * 180) / Math.PI + 90; 
    
    points.push({ x, y, rotation, angle: currentAngle });
  }
  
  return points;
}

/**
 * Generates a grid block (the standard straight rows)
 */
export function generateGridPoints(startX, startY, rowsCount, seatsPerRow, seatRadius = 10, seatGap = 4) {
  const step = seatRadius * 2 + seatGap;
  const points = [];
  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < seatsPerRow; c++) {
      points.push({
        rowIdx: r,
        colIdx: c,
        x: startX + c * step,
        y: startY + r * step,
        rotation: 0
      });
    }
  }
  return points;
}

/**
 * Automatically calculates the angle for a seat to face a specific target point
 */
export function getLookAtRotation(seatX, seatY, targetX, targetY) {
  const dy = targetY - seatY;
  const dx = targetX - seatX;
  const rad = Math.atan2(dy, dx);
  return (rad * 180) / Math.PI + 90;
}
