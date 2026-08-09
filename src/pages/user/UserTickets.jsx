import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, PermissionWall } from '../../components';
import { ticketAPI, achievementsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { QRCodeSVG } from 'qrcode.react';
import { PushEngine } from '../../specialFun/PushNotifications/services/PushEngine';
import './UserTickets.css';

const UserTickets = () => {
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [hasPremium, setHasPremium] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    // Estado para la notificación en tiempo real de boleto escaneado en puerta
    const [scannedAlert, setScannedAlert] = useState(null);
    // Estado para ver la credencial digital en sala (sin QR) cuando el evento está en transcurso
    const [liveEventModal, setLiveEventModal] = useState(null);

    const prevTicketsRef = useRef([]);

    const fetchTickets = useCallback(async (isPolling = false) => {
        try {
            const apiTickets = await ticketAPI.getMyTickets();
            const allTickets = apiTickets.map(t => ({
                id: t.id,
                eventName: t.event_name,
                sectionName: t.section_name || 'GENERAL',
                date: t.event_date,
                time: t.event_time || 'N/A',
                qrHash: t.ticket_code || '',
                venueName: t.venue_name || 'Lugar no especificado',
                seatId: t.seat_id || 'N/A',
                status: (t.status || 'active').toLowerCase(),
                price: t.price || 0,
                scannedAt: t.updated_at ? new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'
            }));

            // Si es un muestreo en segundo plano (polling), detectar transiciones de 'active' a 'used' o 'redeemed'
            if (isPolling && prevTicketsRef.current.length > 0) {
                allTickets.forEach(newTicket => {
                    const oldTicket = prevTicketsRef.current.find(o => o.id === newTicket.id);
                    if (oldTicket && (oldTicket.status === 'active' || oldTicket.status === 'confirmed') && 
                        (newTicket.status === 'used' || newTicket.status === 'redeemed' || newTicket.status === 'in_progress')) {
                        // Disparar notificación push del sistema operativo
                        PushEngine.triggerSmart('TICKET_SCANNED', { eventName: newTicket.eventName });
                        // Disparar modal festivo de bienvenida en pantalla
                        setScannedAlert(newTicket);
                    }
                });
            }

            prevTicketsRef.current = allTickets;
            setTickets(allTickets);
        } catch (err) {
            if (!isPolling) {
                console.error("Error fetching tickets", err);
            }
        } finally {
            if (!isPolling) setLoading(false);
        }
    }, []);

    const checkPremium = useCallback(async () => {
        try {
            const result = await achievementsAPI.hasPremiumTicket();
            setHasPremium(result.has_premium);
        } catch (e) {
            // Fail silently
        }
    }, [setHasPremium]);

    useEffect(() => {
        fetchTickets(false);
        checkPremium();
        // Inicializar motor de notificaciones Push para alertas de escaneo
        PushEngine.init().then(() => PushEngine.requestPermission());

        // Muestreo silencioso en tiempo real para detectar escaneo de QR desde la terminal de Staff
        const intervalId = setInterval(() => {
            fetchTickets(true);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchTickets, checkPremium]);

    // Simular el escaneo y canje en puerta para validación instantánea y pruebas
    const handleSimulateScan = async (ticket) => {
        try {
            try {
                await ticketAPI.redeem({ ticketCode: ticket.qrHash, notes: 'Escaneado desde terminal LaikaWear / Mobile' });
            } catch (apiError) {
                // Si falla la conexión o el backend no está disponible en este momento, actualizamos el estado local para la experiencia
                console.warn('Backend de canje no disponible o modo local activado, continuando en modo simulación.', apiError);
            }

            const updatedTickets = tickets.map(t => 
                t.id === ticket.id ? { ...t, status: 'used', scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : t
            );
            setTickets(updatedTickets);
            prevTicketsRef.current = updatedTickets;
            setSelectedTicket(null);

            // Disparar notificación push del OS (LaikaWear / Mobile / Desktop)
            PushEngine.triggerSmart('TICKET_SCANNED', { eventName: ticket.eventName });

            // Mostrar el modal de bienvenida y celebración al evento en transcurso
            setScannedAlert({ ...ticket, status: 'used', scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
            success("¡Boleto verificado por el personal de sala!");
        } catch (error) {
            showError('Error al procesar la validación del boleto.');
        }
    };

    // Clasificación de boletos en 3 categorías inteligentes
    const { activeTickets, inProgressTickets, historyTickets } = useMemo(() => {
        const active = [];
        const inProgress = [];
        const history = [];

        tickets.forEach(t => {
            if (t.status === 'active' || t.status === 'confirmed') {
                active.push(t);
            } else if (t.status === 'used' || t.status === 'redeemed' || t.status === 'in_progress') {
                inProgress.push(t);
            } else {
                history.push(t);
            }
        });

        return { activeTickets: active, inProgressTickets: inProgress, historyTickets: history };
    }, [tickets]);

    const displayedTickets = activeTab === 'active' ? activeTickets : activeTab === 'in_progress' ? inProgressTickets : historyTickets;

    if (loading) return null;

    return (
        <PermissionWall permission="canViewMyTickets" label="Mis Entradas">
        <div className="user-tickets-page elite-vault">
            <header className="page-header-elite mb-6">
                <div className="welcome-section">
                    <span className="welcome-label">BÓVEDA Y CONTROL DE ACCESOS</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">COLECCIÓN ELITE</h2>
                </div>
                <div className="elite-status-badge !rounded-full">
                    <Icon name="shield" size={16} />
                    ENCRIPTADO Y EN VIVO
                </div>
            </header>

            {/* Selector de Pestañas (3 Estados del Boleto) */}
            <div className="flex flex-wrap gap-3 mb-8 border-b border-white/10 pb-4">
                <button 
                    onClick={() => setActiveTab('active')} 
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,242,0.25)] font-extrabold' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    ACCESOS DISPONIBLES ({activeTickets.length})
                </button>
                <button 
                    onClick={() => setActiveTab('in_progress')} 
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'in_progress' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] font-extrabold' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    <span className="live-indicator-dot" />
                    EN TRANSURSO / EN VIVO ({inProgressTickets.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')} 
                    className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] font-extrabold' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                    HISTORIAL Y CONCLUIDOS ({historyTickets.length})
                </button>
            </div>

            {/* Mensaje Informativo según la Pestaña */}
            {activeTab === 'in_progress' && inProgressTickets.length > 0 && (
                <div className="live-event-banner mb-6">
                    <div className="flex items-center gap-3">
                        <Icon name="radio" size={20} className="text-emerald-400 animate-pulse" />
                        <div>
                            <h4 className="text-sm font-black uppercase text-white tracking-wider">Funciones en curso y accesos verificados</h4>
                            <p className="text-xs text-white/70">
                                Tus boletos escaneados abandonan la carpeta de accesos pendientes y se resguardan aquí durante la celebración del evento para tu control y asistencia en sala.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {displayedTickets.length === 0 ? (
                <div className="user-card !bg-white/5 !border-dashed !border-white/10 text-center py-20">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="ticket" size={32} className="opacity-20" />
                    </div>
                    <p className="uppercase font-black tracking-[0.3em] text-[10px] text-gray-500">
                        {activeTab === 'active' ? 'No tienes accesos activos en este momento' : activeTab === 'in_progress' ? 'No tienes ninguna función en curso o boleto escaneado recientemente' : 'Tu historial de eventos concluidos está vacío'}
                    </p>
                    {activeTab === 'active' && (
                        <button onClick={() => navigate('/')} className="mt-8 text-[10px] font-black uppercase tracking-widest text-white underline decoration-white/20 underline-offset-8">
                            ADQUIRIR PRIMER ACCESO
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedTickets.map(ticket => {
                        const isArchived = ticket.status === 'unutilized' || ticket.status === 'refunded';
                        const isInProgress = ticket.status === 'used' || ticket.status === 'redeemed' || ticket.status === 'in_progress';

                        return (
                            <div
                                key={ticket.id}
                                className={`user-card !p-0 group cursor-pointer overflow-hidden border transition-all ${isInProgress ? 'border-emerald-500/40 hover:border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-white/20'}`}
                                onClick={() => {
                                    if (isInProgress) {
                                        setLiveEventModal(ticket);
                                    } else {
                                        setSelectedTicket(ticket);
                                    }
                                }}
                            >
                                <div className="h-40 relative">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{
                                        backgroundImage: ticket.ticketBg ? `url(${ticket.ticketBg})` : 'linear-gradient(45deg, #0e1117, #1e1e2d)'
                                    }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-black/50 to-transparent" />
                                    
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {isInProgress ? (
                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-black border border-emerald-400 flex items-center gap-1.5 shadow-lg">
                                                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                                                EN TRANSURSO
                                            </span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isArchived ? 'bg-purple-950/80 border-purple-500 text-purple-300' : 'bg-white/20 backdrop-blur-md text-white border-white/20'}`}>
                                                {isArchived ? (ticket.status === 'refunded' ? 'REEMBOLSADO' : 'CONCLUIDO') : ticket.sectionName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-[#0b0c10]">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">{ticket.eventName}</h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 opacity-70">
                                            <Icon name="mapPin" size={12} className={isInProgress ? "text-emerald-400" : "text-cyan-400"} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-white">{ticket.venueName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-60">
                                            <Icon name="calendar" size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{ticket.date} · {ticket.time}</span>
                                        </div>
                                    </div>

                                    {/* Pie de la tarjeta */}
                                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                                        {isInProgress ? (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-emerald-400 font-black tracking-widest uppercase">ESTADO DEL EVENTO</span>
                                                <span className="text-[11px] font-bold text-white uppercase">ESPECTÁCULO EN CURSO</span>
                                            </div>
                                        ) : !isArchived ? (
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <QRCodeSVG value={ticket.qrHash} size={28} bgColor="#fff" fgColor="#000" />
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest">ARCHIVADO #ELITE</span>
                                        )}

                                        <button className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${isInProgress ? 'text-emerald-400 hover:text-emerald-300' : 'text-cyan-400 hover:text-cyan-300'}`}>
                                            {isInProgress ? 'CREDENCIAL EN SALA' : isArchived ? 'DETALLES E HISTORIAL' : 'MOSTRAR QR'}
                                            <Icon name={isInProgress ? "shieldCheck" : "maximize"} size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── MODAL FESTIVO DE ESCANEO / BIENVENIDA (AL ENTRAR AL RECINTO) ── */}
            {scannedAlert && (
                <div className="scanned-welcome-overlay animate-fade-in" onClick={() => setScannedAlert(null)}>
                    <div className="scanned-welcome-modal animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="scanned-header-accent" />
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                <Icon name="shieldCheck" size={42} />
                            </div>

                            <span className="text-[11px] font-black tracking-[0.25em] text-emerald-400 uppercase block mb-2">
                                VERIFICACIÓN EXTERIOR COMPLETADA
                            </span>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">
                                ¡ACCESO CONCEDIDO!
                            </h3>

                            <div className="scanned-message-box p-5 bg-white/5 rounded-2xl border border-white/10 mb-6 text-left space-y-3">
                                <p className="text-xs text-white/90 leading-relaxed font-semibold">
                                    Tu entrada para <strong className="text-emerald-400">{scannedAlert.eventName}</strong> fue escaneada y autorizada correctamente por el equipo de control.
                                </p>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    <strong>¿Qué sucede ahora con mi boleto?</strong><br/>
                                    Para evitar confusiones en puerta, el código QR de ingreso ha desaparecido de tu lista de accesos pendientes y el registro se ha trasladado al apartado <strong>"En Transcurso / En Vivo"</strong>.
                                </p>
                                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-white">
                                    <span>Hora de registro:</span>
                                    <span className="text-emerald-400 font-mono">{scannedAlert.scannedAt || 'Justo Ahora'}</span>
                                </div>
                            </div>

                            <p className="text-sm font-black text-white uppercase tracking-wider mb-8">
                                ¡DISFRUTA LA FUNCIÓN Y QUE VIVAS UNA EXPERIENCIA EXTRAORDINARIA EN LAIKACLUB!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setScannedAlert(null);
                                        setActiveTab('in_progress');
                                        setLiveEventModal(scannedAlert);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black uppercase text-xs py-4 rounded-xl shadow-lg transition-all"
                                >
                                    IR A FUNCIÓN EN TRANSURSO
                                </button>
                                <button
                                    onClick={() => setScannedAlert(null)}
                                    className="px-8 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs py-4 rounded-xl transition-all"
                                >
                                    ENTENDIDO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL DE CREDENCIAL EN SALA E INSTRUCCIONES EN TRANSURSO (SIN QR) ── */}
            {liveEventModal && (
                <div className="qr-modal-overlay-elite !bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4" onClick={() => setLiveEventModal(null)}>
                    <div className="bg-[#0b0c10] w-full max-w-md rounded-[32px] overflow-hidden border border-emerald-500/40 shadow-2xl relative animate-scale-up" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
                        
                        <div className="p-8 pb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 block mb-1 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                                        FUNCIÓN EN CURSO · ACCESO VALIDADO
                                    </span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">{liveEventModal.eventName}</h3>
                                </div>
                                <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors" onClick={() => setLiveEventModal(null)}>&times;</button>
                            </div>

                            {/* Tarjeta de Asiento y Ubicación en Sala (Para mostrar en la oscuridad) */}
                            <div className="bg-gradient-to-br from-emerald-950/40 to-[#121820] border border-emerald-500/30 p-6 rounded-[24px] mb-6 shadow-inner text-center">
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">TU UBICACIÓN AUTORIZADA EN RECINTO</span>
                                <div className="text-4xl font-black text-emerald-400 tracking-tight my-2">
                                    {liveEventModal.sectionName}
                                </div>
                                <div className="text-lg font-extrabold text-white tracking-widest mt-1">
                                    ASIENTO: <span className="text-yellow-400">{liveEventModal.seatId}</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-emerald-500/20 text-[11px] font-bold text-emerald-300 uppercase">
                                    RECINTO: {liveEventModal.venueName}
                                </div>
                            </div>

                            {/* Estado y recomendaciones en vivo */}
                            <div className="space-y-4 text-left mb-6">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h5 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
                                        <Icon name="info" size={14} /> Recomendaciones durante la función
                                    </h5>
                                    <p className="text-xs text-white/70 leading-relaxed">
                                        • Te sugerimos ajustar tu pantalla a brillo bajo y mantener tu teléfono en modo silencio.<br/>
                                        • Si abandonas tu zona temporalmente, muestra esta credencial al personal de seguridad para reingresar.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 text-xs">
                                    <span className="font-bold text-white/60">Hora de verificación:</span>
                                    <span className="font-mono font-bold text-emerald-400">{liveEventModal.scannedAt || 'Validado en control'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setLiveEventModal(null)}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg"
                            >
                                CONTINUAR DISFRUTANDO EL EVENTO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL QR DE ACCESO ACTIVO ── */}
            {selectedTicket && (
                <div className="qr-modal-overlay-elite !bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-[#0b0c10] w-full max-w-md rounded-[32px] overflow-hidden border border-white/15 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-purple-600 via-cyan-500 to-amber-400" />
                        
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 block mb-1">
                                        {selectedTicket.status === 'active' || selectedTicket.status === 'confirmed' ? 'ACCESO ELITE OFICIAL' : 'REGISTRO HISTÓRICO ELITE'}
                                    </span>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">{selectedTicket.eventName}</h3>
                                </div>
                                <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors" onClick={() => setSelectedTicket(null)}>&times;</button>
                            </div>

                            {(selectedTicket.status === 'active' || selectedTicket.status === 'confirmed') && (
                                <div className="bg-white p-5 rounded-[24px] mb-6 flex justify-center items-center shadow-[0_0_40px_rgba(0,255,242,0.15)] border border-cyan-500/20 ticket-print-area">
                                    <QRCodeSVG value={selectedTicket.qrHash} size={220} className="w-full h-auto" bgColor="#fff" fgColor="#000" level="H" includeMargin={true} />
                                </div>
                            )}

                            {selectedTicket.status === 'unutilized' && (
                                <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/30 p-6 rounded-[24px] mb-6 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-2">EVENTO CONCLUIDO SIN CANJE</span>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                                        La función correspondiente a este boleto ha concluido sin que se haya registrado la validación física en el punto de control.
                                    </p>
                                </div>
                            )}

                            {selectedTicket.status === 'refunded' && (
                                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[24px] mb-6 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 block mb-2">BOLETO REEMBOLSADO</span>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                                        El importe correspondiente a este acceso fue reembolsado al titular y el asiento asignado fue liberado en el recinto.
                                    </p>
                                </div>
                            )}

                            <div className="text-center mb-6 bg-white/5 py-2 rounded-lg border border-white/5">
                                <span className="text-[10px] font-mono font-bold text-white/70 tracking-[0.4em]">{selectedTicket.qrHash}</span>
                            </div>

                            {/* BOTÓN DE PRUEBA / SIMULACIÓN DE ESCANEO EN PUERTA */}
                            {(selectedTicket.status === 'active' || selectedTicket.status === 'confirmed') && (
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => handleSimulateScan(selectedTicket)}
                                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600/30 via-emerald-500/30 to-teal-500/30 border border-emerald-500 text-emerald-300 hover:bg-emerald-500 hover:text-black font-black uppercase text-[11px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                    >
                                        <Icon name="shieldCheck" size={16} />
                                        SIMULAR ESCANEO EN PUERTA (STAFF CHECK-IN)
                                    </button>
                                    <span className="block text-[9px] text-center text-white/40 mt-1 uppercase">
                                        Al presionar este botón simularás que el personal escaneó tu QR para activar la notificación y ver el evento en transcurso.
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-white/10 pt-6 mb-6">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Lugar</label>
                                    <p className="text-sm font-black text-white uppercase">{selectedTicket.venueName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Fecha</label>
                                    <p className="text-sm font-black text-white uppercase">{selectedTicket.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Horario</label>
                                    <p className="text-sm font-black text-white uppercase">{selectedTicket.time}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Zona</label>
                                    <p className="text-sm font-black text-yellow-400 uppercase">{selectedTicket.sectionName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Asiento</label>
                                    <p className="text-sm font-black text-cyan-400 uppercase">{selectedTicket.seatId}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                                <button 
                                    onClick={() => window.print()}
                                    className="flex-1 bg-white hover:bg-gray-100 text-black py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Icon name="printer" size={14} /> IMPRIMIR REGISTRO
                                </button>
                                {(selectedTicket.status === 'active' || selectedTicket.status === 'confirmed') && (
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm('¿ESTÁS SEGURO DE SOLICITAR UN REEMBOLSO? El asiento será liberado inmediatamente.')) {
                                                try {
                                                    await ticketAPI.refund({ ticket_id: selectedTicket.id });
                                                    showError('Reembolso procesado con éxito');
                                                    setSelectedTicket(null);
                                                    fetchTickets();
                                                } catch (e) {
                                                    showError(e.message || 'Error al procesar reembolso');
                                                }
                                            }
                                        }}
                                        className="px-6 border border-red-500/30 hover:border-red-500/50 text-red-500 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition-all"
                                    >
                                        REEMBOLSO
                                    </button>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedTicket(null)}
                            className="w-full bg-white/5 text-white/40 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all border-t border-white/5"
                        >
                            CERRAR VISTA
                        </button>
                    </div>
                </div>
            )}
        </div>
        </PermissionWall>
    );
};

export default UserTickets;
