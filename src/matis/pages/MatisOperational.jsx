import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisOperationalAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisOperational = () => {
  const [loading, setLoading] = useState(true)
  const [telemetry, setTelemetry] = useState({})

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await matisOperationalAPI.getSystemTelemetry()
        setTelemetry(res || {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 3000)
    return () => clearInterval(interval)
  }, [])

  const defaultTelemetry = {
    cpu_usage: 24.2,
    ram_usage: 58.4,
    db_latency_ms: 12,
    gateway_status: 'online',
    db_status: 'healthy',
    active_workers: 4,
    cache_hit_rate: 94.2
  }

  const data = Object.keys(telemetry).length > 0 ? telemetry : defaultTelemetry

  return (
    <div className="matis-container">
      <MatisHeader title="Telemetría Operativa" subtitle="Monitoreo de Infraestructura, Latencia de Base de Datos y Gateway API" />

      <div className="matis-grid-4">
        <div className="matis-card">
          <div className="kpi-title">Estado Gateway API</div>
          <div className="kpi-value" style={{ color: 'var(--matis-green)' }}>
            {data.gateway_status?.toUpperCase() || 'ONLINE'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>Nodos balanceados</div>
        </div>

        <div className="matis-card">
          <div className="kpi-title">Salud de Base de Datos</div>
          <div className="kpi-value" style={{ color: 'var(--matis-green)' }}>
            {data.db_status?.toUpperCase() || 'HEALTHY'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>Pool de conexiones estable</div>
        </div>

        <div className="matis-card">
          <div className="kpi-title">Latencia Pool DB</div>
          <div className="kpi-value" style={{ color: data.db_latency_ms > 100 ? 'var(--matis-yellow)' : 'var(--matis-cyan)' }}>
            {data.db_latency_ms || 12} ms
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>Tiempo de respuesta query</div>
        </div>

        <div className="matis-card">
          <div className="kpi-title">Tasa Acierto Cache (Redis)</div>
          <div className="kpi-value">{data.cache_hit_rate || '94.2'}%</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--matis-green)' }}>Hit óptimo</div>
        </div>
      </div>

      <div className="matis-grid-2">
        {/* CPU load card */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="cpu" size={20} /> Carga del Procesador (CPU)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '6px solid rgba(255,255,255,0.05)',
              borderTopColor: 'var(--matis-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: 'spin 10s linear infinite'
            }}>
              {/* Text shouldn't spin, so we put it absolute */}
              <div style={{
                position: 'absolute',
                transform: 'none',
                textAlign: 'center',
                animation: 'none',
                fontFamily: 'var(--font-cyber)',
                fontSize: '1.5rem',
                color: 'var(--matis-text-primary)'
              }}>
                {data.cpu_usage}%
                <div style={{ fontSize: '0.75rem', color: 'var(--matis-text-secondary)' }}>CPU</div>
              </div>
            </div>
          </div>
        </div>

        {/* RAM usage card */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-blue)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="server" size={20} /> Consumo de Memoria RAM
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', height: '200px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-cyber)' }}>
                <span>Uso RAM Global</span>
                <span>{data.ram_usage}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '15px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{
                  width: `${data.ram_usage}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, var(--matis-blue), var(--matis-cyan))',
                  borderRadius: '8px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>
              <span>Total asignado: 8.00 GB</span>
              <span>En uso: {(8 * (data.ram_usage / 100)).toFixed(2)} GB</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}

export default MatisOperational
