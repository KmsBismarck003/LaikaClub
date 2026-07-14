import React from 'react';
import { Pagination } from '../../../../components';
import EventCardPremium from '../EventCardPremium/EventCardPremium';
import './EventsGrid.css';

const EventsGrid = ({
  paginatedEvents,
  filteredEvents,
  selectedCategory,
  getCategoryInfo,
  navigate,
  currentPage,
  totalPages,
  setCurrentPage,
  eventsSectionRef,
}) => {
  const sectionLabel = selectedCategory === 'all'
    ? 'Todos los eventos'
    : getCategoryInfo(selectedCategory).name;

  const handleCardClick = event => navigate(`/event/${event.id}`);

  return (
    <div className="events-grid-wrapper">
      {/* Header */}
      <header className="events-header">
        <h2 className="events-title">{sectionLabel}</h2>
        <span className="events-count" aria-live="polite">{filteredEvents.length} eventos</span>
      </header>

      {/* Grid */}
      <div
        className="events-grid"
        role="list"
        aria-label={`Eventos: ${sectionLabel}`}
      >
        {paginatedEvents.map(event => (
          <div key={event.id} role="listitem">
            <EventCardPremium event={event} onClick={handleCardClick} />
          </div>
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

