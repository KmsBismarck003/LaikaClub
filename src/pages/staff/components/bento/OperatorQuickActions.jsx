import React from 'react';
import { BentoCard, BentoHeader, BentoBadge } from '../../../../components/Bento';
import {
  QrCode,
  Search,
  ShoppingBag,
  History,
  AlertTriangle,
  Calendar,
  ChevronRight
} from 'lucide-react';

/**
 * OperatorQuickActions - Rejilla Bento de herramientas operativas de campo.
 */
const OperatorQuickActions = ({ onNavigate }) => {
  const tools = [
    {
      id: 'scanner',
      title: 'Lector de Entradas',
      desc: 'Validación óptica con cámara web o lector físico láser',
      path: '/staff?tab=scanner',
      icon: <QrCode size={20} />,
      badge: 'Cámara Activa',
      badgeVariant: 'success',
      colSpan: 4
    },
    {
      id: 'helpdesk',
      title: 'Soporte de Entrada',
      desc: 'Búsqueda por nombre, correo o boleto si el código óptico falló',
      path: '/staff?tab=helpdesk',
      icon: <Search size={20} />,
      badge: 'Mesa de Ayuda',
      badgeVariant: 'info',
      colSpan: 4
    },
    {
      id: 'boxoffice',
      title: 'Venta Presencial',
      desc: 'Módulo de taquilla y cobro presencial en puerta para asistentes',
      path: '/staff?tab=boxoffice',
      icon: <ShoppingBag size={20} />,
      badge: 'Punto de Venta',
      badgeVariant: 'neutral',
      colSpan: 4
    },
    {
      id: 'history',
      title: 'Registro de Accesos',
      desc: 'Auditoría cronológica y métricas de todos los boletos leídos en turno',
      path: '/staff/history',
      icon: <History size={20} />,
      badge: 'Auditoría',
      badgeVariant: 'neutral',
      colSpan: 4
    },
    {
      id: 'incidents',
      title: 'Reporte de Problemas',
      desc: 'Canal directo con jefes de seguridad y supervisores',
      path: '/staff/incidents',
      icon: <AlertTriangle size={20} />,
      badge: 'Seguridad',
      badgeVariant: 'warning',
      colSpan: 4
    },
    {
      id: 'events',
      title: 'Mis Asignaciones',
      desc: 'Calendario de turnos programados en recintos y puertas',
      path: '/staff/events',
      icon: <Calendar size={20} />,
      badge: 'Horarios',
      badgeVariant: 'neutral',
      colSpan: 4
    }
  ];

  return (
    <div className="operator-quick-actions">
      <div className="operator-quick-actions__header">
        <h3 className="operator-quick-actions__title">Centro de Herramientas de Campo</h3>
        <p className="operator-quick-actions__subtitle">
          Accede instantáneamente a los módulos de operación y control de asistencia
        </p>
      </div>

      <div className="bento-grid">
        {tools.map((tool) => (
          <BentoCard
            key={tool.id}
            colSpan={tool.colSpan}
            variant="interactive"
            className="operator-tool-card"
            onClick={() => onNavigate(tool.path)}
          >
            <div className="operator-tool-card__header">
              <div className="operator-tool-card__icon">{tool.icon}</div>
              <BentoBadge variant={tool.badgeVariant} size="sm">
                {tool.badge}
              </BentoBadge>
            </div>

            <div className="operator-tool-card__body">
              <h4 className="operator-tool-card__title">{tool.title}</h4>
              <p className="operator-tool-card__desc">{tool.desc}</p>
            </div>

            <div className="operator-tool-card__footer">
              <span className="operator-tool-card__link">Ingresar a consola</span>
              <ChevronRight size={16} className="operator-tool-card__chevron" />
            </div>
          </BentoCard>
        ))}
      </div>
    </div>
  );
};

export default OperatorQuickActions;
