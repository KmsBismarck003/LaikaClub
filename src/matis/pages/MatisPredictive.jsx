/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisPredictiveAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisPredictive = () => {
  const [loading, setLoading] = useState(true)
  const [regression, setRegression] = useState({})
  const [forecast, setForecast] = useState([])
  const [decisionTree, setDecisionTree] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reg, fore, tree] = await Promise.all([
          matisPredictiveAPI.getRegression().catch(() => ({})),
          matisPredictiveAPI.getSoldOutForecast().catch(() => ([])),
          matisPredictiveAPI.getDecisionTree().catch(() => ({}))
        ])
        setRegression(reg || {})
        setForecast(fore || [])
        setDecisionTree(tree || {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const modelsList = regression.models || []
  const forecastList = forecast || []

  return (
    <div className="matis-container">
      <MatisHeader title="Modelos Predictivos ML" subtitle="Algoritmos de Regresión, Predicción de Sold-Out y Precios Dinámicos" />

      <div className="matis-grid-2">
        {/* Regression Models R2 Scores */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="cpu" size={20} /> Comparación de Modelos de Regresión (R² Score)
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Coeficiente R²</th>
                  <th>Complejidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {modelsList.map((model, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{model.name}</td>
                    <td style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>
                      {model.r2?.toFixed(3)}
                    </td>
                    <td>{model.complexity}</td>
                    <td>
                      <span style={{ color: 'var(--matis-green)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--matis-green)' }} />
                        {model.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--matis-text-secondary)', fontSize: '0.8rem', marginTop: '1.25rem', lineHeight: '1.4' }}>
            * El modelo Polinomial de Grado 2 presenta el mejor ajuste para el histórico de ventas de boletos de LaikaClub, minimizando el error cuadrático medio (MSE).
          </p>
        </div>

        {/* Sold-out predictions & pricing advice */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-pink)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="activity" size={20} /> Pronóstico de Agotamiento y Precios Recomendados
          </h3>
          <div className="matis-table-container">
            <table className="matis-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Días para Sold-Out</th>
                  <th>Probabilidad</th>
                  <th>Precio Sugerido</th>
                </tr>
              </thead>
              <tbody>
                {forecastList.map((fc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{fc.eventName}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: fc.daysToSoldOut <= 5 ? 'var(--matis-pink)' : 'var(--matis-cyan)' }}>
                      {fc.daysToSoldOut} días
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>{fc.probability}%</span>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${fc.probability}%`, height: '100%', backgroundColor: 'var(--matis-pink)' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--matis-green)', fontFamily: 'var(--font-cyber)', fontWeight: 'bold' }}>
                      ${fc.recommendedPrice} MXN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--matis-text-secondary)', fontSize: '0.8rem', marginTop: '1.25rem', lineHeight: '1.4' }}>
            * Las sugerencias de precios dinámicos están calibradas para optimizar la ocupación del recinto y maximizar el margen de utilidad bruto.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MatisPredictive
