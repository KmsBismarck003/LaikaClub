/**
 * VisualizerUtils.js
 * Funciones de apoyo para la gestión de colores y paletas industriales.
 */

export const palettes = (customColor) => ({
    deep_sea: [[0, '#000033'], [0.5, '#0055aa'], [1, '#00ffff']],
    thermal: [
        [0.0, '#000000'], [0.1, '#000033'], [0.3, '#550088'], [0.5, '#aa0000'],
        [0.7, '#ff8800'], [0.9, '#ffff00'], [1.0, '#ffffff']
    ],
    plasma: [[0, '#0d0887'], [0.25, '#7e03a8'], [0.5, '#cb4679'], [0.75, '#f89441'], [1, '#f0f921']],
    viridis: [[0, '#440154'], [0.25, '#3b528b'], [0.5, '#21908d'], [0.75, '#5dc963'], [1, '#fde725']],
    magma: [[0, '#000004'], [0.25, '#51127c'], [0.5, '#b63679'], [0.75, '#fb8861'], [1, '#fcfdbf']],
    vibrant: [[0, '#003f5c'], [0.5, '#ffa600'], [1, '#bc5090']],
    monochrome: [[0, '#000000'], [1, '#666666']],
    neon_city: [[0, '#000000'], [0.5, '#ff00ff'], [1, '#00ffff']],
    industrial_gold: [[0, '#000000'], [0.5, '#4b4b4b'], [1, '#d4af37']],
    cyber: [[0, '#000000'], [0.5, '#00ff41'], [1, '#00ffff']],
    custom: [[0, '#000000'], [1, customColor || '#2563eb']]
});

export const solidColors = [
    '#18181B', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#22c55e'
];

