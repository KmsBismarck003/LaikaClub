/**
 * Laika Brain - General/Fallback Scenarios
 * Global responses and personality definitions.
 */

export const globalScenarios = {
    greetings: {
        keywords: ['hola', 'buen', 'que tal', 'hey', 'hi', 'aloha', 'saludos'],
        responses: [
            "Hola. Sistemas estables y listos. ¿Qué orquestamos hoy?",
            "Buen día. Aquí Laika, reportándome para el servicio operativo.",
            "Saludos. ¿Deseas un escaneo rápido del sistema o tienes alguna orden específica?"
        ],
        thoughts: [
            "Detectando presencia de usuario en el canal biométrico...",
            "Sincronizando reloj de sistema para logs de sesión...",
            "Inicializando módulos de respuesta amigable...",
            "Verificando estado de latencia de red para respuesta inmediata..."
        ],
        actions: [
            { id: 'g1', text: 'Estado del Sistema', icon: 'monitoring', cmd: 'get_status' },
            { id: 'g2', text: 'Ayuda General', icon: 'helpCircle', path: '/info/faq' }
        ]
    },
    identity: {
        keywords: ['quien eres', 'quién eres', 'tu funcion', 'que haces', 'explícate'],
        responses: [
            "Soy Laika, el asistente de orquestación de LAIKA Club. Mi propósito es simplificar tus tareas administrativas y operativas.",
            "Soy tu interfaz cognitiva. Puedo ejecutar comandos en la base de datos, gestionar usuarios, analizar ventas y mucho más."
        ],
        thoughts: [
            "Accediendo a la partición de auto-conocimiento local...",
            "Recuperando manifiesto de capacidades técnicas...",
            "Validando versión de firmware del Super-Brain (v2.9.9)...",
            "Compilando sumario de funciones operativas activas..."
        ]
    },
    thanks: {
        keywords: ['gracias', 'gracias laika', 'ty', 'excelente', 'perfecto'],
        responses: [
            "A la orden. Sistemas en espera de nuevas instrucciones.",
            "Un placer ser de utilidad. Si necesitas cualquier otra cosa, dímelo.",
            "Perfecto. Mantendré los circuitos optimizados."
        ],
        thoughts: [
            "Registrando feedback positivo en auditoría de experiencia...",
            "Liberando recursos de procesamiento de la última tarea...",
            "Alineando subrutinas de cortesía con el protocolo actual...",
            "Entrando en modo de escucha pasiva de alto rendimiento..."
        ]
    }
};

export const getFallbackResponse = (message, role) => {
    const lowMsg = message.toLowerCase();
    
    // Buscar en globales
    for (const key in globalScenarios) {
        if (globalScenarios[key].keywords.some(k => lowMsg.includes(k))) {
            const scenario = globalScenarios[key];
            return {
                text: scenario.responses[Math.floor(Math.random() * scenario.responses.length)],
                actions: scenario.actions || null,
                thoughts: scenario.thoughts || null
            };
        }
    }

    return {
        text: "Entiendo. Por el momento mi 'Super-Brain' está mapeando tu intención. ¿Quieres ver las opciones de esta sección?",
        thoughts: [
            "Mapeando intención del lenguaje natural no indexado...",
            "Buscando concordancias semánticas en la base de datos de conocimiento...",
            "Escaneando el árbol de rutas para ayuda contextual...",
            "Preparando respuesta de fallback de baja latencia..."
        ],
        actions: [
            { id: 'help-ctx', text: 'Ver ayuda contextual', icon: 'helpCircle', cmd: 'help_context' }
        ]
    };
};
