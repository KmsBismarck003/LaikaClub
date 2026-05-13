import React from 'react';
import { Input, Icon, Button, Skeleton } from '../../../../components';

const UsersToolbar = ({ 
    searchInput, 
    setSearchInput, 
    filters, 
    updateFilters, 
    onClear, 
    total, 
    loading 
}) => {
    return (
        <div className="user-mgmt__toolbar-bar" style={{ marginBottom: '1rem' }}>
            <div className="user-mgmt__compact-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="user-mgmt__search-container" style={{ flex: 1, position: 'relative' }}>
                    <Input
                        placeholder="BUSCAR USUARIOS..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="input--compact"
                        icon={<Icon name="search" size={14} />}
                        fullWidth
                    />
                </div>

                <div className="user-mgmt__filters-row" style={{ display: 'flex', gap: '10px' }}>
                    <div className="user-mgmt__select-wrapper">
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, marginRight: '5px' }}>ROL:</label>
                        <select
                            className="user-mgmt__select"
                            value={filters.role}
                            onChange={e => updateFilters({ role: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                            <option value="">TODOS</option>
                            <option value="admin">ADMIN</option>
                            <option value="gestor">GESTOR</option>
                            <option value="operador">OPERADOR</option>
                            <option value="usuario">USUARIO</option>
                        </select>
                    </div>

                    <div className="user-mgmt__select-wrapper">
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, marginRight: '5px' }}>ESTADO:</label>
                        <select
                            className="user-mgmt__select"
                            value={filters.status || ''}
                            onChange={e => updateFilters({ status: e.target.value })}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                            <option value="">TODOS</option>
                            <option value="active">ACTIVO</option>
                            <option value="disabled">BAJA</option>
                            <option value="locked">BLOQUEO</option>
                        </select>
                    </div>

                    {(filters.search || filters.role || filters.status) && (
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={onClear}
                            className="user-mgmt__clear-btn"
                            style={{ height: '30px', minWidth: '30px', padding: 0 }}
                        >
                            <Icon name="close" size={10} />
                        </Button>
                    )}
                </div>

                <div className="user-mgmt__stats" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#888', borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
                    {loading ? <Skeleton type="text" width="30px" height="12px" /> : <strong style={{ color: '#000' }}>{total}</strong>} REGISTROS
                </div>
            </div>
        </div>
    );
};

export default UsersToolbar;
