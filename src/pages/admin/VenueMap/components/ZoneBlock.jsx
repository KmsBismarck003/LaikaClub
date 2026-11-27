import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import SeatElement, { SEAT_R } from './SeatElement';

const ZoneBlock = ({
  comp,
  selectedSeats,
  isSelected,
  onToggleSeat,
  onSelectBlock,
  onSelectComp,
  onDragMove,
  onDragEnd,
}) => {
  const allSeatIds = comp.blocks?.flatMap(b => b.seats.map(s => s.id)) || [];

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
    >
      {/* Selection outline */}
      {isSelected && (
        <Rect
          x={-6}
          y={-6}
          width={comp.width + 12}
          height={comp.height + 12}
          cornerRadius={8}
          stroke="#ffffff"
          strokeWidth={1.5}
          dash={[5, 3]}
          listening={false}
        />
      )}

      {/* Row labels and seats */}
      {comp.blocks?.map(block => (
        <Group key={block.id}>
          {/* Row label */}
          {block.seats.length > 0 && (
            <Text
              x={block.seats[0].x - comp.x - 16}
              y={block.seats[0].y - comp.y - SEAT_R / 2}
              text={block.rowLabel}
              fontSize={8}
              fill="rgba(255,255,255,0.3)"
              fontStyle="bold"
              fontFamily="monospace"
              align="center"
              listening={false}
            />
          )}

          {block.seats.map(seat => (
            <SeatElement
              key={seat.id}
              seat={{ ...seat, x: seat.x - comp.x, y: seat.y - comp.y }}
              isSelected={selectedSeats.includes(seat.id)}
              onToggleSeat={onToggleSeat}
              onSelectBlock={onSelectBlock}
              blockSeatIds={block.seats.map(s => s.id)}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
};

export default React.memo(ZoneBlock);
