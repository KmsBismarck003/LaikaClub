import React from 'react';
import { Circle, Text, Group } from 'react-konva';

const SEAT_COLORS = {
  normal:     { fill: '#2a2a2a', stroke: '#555' },
  vip:        { fill: '#1a1a2e', stroke: '#9333ea' },
  accessible: { fill: '#0f2027', stroke: '#06b6d4' },
};

function getSeatColor(seat, isSelected, isOccupied) {
  if (isSelected) return { fill: '#ffffff', stroke: '#e5e5e5' };
  if (isOccupied) return { fill: '#450a0a', stroke: '#7f1d1d' };
  return SEAT_COLORS[seat.type] || SEAT_COLORS.normal;
}

export const SEAT_R = 9;

const SeatElement = ({ seat, isSelected, onToggleSeat, onSelectBlock, blockSeatIds }) => {
  const colors = getSeatColor(seat, isSelected, false);

  return (
    <Group
      x={seat.x}
      y={seat.y}
      rotation={seat.rotation || 0}
      onClick={(e) => {
        e.cancelBubble = true;
        onToggleSeat(seat.id);
      }}
      onDblClick={(e) => {
        e.cancelBubble = true;
        if (onSelectBlock && blockSeatIds) {
          onSelectBlock(blockSeatIds);
        }
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
      }}
    >
      <Circle
        x={0}
        y={0}
        radius={SEAT_R}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 2 : 1}
      />
      {seat.type === 'vip' && (
        <Text x={-3} y={-3} text="V" fontSize={6} fill={colors.stroke} fontStyle="bold" listening={false} />
      )}
      {seat.type === 'accessible' && (
        <Text x={-3} y={-3} text="A" fontSize={6} fill={colors.stroke} fontStyle="bold" listening={false} />
      )}
      {/* Seat Number */}
      <Text
        x={-5}
        y={SEAT_R + 3}
        text={seat.number.toString()}
        fontSize={6}
        fill="rgba(255,255,255,0.4)"
        align="center"
        listening={false}
      />
    </Group>
  );
};

export default React.memo(SeatElement);
