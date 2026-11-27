import React from 'react';
import { Group, Rect, Text } from 'react-konva';

const TYPE_LABELS = { stage: 'ESCENARIO', screen: 'PANTALLA', aisle: 'PASILLO', ga: 'GENERAL' };

const StageElement = ({
  comp,
  isSelected,
  onSelectComp,
  onDragMove,
  onDragEnd
}) => {
  return (
    <Group
      x={comp.x}
      y={comp.y}
      rotation={comp.rotation || 0}
      draggable
      onDragMove={(e) => {
        if (onDragMove) {
          onDragMove(comp.id, e.target.x(), e.target.y());
        }
      }}
      onDragEnd={(e) => {
        if (onDragEnd) {
          onDragEnd(comp.id, e.target.x(), e.target.y());
        }
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelectComp(comp.id);
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'move';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
      }}
    >
      <Rect
        x={0}
        y={0}
        width={comp.width}
        height={comp.height}
        cornerRadius={6}
        fill={comp.color || '#334155'}
        stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.1)'}
        strokeWidth={isSelected ? 2 : 1}
      />
      <Text
        x={0}
        y={comp.height / 2 - 5}
        width={comp.width}
        text={TYPE_LABELS[comp.type] || comp.name}
        fontSize={10}
        fontStyle="800"
        fill="rgba(255,255,255,0.7)"
        fontFamily="Inter, sans-serif"
        align="center"
        listening={false}
      />
    </Group>
  );
};

export default React.memo(StageElement);
