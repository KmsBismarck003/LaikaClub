import React, { useState, useCallback } from 'react';
import ConfirmDialog from './ConfirmDialog';

/**
 * useConfirmDialog - Hook para invocar un cuadro de confirmación de manera programática
 * 
 * Uso:
 * const { confirm, ConfirmDialogComponent } = useConfirmDialog();
 * 
 * const handleAction = async () => {
 *   const confirmed = await confirm({
 *     title: '¿Agregar al carrito?',
 *     message: '¿Deseas agregar este evento a tu carrito?',
 *     variant: 'cart',
 *     confirmText: 'Agregar al carrito',
 *     itemDetails: { title: 'Concierto', price: '$500' }
 *   });
 *   if (confirmed) {
 *     // ejecutar lógica
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleAction}>Acción</button>
 *     <ConfirmDialogComponent />
 *   </>
 * );
 */
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'primary',
    icon: null,
    itemDetails: null,
    resolve: null
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || '¿Confirmar acción?',
        message: options.message || '¿Estás seguro de continuar?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'primary',
        icon: options.icon || null,
        itemDetails: options.itemDetails || null,
        size: options.size || 'small',
        resolve
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState]);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState]);

  const ConfirmDialogComponent = useCallback(() => {
    return (
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        icon={dialogState.icon}
        itemDetails={dialogState.itemDetails}
        size={dialogState.size}
      />
    );
  }, [dialogState, handleClose, handleConfirm]);

  return {
    confirm,
    ConfirmDialogComponent,
    isOpen: dialogState.isOpen,
    close: handleClose
  };
};

export default useConfirmDialog;
