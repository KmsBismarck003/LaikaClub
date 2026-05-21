import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Card, Button, Modal, Input } from '../../components';
import { merchService } from '../../services/merch.service';
import api from '../../services/api';
import { Edit, Plus, Trash, ExternalLink, Info, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManagerMerchandise = () => {
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();
    const [merchItems, setMerchItems] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [settings, setSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_url: '',
        event_id: '',
        max_per_person: '5',
        delivery_pickup: true,
        delivery_home: false,
        attributes_name: '',
        attributes_values: ''
    });
    const [uploadType, setUploadType] = useState('file');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        setSettingsLoading(true);
        try {
            // Fetch events to know which events the manager owns
            const events = await api.manager.getMyEvents();
            setMyEvents(events || []);

            // Check settings for manager
            try {
                const sett = await merchService.getSettings(1); // fallback manager_id
                setSettings(sett);
            } catch (e) {
                console.warn('Could not fetch merch settings', e);
            }

            // Get all merchandise for this manager
            const items = await merchService.getAllMerchandise(null, null, null, null);
            setMerchItems(items || []);
        } catch (error) {
            console.error('Error fetching manager merch data:', error);
            showError('Error al cargar la información de mercancía');
        } finally {
            setLoading(false);
            setSettingsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await api.manager.uploadImage(file);
            if (res && res.url) {
                const currentImages = formData.image_url ? formData.image_url.split(',') : [];
                currentImages.push(res.url);
                setFormData(prev => ({ ...prev, image_url: currentImages.join(',') }));
                success('Imagen subida correctamente');
            } else {
                showError('Error al subir imagen');
            }
        } catch (err) {
            showError('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateMerch = async (e) => {
        e.preventDefault();
        if (submitting) return;

        try {
            if (!formData.event_id) {
                showError('Por favor selecciona un evento.');
                return;
            }

            const selectedEvent = myEvents.find(ev => ev.id === parseInt(formData.event_id));
            const isEventAllowed = selectedEvent?.merch_enabled;
            if (!settings?.is_enabled && !isEventAllowed) {
                showError('La herramienta de mercancía no está habilitada para este evento o cuenta.');
                return;
            }

            setSubmitting(true);

            let parsedAttributes = null;
            if (formData.attributes_name && formData.attributes_values) {
                parsedAttributes = {
                    [formData.attributes_name]: formData.attributes_values.split(',').map(v => v.trim()).filter(Boolean)
                };
            }

            const dMethods = [];
            if (formData.delivery_pickup) dMethods.push('PICKUP_AT_EVENT');
            if (formData.delivery_home) dMethods.push('HOME_DELIVERY');

            const payload = {
                name: formData.name,
                description: formData.description,
                image_url: formData.image_url,
                category: formData.category,
                event_id: parseInt(formData.event_id),
                max_per_person: parseInt(formData.max_per_person) || 5,
                delivery_methods: dMethods,
                attributes_schema: parsedAttributes,
                variants: [
                    {
                        ...(formData.variant_id ? { id: formData.variant_id } : {}),
                        sku: formData.sku || `SKU-${Date.now()}`,
                        price: parseFloat(formData.price),
                        stock: parseInt(formData.stock),
                        attributes: parsedAttributes ? { [formData.attributes_name]: formData.attributes_values.split(',').map(v=>v.trim())[0] } : null
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
            setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', event_id: '', variant_id: '', sku: '', max_per_person: '5', delivery_pickup: true, delivery_home: false, attributes_name: '', attributes_values: '' });
            loadInitialData();
        } catch (error) {
            console.error(error);
            showError(editingId ? 'Error al actualizar mercancía' : 'Error al crear mercancía');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        const attrKeys = item.attributes_schema ? Object.keys(item.attributes_schema) : [];
        const attrName = attrKeys.length > 0 ? attrKeys[0] : '';
        const attrValues = attrName ? item.attributes_schema[attrName].join(', ') : '';

        setFormData({
            name: item.name,
            description: item.description,
            price: item.variants?.[0]?.price || '',
            stock: item.variants?.[0]?.stock || '',
            category: item.category || '',
            image_url: item.image_url || '',
            event_id: item.event_id || '',
            variant_id: item.variants?.[0]?.id || '',
            sku: item.variants?.[0]?.sku || '',
            max_per_person: item.max_per_person || '5',
            delivery_pickup: item.delivery_methods?.includes('PICKUP_AT_EVENT') || false,
            delivery_home: item.delivery_methods?.includes('HOME_DELIVERY') || false,
            attributes_name: attrName,
            attributes_values: attrValues
        });
        setUploadType(item.image_url ? 'url' : 'file');
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        try {
            await merchService.deleteMerchandise(id);
            success('Producto eliminado correctamente');
            loadInitialData();
        } catch (error) {
            showError('Error al eliminar el producto');
        }
    };

    const getEventName = (id) => {
        const ev = myEvents.find(e => e.id === id);
        return ev ? ev.name : `Evento #${id}`;
    };

    if (settingsLoading) return <div className="p-8 text-white">Cargando estado de la tienda...</div>;

    const hasGlobalEnabled = settings?.is_enabled;
    const hasAnyEventEnabled = myEvents.some(ev => ev.merch_enabled);
    const isAllowed = hasGlobalEnabled || hasAnyEventEnabled;

    if (!isAllowed) {
        return (
            <div className="p-8 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg mt-8 bg-gray-900 max-w-2xl mx-auto">
                <h3 className="font-bold text-xl mb-2 text-white">Módulo de Mercancía Desactivado</h3>
                <p className="mb-4">Tu cuenta no tiene habilitada la venta de mercancía o no tienes eventos con esta función desbloqueada.</p>
                <p>Por favor contacta al administrador del sistema.</p>
            </div>
        );
    }

    return (
        <div className="p-6 text-white max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Constructor de Mercancía
                    </h1>
                    <p className="text-gray-400 mt-1">Crea y administra los productos oficiales de todos tus eventos en un solo lugar.</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
                    <Plus size={16} /> Crear Producto
                </Button>
            </div>

            {!settings?.is_enabled && (
                <div className="mb-6 p-4 rounded-lg bg-purple-950/40 border border-purple-800 text-purple-200 flex items-start gap-3">
                    <Info size={20} className="text-purple-400 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="font-bold text-white mb-0.5">Acceso Parcial por Evento</h4>
                        <p className="text-sm text-purple-300">
                            Tu cuenta no tiene habilitado el módulo de mercancía general, pero el administrador ha desbloqueado esta función para eventos específicos. Podrás crear y gestionar productos únicamente para esos eventos autorizados.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-gray-400">Cargando catálogo...</div>
            ) : merchItems.length === 0 ? (
                <Card className="text-center py-16 border border-dashed border-gray-700 bg-gray-900 rounded-xl flex flex-col items-center justify-center">
                    <ShoppingBag size={48} className="text-purple-500 mb-4" />
                    <h3 className="text-lg font-bold mb-2">No tienes productos en tu catálogo</h3>
                    <p className="text-gray-400 mb-6 max-w-sm mx-auto">Empieza agregando tu primer playera, gorra, hoodie o accesorio para tus eventos.</p>
                    <Button variant="primary" onClick={() => setShowModal(true)}>Agregar Producto</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchItems.map(item => (
                        <Card key={item.id} className="overflow-hidden flex flex-col bg-gray-900 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all duration-300">
                            {item.image_url ? (
                                <div className="h-52 w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url.split(',')[0]})` }} />
                            ) : (
                                <div className="h-52 w-full bg-gray-800 flex items-center justify-center text-gray-500">Sin Imagen</div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold px-2 py-1 bg-purple-900/40 text-purple-300 border border-purple-800 rounded">
                                        {item.category || 'General'}
                                    </span>
                                    <div>
                                        {item.admin_status === 'approved' && <span className="text-xs font-bold px-2 py-1 bg-green-900/40 text-green-400 border border-green-800 rounded">Aprobado</span>}
                                        {item.admin_status === 'pending_review' && <span className="text-xs font-bold px-2 py-1 bg-yellow-900/40 text-yellow-400 border border-yellow-800 rounded">En Revisión</span>}
                                        {item.admin_status === 'rejected' && <span className="text-xs font-bold px-2 py-1 bg-red-900/40 text-red-400 border border-red-800 rounded">Rechazado</span>}
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
                                
                                <div className="text-xs text-gray-500 mb-4 bg-gray-950 p-2 rounded flex items-center justify-between">
                                    <span>Evento:</span>
                                    <span className="font-semibold text-gray-300 truncate max-w-[200px]" title={getEventName(item.event_id)}>
                                        {getEventName(item.event_id)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-auto">
                                    <div>
                                        <span className="text-xs text-gray-400 block">Precio</span>
                                        <span className="font-extrabold text-xl text-white">${item.variants?.[0]?.price || '0.00'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 block">Stock</span>
                                        <span className="font-bold text-gray-200">{item.variants?.[0]?.stock || 0} pzas</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2 border-t border-gray-800 pt-3">
                                    <Button 
                                        variant="outline" 
                                        size="small" 
                                        onClick={() => handleEditClick(item)}
                                        className="flex items-center justify-center gap-1 text-xs flex-1 text-gray-200 border-gray-700 hover:bg-gray-800"
                                    >
                                        <Edit size={12} className="mr-1" /> Editar
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="small" 
                                        onClick={() => handleDeleteClick(item.id)}
                                        className="flex items-center justify-center gap-1 text-xs flex-1 bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-white"
                                    >
                                        <Trash size={12} className="mr-1" /> Eliminar
                                    </Button>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="small" 
                                        fullWidth 
                                        onClick={() => navigate(`/events/manage/${item.event_id}?tab=merch`)}
                                        className="flex items-center justify-center gap-1 text-xs text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white"
                                    >
                                        <ExternalLink size={12} /> Ir al Evento
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
                    setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', event_id: '', variant_id: '', sku: '', max_per_person: '5', delivery_pickup: true, delivery_home: false, attributes_name: '', attributes_values: '' });
                }} 
                title={editingId ? "Editar Mercancía" : "Añadir Mercancía"} 
                size="medium"
            >
                <form onSubmit={handleCreateMerch} className="space-y-4 text-gray-900">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Seleccionar Evento</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"
                            value={formData.event_id}
                            onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                            required
                        >
                            <option value="">-- Elige un Evento --</option>
                            {myEvents.filter(ev => settings?.is_enabled || ev.merch_enabled).map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Nombre del Producto</label>
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Descripción</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Precio ($)</label>
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
                            <label className="block text-sm font-medium mb-1 text-gray-700">Stock / Cantidad</label>
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
                        <label className="block text-sm font-medium mb-1 text-gray-700">Categoría</label>
                        <Input 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            placeholder="Ej. Playeras, Tazas, etc."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Opción Dinámica (Ej. Talla)</label>
                            <Input 
                                value={formData.attributes_name}
                                onChange={(e) => setFormData({...formData, attributes_name: e.target.value})}
                                placeholder="Nombre de opción (Opcional)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Valores (separados por coma)</label>
                            <Input 
                                value={formData.attributes_values}
                                onChange={(e) => setFormData({...formData, attributes_values: e.target.value})}
                                placeholder="Ej. S, M, L, XL"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Límite por persona</label>
                            <Input 
                                type="number" 
                                min="1"
                                value={formData.max_per_person}
                                onChange={(e) => setFormData({...formData, max_per_person: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Métodos de Entrega</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-gray-800">
                                    <input type="checkbox" checked={formData.delivery_pickup} onChange={(e) => setFormData({...formData, delivery_pickup: e.target.checked})} />
                                    Recoger en Stand del Evento
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-800">
                                    <input type="checkbox" checked={formData.delivery_home} onChange={(e) => setFormData({...formData, delivery_home: e.target.checked})} />
                                    Envío a Domicilio
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Imagen del Producto</label>
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
                                htmlFor="global-merch-file-upload" 
                                className="border border-dashed border-gray-300 rounded p-6 text-center bg-gray-50 cursor-pointer block hover:bg-gray-100 transition-all duration-200"
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="global-merch-file-upload"
                                />
                                <span className="text-purple-600 font-bold block mb-1">
                                    {uploading ? 'Subiendo...' : 'Añadir nueva imagen'}
                                </span>
                                <span className="text-xs text-gray-500 block">Puedes subir múltiples imágenes una por una para el carrusel</span>
                            </label>
                        ) : (
                            <div className="flex gap-2">
                                <Input 
                                    type="url"
                                    id="url-input-temp"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                                <Button type="button" onClick={() => {
                                    const input = document.getElementById('url-input-temp');
                                    if(input.value) {
                                        const currentImages = formData.image_url ? formData.image_url.split(',') : [];
                                        currentImages.push(input.value);
                                        setFormData(prev => ({ ...prev, image_url: currentImages.join(',') }));
                                        input.value = '';
                                    }
                                }}>Añadir</Button>
                            </div>
                        )}
                        
                        {formData.image_url && (
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Imágenes en el carrusel ({formData.image_url.split(',').length})</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {formData.image_url.split(',').map((url, idx) => (
                                        <div key={idx} className="relative shrink-0 border border-gray-200 rounded p-1 bg-white">
                                            <img src={url} alt={`Preview ${idx}`} className="h-16 w-16 object-cover rounded" />
                                            <button 
                                                type="button" 
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const imgs = formData.image_url.split(',');
                                                    imgs.splice(idx, 1);
                                                    setFormData(prev => ({...prev, image_url: imgs.join(',')}));
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                                setShowModal(false);
                                setEditingId(null);
                                setFormData({ name: '', description: '', price: '', stock: '', category: '', image_url: '', event_id: '', variant_id: '', sku: '', max_per_person: '5', delivery_pickup: true, delivery_home: false, attributes_name: '', attributes_values: '' });
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

export default ManagerMerchandise;
