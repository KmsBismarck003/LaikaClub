import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserWallet from './hooks/useUserWallet';
import { useTicketTransfer } from '../../hooks/useTicketTransfer';
import { useNotification } from '../../context/NotificationContext';
import Icon from '../../components/Icons/Icons';

// Wallet modular UI components
import WalletSummaryHeader from './components/Wallet/WalletSummaryHeader';
import IncomingTransfersBanner from './components/Wallet/IncomingTransfersBanner';
import WalletTicketCard from './components/Wallet/WalletTicketCard';
import WalletEmptyState from './components/Wallet/WalletEmptyState';

// Existing modals (contratos preservados)
import TicketModal from './components/Wallet/TicketModal';
import CancelTicketModal from './components/Wallet/CancelTicketModal';
import TransferModal from '../../components/Transfer/TransferModal';
import RedeemCourtesyModal from './components/Wallet/RedeemCourtesyModal';
import CourtesyGiftRevealModal from './components/Wallet/CourtesyGiftRevealModal';

import styles from './UserWallet.module.css';

export default function UserWallet() {
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const {
    tickets,
    incomingTransfers,
    outgoingTransfers,
    loading,
    loadError,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    upcoming,
    past,
    cancelled,
    nextEventTicket,
    activeList,
    giftCourtesyTicket,
    setGiftCourtesyTicket,
    markCourtesySeen,
    fetchTickets,
  } = useUserWallet();

  const [ticketModal, setTicketModal] = useState(null); // { ticket, isPast }
  const [cancelModalTicket, setCancelModalTicket] = useState(null);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  const transfer = useTicketTransfer({ success, error, onComplete: fetchTickets });

  const handleOpenTicket = (ticket, isPast = false) => {
    setTicketModal({ ticket, isPast });
  };

  const tabs = [
    { id: 'upcoming', label: 'Próximos', count: upcoming.length },
    { id: 'past', label: 'Pasados', count: past.length },
    { id: 'cancelled', label: 'Cancelados / Cedidos', count: cancelled.length },
  ];

  if (loading) {
    return (
      <div className={styles.walletPage}>
        <div className={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.walletPage}>
      {/* ── Cabecera + Resumen Bento ────────────────────────────── */}
      <WalletSummaryHeader
        upcomingCount={upcoming.length}
        pastCount={past.length}
        nextEventTicket={nextEventTicket}
        activeTab={tab}
        onSelectTab={setTab}
        onOpenTicket={(tkt) => handleOpenTicket(tkt, false)}
        onOpenRedeem={() => setIsRedeemOpen(true)}
      />

      {/* ── Transferencias Entrantes Pendientes ─────────────────── */}
      <IncomingTransfersBanner
        incomingTransfers={incomingTransfers}
        loading={transfer.loading}
        onAccept={transfer.acceptIncoming}
        onReject={transfer.rejectIncoming}
      />

      {/* ── Barra de Pestañas + Búsqueda Rápida ─────────────────── */}
      <section className={styles.controlsBar} aria-label="Filtros de boletos">
        <div className={styles.tabsTrack} role="tablist" aria-label="Categorías de boletos">
          {tabs.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
                onClick={() => setTab(item.id)}
              >
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={styles.tabCount}>{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {tickets.length > 0 && (
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>
              <Icon name="search" size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar evento, recinto o código..."
              className={styles.searchInput}
              aria-label="Buscar boletos"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── Contenido principal: Error / Vacío / Grid de Boletos ── */}
      {loadError ? (
        <WalletEmptyState
          icon="alertTriangle"
          title="No pudimos cargar tus boletos"
          message={loadError}
          actionLabel="Reintentar"
          onAction={fetchTickets}
        />
      ) : activeList.length === 0 ? (
        searchQuery.trim() ? (
          <WalletEmptyState
            icon="searchEmpty"
            title="Sin coincidencias"
            message={`No encontramos boletos que coincidan con "${searchQuery.trim()}".`}
            actionLabel="Limpiar búsqueda"
            onAction={() => setSearchQuery('')}
          />
        ) : tab === 'upcoming' ? (
          <WalletEmptyState
            icon="ticket"
            title="No tienes eventos próximos"
            message="Cuando adquieras un boleto o canjees una cortesía, aparecerá aquí listo para ingresar."
            actionLabel="Explorar Eventos"
            onAction={() => navigate('/')}
          />
        ) : tab === 'past' ? (
          <WalletEmptyState
            icon="history"
            title="Sin eventos pasados"
            message="Tus eventos concluidos se guardarán automáticamente aquí como recuerdo coleccionable."
          />
        ) : (
          <WalletEmptyState
            icon="xCircle"
            title="Sin boletos cancelados ni cedidos"
            message="Aquí verás el registro de boletos reembolsados o transferidos a otros usuarios."
          />
        )
      ) : (
        <section className={styles.ticketsGrid} aria-label="Lista de boletos">
          {activeList.map((ticket, idx) => (
            <WalletTicketCard
              key={ticket.id || idx}
              ticket={ticket}
              idx={idx}
              isPast={tab === 'past'}
              isCancelled={tab === 'cancelled'}
              outgoingTransfers={outgoingTransfers}
              onOpenTicket={handleOpenTicket}
              onTransfer={transfer.openTransfer}
              onCancelTransfer={(trfId) => transfer.cancelOutgoing(trfId)}
              onCancel={(tkt) => setCancelModalTicket(tkt)}
              onNavigateToRefunds={() => navigate('/user/refunds')}
            />
          ))}
        </section>
      )}

      {/* ── MODAL DE BOLETO (Clásico / Coleccionista; sin QR en pasados) ── */}
      {ticketModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setTicketModal(null)}
        >
          <TicketModal
            ticket={ticketModal.ticket}
            isPast={ticketModal.isPast}
            onClose={() => setTicketModal(null)}
          />
        </div>
      )}

      {/* ── TRANSFER MODAL ───────────────────────────────────────── */}
      <TransferModal
        phase={transfer.phase}
        ticket={transfer.ticket}
        recipientEmail={transfer.recipientEmail}
        setRecipientEmail={transfer.setRecipientEmail}
        password={transfer.password}
        setPassword={transfer.setPassword}
        transferData={transfer.transferData}
        claimUrl={transfer.claimUrl}
        secondsLeft={transfer.secondsLeft}
        errorMsg={transfer.errorMsg}
        loading={transfer.loading}
        onConfirm={transfer.confirmAndSend}
        onCancel={transfer.cancelTransferModal}
      />

      {/* ── CANCEL TICKET MODAL ─────────────────────────────────── */}
      {cancelModalTicket && (
        <CancelTicketModal
          ticket={cancelModalTicket}
          onClose={() => setCancelModalTicket(null)}
          onSuccess={fetchTickets}
        />
      )}

      {/* ── CANJEAR CORTESÍA MODAL ──────────────────────────────── */}
      <RedeemCourtesyModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onSuccess={(msg, claimedTicket) => {
          success(msg);
          fetchTickets();
          if (claimedTicket) {
            setGiftCourtesyTicket(claimedTicket);
          }
        }}
        onError={error}
      />

      {/* ── MODAL REVELACIÓN REGALO / INVITACIÓN VIP CORTESÍA ── */}
      <CourtesyGiftRevealModal
        isOpen={Boolean(giftCourtesyTicket)}
        ticket={giftCourtesyTicket}
        onClose={() => {
          if (giftCourtesyTicket) {
            markCourtesySeen(giftCourtesyTicket.id);
          }
          setGiftCourtesyTicket(null);
        }}
        onOpenTicket={(tkt) => {
          markCourtesySeen(tkt.id);
          setGiftCourtesyTicket(null);
          handleOpenTicket(tkt, false);
        }}
      />
    </div>
  );
}
