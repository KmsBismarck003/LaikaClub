/**
 * ML & BIG DATA ANALYTICS - MOTOR DE LÓGICA Y ALGORITMOS MATEMÁTICOS (UNIT TESTS)
 * Contiene las implementaciones de validación algorítmica para:
 * 1. Regresión Lineal y Polinomial (Pendiente, Intercepto, R², MAE, RMSE)
 * 2. Árboles de Decisión y Precios Dinámicos (Tarifa Dinámica vs. Promoción)
 * 3. K-Means, Distancias Euclidianas y Método del Codo (Elbow SSE)
 * 4. Detección de Anomalías e Inferencia Antifraude/Bots (Isolation Heuristics)
 * 5. Scoring de Abandono (Churn) y Segmentación RFM
 * 6. Saneamiento KDD (Deduplicación e Imputación de Nulos)
 * 7. Reconciliación Financiera y Balances de MATIS BI
 */

/**
 * 1. REGRESIÓN LINEAL Y MÉTRICAS DE CALIDAD
 */
function calculateLinearRegression(points) {
    if (!Array.isArray(points) || points.length < 2) {
        return { status: 'insufficient_data', slope: 0, intercept: 0, r2: 0, mae: 0, rmse: 0 };
    }

    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

    for (let i = 0; i < n; i++) {
        const x = points[i].x;
        const y = points[i].y;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
        sumYY += y * y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    const sxx = sumXX - (sumX * sumX) / n;
    const sxy = sumXY - (sumX * sumY) / n;
    const syy = sumYY - (sumY * sumY) / n;

    let slope = 0;
    let intercept = meanY;

    if (sxx !== 0) {
        slope = sxy / sxx;
        intercept = meanY - slope * meanX;
    }

    let ssRes = 0;
    let sumAbs = 0;
    for (let i = 0; i < n; i++) {
        const x = points[i].x;
        const y = points[i].y;
        const yPred = slope * x + intercept;
        ssRes += Math.pow(y - yPred, 2);
        sumAbs += Math.abs(y - yPred);
    }

    const r2 = syy !== 0 ? Math.max(0, Math.min(1, 1 - (ssRes / syy))) : 1.0;
    const mae = sumAbs / n;
    const rmse = Math.sqrt(ssRes / n);

    return {
        status: 'success',
        slope: Math.round(slope * 100) / 100,
        intercept: Math.round(intercept * 100) / 100,
        r2: Math.round(r2 * 1000) / 1000,
        mae: Math.round(mae * 100) / 100,
        rmse: Math.round(rmse * 100) / 100,
        pointsCount: n
    };
}

/**
 * 2. CLASIFICACIÓN DE PRECIOS DINÁMICOS Y ÁRBOL DE DECISIÓN
 */
function classifyEventPricing(occupancyPct, basePrice, velocityFactor = 1.0) {
    if (basePrice == null || basePrice <= 0) {
        return { classification: 'Inválido', recommendation: 'Precio base requerido', multiplier: 1.0 };
    }

    // Regla 1: Alta demanda y precio premium
    if (occupancyPct >= 60.0 && basePrice > 30.0 && velocityFactor >= 0.8) {
        return {
            classification: 'Tarifa Dinámica',
            recommendation: 'Alta demanda sostenida. Incrementar precio 15% para maximizar margen.',
            suggestedPrice: Math.round(basePrice * 1.15 * 100) / 100,
            multiplier: 1.15,
            level: 'high_demand'
        };
    }

    // Regla 2: Baja ocupación a precio comercial
    if (occupancyPct < 30.0 && basePrice > 30.0) {
        return {
            classification: 'Promoción / Descuento',
            recommendation: 'Baja demanda. Aplicar promoción 2x1 o descuento flash de 15% para acelerar venta.',
            suggestedPrice: Math.round(basePrice * 0.85 * 100) / 100,
            multiplier: 0.85,
            level: 'low_demand'
        };
    }

    // Regla 3: Ritmo promedio estándar
    return {
        classification: 'Precio Estable',
        recommendation: 'Demanda dentro de parámetros esperados. Mantener precio base.',
        suggestedPrice: basePrice,
        multiplier: 1.0,
        level: 'stable'
    };
}

/**
 * 3. K-MEANS: ASIGNACIÓN DE CLÚSTERES Y DISTANCIA EUCLIDIANA
 */
function euclideanDistance(pointA, pointB) {
    let sum = 0;
    for (let i = 0; i < pointA.length; i++) {
        sum += Math.pow(pointA[i] - pointB[i], 2);
    }
    return Math.sqrt(sum);
}

function assignClusters(dataPoints, centroids) {
    if (!centroids || centroids.length === 0) return [];

    return dataPoints.map((point) => {
        let minDistance = Infinity;
        let clusterIdx = 0;

        for (let c = 0; c < centroids.length; c++) {
            const dist = euclideanDistance(point, centroids[c]);
            if (dist < minDistance) {
                minDistance = dist;
                clusterIdx = c;
            }
        }
        return { point, cluster: clusterIdx, distance: minDistance };
    });
}

function calculateClusterSSE(clusterAssignments, centroids) {
    let sse = 0;
    for (const item of clusterAssignments) {
        const centroid = centroids[item.cluster];
        sse += Math.pow(euclideanDistance(item.point, centroid), 2);
    }
    return Math.round(sse * 100) / 100;
}

/**
 * 4. DETECCIÓN DE ANOMALÍAS, BOTS Y PATRONES DE REVENTA
 */
function evaluateBotTransactionRisk({ requestsPerMinute, priceDeviationRatio, sameCardAttempts, hasForeignBin }) {
    let riskScore = 0;
    const flags = [];

    // Frecuencia anómala de compra (>3 compras en 1 minuto)
    if (requestsPerMinute >= 4) {
        riskScore += 45;
        flags.push('HIGH_VELOCITY_PURCHASE');
    }

    // Desviación extrema de precio (reventa o manipulación de pasarela)
    if (priceDeviationRatio > 2.5 || priceDeviationRatio < 0.4) {
        riskScore += 35;
        flags.push('EXTREME_PRICE_DEVIATION');
    }

    // Múltiples intentos con misma tarjeta
    if (sameCardAttempts >= 3) {
        riskScore += 20;
        flags.push('REPEATED_CARD_USAGE');
    }

    if (hasForeignBin) {
        riskScore += 10;
        flags.push('FOREIGN_BIN_UNUSUAL');
    }

    return {
        riskScore: Math.min(100, riskScore),
        isAnomaly: riskScore >= 50,
        level: riskScore >= 75 ? 'CRITICAL' : (riskScore >= 50 ? 'WARNING' : 'SAFE'),
        flags
    };
}

/**
 * 5. SCORING DE ABANDONO (CHURN) Y RECTANGULO RFM
 */
function evaluateUserChurnRisk(daysSinceLogin, daysSincePurchase, ticketsBought, totalSpent) {
    // Si nunca ha comprado o lleva más de 60 días inactivo
    const inactivityDays = Math.max(daysSinceLogin || 0, daysSincePurchase || 0);

    if (inactivityDays >= 60) {
        return {
            riskLevel: 'High',
            actionRequired: 'EMITIR_CUPON_RETENCION',
            discountEligible: true,
            recommendedDiscount: 15.0,
            daysInactive: inactivityDays
        };
    } else if (inactivityDays >= 30) {
        return {
            riskLevel: 'Medium',
            actionRequired: 'PUSH_NOTIFICATION_RECORDATORIO',
            discountEligible: false,
            recommendedDiscount: 0,
            daysInactive: inactivityDays
        };
    }

    return {
        riskLevel: 'Low',
        actionRequired: 'NINGUNA',
        discountEligible: false,
        recommendedDiscount: 0,
        daysInactive: inactivityDays
    };
}

/**
 * 6. SANEAMIENTO KDD (Deduplicación e Imputación de Nulos)
 */
function sanitizeDataset(rows, defaultPrice = 50.0, defaultCategory = 'General') {
    if (!Array.isArray(rows)) return { cleanedRows: [], duplicatesRemoved: 0, nullsImputed: 0 };

    const seenIds = new Set();
    const cleanedRows = [];
    let duplicatesRemoved = 0;
    let nullsImputed = 0;

    for (const r of rows) {
        if (r.id != null) {
            if (seenIds.has(r.id)) {
                duplicatesRemoved++;
                continue;
            }
            seenIds.add(r.id);
        }

        const copy = { ...r };

        // Imputación de precio
        if (copy.price == null || copy.price <= 0) {
            copy.price = defaultPrice;
            nullsImputed++;
        }

        // Imputación de categoría
        if (!copy.category || copy.category.trim() === '') {
            copy.category = defaultCategory;
            nullsImputed++;
        }

        cleanedRows.push(copy);
    }

    return {
        cleanedRows,
        totalBefore: rows.length,
        totalAfter: cleanedRows.length,
        duplicatesRemoved,
        nullsImputed
    };
}

/**
 * 7. RECONCILIACIÓN FINANCIERA MATIS BI
 */
function reconcileMatisFinancialTotals(tickets, payments) {
    const totalTicketIncome = tickets
        .filter(t => t.status !== 'cancelled')
        .reduce((sum, t) => sum + (Number(t.price) || 0), 0);

    const totalPaymentCollected = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const discrepancy = Math.abs(totalTicketIncome - totalPaymentCollected);
    const isBalanced = discrepancy < 0.01;

    return {
        totalTicketIncome: Math.round(totalTicketIncome * 100) / 100,
        totalPaymentCollected: Math.round(totalPaymentCollected * 100) / 100,
        discrepancy: Math.round(discrepancy * 100) / 100,
        isBalanced
    };
}

module.exports = {
    calculateLinearRegression,
    classifyEventPricing,
    euclideanDistance,
    assignClusters,
    calculateClusterSSE,
    evaluateBotTransactionRisk,
    evaluateUserChurnRisk,
    sanitizeDataset,
    reconcileMatisFinancialTotals
};

