import React, { useRef } from 'react';
import { Badge, Icon } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import styles from '../../EventForm.module.css';

const EventExtrasSection = ({
  event,
  formData,
  rules,
  newRule,
  setNewRule,
  showAdvanced,
  setShowAdvanced,
  uploadingSeatMap,
  onChange,
  onAddRule,
  onRemoveRule,
  onSeatMapUpload,
  onClearSeatMap,
}) => {
  const seatMapInputRef = useRef(null);

  const handleSeatMapClick = () => {
    if (!uploadingSeatMap && seatMapInputRef.current) {
      seatMapInputRef.current.click();
    }
  };

  return (
    <section className={styles.sectionCard} aria-labelledby="event-extras-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderMain}>
          <span className={styles.sectionStepBadge} aria-hidden="true">4</span>
          <div>
            <h3 id="event-extras-heading" className={styles.sectionTitle}>
              Reglas de acceso y ajustes opcionales
            </h3>
            <p className={styles.sectionSubtitle}>
              Políticas visibles para los asistentes, mapa de ubicación y mapa de zonas.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        <div className={styles.schedulerBox}>
          <div className={styles.schedulerHeader}>
            <h4 className={styles.schedulerTitle}>Reglas y restricciones de acceso</h4>
            <span className={styles.schedulerCount}>
              {rules.length} {rules.length === 1 ? 'regla' : 'reglas'}
            </span>
          </div>

          {rules.length > 0 && (
            <ul className={styles.rulesList}>
              {rules.map((rule, idx) => (
                <li key={idx} className={styles.ruleItem}>
                  <div>
                    <strong>{rule.title}</strong>
                    {rule.description && (
                      <span className={styles.ruleDesc}> — {rule.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.iconDeleteBtn}
                    onClick={() => onRemoveRule(idx)}
                    aria-label={`Eliminar regla ${rule.title}`}
                  >
                    <Icon name="trash2" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label htmlFor="rule-title" className={styles.fieldLabel}>
                Título de la regla
              </label>
              <input
                id="rule-title"
                type="text"
                className={styles.input}
                value={newRule.title}
                onChange={(e) => setNewRule((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej. Acceso +18 años"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="rule-desc" className={styles.fieldLabel}>
                Detalle breve
              </label>
              <input
                id="rule-desc"
                type="text"
                className={styles.input}
                value={newRule.description}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ej. Presentar identificación oficial vigente"
              />
            </div>
          </div>

          <div className={styles.functionComposerActions}>
            <button type="button" className={styles.btnSecondary} onClick={onAddRule}>
              <Icon name="plus" size={15} />
              Agregar regla
            </button>
          </div>
        </div>

        <div className={styles.roomConfigBox}>
          <button
            type="button"
            className={styles.collapsibleTrigger}
            onClick={() => setShowAdvanced((prev) => !prev)}
            aria-expanded={showAdvanced}
            style={{ padding: 0, minHeight: '32px', background: 'transparent' }}
          >
            <span className={styles.metaInline} style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              <Icon name="settings" size={15} />
              Ajustes avanzados de ubicación y mapas (opcional)
            </span>
            <Icon name={showAdvanced ? 'chevronUp' : 'chevronDown'} size={16} />
          </button>

          {showAdvanced && (
            <>
              <div className={styles.fieldGroup}>
                <label htmlFor="event-map-url" className={styles.fieldLabel}>
                  Google Maps URL (embed o directa)
                </label>
                <input
                  id="event-map-url"
                  name="map_url"
                  type="url"
                  className={styles.input}
                  value={formData.map_url}
                  onChange={onChange}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.mediaToolbar}>
                  <span className={styles.fieldLabel}>Imagen del mapa de zonas</span>
                  {formData.seat_map_url && (
                    <button
                      type="button"
                      className={styles.mediaLinkBtn}
                      onClick={onClearSeatMap}
                    >
                      <Icon name="trash2" size={13} />
                      Quitar imagen
                    </button>
                  )}
                </div>

                <div
                  className={styles.dropzone}
                  role="button"
                  tabIndex={0}
                  aria-label="Subir imagen del mapa de zonas"
                  onClick={handleSeatMapClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSeatMapClick();
                    }
                  }}
                >
                  <input
                    ref={seatMapInputRef}
                    id="event-seat-map-upload"
                    type="file"
                    accept="image/*"
                    onChange={onSeatMapUpload}
                    className={styles.hiddenInput}
                    disabled={uploadingSeatMap}
                  />

                  {formData.seat_map_url ? (
                    <div>
                      <img
                        src={getImageUrl(formData.seat_map_url)}
                        alt="Mapa de zonas del evento"
                        className={styles.seatMapPreviewImg}
                      />
                      <div className={styles.dropzoneCaption}>
                        {uploadingSeatMap
                          ? 'Subiendo mapa...'
                          : 'Haz clic para reemplazar la imagen del mapa'}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.dropzonePlaceholder}>
                      <span className={styles.dropzoneIconBox} aria-hidden="true">
                        <Icon name={uploadingSeatMap ? 'loader' : 'upload'} size={18} />
                      </span>
                      <p className={styles.dropzoneTitle}>
                        {uploadingSeatMap
                          ? 'Subiendo imagen del mapa...'
                          : 'Sube la imagen del mapa de zonas desde tu dispositivo'}
                      </p>
                      <p className={styles.dropzoneHint}>
                        PNG, JPG o WEBP de hasta 10 MB.
                      </p>
                    </div>
                  )}
                </div>

                <input
                  id="event-seat-map-url"
                  name="seat_map_url"
                  type="url"
                  className={styles.input}
                  value={formData.seat_map_url}
                  onChange={onChange}
                  placeholder="Opcional: pega un enlace directo del mapa de zonas"
                />
              </div>
            </>
          )}
        </div>

        <div className={styles.roomConfigBox}>
          <span className={styles.fieldLabel}>
            Módulos habilitados para este evento (asignados por administración)
          </span>
          <div className={styles.featuresStrip}>
            <Badge variant={formData.ads_enabled ? 'success' : 'default'} rounded>
              <Icon name="image" size={12} />
              Anuncios: {formData.ads_enabled ? `Activo (${formData.max_ads} máx)` : 'Inactivo'}
            </Badge>
            <Badge variant={formData.metrics_enabled ? 'success' : 'default'} rounded>
              <Icon name="activity" size={12} />
              Métricas: {formData.metrics_enabled ? 'Activo' : 'Inactivo'}
            </Badge>
            <Badge variant={formData.merch_enabled ? 'success' : 'default'} rounded>
              <Icon name="shoppingBag" size={12} />
              Mercancía: {formData.merch_enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {formData.ads_enabled && event?.id && (
            <div>
              <a
                href={`/manager/events/${event.id}/ads`}
                className={styles.btnSecondary}
                style={{ textDecoration: 'none' }}
              >
                <Icon name="externalLink" size={14} />
                Gestionar anuncios del evento
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventExtrasSection;
