import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Card, Button, Modal, Input } from '../../components';
import { merchService } from '../../services/merch.service';
import api from '../../services/api';
import { Plus, Edit, Trash, ShoppingBag } from 'lucide-react';

const MerchandisePanel = ({ eventId, event }) => {
    const { success, error: showError } = useNotification();
    const [merchItems, setMerchItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Config settings check
    const [settings, setSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_url: ''
    });
    const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.manager.uploadImage(file);
            if (res && res.url) {
                setFormData(prev => ({ ...prev, image_url: res.url }));
                success('Imagen subida correctamente');
            } else {
                showError('Error al subir imagen');
            }
        } catch (err) {
            console.error(err);
            showError('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId]);

    const loadData = async () => {
        setLoading(true);
        setSettingsLoading(true);
        try {
            // First check if manager has merch enabled
            try {
                const sett = await merchService.getSettings(event.assigned_manager_id || 1); // fallback to 1 for dev
                setSettings(sett);
            } catch (e) {
                console.warn('Could not fetch merch settings, assuming disabled', e);
            }

            const items = await merchService.getAllMerchandise(null, null, eventId, null);
            setMerchItems(items || []);
        } catch (error) {
            console.error('Error fetching merchandise:', error);
            showError('Error al cargar la mercancía');
        } finally {
            setLoading(false);
            setSettingsLoading(false);
        }
    };

    const handleCreateMerch = async (e) => {
        e.preventDefault();
        if (submitting) return;

        try {
            if (!settings?.is_enabled && !event?.merch_enabled) {
                showError('La herramienta de mercancía no está habilitada para este evento o cuenta.');
                return;
            }

            setSubmitting(true);

            const payload = {
                name: formData.name,
                description: formData.description,
                image_url: formData.image_url,
                category: formData.category,
                event_id: parseInt(eventId),
                variants: [
                    {
                        ...(formData.variant_id ? { id: formData.variant_id } : {}),
                        sku: formData.sku || `SKU-${Date.now()}`,
                        price: parseFloat(formData.price),
                        stock: parseInt(formData.stock),
                    }
                ]
            };

            if (editingId) {
                await merchService.updateMerchandise(editingId, payload);
                success('Mercancía actualizada con éxito');
            } else {
                await merchService.createMerchandise(payload);
                success('Mercancía enviada para revisión');
            }

            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', variant_id: '', sku: '' });
            loadData();
        } catch (error) {
            console.error(error);
            showError(editingId ? 'Error al actualizar mercancía' : 'Error al crear mercancía');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.variants?.[0]?.price || '',
            stock: item.variants?.[0]?.stock || '',
            category: item.category || '',
            image_url: item.image_url || '',
            variant_id: item.variants?.[0]?.id || '',
            sku: item.variants?.[0]?.sku || ''
        });
        setUploadType(item.image_url ? 'url' : 'file');
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        try {
            await merchService.deleteMerchandise(id);
            success('Producto eliminado correctamente');
            loadData();
        } catch (error) {
            console.error(error);
            showError('Error al eliminar el producto');
        }
    };

    if (settingsLoading) return <div className="p-8 text-center text-gray-500">Cargando estado de la tienda...</div>;

    if (!settings?.is_enabled && !event?.merch_enabled) {
        return (
            <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg mt-4 bg-gray-50">
                <h3 className="font-bold text-lg mb-2">Módulo de Mercancía Desactivado</h3>
                <p className="mb-4">Tu cuenta no tiene habilitada la venta de mercancía o no has solicitado la activación al administrador.</p>
                <p>Por favor contacta al administrador del sistema.</p>
            </div>
        );
    }

    if (!event?.merch_enabled) {
         return (
            <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg mt-4 bg-gray-50">
                <h3 className="font-bold text-lg mb-2">Mercancía no habilitada para este evento</h3>
                <p>Habilita la mercancía en la pestaña de "Configuración" de este evento para empezar a vender.</p>
            </div>
        );
    }



    return (
        <div className="merch-panel mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold">Mercancía del Evento</h3>
                    <p className="text-sm text-gray-500">Agrega productos que los asistentes podrán comprar.</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus size={16} /> Añadir Producto
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : merchItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 flex flex-col items-center justify-center bg-gray-50">
                    <ShoppingBag size={40} className="text-gray-300 mb-2" />
                    <span>No has agregado mercancía a este evento.</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchItems.map(item => (
                        <Card key={item.id} className="overflow-hidden flex flex-col">
                            {item.image_url ? (
                                <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url})` }} />
                            ) : (
                                <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-400">Sin Imagen</div>
                            )}
                            <div className="p-4 flex flex-col flex-1">
                                <h4 className="font-bold text-lg">{item.name}</h4>
                                <p className="text-sm text-gray-600 mb-2 flex-1">{item.description?.substring(0, 80)}...</p>
                                
                                <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-100">
                                    <span className="font-bold text-lg">${item.variants?.[0]?.price || '0'}</span>
                                    <span className="text-xs text-gray-500">Stock: {item.variants?.[0]?.stock || 0}</span>
                                </div>
                                
                                <div className="mt-3 text-center">
                                    {item.admin_status === 'approved' && <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">Aprobado</span>}
                                    {item.admin_status === 'pending_review' && <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">En Revisión</span>}
                                    {item.admin_status === 'rejected' && <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">Rechazado</span>}
                                </div>
                                <div className="mt-4 flex gap-2 border-t pt-3 border-gray-100">
                                    <Button 
                                        variant="outline" 
                                        size="small" 
                                        onClick={() => handleEditClick(item)}
                                        className="flex items-center justify-center gap-1 text-xs flex-1 text-gray-700 border-gray-300 hover:bg-gray-100"
                                    >
                                        <Edit size={12} className="mr-1" /> Editar
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="small" 
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="flex items-center justify-center gap-1 text-xs flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    >
                                        <Trash size={12} className="mr-1" /> Eliminar
                                    </Button>
                                </div>
                            </div>
                        </Card>

                    ))}
                </div>
            )}

            <Modal 
                isOpen={showModal} 
                onClose={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', variant_id: '', sku: '' });
                }} 
                title={editingId ? "Editar Mercancía" : "Añadir Mercancía"} 
                size="medium"
            >
                <form onSubmit={handleCreateMerch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Precio ($)</label>
                            <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock / Cantidad</label>
                            <Input 
                                type="number" 
                                min="1"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoría</label>
                        <Input 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            placeholder="Ej. Playeras, Tazas, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                className={`px-3 py-1 text-xs font-bold rounded ${uploadType === 'file' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setUploadType('file')}
                            >
                                Subir Archivo
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1 text-xs font-bold rounded ${uploadType === 'url' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setUploadType('url')}
                            >
                                Enlace URL
                            </button>
                        </div>
                        {uploadType === 'file' ? (
                            <label 
                                htmlFor="merch-file-upload" 
                                className="border border-dashed border-gray-300 rounded p-6 text-center bg-gray-50 cursor-pointer block hover:bg-gray-100 transition-all duration-200"
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="merch-file-upload"
                                />
                                <span className="text-purple-600 font-bold block mb-1">
                                    {uploading ? 'Subiendo...' : formData.image_url ? 'Cambiar Imagen' : 'Selecciona una imagen'}
                                </span>
                                <span className="text-xs text-gray-500 block mb-2">PNG, JPG, WEBP o GIF hasta 5MB</span>
                                {formData.image_url && (
                                    <div className="mt-3 flex items-center justify-center gap-2 bg-white p-2 rounded border border-gray-200 max-w-xs mx-auto">
                                        <img src={formData.image_url} alt="Vista previa" className="h-12 w-12 object-cover rounded" />
                                        <span className="text-xs text-green-600 font-semibold">¡Subida con éxito!</span>
                                    </div>
                                )}
                            </label>
                        ) : (
                            <Input 
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                required
                            />
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                                setShowModal(false);
                                setEditingId(null);
                                setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', variant_id: '', sku: '' });
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting || uploading}>
                            {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Enviar a Revisión'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MerchandisePanel;
