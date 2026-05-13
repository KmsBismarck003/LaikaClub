import { useCallback } from 'react';
import { makeBox, makePyramid, solidColors } from '../components/VisualizerUtils';

/**
 * usePlotGenerator — Hook para generar gráficos compatibles con Plotly a partir de datos canónicos.
 */
export function usePlotGenerator(canonicalData, settings) {
  const {
    chartType,
    buildingShape,
    markerSize,
    colorMode,
    colorPalette,
    currentPalettes,
    opacity,
    barWidth
  } = settings;

  const renderPlot = useCallback(() => {
    const plotData = [];
    if (!canonicalData || canonicalData.length === 0) return plotData;

    const labels = canonicalData.map(d => d.producto);
    const values = canonicalData.map(d => d.val_num);
    const colors = canonicalData.map((_, i) => colorMode === 'solid' ? solidColors[i % solidColors.length] : values[i]);

    if (chartType === '2D_PIE') {
      plotData.push({
        type: 'pie',
        labels: labels,
        values: values,
        textinfo: 'label+percent',
        hole: 0.4,
        marker: { 
          colors: colorMode === 'solid' 
            ? canonicalData.map((_, index) => solidColors[index % solidColors.length])
            : values,
          colorscale: colorMode === 'solid' ? null : currentPalettes[colorPalette],
        },
        automargin: true
      });
    } else if (chartType === '2D_SCATTER' || buildingShape === 'points') {
      plotData.push({
        type: 'scatter',
        mode: 'markers',
        x: labels,
        y: values,
        marker: {
          size: markerSize,
          color: colorMode === 'solid' ? colors : values,
          colorscale: colorMode === 'solid' ? null : currentPalettes[colorPalette],
          opacity: opacity,
        },
        text: labels.map((l, i) => `<b>${l}</b><br>VALOR: $${values[i].toLocaleString()}`),
        hoverinfo: 'text'
      });
    } else if (chartType === '2D_PYRAMID' || buildingShape === 'pyramid') {
      plotData.push({
        type: 'funnel',
        y: labels,
        x: values,
        textinfo: "value+percent initial",
        marker: {
          color: colorMode === 'solid' ? colors : values,
          colorscale: colorMode === 'solid' ? null : currentPalettes[colorPalette],
        }
      });
    } else {
      // DEFAULT: 2D_BAR or CUBE shape
      plotData.push({
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: colorMode === 'solid' ? colors : values,
          colorscale: colorMode === 'solid' ? null : currentPalettes[colorPalette],
          opacity: opacity,
          line: { width: 0 },
        },
        width: barWidth * 2,
        text: values.map(v => `$${v.toLocaleString()}`),
        textposition: 'outside',
        textangle: 0,
        cliponaxis: false,
        hovertemplate: '<b>%{x}</b><br>Ingreso: $%{y:,.0f}<extra></extra>',
      });
    }
    return plotData;
  }, [canonicalData, chartType, buildingShape, markerSize, colorMode, colorPalette, currentPalettes, opacity, barWidth]);

  return { renderPlot };
}
