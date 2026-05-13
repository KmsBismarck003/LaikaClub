import React from 'react';
import { Icon, Card } from '../../../../../components';
import '../../css/Wizard.css';

const RestoreWizardForm = ({ 
  wizardStep, 
  setWizardStep, 
  formData, 
  handleChange, 
  handleCreateEvent, 
  handleSaveTechnical, 
  handleSaveFunctional, 
  handleSaveImpact, 
  handleConfirm, 
  loading,
  resetWizard,
  onComplete
}) => {
  const steps = ['Info General', 'Técnicas', 'Funcionales', 'Impacto', 'Confirmación'];

  const renderStep0 = () => (
    <div className="ra-form-section">
      <h3><Icon name="fileText" className="mr-2" /> Información General</h3>
      <div className="ra-form-grid">
        <div className="ra-form-group">
          <label>Fecha/Hora Inicio <span className="required">*</span></label>
          <input type="datetime-local" value={formData.start_datetime} onChange={e => handleChange('start_datetime', e.target.value)} />
        </div>
        <div className="ra-form-group">
          <label>Base de Datos <span className="required">*</span></label>
          <input type="text" value={formData.database_name} onChange={e => handleChange('database_name', e.target.value)} placeholder="ej: laika_club" />
        </div>
        <div className="ra-form-group">
          <label>Entorno <span className="required">*</span></label>
          <select value={formData.environment} onChange={e => handleChange('environment', e.target.value)}>
            <option value="dev">Desarrollo</option>
            <option value="staging">Staging</option>
            <option value="produccion">Producción</option>
          </select>
        </div>
        <div className="ra-form-group">
          <label>Tipo de Restauración <span className="required">*</span></label>
          <input type="text" value={formData.restore_type} onChange={e => handleChange('restore_type', e.target.value)} placeholder="ej: completa, parcial" />
        </div>
        <div className="ra-form-group">
          <label>Servidor Afectado <span className="required">*</span></label>
          <input type="text" value={formData.server_name} onChange={e => handleChange('server_name', e.target.value)} placeholder="ej: db-server-01" />
        </div>
        <div className="ra-form-group full-width">
          <label>Motivo <span className="required">*</span></label>
          <textarea value={formData.restore_reason} onChange={e => handleChange('restore_reason', e.target.value)} placeholder="Describa el motivo..." />
        </div>
      </div>
      <div className="ra-btn-row">
        <button className="ra-btn ra-btn-secondary" onClick={resetWizard}>Cancelar</button>
        <button className="ra-btn ra-btn-primary" onClick={handleCreateEvent} disabled={loading}>
          {loading ? 'Guardando...' : <span>Siguiente <Icon name="arrowRight" size={14} className="ml-2" /></span>}
        </button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="ra-form-section">
      <h3><Icon name="settings" className="mr-2" /> Validaciones Técnicas</h3>
      <div className="ra-form-grid">
        <div className="ra-form-group">
          <div className="ra-check-row" onClick={() => handleChange('integrity_verified', !formData.integrity_verified)}>
            <input type="checkbox" checked={formData.integrity_verified} readOnly />
            <label>Integridad verificada</label>
          </div>
        </div>
        <div className="ra-form-group">
          <label>Resultado</label>
          <select value={formData.integrity_result} onChange={e => handleChange('integrity_result', e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="exito">Éxito</option>
            <option value="fallo">Fallo</option>
          </select>
        </div>
        <div className="ra-form-group full-width">
          <label>Observaciones</label>
          <textarea value={formData.integrity_observations} onChange={e => handleChange('integrity_observations', e.target.value)} />
        </div>
      </div>
      <div className="ra-btn-row">
        <button className="ra-btn ra-btn-secondary" onClick={() => setWizardStep(0)}><Icon name="arrowLeft" size={14} className="mr-2" /> Anterior</button>
        <button className="ra-btn ra-btn-primary" onClick={handleSaveTechnical} disabled={loading}>{loading ? 'Guardando...' : 'Siguiente'}</button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="ra-form-section">
      <div className="ra-confirm-box">
        <h3><Icon name="lock" className="mr-2" /> Confirmación Final</h3>
        <p>Al confirmar, el registro quedará bloqueado permanentemente.</p>
        <div className="ra-form-group full-width" style={{ textAlign: 'left' }}>
          <div className="ra-check-row" onClick={() => handleChange('accepts_responsibility', !formData.accepts_responsibility)}
            style={{ border: formData.accepts_responsibility ? '2px solid #22c55e' : '2px solid #ef4444' }}>
            <input type="checkbox" checked={formData.accepts_responsibility} readOnly />
            <label>Acepto la responsabilidad operativa del evento.</label>
          </div>
        </div>
      </div>
      <div className="ra-btn-row">
        <button className="ra-btn ra-btn-secondary" onClick={() => setWizardStep(3)}>Anterior</button>
        <button className="ra-btn ra-btn-success" onClick={() => handleConfirm(onComplete)} disabled={loading || !formData.accepts_responsibility}>
          {loading ? 'Confirmando...' : 'Confirmar y Bloquear'}
        </button>
      </div>
    </div>
  );

  return (
    <Card className="glass-panel" style={{ padding: '1.5rem' }}>
      <div className="ra-wizard-steps">
        {steps.map((label, i) => (
          <div key={i} className={`ra-wizard-step ${i === wizardStep ? 'active' : ''} ${i < wizardStep ? 'completed' : ''}`}>
            <div className="ra-wizard-step-num">{i < wizardStep ? <Icon name="check" size={14} /> : i + 1}</div>
            <span className="ra-wizard-step-label">{label}</span>
          </div>
        ))}
      </div>
      {wizardStep === 0 && renderStep0()}
      {wizardStep === 1 && renderStep1()}
      {/* Simplified steps 2 and 3 for the demo, would include all fields in production */}
      {(wizardStep === 2 || wizardStep === 3) && (
        <div className="ra-form-section">
          <h3>Paso {wizardStep}: Validaciones {wizardStep === 2 ? 'Funcionales' : 'Impacto'}</h3>
          <p>Complete los campos necesarios en este paso...</p>
          <div className="ra-btn-row">
            <button className="ra-btn ra-btn-secondary" onClick={() => setWizardStep(wizardStep - 1)}>Anterior</button>
            <button className="ra-btn ra-btn-primary" onClick={wizardStep === 2 ? handleSaveFunctional : handleSaveImpact} disabled={loading}>Siguiente</button>
          </div>
        </div>
      )}
      {wizardStep === 4 && renderStep4()}
    </Card>
  );
};

export default RestoreWizardForm;
