import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisVenuesAPI } from '../services/matisService'
import Icon from '../../components/Icons/Icons'
import '../styles/matis.css'

const MatisVenues = () => {
  const [loading, setLoading] = useState(true)
  const [prospects, setProspects] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await matisVenuesAPI.getProspects()
        setProspects(res || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const defaultProspects = [
    { name: 'Foro Sol México', address: 'CDMX, México', similarity_score: 94.5, classification: 'High', justification: 'Alta capacidad coincidente con patrón de festivales masivos y volumen de taquilla de gran escala.' },
    { name: 'Estadio BBVA', address: 'Monterrey, México', similarity_score: 88.2, classification: 'High', justification: 'Demanda regional para eventos deportivos y patrocinio B2B premium.' },
    { name: 'Arena Guadalajara', address: 'Jalisco, México', similarity_score: 72.1, classification: 'Medium', justification: 'Ajuste adecuado para conciertos de pop y eventos corporativos.' },
    { name: 'Teatro Metropólitan', address: 'CDMX, México', similarity_score: 55.4, classification: 'Low', justification: 'Capacidad limitada; no obstante, excelente conversión para shows de comedia.' }
  ]

  const dataList = prospects.length > 0 ? prospects : defaultProspects

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia de Recintos (Prospectos B2B)" subtitle="Análisis de Lugares Gemelos (Lookalike) y Planificación Comercial B2B" />

      <div className="matis-card">
        <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name="map" size={20} /> Listado de Recintos Recomendados por Inteligencia Lookalike
        </h3>
        <div className="matis-table-container">
          <table className="matis-table">
            <thead>
              <tr>
                <th>Nombre del Recinto</th>
                <th>Ubicación</th>
                <th>Similitud del Modelo</th>
                <th>Prioridad B2B</th>
                <th style={{ width: '45%' }}>Justificación / Diagnóstico de Afinidad</th>
              </tr>
            </thead>
            <tbody>
              {dataList.map((prospect, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 'bold', color: 'var(--matis-text-primary)' }}>{prospect.name}</td>
                  <td style={{ color: 'var(--matis-text-secondary)' }}>{prospect.address}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-cyber)',
                      color: prospect.similarity_score >= 85 ? 'var(--matis-green)' : prospect.similarity_score >= 70 ? 'var(--matis-yellow)' : 'var(--matis-red)',
                      fontWeight: 'bold'
                    }}>
                      {prospect.similarity_score}%
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-cyber)',
                      fontWeight: 'bold',
                      backgroundColor: prospect.classification === 'High' ? 'rgba(16, 185, 129, 0.15)' : prospect.classification === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: prospect.classification === 'High' ? 'var(--matis-green)' : prospect.classification === 'Medium' ? 'var(--matis-yellow)' : 'var(--matis-red)',
                      border: `1px solid ${prospect.classification === 'High' ? 'var(--matis-green)' : prospect.classification === 'Medium' ? 'var(--matis-yellow)' : 'var(--matis-red)'}`
                    }}>
                      {prospect.classification.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--matis-text-secondary)', lineHeight: '1.4' }}>
                    {prospect.justification}
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

export default MatisVenues
