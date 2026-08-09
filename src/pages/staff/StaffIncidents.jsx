import React from 'react';
import StaffIncidentsView from './views/StaffIncidents';

// Centralización arquitectónica para garantizar un único punto de verdad en la lógica y presentación del reporte de incidencias de Staff
const StaffIncidents = () => <StaffIncidentsView />;

export default StaffIncidents;
