import React from 'react';
import { Badge, Table, Button, SkeletonRow } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';

const AdsTable = ({ 
  ads, 
  isLoading, 
  handleToggleActive, 
  handleOpenModal, 
  handleDeleteClick 
}) => {
  const columns = [
    {
      key: 'image_url',
      header: 'Imagen',
      render: (url) => (
        <div style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
          <img 
            src={getImageUrl(url)} 
            alt="Ad" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )
    },
    { key: 'title', header: 'Título' },
    {
      key: 'position',
      header: 'Posición',
      render: (pos) => {
        const labels = { 
          main: 'Principal (Carrusel)', 
          side_right: 'Lateral Der.',
          side_left: 'Lateral Izq.' 
        }
        return <Badge variant="info">{labels[pos] || pos}</Badge>
      }
    },
    {
      key: 'active',
      header: 'Estado',
      render: (active, row) => (
        <div style={{ cursor: 'pointer' }} onClick={() => handleToggleActive(row)}>
          <Badge variant={active ? 'success' : 'secondary'}>
            {active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      )
    },
    {
      key: 'click_count',
      header: 'Clics',
      render: (count) => (
        <Badge variant="primary" style={{ fontWeight: 800 }}>
          {count || 0}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="small" variant="secondary" onClick={() => handleOpenModal(row)}>Editar</Button>
          <Button size="small" variant="danger" onClick={() => handleDeleteClick(row)}>Eliminar</Button>
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={ads} 
      loading={isLoading} 
      emptyMessage="No se encontraron anuncios"
    />
  );
};

export default AdsTable;
