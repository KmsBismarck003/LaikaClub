import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisEventsAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisEvents = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    occupancy: [],
    revenue: [],
    status: {}
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [occupancy, revenue, status] = await Promise.all([
          matisEventsAPI.getOccupancy().catch(() => ([])),
          matisEventsAPI.getTopRevenue().catch(() => ([])),
          matisEventsAPI.getTicketStatus().catch(() => ({}))
        ])
        setData({ occupancy, revenue, status })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const defaultOccupancy = [
    { eventName: 'Rock Fest 2026', occupancyRate: 92, ticketsSold: 4600, capacity: 5000 },
    { eventName: 'Gamer Championship', occupancyRate: 78, ticketsSold: 2340, capacity: 3000 },
    { eventName: 'Pop Symphony Night', occupancyRate: 64, ticketsSold: 1280, capacity: 2000 },
    { eventName: 'StandUp Marathon', occupancyRate: 48, ticketsSold: 480, capacity: 1000 }
  ]

  const occupancy = data.occupancy.length > 0 ? data.occupancy : defaultOccupancy

  if (loading) {
    return (
      <div className="matis-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
            RECOPILANDO ESTADÍSTICAS DE EVENTOS...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia de Eventos" subtitle="Telemetría de Aforo, Asistencias y Monitoreo de Eventos en Tiempo Real" />

      <div className="matis-grid-4">
        <div className="matis-card">
          <div className="kpi-title">Boletos Emitidos</div>
          <div className="kpi-value">{data.status?.total_tickets || '8,700'}</div>
          <div style={{ color: 'var(--matis-cyan)', fontSize: '0.85rem' }}>General + VIP</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Boletos Escaneados / Usados</div>
          <div className="kpi-value">{data.status?.scanned_tickets || '4,120'}</div>
          <div style={{ color: 'var(--matis-green)', fontSize: '0.85rem' }}>Asistencia presencial confirmada</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Boletos Cancelados</div>
          <div className="kpi-value">{data.status?.cancelled_tickets || '120'}</div>
          <div style={{ color: 'var(--matis-red)', fontSize: '0.85rem' }}>1.3% del aforo total emitido</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Aforo Promedio General</div>
          <div className="kpi-value">70.5%</div>
          <div style={{ color: 'var(--matis-cyan)', fontSize: '0.85rem' }}>Aforo proyectado de recintos</div>
        </div>
      </div>

      <div className="matis-card">
        <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="activity" size={20} /> Telemetría de Ocupación por Evento Activo
        </h3>
        <div className="matis-table-container">
          <table className="matis-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th style={{ width: '40%' }}>Tasa de Ocupación</th>
                <th>Ventas</th>
                <th>Capacidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.map((evt, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 'bold' }}>{evt.eventName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{
                          width: `${evt.occupancyRate}%`,
                          height: '100%',
                          background: evt.occupancyRate > 90
                            ? 'linear-gradient(to right, var(--matis-blue), var(--matis-pink))'
                            : 'linear-gradient(to right, var(--matis-blue), var(--matis-cyan))',
                          borderRadius: 4
                        }} />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-cyber)',
                        fontSize: '0.85rem',
                        color: evt.occupancyRate > 90 ? 'var(--matis-pink)' : 'var(--matis-cyan)',
                        width: '40px',
                        textAlign: 'right'
                      }}>
                        {evt.occupancyRate}%
                      </span>
                    </div>
                  </td>
                  <td>{evt.ticketsSold.toLocaleString()} tickets</td>
                  <td>{evt.capacity.toLocaleString()} plazas</td>
                  <td>
                    <button className="matis-btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MatisEvents
