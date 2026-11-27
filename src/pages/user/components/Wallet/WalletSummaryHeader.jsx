import React from 'react';
import { BentoGrid, BentoCard, BentoMetric, BentoBadge } from '../../../../components/Bento';
import Icon from '../../../../components/Icons/Icons';
import {
  getTicketDate,
  getTicketEventName,
  getTicketVenue,
  getEventCountdownLabel,
  parseTicketDateParts,
} from './walletUtils';
import styles from '../../UserWallet.module.css';

export default function WalletSummaryHeader({
  upcomingCount,
  pastCount,
  nextEventTicket,
  activeTab,
  onSelectTab,
  onOpenTicket,
  onOpenRedeem,
}) {
  const nextDateRaw = nextEventTicket ? getTicketDate(nextEventTicket) : null;
  const nextCountdown = getEventCountdownLabel(nextDateRaw);
  const nextDateParts = parseTicketDateParts(nextDateRaw);

  return (
    <>
      <header className={styles.walletTopBar}>
        <div className={styles.walletHeadingGroup}>
          <span className={styles.walletEyebrow}>Bóveda Digital</span>
          <h1 className={styles.walletTitle}>Mis Boletos</h1>
          <p className={styles.walletSubtitle}>
            Consulta tus accesos vigentes, gestiona transferencias y conserva tus recuerdos de eventos.
          </p>
        </div>

        <button
          type="button"
          className={styles.redeemBtn}
          onClick={onOpenRedeem}
        >
          <Icon name="crown" size={16} />
          <span>Canjear Cortesía</span>
        </button>
      </header>

      <BentoGrid>
        <BentoCard
          colSpan={4}
          variant="interactive"
          className={activeTab === 'upcoming' ? styles.summaryCardActive : ''}
          onClick={() => onSelectTab('upcoming')}
        >
          <div className={styles.summaryCardHead}>
            <span className={styles.summaryIconBox}>
              <Icon name="ticket" size={17} />
            </span>
            <BentoBadge variant={upcomingCount > 0 ? 'success' : 'neutral'} dot={upcomingCount > 0}>
              {upcomingCount > 0 ? 'Listos' : 'Sin activos'}
            </BentoBadge>
          </div>
          <BentoMetric
            value={upcomingCount}
            label="Próximos eventos"
            animate={false}
          />
          <span className={styles.summaryHint}>
            Toca cualquier boleto para abrir tu acceso digital.
          </span>
        </BentoCard>

        <BentoCard
          colSpan={4}
          variant={nextEventTicket ? 'interactive' : 'subtle'}
          onClick={nextEventTicket ? () => onOpenTicket(nextEventTicket) : undefined}
        >
          <div className={styles.summaryCardHead}>
            <span className={styles.summaryIconBox}>
              <Icon name="calendar" size={17} />
            </span>
            {nextCountdown ? (
              <BentoBadge variant="info">{nextCountdown}</BentoBadge>
            ) : (
              <BentoBadge variant="neutral">Agenda libre</BentoBadge>
            )}
          </div>

          {nextEventTicket ? (
            <div className={styles.nextEventPreview}>
              <span className={styles.detailLabel}>Siguiente cita</span>
              <h2 className={styles.nextEventName}>{getTicketEventName(nextEventTicket)}</h2>
              <p className={styles.nextEventMeta}>
                {nextDateParts.full} &bull; {getTicketVenue(nextEventTicket)}
              </p>
              <span className={styles.nextEventAction}>
                <span>Abrir acceso</span>
                <Icon name="arrowRight" size={14} />
              </span>
            </div>
          ) : (
            <div className={styles.nextEventPreview}>
              <span className={styles.detailLabel}>Siguiente cita</span>
              <h2 className={styles.nextEventName}>Sin eventos agendados</h2>
              <p className={styles.nextEventMeta}>
                Tus próximas compras aparecerán priorizadas aquí.
              </p>
            </div>
          )}
        </BentoCard>

        <BentoCard
          colSpan={4}
          variant="interactive"
          className={activeTab === 'past' ? styles.summaryCardActive : ''}
          onClick={() => onSelectTab('past')}
        >
          <div className={styles.summaryCardHead}>
            <span className={styles.summaryIconBox}>
              <Icon name="history" size={17} />
            </span>
            <BentoBadge variant="neutral">Archivo</BentoBadge>
          </div>
          <BentoMetric
            value={pastCount}
            label="Eventos pasados"
            animate={false}
          />
          <span className={styles.summaryHint}>
            Recuerdos coleccionables sin código QR activo.
          </span>
        </BentoCard>
      </BentoGrid>
    </>
  );
}

