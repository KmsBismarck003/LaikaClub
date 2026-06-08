import React, { useState } from 'react'
import { Card, Icon, Modal } from '../../components'
import BigDataVisualizer from './Dashboard/BigDataVisualizer'
import { HelpCircle } from 'lucide-react'
import './admin.css'

const BigDataAnalytics = () => {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="admin-big-data-page">
      <div className="page-header">
        <div className="header-title-group" style={{ position: 'relative', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#000', padding: '10px', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="database" size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>Análisis y Predicciones</h1>
                <button
                  onClick={() => setShowHelp(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    transition: 'color 0.2s',
                    borderRadius: '50%'
                  }}
                  title="¿Qué hay en este apartado?"
                >
                  <HelpCircle size={22} />
                </button>
              </div>
              <p className="page-subtitle">Análisis inteligente de tu negocio, ventas y comportamiento de tus clientes</p>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          title="Ayuda - Análisis y Predicciones"
          size="medium"
        >
          <div style={{ padding: '0.5rem' }}>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              Esta pantalla analiza automáticamente las ventas de boletos y el historial de eventos en LaikaClub para darte herramientas de decisión de negocio. A continuación se detallan las pestañas disponibles:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Vista en 3D</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Mapa tridimensional interactivo que distribuye tus ventas de boletos e ingresos según la ubicación física del evento.
                </p>
              </div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Predicción de Ingresos</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Calcula estimaciones a futuro del dinero que ganarás. Te ayuda a anticipar ganancias con base en la velocidad actual de tus ventas.
                </p>
              </div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Estrategia de Precios</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Sugerencias automáticas de tarifas dinámicas u ofertas para optimizar la ocupación de los eventos.
                </p>
              </div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Pasos y Estadísticas</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Resumen estadístico de las ventas (promedio de ganancia, valores comunes y estabilidad de ingresos).
                </p>
              </div>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Recomendador de Empresas</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Identifica posibles socios o patrocinadores comerciales analizando el rendimiento de tus recintos actuales.
                </p>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Preferencias de Clientes</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  Reporte sobre los hábitos de compra, horarios ideales y clientes en riesgo de abandono para reactivación.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className="analytics-content">
        <BigDataVisualizer />
      </div>

      <style>{`
        .admin-big-data-page {
          padding: 1rem 0;
        }
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .header-title-group h1 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 900;
          color: #000 !important;
        }
        .page-subtitle {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: #000 !important;
          opacity: 0.7;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default BigDataAnalytics
