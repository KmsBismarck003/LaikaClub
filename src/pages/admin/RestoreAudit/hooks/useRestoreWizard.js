import { useState, useCallback } from 'react';
import api from '../../../../services/api';

/**
 * useRestoreWizard — Hook para gestionar el flujo de registro de auditoría (5 Pasos).
 */
export function useRestoreWizard(id, user, successNotification, errorNotification) {
  const [wizardStep, setWizardStep] = useState(0);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    start_datetime: '', end_datetime: '', database_name: '',
    environment: 'dev', restore_type: '', backup_size_mb: '',
    restore_reason: '', execution_method: 'manual', server_name: '',
    integrity_verified: false, integrity_result: 'pendiente', integrity_observations: '',
    total_tables: '', critical_record_count: '',
    log_errors_detected: '', log_errors_observations: '',
    data_consistency_validated: false, data_consistency_observations: '',
    checksum_match: false, checksum_observations: '',
    auth_result: 'pendiente', auth_observations: '',
    critical_modules_result: 'pendiente', critical_modules_observations: '',
    main_apis_result: 'pendiente', main_apis_observations: '',
    sensitive_operations_result: 'pendiente', sensitive_operations_observations: '',
    admin_panel_result: 'pendiente', admin_panel_observations: '',
    had_downtime: false, downtime_minutes: '', estimated_affected_users: '',
    severity: 'bajo', needed_retry: false, needed_rollback: false, impact_observations: '',
    final_comments: '', accepts_responsibility: false
  });

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetWizard = useCallback(() => {
    setWizardStep(0);
    setCurrentEventId(null);
    setFormData({
      start_datetime: '', end_datetime: '', database_name: '',
      environment: 'dev', restore_type: '', backup_size_mb: '',
      restore_reason: '', execution_method: 'manual', server_name: '',
      integrity_verified: false, integrity_result: 'pendiente', integrity_observations: '',
      total_tables: '', critical_record_count: '',
      log_errors_detected: '', log_errors_observations: '',
      data_consistency_validated: false, data_consistency_observations: '',
      checksum_match: false, checksum_observations: '',
      auth_result: 'pendiente', auth_observations: '',
      critical_modules_result: 'pendiente', critical_modules_observations: '',
      main_apis_result: 'pendiente', main_apis_observations: '',
      sensitive_operations_result: 'pendiente', sensitive_operations_observations: '',
      admin_panel_result: 'pendiente', admin_panel_observations: '',
      had_downtime: false, downtime_minutes: '', estimated_affected_users: '',
      severity: 'bajo', needed_retry: false, needed_rollback: false, impact_observations: '',
      final_comments: '', accepts_responsibility: false
    });
    setError('');
    setSuccess('');
  }, []);

  const handleCreateEvent = async () => {
    setError('');
    if (!formData.start_datetime || !formData.database_name || !formData.restore_reason || !formData.server_name || !formData.restore_type) {
      setError('Todos los campos obligatorios deben ser completados');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime || undefined,
        database_name: formData.database_name,
        environment: formData.environment,
        restore_type: formData.restore_type,
        backup_size_mb: formData.backup_size_mb ? parseFloat(formData.backup_size_mb) : undefined,
        restore_reason: formData.restore_reason,
        execution_method: formData.execution_method,
        server_name: formData.server_name
      };
      const data = await api.restoreAudit.createEvent(payload);
      setCurrentEventId(data.event.id);
      setWizardStep(1);
      setSuccess('Evento de restauración creado exitosamente');
    } catch (err) {
      setError('Error al crear evento: ' + (err.message || 'Fallo desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTechnical = async () => {
    setError('');
    setLoading(true);
    try {
      await api.restoreAudit.saveTechnicalChecks(currentEventId, {
        integrity_verified: formData.integrity_verified,
        integrity_result: formData.integrity_result,
        integrity_observations: formData.integrity_observations || undefined,
        total_tables: formData.total_tables ? parseInt(formData.total_tables) : undefined,
        critical_record_count: formData.critical_record_count ? parseInt(formData.critical_record_count) : undefined,
        log_errors_detected: formData.log_errors_detected || undefined,
        log_errors_observations: formData.log_errors_observations || undefined,
        data_consistency_validated: formData.data_consistency_validated,
        data_consistency_observations: formData.data_consistency_observations || undefined,
        checksum_match: formData.checksum_match || undefined,
        checksum_observations: formData.checksum_observations || undefined
      });
      setWizardStep(2);
      setSuccess('Validaciones técnicas guardadas');
    } catch (err) {
      setError('Error al guardar validaciones técnicas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFunctional = async () => {
    setError('');
    setLoading(true);
    try {
      await api.restoreAudit.saveFunctionalChecks(currentEventId, {
        auth_result: formData.auth_result,
        auth_observations: formData.auth_observations || undefined,
        critical_modules_result: formData.critical_modules_result,
        critical_modules_observations: formData.critical_modules_observations || undefined,
        main_apis_result: formData.main_apis_result,
        main_apis_observations: formData.main_apis_observations || undefined,
        sensitive_operations_result: formData.sensitive_operations_result,
        sensitive_operations_observations: formData.sensitive_operations_observations || undefined,
        admin_panel_result: formData.admin_panel_result,
        admin_panel_observations: formData.admin_panel_observations || undefined
      });
      setWizardStep(3);
      setSuccess('Validaciones funcionales guardadas');
    } catch (err) {
      setError('Error al guardar validaciones funcionales');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImpact = async () => {
    setError('');
    setLoading(true);
    try {
      await api.restoreAudit.saveOperationalImpact(currentEventId, {
        had_downtime: formData.had_downtime,
        downtime_minutes: formData.downtime_minutes ? parseFloat(formData.downtime_minutes) : 0,
        estimated_affected_users: formData.estimated_affected_users ? parseInt(formData.estimated_affected_users) : 0,
        severity: formData.severity,
        needed_retry: formData.needed_retry,
        needed_rollback: formData.needed_rollback,
        observations: formData.impact_observations || undefined
      });
      setWizardStep(4);
      setSuccess('Impacto operativo guardado');
    } catch (err) {
      setError('Error al guardar impacto operativo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (onComplete) => {
    setError('');
    if (!formData.accepts_responsibility) {
      setError('Debe aceptar la responsabilidad operativa para confirmar');
      return;
    }
    setLoading(true);
    try {
      await api.restoreAudit.confirmEvent(currentEventId, {
        final_comments: formData.final_comments || undefined,
        accepts_responsibility: true
      });
      setSuccess('Evento confirmado exitosamente. Registro bloqueado.');
      if (onComplete) onComplete();
      resetWizard();
    } catch (err) {
      setError('Error al confirmar: ' + (err.message || 'Fallo desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return {
    wizardStep, setWizardStep,
    formData, setFormData,
    loading, error, success,
    handleChange, resetWizard,
    handleCreateEvent,
    handleSaveTechnical,
    handleSaveFunctional,
    handleSaveImpact,
    handleConfirm
  };
}
