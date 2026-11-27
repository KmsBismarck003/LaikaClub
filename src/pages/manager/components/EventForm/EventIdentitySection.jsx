import React, { useRef } from 'react';
import { Icon } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import { EVENT_CATEGORIES } from '../../utils/eventFormUtils';
import styles from '../../EventForm.module.css';

const EventIdentitySection = ({
  formData,
  uploading,
  onChange,
  onImageUpload,
}) => {
  const fileInputRef = useRef(null);

  const handleDropzoneClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDropzoneKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropzoneClick();
    }
  };

  return (
    <section className={styles.sectionCard} aria-labelledby="event-identity-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderMain}>
          <span className={styles.sectionStepBadge} aria-hidden="true">1</span>
          <div>
            <h3 id="event-identity-heading" className={styles.sectionTitle}>
              Identidad e imagen
            </h3>
            <p className={styles.sectionSubtitle}>
              Define el título, la categoría y la portada que verán los asistentes en el inicio.
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

        <div className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>Portada del evento</span>
          <div
            className={styles.dropzone}
            role="button"
            tabIndex={0}
            aria-label="Subir imagen de portada del evento"
            onClick={handleDropzoneClick}
            onKeyDown={handleDropzoneKeyDown}
          >
            <input
              ref={fileInputRef}
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
                  {uploading ? 'Subiendo nueva imagen...' : 'Haz clic para reemplazar la portada'}
                </div>
              </div>
            ) : (
              <div className={styles.dropzonePlaceholder}>
                <span className={styles.dropzoneIconBox} aria-hidden="true">
                  <Icon name={uploading ? 'loader' : 'upload'} size={20} />
                </span>
                <p className={styles.dropzoneTitle}>
                  {uploading ? 'Subiendo portada...' : 'Sube la imagen oficial del evento'}
                </p>
                <p className={styles.dropzoneHint}>
                  PNG, JPG o WEBP de hasta 5 MB. Recomendado formato horizontal 16:9.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="event-image-url" className={styles.fieldLabel}>
            O pega una URL directa de imagen
          </label>
          <input
            id="event-image-url"
            name="image_url"
            type="url"
            className={styles.input}
            value={formData.image_url}
            onChange={onChange}
            placeholder="https://cdn.tu-sitio.com/portada.jpg"
          />
        </div>
      </div>
    </section>
  );
};

export default EventIdentitySection;
