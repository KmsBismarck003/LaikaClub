import { useState, useCallback } from 'react';
import api from '../../../../services/api';

/**
 * useBackupActions — Hook para orquestar la creación, eliminación y descarga de respaldos.
 */
export function useBackupActions(onSuccess, showNotification) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);

  const handleCreateBackup = useCallback(async (type) => {
    setLoading(true);
    setAlert({ type: 'info', message: `Iniciando respaldo ${type}...` });
    try {
      await api.database.createBackup(type);
      if (showNotification) showNotification('Éxito', `Respaldo ${type} creado correctamente`, 'success');
      if (onSuccess) onSuccess();
    } catch (error) {
      if (showNotification) showNotification('Error', 'No se pudo crear el respaldo', 'error');
    } finally {
      setLoading(false);
      setAlert(null);
    }
  }, [onSuccess, showNotification]);

  const handleSelectiveBackup = useCallback(async () => {
    if (selectedTables.length === 0) {
      if (showNotification) showNotification('Selecciona al menos una tabla', '', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.database.createBackup('selectivo', { tables: selectedTables });
      if (showNotification) showNotification('Respaldo selectivo creado correctamente', '', 'success');
      setSelectedTables([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (showNotification) showNotification('Error al crear respaldo selectivo', '', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedTables, onSuccess, showNotification]);

  const handleDownloadBackup = useCallback(async (backupId, format = 'sql') => {
    try {
      if (showNotification) showNotification('Iniciando descarga...', '', 'info');
      const url = api.database.downloadBackupUrl(backupId);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {};
      if (token && token !== 'undefined' && token !== 'null') {
          headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) throw new Error('Error al descargar');
      
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', `${backupId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      if (showNotification) showNotification('Error en la descarga', '', 'error');
    }
  }, [showNotification]);

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.database.listTables();
      setTables(res.tables || []);
    } catch (err) {
      if (showNotification) showNotification('Error al cargar tablas', '', 'error');
    }
  }, [showNotification]);

  return {
    loading, alert, setAlert,
    tables, selectedTables, setSelectedTables,
    handleCreateBackup, handleSelectiveBackup, handleDownloadBackup, fetchTables
  };
}
