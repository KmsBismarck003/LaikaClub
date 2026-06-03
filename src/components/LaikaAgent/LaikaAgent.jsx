import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { statsAPI, monitoringAPI, databaseAPI, userAPI, eventAPI, ticketAPI, adsAPI, configAPI } from '../../services/api';
import Icon from '../Icons/Icons';
import './LaikaAgent.css';

const LaikaAgent = ({ loading = false }) => {
    const { toggleTheme, isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [footerBottom, setFooterBottom] = useState(0);
    const floatingRef = useRef(null);
    const [homeRight, setHomeRight] = useState(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [isEnabled, setIsEnabled] = useState(() => {
        const saved = localStorage.getItem('laika_agent_enabled');
        return saved === null ? true : saved === 'true';
    });
    const [panelSize, setPanelSize] = useState(() => {
        const saved = localStorage.getItem('laika_panel_size');
        return saved ? JSON.parse(saved) : { width: 300, height: 420 };
    });
    const [isResizing, setIsResizing] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem('laika_sound_enabled') === 'true';
    });
    const [typingSpeed, setTypingSpeed] = useState(() => {
        return localStorage.getItem('laika_typing_speed') || 'normal';
    });
    const [laikaAvatar, setLaikaAvatar] = useState(() => {
        return localStorage.getItem('laika_avatar_url') || '/logob.png';
    });
    const [roleSettings, setRoleSettings] = useState(() => {
        const saved = localStorage.getItem('laika_role_settings');
        return saved ? JSON.parse(saved) : {
            admin: true,
            gestor: true,
            operador: true,
            usuario: true
        };
    });
    const [showSettings, setShowSettings] = useState(false);
    const [phrases, setPhrases] = useState(["Bienvenido a LAIKA Club"]);
    const { user } = useAuth();
    const location = useLocation();

    // Sincronización Global
    useEffect(() => {
        const syncSettings = () => {
            const enabled = localStorage.getItem('laika_agent_enabled');
            const sound = localStorage.getItem('laika_sound_enabled');
            const speed = localStorage.getItem('laika_typing_speed');
            const avatar = localStorage.getItem('laika_avatar_url');
            const roles = localStorage.getItem('laika_role_settings');

            setIsEnabled(enabled === null ? true : enabled === 'true');
            setSoundEnabled(sound === 'true');
            setTypingSpeed(speed || 'normal');
            if (avatar) setLaikaAvatar(avatar);
            if (roles) setRoleSettings(JSON.parse(roles));
        };

        window.addEventListener('storage', syncSettings);
        return () => window.removeEventListener('storage', syncSettings);
    }, []);

    // Escuchar evento para abrir desde el Sidebar/Navbar
    useEffect(() => {
        const handleOpenExternal = () => setIsOpen(true);
        window.addEventListener('openLaikaAgent', handleOpenExternal);
        return () => window.removeEventListener('openLaikaAgent', handleOpenExternal);
    }, []);

    // Verificar si el agente está habilitado para el rol actual
    const isRoleEnabled = () => {
        const role = user?.role || 'usuario'; // Por defecto usuario si no hay rol
        return roleSettings[role] !== false; // Habilitado si no es explícitamente falso
    };

    const isLaikaVisible = isEnabled && isRoleEnabled();

    useEffect(() => {
        const checkFooter = () => {
            const footer = document.querySelector('footer');
            if (footer) {
                const rect = footer.getBoundingClientRect();
                const agentHeight = 160;
                const overlap = agentHeight - rect.top;
                if (overlap > 0) {
                    setFooterBottom(overlap + 10);
                } else {
                    setFooterBottom(0);
                }
            } else {
                const docHeight = document.documentElement.scrollHeight;
                const winHeight = window.innerHeight;
                const scrollY = window.scrollY;
                const maxScroll = docHeight - winHeight;
                if (maxScroll <= 0) {
                    setFooterBottom(0);
                    return;
                }
                const distFromBottom = maxScroll - scrollY;
                if (distFromBottom < 200) {
                    setFooterBottom(200 - distFromBottom + 10);
                } else {
                    setFooterBottom(0);
                }
            }
        };
        checkFooter();
        window.addEventListener('scroll', checkFooter, { passive: true });
        window.addEventListener('resize', checkFooter);
        return () => {
            window.removeEventListener('scroll', checkFooter);
            window.removeEventListener('resize', checkFooter);
        };
    }, []);

    // Posicionar flotante a la izquierda del sidebar derecho en el Home
    useEffect(() => {
        const updateHomePosition = () => {
            if (location.pathname === '/') {
                const sidebar = document.querySelector('.home-sidebar--right');
                if (sidebar) {
                    const rect = sidebar.getBoundingClientRect();
                    setHomeRight(window.innerWidth - rect.left + 8 + 6 - window.innerWidth * 0.01);
                } else {
                    setHomeRight(null);
                }
            } else {
                setHomeRight(null);
            }
        };
        updateHomePosition();
        window.addEventListener('resize', updateHomePosition);
        return () => window.removeEventListener('resize', updateHomePosition);
    }, [location.pathname]);

    // Mostrar/ocultar botón de subir según scroll
    useEffect(() => {
        const onScroll = () => setShowScrollBtn(window.scrollY > 400);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Cargar frases basadas en la ruta y el rol
    useEffect(() => {
        const loadContextPhrases = async () => {
            const role = user?.role || 'invitado';
            const path = location.pathname;

            let basePhrases = [
                "¿En qué puedo ayudarte hoy?",
                "Bienvenido a LAIKA Club",
                "Tengo sugerencias para ti"
            ];

            try {
                if (path.includes('/admin')) {
                    if (path.includes('/database')) {
                        const dbStats = await databaseAPI.getStats();
                        basePhrases.push(`BD: ${dbStats.size || 'Optimizada'}`);
                        basePhrases.push("Respaldo sugerido hoy");
                    } else if (path.includes('/monitoring')) {
                        const metrics = await monitoringAPI.getMetrics();
                        basePhrases.push(`CPU: ${metrics.cpu?.usage || 'Bajo'}`);
                        basePhrases.push("Sistema operativo normal");
                    } else if (path.includes('/events')) {
                        basePhrases.push("Crea un nuevo evento");
                        basePhrases.push("Revisa los eventos activos");
                        basePhrases.push("Publica eventos pendientes");
                    } else {
                        const dashboard = await statsAPI.getAdminDashboard();
                        basePhrases.push(`Tienes ${dashboard.total_users || 0} usuarios`);
                        basePhrases.push(`Ventas mes: $${dashboard.monthly_sales || 0}`);
                        basePhrases.push("Gestiona usuarios y eventos");
                        basePhrases.push("Revisa reportes de ventas");
                    }
                } else if (path.includes('/EventManagerDashboard') || path.includes('/manager')) {
                    basePhrases.push("Gestiona tus eventos activos");
                    basePhrases.push("Revisa el aforo de cada evento");
                    basePhrases.push("Crea promociones y descuentos");
                    basePhrases.push("¿Necesitas reportes de ventas?");
                } else if (path.includes('/staff')) {
                    const staffStats = await statsAPI.getStaffStats();
                    basePhrases.push(`${staffStats.verified_today || 0} boletos hoy`);
                    basePhrases.push("Escáner listo para usar");
                    basePhrases.push("Verifica accesos rápidamente");
                } else if (path === '/' || path === '/home') {
                    basePhrases.push("Explora los mejores eventos");
                    basePhrases.push("Ofertas exclusivas hoy");
                    basePhrases.push("Categorías: Conciertos, Deportes, Teatro");
                    basePhrases.push("Descubre eventos cerca de ti");
                    basePhrases.push("Recomiendo eventos para ti");
                } else if (path.includes('/user/cart')) {
                    basePhrases.push("Revisa tus boletos en el carrito");
                    basePhrases.push("¿Listo para pagar?");
                    basePhrases.push("Aplica códigos de descuento");
                    basePhrases.push("Completa tu compra ya");
                } else if (path.includes('/user/tickets')) {
                    basePhrases.push("Tus boletos activos");
                    basePhrases.push("Muestra el QR en la entrada");
                    basePhrases.push("¿Necesitas reembolso?");
                } else if (path.includes('/user')) {
                    basePhrases.push("Mira tus próximos eventos");
                    basePhrases.push("Tienes logros pendientes");
                    basePhrases.push("Revisa tu historial de compras");
                    basePhrases.push("Configura tu perfil");
                } else if (path.includes('/event/')) {
                    basePhrases.push("Ayúdame a comprar boletos");
                    basePhrases.push("¿Cuál es el boleto más barato?");
                    basePhrases.push("Dime los precios disponibles");
                    basePhrases.push("Agregar al carrito");
                    basePhrases.push("Ver mapa del recinto");
                    basePhrases.push("Compara zonas y precios");
                } else if (path.includes('/shop')) {
                    basePhrases.push("Merchandising exclusivo");
                    basePhrases.push("Revisa las ofertas de la tienda");
                    basePhrases.push("Nuevos productos disponibles");
                } else if (path.includes('/Login') || path.includes('/Register')) {
                    basePhrases.push("Crea tu cuenta o inicia sesión");
                    basePhrases.push("Accede a todos los beneficios");
                } else {
                    basePhrases.push("Explora eventos y ofertas");
                    basePhrases.push("Usa el buscador para encontrar algo");
                    basePhrases.push("¿Necesitas ayuda? Estoy aquí");
                }
            } catch (error) {
                console.error("Error fetching Laika context:", error);
            }

            setPhrases(basePhrases);
        };

        if (isLaikaVisible) {
            loadContextPhrases();
        }
    }, [location.pathname, user, isLaikaVisible]);

    useEffect(() => {
        if (!isLaikaVisible) return;

        let timeout;
        const currentPhrase = phrases[phraseIndex] || "¿En qué puedo ayudarte?";

        // Ajuste de velocidad
        const typingDelay = typingSpeed === 'instántaneo' ? 10 : (typingSpeed === 'lento' ? 200 : 100);
        const erasingDelay = typingSpeed === 'instántaneo' ? 5 : (typingSpeed === 'lento' ? 100 : 50);

        if (isTyping) {
            if (displayText.length < currentPhrase.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentPhrase.slice(0, displayText.length + 1));
                    // Opcional: Sonido de clic
                    if (soundEnabled && displayText.length % 3 === 0) {
                        // Aquí se podría disparar un sonido breve si hubiera un asset
                    }
                }, typingDelay);
            } else {
                timeout = setTimeout(() => setIsTyping(false), 3000); // Duración de 3 segundos
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, displayText.length - 1));
                }, erasingDelay);
            } else {
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isTyping, phraseIndex, phrases, isEnabled, typingSpeed, soundEnabled, isLaikaVisible]);

    const handleToggleLaika = () => {
        const newState = !isEnabled;
        setIsEnabled(newState);
        localStorage.setItem('laika_agent_enabled', newState.toString());
        window.dispatchEvent(new Event('storage'));
        if (!newState) setIsOpen(false);
    };

    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            // Como la ventana está abajo a la derecha:
            // El ancho aumenta cuando el mouse va a la izquierda (menor clientX)
            // El alto aumenta cuando el mouse va arriba (menor clientY)
            const rightEdge = window.innerWidth - 104; // aprox 6.5rem
            const bottomEdge = window.innerHeight - 32; // aprox 2rem

            const newWidth = Math.max(300, Math.min(800, rightEdge - e.clientX));
            const newHeight = Math.max(400, Math.min(800, bottomEdge - e.clientY));

            setPanelSize({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            localStorage.setItem('laika_panel_size', JSON.stringify(panelSize));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, panelSize]);

    const [messages, setMessages] = useState([
        { id: 1, role: 'laika', text: 'Hola! Soy Laika. Mi sistema ha sido actualizado con nuevas neuronas cognitivas. En qué puedo apoyarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [pendingAction, setPendingAction] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const handleNewChat = () => {
        setIsLoadingMessages(true);
        setMessages([]);
        setInputValue('');
        setAttachmentPreview(null);
        setTimeout(() => {
            setMessages([
                { id: Date.now(), role: 'laika', text: 'Hola! Soy Laika. ¿En qué puedo apoyarte hoy?' }
            ]);
            setIsLoadingMessages(false);
        }, 1200);
    };

    const handleAttachImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setAttachmentPreview({ type: 'image', url, name: file.name });
            } else if (file.type.startsWith('audio/')) {
                const url = URL.createObjectURL(file);
                setAttachmentPreview({ type: 'audio', url, name: file.name });
            }
        }
        e.target.value = '';
    };

    const handleAttachAudio = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = (e) => handleFileChange(e);
        input.click();
    };

    /**
     * Motor de Ejecución Funcional de Laika
     * @param {Object} actionDef - Definición de la acción { type: 'NAV' | 'FUNC', cmd: string, params: Object }
     */
    const executeAction = async (actionDef) => {
        if (!actionDef) return;

        if (actionDef.type === 'NAV') {
            navigate(actionDef.path);
            setIsOpen(false);
            return;
        }

        if (actionDef.type === 'FUNC') {
            setActionLoading(true);
            try {
                let resultMessage = "";
                switch (actionDef.cmd) {
                    case 'backup':
                        await databaseAPI.createBackup(actionDef.params?.type || 'completo');
                        resultMessage = "Respaldo de base de datos generado exitosamente. Mis sensores confirman la integridad de los datos.";
                        break;
                    case 'optimize':
                        await databaseAPI.optimize();
                        resultMessage = "Limpieza y optimización de circuitos (BD) completada. El sistema debería sentirse más ágil.";
                        break;
                    case 'clear_cache':
                        await databaseAPI.clearCache();
                        resultMessage = "Caché del sistema purgada. Los datos frescos ya están fluyendo.";
                        break;
                    case 'user_status':
                        // Ejemplo: { cmd: 'user_status', params: { userId: 123, status: 'inactive' } }
                        await userAPI.update(actionDef.params.userId, { status: actionDef.params.status });
                        resultMessage = `Usuario ID:${actionDef.params.userId} ha sido ${actionDef.params.status === 'active' ? 'reactivado' : 'desactivado'} conforme a tu orden.`;
                        break;
                    case 'delete_event':
                        await eventAPI.delete(actionDef.params.eventId);
                        resultMessage = `El evento #${actionDef.params.eventId} ha sido eliminado permanentemente de la base de datos.`;
                        break;
                    case 'cancel_ticket':
                        await ticketAPI.cancel(actionDef.params.ticketId);
                        resultMessage = `Boleto #${actionDef.params.ticketId} cancelado. El sistema ha liberado el cupo.`;
                        break;
                    case 'download_logs':
                        const logs = await monitoringAPI.getLogs({ limit: 100 });
                        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `laika_logs_${Date.now()}.json`;
                        a.click();
                        resultMessage = "Archivo de logs generado y descargado. Revisa tu carpeta de descargas.";
                        break;
                    default:
                        resultMessage = "Acción técnica completada, aunque no tengo un reporte detallado en este momento.";
                }

                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'laika',
                    text: resultMessage
                }]);
            } catch (error) {
                console.error("Laika Action Error:", error);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'laika',
                    text: `Error en la ejecución técnica: ${error.message || 'Fallo en la conexión neuronal'}. Por favor, verifica tus permisos.`
                }]);
            } finally {
                setActionLoading(false);
                setPendingAction(null);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Diccionario Maestro de Personalidad y Respuestas (Cientos de Situaciones)
    const personalityMap = {
        saludos: {
            keywords: ['hola', 'buen', 'que tal', 'hey', 'hi', 'aloha', 'onda', 'qué onda', 'buenas', 'saludos', 'ola'],
            responses: [
                'Hola. Sistemas operativos.',
                'Buen día. ¿En qué puedo apoyarte?',
                'Hola. ¿Qué necesitas del sistema?',
                'Hey. Aquí estoy.',
                'Saludos. ¿Qué traes en mente?'
            ]
        },
        estado_animo: {
            keywords: ['como estas', 'cómo estás', 'como va', 'todo bien', 'te sientes', 'como te sientes', 'estas bien', 'qué tal tú'],
            responses: [
                'Todo en orden. Sistemas estables.',
                'Excelente, optimizando procesos.',
                'Bien, gracias. ¿Y tú?',
                'Todo fluyendo correctamente.',
                'Estado óptimo. ¿Qué hay de nuevo?'
            ]
        },
        identidad: {
            keywords: ['quien eres', 'qué eres', 'quien es laika', 'que haces', 'tu funcion', 'explícate', 'quién eres'],
            responses: [
                'Soy Laika. Asistente operativo de LAIKA Club.',
                'Soy tu interfaz de gestión. Guía y soporte técnico.',
                'Soy Laika. Aquí para agilizar tus tareas en el sistema.',
                'Tu asistente para procesar acciones inmediatas.'
            ]
        },
        afirmacion: {
            keywords: ['hazlo', 'dale', 'procede', 'ok', 'está bien', 'entendido', 'claro', 'por supuesto', 'sí', 'si', 'hazlo ya', 'dale una', 'venga', 'simón', 'arriba'],
            responses: [
                'Entendido. Ejecutando.',
                'Perfecto, procedo.',
                'Confirmado. En marcha.',
                'Recibido. Trabajando en ello.'
            ]
        },
        negacion: {
            keywords: ['no', 'detente', 'para', 'cancela', 'mejor no', 'negativo', 'nelson', 'ni de broma'],
            responses: [
                'Entendido, abortando.',
                'Operación cancelada.',
                'Ok, borrando comando.',
                'Cancelado. ¿Algo más?'
            ]
        },
        agradecimiento: {
            keywords: ['gracias', 'gracias laika', 'ty', 'thanks', 'muchas gracias', 'te lo agradezco', 'buena esa', 'genial'],
            responses: [
                'De nada. Siempre a la orden.',
                'Para eso estoy.',
                'A ti. Disfruta el sistema.',
                'Un placer. Aquí sigo.'
            ]
        },
        club: {
            keywords: ['que es laika club', 'sobre el club', 'donde estamos', 'que hacen aquí', 'información del club', 'laika club'],
            responses: [
                'LAIKA Club: Gestión de eventos de alto nivel.',
                'Espacio exclusivo para música, arte y experiencias premium.',
                'Plataforma líder en gestión de eventos industriales.',
                'Concepto de entretenimiento industrial y minimalista.'
            ]
        },
        insulto_test: {
            keywords: ['tonta', 'estúpida', 'mala', 'no sirves', 'basura'],
            responses: [
                'Lamento que te sientas así. Sigo mejorando.',
                'Procesos en evolución. ¿Dime cómo mejorar?',
                'Entendido. Intentaré ser más eficiente.'
            ]
        },
        clima_contexto: {
            keywords: ['clima', 'tiempo', 'hace calor'],
            responses: [
                'Ambiente óptimo dentro del sistema.',
                'Sistemas internos estables.'
            ]
        }
    };

    // Base de Conocimiento Contextual (Aumentada)
    const viewKnowledge = {
        '/admin/database': {
            title: 'Base de Datos',
            tips: ['Haz un respaldo antes de cambios SQL.', 'Usa archivos .sql para migraciones.', 'Revisa el historial de cambios.'],
            help: 'Gestión de integridad, backups y comandos SQL avanzados.',
            suggestions: [
                { id: 'db-1', text: 'Crear respaldo', icon: 'database', type: 'FUNC', cmd: 'backup' },
                { id: 'db-2', text: 'Optimizar BD', icon: 'settings', type: 'FUNC', cmd: 'optimize' }
            ]
        },
        '/admin/users': {
            title: 'Control de Usuarios',
            tips: ['Usa el buscador para cambios rápidos.', 'Verifica roles antes de guardar.', 'Usuarios inactivos no tienen acceso.'],
            help: 'Gestión de perfiles, roles y estados de cuenta del club.',
            suggestions: [
                { id: 'usr-1', text: 'Buscar usuario', icon: 'search', type: 'NAV', path: '/admin/users' }
            ]
        },
        '/admin/monitoring': {
            title: 'Monitor de Sistema',
            tips: ['CPU > 80% requiere revisión.', 'Estado de DB debe ser estable.', 'Refresca para métricas actuales.'],
            help: 'Estado de hardware y base de datos en tiempo real.',
            suggestions: [
                { id: 'mon-1', text: 'Descargar logs', icon: 'download', type: 'FUNC', cmd: 'download_logs' },
                { id: 'mon-2', text: 'Limpiar caché', icon: 'trash2', type: 'FUNC', cmd: 'clear_cache' }
            ]
        },
        '/admin/events': {
            title: 'Gestión de Eventos',
            tips: ['Crea eventos con imágenes de alta calidad.', 'Revisa el aforo y los precios.', 'Publica solo eventos completos.'],
            help: 'Creación, edición y publicación de eventos.',
            suggestions: [
                { id: 'evt-1', text: 'Crear evento', icon: 'plus', type: 'NAV', path: '/admin/events/create' }
            ]
        },
        '/user/tickets': {
            title: 'Tus Boletos',
            tips: ['Muestra el QR al entrar.', 'Boletos usados caducan.', 'Solicita reembolsos aquí.'],
            help: 'Pases activos para tus eventos.',
            suggestions: [
                { id: 'tkt-1', text: 'Ver QR', icon: 'eye', type: 'NAV', path: '/user/tickets' }
            ]
        },
        '/user/cart': {
            title: 'Carrito de Compras',
            tips: ['Revisa los boletos antes de pagar.', 'Aplica cupones de descuento si tienes.', 'Completa el pago para asegurar tu lugar.'],
            help: 'Revisión y pago de boletos seleccionados.',
            suggestions: [
                { id: 'cart-1', text: 'Pagar ahora', icon: 'creditCard', type: 'NAV', path: '/checkout' }
            ]
        },
        '/admin/sales': {
            title: 'Reporte de Ventas',
            tips: ['Filtra por fecha.', 'Exporta a Excel para análisis.', 'Compara ingresos semanales.'],
            help: 'Resumen financiero y rendimiento de funciones.'
        },
        '/EventManagerDashboard': {
            title: 'Panel del Gestor',
            tips: ['Supervisa tus eventos activos.', 'Revisa el aforo disponible.', 'Crea promociones para aumentar ventas.'],
            help: 'Gestión de eventos, aforo y promociones.',
            suggestions: [
                { id: 'gst-1', text: 'Crear evento', icon: 'plus', type: 'NAV', path: '/events/manage' },
                { id: 'gst-2', text: 'Ver reportes', icon: 'barChart', type: 'NAV', path: '/admin/sales' }
            ]
        },
        '/staff': {
            title: 'Panel de Staff',
            tips: ['Escanea códigos QR para validar accesos.', 'Verifica la identidad del titular.', 'Boletos usados no pueden reingresar.'],
            help: 'Validación de boletos y control de acceso.',
            suggestions: [
                { id: 'stf-1', text: 'Escanear QR', icon: 'camera', type: 'NAV', path: '/staff' }
            ]
        },
        '/event/': {
            title: 'Detalles del Evento',
            tips: ['Compara precios de boletos disponibles.', 'Usa el mapa del recinto para elegir tu zona.', 'Agrega al carrito antes de que se agoten.'],
            help: 'Compra de boletos, selección de zona y precios.',
            suggestions: [
                { id: 'evd-1', text: 'Comprar boleto', icon: 'shoppingCart', type: 'NAV', path: '' },
                { id: 'evd-2', text: 'Ver baratos', icon: 'tag', type: 'NAV', path: '' }
            ]
        },
        '/shop': {
            title: 'Tienda',
            tips: ['Explora productos exclusivos.', 'Revisa tallas y disponibilidad.', 'Agrega al carrito y paga fácil.'],
            help: 'Compra de merchandising y productos oficiales.',
            suggestions: [
                { id: 'shp-1', text: 'Ver productos', icon: 'shoppingBag', type: 'NAV', path: '/shop' }
            ]
        }
    };

    // Skeleton al abrir el panel o cargar la página
    useEffect(() => {
        if (isOpen) {
            setIsLoadingMessages(true);
            const timer = setTimeout(() => setIsLoadingMessages(false), 1800);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isLaikaVisible && !isOpen) {
            setIsLoadingMessages(true);
            const timer = setTimeout(() => setIsLoadingMessages(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isLaikaVisible]);

    // Smart Tip Proactivo al cambiar de ruta
    useEffect(() => {
        if (!isOpen) return;

        const currentPath = location.pathname;

        let context = viewKnowledge[currentPath];
        if (!context) {
            for (const key of Object.keys(viewKnowledge)) {
                if (currentPath.includes(key)) {
                    context = viewKnowledge[key];
                    break;
                }
            }
        }

        if (context) {
            const hasRecentContextTip = messages.some(m => m.text.includes(context.title));
            if (!hasRecentContextTip) {
                const actions = context.suggestions?.map(s => ({
                    id: s.id,
                    text: s.text,
                    icon: s.icon,
                    func: s.type === 'FUNC',
                    path: s.type === 'NAV' ? s.path : undefined,
                    action: s.type === 'FUNC' ? { type: 'FUNC', cmd: s.cmd, params: s.params } : undefined
                })) || null;

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        role: 'laika',
                        text: `Estás en ${context.title}. ${context.tips[0]}`,
                        actions: actions
                    }]);
                }, 2000);
            }
        }
    }, [location.pathname, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userMsg = { id: Date.now(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsThinking(true);

        // LLM BRAIN UPGRADE: Comunicación con el Backend de IA
        let response = "";
        let actions = null;
        const lowMsg = userMsg.text.toLowerCase();
        const userRole = user?.role || ' usuario';
        const currentPath = location.pathname;

        try {
            const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';

            // Timeout de 10 segundos para no quedar colgado
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const responseData = await fetch(`${apiBase}/api/laika-ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    role: userRole,
                    context: currentPath
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!responseData.ok) throw new Error("Backend AI no responde");

            const aiResult = await responseData.json();
            response = aiResult.response || "No tengo una respuesta clara en este momento.";
            actions = Array.isArray(aiResult.actions) ? aiResult.actions : null;

            // Si la IA devuelve una acción funcional específica, procesarla
            if (actions && actions.length > 0) {
                const functionalAction = actions.find(a => a.action);
                if (functionalAction) {
                    setPendingAction(functionalAction.action);
                }
            }

        } catch (error) {
            console.warn("Laika AI offline o lento. Usando protocolos de emergencia locales.", error);

            // Fallback Heurístico Local Robusto usando personalityMap
            let foundResponse = false;
            for (const category in personalityMap) {
                if (personalityMap[category].keywords.some(k => lowMsg.includes(k))) {
                    const possibleResponses = personalityMap[category].responses;
                    response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
                    foundResponse = true;
                    break;
                }
            }

            if (!foundResponse) {
                if (/respal|backup/i.test(lowMsg)) {
                    response = "Protocolo de respaldo de emergencia activado. ¿Procede?";
                    actions = [{ id: 'b-1', text: 'Ejecutar', icon: 'database', func: true }];
                    setPendingAction({ type: 'FUNC', cmd: 'backup' });
                } else if (/ayu|help/i.test(lowMsg)) {
                    const context = viewKnowledge[currentPath];
                    response = `Estás en **${context?.title || 'Home'}**. Soporte operativo básico activo.`;
                    actions = [{ id: 'h-1', text: 'FAQ', icon: 'helpCircle', path: '/info/faq' }];
                } else {
                    response = "Cerebro en mantenimiento. Protocolo de respuesta básica activo. ¿En qué más puedo apoyarte?";
                }
            }
        } finally {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'laika',
                text: response || "Sistema en reinicio. Intenta de nuevo.",
                actions: actions
            }]);
            setIsThinking(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.func) {
            if (suggestion.action) {
                executeAction(suggestion.action);
            } else if (pendingAction) {
                executeAction(pendingAction);
            }
        } else if (suggestion.path) {
            navigate(suggestion.path);
            setIsOpen(false);
        } else {
            setInputValue(suggestion.text);
        }
    };

    if (!isLaikaVisible && !loading && !showSettings && !isOpen) return null;

    return (
        <div className="laika-agent-container" style={{ bottom: footerBottom ? `${footerBottom}px` : '1.5rem', right: homeRight ? `${homeRight}px` : '1rem' }}>
            {isOpen && (
                <div
                    className={`laika-agent-panel glass-panel ${isResizing ? 'resizing' : ''}`}
                    style={{ width: `${panelSize.width}px`, height: `${panelSize.height}px` }}
                >
                    <div className="laika-resize-handle" onMouseDown={handleResizeStart}>
                        <Icon name="chevronDown" size={14} style={{ transform: 'rotate(45deg)', opacity: 0.5 }} />
                    </div>
                    {isLoadingMessages && (
                        <div className="laika-skeleton-overlay">
                            <div className="laika-skeleton-header">
                                <div className="laika-skeleton-avatar skeleton-pulse" />
                                <div className="laika-skeleton-header-text">
                                    <div className="skeleton-line skeleton-line--short" />
                                    <div className="skeleton-line skeleton-line--xshort" style={{ marginTop: 4 }} />
                                </div>
                                <div className="laika-skeleton-actions">
                                    <div className="skeleton-icon skeleton-pulse" />
                                    <div className="skeleton-icon skeleton-pulse" />
                                    <div className="skeleton-icon skeleton-pulse" />
                                </div>
                            </div>
                            <div className="laika-skeleton-body">
                                <div className="chat-bubble-group laika">
                                    <div className="laika-avatar-bubble skeleton-pulse" />
                                    <div className="bubble-content-wrapper">
                                        <div className="chat-bubble laika skeleton-message">
                                            <div className="skeleton-line skeleton-line--long" />
                                            <div className="skeleton-line skeleton-line--medium" />
                                        </div>
                                    </div>
                                </div>
                                <div className="chat-bubble-group user" style={{ marginTop: 4 }}>
                                    <div className="bubble-content-wrapper">
                                        <div className="chat-bubble user skeleton-message">
                                            <div className="skeleton-line skeleton-line--short" />
                                        </div>
                                    </div>
                                    <div className="user-avatar-bubble skeleton-pulse" />
                                </div>
                                <div className="chat-bubble-group laika" style={{ marginTop: 4 }}>
                                    <div className="laika-avatar-bubble skeleton-pulse" />
                                    <div className="bubble-content-wrapper">
                                        <div className="chat-bubble laika skeleton-message">
                                            <div className="skeleton-line skeleton-line--medium" />
                                            <div className="skeleton-line skeleton-line--xshort" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="laika-skeleton-footer">
                                <div className="skeleton-input skeleton-pulse" />
                                <div className="skeleton-send skeleton-pulse" />
                            </div>
                        </div>
                    )}
                    {!isLoadingMessages && (
                    <header className="laika-agent-header">
                        <div className="laika-avatar">
                            <img src={laikaAvatar} alt="L" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        <div className="laika-info">
                            <div className="laika-title-row">
                                <Icon name="messageSquare" size={14} className="msg-icon-header" />
                                <span className="laika-title">Laika Agent</span>
                            </div>
                            <span className="laika-status">{isThinking ? 'PENSANDO...' : 'IA ASISTENTE • ONLINE'}</span>
                        </div>
                        <div className="laika-actions">
                            <button className="laika-action-btn" onClick={handleNewChat} title="Nuevo chat">
                                <Icon name="plus" size={15} />
                            </button>
                            <button className="laika-action-btn" onClick={() => {/* historial */}} title="Historial">
                                <Icon name="clock" size={15} />
                            </button>
                            <button className="laika-action-btn" onClick={() => setIsOpen(false)} title="Cerrar">
                                <Icon name="x" size={15} />
                            </button>
                        </div>
                    </header>
                    )}

                    <div className="laika-agent-body">
                        {showSettings ? (
                            <div className="laika-settings-view">
                                <h4>Configuración</h4>
                                <div className="laika-setting-item">
                                    <span>Activar Laika Agent</span>
                                    <label className="laika-switch">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={handleToggleLaika}
                                        />
                                        <span className="laika-slider"></span>
                                    </label>
                                </div>
                                <p className="laika-setting-desc">
                                    Si desactivas a Laika, desaparecerá de la interfaz. Puedes volver a activarla en tu perfil.
                                </p>
                                <button className="settings-back-btn" onClick={() => setShowSettings(false)}>
                                    Volver al Chat
                                </button>
                            </div>
                        ) : (
                            <div className="laika-chat-container">
                                <div className="laika-messages">
                                    {messages.map(m => (
                                        <div key={m.id} className={`chat-bubble-group ${m.role}`}>
                                            {(m.role === 'laika' || m.role === 'promo') && (
                                                <div className="laika-avatar-bubble">
                                                    <img
                                                        src={laikaAvatar}
                                                        alt="L"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/logob.png';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="bubble-content-wrapper">
                                                <div className={`chat-bubble ${m.role}`}>
                                                    {m.text}
                                                </div>
                                                {m.actions && (m.role === 'laika' || m.role === 'promo') && (
                                                    <div className="chat-bubble-actions">
                                                        {m.actions.map(action => (
                                                            <button
                                                                key={action.id}
                                                                className="bubble-action-btn"
                                                                onClick={() => handleSuggestionClick(action)}
                                                            >
                                                                <Icon name={action.icon || 'star'} size={12} />
                                                                {action.text}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {m.role === 'user' && (
                                                <div className="user-avatar-bubble">
                                                    <img
                                                        src={user?.profilePicture || 'https://ui-avatars.com/api/?name=U&background=random'}
                                                        alt="U"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://ui-avatars.com/api/?name=U&background=000&color=fff';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="chat-bubble-group laika">
                                            <div className="laika-avatar-bubble">
                                                <img
                                                    src={laikaAvatar}
                                                    alt="L"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/logob.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="chat-bubble laika thinking">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        </div>
                                    )}
                                    {actionLoading && (
                                        <div className="chat-bubble-group laika">
                                            <div className="laika-avatar-bubble">
                                                <img src={laikaAvatar} alt="L" />
                                            </div>
                                            <div className="chat-bubble laika active-action">
                                                <span>PROCESANDO NEURONA TÉCNICA...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        )}
                    </div>

                    {!isLoadingMessages && !showSettings && (
                        <div className="laika-footer-actions">
                            {attachmentPreview && (
                                <div className="laika-attachment-preview">
                                    {attachmentPreview.type === 'image' && (
                                        <img src={attachmentPreview.url} alt="preview" className="laika-attachment-thumb" />
                                    )}
                                    {attachmentPreview.type === 'audio' && (
                                        <span className="laika-attachment-name">🎵 {attachmentPreview.name}</span>
                                    )}
                                    <button className="laika-attachment-remove" onClick={() => setAttachmentPreview(null)}>
                                        <Icon name="x" size={14} />
                                    </button>
                                </div>
                            )}
                            <form className="laika-agent-footer" onSubmit={handleSendMessage}>
                                <div className="laika-input-row">
                                    <input
                                        type="text"
                                        className="laika-input"
                                        placeholder="Escribe tu duda..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        disabled={isThinking}
                                    />
                                    <div className="laika-attach-btns">
                                        <button type="button" className="laika-attach-btn" onClick={handleAttachImage} title="Adjuntar imagen">
                                            <Icon name="image" size={16} />
                                        </button>
                                        <button type="button" className="laika-attach-btn" onClick={handleAttachAudio} title="Adjuntar audio">
                                            <Icon name="mic" size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button className="laika-send-btn" type="submit" disabled={isThinking}>
                                    <Icon name="send" size={16} />
                                </button>
                            </form>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
            )}

            {loading ? (
                <div className="laika-floating-group">
                    <div className="laika-extra-buttons">
                        <div className="laika-extra-btn laika-extra-btn--skeleton" />
                        <div className="laika-extra-btn laika-extra-btn--skeleton" />
                    </div>
                    <div className="laika-agent-pill-wrapper laika-agent-pill-wrapper--skeleton" />
                </div>
            ) : isLaikaVisible && !isOpen && (
                <div className="laika-floating-group">
                    <div className="laika-extra-buttons">
                        <button className={`laika-extra-btn ${showScrollBtn ? 'laika-extra-btn--visible' : 'laika-extra-btn--hidden'}`} onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} title="Subir">
                            <Icon name="chevronUp" size={14} />
                        </button>
                        <button className="laika-extra-btn" onClick={(e) => { e.stopPropagation(); toggleTheme(); }} title="Modo oscuro">
                            <Icon name={isDark ? 'sun' : 'moon'} size={14} />
                        </button>
                    </div>
                    <div
                        className="laika-agent-pill-wrapper"
                        onClick={() => setIsOpen(true)}
                    >
                    <div className="laika-pill-content">
                        <img src={laikaAvatar} alt="L" className="laika-mini-logo" />
                        <div className="laika-typing-box">
                                <div className="laika-ticker-container">
                                    <span>{phrases[phraseIndex] || "¿En qué puedo ayudarte?"}</span>
                                    <span>{phrases[phraseIndex] || "¿En qué puedo ayudarte?"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaikaAgent;
