import React, { useState, useEffect } from 'react';
import { Plus, Crown, ShoppingBag, Lock } from 'lucide-react';
import { Button, Skeleton, ConfirmationModal } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PremiumGuard from '../../components/PremiumGuard';
import './MerchandiseManager.css';

// CUSTOM HOOKS (Modular Logic)
import { useMerchSession } from './hooks/useMerchSession';
import { useMerchEditor } from './hooks/useMerchEditor';

// SUB-COMPONENTS (Modular UI)
import VisualEventPicker from './components/Events/VisualEventPicker';
import ActiveEventBanner from './components/Events/ActiveEventBanner';
import InventoryTable from './components/Inventory/InventoryTable';
import ProductEditorModal from './components/Editor/ProductEditorModal';

const MerchandiseManager = () => {
    const { showNotification } = useNotification();
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

    // 1. Session & Inventory Hook
    const session = useMerchSession(showNotification);

    // 2. Editor Hook
    const editor = useMerchEditor(showNotification, session.loadItems);

    // 3. Handlers
    const handleDeleteItem = (id) => {
        setConfirmModal({
            open: true,
            title: '¿ELIMINAR ACTIVO?',
            message: 'Esta acción es irreversible y retirará el producto de la tienda.',
            onConfirm: () => {
                session.deleteItem(id);
                showNotification('Eliminado', 'Producto retirado de la bóveda', 'success');
                setConfirmModal({ open: false });
            }
        });
    };

    const handleUpgradeClick = () => {
        showNotification('Función Premium', 'Gestión ILIMITADA de conciertos requiere Plan Pro/Empresarial. Contacta con soporte para activar.', 'info');
    };

    if (session.loading) {
        return (
            <div className="merch-industrial-container page-transition">
                <div style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <Skeleton height="50px" width="400px" borderRadius="12px" />
                        <Skeleton height="40px" width="150px" borderRadius="12px" />
                    </div>
                    <div className="industrial-glass" style={{ height: '600px', padding: '1rem' }}>
                        <Skeleton height="45px" width="100%" borderRadius="8px" style={{ marginBottom: '15px' }} />
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <Skeleton type="circle" width="50px" height="50px" />
                                <Skeleton height="50px" style={{ flex: 1 }} borderRadius="8px" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="merch-industrial-container page-transition">
            <header className="page-header-technical">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontWeight: 950, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            BÓVEDA DE MERCANCÍA <Crown size={18} color="#fbbf24" fill="#fbbf24" />
                        </h1>
                        <p style={{ margin: 0, color: '#888', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '2px' }}>CONTROL CENTRAL DE INVENTARIO Y LIVE PREVIEW</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Button variant="primary" className="neon-button-green" onClick={() => editor.startEdit({ id: `sku-${Date.now()}`, name: '', category: 'Ropa', variants: [], status: 'active', sold_count: 0, eventId: session.selectedEventId })}>
                            <Plus size={16} /> NUEVO ITEM
                        </Button>
                    </div>
                </div>

                <VisualEventPicker 
                    events={session.events} 
                    selectedId={session.selectedEventId}
                    onSelect={session.setSelectedEventId}
                    isPro={true}
                    onUpgrade={handleUpgradeClick}
                />
            </header>

            <PremiumGuard featureName="Bóveda de Mercancía Pro">
                <ActiveEventBanner event={session.activeEvent} />
                
                <InventoryTable 
                    filteredItems={session.filteredItems}
                    onEdit={editor.startEdit}
                    onDelete={handleDeleteItem}
                    onToggleStatus={session.toggleItemStatus}
                />
            </PremiumGuard>

            <ProductEditorModal 
                activeItem={editor.activeItem}
                onClose={() => editor.setActiveItem(null)}
                editorLoading={editor.editorLoading}
                onSave={editor.saveEdits}
                onChange={editor.handleChange}
                onUpdateVariant={editor.handleUpdateVariant}
                onAddVariant={editor.handleAddVariant}
                onRemoveVariant={editor.handleRemoveVariant}
            />

            <ConfirmationModal 
                isOpen={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ open: false })}
            />
        </div>
    );
};

export default MerchandiseManager;
