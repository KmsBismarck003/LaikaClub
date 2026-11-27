import React from 'react';
import Icon from '../../../../components/Icons/Icons';
import { getImageUrl } from '../../../../utils/imageUtils';
import { formatTime } from '../../../EventDetail/utils/helpers';
import useEventCountdown from '../../hooks/useEventCountdown';
import {
  getTicketDate,
  getTicketEventName,
  getTicketVenue,
  getTicketSection,
  formatTicketSeat,
} from '../Wallet/walletUtils';
import styles from '../../UserDashboard.module.css';

export default function NextEventHero({
  nextTicket,
  moreUpcomingCount = 0,
  onOpenTicket,
  onGoToTickets,
  onExplore,
}) {
  const dateRaw = nextTicket ? getTicketDate(nextTicket) : null;
  const timeRaw = nextTicket?.event?.time || nextTicket?.time || nextTicket?.event_time;
  const countdown = useEventCountdown(dateRaw, timeRaw);

  if (!nextTicket) {
    return (
      <section className={styles.sectionBlock} aria-label="Tu próximo evento">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionTitleGroup}>
            <p className={styles.sectionEyebrow}>Cuenta regresiva</p>
            <h2 className={styles.sectionHeading}>Tu próximo evento</h2>
          </div>
        </div>

        <div className={styles.emptyHeroCard}>
          <span className={styles.emptyHeroIcon}>
            <Icon name="ticket" size={26} />
          </span>
          <h3 className={styles.emptyHeroTitle}>Tu próxima experiencia te espera</h3>
          <p className={styles.emptyHeroText}>
            Cuando compres un boleto o recibas una cortesía, aquí verás tu cuenta regresiva en vivo y acceso directo.
          </p>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={onExplore}
          >
            <Icon name="compass" size={16} />
            <span>Explorar Eventos</span>
          </button>
        </div>
      </section>
    );
  }

  const eventName = getTicketEventName(nextTicket);
  const venue = getTicketVenue(nextTicket);
  const section = getTicketSection(nextTicket);
  const seatLabel = formatTicketSeat(nextTicket);
  const rawImg = nextTicket.event?.image_url || nextTicket.imageUrl || nextTicket.event?.image;
  const posterUrl = rawImg ? getImageUrl(rawImg) : null;
  const fmtTime = timeRaw && timeRaw !== 'N/A' ? formatTime(timeRaw) : '';

  const formattedFullDate = dateRaw
    ? new Date(dateRaw).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Fecha por confirmar';

  const phase = countdown?.phase || 'calm';
  const stageClass =
    phase === 'live_today'
      ? styles.heroStageLive
      : phase === 'imminent'
        ? styles.heroStageImminent
        : phase === 'building'
          ? styles.heroStageBuilding
          : styles.heroStageCalm;

  const phaseBadgeClass =
    phase === 'live_today'
      ? styles.phaseBadgeLive
      : phase === 'imminent'
        ? styles.phaseBadgeImminent
        : phase === 'building'
          ? styles.phaseBadgeBuilding
          : '';

  const showLiveDot = phase === 'live_today' || phase === 'imminent';

  return (
    <section className={styles.sectionBlock} aria-label="Tu próximo evento">
      <div className={styles.sectionHeaderRow}>
        <div className={styles.sectionTitleGroup}>
          <p className={styles.sectionEyebrow}>Cuenta regresiva en vivo</p>
          <h2 className={styles.sectionHeading}>Tu próximo evento</h2>
        </div>
      </div>

      <article className={`${styles.heroStage} ${stageClass}`}>
        {posterUrl ? (
          <img src={posterUrl} alt={eventName} className={styles.heroPoster} />
        ) : (
          <div className={styles.heroFallbackMesh} aria-hidden="true" />
        )}
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroPhaseAura} aria-hidden="true" />

        {/* Barra superior de fase emocional */}
        <div className={styles.heroTopBar}>
          <span className={`${styles.phaseBadge} ${phaseBadgeClass}`}>
            {showLiveDot ? (
              <span className={styles.liveDot} aria-hidden="true" />
            ) : (
              <Icon name="sparkles" size={13} />
            )}
            <span>{countdown?.badge || 'Confirmado'}</span>
          </span>

          {moreUpcomingCount > 0 && (
            <button
              type="button"
              className={styles.moreTicketsPill}
              onClick={onGoToTickets}
            >
              <span>
                +{moreUpcomingCount}{' '}
                {moreUpcomingCount === 1 ? 'evento próximo más' : 'eventos próximos más'}
              </span>
              <Icon name="arrowRight" size={13} />
            </button>
          )}
        </div>

        {/* Cuerpo: Identidad del evento + Reloj de anticipación */}
        <div className={styles.heroBody}>
          <div className={styles.heroEventInfo}>
            <span className={styles.heroEventEyebrow}>
              {countdown?.eyebrow || 'Tu próxima experiencia'}
            </span>
            <h3 className={styles.heroEventTitle}>{eventName}</h3>
            {countdown?.emotionNote && (
              <p className={styles.heroEmotionNote}>{countdown.emotionNote}</p>
            )}

            <div className={styles.heroMetaStrip}>
              <span className={styles.heroMetaItem}>
                <Icon name="calendar" size={14} />
                <span>{formattedFullDate}</span>
              </span>
              {fmtTime && (
                <span className={styles.heroMetaItem}>
                  <Icon name="clock" size={14} />
                  <span>{fmtTime} hrs</span>
                </span>
              )}
              <span className={styles.heroMetaItem}>
                <Icon name="mapPin" size={14} />
                <span>{venue}</span>
              </span>
              <span className={styles.heroSeatChip}>
                <Icon name="armchair" size={13} />
                <span>
                  {section} &bull; {seatLabel}
                </span>
              </span>
            </div>
          </div>

          <div className={styles.heroCountdownCol}>
            {countdown && (
              <>
                <div className={styles.countdownGrid} aria-live="off">
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownValue}>{countdown.days}</span>
                    <span className={styles.countdownLabel}>Días</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownValue}>{countdown.hours}</span>
                    <span className={styles.countdownLabel}>Horas</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownValue}>{countdown.minutes}</span>
                    <span className={styles.countdownLabel}>Min</span>
                  </div>
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownValue}>{countdown.seconds}</span>
                    <span className={styles.countdownLabel}>Seg</span>
                  </div>
                </div>

                <div className={styles.proximityWrap}>
                  <div className={styles.proximityHeader}>
                    <span>Proximidad al inicio</span>
                    <span>{countdown.proximityPercent}%</span>
                  </div>
                  <div className={styles.proximityTrack}>
                    <div
                      className={styles.proximityFill}
                      style={{ width: `${countdown.proximityPercent}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.heroCtaRow}>
              <button
                type="button"
                className={styles.heroPrimaryCta}
                onClick={() => onOpenTicket(nextTicket)}
              >
                <Icon name="ticket" size={16} />
                <span>
                  {phase === 'live_today' ? 'Abrir acceso ahora' : 'Ver mi boleto'}
                </span>
              </button>

              <button
                type="button"
                className={styles.heroSecondaryCta}
                onClick={onGoToTickets}
                aria-label="Ir a Mis Boletos"
              >
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
