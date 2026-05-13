import React from 'react';
import { 
    Settings, Save, X, Zap, CheckCircle2, List 
} from 'lucide-react';
import { Modal, Button, Badge, Skeleton } from '../../../../components';
import { SegmentedControl, StorePreview } from '../StorePreview/StorePreview';

const ProductEditorModal = ({ 
    activeItem, 
    onClose, 
    editorLoading, 
    onSave, 
    onChange, 
    onUpdateVariant, 
    onAddVariant, 
    onRemoveVariant 
}) => {
    if (!activeItem) return null;

    return (
        <Modal 
            isOpen={!!activeItem} 
            onClose={onClose}
            maxWidth="1400px"
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#000', color: '#fff', padding: '6px', borderRadius: '4px', display: 'flex' }}>
                        <Settings size={18} />
                    </div>
                    <span style={{ fontWeight: '900', letterSpacing: '1px' }}>ESTACIÓN DE EDICIÓN EN VIVO</span>
                </div>
            }
            footer={
                <div className="merch-editor-footer">
                    <Button variant="secondary" onClick={onClose} style={{ border: '1px solid #ddd' }}>CANCELAR</Button>
                    <Button variant="primary" onClick={onSave} style={{ minWidth: '200px' }}><Save size={16} style={{ marginRight: '8px' }} /> SINCRONIZAR A NUBE</Button>
                </div>
            }
        >
            {editorLoading ? (
                <div style={{ padding: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Skeleton height="30px" width="100%" />
                            <Skeleton height="150px" width="100%" />
                            <Skeleton height="200px" width="100%" />
                        </div>
                        <Skeleton height="600px" width="100%" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="status-grid-merch">
                        <div className="status-item-mini"><small>IDENTIFICADOR</small><div className="val">{activeItem.id}</div></div>
                        <div className="status-item-mini">
                            <small>ESTADO TIENDA</small>
                            <div className="val" style={{ color: activeItem.status === 'active' ? '#22c55e' : '#ef4444' }}>
                                {activeItem.status === 'active' ? 'ONLINE' : 'SOLD OUT'}
                            </div>
                        </div>
                        <div className="status-item-mini"><small>VENTAS ACUMULADAS</small><div className="val">{activeItem.sold_count || 0} UNIDADES</div></div>
                        <div className="status-item-mini"><small>CATEGORÍA</small><div className="val">{activeItem.category?.toUpperCase()}</div></div>
                    </div>

                    <div className="editor-grid-premium">
                        <div className="e-form-col-clean">
                            <div className="industrial-settings-pane">
                                <div className="settings-row" style={{ padding: '1.5rem', background: '#fbfbfb' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900' }}>AUTOMATIZACIÓN COMERCIAL</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.6rem', color: '#888' }}>Control de badges y disponibilidad en tienda.</p>
                                    </div>
                                    <Badge variant={activeItem.isNew ? 'info' : 'secondary'} rounded style={{ cursor: 'pointer' }} onClick={() => onChange('isNew', !activeItem.isNew)}>
                                        {activeItem.isNew ? 'NUEVO ACTIVO' : 'SIN ETIQUETA'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="industrial-settings-pane">
                                <div className="settings-row">
                                    <div className="settings-label"><Zap size={14} /> DESCO</div>
                                    <div className="settings-control">
                                        <SegmentedControl options={[{ label: '0%', value: '0' }, { label: '30%', value: '30' }, { label: '50%', value: '50' }]} value={activeItem.discount || '0'} onChange={val => onChange('discount', val)} />
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <div className="settings-label"><CheckCircle2 size={14} /> STATUS</div>
                                    <div className="settings-control">
                                        <SegmentedControl options={[{ label: 'DISPO', value: 'active' }, { label: 'AGOTADO', value: 'sold_out' }]} value={activeItem.status} onChange={val => onChange('status', val)} />
                                    </div>
                                </div>
                            </div>

                            <div className="industrial-settings-pane">
                                <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#555' }}>NOMBRE DEL ACTIVO (MX-CENTER)</label>
                                    <input className="industrial-input" value={activeItem.name} onChange={e => onChange('name', e.target.value)} placeholder="Ej: Playera Oversize Black" />
                                </div>
                                <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#555' }}>URL ASSET FOTOGRÁFICO</label>
                                    <input className="industrial-input" value={activeItem.image_url} onChange={e => onChange('image_url', e.target.value)} />
                                </div>
                            </div>

                            <div className="industrial-settings-pane">
                                <div className="settings-row" style={{ background: '#fbfbfb', borderBottom: '1px solid #eee' }}>
                                    <div className="settings-label"><List size={14} /> VARIANTES</div>
                                    <Button size="small" variant="info" onClick={onAddVariant}>+ ADD</Button>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <table className="variants-matrix-technical">
                                        <thead><tr><th>TALLA</th><th>PRECIO</th><th>STOCK</th><th /></tr></thead>
                                        <tbody>
                                            {activeItem.variants?.map((v, i) => (
                                                <tr key={i} className="vt-row-technical">
                                                    <td><input className="industrial-input" value={v.size} style={{ padding: '6px' }} onChange={e => onUpdateVariant(i, 'size', e.target.value)} /></td>
                                                    <td><input type="number" className="industrial-input" value={v.price} style={{ padding: '6px' }} onChange={e => onUpdateVariant(i, 'price', e.target.value)} /></td>
                                                    <td><input type="number" className="industrial-input" value={v.stock} style={{ padding: '6px' }} onChange={e => onUpdateVariant(i, 'stock', e.target.value)} /></td>
                                                    <td><button className="vt-remove-btn" onClick={() => onRemoveVariant(i)}><X size={14} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="e-preview-col-light">
                            <StorePreview item={activeItem} />
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ProductEditorModal;
