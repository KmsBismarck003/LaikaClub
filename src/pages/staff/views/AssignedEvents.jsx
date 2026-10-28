import React from 'react';
import { Calendar, MapPin, Clock, Shield, CheckCircle2, UserCheck } from 'lucide-react';
import { BentoCard, BentoHeader, BentoBadge } from '../../../components/Bento';
import '../StaffDashboard.css';

/**
 * AssignedEvents - Vista Bento Box de Turnos y Asignaciones de Campo del Operador.
 */
const AssignedEvents = () => {
  return (
    <div className="staff-dashboard-page">
      {/* ── Cabecera de Asignaciones ─────────────────────────────────── */}
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>
            <Calendar size={28} className="staff-header-icon" />
            Mis Asignaciones de Campo • Turnos y Recintos
          </h1>
          <p className="staff-subtitle">
            Calendario de eventos, puertas asignadas y horarios de guardia para control de acceso y taquilla
          </p>
        </div>

        <div className="staff-header-actions">
          <BentoBadge variant="success" dot>
            CREDENCIAL VERIFICADA
          </BentoBadge>
        </div>
      </header>

      {/* ── Cuadrícula Bento de Turnos ─────────────────────────────── */}
      <div className="bento-grid staff-assignments-bento-grid">
        {/* Turno Actual Activo (col-8) */}
        <BentoCard
          colSpan={8}
          variant="hero"
          className="staff-assignment-hero-card"
          header={
            <BentoHeader
              title="Guardia Activa en Curso"
              subtitle="Turno confirmado por la Jefatura de Operaciones"
              icon={<Shield size={20} />}
              action={
                <BentoBadge variant="success">EN SERVICIO</BentoBadge>
              }
            />
          }
        >
          <div className="staff-assignment-hero-body">
            <div className="staff-assignment-details-grid">
              <div className="staff-assignment-detail-item">
                <span className="staff-assignment-label">
                  <MapPin size={14} /> Recinto Oficial
                </span>
                <span className="staff-assignment-val">LAIKA Main Arena • Explanada Central</span>
              </div>
              <div className="staff-assignment-detail-item">
                <span className="staff-assignment-label">
                  <Shield size={14} /> Puerta Asignada
                </span>
                <span className="staff-assignment-val">Puerta Principal • Carriles 1 y 2</span>
              </div>
              <div className="staff-assignment-detail-item">
                <span className="staff-assignment-label">
                  <Clock size={14} /> Horario de Turno
                </span>
                <span className="staff-assignment-val">18:00 hrs – Cierre de Acceso</span>
              </div>
              <div className="staff-assignment-detail-item">
                <span className="staff-assignment-label">
                  <UserCheck size={14} /> Supervisor a Cargo
                </span>
                <span className="staff-assignment-val">Coordinación de Puertas & Logística</span>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Notificaciones y Protocolo de Campo (col-4) */}
        <BentoCard
          colSpan={4}
          className="staff-assignment-side-card"
          header={
            <BentoHeader
              title="Protocolo de Puerta"
              subtitle="Instrucciones vigentes"
              icon={<CheckCircle2 size={18} />}
            />
          }
        >
          <div className="staff-protocol-list">
            <div className="staff-protocol-item">
              <span className="staff-protocol-dot" />
              <span>Verificar que cada pase cuente con código QR íntegro</span>
            </div>
            <div className="staff-protocol-item">
              <span className="staff-protocol-dot" />
              <span>Ante boletos duplicados, derivar a Mesa de Ayuda</span>
            </div>
            <div className="staff-protocol-item">
              <span className="staff-protocol-dot" />
              <span>Reportar cualquier alteración en el canal de incidencias</span>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
};

export default AssignedEvents;
