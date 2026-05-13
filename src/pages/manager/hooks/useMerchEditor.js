import { useState, useCallback } from 'react';
import { merchInventory } from '../../../services/merchInventory';

/**
 * useMerchEditor — Hook para gestionar la creación y edición de productos.
 */
export function useMerchEditor(showNotification, onComplete) {
  const [activeItem, setActiveItem] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);

  const startEdit = useCallback((item) => {
    setActiveItem({ ...item });
    setEditorLoading(true);
    setTimeout(() => setEditorLoading(false), 1000);
  }, []);

  const handleChange = useCallback((field, value) => {
    setActiveItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdateVariant = useCallback((index, field, value) => {
    setActiveItem(prev => {
      const copy = [...prev.variants];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, variants: copy };
    });
  }, []);

  const handleAddVariant = useCallback(() => {
    setActiveItem(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { size: 'OS', price: 0, stock: 0 }]
    }));
  }, []);

  const handleRemoveVariant = useCallback((index) => {
    setActiveItem(prev => {
      const copy = [...prev.variants];
      copy.splice(index, 1);
      return { ...prev, variants: copy };
    });
  }, []);

  const saveEdits = useCallback((e) => {
    if (e) e.preventDefault();
    if (!activeItem) return;

    merchInventory.updateItem(activeItem);
    if (showNotification) showNotification('Sincronizado', 'Cambios aplicados correctamente', 'success');
    if (onComplete) onComplete();
    setActiveItem(null);
  }, [activeItem, showNotification, onComplete]);

  return {
    activeItem, setActiveItem,
    editorLoading,
    startEdit, handleChange,
    handleUpdateVariant, handleAddVariant, handleRemoveVariant,
    saveEdits
  };
}
