/**
 * Utility containing SOLID algorithms to calculate and generate business-oriented
 * decision recommendations from Big Data analysis results.
 */

// Helper to translate event category codes to friendly Spanish names
export const translateCategory = (cat) => {
    if (!cat) return 'General';
    const mapping = {
        'concert': 'Conciertos',
        'festival': 'Festivales',
        'theater': 'Teatro y Cultura',
        'sport': 'Deportes',
        'other': 'Otros Eventos',
        'general': 'General'
    };
    return mapping[cat.toLowerCase()] || cat;
};

/**
 * Calculates performance metrics grouped by category.
 * @param {Array} events - The list of events from the API.
 * @returns {Array} List of categories with calculated metrics.
 */
export const calculateCategoryPerformance = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) return [];

    const categoryMap = {};

    events.forEach(evt => {
        const cat = evt.category || 'General';
        if (!categoryMap[cat]) {
            categoryMap[cat] = {
                category: cat,
                name: translateCategory(cat),
                eventsCount: 0,
                ticketsSold: 0,
                totalTickets: 0,
                revenueReal: 0,
                revenuePredicted: 0,
            };
        }

        const metrics = categoryMap[cat];
        metrics.eventsCount += 1;
        metrics.ticketsSold += evt.tickets_sold || 0;
        metrics.totalTickets += evt.total_tickets || 0;
        metrics.revenueReal += (evt.tickets_sold || 0) * (evt.price || 0);
        metrics.revenuePredicted += (evt.predicted_tickets_sold || 0) * (evt.price || 0);
    });

    return Object.values(categoryMap).map(item => ({
        ...item,
        avgOccupancy: item.totalTickets > 0 ? Math.round((item.ticketsSold / item.totalTickets) * 100) : 0,
        avgPredictedOccupancy: item.totalTickets > 0 ? Math.round(((item.revenuePredicted / (item.totalTickets * (item.revenueReal / (item.ticketsSold || 1) || 1))) * 100) || 0) : 0 // Fallback estimate
    })).sort((a, b) => b.revenueReal - a.revenueReal);
};

/**
 * Analyzes categories and returns the most successful genre/category recommendations.
 * @param {Array} events - List of events.
 * @param {Array} profitableSlots - Profitability slots by days/hours.
 * @returns {Object} Recommendation recommendations.
 */
export const getDemandRecommendation = (events, profitableSlots) => {
    const performances = calculateCategoryPerformance(events);
    if (performances.length === 0) {
        return {
            hasData: false,
            recommendationText: 'No hay suficientes datos de eventos para realizar recomendaciones. Registra más eventos y ventas.'
        };
    }

    const topCategory = performances[0];
    
    // Find best slot
    let bestSlotText = '';
    if (profitableSlots && Array.isArray(profitableSlots) && profitableSlots.length > 0) {
        const bestSlot = profitableSlots[0];
        bestSlotText = ` los <strong>${bestSlot.day_name}s a las ${bestSlot.start_hour}:00 hrs</strong> (que históricamente promedian un ingreso de $${Math.round(bestSlot.estimated_revenue).toLocaleString()} COP).`;
    } else {
        bestSlotText = ' los fines de semana en horario nocturno.';
    }

    // Build the recommendation text
    let recommendationText = `Con base en el comportamiento de tus ventas, descubrimos que el tipo de evento más solicitado y rentable es el género de <strong>${topCategory.name}</strong>, el cual registra un promedio de ocupación de <strong>${topCategory.avgOccupancy}%</strong> y ha recaudado un total de <strong>$${Math.round(topCategory.revenueReal).toLocaleString()} COP</strong>.`;
    recommendationText += `<br/><br/><strong>Sugerencia de decisión:</strong> Te recomendamos programar tus próximos eventos de tipo <strong>${topCategory.name}</strong> preferentemente${bestSlotText} Evita fijar precios excesivamente altos para asegurar una ocupación superior al 85% y maximizar la rentabilidad.`;

    return {
        hasData: true,
        topCategory,
        performances,
        recommendationText
    };
};

/**
 * Analyzes prospecting leads and returns actionable B2B recommendations.
 * @param {Object} marketRecommendation - General market recommendation from backend.
 * @param {Array} leads - The potential venue leads.
 * @returns {String} HTML formatted recommendation.
 */
export const getB2BDecisionRecommendation = (marketRecommendation, leads) => {
    if (!marketRecommendation || !leads || leads.length === 0) {
        return 'No hay datos de prospección B2B disponibles en este momento.';
    }

    // Filter high-priority lookalikes
    const highLeads = leads.filter(l => l.match_score >= 85);
    const bestLead = leads[0];

    let advice = '';
    if (highLeads.length > 0) {
        advice = `Hemos detectado <strong>${highLeads.length} establecimiento(s)</strong> con un porcentaje de similitud excelente (Lookalike Perfecto >= 85%) con tus recintos de mayor recaudación.`;
        advice += `<br/>Te sugerimos priorizar el contacto comercial con <strong>${bestLead.name}</strong> (${bestLead.location}), ya que tiene un <strong>${bestLead.match_score}% de afinidad</strong> con tus operaciones exitosas y cuenta con una gran capacidad de <strong>${bestLead.capacity.toLocaleString()} personas</strong>.`;
    } else {
        advice = `El prospecto más viable analizado es <strong>${bestLead.name}</strong> en <strong>${bestLead.location}</strong> con un <strong>${bestLead.match_score}% de coincidencia</strong>.`;
    }

    // General segment recommendation
    const recommendedCat = marketRecommendation.recommended_category || 'Club/Foro';
    const recommendedState = marketRecommendation.recommended_state || 'CDMX';
    const revenueGen = marketRecommendation.revenue_generated || 0;

    let segmentAdvice = `<br/><br/><strong>Estrategia de Expansión recomendada:</strong> Dado que los recintos de tipo <strong>${recommendedCat}</strong> en <strong>${recommendedState}</strong> son los que te han dejado mayores ganancias (acumulando <strong>$${Math.round(revenueGen).toLocaleString()} COP</strong> en la plataforma), te recomendamos concentrar tu campaña comercial en ofrecer la plataforma de boletaje en este segmento geográfico y de negocio.`;

    return `${advice}${segmentAdvice}`;
};
