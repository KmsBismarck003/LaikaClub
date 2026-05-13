const fs = require('fs');

let c = fs.readFileSync('src/pages/EventDetail/EventDetail.jsx', 'utf8');

const startIdx = c.indexOf('{/* COLUMNA DERECHA: Selector de Boletos */}');
const endIdx = c.indexOf('{/* --- MODALES MOVIDOS AL NIVEL SUPERIOR');

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  const replaceStr = `{/* COLUMNA DERECHA: Selector de Boletos */}
          <div className="event-right-column">
            <TicketSelectionPanel
              user={user}
              hasFunctions={hasFunctions}
              event={event}
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sortedSections={sortedSections}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedSeats={selectedSeats}
              cleanPrice={cleanPrice}
              handleAddToCart={handleAddToCart}
              isRouletteActive={isRouletteActive}
              handleLuckySeat={handleLuckySeat}
              setShowProbModal={setShowProbModal}
            />
          </div>
        </div>

        `;
  c = c.substring(0, startIdx) + replaceStr + c.substring(endIdx);
  fs.writeFileSync('src/pages/EventDetail/EventDetail.jsx', c);
  console.log('SUCCESS');
} else {
  console.log('NOT FOUND');
}
