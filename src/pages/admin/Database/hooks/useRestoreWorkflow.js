import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';

/**
 * useRestoreWorkflow — Hook para gestionar el flujo crítico de restauración y auditoría.
 */
export function useRestoreWorkflow(modalHelpers, showNotification, onSuccess) {
  const navigate = useNavigate();
  const { setConfirmConfig, handleOpenModal, handleCloseModal } = modalHelpers;

  const _doRestore = useCallback(async (backupId) => {
    handleCloseModal('confirm');
    const restoreStartTime = new Date().toISOString();
    try {
      const response = await api.database.restore(backupId);
      if (showNotification) showNotification('Base de datos restaurada exitosamente', '', 'success');
      if (onSuccess) onSuccess();

      setConfirmConfig({
        title: '✅ RESTAURACIÓN EXITOSA',
        message: '¿Deseas registrar esta restauración en el sistema de Auditoría?',
        confirmText: 'REGISTRAR AUDITORÍA',
        variant: 'success',
        onConfirm: () => {
          handleCloseModal('confirm');
          navigate('/admin/restore-audit', { 
            state: { 
              prefill: { 
                start_datetime: restoreStartTime.slice(0, 16), 
                database_name: response?.database || 'laika_club' 
              } 
            } 
          });
        }
      });
      handleOpenModal('confirm');
    } catch (error) {
      if (showNotification) showNotification('Error al restaurar base de datos', '', 'error');
    }
  }, [handleCloseModal, navigate, setConfirmConfig, handleOpenModal, onSuccess, showNotification]);

  const handleRestore = useCallback((backupId) => {
    setConfirmConfig({
      title: '⚠️ RESTAURAR BASE DE DATOS',
      message: 'ADVERTENCIA: Esta acción sobrescribirá TODOS los datos actuales. La operación es irreversible.',
      confirmText: 'RESTAURAR',
      variant: 'danger',
      onConfirm: () => _doRestore(backupId)
    });
    handleOpenModal('confirm');
  }, [setConfirmConfig, handleOpenModal, _doRestore]);

  const handleNoSqlRestore = useCallback((snapId) => {
    setConfirmConfig({
      title: 'RESTAURAR NOSQL',
      message: `Esto sobreescribirá datos en Atlas. ¿Continuar con ${snapId}?`,
      confirmText: 'RESTAURAR',
      variant: 'danger',
      onConfirm: async () => {
        handleCloseModal('confirm');
        try {
          await api.database.restore(snapId);
          if (showNotification) showNotification('Restauración NoSQL completada', '', 'success');
          if (onSuccess) onSuccess();
        } catch (err) {
          if (showNotification) showNotification('Error al restaurar', '', 'error');
        }
      }
    });
    handleOpenModal('confirm');
  }, [setConfirmConfig, handleOpenModal, handleCloseModal, onSuccess, showNotification]);

  return { handleRestore, handleNoSqlRestore };
}
