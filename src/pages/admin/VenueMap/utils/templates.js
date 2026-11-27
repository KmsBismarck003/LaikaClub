import { generateGridPoints, generateArcPoints } from './geometry';

const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const ROW_LABELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

/**
 * Helper to build a standard straight block
 */
function buildGridBlock(x, y, rowsCount, seatsPerRow, startRowIdx = 0, startNum = 1, type = 'normal') {
  const rows = ROW_LABELS.slice(startRowIdx, startRowIdx + rowsCount);
  const points = generateGridPoints(x, y, rowsCount, seatsPerRow);
  
  const blocks = rows.map((rowLabel, ri) => ({
    id: uid(),
    rowLabel,
    seats: points.filter(p => p.rowIdx === ri).map((p, ci) => ({
      id: uid(),
      col: ci,
      number: ci + startNum,
      type,
      x: p.x,
      y: p.y,
      rotation: p.rotation
    }))
  }));

  const step = 24; // 10 radius * 2 + 4 gap
  const width = seatsPerRow * step;
  const height = rowsCount * step;

  return {
    id: uid(),
    type: 'seats',
    name: `${rows[0]} – ${rows[rows.length - 1]}`,
    x, y, width, height, rotation: 0,
    color: '#3f3f46',
    price: '',
    blocks
  };
}

/**
 * Helper to build an arc block
 */
function buildArcBlock(focalX, focalY, radius, rowSpacing, startAngle, endAngle, rowsCount, seatsPerRow, startRowIdx = 0, startNum = 1, type = 'normal') {
  const rows = ROW_LABELS.slice(startRowIdx, startRowIdx + rowsCount);
  
  const blocks = rows.map((rowLabel, ri) => {
    const currentRadius = radius + (ri * rowSpacing);
    const points = generateArcPoints(focalX, focalY, currentRadius, startAngle, endAngle, seatsPerRow);
    return {
      id: uid(),
      rowLabel,
      seats: points.map((p, ci) => ({
        id: uid(),
        col: ci,
        number: ci + startNum,
        type,
        x: p.x,
        y: p.y,
        rotation: p.rotation
      }))
    };
  });

  // Calculate approximate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  blocks.forEach(b => b.seats.forEach(s => {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x);
    maxY = Math.max(maxY, s.y);
  }));

  const width = maxX === -Infinity ? 100 : (maxX - minX + 20);
  const height = maxY === -Infinity ? 100 : (maxY - minY + 20);

  return {
    id: uid(),
    type: 'seats',
    name: `${rows[0]} – ${rows[rows.length - 1]}`,
    x: focalX, // Arc blocks can just use focal as their base anchor
    y: focalY,
    width, height, rotation: 0,
    color: '#3f3f46',
    price: '',
    blocks
  };
}

