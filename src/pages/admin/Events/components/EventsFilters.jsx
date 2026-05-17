import React, { useState, useEffect } from 'react'
import { Icon, Input, Button } from '../../../../components'
import { venueAPI } from '../../../../services/api'

const EventsFilters = ({ onFilterChange, searchTerm, onSearchChange }) => {
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [venues, setVenues] = useState([])

  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedVenue, setSelectedVenue] = useState('')

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [cData, vData] = await Promise.all([
          venueAPI.getCountries(),
          venueAPI.getAll()
        ])
        setCountries(cData)
        setVenues(vData)
      } catch (err) {
        console.error('Error fetching filters:', err)
      }
    }
    fetchInitial()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      venueAPI.getStates(selectedCountry).then(setStates).catch(console.error)
    } else {
      setStates([])
    }
    setSelectedState('')
    setSelectedMunicipality('')
  }, [selectedCountry])

  useEffect(() => {
    if (selectedState) {
      venueAPI.getMunicipalities(selectedState).then(setMunicipalities).catch(console.error)
    } else {
      setMunicipalities([])
    }
    setSelectedMunicipality('')
  }, [selectedState])

  // Trigger filter change
  useEffect(() => {
    onFilterChange({
      country_id: selectedCountry,
      state_id: selectedState,
      municipality_id: selectedMunicipality,
      venue_id: selectedVenue
    })
  }, [selectedCountry, selectedState, selectedMunicipality, selectedVenue])

  return (
    <div className="events-filters-bar">
      <div className="filter-group search-filter">
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Icon name="search" size={16} />}
        />
      </div>
      
      <div className="filter-group select-filter">
        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">Todos los Países</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="filter-group select-filter">
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} disabled={!selectedCountry}>
          <option value="">Todos los Estados</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="filter-group select-filter">
        <select value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)}>
          <option value="">Todos los Recintos</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
      
      <Button variant="ghost" size="small" onClick={() => {
        setSelectedCountry('')
        setSelectedState('')
        setSelectedMunicipality('')
        setSelectedVenue('')
        onSearchChange('')
      }} title="Limpiar Filtros">
        <Icon name="x" size={14} />
      </Button>
    </div>
  )
}

export default EventsFilters
