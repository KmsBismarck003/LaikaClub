import React from 'react';

const EventDetailSkeleton = ({ isDark }) => {
  return (
    <div className={`event-detail-page ${isDark ? 'premium-dark' : 'premium-light'} app-skeleton skeleton-pearl-card`} style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="event-detail-container">
        {/* Botón Volver */}
        <div className="skeleton" style={{ width: "80px", height: "30px", borderRadius: "6px", marginBottom: "1.5rem" }} />

        <div className="event-detail-content layout-dual-column" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
          
          {/* COLUMNA IZQUIERDA SKELETON (Mapa y Metadatos) */}
          <div className="event-left-column" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Poster Header Block (Oxford) */}
            <div className="skeleton-oxford-block" style={{ width: "100%", height: "400px", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
              <div className="skeleton" style={{ width: "100%", height: "100%" }} />
              
              {/* Glassmorphism Bottom Detail Placeholder */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "60%", height: "32px", marginBottom: "12px", borderRadius: "4px" }} />
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div className="skeleton" style={{ width: "100px", height: "14px" }} />
                    <div className="skeleton" style={{ width: "120px", height: "14px" }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                   <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                   <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
                </div>
              </div>
            </div>

            {/* Seat Map Area (Oxford) */}
            <div className="event-map" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div className="skeleton" style={{ width: "220px", height: "24px" }} />
               <div className="skeleton-oxford-block" style={{ width: "100%", height: "500px", borderRadius: "16px", position: 'relative' }}>
                  <div className="skeleton" style={{ width: '100%', height: '100%' }} />
               </div>
            </div>

            {/* Content Text Blocks */}
            <div className="event-description" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div className="skeleton" style={{ width: "180px", height: "28px" }} />
               <div className="skeleton" style={{ width: "100%", height: "14px" }} />
               <div className="skeleton" style={{ width: "95%", height: "14px" }} />
               <div className="skeleton" style={{ width: "80%", height: "14px" }} />
            </div>
          </div>

          {/* COLUMNA DERECHA SKELETON (Ticket Selection) */}
          <div className="event-right-column">
            <div className="ticket-selection-panel skeleton-oxford-block" style={{ padding: "2rem", borderRadius: "20px", height: "calc(100vh - 150px)", position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              {/* Header selection markers */}
              <div className="skeleton" style={{ width: "140px", height: "16px" }} />
              <div style={{ display: "flex", gap: "0.8rem" }}>
                <div className="skeleton" style={{ width: "100px", height: "40px", borderRadius: "20px" }} />
                <div className="skeleton" style={{ width: "100px", height: "40px", borderRadius: "20px" }} />
              </div>

              {/* Tickets List */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: "flex", padding: "1.2rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", gap: "1rem", alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "8px" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: "80%", height: "14px", marginBottom: "8px" }} />
                      <div className="skeleton" style={{ width: "50%", height: "10px" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bottom Area */}
              <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                   <div className="skeleton" style={{ width: "100px", height: "20px" }} />
                   <div className="skeleton" style={{ width: "80px", height: "20px" }} />
                </div>
                <div className="skeleton" style={{ width: "100%", height: "54px", borderRadius: "12px", marginBottom: "0.8rem" }} />
                <div className="skeleton" style={{ width: "100%", height: "54px", borderRadius: "12px" }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetailSkeleton;
