/**
 * SIMULADOR DE CONCURRENCIA Y PRUEBAS DE ESTRÉS (RACE CONDITIONS)
 * Simula 30 peticiones concurrentes simultáneas de usuarios intentando apartar
 * y comprar exactamente el mismo asiento en el mismo milisegundo.
 * Uso: node tests/performance/simulate_concurrency_stress.js
 */

const { SeatLockManager, processPurchaseIntent } = require('../unit/ticketBusinessLogic');

async function runConcurrencyStressSimulation() {
    console.log('\n===============================================================');
    console.log('   SIMULACIÓN DE CONCURRENCIA Y ESTRÉS - LAIKA CLUB');
    console.log('   Objetivo: Auditar prevención de doble compra y race conditions');
    console.log('===============================================================\n');

    const TOTAL_USERS = 200;
    const TARGET_EVENT_ID = 19;
    const TARGET_SEAT_ID = 'ZONA-VIP-01';
    const TICKET_PRICE = 1800.0;

    console.log(`[CONFIGURACIÓN]`);
    console.log(`- Usuarios virtuales concurrentes: ${TOTAL_USERS}`);
    console.log(`- Asiento objetivo:                ${TARGET_SEAT_ID} (Evento #${TARGET_EVENT_ID})`);
    console.log(`- Precio unitario:                 $${TICKET_PRICE} MXN\n`);

    const lockManager = new SeatLockManager(10000); // 10s de bloqueo
    const soldSeatsDatabase = new Set();

    let successfulLocks = 0;
    let rejectedLocks = 0;
    let doublePurchasesBlocked = 0;
    let confirmedPurchases = 0;

    const startTime = Date.now();

    // 1. Simulación de ráfaga concurrente de bloqueo de asiento
    console.log('--- FASE 1: RÁFAGA CONCURRENTE DE BLOQUEO DE ASIENTO ---');
    const lockPromises = Array.from({ length: TOTAL_USERS }, (_, i) => {
        const userId = `usuario-${i + 1}`;
        return new Promise((resolve) => {
            // Se lanzan en paralelo
            setImmediate(() => {
                const result = lockManager.lockSeat(userId, TARGET_EVENT_ID, TARGET_SEAT_ID, TICKET_PRICE);
                resolve({ userId, result });
            });
        });
    });

    const lockResults = await Promise.all(lockPromises);

    let winningUser = null;
    lockResults.forEach(({ userId, result }) => {
        if (result.success) {
            successfulLocks++;
            winningUser = userId;
            console.log(`  [ÉXITO] ${userId} logró bloquear el asiento ${TARGET_SEAT_ID}`);
        } else {
            rejectedLocks++;
        }
    });

    console.log(`\n  Resumen Fase 1:`);
    console.log(`  - Bloqueos exitosos autorizados: ${successfulLocks} (Debe ser exactamente 1)`);
    console.log(`  - Intentos de colisión bloqueados: ${rejectedLocks}`);

    // 2. Simulación de intento de compra final simultánea
    console.log('\n--- FASE 2: INTENTO CONCURRENTE DE COMPRA FINAL ---');
    const purchasePromises = Array.from({ length: TOTAL_USERS }, (_, i) => {
        const userId = `usuario-${i + 1}`;
        return new Promise((resolve) => {
            setImmediate(() => {
                // Solo quien tiene el lock debería poder comprar
                const isAvailable = lockManager.isSeatAvailable(TARGET_EVENT_ID, TARGET_SEAT_ID, userId);
                if (!isAvailable) {
                    resolve({ userId, allowed: false, reason: 'Asiento no reservado por este usuario' });
                    return;
                }

                // Intento de procesar la compra
                const cart = [{ eventId: TARGET_EVENT_ID, seatId: TARGET_SEAT_ID, price: TICKET_PRICE }];
                const purchaseResult = processPurchaseIntent(userId, cart, soldSeatsDatabase);

                if (purchaseResult.success) {
                    // Marcamos como vendido
                    soldSeatsDatabase.add(`${TARGET_EVENT_ID}:${TARGET_SEAT_ID}`);
                    resolve({ userId, allowed: true });
                } else {
                    resolve({ userId, allowed: false, reason: purchaseResult.reason });
                }
            });
        });
    });

    const purchaseResults = await Promise.all(purchasePromises);

    purchaseResults.forEach(({ userId, allowed, reason }) => {
        if (allowed) {
            confirmedPurchases++;
            console.log(`  [COMPRA CONFIRMADA] ${userId} completó la transacción exitosamente.`);
        } else {
            doublePurchasesBlocked++;
        }
    });

    const elapsedTimeMs = Date.now() - startTime;

    console.log('\n===============================================================');
    console.log('   REPORTE FINAL DE AUDITORÍA DE CONCURRENCIA');
    console.log('===============================================================');
    console.log(`Tiempo total de ejecución:           ${elapsedTimeMs} ms`);
    console.log(`Peticiones totales evaluadas:         ${TOTAL_USERS * 2}`);
    console.log(`Compras autorizadas:                 ${confirmedPurchases} (Exactamente 1 esperado)`);
    console.log(`Compras duplicadas evitadas:         ${doublePurchasesBlocked}`);
    console.log(`Garantía de Cero Doble Compra:       ${confirmedPurchases === 1 ? 'SUPERADA (100% SEGURO)' : 'FALLIDA'}`);
    console.log('===============================================================\n');

    if (confirmedPurchases !== 1) {
        process.exit(1);
    }
}

runConcurrencyStressSimulation();
