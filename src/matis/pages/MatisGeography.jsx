/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisGeographyAPI } from '../services/matisService'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisGeography = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await matisGeographyAPI.getSalesByState()
        setData(res || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const statesData = data || []

  if (loading) {
    return (
      <div className="matis-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
            LOCALIZANDO REGIONES COMERCIALES...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia Geográfica" subtitle="Análisis de Ventas por Estado y Segmentación Regional" />

      <div className="matis-grid-2">
        {/* Geo Table */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="globe" size={20} /> Desglose de Ventas por Estado / Entidad
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Ventas Totales</th>
                  <th>Participación de Mercado</th>
                </tr>
              </thead>
              <tbody>
                {statesData.map((st, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{st.state}</td>
                    <td style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
                      ${st.sales?.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flexGrow: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${st.percentage}%`, height: '100%', backgroundColor: st.color || 'var(--matis-cyan)' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', width: '35px', textAlign: 'right' }}>{st.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-blue)', marginBottom: '1.5rem' }}>
            Gráfico de Distribución Regional
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statesData} layout="vertical">
                <XAxis type="number" stroke="var(--matis-text-secondary)" />
                <YAxis dataKey="state" type="category" stroke="var(--matis-text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: 'var(--matis-blue)', color: '#fff' }} />
                <Bar dataKey="sales" fill="var(--matis-blue)">
                  {statesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || 'var(--matis-cyan)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatisGeography
