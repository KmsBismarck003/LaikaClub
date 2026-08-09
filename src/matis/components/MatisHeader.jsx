import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../../components/Icons/Icons'
import { matisOperationalAPI } from '../services/matisService'
import '../styles/matis.css'

const MatisHeader = ({ title, subtitle }) => {
  const location = useLocation()
  const [latency, setLatency] = useState(null)
  const [status, setStatus] = useState('online')

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const start = Date.now()
        await matisOperationalAPI.getSystemTelemetry()
        const end = Date.now()
        setLatency(end - start)
        setStatus('online')
      } catch (err) {
        setStatus('offline')
      }
    }

    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 10000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { path: '/matis', label: 'Consola Central', icon: 'dashboard' },
    { path: '/matis/executive', label: 'Ejecutiva', icon: 'chart' },
    { path: '/matis/sales', label: 'Ventas', icon: 'dollarSign' },
    { path: '/matis/events', label: 'Eventos', icon: 'calendar' },
    { path: '/matis/venues', label: 'Recintos', icon: 'map' },
    { path: '/matis/customers', label: 'Clientes', icon: 'users' },
    { path: '/matis/products', label: 'Productos', icon: 'shoppingBag' },
    { path: '/matis/geography', label: 'Geografía', icon: 'globe' },
    { path: '/matis/operational', label: 'Telemetría', icon: 'activity' },
    { path: '/matis/predictive', label: 'Modelos ML', icon: 'cpu' },
    { path: '/matis/quality', label: 'Calidad KDD', icon: 'shield' }
  ]

  return (
    <div className="matis-header-wrapper">
      <div className="matis-header">
        <div className="matis-title-section">
          <h1>
            <Icon name="shieldCheck" size={28} />
            {title}
          </h1>
          <p>{subtitle}</p>
        </div>

        <div className="system-status-indicator">
          <div className="status-badge">
            <span className={`status-dot ${status !== 'online' ? 'danger' : latency > 200 ? 'warning' : ''}`} />
            <span>MATIS ENGINE: {status.toUpperCase()}</span>
          </div>
          {latency !== null && status === 'online' && (
            <div style={{ fontSize: '0.8rem', color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
              LATENCY: {latency}ms
            </div>
          )}
        </div>
      </div>

      <div className="matis-hub-grid" style={{ marginBottom: '2.5rem' }}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`matis-hub-btn ${isActive ? 'active' : ''}`}
              style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}
            >
              <Icon name={tab.icon} size={20} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MatisHeader
