/**
 * LÓGICA REACTIVA DEL DASHBOARD - LAIKA CLUB
 * - Vista 1: Salud del Sistema, Métricas en Vivo, Topología y Simulador de Concurrencia
 * - Vista 2: Runner de Pruebas Automatizadas (CI) con Streaming en Tiempo Real (SSE)
 */

let allTests = [];
let currentFilter = 'all';
let isRunning = false;
let activeEventSource = null;
let timerInterval = null;

// Elementos DOM Globales
const tabBtnMonitoring = document.getElementById('tabBtnMonitoring');
const tabBtnRunner = document.getElementById('tabBtnRunner');
const viewMonitoring = document.getElementById('viewMonitoring');
const viewRunner = document.getElementById('viewRunner');

const gatewayStatusPill = document.getElementById('gatewayStatusPill');
const gatewayStatusText = document.getElementById('gatewayStatusText');
const refreshAllBtn = document.getElementById('refreshAllBtn');

// Elementos Vista Monitoreo
const kpiSlaUptime = document.getElementById('kpiSlaUptime');
const kpiLatencyP95 = document.getElementById('kpiLatencyP95');
const kpiThroughput = document.getElementById('kpiThroughput');
const servicesGrid = document.getElementById('servicesGrid');
const btnAuditAllServices = document.getElementById('btnAuditAllServices');

const hostArchBadge = document.getElementById('hostArchBadge');
const ramText = document.getElementById('ramText');
const ramBar = document.getElementById('ramBar');
const cpuCoresText = document.getElementById('cpuCoresText');
const hostUptimeText = document.getElementById('hostUptimeText');

const btnRunLiveStressTest = document.getElementById('btnRunLiveStressTest');
const stressResultsBox = document.getElementById('stressResultsBox');
const stressTotalUsers = document.getElementById('stressTotalUsers');
const stressConfirmed = document.getElementById('stressConfirmed');
const stressBlocked = document.getElementById('stressBlocked');
const stressDuration = document.getElementById('stressDuration');

// Elementos Vista Runner
const metricTotalTests = document.getElementById('metricTotalTests');
const metricGatewayStatus = document.getElementById('metricGatewayStatus');
const metricLastDuration = document.getElementById('metricLastDuration');
const metricLastStatus = document.getElementById('metricLastStatus');
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
 * Inicialización al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    initViewSwitcher();
    loadSystemMetrics();
    loadServicesHealth();
    loadTests();
    checkGatewayStatus();

    // Polling periódico cada 12 segundos
    setInterval(() => {
        checkGatewayStatus();
        loadSystemMetrics();
    }, 12000);

    // Eventos de botones
    refreshAllBtn.addEventListener('click', () => {
        refreshAllBtn.classList.add('loading');
        Promise.all([loadSystemMetrics(), loadServicesHealth(), loadTests(), checkGatewayStatus()])
            .finally(() => refreshAllBtn.classList.remove('loading'));
    });

    if (btnAuditAllServices) {
        btnAuditAllServices.addEventListener('click', () => {
            btnAuditAllServices.classList.add('loading');
            loadServicesHealth().finally(() => btnAuditAllServices.classList.remove('loading'));
        });
    }

    if (btnRunLiveStressTest) {
        btnRunLiveStressTest.addEventListener('click', runLiveStressTest);
    }

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
 * Conmutador de Vistas: Monitoreo & Salud vs Runner de Pruebas
 */
function initViewSwitcher() {
    tabBtnMonitoring.addEventListener('click', () => {
        tabBtnMonitoring.classList.add('active');
        tabBtnRunner.classList.remove('active');
        viewMonitoring.style.display = 'flex';
        viewRunner.style.display = 'none';
    });

    tabBtnRunner.addEventListener('click', () => {
        tabBtnRunner.classList.add('active');
        tabBtnMonitoring.classList.remove('active');
        viewMonitoring.style.display = 'none';
        viewRunner.style.display = 'flex';
    });
}

/**
 * Carga métricas en vivo del host, SLA y percentiles de latencia
 */
async function loadSystemMetrics() {
    try {
        const res = await fetch('/api/system-metrics');
        const data = await res.json();
        if (data.success && data.metrics) {
            const m = data.metrics;
            kpiSlaUptime.textContent = `${m.sla.uptimePercent}%`;
            kpiLatencyP95.textContent = `${m.performance.latencies.p95} ms`;
            kpiThroughput.textContent = `${m.performance.throughputRps.toLocaleString()} req/s`;

            // Recursos del Host
            const h = m.hostResources;
            hostArchBadge.textContent = `${h.arch.toUpperCase()} / ${h.platform.toUpperCase()}`;
            ramText.textContent = `${h.usedRamMb.toLocaleString()} MB / ${h.totalRamMb.toLocaleString()} MB (${h.ramPercent}%)`;
            ramBar.style.width = `${h.ramPercent}%`;
            cpuCoresText.textContent = `${h.cpuCores} Cores`;
            hostUptimeText.textContent = `${h.uptimeHours} hrs`;
        }
    } catch (_) {}
}

