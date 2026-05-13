import { useState, useCallback } from 'react';

/**
 * useDatabaseModals — Hook para gestionar el estado de los modales en la página de Base de Datos.
 */
export function useDatabaseModals() {
  const [modals, setModals] = useState({
    showBackupModal: false,
    showAutoBackupModal: false,
    showSelectiveModal: false,
    showNoSqlBackupModal: false,
    showConfirmModal: false
  });

  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
    variant: 'danger'
  });

  const handleOpenModal = useCallback((type) => {
    const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
    setModals(prev => ({ ...prev, [key]: true }));
  }, []);

  const handleCloseModal = useCallback((type) => {
    const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
    setModals(prev => ({ ...prev, [key]: false }));
  }, []);

  return { modals, setModals, confirmConfig, setConfirmConfig, handleOpenModal, handleCloseModal };
}
