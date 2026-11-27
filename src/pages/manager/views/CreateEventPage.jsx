import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components';
import { useNotification } from '../../../context/NotificationContext';
import EventForm from '../EventForm';
import styles from '../EventForm.module.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSave = (eventData) => {
    import('../../../specialFun/PushNotifications')
      .then((module) => {
        module.PushEngine.triggerSmart('NEW_EVENT', {
          eventName: eventData?.name || 'un nuevo evento espectacular',
          url: `${window.location.origin}/event/${eventData?.id || 1}`,
        });
      })
      .catch((err) => console.error('Error triggering push:', err));

    addNotification({
      title: 'Nuevo evento anunciado',
      message: `Se ha publicado ${eventData?.name || 'un nuevo espectáculo en LaikaClub'}.`,
      detail:
        'Los primeros lugares ya se encuentran disponibles en taquilla digital. Descubre las fechas y aparta tus boletos.',
      actionUrl: `/event/${eventData?.id || 1}`,
      actionLabel: 'Ver evento',
      role: 'all',
    });

    navigate('/events/manage');
  };

  return (
    <div className="admin-dashboard-page">
      <header className={styles.createPageHeader}>
        <div>
          <h1 className={styles.createPageTitle}>Crear nuevo evento</h1>
          <p className={styles.createPageSubtitle}>
            Completa los datos en orden y verifica cómo aparecerá tu evento en la página principal.
          </p>
        </div>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => navigate('/events/manage')}
        >
          <Icon name="arrowLeft" size={15} />
          Volver a mis eventos
        </button>
      </header>

      <EventForm onSuccess={handleSave} />
    </div>
  );
};

export default CreateEventPage;
