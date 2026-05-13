import React from 'react';
import { Badge, SkeletonRow } from '../../../../components';
import { parseDevice, formatDate, EVENT_BADGE_VARIANT, EVENT_LABEL } from '../AuditUtils';

const AuditTable = ({ logs, loading, paginated }) => {
    if (!loading && logs.length === 0) {
        return (
            <div className='admin-empty' style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem' }}>[ SIN REGISTROS ACTIVOS ]</div>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Los eventos de seguridad aparecerán aquí en tiempo real.
                </p>
            </div>
        );
    }

    return (
        <div className="audit-table-wrapper">
            <table className="audit-tech-table">
                <thead>
                    <tr>
                        <th>FECHA Y HORA</th>
                        <th>USUARIO (IDENTIDAD)</th>
                        <th>EVENTO</th>
                        <th>DIRECCIÓN IP</th>
                        <th>DISPOSITIVO</th>
                        <th>TRY</th>
                        <th>RESUMEN</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonRow key={`skeleton-${i}`} columns={7} />
                        ))
                    ) : (
                        paginated.map((log, i) => {
                            const device = parseDevice(log.user_agent);
                            return (
                                <tr key={log.id ?? i}>
                                    <td style={{ fontFamily: 'monospace' }}>
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td>
                                        <div className="audit-user-cell">
                                            <div className="audit-avatar">
                                                {(log.user_name || log.email || '?')[0].toUpperCase()}
                                            </div>
                                            <div className="audit-user-info">
                                                <span className="audit-u-name">{log.user_name || '—'}</span>
                                                <span className="audit-u-email">{log.email || '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge variant={EVENT_BADGE_VARIANT[log.event_type] || 'neutral'}>
                                            {(EVENT_LABEL[log.event_type] || log.event_type || '—').toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td style={{ fontFamily: 'monospace' }}>
                                        {log.ip_address || '—'}
                                    </td>
                                    <td>
                                        <div className="audit-device-cell">
                                            {device.icon}
                                            <div className="device-text">
                                                <span className="device-os">{device.os}</span>
                                                {device.browser && (
                                                    <span className="device-browser">{device.browser}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="audit-badge-circle">
                                            1
                                        </span>
                                    </td>
                                    <td style={{ color: '#444', maxWidth: 220, fontSize: '0.78rem' }}>
                                        {log.summary || '—'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AuditTable;
