import React, { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { Card, Button, Table, Badge, SkeletonRow, Modal, ConfirmationModal, Icon } from '../../../components'
import Skeleton from '../../../components/Skeleton/Skeleton';
import { useSkeletonContext } from '../../../context/SkeletonContext'
import EventForm from './EventForm'
import EventSettingsModal from './components/EventSettingsModal'
import EventsFilters from './components/EventsFilters'
import PreviewMonitor from '../../../components/Admin/PreviewMonitor'
import { getImageUrl } from '../../../utils/imageUtils'
import './admin.css'

const Events = () => {
  const [loading, setLoading] = useState(true)
  const { showSkeleton } = useSkeletonContext()
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    country_id: '',
    state_id: '',
    municipality_id: '',
    venue_id: ''
  })
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      // Pasamos los filtros a la API, limpiando los vacíos para evitar 422
      const params = Object.fromEntries(
        Object.entries({ ...filters, limit: 100 })
          .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      const data = await api.event.getAll(params)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleEditClick = async (event) => {
    try {
      const data = await api.event.getById(event.id)
      setSelectedEvent(data)
      setIsFormOpen(true)
    } catch (error) {
      console.error("Error al cargar detalles del evento:", error)
    }
  }

  const handleSettingsClick = async (event) => {
    try {
      const data = await api.event.getById(event.id)
      setSelectedEvent(data)
      setIsSettingsOpen(true)
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }
  }

  const handleDeleteClick = (event) => {
    setEventToDelete(event)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return
    try {
      await api.event.delete(eventToDelete.id)
      setIsDeleteModalOpen(false)
      setEventToDelete(null)
      fetchEvents()
    } catch (error) {
      console.error("Error al eliminar evento:", error)
    }
  }

  const handlePreviewClick = async (event) => {
    try {
      const data = await api.event.getById(event.id)
      setSelectedEvent(data)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error al cargar preview:", error)
    }
  }

  const handleTogglePublish = async (event) => {
    try {
      if (event.status === 'published') {
        await api.event.unpublish(event.id)
      } else {
        await api.event.publish(event.id)
      }
      fetchEvents()
    } catch (error) {
      console.error("Error al cambiar estado del evento:", error)
    }
  }

  const columns = [
    {
      key: 'image_url',
      header: 'Poster',
      render: (val, row) => (
        <div className="admin-table-thumbnail" onClick={() => handlePreviewClick(row)}>
          <img src={getImageUrl(val || row.image)} alt="Poster" />
          <div className="thumbnail-hover-overlay"><Icon name="eye" size={14} /></div>
        </div>
      )
    },
    { 
      key: 'name', 
      header: 'Evento',
      render: (val, row) => (
        <div className="event-cell-info">
          <div className="event-name-primary">{val}</div>
          <div className="event-location-sub">
            <Icon name="map-pin" size={10} /> {row.venue_name || 'Sin recinto'}
          </div>
        </div>
      )
    },
    {
      key: 'event_date',
      header: 'Fecha',
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Estado',
      render: (val) => {
        const variants = { published: 'success', draft: 'warning', cancelled: 'danger' }
        return <Badge variant={variants[val] || 'default'} rounded>{val?.toUpperCase()}</Badge>
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button 
            variant={row.status === 'published' ? 'secondary' : 'success'} 
            size="small" 
            onClick={() => handleTogglePublish(row)}
            title={row.status === 'published' ? 'Mover a Borrador' : 'Publicar Evento'}
          >
            <Icon name={row.status === 'published' ? 'eye-off' : 'eye'} size={14} className="mr-1" />
            {row.status === 'published' ? 'OCULTAR' : 'PUBLICAR'}
          </Button>
          <Button variant="ghost" size="small" onClick={() => handleSettingsClick(row)} title="Configuración y Permisos">
            <Icon name="settings" size={14} />
          </Button>
          <Button variant="warning" size="small" onClick={() => handleEditClick(row)}>
            <Icon name="edit" size={12} className="mr-1" /> EDITAR
          </Button>
          <Button variant="danger" size="small" onClick={() => handleDeleteClick(row)}>
            <Icon name="trash" size={12} className="mr-1" />
          </Button>
        </div>
      )
    }

  ]

  const filteredEvents = events.filter(event =>
    event.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-events-page">
      <div className="page-header">
        <div className="header-title-group">
          <h1>Gestión de Eventos</h1>
          <p className="header-subtitle">Administra los permisos, anuncios y métricas por cada evento.</p>
        </div>
        <Button onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}>
          <Icon name="plus" size={14} className="mr-2" /> CREAR NUEVO EVENTO
        </Button>
      </div>

      <Card className="glass-panel events-main-card">
        <EventsFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilters}
        />

        <div className="records-count">
          {loading ? (
            <Skeleton type="text" width="60px" />
          ) : (
            <span>{filteredEvents.length} EVENTOS ENCONTRADOS</span>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filteredEvents.length === 0 ? (
          <EmptyState onClear={() => {setSearchTerm(''); setFilters({});}} />
        ) : (
          <Table columns={columns} data={filteredEvents} className="admin-custom-table" />
        )}
      </Card>

      {isFormOpen && (
        <EventForm
          event={selectedEvent}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchEvents}
        />
      )}

      {isSettingsOpen && selectedEvent && (
        <EventSettingsModal
          isOpen={true}
          event={selectedEvent}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={fetchEvents}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setEventToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Evento"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${eventToDelete?.name}"?`}
        confirmText="Sí, Eliminar"
        variant="danger"
      />

      {isPreviewOpen && selectedEvent && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsPreviewOpen(false)} 
          title={`Vista Previa: ${selectedEvent.name}`}
          size="large"
        >
          <div className="fast-preview-container">
            <PreviewMonitor type="event" data={selectedEvent} />
          </div>
        </Modal>
      )}
    </div>
  )
}

// Helper components for modularity
const TableSkeleton = () => (
  <div className="table-container">
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
        {['POSTER', 'EVENTO', 'FECHA', 'ESTADO', 'ACCIONES'].map(h => <th key={h} className="th-skeleton">{h}</th>)}
      </tr></thead>
      <tbody>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} columns={5} />)}</tbody>
    </table>
  </div>
)

const EmptyState = ({ onClear }) => (
  <div className="empty-state">
    <Icon name="search" size={48} className="empty-icon" />
    <p>No se encontraron eventos con los filtros aplicados</p>
    <Button variant="ghost" onClick={onClear}>Limpiar filtros</Button>
  </div>
)

export default Events
