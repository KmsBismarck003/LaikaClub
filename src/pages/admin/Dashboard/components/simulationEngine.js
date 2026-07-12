/**
 * simulationEngine.js
 * Motor de simulación financiera y predicciones de aforo basadas en ML para LaikaClub.
 */

export const MONTH_FACTORS = { 
    1: 0.8, 2: 0.85, 3: 0.95, 4: 1.0, 5: 1.05, 6: 1.0, 
    7: 0.9, 8: 0.95, 9: 1.0, 10: 1.1, 11: 1.18, 12: 1.25 
};

export const GENRE_FACTORS = { 
    general: 1.0,
    pop: 1.2, 
    reggaeton: 1.25, 
    rock: 1.1, 
    electronica: 1.15, 
    jazz: 0.85, 
    classical: 0.75 
};

/**
 * Calcula el ingreso proyectado para un evento existente.
 */
export function calculateSimulatedRevenue({
    simTickets,
    simPriceMultiplier,
    simMarketing,
    selectedModel,
    activeCoefs,
    slope
}) {
    let rev = activeCoefs.intercept;
    const coefs = activeCoefs.coef || [];
    
    if (selectedModel.includes('Polinomial')) {
        const term1 = coefs[0] !== undefined ? coefs[0] : (slope * 1.3);
        const term2 = coefs[1] !== undefined ? coefs[1] : -0.05;
        rev += term1 * simTickets + term2 * Math.pow(simTickets, 2);
    } else {
        const term1 = coefs[0] !== undefined ? coefs[0] : slope;
        rev += term1 * simTickets;
    }
    
    // Aplicar el multiplicador de precio
    rev = rev * simPriceMultiplier;
    
    // Impulso logarítmico opcional por publicidad
    if (simMarketing > 0) {
        rev = rev * (1.0 + 0.12 * Math.log1p(simMarketing / 1000));
    }
    
    return Math.max(0, Math.round(rev));
}

/**
 * Simula de forma completa un nuevo evento estimando asistencia e ingresos.
 */
export function calculateNewEventSimulation({
    newCapacity,
    newFunctions,
    newPrice,
    newMarketing,
    newFixedCosts,
    newMonth,
    newGenre,
    activeCoefs,
    selectedModel,
    slope
}) {
    const basePrice = slope || 150.0;
    const totalCap = newCapacity * newFunctions;
    
    // Decaimiento por múltiples funciones (el aforo promedio por día baja ligeramente al agregar más fechas)
    const functionSatur = Math.max(0.5, 1.0 - 0.08 * (newFunctions - 1));
    
    // Elasticidad de precio (la demanda cae si el precio supera el promedio histórico del club)
    const priceRatio = newPrice / basePrice;
    const priceFactor = Math.max(0.1, 1.45 - 0.55 * priceRatio);
    
    // Impulso de marketing en el aforo (crecimiento logarítmico con retornos decrecientes)
    const marketingFactor = 1.0 + 0.22 * Math.log1p(newMarketing / 1000);
    
    // Estacionalidad mensual
    const monthFactor = MONTH_FACTORS[newMonth] || 1.0;
    
    // Popularidad por Género/Categoría
    const genreFactor = GENRE_FACTORS[newGenre] || 1.0;
    
    // Asistencia estimada (ocupación base promedio del 60% bajo condiciones normales)
    const baseOccupancy = 0.60;
    let estTickets = totalCap * functionSatur * baseOccupancy * priceFactor * marketingFactor * monthFactor * genreFactor;
    estTickets = Math.round(Math.min(totalCap, Math.max(0, estTickets)));
    
    // Ingreso base calculado a través del modelo de regresión entrenado en Spark
    let rev = activeCoefs.intercept;
    const coefs = activeCoefs.coef || [];
    if (selectedModel.includes('Polinomial')) {
        const term1 = coefs[0] !== undefined ? coefs[0] : (slope * 1.3);
        const term2 = coefs[1] !== undefined ? coefs[1] : -0.05;
        rev += term1 * estTickets + term2 * Math.pow(estTickets, 2);
    } else {
        const term1 = coefs[0] !== undefined ? coefs[0] : slope;
        rev += term1 * estTickets;
    }
    
    // Escalar por la diferencia de precio real simulada
    const estimatedRevenue = Math.max(0, Math.round(rev * (newPrice / basePrice)));
    const totalCosts = Number(newFixedCosts) + Number(newMarketing);
    const netBenefit = estimatedRevenue - totalCosts;
    
    return {
        tickets: estTickets,
        revenue: estimatedRevenue,
        netBenefit: netBenefit,
        totalCosts: totalCosts
    };
}
