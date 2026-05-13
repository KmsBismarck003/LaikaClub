import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge, Icon, Input } from '../../../components';
import { useNotification } from '../../../context/NotificationContext';
import { venueAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const VenueRoomsModal = ({ isOpen, onClose, venue }) => {
  const { success, error: showError } = useNotification();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    has_map: false,
    status: 'active'
  });

  const navigate = useNavigate();

  const fetchRooms = async () => {
    if (!venue) return;
    setLoading(true);
    try {
      const data = await venueAPI.getRooms(venue.id);
      setRooms(data);
    } catch (err) {
      console.error(err);
      showError('Error al cargar las salas del recinto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && venue) {
      fetchRooms();
      setIsEditing(false);
    }
  }, [isOpen, venue]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        has_map: formData.has_map,
        status: formData.status
      };

      if (selectedRoom) {
        await venueAPI.updateRoom(venue.id, selectedRoom.id, payload);
        success('Sala actualizada exitosamente');
      } else {
        await venueAPI.createRoom(venue.id, payload);
        success('Sala creada exitosamente');
      }
      
      setIsEditing(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al guardar sala');
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (room = null) => {
    if (room) {
      setSelectedRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity || '',
        has_map: room.has_map === 1 || room.has_map === true,
        status: room.status || 'active'
      });
    } else {
      setSelectedRoom(null);
      setFormData({
        name: '',
        capacity: '',
        has_map: false,
        status: 'active'
      });
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedRoom(null);
  };

  const navigateToMapBuilder = (roomId) => {
    navigate(`/admin/venues/${venue.id}/rooms/${roomId}/map`);
    onClose();
  };

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'capacity', header: 'Capacidad', render: val => val || '—' },
    { key: 'has_map', header: 'Tipo', render: val => val ? <Badge variant="primary">CON MAPA</Badge> : <Badge variant="secondary">ENTRADA LIBRE</Badge> },
    { key: 'status', header: 'Estado', render: val => <Badge variant={val === 'active' ? 'success' : 'danger'}>{val === 'active' ? 'ACTIVO' : 'INACTIVO'}</Badge> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.has_map && (
            <Button size="small" variant="primary" onClick={() => navigateToMapBuilder(row.id)}>
              <Icon name="map" size={12} className="mr-1" /> DISEÑAR MAPA
            </Button>
          )}
          <Button size="small" variant="warning" onClick={() => openEditForm(row)}>
            <Icon name="edit" size={12} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salas de ${venue?.name || 'Recinto'}`}
      size="large"
    >
      <div className="venue-rooms-modal">
        {!isEditing ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Gestiona las salas o áreas de este recinto. Cada sala puede tener su propio mapa de asientos.</p>
              <Button variant="primary" onClick={() => openEditForm()}>
                <Icon name="plus" size={16} className="mr-1" /> NUEVA SALA
              </Button>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando salas...</div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                <Icon name="inbox" size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Este recinto no tiene salas registradas.</p>
              </div>
            ) : (
              <Table columns={columns} data={rooms} />
            )}
          </>
        ) : (
          <form onSubmit={handleSaveRoom} className="venue-form glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{selectedRoom ? 'Editar Sala' : 'Crear Nueva Sala'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Nombre de la Sala / Área"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej: Sala Principal, Pista Norte"
              />
              
              <Input
                label="Capacidad Estimada"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Ej: 500"
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="has_map"
                  checked={formData.has_map}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Utilizar Mapa de Asientos Numerados</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Si se activa, podrás diseñar la distribución de asientos y venderlos de forma individual o por zonas. De lo contrario, será Entrada General.</span>
                </div>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="maintenance">En Mantenimiento</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Button type="button" variant="secondary" onClick={cancelEdit} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Sala'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default VenueRoomsModal;
