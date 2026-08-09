import React, { useEffect, useState } from 'react'
import MatisHeader from '../components/MatisHeader'
import { matisExecutiveAPI } from '../services/matisService'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'
import '../styles/matis.css'

const MatisExecutive = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    kpis: {},
    categories: [],
    trend: []
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpis, categories, trend] = await Promise.all([
          matisExecutiveAPI.getKpis().catch(() => ({})),
          matisExecutiveAPI.getCategoryPerformance().catch(() => ([])),
          matisExecutiveAPI.getSalesTrend().catch(() => ([]))
        ])
        setData({ kpis, categories, trend })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const defaultCategories = [
    { category: 'Conciertos', revenue: 95400, color: 'var(--matis-cyan)' },
    { category: 'Festivales', revenue: 52100, color: 'var(--matis-blue)' },
    { category: 'Deportes', revenue: 38200, color: 'var(--matis-purple)' },
    { category: 'Teatro', revenue: 12500, color: 'var(--matis-pink)' },
    { category: 'Cultural', revenue: 6400, color: 'var(--matis-yellow)' }
  ]

  const defaultTrend = [
    { month: 'Ene', sales: 45000 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 49000 },
    { month: 'Abr', sales: 63000 },
    { month: 'May', sales: 85000 },
    { month: 'Jun', sales: 95400 }
  ]

  const categories = data.categories.length > 0 ? data.categories : defaultCategories
  const trend = data.trend.length > 0 ? data.trend : defaultTrend

  if (loading) {
    return (
      <div className="matis-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ color: 'var(--matis-cyan)', fontFamily: 'var(--font-cyber)' }}>
            ACCEDIENDO A INTELIGENCIA EJECUTIVA...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="matis-container">
      <MatisHeader title="Inteligencia Ejecutiva" subtitle="Reportes Financieros y Rendimiento Operativo de Alto Nivel" />

      <div className="matis-grid-4">
        <div className="matis-card">
          <div className="kpi-title">Ingresos Totales (YTD)</div>
          <div className="kpi-value">${data.kpis?.total_revenue?.toLocaleString() || '184,250'}</div>
          <div style={{ color: 'var(--matis-green)', fontSize: '0.85rem' }}>+18.4% vs Año Anterior</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Tasa Conversión Ventas</div>
          <div className="kpi-value">{data.kpis?.conversion_rate || '3.82'}%</div>
          <div style={{ color: 'var(--matis-cyan)', fontSize: '0.85rem' }}>Tasa óptima de checkout</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Eventos Organizados</div>
          <div className="kpi-value">{data.kpis?.active_events || 8}</div>
          <div style={{ color: 'var(--matis-text-secondary)', fontSize: '0.85rem' }}>4 en cola de inicio</div>
        </div>
        <div className="matis-card">
          <div className="kpi-title">Usuarios Activos en Plataforma</div>
          <div className="kpi-value">{data.kpis?.active_users?.toLocaleString() || '1,420'}</div>
          <div style={{ color: 'var(--matis-cyan)', fontSize: '0.85rem' }}>210 usuarios concurrentes</div>
        </div>
      </div>

      <div className="matis-grid-2">
        {/* Trend Area Chart */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-cyan)', marginBottom: '1.5rem' }}>
            Tendencia de Ventas (Histórico)
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--matis-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--matis-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--matis-text-secondary)" />
                <YAxis stroke="var(--matis-text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: 'var(--matis-cyan)', color: '#fff' }} />
                <Area type="monotone" dataKey="sales" stroke="var(--matis-cyan)" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="matis-card">
          <h3 style={{ fontFamily: 'var(--font-cyber)', color: 'var(--matis-blue)', marginBottom: '1.5rem' }}>
            Desempeño por Categoría de Evento
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <XAxis dataKey="category" stroke="var(--matis-text-secondary)" />
                <YAxis stroke="var(--matis-text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: 'var(--matis-blue)', color: '#fff' }} />
                <Bar dataKey="revenue" fill="var(--matis-blue)">
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || 'var(--matis-blue)'} />
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

export default MatisExecutive
