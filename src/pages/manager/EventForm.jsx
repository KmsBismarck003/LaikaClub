import React from 'react';
import { Icon, Modal } from '../../components';
import EventCardPreview from './EventCardPreview';
import useManagerEventForm from './hooks/useManagerEventForm';
import EventIdentitySection from './components/EventForm/EventIdentitySection';
import EventScheduleSection from './components/EventForm/EventScheduleSection';
import EventPricingSection from './components/EventForm/EventPricingSection';
import EventExtrasSection from './components/EventForm/EventExtrasSection';
import styles from './EventForm.module.css';

const EventForm = ({ event = null, onSuccess, onClose }) => {
  const {
    formData,
    venues,
    primaryRooms,
    functionVenueRooms,
    functions,
    newFunction,
    setNewFunction,
    rules,
    newRule,
    setNewRule,
    showAdvanced,
    setShowAdvanced,
    hasAdvancedPackage,
    hasDraft,
    loading,
    uploading,
    uploadingGallery,
    uploadingSeatMap,
    galleryImages,
    handleRestoreDraft,
    handleDiscardDraft,
    handleChange,
    handleVenueChange,
    handleFunctionVenueChange,
    handleAddFunction,
    handleRemoveFunction,
    handleAddRule,
    handleRemoveRule,
    handleImageUpload,
    handleClearCoverImage,
    handleGalleryUpload,
    handleAddGalleryUrl,
    handleRemoveGalleryImage,
    handleMoveGalleryImage,
    handleSeatMapUpload,
    handleClearSeatMap,
    handlePresaleChange,
    handleSubmit,
    getVenueName,
    getRoomName,
  } = useManagerEventForm({ event, onSuccess });

  const isEditing = Boolean(event && event.id);
  const isBusy = loading || uploading || uploadingGallery || uploadingSeatMap;
  const submitLabel = loading
    ? 'Guardando...'
    : isEditing
      ? 'Guardar cambios'
      : 'Crear evento';

  const formContent = (
    <form className={styles.formShell} onSubmit={handleSubmit} noValidate>
      <div className={styles.layoutGrid}>
        <div className={styles.formColumn}>
          {hasDraft && (
            <div className={styles.draftBanner} role="status">
              <div className={styles.draftInfo}>
                <span className={styles.draftIcon} aria-hidden="true">
                  <Icon name="fileText" size={18} />
                </span>
                <div>
                  <p className={styles.draftTitle}>Tienes un borrador guardado</p>
                  <p className={styles.draftText}>
                    Recupera tus datos previos o descártalo para comenzar desde cero.
                  </p>
                </div>
              </div>
              <div className={styles.draftActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleDiscardDraft}
                >
                  Descartar
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleRestoreDraft}
                >
                  Restaurar borrador
                </button>
              </div>
            </div>
          )}

          <EventIdentitySection
            formData={formData}
            uploading={uploading}
            uploadingGallery={uploadingGallery}
            galleryImages={galleryImages}
            onChange={handleChange}
            onImageUpload={handleImageUpload}
            onClearCoverImage={handleClearCoverImage}
            onGalleryUpload={handleGalleryUpload}
            onAddGalleryUrl={handleAddGalleryUrl}
            onRemoveGalleryImage={handleRemoveGalleryImage}
            onMoveGalleryImage={handleMoveGalleryImage}
          />

          <EventScheduleSection
            formData={formData}
            venues={venues}
            primaryRooms={primaryRooms}
            functionVenueRooms={functionVenueRooms}
            functions={functions}
            newFunction={newFunction}
            setNewFunction={setNewFunction}
            showAdvanced={showAdvanced}
            hasAdvancedPackage={hasAdvancedPackage}
            onChange={handleChange}
            onVenueChange={handleVenueChange}
            onFunctionVenueChange={handleFunctionVenueChange}
            onAddFunction={handleAddFunction}
            onRemoveFunction={handleRemoveFunction}
            getVenueName={getVenueName}
            getRoomName={getRoomName}
          />

          <EventPricingSection
            formData={formData}
            onChange={handleChange}
            onPresaleChange={handlePresaleChange}
          />

          <EventExtrasSection
            event={event}
            formData={formData}
            rules={rules}
            newRule={newRule}
            setNewRule={setNewRule}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            uploadingSeatMap={uploadingSeatMap}
            onChange={handleChange}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onSeatMapUpload={handleSeatMapUpload}
            onClearSeatMap={handleClearSeatMap}
          />

          <div className={styles.stickyFooter}>
            <span className={styles.footerSummary}>
              {isEditing
                ? 'Los cambios se aplicarán inmediatamente al evento publicado.'
                : 'Revisa la vista previa antes de publicar tu evento.'}
            </span>

            <div className={styles.footerButtons}>
              {onClose && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isBusy}
              >
                <Icon name={loading ? 'loader' : 'check'} size={16} />
                {submitLabel}
              </button>
            </div>
          </div>
        </div>

        <aside className={styles.previewColumn} aria-label="Resumen visual del evento">
          <EventCardPreview
            eventData={formData}
            functions={functions}
            newFunction={newFunction}
          />
        </aside>
      </div>
    </form>
  );

  if (onClose) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={isEditing ? 'Editar evento' : 'Crear nuevo evento'}
        size="large"
      >
        {formContent}
      </Modal>
    );
  }

  return formContent;
};

export default EventForm;
