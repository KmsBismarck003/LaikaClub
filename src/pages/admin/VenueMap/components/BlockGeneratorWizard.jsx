import React, { useState } from 'react';
import { generateGridPoints, generateArcPoints } from '../utils/geometry';
import { X } from 'lucide-react';

const ROW_LABELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const BlockGeneratorWizard = ({ x, y, onConfirm, onCancel }) => {
  const [shape, setShape] = useState('grid'); // 'grid' | 'arc'
  const [rowsCount, setRowsCount] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [startNum, setStartNum] = useState(1);
  const [startRowIdx, setStartRowIdx] = useState(0);
  const [seatType, setSeatType] = useState('normal');
  const [price, setPrice] = useState('');

  // Arc specific
  const [radius, setRadius] = useState(200);
  const [startAngle, setStartAngle] = useState(225);
  const [endAngle, setEndAngle] = useState(315);
  const [rowSpacing, setRowSpacing] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rows = ROW_LABELS.slice(startRowIdx, startRowIdx + rowsCount);
    
    let generatedBlocks = [];

    if (shape === 'grid') {
      const points = generateGridPoints(x, y, rowsCount, seatsPerRow);
      generatedBlocks = rows.map((rowLabel, ri) => ({
        rowLabel,
        seats: points.filter(p => p.rowIdx === ri).map((p, ci) => ({
          col: ci,
          number: ci + startNum,
          type: seatType,
          x: p.x,
          y: p.y,
          rotation: p.rotation
        }))
      }));
    } else if (shape === 'arc') {
      generatedBlocks = rows.map((rowLabel, ri) => {
        const currentRadius = radius + (ri * rowSpacing);
        // We generate arc points assuming the clicked X,Y is the focal point
        const points = generateArcPoints(x, y, currentRadius, startAngle, endAngle, seatsPerRow);
        return {
          rowLabel,
          seats: points.map((p, ci) => ({
            col: ci,
            number: ci + startNum,
            type: seatType,
            x: p.x,
            y: p.y,
            rotation: p.rotation
          }))
        };
      });
    }

    onConfirm({
      shape,
      rows,
      blocks: generatedBlocks,
      seatType,
      price,
      x,
      y
    });
  };

  return (
    <div className="avm-modal-overlay">
      <div className="avm-modal">
        <div className="avm-modal-header">
          <h3>Generar Zona de Asientos</h3>
          <button className="avm-modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <form className="avm-modal-body" onSubmit={handleSubmit}>
          
          <div className="avm-form-group">
            <label>Forma de la Zona</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label>
                <input type="radio" checked={shape === 'grid'} onChange={() => setShape('grid')} /> Cuadrícula (Recta)
              </label>
              <label>
                <input type="radio" checked={shape === 'arc'} onChange={() => setShape('arc')} /> Arco (Auditorio Curvo)
              </label>
            </div>
          </div>

          <div className="avm-form-row">
            <div className="avm-form-group">
              <label>Cantidad de Filas</label>
              <input type="number" min="1" max="26" value={rowsCount} onChange={e => setRowsCount(Number(e.target.value))} required />
            </div>
            <div className="avm-form-group">
              <label>Asientos por Fila</label>
              <input type="number" min="1" max="100" value={seatsPerRow} onChange={e => setSeatsPerRow(Number(e.target.value))} required />
            </div>
          </div>

          <div className="avm-form-row">
            <div className="avm-form-group">
              <label>Letra de inicio</label>
              <select value={startRowIdx} onChange={e => setStartRowIdx(Number(e.target.value))}>
                {ROW_LABELS.map((lbl, i) => (
                  <option key={i} value={i}>{lbl}</option>
                ))}
              </select>
            </div>
            <div className="avm-form-group">
              <label>Número de inicio</label>
              <input type="number" min="1" value={startNum} onChange={e => setStartNum(Number(e.target.value))} required />
            </div>
          </div>

          {shape === 'arc' && (
            <div className="avm-form-group" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <label style={{ color: '#06b6d4' }}>Parámetros Curvos (El clic es el centro Focal)</label>
              <div className="avm-form-row" style={{ marginTop: '10px' }}>
                <div className="avm-form-group">
                  <label>Radio Inicial (px)</label>
                  <input type="number" value={radius} onChange={e => setRadius(Number(e.target.value))} />
                </div>
                <div className="avm-form-group">
                  <label>Separación Filas</label>
                  <input type="number" value={rowSpacing} onChange={e => setRowSpacing(Number(e.target.value))} />
                </div>
              </div>
              <div className="avm-form-row">
                <div className="avm-form-group">
                  <label>Ángulo Inicio (grados)</label>
                  <input type="number" value={startAngle} onChange={e => setStartAngle(Number(e.target.value))} />
                </div>
                <div className="avm-form-group">
                  <label>Ángulo Fin (grados)</label>
                  <input type="number" value={endAngle} onChange={e => setEndAngle(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          <div className="avm-form-row">
            <div className="avm-form-group">
              <label>Tipo de Asiento</label>
              <select value={seatType} onChange={e => setSeatType(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="vip">VIP</option>
                <option value="accessible">Accesible / Silla de Ruedas</option>
              </select>
            </div>
            <div className="avm-form-group">
              <label>Precio Base (opcional)</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>

          <div className="avm-modal-footer">
            <button type="button" className="avm-btn-cancel" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="avm-btn-confirm">Generar Bloque</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlockGeneratorWizard;
