import React from 'react';
import { Badge, Button, Table, Card } from '../../../../components';
import { ShoppingBag, Database as DbIcon, Edit, Trash2 } from 'lucide-react';

const InventoryTable = ({ 
    filteredItems, 
    onEdit, 
    onDelete, 
    onToggleStatus 
}) => {
    const columns = [
        {
            key: 'image_url', header: 'MINIATURA', width: '10%',
            render: (val) => (
                <div className="table-img-container">
                    {val ? <img src={val} alt="" /> : <DbIcon size={14} />}
                </div>
            )
        },
        {
            key: 'name', header: 'ID / PRODUCTO', width: '25%',
            render: (val, row) => (
                <div className="product-info-cell">
                    <span className="p-main-name" style={{ fontWeight: 900 }}>{val}</span>
                    <span className="p-variants-count">{row.id}</span>
                </div>
            )
        },
        {
            key: 'category', header: 'CATEGORÍA', width: '12%',
            render: (v) => <Badge variant="secondary" style={{ fontWeight: 900, fontSize: '0.65rem' }}>{v?.toUpperCase() || 'GENERAL'}</Badge>
        },
        {
            key: 'status', header: 'ESTADO', width: '12%',
            render: (val, row) => (
                <Badge 
                    variant={val === 'active' ? 'success' : 'error'} 
                    rounded dot style={{ cursor: 'pointer' }}
                    onClick={() => onToggleStatus(row.id)}
                >
                    {val === 'active' ? 'TIENDA' : 'OCULTO'}
                </Badge>
            )
        },
        {
            key: 'variants', header: 'STOCK TOTAL', width: '12%',
            render: (vars) => {
                const total = vars?.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 900, color: total < 10 ? '#ef4444' : '#000' }}>{total}</span>
                        <small style={{ color: '#888', fontSize: '0.6rem' }}>PCS</small>
                    </div>
                );
            }
        },
        {
            key: 'sold_count', header: 'VENTAS', width: '10%',
            render: (v) => <span style={{ fontWeight: 900 }}>{v || 0}</span>
        },
        {
            key: 'id', header: 'ACCIONES', width: '20%',
            render: (val, row) => (
                <div className="row-actions-premium">
                    <Button size="small" variant="info" onClick={() => onEdit(row)} style={{ height: '26px' }}>
                        <Edit size={12} /> <span style={{ marginLeft: '4px' }}>EDITAR</span>
                    </Button>
                    <button className="trash-btn-merch" onClick={() => onDelete(row.id)}>
                        <Trash2 size={13} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <Card className="industrial-glass" style={{ border: '2px solid #000', marginTop: '2rem' }}>
            <Table columns={columns} data={filteredItems} striped />
            {filteredItems.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f9f9f9' }}>
                    <ShoppingBag size={40} style={{ color: '#ccc', marginBottom: '1rem' }} />
                    <h3 style={{ margin: 0, fontWeight: 900 }}>SIN ACTIVOS EN ESTE EVENTO</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>No hay mercancía registrada para el evento seleccionado.</p>
                </div>
            )}
        </Card>
    );
};

export default InventoryTable;
