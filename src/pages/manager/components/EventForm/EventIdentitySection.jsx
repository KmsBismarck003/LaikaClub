import React, { useRef, useState } from 'react';
import { Icon } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import { EVENT_CATEGORIES } from '../../utils/eventFormUtils';
import styles from '../../EventForm.module.css';

const EventIdentitySection = ({
  formData,
  uploading,
  uploadingGallery,
  galleryImages = [],
  onChange,
  onImageUpload,
  onClearCoverImage,
  onGalleryUpload,
  onAddGalleryUrl,
  onRemoveGalleryImage,
  onMoveGalleryImage,
}) => {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');

  const handleCoverClick = () => {
    if (!uploading && coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (!uploadingGallery && galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleKeyTrigger = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const handleManualUrlAdd = () => {
    if (!manualGalleryUrl.trim()) return;
    onAddGalleryUrl(manualGalleryUrl);
    setManualGalleryUrl('');
  };

  return (
    <section className={styles.sectionCard} aria-labelledby="event-identity-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderMain}>
          <span className={styles.sectionStepBadge} aria-hidden="true">1</span>
          <div>
            <h3 id="event-identity-heading" className={styles.sectionTitle}>
              Identidad, portada y galería
            </h3>
            <p className={styles.sectionSubtitle}>
              Define el título, la portada principal y las fotos del carrusel que verán los asistentes.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        <div className={styles.fieldGroup}>
          <label htmlFor="event-name" className={styles.fieldLabel}>
            Nombre del evento <span className={styles.requiredMark}>*</span>
          </label>
          <input
            id="event-name"
            name="name"
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={onChange}
            placeholder="Ej. Festival de Jazz en Vivo 2026"
            required
          />
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="event-category" className={styles.fieldLabel}>
              Categoría <span className={styles.requiredMark}>*</span>
            </label>
            <select
              id="event-category"
              name="category"
              className={styles.select}
              value={formData.category}
              onChange={onChange}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="event-duration" className={styles.fieldLabel}>
              Duración estimada (minutos)
            </label>
            <input
              id="event-duration"
              name="duration_minutes"
              type="number"
              min="0"
              step="15"
              className={styles.input}
              value={formData.duration_minutes}
              onChange={onChange}
              placeholder="Ej. 120"
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="event-description" className={styles.fieldLabel}>
            Descripción
          </label>
          <textarea
            id="event-description"
            name="description"
            className={styles.textarea}
            value={formData.description}
            onChange={onChange}
            placeholder="Describe el programa, artistas invitados y detalles clave para el público..."
            rows={3}
          />
        </div>

        {/* Portada principal */}
        <div className={styles.fieldGroup}>
          <div className={styles.mediaToolbar}>
            <span className={styles.fieldLabel}>Portada principal</span>
            {formData.image_url && (
              <button
                type="button"
                className={styles.mediaLinkBtn}
                onClick={onClearCoverImage}
              >
                <Icon name="trash2" size={13} />
                Quitar portada
              </button>
            )}
          </div>

          <div
            className={styles.dropzone}
            role="button"
            tabIndex={0}
            aria-label="Subir imagen de portada del evento"
            onClick={handleCoverClick}
            onKeyDown={handleKeyTrigger(handleCoverClick)}
          >
            <input
              ref={coverInputRef}
              id="event-image-upload"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className={styles.hiddenInput}
              disabled={uploading}
            />

            {formData.image_url ? (
              <div>
                <img
                  src={getImageUrl(formData.image_url)}
                  alt={formData.name || 'Portada del evento'}
                  className={styles.dropzonePreviewImg}
                />
                <div className={styles.dropzoneCaption}>
                  {uploading ? 'Subiendo nueva imagen...' : 'Haz clic para reemplazar la portada desde tu dispositivo'}
                </div>
              </div>
            ) : (
              <div className={styles.dropzonePlaceholder}>
                <span className={styles.dropzoneIconBox} aria-hidden="true">
                  <Icon name={uploading ? 'loader' : 'upload'} size={20} />
                </span>
                <p className={styles.dropzoneTitle}>
                  {uploading ? 'Subiendo portada...' : 'Sube la portada desde tu dispositivo'}
                </p>
                <p className={styles.dropzoneHint}>
                  JPG, PNG, WEBP o GIF de hasta 10 MB. Recomendado formato horizontal 16:9.
                </p>
              </div>
            )}
          </div>

          <input
            id="event-image-url"
            name="image_url"
            type="url"
            className={styles.input}
            value={formData.image_url}
            onChange={onChange}
            placeholder="Opcional: pega un enlace directo si ya tienes la imagen en línea"
          />
        </div>

        {/* Galería para el carrusel */}
        <div className={styles.schedulerBox}>
          <div className={styles.schedulerHeader}>
            <h4 className={styles.schedulerTitle}>Galería para el carrusel del evento</h4>
            <span className={styles.schedulerCount}>
              {galleryImages.length}{' '}
              {galleryImages.length === 1 ? 'imagen' : 'imágenes'}
            </span>
          </div>

          <div
            className={styles.dropzone}
            role="button"
            tabIndex={0}
            aria-label="Subir imágenes para la galería del carrusel"
            onClick={handleGalleryClick}
            onKeyDown={handleKeyTrigger(handleGalleryClick)}
          >
            <input
              ref={galleryInputRef}
              id="event-gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={onGalleryUpload}
              className={styles.hiddenInput}
              disabled={uploadingGallery}
            />

            <div className={styles.dropzonePlaceholder}>
              <span className={styles.dropzoneIconBox} aria-hidden="true">
                <Icon name={uploadingGallery ? 'loader' : 'image'} size={20} />
              </span>
              <p className={styles.dropzoneTitle}>
                {uploadingGallery
                  ? 'Subiendo imágenes a la galería...'
                  : 'Sube una o varias fotos para el carrusel'}
              </p>
              <p className={styles.dropzoneHint}>
                Puedes seleccionar varios archivos a la vez (JPG, PNG, WEBP o GIF, máx. 10 MB c/u).
              </p>
            </div>
          </div>

          {galleryImages.length > 0 && (
            <div className={styles.galleryGrid}>
              {galleryImages.map((imgUrl, idx) => (
                <div key={`${imgUrl}-${idx}`} className={styles.galleryThumbCard}>
                  <span className={styles.galleryThumbBadge}>#{idx + 1}</span>
                  <img
                    src={getImageUrl(imgUrl)}
                    alt={`Imagen ${idx + 1} de la galería`}
                    className={styles.galleryThumbImg}
                    loading="lazy"
                  />
                  <div className={styles.galleryThumbActions}>
                    <div className={styles.galleryOrderGroup}>
                      <button
                        type="button"
                        className={styles.miniIconBtn}
                        onClick={() => onMoveGalleryImage(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`Mover imagen ${idx + 1} a la izquierda`}
                      >
                        <Icon name="chevronLeft" size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.miniIconBtn}
                        onClick={() => onMoveGalleryImage(idx, 1)}
                        disabled={idx === galleryImages.length - 1}
                        aria-label={`Mover imagen ${idx + 1} a la derecha`}
                      >
                        <Icon name="chevronRight" size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.miniDangerBtn}
                      onClick={() => onRemoveGalleryImage(idx)}
                      aria-label={`Eliminar imagen ${idx + 1} de la galería`}
                    >
                      <Icon name="trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.galleryUrlRow}>
            <input
              id="gallery-url-manual"
              type="url"
              className={styles.input}
              value={manualGalleryUrl}
              onChange={(e) => setManualGalleryUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleManualUrlAdd();
                }
              }}
              placeholder="Opcional: agrega una imagen por enlace (https://...)"
            />
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleManualUrlAdd}
              disabled={!manualGalleryUrl.trim()}
            >
              <Icon name="plus" size={15} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventIdentitySection;