/**
 * Carga y renderiza el estado de los 11 microservicios del ecosistema
 */
async function loadServicesHealth() {
    try {
        const res = await fetch('/api/services-health');
        const data = await res.json();
        if (data.success && data.services) {
            renderServicesGrid(data.services);
        }
    } catch (err) {
        servicesGrid.innerHTML = `
            <div class="loading-state" style="color: var(--status-error);">
                Error al auditar microservicios: ${err.message}
            </div>
        `;
    }
}

function renderServicesGrid(services) {
    servicesGrid.innerHTML = services.map(s => {
        const isOnline = s.online;
        const statusClass = isOnline ? 'online' : 'standby';
        const statusText = isOnline ? `Online (${s.latencyMs}ms)` : 'Standby / Docker';

        return `
            <div class="service-card ${isOnline ? 'active-service' : ''}">
                <div class="service-card-header">
                    <div class="service-title-group">
                        <span class="service-name">${escapeHtml(s.name)}</span>
                        <span class="service-port">:${s.port}</span>
                    </div>
                    <span class="service-status-chip ${statusClass}">
                        <span class="dot-sm"></span>
                        ${statusText}
                    </span>
                </div>
                <div class="service-card-body">
                    <div class="service-meta-item">
                        <span class="meta-label">Stack:</span>
                        <span class="meta-val">${escapeHtml(s.type)}</span>
                    </div>
                    <div class="service-meta-item">
                        <span class="meta-label">Rol:</span>
                        <span class="meta-val">${escapeHtml(s.role)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Ejecución del simulador de estrés de concurrencia en vivo
 */
async function runLiveStressTest() {
    btnRunLiveStressTest.disabled = true;
    const originalText = btnRunLiveStressTest.innerHTML;
    btnRunLiveStressTest.innerHTML = `<span class="spinner"></span> <span>Disparando 200 hilos concurrentes...</span>`;

    try {
        const res = await fetch('/api/run-stress-test');
        const data = await res.json();

        stressResultsBox.style.display = 'block';
        stressTotalUsers.textContent = data.totalUsers;
        stressConfirmed.textContent = data.confirmedPurchases;
        stressBlocked.textContent = data.doublePurchasesBlocked;
        stressDuration.textContent = `${data.executionDurationMs} ms`;

        stressResultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
        alert(`Error al ejecutar auditoría de concurrencia: ${err.message}`);
    } finally {
        btnRunLiveStressTest.disabled = false;
        btnRunLiveStressTest.innerHTML = originalText;
    }
}

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
            gatewayStatusText.textContent = 'Pilgrim Gateway: Standby';
            metricGatewayStatus.textContent = 'Standby';
            metricGatewayStatus.className = 'metric-value';
            metricGatewayStatus.style.color = 'var(--status-warning)';
        }
    } catch (_) {
        const dot = gatewayStatusPill.querySelector('.status-dot');
        dot.className = 'status-dot offline';
        gatewayStatusText.textContent = 'Pilgrim Gateway: Standby';
    }
}

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

function runSingleTest(relativePath, testId, buttonEl) {
    if (isRunning) return;

    isRunning = true;
    updateRunButtonsState();

    const originalBtnHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = `<span class="spinner"></span> <span>Corriendo...</span>`;

    clearConsole();
    consoleTitle.textContent = testId ? `Ejecutando: Escenario #${testId}` : `Ejecutando: ${relativePath}`;
    consoleFooter.style.display = 'none';

    const startTimestamp = Date.now();
    execTimer.style.display = 'inline-block';
    execTimer.textContent = '0.0s';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const secs = ((Date.now() - startTimestamp) / 1000).toFixed(1);
        execTimer.textContent = `${secs}s`;
    }, 100);

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

        consoleFooter.style.display = 'flex';
        footerStatusBadge.className = `footer-badge ${data.success ? 'success' : 'failed'}`;
        footerStatusBadge.textContent = data.success ? 'APROBADA (PASS)' : 'FALLIDA (FAIL)';
        footerMetaText.textContent = `Duración: ${data.durationMs} ms | Código de salida: ${data.code}`;

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

function updateRunButtonsState() {
    document.querySelectorAll('.btn-run').forEach(btn => {
        btn.disabled = isRunning;
    });
}

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
        copyConsoleBtn.querySelector('span').textContent = 'Copiado';
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
