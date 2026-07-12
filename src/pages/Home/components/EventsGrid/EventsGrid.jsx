import React from 'react';
import { Icon, Badge, Pagination } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';
import './EventsGrid.css';

const EventsGrid = ({
  paginatedEvents,
  filteredEvents,
  selectedCategory,
  getCategoryInfo,
  BADGE_VARIANTS,
  formatDate,
  formatTime,
  navigate,
  currentPage,
  totalPages,
  setCurrentPage,
  eventsSectionRef,
}) => {
  return (
    <div className="events-grid-wrapper">
      {/* Header */}
      <header className="events-header">
        <h2 className="events-title">
          {selectedCategory === 'all'
            ? 'Todos los eventos'
            : getCategoryInfo(selectedCategory).name}
        </h2>
        <span className="events-count">{filteredEvents.length} eventos</span>
      </header>

      {/* Grid */}
      <div className="events-grid">
        {paginatedEvents.map(event => (
          <article
            key={event.id}
            className="event-card-wrapper"
            onClick={() => navigate(`/event/${event.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/event/${event.id}`)}
            aria-label={`Ver ${event.name}`}
          >
            <div className="event-primary-card">
              {/* Image */}
              <div className="event-card-image">
                <img
                  src={getImageUrl(event.image_url || event.image)}
                  alt={event.name}
                  loading="lazy"
                />
                <div className="event-card-badge">
                  <Badge variant={BADGE_VARIANTS[event.category] || 'secondary'}>
                    {getCategoryInfo(event.category).name}
                  </Badge>
                </div>
              </div>

              {/* Glass info panel */}
              <div className="event-card-content">
                <div className="event-card-venue">
                  <Icon name="mapPin" size={10} />
                  <span>{event.venue || event.location || 'Recinto por confirmar'}</span>
                </div>
                <h3 className="event-card-title">{event.name}</h3>
                <div className="event-card-date">
                  <span>{formatDate(event.event_date || event.date)}</span>
                  <span className="date-separator">•</span>
                  <span>{formatTime(event.start_time || event.time)} HRS</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="events-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={page => {
              setCurrentPage(page);
              window.scrollTo({
                top: (eventsSectionRef.current?.offsetTop ?? 0) - 100,
                behavior: 'smooth',
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventsGrid;
