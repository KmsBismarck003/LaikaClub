import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import ZoneBlock from './ZoneBlock';
import StageElement from './StageElement';

const CanvasEngine = ({
  components,
  selectedId,
  selectedSeats,
  activeTool,
  viewBox,
  setViewBox,
  onCanvasClick,
  onSelectComponent,
  onMoveComponent,
  onToggleSeat,
  onSelectBlock,
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [ghostPos, setGhostPos] = useState(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    // limit zoom
    const boundedScale = Math.max(0.1, Math.min(newScale, 5));

    setViewBox({
      zoom: boundedScale,
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    });
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getRelativePointerPosition();
    
    if (activeTool !== 'select' && activeTool !== 'pan') {
      setGhostPos(pos);
    } else {
      setGhostPos(null);
    }
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      onSelectComponent(null);
      if (activeTool !== 'select' && activeTool !== 'pan') {
        const pos = e.target.getStage().getRelativePointerPosition();
        onCanvasClick(Math.round(pos.x), Math.round(pos.y));
      }
    }
  };

  const isPanning = activeTool === 'pan';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: isPanning ? 'grab' : 'default' }}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={viewBox.zoom}
        scaleY={viewBox.zoom}
        x={viewBox.x}
        y={viewBox.y}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
        draggable={isPanning}
        onDragEnd={(e) => {
          if (isPanning && e.target === e.target.getStage()) {
             setViewBox(prev => ({ ...prev, x: e.target.x(), y: e.target.y() }));
          }
        }}
      >
        <Layer>
          {/* Workspace Background */}
          <Rect
            x={0}
            y={0}
            width={2000}
            height={1500}
            fill="#111114"
            cornerRadius={16}
            name="background"
          />

          {/* Center Lines */}
          <Line points={[0, 750, 2000, 750]} stroke="rgba(255,255,255,0.03)" dash={[6, 4]} listening={false} />
          <Line points={[1000, 0, 1000, 1500]} stroke="rgba(255,255,255,0.03)" dash={[6, 4]} listening={false} />

          <Text
            x={1000}
            y={740}
            text="LÍNEA CENTRAL"
            fontSize={8}
            fontStyle="bold"
            fill="rgba(255,255,255,0.08)"
            fontFamily="monospace"
            align="center"
            offsetX={30}
            listening={false}
          />

          <Text
            x={20}
            y={35}
            text="ÁREA DE TRABAJO DE LA SALA (2000 x 1500 px)"
            fontSize={11}
            fontStyle="800"
            fill="rgba(255,255,255,0.15)"
            fontFamily="Inter, sans-serif"
            listening={false}
          />
        </Layer>

        <Layer>
          {/* Render Components */}
          {components.map(comp => {
            const isSelected = comp.id === selectedId;
            if (comp.type === 'seats') {
              return (
                <ZoneBlock
                  key={comp.id}
                  comp={comp}
                  selectedSeats={selectedSeats}
                  isSelected={isSelected}
                  onToggleSeat={onToggleSeat}
                  onSelectBlock={onSelectBlock}
                  onSelectComp={onSelectComponent}
                  onDragMove={(id, x, y) => {}}
                  onDragEnd={(id, x, y) => onMoveComponent(id, x - comp.x, y - comp.y)}
                />
              );
            }
            return (
              <StageElement
                key={comp.id}
                comp={comp}
                isSelected={isSelected}
                onSelectComp={onSelectComponent}
                onDragMove={(id, x, y) => {}}
                onDragEnd={(id, x, y) => onMoveComponent(id, x - comp.x, y - comp.y)}
              />
            );
          })}

          {/* Ghost Cursor */}
          {ghostPos && activeTool === 'add-seats' && (
            <Rect x={ghostPos.x - 10} y={ghostPos.y - 10} width={20} height={20} stroke="#fff" dash={[4, 2]} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEngine;
