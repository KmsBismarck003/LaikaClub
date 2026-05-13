import React, { useState, useEffect } from 'react'
import { Modal, Button, Input } from './index'
import { venueAPI } from '../services/api'
import { useNotification } from '../context/NotificationContext'

const VenueFormModal = ({ isOpen, onClose, onSubmit, venue = null }) => {
  const { error: showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    municipality_id: '',
    city: '', // Mantener para compatibilidad si es necesario, pero usaremos municipality_id
    map_url: '',
    capacity: '',
    status: 'active'
  })

  // Cargar países al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchCountries = async () => {
        try {
          const data = await venueAPI.getCountries()
          setCountries(data)
        } catch (err) {
          console.error('Error fetching countries:', err)
        }
      }
      fetchCountries()
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
        status: venue.status || 'active'
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
        status: 'active'
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
        municipality_id: parseInt(formData.municipality_id)
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
