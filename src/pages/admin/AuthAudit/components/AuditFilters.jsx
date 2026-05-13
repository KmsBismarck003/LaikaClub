import React from 'react';
import { ROLE_OPTIONS, EVENT_OPTIONS, EVENT_LABEL } from '../AuditUtils';

const AuditFilters = ({ 
    searchText, 
    setSearchText, 
    filterRole, 
    setFilterRole, 
    filterEvent, 
    setFilterEvent, 
    setCurrentPage 
}) => {
    return (
        <div className="audit-filters-card">
            <input
                type='text'
                placeholder='BUSCAR POR EMAIL, USUARIO, IP O RESUMEN...'
                value={searchText}
                onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
                className="audit-input"
            />
            <select 
                value={filterRole} 
                onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }} 
                className="audit-select"
            >
                {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>
                        {r ? r.toUpperCase() : 'TODOS LOS ROLES'}
                    </option>
                ))}
            </select>
            <select 
                value={filterEvent} 
                onChange={e => { setFilterEvent(e.target.value); setCurrentPage(1); }} 
                className="audit-select"
            >
                {EVENT_OPTIONS.map(e => (
                    <option key={e} value={e}>
                        {e ? (EVENT_LABEL[e] || e) : 'TODOS LOS EVENTOS'}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AuditFilters;
