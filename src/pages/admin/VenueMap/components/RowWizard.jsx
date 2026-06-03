import React, { useState } from 'react';

const ROW_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

const COLORS = ['#3f3f46','#7c3aed','#9333ea','#2563eb','#0891b2','#059669','#d97706','#dc2626'];

const RowWizard = ({ x, y, onConfirm, onCancel }) => {
  const [numRows, setNumRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [startRowIdx, setStartRowIdx] = useState(0);
  const [startNum, setStartNum] = useState(1);
  const [seatType, setSeatType] = useState('normal');
  const [color, setColor] = useState('#3f3f46');
  const [price, setPrice] = useState('');

  const rows = ROW_LETTERS.slice(startRowIdx, startRowIdx + numRows);
  const endNum = startNum + seatsPerRow - 1;

  const handleConfirm = () => {
    onConfirm({ rows, seatsPerRow, startRow: rows[0], startNum, seatType, color, price, x, y });
  };

  return (
    <div className="avm-wizard-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="avm-wizard-box">
        <div className="avm-wizard-title">Configurar Bloque de Asientos</div>
        <div className="avm-wizard-sub">Define las filas y columnas antes de colocar el bloque.</div>

        {/* PREVIEW */}
        <div className="avm-wizard-preview">
          {rows.length === 0
            ? 'Configura las filas...'
            : rows.map(r => (
                <span key={r} className="avm-wizard-row-pill">
                  {`${r}${startNum}–${r}${endNum}`}
                </span>
              ))
          }
        </div>

        {/* FIELDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="avm-field">
            <label className="avm-field-label">Número de filas</label>
            <input
              type="number" min={1} max={26}
              value={numRows}
              onChange={e => setNumRows(Math.max(1, Math.min(26, +e.target.value)))}
              className="avm-field-input"
            />
          </div>
          <div className="avm-field">
            <label className="avm-field-label">Asientos por fila</label>
            <input
              type="number" min={1} max={100}
              value={seatsPerRow}
              onChange={e => setSeatsPerRow(Math.max(1, Math.min(100, +e.target.value)))}
              className="avm-field-input"
            />
          </div>
          <div className="avm-field">
            <label className="avm-field-label">Fila inicial</label>
            <select
              className="avm-field-input avm-field-select"
              value={startRowIdx}
              onChange={e => setStartRowIdx(+e.target.value)}
            >
              {ROW_LETTERS.map((l, i) => (
                <option key={l} value={i} disabled={i + numRows > 26}>{l}</option>
              ))}
            </select>
          </div>
          <div className="avm-field">
            <label className="avm-field-label">Número inicial</label>
            <input
              type="number" min={1}
              value={startNum}
              onChange={e => setStartNum(Math.max(1, +e.target.value))}
              className="avm-field-input"
            />
          </div>
          <div className="avm-field">
            <label className="avm-field-label">Precio base (opcional)</label>
            <input
              type="text" placeholder="ej. 350"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="avm-field-input"
            />
          </div>
          <div className="avm-field">
            <label className="avm-field-label">Tipo de asiento</label>
            <select
              className="avm-field-input avm-field-select"
              value={seatType}
              onChange={e => setSeatType(e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="vip">VIP</option>
              <option value="accessible">Accesible</option>
            </select>
          </div>
        </div>

        {/* COLOR */}
        <div className="avm-field" style={{ marginTop: '0.75rem' }}>
          <label className="avm-field-label">Color del bloque</label>
          <div className="avm-color-grid">
            {COLORS.map(c => (
              <div
                key={c}
                className={`avm-color-swatch${color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div style={{
          marginTop: '1rem', padding: '10px 12px',
          background: 'rgba(234,179,8,0.08)', borderRadius: '10px',
          border: '1px solid rgba(234,179,8,0.2)',
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)'
        }}>
          {`Total: `}
          <strong style={{ color: '#ffffff' }}>{numRows * seatsPerRow}</strong>
          {` asientos en `}
          <strong style={{ color: '#fff' }}>{numRows}</strong>
          {` fila${numRows !== 1 ? 's' : ''} × `}
          <strong style={{ color: '#fff' }}>{seatsPerRow}</strong>
          {` columna${seatsPerRow !== 1 ? 's' : ''}`}
        </div>

        <div className="avm-wizard-actions">
          <button className="avm-wizard-cancel" onClick={onCancel}>Cancelar</button>
          <button className="avm-wizard-confirm" onClick={handleConfirm}>
            ✓ Crear bloque
          </button>
        </div>
      </div>
    </div>
  );
};

export default RowWizard;
