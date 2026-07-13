import React, { useState, useEffect } from 'react'
import { Modal, Button, Input } from '../index'
import { venueAPI } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

const VenueFormModal = ({ isOpen, onClose, onSubmit, venue = null }) => {
  const { error: showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [managers, setManagers] = useState([])
  
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    municipality_id: '',
    city: '',
    map_url: '',
    capacity: '',
    status: 'active',
    assigned_manager_id: '',
    latitude: '',
    longitude: '',
    geofence_radius: 500,
    timezone: 'America/Mexico_City'
  })

  // Cargar países y gestores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [countriesData, usersData] = await Promise.all([
            venueAPI.getCountries(),
            // Usamos el servicio de admin para traer gestores
            import('../../services/api').then(m => m.adminUsersAPI.getAll({ role: 'gestor' }))
          ])
          setCountries(countriesData)
          setManagers(usersData.users || [])
        } catch (err) {
          console.error('Error fetching initial data:', err)
        }
      }
      fetchData()
    }
  }, [isOpen])

  // Cargar estados cuando cambia el país
  useEffect(() => {
    if (selectedCountry) {
      const fetchStates = async () => {
        try {
          const data = await venueAPI.getStates(selectedCountry)
          setStates(data)
          // Si no estamos editando, o si cambiamos manualmente el país, reseteamos el estado y municipio
          if (!venue || selectedCountry !== venue.country_id) {
             setSelectedState('')
             setMunicipalities([])
             setFormData(prev => ({ ...prev, municipality_id: '' }))
          }
        } catch (err) {
          console.error('Error fetching states:', err)
        }
      }
      fetchStates()
    } else {
      setStates([])
      setMunicipalities([])
    }
  }, [selectedCountry])

  // Cargar municipios cuando cambia el estado
  useEffect(() => {
    if (selectedState) {
      const fetchMunicipalities = async () => {
        try {
          const data = await venueAPI.getMunicipalities(selectedState)
          setMunicipalities(data)
          if (!venue || selectedState !== venue.state_id) {
             setFormData(prev => ({ ...prev, municipality_id: '' }))
          }
        } catch (err) {
          console.error('Error fetching municipalities:', err)
        }
      }
      fetchMunicipalities()
    } else {
      setMunicipalities([])
    }
  }, [selectedState])

  useEffect(() => {
    if (venue && isOpen) {
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        municipality_id: venue.municipality_id || '',
        city: venue.city || '',
        map_url: venue.map_url || '',
        capacity: venue.capacity || '',
        status: venue.status || 'active',
        assigned_manager_id: venue.assigned_manager_id || '',
        latitude: venue.latitude || '',
        longitude: venue.longitude || '',
        geofence_radius: venue.geofence_radius || 500,
        timezone: venue.timezone || 'America/Mexico_City'
      })
      // Inicializar selectores
      if (venue.country_id) setSelectedCountry(venue.country_id)
      if (venue.state_id) setSelectedState(venue.state_id)
    } else if (isOpen) {
      setFormData({
        name: '',
        address: '',
        municipality_id: '',
        city: '',
        map_url: '',
        capacity: '',
        status: 'active',
        assigned_manager_id: '',
        latitude: '',
        longitude: '',
        geofence_radius: 500,
        timezone: 'America/Mexico_City'
      })
      setSelectedCountry('')
      setSelectedState('')
    }
  }, [venue, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value)
  }

  const handleStateChange = (e) => {
    setSelectedState(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.municipality_id) {
      showError('Por favor selecciona un municipio')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        municipality_id: parseInt(formData.municipality_id),
        assigned_manager_id: formData.assigned_manager_id ? parseInt(formData.assigned_manager_id) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        geofence_radius: formData.geofence_radius ? parseInt(formData.geofence_radius) : null
      }

      await onSubmit(payload)
      onClose()
    } catch (err) {
      console.error(err)
      showError(err.message || 'Error al guardar recinto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venue ? 'Editar Recinto' : 'Nuevo Recinto'}
    >
      <form onSubmit={handleSubmit} className="venue-form">
        <Input
          label="Nombre del Recinto"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ej: Estadio Nacional"
        />

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>País</label>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="input-field"
              required
            >
              <option value="">Selecciona un país</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="input-field"
              required
              disabled={!selectedCountry}
            >
              <option value="">Selecciona un estado</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Municipio / Ciudad</label>
          <select
            name="municipality_id"
            value={formData.municipality_id}
            onChange={handleChange}
            className="input-field"
            required
            disabled={!selectedState}
          >
            <option value="">Selecciona un municipio</option>
            {municipalities.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="Dirección Específica"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Calle 123, Col. Centro"
        />

        <Input
          label="URL del Mapa (Google Maps)"
          name="map_url"
          value={formData.map_url}
          onChange={handleChange}
          placeholder="https://maps.google.com/..."
        />

        <div className="form-group">
          <label>Gestor Responsable (Opcional)</label>
          <select
            name="assigned_manager_id"
            value={formData.assigned_manager_id}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Sin asignar (Solo Admin)</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>
                {m.first_name} {m.last_name} ({m.email})
              </option>
            ))}
          </select>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            El gestor seleccionado tendrá permiso para crear y administrar eventos en este recinto.
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Configuración LBS (Sugerencias Inteligentes)</h4>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Latitud"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Ej: 19.432608"
            />
            <Input
              label="Longitud"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Ej: -99.133209"
            />
          </div>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <Input
              label="Radio de Geocerca (Metros)"
              name="geofence_radius"
              type="number"
              value={formData.geofence_radius}
              onChange={handleChange}
              placeholder="Ej: 500"
            />
            <Input
              label="Zona Horaria"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              placeholder="Ej: America/Mexico_City"
            />
          </div>
          
          {formData.latitude && formData.longitude && (
            <div style={{ marginTop: '1rem', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <iframe
                title="Geofence Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude) - 0.01}%2C${parseFloat(formData.latitude) - 0.01}%2C${parseFloat(formData.longitude) + 0.01}%2C${parseFloat(formData.latitude) + 0.01}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
              ></iframe>
            </div>
          )}
        </div>

        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Capacidad (Personas)"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Ej: 5000"
          />

          <div className="form-group">
            <label>Estado del Recinto</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : (venue ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default VenueFormModal
