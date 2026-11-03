/**
 * LÓGICA REACTIVA DEL DASHBOARD DE PRUEBAS - LAIKA CLUB
 * Maneja autodetección, streaming de SSE en tiempo real y métricas en vivo.
 */

let allTests = [];
let currentFilter = 'all';
let isRunning = false;
let activeEventSource = null;
let timerInterval = null;

// Elementos DOM
const gatewayStatusPill = document.getElementById('gatewayStatusPill');
const gatewayStatusText = document.getElementById('gatewayStatusText');
const metricTotalTests = document.getElementById('metricTotalTests');
const metricGatewayStatus = document.getElementById('metricGatewayStatus');
const metricLastDuration = document.getElementById('metricLastDuration');
const metricLastStatus = document.getElementById('metricLastStatus');
const refreshTestsBtn = document.getElementById('refreshTestsBtn');
const categoryTabs = document.getElementById('categoryTabs');
const testCardsContainer = document.getElementById('testCardsContainer');
const suiteCountBadge = document.getElementById('suiteCountBadge');

const terminalBody = document.getElementById('terminalBody');
const consoleTitle = document.getElementById('consoleTitle');
const execTimer = document.getElementById('execTimer');
const consoleFooter = document.getElementById('consoleFooter');
const footerStatusBadge = document.getElementById('footerStatusBadge');
const footerMetaText = document.getElementById('footerMetaText');
const copyConsoleBtn = document.getElementById('copyConsoleBtn');
const clearConsoleBtn = document.getElementById('clearConsoleBtn');

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
    loadTests();
    checkGatewayStatus();
    setInterval(checkGatewayStatus, 10000); // Polling cada 10s del Gateway

    // Eventos
    refreshTestsBtn.addEventListener('click', () => {
        refreshTestsBtn.classList.add('loading');
        loadTests().finally(() => refreshTestsBtn.classList.remove('loading'));
    });

    categoryTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.category;
        renderTestCards();
    });

    clearConsoleBtn.addEventListener('click', clearConsole);
    copyConsoleBtn.addEventListener('click', copyConsoleOutput);
});

/**
 * Carga y autodetecta las pruebas desde el backend
 */
async function loadTests() {
    try {
        const res = await fetch('/api/tests');
        const data = await res.json();
        if (data.success) {
            allTests = data.tests;
            metricTotalTests.textContent = data.count;
            renderCategoryTabs();
            renderTestCards();
        }
    } catch (err) {
        testCardsContainer.innerHTML = `
            <div class="loading-state" style="color: var(--status-error);">
                Error al autodetectar pruebas: ${err.message}
            </div>
        `;
    }
}

/**
 * Renderiza dinámicamente las pestañas de categorías según las pruebas detectadas
 */
