import React from 'react';
import { PermissionWall } from '../../../components';
import BigDataVisualizer from '../../admin/Dashboard/BigDataVisualizer';
import useAuth from '../../../hooks/useAuth';

const ManagerAnalytics = () => {
  const { user } = useAuth();

  return (
    <PermissionWall 
      permission="canViewEventAnalytics"
      title="ANALÍTICA BLOQUEADA"
      description="Tu cuenta no tiene permisos para ver datos financieros y tendencias. Contacta al Administrador."
    >
      <div className="manager-analytics">
        {user ? (
          <BigDataVisualizer managerId={user.id} />
        ) : (
          <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Cargando analítica...</div>
        )}
      </div>
    </PermissionWall>
  );
};

export default ManagerAnalytics;
