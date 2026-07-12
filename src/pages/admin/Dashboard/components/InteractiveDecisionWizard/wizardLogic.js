/**
 * Lógica y definiciones estructuradas para el Asistente Interactivo de Toma de Decisiones.
 * Define los objetivos de negocio, las preguntas amigables y sus respectivas opciones.
 */

export const WIZARD_OBJECTIVES = [
    {
        id: 'price_adjustment',
        title: 'Optimización de Precios',
        description: 'Determinar si es conveniente aumentar o reducir el costo de las entradas para este evento.',
        icon: 'Coins'
    },
    {
        id: 'future_outlook',
        title: 'Predicción de Asistencia',
        description: 'Proyectar cuántas personas asistirán finalmente al evento basándose en factores externos.',
        icon: 'TrendingUp'
    },
    {
        id: 'promotions_coupons',
        title: 'Estrategia de Promociones',
        description: 'Definir el mejor momento y descuento para lanzar cupones que impulsen las ventas.',
        icon: 'Tag'
    }
];

export const WIZARD_QUESTIONS = {
    price_adjustment: [
        {
            id: 'q1',
            label: '¿Cuál es su prioridad comercial para las entradas restantes?',
            description: 'Elija si prefiere priorizar un local completamente lleno o maximizar los ingresos por boleto.',
            options: [
                {
                    value: 'volume',
                    label: 'Asegurar asistencia total',
                    description: 'Preferencia por llenar el recinto, incluso si significa menor margen de ganancia por boleto.',
                    icon: 'Users'
                },
                {
                    value: 'margin',
                    label: 'Maximizar ingresos por entrada',
                    description: 'Preferencia por obtener el mayor beneficio posible de cada boleto restante.',
                    icon: 'DollarSign'
                }
            ]
        },
        {
            id: 'q2',
            label: '¿Cómo evalúa el ritmo de ventas actual?',
            description: 'Indique la velocidad con la que se están adquiriendo las entradas.',
            options: [
                {
                    value: 'low',
                    label: 'Ventas lentas',
                    description: 'El ritmo de compra es inferior al esperado para este punto del tiempo.',
                    icon: 'TrendingDown'
                },
                {
                    value: 'normal',
                    label: 'Ventas estables',
                    description: 'El ritmo de compra es regular y constante.',
                    icon: 'Activity'
                },
                {
                    value: 'high',
                    label: 'Ventas rápidas',
                    description: 'Gran interés del público, los boletos se venden velozmente.',
                    icon: 'Zap'
                }
            ]
        },
        {
            id: 'q3',
            label: '¿En qué días de la semana se llevará a cabo el evento?',
            description: 'El comportamiento de compra varía considerablemente los fines de semana.',
            options: [
                {
                    value: 'weekend',
                    label: 'Fin de semana',
                    description: 'El evento se celebra el viernes, sábado o domingo.',
                    icon: 'Calendar'
                },
                {
                    value: 'weekday',
                    label: 'Día laborable',
                    description: 'El evento se celebra de lunes a jueves.',
                    icon: 'Clock'
                }
            ]
        }
    ],
    future_outlook: [
        {
            id: 'q1',
            label: '¿Qué tan popular o conocido es el artista o temática?',
            description: 'Evalúe el impacto mediático o reputación del talento del evento.',
            options: [
                {
                    value: 'popular',
                    label: 'Alta popularidad',
                    description: 'El artista o temática está en tendencia o tiene gran número de seguidores.',
                    icon: 'Star'
                },
                {
                    value: 'niche',
                    label: 'Audiencia de nicho',
                    description: 'Dirigido a un público muy específico o artista en desarrollo.',
                    icon: 'Target'
                }
            ]
        },
        {
            id: 'q2',
            label: '¿Cuál es el pronóstico del clima o temporada del año?',
            description: 'El clima y la época del año influyen directamente en la afluencia.',
            options: [
                {
                    value: 'good',
                    label: 'Favorable',
                    description: 'Buen clima pronosticado o temporada alta de vacaciones/festividades.',
                    icon: 'Sun'
                },
                {
                    value: 'bad',
                    label: 'Desfavorable',
                    description: 'Pronóstico de lluvias intensas, frío extremo o temporada comercial baja.',
                    icon: 'CloudRain'
                }
            ]
        },
        {
            id: 'q3',
            label: '¿Existen otros eventos similares el mismo día?',
            description: 'Evalúe si hay competencia directa en la misma zona o rango horario.',
            options: [
                {
                    value: 'high_comp',
                    label: 'Competencia alta',
                    description: 'Hay otros espectáculos o conciertos masivos programados simultáneamente.',
                    icon: 'AlertTriangle'
                },
                {
                    value: 'low_comp',
                    label: 'Competencia baja',
                    description: 'No hay eventos significativos que compitan por su misma audiencia.',
                    icon: 'CheckCircle'
                }
            ]
        }
    ],
    promotions_coupons: [
        {
            id: 'q1',
            label: '¿Qué porcentaje del aforo se ha vendido hasta ahora?',
            description: 'Indique el nivel de ocupación actual del recinto.',
            options: [
                {
                    value: 'very_low',
                    label: 'Menos del 20%',
                    description: 'Ocupación crítica, la gran mayoría de los espacios siguen libres.',
                    icon: 'Percent'
                },
                {
                    value: 'medium',
                    label: 'Entre 20% y 50%',
                    description: 'Ocupación intermedia, avance moderado de ventas.',
                    icon: 'PieChart'
                },
                {
                    value: 'high',
                    label: 'Más del 50%',
                    description: 'Excelente avance, más de la mitad del aforo vendido.',
                    icon: 'Award'
                }
            ]
        },
        {
            id: 'q2',
            label: '¿Cuánto tiempo falta para la fecha del evento?',
            description: 'El tiempo restante determina la urgencia para aplicar descuentos.',
            options: [
                {
                    value: 'critical',
                    label: 'Menos de 7 días',
                    description: 'El evento ocurrirá esta semana. Margen de acción urgente.',
                    icon: 'AlertCircle'
                },
                {
                    value: 'medium_time',
                    label: 'De 7 a 30 días',
                    description: 'Falta entre una semana y un mes. Tiempo óptimo para campañas.',
                    icon: 'Calendar'
                },
                {
                    value: 'far',
                    label: 'Más de 30 días',
                    description: 'Aún queda suficiente tiempo. Planificación a largo plazo.',
                    icon: 'Compass'
                }
            ]
        },
        {
            id: 'q3',
            label: '¿Qué método de pago o canal prefiere incentivar?',
            description: 'Elija si desea impulsar transacciones digitales o fidelizar miembros.',
            options: [
                {
                    value: 'card',
                    label: 'Pago con tarjeta',
                    description: 'Incentivar transacciones en línea rápidas con tarjetas bancarias.',
                    icon: 'CreditCard'
                },
                {
                    value: 'cash',
                    label: 'Créditos o efectivo',
                    description: 'Facilitar la compra a través de monedero de la app o puntos de venta físicos.',
                    icon: 'Wallet'
                }
            ]
        }
    ]
};
