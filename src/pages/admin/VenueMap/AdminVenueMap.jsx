import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueAPI } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import RowWizard from './components/RowWizard';
import SeatCanvas from './components/SeatCanvas';
import PropsPanel from './components/PropsPanel';
import Toolbox from './components/Toolbox';
import './AdminVenueMap.css';

// ── Helpers ──────────────────────────────────────────────────
const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const ROW_LABELS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

function renumberBlock(block) {
  const byRow = {};
  block.seats.forEach(s => {
    if (!byRow[s.rowLabel]) byRow[s.rowLabel] = [];
    byRow[s.rowLabel].push(s);
  });
  const renumbered = [];
  Object.keys(byRow).sort().forEach(row => {
    byRow[row]
      .sort((a, b) => a.col - b.col)
      .forEach((seat, idx) => {
        renumbered.push({ ...seat, number: idx + 1 });
      });
  });
  return { ...block, seats: renumbered };
}

// ── Main Component ────────────────────────────────────────────
const AdminVenueMap = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomInfo, setRoomInfo] = useState({ name: 'Sala' });
  const [totalCapacity, setTotalCapacity] = useState(0);

  // components: { id, type, name, x, y, width, height, rotation, color, blocks?, label? }
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // seat ids

  // wizard state
  const [wizard, setWizard] = useState(null); // null | { mode: 'row-block' | 'element', ... }

  // active tool: 'select' | 'add-seats' | 'add-stage' | 'add-screen' | 'add-aisle' | 'add-ga'
  const [activeTool, setActiveTool] = useState('select');

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [viewBox, setViewBox] = useState({ x: 0, y: 0, zoom: 1 });

  const hasFittedRef = useRef(false);

  const fitToScreen = useCallback(() => {
    const containerEl = document.querySelector('.avm-canvas-area');
    const containerW = containerEl ? containerEl.clientWidth : 1000;
    const containerH = containerEl ? containerEl.clientHeight : 600;

    if (components.length === 0) {
      // Fit workspace (2000x1500)
      const boundsW = 2000;
      const boundsH = 1500;
      const zoomW = containerW / boundsW;
      const zoomH = containerH / boundsH;
      const newZoom = Math.max(0.2, Math.min(1.2, Math.min(zoomW, zoomH) * 0.9));
      
      setViewBox({
        x: 1000 - (containerW / 2) / newZoom,
        y: 750 - (containerH / 2) / newZoom,
        zoom: newZoom
      });
      return;
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    components.forEach(c => {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + (c.width || 0));
      maxY = Math.max(maxY, c.y + (c.height || 0));
    });

    const padding = 120;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const boundsW = maxX - minX;
    const boundsH = maxY - minY;

    const zoomW = containerW / boundsW;
    const zoomH = containerH / boundsH;
    const newZoom = Math.max(0.15, Math.min(2.5, Math.min(zoomW, zoomH)));

    const centerX = minX + boundsW / 2;
    const centerY = minY + boundsH / 2;

    setViewBox({
      x: centerX - (containerW / 2) / newZoom,
      y: centerY - (containerH / 2) / newZoom,
      zoom: newZoom
    });
  }, [components]);

  // ── Load map ──────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      try {
        const res = await venueAPI.getRoomMap(roomId);
        if (res) {
          setRoomInfo(res);
          setTotalCapacity(res.total_capacity || res.capacity || 0);
          if (res.layout_json?.components) {
            setComponents(res.layout_json.components);
          }
        }
      } catch (err) {
        if (err?.response?.status !== 404) showError('Error cargando el mapa');
      } finally {
        setLoading(false);
      }
    })();
  }, [roomId]);

  // Centrar vista al terminar de cargar por primera vez
  useEffect(() => {
    if (!loading && roomInfo && !hasFittedRef.current) {
      hasFittedRef.current = true;
      setTimeout(fitToScreen, 200);
    }
  }, [loading, roomInfo, fitToScreen]);

  // ── History ───────────────────────────────────────────────
  const snapshot = useCallback(() => {
    setHistory(prev => [...prev.slice(-29), JSON.parse(JSON.stringify(components))]);
    setRedoStack([]);
  }, [components]);

  const undo = useCallback(() => {
    if (!history.length) return;
    setRedoStack(prev => [JSON.parse(JSON.stringify(components)), ...prev]);
    setComponents(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  }, [history, components]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(components))]);
    setComponents(redoStack[0]);
    setRedoStack(prev => prev.slice(1));
  }, [redoStack, components]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') { setSelectedId(null); setSelectedSeats([]); setActiveTool('select'); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSeats.length) {
        e.preventDefault(); deleteSelectedSeats();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !selectedSeats.length) {
        e.preventDefault(); deleteComponent(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, selectedId, selectedSeats]);

  // ── Seat count ────────────────────────────────────────────
  const totalSeats = components.reduce((sum, c) => {
    if (c.type !== 'seats') return sum;
    return sum + (c.blocks?.reduce((bs, b) => bs + b.seats.length, 0) || 0);
  }, 0);

  // ── Canvas click → add element ────────────────────────────
  const handleCanvasClick = useCallback((canvasX, canvasY) => {
    if (activeTool === 'select') return;

    if (activeTool === 'add-seats') {
      setWizard({ mode: 'seats', x: canvasX, y: canvasY });
      return;
    }

    // Non-seat element
    const typeMap = {
      'add-stage':  { type: 'stage',  name: 'Escenario', color: '#334155', width: 160, height: 50 },
      'add-screen': { type: 'screen', name: 'Pantalla',  color: '#1e3a5f', width: 180, height: 20 },
      'add-aisle':  { type: 'aisle',  name: 'Pasillo',   color: '#1c1c1c', width: 120, height: 30 },
      'add-ga':     { type: 'ga',     name: 'General',   color: '#14532d', width: 140, height: 80 },
    };
    const def = typeMap[activeTool];
    if (!def) return;

    snapshot();
    const newComp = {
      id: uid(), x: canvasX - def.width / 2, y: canvasY - def.height / 2,
      rotation: 0, ...def,
    };
    setComponents(prev => [...prev, newComp]);
    setSelectedId(newComp.id);
    setActiveTool('select');
  }, [activeTool, snapshot]);

  // ── Wizard confirm ────────────────────────────────────────
  const handleWizardConfirm = (wizardData) => {
    snapshot();
    const { rows, seatsPerRow, startRow, startNum, seatType, color, price, x, y } = wizardData;

    const SEAT_R = 10;
    const SEAT_GAP = 4;
    const step = SEAT_R * 2 + SEAT_GAP;

    const blocks = rows.map((rowLabel, ri) => {
      const seats = Array.from({ length: seatsPerRow }, (_, ci) => ({
        id: uid(),
        rowLabel,
        col: ci,
        number: ci + startNum,
        type: seatType || 'normal',
        x: x + ci * step,
        y: y + ri * step,
      }));
      return { id: uid(), rowLabel, seats };
    });

    const width = seatsPerRow * step;
    const height = rows.length * step;

    const newComp = {
      id: uid(), type: 'seats',
      name: `${rows[0]}${startNum}–${rows[rows.length - 1]}${seatsPerRow + startNum - 1}`,
      x, y, width, height, rotation: 0,
      color: color || '#3f3f46',
      price: price || '',
      blocks,
    };
    setComponents(prev => [...prev, newComp]);
    setSelectedId(newComp.id);
    setWizard(null);
    setActiveTool('select');
  };

  // ── Update component ──────────────────────────────────────
  const updateComponent = useCallback((id, updates) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // ── Move component ────────────────────────────────────────
  const moveComponent = useCallback((id, dx, dy) => {
    setComponents(prev => prev.map(c => {
      if (c.id !== id) return c;
      const nx = c.x + dx;
      const ny = c.y + dy;
      if (c.type !== 'seats') return { ...c, x: nx, y: ny };
      return {
        ...c, x: nx, y: ny,
        blocks: c.blocks.map(b => ({
          ...b, seats: b.seats.map(s => ({ ...s, x: s.x + dx, y: s.y + dy }))
        }))
      };
    }));
  }, []);

  // ── Delete component ──────────────────────────────────────
  const deleteComponent = useCallback((id) => {
    snapshot();
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelectedId(null);
    setSelectedSeats([]);
  }, [snapshot]);

  // ── Delete selected seats ─────────────────────────────────
  const deleteSelectedSeats = useCallback(() => {
    if (!selectedSeats.length) return;
    snapshot();
    setComponents(prev => prev.map(c => {
      if (c.type !== 'seats') return c;
      const newBlocks = c.blocks.map(b => {
        const filtered = b.seats.filter(s => !selectedSeats.includes(s.id));
        return renumberBlock({ ...b, seats: filtered });
      }).filter(b => b.seats.length > 0);
      return { ...c, blocks: newBlocks };
    }));
    setSelectedSeats([]);
  }, [selectedSeats, snapshot]);

  // ── Change seat type for selection ───────────────────────
  const changeSeatType = useCallback((type) => {
    if (!selectedSeats.length) return;
    setComponents(prev => prev.map(c => {
      if (c.type !== 'seats') return c;
      return {
        ...c, blocks: c.blocks.map(b => ({
          ...b, seats: b.seats.map(s =>
            selectedSeats.includes(s.id) ? { ...s, type } : s
          )
        }))
      };
    }));
  }, [selectedSeats]);

  // ── Add individual seat to a block ───────────────────────
  const addSeatToComponent = useCallback((compId) => {
    setComponents(prev => prev.map(c => {
      if (c.id !== compId || c.type !== 'seats') return c;
      const lastBlock = c.blocks[c.blocks.length - 1] || { id: uid(), rowLabel: 'A', seats: [] };
      const lastSeat = lastBlock.seats[lastBlock.seats.length - 1];
      const newSeat = {
        id: uid(),
        rowLabel: lastBlock.rowLabel,
        col: (lastSeat?.col ?? -1) + 1,
        number: (lastSeat?.number ?? 0) + 1,
        type: 'normal',
        x: (lastSeat?.x ?? c.x) + 24,
        y: lastSeat?.y ?? c.y,
      };
      const updatedBlock = { ...lastBlock, seats: [...lastBlock.seats, newSeat] };
      const blocks = c.blocks.length
        ? c.blocks.map((b, i) => i === c.blocks.length - 1 ? updatedBlock : b)
        : [updatedBlock];
      return { ...c, blocks };
    }));
  }, []);

  // ── Duplicate component ───────────────────────────────────
  const duplicateComponent = useCallback((id) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    snapshot();
    const deepCopy = JSON.parse(JSON.stringify(comp));
    deepCopy.id = uid();
    deepCopy.x += 30;
    deepCopy.y += 30;
    if (deepCopy.blocks) {
      deepCopy.blocks = deepCopy.blocks.map(b => ({
        ...b, id: uid(),
        seats: b.seats.map(s => ({ ...s, id: uid(), x: s.x + 30, y: s.y + 30 }))
      }));
    }
    setComponents(prev => [...prev, deepCopy]);
    setSelectedId(deepCopy.id);
  }, [components, snapshot]);

  // ── Save ──────────────────────────────────────────────────
  const saveMap = async () => {
    setSaving(true);
    try {
      const payload = {
        layout_mode: 'map',
        layout_json: { components },
        // flat lists for backend compatibility
        zones: components.filter(c => c.type === 'seats').map(c => ({
          id: c.backendId || null,
          frontend_id: c.id,
          name: c.name,
          color_hex: c.color || '#3f3f46',
          base_price: parseFloat(c.price) || 0,
          capacity: c.blocks?.reduce((s, b) => s + b.seats.length, 0) || 0,
          geometry_json: { type: 'grid', x: c.x, y: c.y, rotation: c.rotation || 0 },
          blocks: c.blocks?.map(b => ({
            id: b.backendId || null,
            frontend_id: b.id,
            name: b.rowLabel,
            seats: b.seats.map(s => ({
              id: s.backendId || null,
              frontend_id: s.id,
              row_label: s.rowLabel,
              seat_number: s.number,
              seat_type: s.type,
              x_pos: s.x,
              y_pos: s.y,
            }))
          }))
        })),
        elements: components.filter(c => c.type !== 'seats').map(c => ({
          type: c.type, name: c.name, x: c.x, y: c.y,
          width: c.width, height: c.height, rotation: c.rotation || 0, color: c.color
        }))
      };
      await venueAPI.saveRoomMap(roomId, payload);
      success('¡Mapa guardado!');
    } catch (err) {
      showError('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selected = components.find(c => c.id === selectedId) || null;

  // ─────────────────────────────────────────────────────────
  return (
    <div className="avm-root">
      {/* HEADER */}
      <header className="avm-header">
        <div className="avm-header-left">
          <button className="avm-back-btn" onClick={() => navigate('/admin/venues')}>
            ← VOLVER
          </button>
          <div className="avm-sep" />
          <div className="avm-title">
            <span>{roomInfo.name}</span>
            <span> | Editor</span>
          </div>
        </div>

        <div className="avm-header-center">
          <button className="avm-icon-btn" onClick={undo} disabled={!history.length} title="Deshacer (Ctrl+Z)">↩</button>
          <button className="avm-icon-btn" onClick={redo} disabled={!redoStack.length} title="Rehacer (Ctrl+Y)">↪</button>
        </div>

        <div className="avm-header-right">
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
            {`${totalSeats} asientos${totalCapacity > 0 ? ` / ${totalCapacity}` : ''}`}
          </span>
          <div className="avm-sep" />
          <button className="avm-save-btn" onClick={saveMap} disabled={saving}>
            {saving ? '...' : '💾 GUARDAR'}
          </button>
        </div>
      </header>

      <div className="avm-body">
        {/* TOOLBOX */}
        <Toolbox
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          components={components}
          selectedId={selectedId}
          onSelectComponent={id => { setSelectedId(id); setSelectedSeats([]); }}
        />

        {/* CANVAS */}
        <div className="avm-canvas-area">
          <div className="avm-canvas-bg" />
          {loading ? (
            <div className="avm-loading-overlay">
              <div className="avm-loading-spinner" />
              <div className="avm-loading-text">Cargando mapa…</div>
            </div>
          ) : (
            <SeatCanvas
              components={components}
              selectedId={selectedId}
              selectedSeats={selectedSeats}
              activeTool={activeTool}
              viewBox={viewBox}
              setViewBox={setViewBox}
              onCanvasClick={handleCanvasClick}
              onSelectComponent={(id) => { setSelectedId(id); setSelectedSeats([]); }}
              onMoveComponent={(id, dx, dy) => { snapshot(); moveComponent(id, dx, dy); }}
              onToggleSeat={(seatId) => {
                setSelectedSeats(prev =>
                  prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
                );
              }}
              onSelectBlock={(seatIds) => setSelectedSeats(seatIds)}
            />
          )}

          {/* Selection action bar */}
          {selectedSeats.length > 0 && (
            <div className="avm-selection-bar" key="avm-selection-bar">
              <span className="avm-selection-count">{selectedSeats.length}</span>
              <span className="avm-selection-text">asientos seleccionados</span>
              <button className="avm-sel-btn" onClick={() => changeSeatType('normal')}>Normal</button>
              <button className="avm-sel-btn" onClick={() => changeSeatType('vip')} style={{ color: '#a855f7' }}>VIP</button>
              <button className="avm-sel-btn" onClick={() => changeSeatType('accessible')} style={{ color: '#06b6d4' }}>Acc</button>
              <div className="avm-sep" />
              <button className="avm-sel-btn danger" onClick={deleteSelectedSeats}>Eliminar</button>
              <button className="avm-sel-btn" onClick={() => setSelectedSeats([])}>X</button>
            </div>
          )}

          {/* Capacity badge */}
          {totalCapacity > 0 && (
            <div className="avm-capacity-badge">
              <div className="avm-cap-row">
                <span className="avm-cap-label">Asientos</span>
                <span className="avm-cap-value">{`${totalSeats} / ${totalCapacity}`}</span>
              </div>
              <div className="avm-cap-bar">
                <div
                  className={`avm-cap-fill${totalSeats > totalCapacity ? ' over' : ''}`}
                  style={{ width: `${Math.min(100, (totalSeats / totalCapacity) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Zoom controls */}
          <div className="avm-zoom-controls">
            <button className="avm-zoom-btn" onClick={() => setViewBox(v => ({ ...v, zoom: Math.min(v.zoom + 0.15, 4) }))} title="Aumentar zoom">＋</button>
            <div className="avm-zoom-pct">{Math.round(viewBox.zoom * 100)}%</div>
            <button className="avm-zoom-btn" onClick={() => setViewBox(v => ({ ...v, zoom: Math.max(v.zoom - 0.15, 0.3) }))} title="Disminuir zoom">－</button>
            <button className="avm-zoom-btn" onClick={fitToScreen} title="Ajustar y centrar vista">⊡</button>
          </div>
        </div>

        {/* PROPERTIES PANEL */}
        <PropsPanel
          selected={selected}
          selectedSeats={selectedSeats}
          onUpdate={(updates) => selected && updateComponent(selected.id, updates)}
          onDelete={() => selected && deleteComponent(selected.id)}
          onDuplicate={() => selected && duplicateComponent(selected.id)}
          onAddSeat={() => selected && addSeatToComponent(selected.id)}
          onChangeSeatType={changeSeatType}
          onDeleteSeats={deleteSelectedSeats}
          onClearSelection={() => setSelectedSeats([])}
        />
      </div>

      {/* WIZARD MODAL */}
      {wizard?.mode === 'seats' && (
        <RowWizard
          x={wizard.x}
          y={wizard.y}
          onConfirm={handleWizardConfirm}
          onCancel={() => { setWizard(null); setActiveTool('select'); }}
        />
      )}
    </div>
  );
};

export default AdminVenueMap;
