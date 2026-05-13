import React from 'react';
import Button from '../../../../components/Button';

const EventScheduler = ({ functions, onAdd, onRemove, newFunction, setNewFunction, venues }) => {
    const getVenueName = (id) => venues.find(v => String(v.id) === String(id))?.name || 'Desconocido';

    return (
        <div className="form-group mb-6 p-4 border rounded bg-gray-50" style={{ border: '1px solid #eee', background: '#f9fafb', borderRadius: '8px', padding: '1rem' }}>
            <label className="block text-sm font-bold text-gray-700 mb-3">Fechas y Funciones</label>

            {functions.length > 0 && (
                <ul className="mb-4 space-y-2">
                    {functions.map((f, idx) => (
                        <li key={f.tempId || idx} className="flex justify-between items-center bg-white p-2 rounded border text-sm" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', background: '#fff', border: '1px solid #ddd', padding: '0.5rem' }}>
                            <span>📅 <strong>{f.date}</strong> ⏰ {f.time} 📍 {getVenueName(f.venue_id)}</span>
                            <button type="button" onClick={() => onRemove(idx)} className="text-red-500 hover:text-red-700">❌</button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="add-function-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <div className="form-group">
                    <label className="text-xs">Fecha</label>
                    <input type="date" value={newFunction.date} onChange={e => setNewFunction({ ...newFunction, date: e.target.value })} className="w-full p-1 border rounded" />
                </div>
                <div className="form-group">
                    <label className="text-xs">Hora</label>
                    <input type="time" value={newFunction.time} onChange={e => setNewFunction({ ...newFunction, time: e.target.value })} className="w-full p-1 border rounded" />
                </div>
                <div className="form-group">
                    <label className="text-xs">Recinto</label>
                    <select value={newFunction.venue_id} onChange={e => setNewFunction({ ...newFunction, venue_id: e.target.value })} className="w-full p-1 border rounded">
                        <option value="">Seleccionar</option>
                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                <Button type="button" size="small" variant="secondary" onClick={onAdd}>➕ Agregar</Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">* La primera fecha será la principal del evento.</p>
        </div>
    );
};

export default EventScheduler;