export const TEMPLATES = [
  {
    id: 'cinema_small',
    name: 'Cine Pequeño',
    description: 'Sala de proyecciones pequeña (aprox. 50 asientos). Un bloque central.',
    generate: () => [
      { id: uid(), type: 'screen', name: 'Pantalla', color: '#1e3a5f', width: 240, height: 20, x: 880, y: 550, rotation: 0 },
      buildGridBlock(880, 620, 5, 10, 0, 1, 'normal')
    ]
  },
  {
    id: 'cinema_medium',
    name: 'Cine Mediano',
    description: 'Sala tradicional (aprox. 120 asientos). Dos bloques y pasillo central.',
    generate: () => [
      { id: uid(), type: 'screen', name: 'Pantalla', color: '#1e3a5f', width: 400, height: 20, x: 800, y: 550, rotation: 0 },
      buildGridBlock(800, 620, 8, 8, 0, 1, 'normal'),  // Left block
      { id: uid(), type: 'aisle', name: 'Pasillo Central', color: '#1c1c1c', width: 40, height: 192, x: 992, y: 620, rotation: 0 },
      buildGridBlock(1032, 620, 8, 8, 0, 9, 'normal')  // Right block
    ]
  },
  {
    id: 'cinema_large',
    name: 'Cine Grande',
    description: 'Sala premium (aprox. 270 asientos). Tres bloques y pasillos.',
    generate: () => [
      { id: uid(), type: 'screen', name: 'Pantalla', color: '#1e3a5f', width: 600, height: 20, x: 700, y: 480, rotation: 0 },
      buildGridBlock(700, 550, 10, 7, 0, 1, 'normal'),  // Left
      { id: uid(), type: 'aisle', name: 'Pasillo', color: '#1c1c1c', width: 40, height: 240, x: 868, y: 550, rotation: 0 },
      buildGridBlock(908, 550, 10, 10, 0, 8, 'normal'), // Center
      { id: uid(), type: 'aisle', name: 'Pasillo', color: '#1c1c1c', width: 40, height: 240, x: 1148, y: 550, rotation: 0 },
      buildGridBlock(1188, 550, 10, 7, 0, 18, 'normal') // Right
    ]
  },
  {
    id: 'auditorium_small',
    name: 'Auditorio Curvo (Chico)',
    description: 'Auditorio orgánico. Un bloque en arco curvo (aprox. 100 asientos).',
    generate: () => [
      { id: uid(), type: 'stage', name: 'Escenario', color: '#334155', width: 200, height: 80, x: 900, y: 500, rotation: 0 },
      buildArcBlock(1000, 580, 120, 30, 215, 325, 6, 16, 0, 1, 'normal')
    ]
  },
  {
    id: 'auditorium_medium',
    name: 'Auditorio Curvo (Mediano)',
    description: 'Auditorio con bloque VIP y bloque General en arco concéntrico (aprox. 250 asienos).',
    generate: () => [
      { id: uid(), type: 'stage', name: 'Escenario Principal', color: '#334155', width: 300, height: 100, x: 850, y: 480, rotation: 0 },
      // VIP Zone closer to stage
      buildArcBlock(1000, 580, 150, 30, 205, 335, 4, 18, 0, 1, 'vip'),
      { id: uid(), type: 'aisle', name: 'Pasillo Curvo', color: '#1c1c1c', width: 400, height: 20, x: 800, y: 700, rotation: 0 },
      // Normal Zone behind
      buildArcBlock(1000, 580, 280, 30, 205, 335, 6, 25, 4, 1, 'normal')
    ]
  },
  {
    id: 'arena_large',
    name: 'Arena 3/4 (Grande)',
    description: 'Estadio/Arena tipo U. Bloques envolventes apuntando al centro (aprox. 350 asientos).',
    generate: () => [
      { id: uid(), type: 'stage', name: 'Escenario Central', color: '#334155', width: 250, height: 150, x: 875, y: 600, rotation: 0 },
      // Left Wing
      buildGridBlock(600, 500, 12, 5, 0, 1, 'normal'),
      // Center curve
      buildArcBlock(1000, 675, 200, 30, 220, 320, 8, 20, 0, 100, 'normal'),
      // Right Wing
      buildGridBlock(1280, 500, 12, 5, 0, 200, 'normal')
    ]
  },
  {
    id: 'laika_custom',
    name: 'Laika',
    description: 'Plantilla especial del reto. Distribución centrada con zonas de acceso universal y filas escalonadas.',
    generate: () => {
      const centerX = 1000;
      let currentY = 550;
      const step = 24;

      const rowDefs = [
        { label: 'A', count: 15, types: Array(15).fill('accessible') },
        { label: 'B', count: 15, types: Array(15).fill('normal') },
        { label: 'C', count: 11, types: ['normal', 'normal', 'accessible', 'accessible', 'accessible', 'accessible', 'accessible', 'accessible', 'accessible', 'normal', 'normal'] },
        { label: 'D', count: 12, types: Array(12).fill('normal') },
        { label: 'E', count: 12, types: Array(12).fill('normal') },
        { label: 'F', count: 12, types: Array(12).fill('normal') },
        { label: 'G', count: 12, types: Array(12).fill('normal') },
        { label: 'H', count: 12, types: Array(12).fill('normal') },
        { label: 'I', count: 14, types: Array(14).fill('normal') },
        { label: 'J', count: 16, types: Array(16).fill('normal') },
      ];

      const blocks = rowDefs.map((def, ri) => {
        const rowWidth = def.count * step;
        const startX = centerX - (rowWidth / 2) + (step / 2);
        
        const seats = Array.from({ length: def.count }).map((_, ci) => {
          // Generar números de derecha a izquierda (ej. A15 a la izq, A1 a la der)
          const number = def.count - ci;
          return {
            id: uid(),
            col: ci,
            number,
            type: def.types[ci],
            x: startX + ci * step,
            y: currentY,
            rotation: 0
          };
        });

        currentY += step + 2; // small gap between rows

        return {
          id: uid(),
          rowLabel: def.label,
          seats
        };
      });

      return [
        { id: uid(), type: 'screen', name: 'SCREEN', color: '#ffffff', width: 420, height: 10, x: centerX - 210, y: 480, rotation: 0 },
        {
          id: uid(),
          type: 'seats',
          name: 'Zona Principal Laika',
          x: centerX - 200, y: 550, width: 400, height: 300, rotation: 0,
          color: '#3f3f46',
          price: '',
          blocks
        }
      ];
    }
  }
];
