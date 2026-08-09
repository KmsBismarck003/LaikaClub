import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Alert, Badge } from '../components'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import './StaffDashboard.css'

const StaffDashboard = () => {
  const { user } = useAuth()
  const { success, error: showError } = useNotification()
  const [ticketCode, setTicketCode] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  
  // Real-time synchronization states
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)
  const [stats, setStats] = useState({ total: 0, valid: 0, rejected: 0 })

  // 1. Load Events and set initial terminal selection
  const loadEvents = async () => {
    try {
      const resp = await api.event.getPublic()
      const fetchedEvents = Array.isArray(resp) ? resp : []
      setEvents(fetchedEvents)
      
      const savedId = localStorage.getItem('operator_selected_event_id')
      if (savedId && fetchedEvents.length > 0) {
        const matched = fetchedEvents.find(e => Number(e.id) === Number(savedId))
        if (matched) {
          setSelectedEvent(matched)
          return
        }
      }
      if (fetchedEvents.length > 0) {
        setSelectedEvent(fetchedEvents[0])
        localStorage.setItem('operator_selected_event_id', fetchedEvents[0].id)
      }
    } catch (err) {
      console.warn('Error al cargar eventos en taquilla:', err)
    }
  }

  // 2. Fetch Validation Log History from backend and update local stats
  const fetchLogsAndStats = async () => {
    try {
      const logs = await api.ticket.getValidationHistory()
      const fetchedLogs = Array.isArray(logs) ? logs : []
      
      // Filter by selected event if set
      const eventFilteredLogs = selectedEvent 
        ? fetchedLogs.filter(log => {
            const eventIdOfLog = log.event_id || (log.ticketDetails && log.ticketDetails.event_id)
            return Number(eventIdOfLog) === Number(selectedEvent.id)
          })
        : fetchedLogs

      setScanHistory(eventFilteredLogs)

      // Calculate statistics dynamically
      const valid = eventFilteredLogs.filter(
        log => log.result_status === 'VALID_ACCESS' || log.result_status === 'VALID'
      ).length
      
      setStats({
        total: eventFilteredLogs.length,
        valid,
        rejected: eventFilteredLogs.length - valid
      })
    } catch (err) {
      console.warn('Error al recuperar logs de validación:', err)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchLogsAndStats()
    }
  }, [selectedEvent])

  const handleVerifyTicket = async e => {
    e.preventDefault()

    if (!selectedEvent) {
      setAlert({ type: 'error', message: 'Selecciona un evento de la terminal primero' })
      return
    }

    if (!ticketCode.trim()) {
      setAlert({ type: 'error', message: 'Ingresa un código de boleto' })
      return
    }

    setLoading(true)
    setAlert(null)

    try {
      console.log('📤 Verificando boleto:', ticketCode)
      
      let cleanCode = ticketCode.trim()
      if (cleanCode.includes('ticket/')) {
        cleanCode = cleanCode.split('ticket/')[1]
      }

      // Build context payload identical to mobile operators
      const payload = {
        ticketCode: cleanCode,
        selectedEventId: selectedEvent.id,
        operatorId: user?.id || null,
        operatorName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Operador Web',
        platform: 'WEB_STAFF',
        deviceInfo: 'Navegador Web',
        accessPoint: 'Taquilla Principal'
      }

      // Verify
      const response = await api.ticket.verify(payload)
      console.log('✅ Respuesta de verificación:', response)

      const result = {
        valid: response.valid || false,
        ticketCode: cleanCode,
        eventName: response.eventName || selectedEvent.name,
        customerName: response.customerName || `Titular ID ${response.userId || 'N/A'}`,
        ticketType: response.sectionName || 'General',
        purchaseDate: response.purchaseDate || new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        alreadyUsed: response.alreadyUsed || response.statusCode === 'ALREADY_REDEEMED' || false,
        ticketId: response.id || response.ticketId,
        message: response.operatorMessage || response.message
      }

      setVerificationResult(result)

      if (result.valid && !result.alreadyUsed) {
        setAlert({
          type: 'success',
          message: result.message || '¡Boleto válido! Acceso permitido'
        })
        success('Boleto verificado correctamente')
      } else if (result.alreadyUsed) {
        setAlert({
          type: 'error',
          message: result.message || 'Boleto ya utilizado anteriormente'
        })
        showError('Este boleto ya fue usado')
      } else {
        setAlert({ type: 'error', message: result.message || 'Boleto inválido o expirado' })
        showError(result.message || 'Boleto no válido')
      }

      setTicketCode('')
      // Refresh statistics & logs list
      fetchLogsAndStats()
    } catch (error) {
      console.error('❌ Error al verificar boleto:', error)
      const errorMsg = error.message || 'Error al verificar el boleto'
      setAlert({ type: 'error', message: errorMsg })
      showError(errorMsg)
      setTicketCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemTicket = async () => {
    if (
      !verificationResult ||
      !verificationResult.valid ||
      verificationResult.alreadyUsed
    ) {
      showError('No se puede registrar entrada para este boleto')
      return
    }

    try {
      console.log('📤 Canjeando boleto:', verificationResult.ticketCode)

      const payload = {
        ticketCode: verificationResult.ticketCode,
        selectedEventId: selectedEvent.id,
        operatorId: user?.id || null,
        operatorName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Operador Web',
        platform: 'WEB_STAFF',
        deviceInfo: 'Navegador Web',
        accessPoint: 'Taquilla Principal'
      }

      // Redeem
      await api.ticket.redeem(payload)

      success('Entrada registrada exitosamente')

      // Update local state and refresh
      setVerificationResult(prev => ({
        ...prev,
        alreadyUsed: true
      }))

      setAlert({ type: 'success', message: 'Entrada registrada correctamente' })
      fetchLogsAndStats()
    } catch (error) {
      console.error('❌ Error al canjear boleto:', error)
      const errorMsg = error.message || 'Error al registrar entrada'
      showError(errorMsg)
      setAlert({ type: 'error', message: errorMsg })
    }
  }

  return (
    <div className='staff-dashboard'>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          closable
          onClose={() => setAlert(null)}
        />
      )}

      {/* Terminal Gate Configuration */}
      <div className="event-selector-container">
        <span className="event-selector-label">CONFIGURACIÓN DE PUERTA (TERMINAL ACTIVA):</span>
        <select 
          className="event-selector-select"
          value={selectedEvent ? selectedEvent.id : ''} 
          onChange={(e) => {
            const ev = events.find(event => Number(event.id) === Number(e.target.value))
            if (ev) {
              setSelectedEvent(ev)
              localStorage.setItem('operator_selected_event_id', ev.id)
            }
          }}
        >
          {events.length === 0 ? (
            <option value="">Cargando eventos...</option>
          ) : (
            events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — {ev.event_date || ev.date || 'Sin fecha'}
              </option>
            ))
          )}
        </select>
      </div>

      <div className='verification-section'>
        <Card className='scanner-card'>
          <div className='scanner-container'>
            <div className='qr-scanner-placeholder'>
              <span className='scanner-icon'>📷</span>
              <p>Terminal Web de Puerta Activa</p>
              <small style={{ color: 'var(--text-muted)' }}>Ingresa el código del boleto para verificar y dar acceso</small>
            </div>

            <div className='scanner-divider'>
              <span>VERIFICAR</span>
            </div>

            <form onSubmit={handleVerifyTicket} className='manual-entry'>
              <Input
                label='Código del Boleto o URL de QR'
                name='ticketCode'
                value={ticketCode}
                onChange={e => setTicketCode(e.target.value)}
                placeholder='TKT-XXXXXXXXX o pegue el código leído'
                icon={<span>🎫</span>}
                fullWidth
              />
              <Button
                type='submit'
                variant='primary'
                size='large'
                fullWidth
                loading={loading}
              >
                Verificar Boleto
              </Button>
            </form>
          </div>
        </Card>

        {verificationResult && (
          <Card
            className={`result-card ${verificationResult.valid && !verificationResult.alreadyUsed ? 'valid' : 'invalid'}`}
          >
            <div className='result-header'>
              <div className='result-icon'>
                {verificationResult.valid && !verificationResult.alreadyUsed
                  ? '✅'
                  : '❌'}
              </div>
              <h2 className='result-title'>
                {verificationResult.valid && !verificationResult.alreadyUsed
                  ? 'Boleto Válido'
                  : verificationResult.alreadyUsed
                    ? 'Boleto Ya Usado'
                    : 'Boleto Inválido'}
              </h2>
            </div>

            <div className='result-details'>
              <div className='detail-row'>
                <span className='detail-label'>Código:</span>
                <span className='detail-value'>
                  {verificationResult.ticketCode}
                </span>
              </div>
              <div className='detail-row'>
                <span className='detail-label'>Evento:</span>
                <span className='detail-value'>
                  {verificationResult.eventName}
                </span>
              </div>
              <div className='detail-row'>
                <span className='detail-label'>Cliente:</span>
                <span className='detail-value'>
                  {verificationResult.customerName}
                </span>
              </div>
              <div className='detail-row'>
                <span className='detail-label'>Sección:</span>
                <Badge variant='info'>{verificationResult.ticketType}</Badge>
              </div>
              {verificationResult.message && (
                <div className='detail-row'>
                  <span className='detail-label'>Nota:</span>
                  <span className='detail-value' style={{ color: verificationResult.valid ? 'var(--success)' : 'var(--error)' }}>
                    {verificationResult.message}
                  </span>
                </div>
              )}
            </div>

            {verificationResult.valid && !verificationResult.alreadyUsed && (
              <div className='result-actions'>
                <Button
                  variant='success'
                  fullWidth
                  onClick={handleRedeemTicket}
                >
                  Registrar Entrada
                </Button>
              </div>
            )}

            {verificationResult.alreadyUsed && (
              <Alert
                type='warning'
                message='Este boleto ya fue canjeado anteriormente y no puede ser usado de nuevo.'
              />
            )}
          </Card>
        )}
      </div>

      <Card title='Historial de Verificaciones en Puerta' className='history-card'>
        {scanHistory.length === 0 ? (
          <div className='empty-history'>
            <p>No hay verificaciones recientes para este evento</p>
          </div>
        ) : (
          <div className='history-list'>
            {scanHistory.map((scan, index) => {
              const isValidAccess = scan.result_status === 'VALID_ACCESS' || scan.result_status === 'VALID'
              return (
                <div 
                  key={index} 
                  className='history-item' 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedLog(scan)}
                >
                  <div className='history-icon'>
                    {isValidAccess ? '✅' : '❌'}
                  </div>
                  <div className='history-info'>
                    <strong>{scan.ticketCode || (scan.ticketDetails && scan.ticketDetails.ticketCode) || 'N/A'}</strong>
                    <p>{scan.action_type || 'VALIDATION'} — {scan.operator_name || 'Operador'}</p>
                    <small>
                      {scan.date} {scan.time}
                    </small>
                  </div>
                  <Badge
                    variant={isValidAccess ? 'success' : 'danger'}
                  >
                    {scan.result_status}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card title='Estadísticas Operativas del Evento' className='stats-card'>
        <div className='daily-stats'>
          <div className='stat-item'>
            <span className='stat-number' style={{ color: 'var(--success)' }}>
              {stats.valid}
            </span>
            <span className='stat-label'>Accesos Válidos</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number' style={{ color: 'var(--error)' }}>
              {stats.rejected}
            </span>
            <span className='stat-label'>Rechazados</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number' style={{ color: 'var(--primary)' }}>
              {stats.total}
            </span>
            <span className='stat-label'>Total Escaneos</span>
          </div>
        </div>
      </Card>

      {/* Audit Detail Modal Pop-up */}
      {selectedLog && (
        <div className="staff-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="staff-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>Detalle de Validación</h3>
              <button className="staff-modal-close" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="staff-modal-body">
              <div className="detail-item">
                <span className="label">Código de Ticket:</span>
                <span className="value" style={{ fontFamily: 'monospace' }}>
                  {selectedLog.ticketCode || (selectedLog.ticketDetails && selectedLog.ticketDetails.ticketCode) || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Acción Realizada:</span>
                <span className={`value action-badge ${selectedLog.action_type?.toLowerCase()}`}>
                  {selectedLog.action_type}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Estatus Resultado:</span>
                <Badge variant={selectedLog.result_status === 'VALID_ACCESS' || selectedLog.result_status === 'VALID' ? 'success' : 'danger'}>
                  {selectedLog.result_status}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="label">Operador Terminal:</span>
                <span className="value">{selectedLog.operator_name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Fecha / Hora:</span>
                <span className="value">{selectedLog.date} a las {selectedLog.time}</span>
              </div>
              <div className="detail-item">
                <span className="label">Punto de Acceso:</span>
                <span className="value">{selectedLog.access_point || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Plataforma Origen:</span>
                <span className="value">{selectedLog.platform || 'N/A'}</span>
              </div>
              {selectedLog.notes && (
                <div className="detail-item notes">
                  <span className="label">Notas de Auditoría / Backend:</span>
                  <p className="notes-text">{selectedLog.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboard
