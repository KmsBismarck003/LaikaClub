/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
import React from 'react'

const MatisDashboard = () => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 140px)', margin: 0, padding: 0 }}>
      <iframe
        src="http://localhost:3040"
        title="MATIS Executive Dashboard"
        style={{
          width: '100%',
          height: '100%',
          border: '3px solid #000000',
          borderRadius: '8px',
          background: '#ffffff',
          boxShadow: '4px 4px 0px #000000'
        }}
      />
    </div>
  )
}

export default MatisDashboard
