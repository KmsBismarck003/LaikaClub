import React from 'react';
import Input from '../../../../components/Input';

const EventBasicInfo = ({ formData, handleChange, handleVenueChange, venues }) => (
    <div className="event-basic-info-modular">
        <div className="form-group mb-4">
            <Input
                label="Nombre del Evento *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Concierto de Rock"
                required
            />
        </div>

        <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recinto Principal</label>
            <select
                name="venue_id"
                value={formData.venue_id}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
            >
                <option value="">-- Seleccionar Recinto --</option>
                {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
            </select>
        </div>

        <div className="form-row grid grid-cols-2 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                >
                    <option value="concert">Concierto</option>
                    <option value="sport">Deporte</option>
                    <option value="theater">Teatro</option>
                    <option value="festival">Festival</option>
                    <option value="other">Otro</option>
                </select>
            </div>
            <div className="form-group">
                <Input
                    label="Ubicación (Ciudad) *"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ej. CDMX o Puebla"
                />
            </div>
        </div>
    </div>
);

export default EventBasicInfo;
