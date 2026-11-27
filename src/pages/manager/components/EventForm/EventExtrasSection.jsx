import React from 'react';
import { Badge, Icon } from '../../../../components';
import styles from '../../EventForm.module.css';

const EventExtrasSection = ({
  event,
  formData,
  rules,
  newRule,
  setNewRule,
  showAdvanced,
  setShowAdvanced,
  onChange,
  onAddRule,
  onRemoveRule,
}) => {
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
              Políticas visibles para los asistentes, galería adicional y mapas personalizados.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        {/* Reglas de acceso */}
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

        {/* Galería adicional */}
        <div className={styles.fieldGroup}>
          <label htmlFor="event-gallery" className={styles.fieldLabel}>
            Galería adicional (URLs separadas por comas)
          </label>
          <textarea
            id="event-gallery"
            name="gallery_urls"
            className={styles.textarea}
            value={formData.gallery_urls}
            onChange={onChange}
            placeholder="https://sitio.com/foto1.jpg, https://sitio.com/foto2.jpg"
            rows={2}
          />
        </div>

        {/* Ajustes avanzados de ubicación y mapas */}
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
            <div className={styles.gridTwo}>
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
                <label htmlFor="event-seat-map-url" className={styles.fieldLabel}>
                  Imagen del mapa de zonas (URL)
                </label>
                <input
                  id="event-seat-map-url"
                  name="seat_map_url"
                  type="url"
                  className={styles.input}
                  value={formData.seat_map_url}
                  onChange={onChange}
                  placeholder="https://cdn.tu-sitio.com/mapa-zonas.png"
                />
              </div>
            </div>
          )}
        </div>

        {/* Características habilitadas por administración */}
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
