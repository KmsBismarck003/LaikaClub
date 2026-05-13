import React from 'react';
import { Card, SkeletonRow } from '../../../../components';

const LaikaRequestHistory = ({ showSkeleton, history }) => {
    return (
        <Card title="Peticiones Recientes" style={{ marginTop: '20px' }}>
            <div className="history-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Consulta</th>
                            <th>Rol</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {showSkeleton ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonRow key={i} columns={5} />
                            ))
                        ) : (
                            history.map(item => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td><span className="badge">{item.type}</span></td>
                                    <td>{item.query}</td>
                                    <td>{item.role}</td>
                                    <td>{item.time}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default LaikaRequestHistory;
