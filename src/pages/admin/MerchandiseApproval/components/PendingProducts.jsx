import React, { useState, useEffect } from 'react';
import { useNotification } from '../../../../context/NotificationContext';
import { Card, Badge, Button, Modal } from '../../../../components';
import { merchService } from '../../../../services/merch.service';
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const PendingProducts = () => {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [pendingItems, setPendingItems] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        loadPendingItems();
    }, []);

    const loadPendingItems = async () => {
        setLoading(true);
        try {
            const items = await merchService.getAllMerchandise(null, null, null, 'pending_review');
            setPendingItems(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("Error loading pending merch:", error);
            showError('Error al cargar productos pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await merchService.updateAdminStatus(id, newStatus);
            success(`Producto ${newStatus === 'approved' ? 'Aprobado' : 'Rechazado'}`);
            loadPendingItems();
        } catch (error) {
            showError('Error al actualizar producto');
        }
    };

    const formatImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';
        const firstUrl = url.split(',')[0];
        if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://')) {
            return firstUrl;
        }
        if (firstUrl.startsWith('/')) {
            return `http://localhost:8000${firstUrl}`;
        }
        // Fallback for dummy texts like "dfghm"
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop';
    };

    if (loading) {
        return (
            <Card className="p-8 text-center border border-gray-100 shadow-sm bg-white rounded-xl">
                <div className="text-gray-500 font-medium">Cargando productos pendientes...</div>
            </Card>
        );
    }

    if (pendingItems.length === 0) {
        return (
            <Card className="p-12 text-center border border-dashed border-gray-200 shadow-sm bg-white rounded-xl flex flex-col items-center justify-center">
                <ShoppingBag size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-1">No hay productos pendientes</h3>
                <p className="text-sm text-gray-500">Todas las solicitudes de revisión han sido procesadas.</p>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-100 shadow-sm bg-white rounded-xl overflow-hidden p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-purple-600" />
                    Solicitudes de Aprobación
                </h3>
                <p className="text-xs text-gray-500">Revisa y aprueba la mercancía oficial creada por los gestores de eventos.</p>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-24">Foto</th>
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Producto</th>
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Categoría</th>
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Precio / Stock</th>
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right w-64">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pendingItems.map(item => {
                            const mainVariant = item.variants?.[0];
                            const imageUrl = formatImageUrl(item.image_url);
                            
                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition duration-150">
                                    <td className="p-4">
                                        <div 
                                            onClick={() => setSelectedImage({ url: imageUrl, name: item.name, description: item.description })} 
                                            className="relative group cursor-zoom-in w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm transition-transform duration-200 hover:scale-105"
                                            title="Hacer clic para ampliar"
                                        >
                                            <img 
                                                src={imageUrl} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Hover magnifier effect */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ampliar</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.name}</span>
                                            <span className="text-xs text-gray-500 line-clamp-2 max-w-sm" title={item.description}>
                                                {item.description || 'Sin descripción.'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            {item.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-gray-800">${mainVariant?.price || '0.00'}</span>
                                            <span className="text-[10px] font-medium text-gray-500">{mainVariant?.stock || 0} unidades</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                            PENDIENTE
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="success" 
                                                size="small" 
                                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm transition duration-150"
                                            >
                                                <CheckCircle size={14} /> Aprobar
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="small" 
                                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm transition duration-150"
                                            >
                                                <XCircle size={14} /> Rechazar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Lightbox Preview Modal for Zooming Images */}
            {selectedImage && (
                <Modal 
                    isOpen={true} 
                    onClose={() => setSelectedImage(null)} 
                    title="Vista Previa de Producto" 
                    size="medium"
                >
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden text-gray-900">
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.name} 
                            className="max-h-[400px] w-auto object-contain rounded-lg shadow-md border border-gray-200"
                        />
                        <div className="mt-4 text-center px-4 w-full">
                            <h4 className="font-bold text-gray-800 text-base">{selectedImage.name}</h4>
                            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{selectedImage.description || 'Sin descripción detallada.'}</p>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default PendingProducts;