function renderCategoryTabs() {
    const categoriesMap = {};
    allTests.forEach(t => {
        const cat = t.category || 'Otros';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    const categories = Object.keys(categoriesMap);
    let tabsHtml = `<button class="tab-btn ${currentFilter === 'all' ? 'active' : ''}" data-category="all">Todas (${allTests.length})</button>`;

    categories.forEach(cat => {
        const count = categoriesMap[cat];
        tabsHtml += `<button class="tab-btn ${currentFilter === cat ? 'active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)} (${count})</button>`;
    });

    categoryTabs.innerHTML = tabsHtml;
}

/**
 * Monitoreo del Gateway
 */
async function checkGatewayStatus() {
    try {
        const res = await fetch('/api/gateway-status');
        const data = await res.json();
        const dot = gatewayStatusPill.querySelector('.status-dot');

        if (data.online) {
            dot.className = 'status-dot online';
            gatewayStatusText.textContent = 'Pilgrim Gateway: Online';
            metricGatewayStatus.textContent = 'Online';
            metricGatewayStatus.className = 'metric-value status-online';
        } else {
            dot.className = 'status-dot offline';
            gatewayStatusText.textContent = 'Pilgrim Gateway: Offline';
            metricGatewayStatus.textContent = 'Offline';
            metricGatewayStatus.className = 'metric-value';
            metricGatewayStatus.style.color = 'var(--status-error)';
        }
    } catch (_) {
        const dot = gatewayStatusPill.querySelector('.status-dot');
        dot.className = 'status-dot offline';
        gatewayStatusText.textContent = 'Pilgrim Gateway: Offline';
    }
}

/**
 * Renderiza el listado Bento de pruebas según el filtro activo
 */
function renderTestCards() {
    const filtered = currentFilter === 'all'
        ? allTests
        : allTests.filter(t => t.category === currentFilter);

    suiteCountBadge.textContent = `${filtered.length} disponibles`;

    if (filtered.length === 0) {
        testCardsContainer.innerHTML = `
            <div class="loading-state">
                No hay pruebas bajo la categoría "${currentFilter}".
            </div>
        `;
        return;
    }

    testCardsContainer.innerHTML = filtered.map(t => `
        <div class="test-card" data-id="${t.id}">
            <div class="test-card-top">
                <span class="test-card-title">${escapeHtml(t.name)}</span>
                <span class="badge ${t.requiresLive ? 'badge-live' : 'badge-memory'}">
                    ${t.requiresLive ? 'En Vivo (Docker)' : 'En Frío'}
                </span>
            </div>
            <p class="test-card-desc">${escapeHtml(t.description)}</p>
            <div class="test-card-footer">
                <span class="test-card-path">${escapeHtml(t.testId ? `${t.relativePath} (ID #${t.testId})` : t.relativePath)}</span>
                <button class="btn-run" onclick="runSingleTest('${t.relativePath}', ${t.testId || 'null'}, this)" ${isRunning ? 'disabled' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <span>Ejecutar</span>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Ejecuta una prueba individual con streaming de consola en tiempo real
 */
function runSingleTest(relativePath, testId, buttonEl) {
    if (isRunning) return;

    isRunning = true;
    updateRunButtonsState();

    // Actualizar UI del botón
    const originalBtnHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = `<span class="spinner"></span> <span>Corriendo...</span>`;

    // Limpiar y preparar terminal
    clearConsole();
    consoleTitle.textContent = testId ? `Ejecutando: Escenario #${testId}` : `Ejecutando: ${relativePath}`;
    consoleFooter.style.display = 'none';

    // Iniciar temporizador
    const startTimestamp = Date.now();
    execTimer.style.display = 'inline-block';
    execTimer.textContent = '0.0s';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const secs = ((Date.now() - startTimestamp) / 1000).toFixed(1);
        execTimer.textContent = `${secs}s`;
    }, 100);

    // Conectar SSE
    const sseUrl = `/api/run?file=${encodeURIComponent(relativePath)}${testId ? `&testId=${testId}` : ''}`;
    const eventSource = new EventSource(sseUrl);
    activeEventSource = eventSource;

    eventSource.addEventListener('start', () => {
        appendTerminalLine(`[SISTEMA] Iniciando ejecución de: ${relativePath}\n`, 'log-info');
    });

    eventSource.addEventListener('stdout', (e) => {
        const data = JSON.parse(e.data);
        appendTerminalChunk(data.text);
    });

    eventSource.addEventListener('stderr', (e) => {
        const data = JSON.parse(e.data);
        appendTerminalChunk(data.text, 'log-stderr');
    });

    eventSource.addEventListener('finish', (e) => {
        const data = JSON.parse(e.data);
        clearInterval(timerInterval);
        eventSource.close();
        activeEventSource = null;
        isRunning = false;

        buttonEl.innerHTML = originalBtnHtml;
        updateRunButtonsState();

        // Actualizar Footer de la Consola
        consoleFooter.style.display = 'flex';
        footerStatusBadge.className = `footer-badge ${data.success ? 'success' : 'failed'}`;
        footerStatusBadge.textContent = data.success ? 'APROBADA (PASS)' : 'FALLIDA (FAIL)';
        footerMetaText.textContent = `Duración: ${data.durationMs} ms | Código de salida: ${data.code}`;

        // Actualizar métricas Bento superiores
        metricLastDuration.textContent = `${(data.durationMs / 1000).toFixed(2)}s`;
        metricLastStatus.textContent = data.success ? 'Aprobada exitosamente' : 'Con fallos detectados';
        metricLastStatus.style.color = data.success ? 'var(--status-success)' : 'var(--status-error)';
    });

    eventSource.onerror = (err) => {
        clearInterval(timerInterval);
        eventSource.close();
        isRunning = false;
        buttonEl.innerHTML = originalBtnHtml;
        updateRunButtonsState();
        appendTerminalLine('\n[ERROR] Se interrumpió la conexión con el runner de pruebas.', 'log-fail');
    };
}

/**
 * Deshabilita o habilita los botones mientras corre una prueba
 */
function updateRunButtonsState() {
    document.querySelectorAll('.btn-run').forEach(btn => {
        btn.disabled = isRunning;
    });
}

/**
 * Añade texto coloreado a la consola
 */
function appendTerminalChunk(rawText, defaultClass = '') {
    const lines = rawText.split('\n');

    lines.forEach((line, index) => {
        if (line.length === 0 && index === lines.length - 1) return;

        let lineClass = defaultClass;
        if (line.includes('[PASS]')) lineClass = 'log-pass';
        else if (line.includes('[FAIL]')) lineClass = 'log-fail';
        else if (line.includes('===') || line.includes('---')) lineClass = 'log-header';
        else if (line.includes('[CONFIG') || line.includes('[SISTEMA]')) lineClass = 'log-info';

        const lineEl = document.createElement('div');
        lineEl.className = `log-line ${lineClass}`;
        lineEl.textContent = line || ' ';
        terminalBody.appendChild(lineEl);
    });

    // Auto-scroll al fondo
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function appendTerminalLine(text, className = '') {
    const lineEl = document.createElement('div');
    lineEl.className = `log-line ${className}`;
    lineEl.textContent = text;
    terminalBody.appendChild(lineEl);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function clearConsole() {
    terminalBody.innerHTML = '';
    consoleTitle.textContent = 'Consola de Salida de Pruebas';
    consoleFooter.style.display = 'none';
    execTimer.style.display = 'none';
    clearInterval(timerInterval);
}

function copyConsoleOutput() {
    const text = terminalBody.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyConsoleBtn.querySelector('span').textContent;
        copyConsoleBtn.querySelector('span').textContent = '¡Copiado!';
        setTimeout(() => {
            copyConsoleBtn.querySelector('span').textContent = originalText;
        }, 1800);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[m]);
}
