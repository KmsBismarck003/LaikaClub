import { useState, useCallback, useEffect, useMemo } from 'react';
import api from '../../../../services/api';

/**
 * useBackupManager — Hook para gestionar la lista de respaldos y configuración de retención.
 */
export function useBackupManager(showNotification) {
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchBackupsList = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const [backupsResponse, configResponse] = await Promise.all([
        api.database.listBackups(),
        api.database.getAutomaticBackupConfig()
      ]);

      const allBackups = backupsResponse.backups || [];
      const mysqlBackups = allBackups.filter(b => b && b.type !== 'mongodb' && !(b.backup_id && b.backup_id.toLowerCase().includes('mongo')));
      setBackups(mysqlBackups);

      if (configResponse?.config?.retentionDays) {
        setRetentionDays(configResponse.config.retentionDays);
      }
    } catch (error) {
      if (showNotification) showNotification('Error al cargar lista de respaldos', 'Falla de conexión', 'error');
    } finally {
      setLoadingBackups(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchBackupsList();
  }, [fetchBackupsList]);

  const filteredBackups = useMemo(() => backups.filter(b => parseFloat(b.size_mb) > 0), [backups]);
  const currentBackups = useMemo(() => filteredBackups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredBackups, currentPage]);
  const totalPages = useMemo(() => Math.ceil(filteredBackups.length / itemsPerPage), [filteredBackups]);
  const totalSize = useMemo(() => backups.reduce((acc, b) => acc + (parseFloat(b.size_mb) || 0), 0).toFixed(2), [backups]);
  const lastBackup = useMemo(() => backups.length > 0 ? new Date(backups[0].created_at).toLocaleDateString('es-MX') : 'N/A', [backups]);

  return {
    loadingBackups,
    backups, fetchBackupsList,
    retentionDays,
    currentPage, setCurrentPage,
    currentBackups, totalPages, totalSize, lastBackup
  };
}
