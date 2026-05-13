import React from 'react';
import { Card, Icon, Badge, Pagination } from '../../../../components';
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
  eventsSectionRef
}) => {
  return (
    <div className="events-grid-wrapper">
      <header className="events-header">
        <h2 className="events-title">
          {selectedCategory === 'all' ? 'TODOS LOS EVENTOS' : getCategoryInfo(selectedCategory).name.toUpperCase()}
        </h2>
        <span className="events-count">{filteredEvents.length} EVENTOS</span>
      </header>
      
      <div className="events-grid">
        {paginatedEvents.map(event => (
          <div
            key={event.id}
            className="event-card-wrapper"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <div className="event-primary-card">
              <div className="event-card-image">
                <img src={getImageUrl(event.image_url || event.image)} alt={event.name} loading="lazy" />
                <div className="event-card-badge">
                  <Badge variant={BADGE_VARIANTS[event.category] || 'secondary'}>
                    {getCategoryInfo(event.category).name}
                  </Badge>
                </div>
              </div>
              <div className="event-card-content">
                <div className="event-card-venue">
                  <Icon name="mapPin" size={12} />
                  <span>{event.venue || event.location || 'RECINTO POR CONFIRMAR'}</span>
                </div>
                <h3 className="event-card-title">{event.name}</h3>
                <div className="event-card-date">
                  <span>{formatDate(event.event_date || event.date)}</span>
                  <span className="date-separator">•</span>
                  <span>{formatTime(event.start_time || event.time)} HRS</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="events-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: eventsSectionRef.current?.offsetTop - 100, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventsGrid;
