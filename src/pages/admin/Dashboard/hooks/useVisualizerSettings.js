import { useState, useMemo } from 'react';
import { palettes } from '../components/VisualizerUtils';

/**
 * useVisualizerSettings — Hook para gestionar los parámetros estéticos y de visualización 3D.
 */
export function useVisualizerSettings() {
  const [zScale, setZScale] = useState(1.0);
  const [barWidth, setBarWidth] = useState(0.2);
  const [hMult, setHMult] = useState(1.5);
  const [opacity, setOpacity] = useState(1.0);
  const [buildingShape, setBuildingShape] = useState('cube');
  const [isWireframe, setIsWireframe] = useState(false);
  const [chartType, setChartType] = useState('2D_BAR');
  const [markerSize, setMarkerSize] = useState(12);

  const [customColor, setCustomColor] = useState('#2563eb');
  const [colorPalette, setColorPalette] = useState('deep_sea');
  const [colorMode, setColorMode] = useState('palette');

  const currentPalettes = useMemo(() => palettes(customColor), [customColor]);

  return {
    zScale, setZScale,
    barWidth, setBarWidth,
    hMult, setHMult,
    opacity, setOpacity,
    buildingShape, setBuildingShape,
    isWireframe, setIsWireframe,
    chartType, setChartType,
    markerSize, setMarkerSize,
    customColor, setCustomColor,
    colorPalette, setColorPalette,
    colorMode, setColorMode,
    currentPalettes
  };
}
