import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Icon, SkeletonRow } from '../../../../components';
import { getImageUrl } from '../../../../utils/imageUtils';

// Sub-componente interno para cuenta regresiva de bloqueo
const LockoutCountdown = ({ targetDate }) => {
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!targetDate) return 0;
        const diff = Math.floor((new Date(targetDate) - new Date()) / 1000);
        return diff > 0 ? diff : 0;
    });

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    if (secondsLeft <= 0) return null;

    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return (
        <span className="user-mgmt__status-badge user-mgmt__status-badge--locked">
            <Icon name="lock" size={10} className="mr-1" />
            BLOQUEADO ({m}:{s.toString().padStart(2, '0')})
        </span>
    );
};

const UsersTable = ({ 
    users, 
    loading, 
    onPreview, 
    onEdit, 
    onPermissions, 
    onStatusToggle, 
    onUnlock, 
    onApprovePermission 
}) => {
    
    const renderStatusBadge = (user) => {
        const lockoutUntil = user.lockout_until;
        const isLockedByTime = lockoutUntil && new Date(lockoutUntil) > new Date();

        if (isLockedByTime || user.status === 'locked') {
            return (
                <LockoutCountdown targetDate={lockoutUntil} /> || (
                    <span className="user-mgmt__status-badge user-mgmt__status-badge--locked">
                        <Icon name="lock" size={10} className="mr-1" /> BLOQUEADO
                    </span>
                )
            );
        }

        const config = {
            active: { label: 'Activo', cls: 'active' },
            disabled: { label: 'Baja', cls: 'disabled' }
        };
        const c = config[user.status] || { label: user.status || 'OFF', cls: 'disabled' };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className={`user-mgmt__status-badge user-mgmt__status-badge--${c.cls}`}>
                    <span className="user-mgmt__status-dot" /> {c.label.toUpperCase()}
                </span>
                {user.pending_request && (
                    <span className="user-mgmt__status-badge" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', border: '1px solid #ffc107', fontSize: '0.6rem' }}>
                        <Icon name="bell" size={10} className="mr-1" /> SOLICITUD
                    </span>
                )}
            </div>
        );
    };

    const columns = [
        {
            key: 'avatar_url',
            header: '',
            width: '60px',
            render: (val, row) => (
                <div 
                    className="user-mgmt__avatar-wrapper"
                    onClick={(e) => { e.stopPropagation(); onPreview(row); }}
                    style={{ cursor: 'pointer' }}
                >
                    <img 
                        src={getImageUrl(val || row.avatar || row.profile_photo)} 
                        alt="Avatar" 
                        className="user-mgmt__avatar-img"
                        onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=' + (row.first_name || 'U') + '&background=random';
                        }}
                    />
                </div>
            )
        },
        {
            key: 'name',
            header: 'USUARIO',
            sortable: true,
            width: '220px',
            render: (_, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
                    <span style={{ 
                        fontWeight: 800, 
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }} title={`${row.first_name || ''} ${row.last_name || ''}`}>
                        {`${row.first_name || ''} ${row.last_name || ''}`.trim() || '—'}
                    </span>
                    <span style={{ 
                        fontSize: '0.7rem', 
                        color: '#888', 
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }} title={row.email}>
                        {row.email}
                    </span>
                </div>
            )
        },
        { 
            key: 'role', 
            header: 'ROL', 
            sortable: true,
            width: '110px',
            render: (value) => {
                const variants = { admin: 'danger', gestor: 'warning', operador: 'info', usuario: 'default' };
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge variant={variants[value] || 'default'}>{value?.toUpperCase() || 'USUARIO'}</Badge>
                        {value === 'admin' && <Icon name="sparkles" size={12} style={{ color: '#fadb14' }} />}
                    </div>
                );
            }
        },
        { 
            key: 'status', 
            header: 'ESTADO', 
            width: '120px',
            render: (_, row) => renderStatusBadge(row) 
        },
        {
            key: 'actions',
            header: 'ACCIONES',
            width: '350px',
            render: (_, row) => {
                if (row.role === 'admin') {
                    return (
                        <div className="user-mgmt__protected-badge" style={{ fontSize: '0.65rem', fontWeight: 900, color: '#e74c3c' }}>
                            <Icon name="shield" size={12} /> <span style={{ marginLeft: '5px' }}>SISTEMA PROTEGIDO</span>
                        </div>
                    );
                }
                const isLocked = row.status === 'locked' || (row.lockout_until && new Date(row.lockout_until) > new Date());
                return (
                    <div className="user-mgmt__actions" style={{ display: 'flex', gap: '6px' }}>
                        {row.pending_request && (
                            <Button size="small" variant="success" onClick={() => onApprovePermission(row)} style={{ fontWeight: 900, fontSize: '0.6rem', padding: '4px 8px' }}>
                                <Icon name="check" size={10} className="mr-1" /> APROBAR
                            </Button>
                        )}
                        <Button 
                            size="small" 
                            onClick={() => onEdit(row)} 
                            style={{ 
                                background: '#3498db', 
                                color: '#fff', 
                                fontWeight: 900, 
                                fontSize: '0.62rem',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                borderRadius: '50px'
                            }}
                        >
                            <Icon name="edit" size={11} /> EDITAR
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => onPermissions(row)} 
                            style={{ 
                                background: '#f39c12', 
                                color: '#fff', 
                                fontWeight: 900, 
                                fontSize: '0.62rem',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                borderRadius: '50px'
                            }}
                        >
                            <Icon name="shield" size={11} /> PERMISOS
                        </Button>
                        <Button
                            size="small"
                            onClick={() => onStatusToggle(row)}
                            style={{ 
                                background: row.status === 'active' ? '#e74c3c' : '#2ecc71', 
                                color: '#fff', 
                                fontWeight: 900, 
                                fontSize: '0.62rem',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                borderRadius: '50px'
                            }}
                        >
                            <Icon name="power" size={11} /> {row.status === 'active' ? 'BAJA' : 'ALTA'}
                        </Button>
                        {isLocked && (
                            <Button 
                                size="small" 
                                onClick={() => onUnlock(row)} 
                                style={{ 
                                    background: '#1abc9c', 
                                    color: '#fff', 
                                    fontWeight: 900, 
                                    fontSize: '0.62rem',
                                    padding: '4px 10px',
                                    borderRadius: '50px'
                                }}
                            >
                                <Icon name="unlock" size={11} /> UNLOCK
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    // Removido early return para usar el prop 'loading' de Table (mantiene cabecera)

    return (
        <Table 
            columns={columns} 
            data={users} 
            loading={loading}
            className="table--db-style"
            sortable 
            rowPriority={(row) => {
                const priorities = { admin: 100, gestor: 90, operador: 80, usuario: 70 };
                return priorities[row.role] || 0;
            }}
            rowClassName={(row) => `user-row--${row.role}`}
        />
    );
};

export default UsersTable;
