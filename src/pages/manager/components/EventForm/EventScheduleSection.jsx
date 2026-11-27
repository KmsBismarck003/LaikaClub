import React from 'react';
import { Badge, Icon } from '../../../../components';
import styles from '../../EventForm.module.css';

const EventScheduleSection = ({
  formData,
  venues,
  primaryRooms,
  functionVenueRooms,
  functions,
  newFunction,
  setNewFunction,
  showAdvanced,
  hasAdvancedPackage,
  onChange,
  onVenueChange,
  onFunctionVenueChange,
  onAddFunction,
  onRemoveFunction,
  getVenueName,
  getRoomName,
}) => {
  const canUseSeatingMap = Boolean(hasAdvancedPackage && formData.room_id);

  return (
    <section className={styles.sectionCard} aria-labelledby="event-schedule-heading">
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderMain}>
          <span className={styles.sectionStepBadge} aria-hidden="true">2</span>
          <div>
            <h3 id="event-schedule-heading" className={styles.sectionTitle}>
              Recinto, sala y funciones
            </h3>
            <p className={styles.sectionSubtitle}>
              Elige el recinto principal y programa una o varias fechas para el evento.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="event-venue" className={styles.fieldLabel}>
              Recinto principal <span className={styles.requiredMark}>*</span>
            </label>
            <select
              id="event-venue"
              name="venue_id"
              className={styles.select}
              value={formData.venue_id}
              onChange={onVenueChange}
              required
            >
              <option value="">Selecciona un recinto...</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{v.city ? ` (${v.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="event-location" className={styles.fieldLabel}>
              Ciudad / Ubicación <span className={styles.requiredMark}>*</span>
            </label>
            <input
              id="event-location"
              name="location"
              type="text"
              className={styles.input}
              value={formData.location}
              onChange={onChange}
              placeholder="Ej. Ciudad de México"
              disabled={Boolean(formData.venue_id && !showAdvanced)}
              required
            />
            {formData.venue_id && !showAdvanced && (
              <span className={styles.fieldHelper}>
                <Icon name="mapPin" size={12} />
                Tomada automáticamente del recinto seleccionado.
              </span>
            )}
          </div>
        </div>

        {formData.venue_id && primaryRooms.length > 0 && (
          <div className={styles.roomConfigBox}>
            <div className={styles.fieldGroup}>
              <label htmlFor="event-primary-room" className={styles.fieldLabel}>
                Sala del recinto
              </label>
              <select
                id="event-primary-room"
                name="room_id"
                className={styles.select}
                value={formData.room_id}
                onChange={onChange}
              >
                <option value="">Recinto completo (sin sala específica)</option>
                {primaryRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.capacity ? ` — Capacidad ${r.capacity}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.seatingToggleRow}>
              <label
                htmlFor="event-seating-map"
                className={`${styles.checkboxControl} ${
                  !canUseSeatingMap ? styles.checkboxControlDisabled : ''
                }`}
              >
                <input
                  id="event-seating-map"
                  name="use_seating_map"
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={Boolean(formData.use_seating_map && canUseSeatingMap)}
                  onChange={onChange}
                  disabled={!canUseSeatingMap}
                />
                <span>Usar mapa de asientos interactivo</span>
              </label>

              {!hasAdvancedPackage ? (
                <span className={styles.planBadge}>
                  <Icon name="lock" size={12} />
                  Requiere Plan Avanzado
                </span>
              ) : !formData.room_id ? (
                <span className={styles.fieldHelper}>
                  Selecciona una sala para activar el mapa interactivo.
                </span>
              ) : null}
            </div>
          </div>
        )}

        <div className={styles.schedulerBox}>
          <div className={styles.schedulerHeader}>
            <h4 className={styles.schedulerTitle}>
              Fechas y horarios (multifunción) <span className={styles.requiredMark}>*</span>
            </h4>
            <span className={styles.schedulerCount}>
              {functions.length} {functions.length === 1 ? 'función agregada' : 'funciones agregadas'}
            </span>
          </div>

          {functions.length > 0 && (
            <ul className={styles.functionList}>
              {functions.map((fn, idx) => (
                <li key={fn.id || fn.tempId || idx} className={styles.functionItem}>
                  <div className={styles.functionMeta}>
                    <div className={styles.functionPrimaryLine}>
                      <span className={styles.metaInline}>
                        <Icon name="calendar" size={14} />
                        {fn.date}
                      </span>
                      <span className={styles.metaInline}>
                        <Icon name="clock" size={14} />
                        {fn.time} hrs
                      </span>
                      {idx === 0 && (
                        <Badge variant="info" size="small" rounded>
                          Principal
                        </Badge>
                      )}
                    </div>
                    <div className={styles.functionSecondaryLine}>
                      <span className={styles.metaInline}>
                        <Icon name="mapPin" size={12} />
                        {getVenueName(fn.venue_id || formData.venue_id)}
                      </span>
                      {fn.room_id && (
                        <span className={styles.metaInline}>
                          <Icon name="armchair" size={12} />
                          {getRoomName(fn.room_id, fn.venue_id || formData.venue_id)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.iconDeleteBtn}
                    onClick={() => onRemoveFunction(idx)}
                    aria-label={`Eliminar función del ${fn.date} a las ${fn.time}`}
                  >
                    <Icon name="trash2" size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.functionComposer}>
            <div className={styles.gridTwo}>
              <div className={styles.fieldGroup}>
                <label htmlFor="fn-date" className={styles.fieldLabel}>
                  Fecha
                </label>
                <input
                  id="fn-date"
                  type="date"
                  className={styles.input}
                  value={newFunction.date}
                  onChange={(e) =>
                    setNewFunction((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="fn-time" className={styles.fieldLabel}>
                  Hora de inicio
                </label>
                <input
                  id="fn-time"
                  type="time"
                  className={styles.input}
                  value={newFunction.time}
                  onChange={(e) =>
                    setNewFunction((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.fieldGroup}>
                <label htmlFor="fn-venue" className={styles.fieldLabel}>
                  Recinto de la función
                </label>
                <select
                  id="fn-venue"
                  className={styles.select}
                  value={newFunction.venue_id || formData.venue_id}
                  onChange={(e) => onFunctionVenueChange(e.target.value)}
                >
                  <option value="">Usar recinto principal</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="fn-room" className={styles.fieldLabel}>
                  Sala (opcional)
                </label>
                <select
                  id="fn-room"
                  className={styles.select}
                  value={newFunction.room_id}
                  onChange={(e) =>
                    setNewFunction((prev) => ({ ...prev, room_id: e.target.value }))
                  }
                  disabled={functionVenueRooms.length === 0}
                >
                  <option value="">
                    {functionVenueRooms.length > 0 ? 'Acceso general / Sin sala' : 'Sin salas registradas'}
                  </option>
                  {functionVenueRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.functionComposerActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onAddFunction}
              >
                <Icon name="plus" size={15} />
                Agregar función
              </button>
            </div>
          </div>

          <span className={styles.fieldHelper}>
            <Icon name="info" size={12} />
            La fecha más próxima aparecerá en la tarjeta principal del catálogo.
          </span>
        </div>
      </div>
    </section>
  );
};

export default EventScheduleSection;
