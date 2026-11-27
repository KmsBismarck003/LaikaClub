import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useUserDashboard from './hooks/useUserDashboard';
import { ConfirmDialog } from '../../components';
import Icon from '../../components/Icons/Icons';
import { getImageUrl } from '../../utils/imageUtils';

// Modular Inicio components
import DashboardBanner from './components/DashboardBanner/DashboardBanner';
import NextEventHero from './components/NextEventHero/NextEventHero';
import EventCard from './components/EventCard/EventCard';
import ActivityFeed from './components/ActivityFeed/ActivityFeed';
import TicketModal from './components/Wallet/TicketModal';

import styles from './UserDashboard.module.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const { addToCart, cartCount, openCart } = useCart();
  const navigate = useNavigate();

  const {
    myTickets,
    upcomingTickets,
    nextTicket,
    moreUpcomingCount,
    discoverEvents,
    recentTickets,
    tier,
    greeting,
    loading,
    loadError,
    reload,
  } = useUserDashboard();

  const [addingId, setAddingId] = useState(null);
  const [eventToConfirm, setEventToConfirm] = useState(null);
  const [quickTicketModal, setQuickTicketModal] = useState(null);

  const handleConfirmAddToCart = () => {
    if (!eventToConfirm) return;
    const event = eventToConfirm;
    setAddingId(event.id);
    addToCart(
      event,
      1,
      {
        id: null,
        date: event.date || null,
        time: event.time || null,
        venue_name: event.venue_name || 'LAIKA ARENA',
      },
      { id: null, name: 'GENERAL', price: parseFloat(event.price) || 0 }
    );
    setEventToConfirm(null);
    setTimeout(() => {
      setAddingId(null);
      openCart();
    }, 800);
  };

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.skeletonStack}>
          <div className={styles.skeletonBox} style={{ height: '140px' }} />
          <div className={styles.skeletonBox} style={{ height: '300px' }} />
          <div className={styles.skeletonBox} style={{ height: '220px' }} />
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || user?.first_name || 'Miembro';

  return (
    <div className={styles.dashboardPage}>
      {/* ── 1. Saludo y accesos rápidos ─────────────────────────── */}
      <DashboardBanner
        firstName={firstName}
        greeting={greeting}
        tier={tier}
        upcomingCount={upcomingTickets.length}
        cartCount={cartCount}
        onOpenCart={openCart}
        onGoToTickets={() => navigate('/user/tickets')}
        onExplore={() => navigate('/')}
      />

      {/* ── Estado de error de red real ─────────────────────────── */}
      {loadError && (
        <div className={styles.emptyHeroCard}>
          <span className={styles.emptyHeroIcon}>
            <Icon name="alertTriangle" size={24} />
          </span>
          <h3 className={styles.emptyHeroTitle}>Sin conexión con el servidor</h3>
          <p className={styles.emptyHeroText}>{loadError}</p>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={reload}
          >
            <Icon name="refresh" size={15} />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* ── 2. Hero cinematográfico con cuenta regresiva viva ────── */}
      {!loadError && (
        <NextEventHero
          nextTicket={nextTicket}
          moreUpcomingCount={moreUpcomingCount}
          onOpenTicket={(tkt) => setQuickTicketModal(tkt)}
          onGoToTickets={() => navigate('/user/tickets')}
          onExplore={() => navigate('/')}
        />
      )}

      {/* ── 3. Cartelera real disponible ────────────────────────── */}
      {discoverEvents.length > 0 && (
        <section className={styles.sectionBlock} aria-label="Eventos disponibles">
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <p className={styles.sectionEyebrow}>Cartelera en vivo</p>
              <h2 className={styles.sectionHeading}>Explorar eventos</h2>
            </div>

            <button
              type="button"
              className={styles.sectionLinkBtn}
              onClick={() => navigate('/')}
            >
              <span>Ver todos</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>

          <div className={styles.eventsGrid}>
            {discoverEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onAdd={() => setEventToConfirm(event)}
                onView={() => navigate(`/event/${event.id}`)}
                adding={addingId === event.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Actividad reciente real ──────────────────────────── */}
      <ActivityFeed
        recentTickets={recentTickets}
        totalCount={myTickets.length}
        onGoToTickets={() => navigate('/user/tickets')}
        onGoToHistory={() => navigate('/user/history')}
      />

      {/* ── Modal rápido de boleto (Clásico / Coleccionista) ─────── */}
      {quickTicketModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setQuickTicketModal(null)}
        >
          <TicketModal
            ticket={quickTicketModal}
            isPast={false}
            onClose={() => setQuickTicketModal(null)}
          />
        </div>
      )}

      {/* ── Diálogo de confirmación para agregar al carrito ──────── */}
      <ConfirmDialog
        isOpen={Boolean(eventToConfirm)}
        onClose={() => setEventToConfirm(null)}
        onConfirm={handleConfirmAddToCart}
        title="¿Agregar al carrito?"
        message={`¿Deseas agregar "${eventToConfirm?.name}" a tu carrito de compras?`}
        confirmText="Agregar al carrito"
        cancelText="Cancelar"
        variant="cart"
        itemDetails={
          eventToConfirm
            ? {
                image:
                  eventToConfirm.image_url || eventToConfirm.image
                    ? getImageUrl(eventToConfirm.image_url || eventToConfirm.image)
                    : undefined,
                title: eventToConfirm.name,
                subtitle: [
                  eventToConfirm.date
                    ? new Date(eventToConfirm.date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : null,
                  eventToConfirm.venue_name || 'LAIKA ARENA',
                ]
                  .filter(Boolean)
                  .join(' · '),
                price:
                  parseFloat(eventToConfirm.price || 0) > 0
                    ? `$${parseFloat(eventToConfirm.price).toFixed(2)} MXN`
                    : 'Entrada libre',
                badge: 'GENERAL',
                quantity: 1,
              }
            : null
        }
      />
    </div>
  );
}
