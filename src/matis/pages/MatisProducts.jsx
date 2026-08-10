/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisProductsAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisProducts = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    sales: [],
    alerts: []
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sales, alerts] = await Promise.all([
          matisProductsAPI.getSales().catch(() => ([])),
          matisProductsAPI.getStockAlerts().catch(() => ([]))
        ])
        setData({ sales, alerts })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const sales = data.sales || []
  const alerts = data.alerts || []

  if (loading) {
    return (
      <div className="matis-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
            ACCEDIENDO A TELEMETRÍA DE INVENTARIO...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia de Productos (Tienda)" subtitle="Monitoreo de Souvenirs, Ventas de Artículos y Alertas de Inventario" />

      <div className="matis-grid-2">
        {/* Sales Performance */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="shoppingBag" size={20} /> Desempeño de Artículos en Tienda
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Unidades Vendidas</th>
                  <th>Ingresos Totales</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{item.productName}</td>
                    <td>{item.unitsSold} pzas</td>
                    <td style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
                      ${item.revenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-pink)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="alertTriangle" size={20} /> Alertas Críticas de Abastecimiento
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Variante / Talla</th>
                  <th>Stock Restante</th>
                  <th>Severidad</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((al, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{al.name}</td>
                    <td>{al.variant}</td>
                    <td style={{ fontWeight: 'bold', color: al.criticalLevel === 'CRITICAL' ? 'var(--matis-red)' : 'var(--matis-yellow)' }}>
                      {al.stockLeft} uds
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-cyber)',
                        backgroundColor: al.criticalLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: al.criticalLevel === 'CRITICAL' ? 'var(--matis-red)' : 'var(--matis-yellow)'
                      }}>
                        {al.criticalLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatisProducts
