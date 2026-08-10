/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisCustomersAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisCustomers = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    segments: [],
    churn: []
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [segments, churn] = await Promise.all([
          matisCustomersAPI.getSegments().catch(() => ([])),
          matisCustomersAPI.getChurn().catch(() => ([]))
        ])
        setData({ segments, churn })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const segments = data.segments || []
  const churn = data.churn || []

  if (loading) {
    return (
      <div className="matis-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
            ACCEDIENDO A INTELIGENCIA DE COMPORTAMIENTO...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia de Clientes" subtitle="Segmentación de Cohortes y Centro de Alerta Temprana de Churn (Abandono)" />

      <div className="matis-grid-2">
        {/* Customer Cohort Segmentation */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem' }}>
            Segmentación por Cohortes y Valor (LTV)
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Segmento</th>
                  <th>Usuarios</th>
                  <th>Gasto Total</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{seg.segmentName}</td>
                    <td>{seg.userCount}</td>
                    <td style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
                      ${seg.totalSpend?.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>{seg.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Churn Risk Feed */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-pink)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="alertTriangle" size={20} /> Centro de Prevención de Fuga (Churn)
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Días Inactivo</th>
                  <th>Riesgo</th>
                  <th>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {churn.map((ch, idx) => (
                  <tr key={idx}>
                    <td>{ch.email}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--matis-pink)' }}>
                      {ch.daysInactive}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-cyber)',
                        backgroundColor: ch.score === 'HIGH RISK' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: ch.score === 'HIGH RISK' ? 'var(--matis-red)' : 'var(--matis-yellow)'
                      }}>
                        {ch.score}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)' }}>{ch.actionRecommended}</td>
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

export default MatisCustomers
