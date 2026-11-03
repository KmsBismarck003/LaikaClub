import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Badge, ConfirmationModal, Alert, SkeletonAdminGrid } from '../../../components';
import { useSkeletonContext } from '../../../context/SkeletonContext';
import { merchService } from '../../../services/merch.service';
import './Merch.css';

const MerchAdmin = () => {
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showSkeleton } = useSkeletonContext();

  useEffect(() => {
    const fetchMerch = async () => {
      try {
        const data = await merchService.getAllMerchandise();
        setMerchItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar mercancía:", err);
        setMerchItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMerch();
  }, []);

  const filteredItems = filter === 'Todos' 
    ? merchItems 
    : merchItems.filter(item => item.type === filter);

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setMerchItems(merchItems.filter(i => i.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const categories = ['Todos', 'Playera', 'Taza', 'Sticker', 'Lapicero'];

  if (showSkeleton) return <SkeletonAdminGrid />;

  return (
    <div className="merch-admin-container">
      <header className="merch-header">
        <div className="header-info">
          <h1>Gestión de Mercancía</h1>
          <p>Administra y personaliza tus productos de venta oficial.</p>
        </div>
        <Button variant="primary" onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>
          <Icon name="plus" size={16} /> Nuevo Producto
        </Button>
      </header>

      <div className="merch-filters">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="merch-grid">
        {filteredItems.map(item => (
          <Card key={item.id} className="merch-item-card">
            <div className="merch-card-img">
              <img src={item.image} alt={item.name} />
              <Badge variant={item.status === 'Disponible' ? 'success' : 'warning'} className="status-badge">
                {item.status}
              </Badge>
            </div>
            <div className="merch-card-info">
              <span className="item-type">{item.type}</span>
              <h3>{item.name}</h3>
              <div className="price-stock">
                <span className="price">${item.price} MXN</span>
                <span className="stock">Stock: {item.stock}</span>
              </div>
              <div className="item-variants">
                <div className="colors-preview">
                  {item.colors.map((c, i) => (
                    <span key={i} className="color-dot" style={{ backgroundColor: c.startsWith('#') ? c : '#888' }} title={c}></span>
                  ))}
                </div>
                <div className="sizes-preview">
                  {item.sizes.slice(0, 3).map((s, i) => (
                    <span key={i} className="size-label">{s}</span>
                  ))}
                  {item.sizes.length > 3 && <span>...</span>}
                </div>
              </div>
            </div>
            <div className="merch-card-actions">
              <Button variant="ghost" size="small" onClick={() => handleEdit(item)}>
                <Icon name="edit" size={14} /> Editar
              </Button>
              <Button variant="ghost" size="small" className="btn-delete" onClick={() => handleDelete(item)}>
                <Icon name="trash2" size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Edición (Simulado) */}
      {isModalOpen && (
        <div className="merch-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="merch-editor-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input type="text" defaultValue={selectedItem?.name} placeholder="Ej: Playera Laika 2026" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio (MXN)</label>
                  <input type="number" defaultValue={selectedItem?.price} />
                </div>
                <div className="form-group">
                  <label>Stock Inicial</label>
                  <input type="number" defaultValue={selectedItem?.stock} />
                </div>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select defaultValue={selectedItem?.type || 'Playera'}>
                  <option>Playera</option>
                  <option>Taza</option>
                  <option>Sticker</option>
                  <option>Lapicero</option>
                </select>
              </div>
              <div className="form-group">
                <label>Colores (Separados por coma o Hex)</label>
                <input type="text" defaultValue={selectedItem?.colors.join(', ')} />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => {
                const msg = selectedItem ? "Producto actualizado" : "Producto creado";
                setIsModalOpen(false);
                alert(msg);
              }}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default MerchAdmin;
