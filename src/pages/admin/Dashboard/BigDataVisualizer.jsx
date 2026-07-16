import React, { useState, useEffect, useMemo } from 'react';
import { analyticsAPI } from '../../../services/miscService';
import { eventAPI } from '../../../services/eventService';
import { Card, Modal } from '../../../components';
import Skeleton from '../../../components/Skeleton/Skeleton';
import Plot from 'react-plotly.js';
import B2BProspecting from './components/B2BProspecting';
import UserDemandAnalytics from './components/UserDemandAnalytics';
import MerchandiseSalesInsights from './components/MerchandiseSalesInsights';
import InteractiveDecisionWizard from './components/InteractiveDecisionWizard/InteractiveDecisionWizard';
import FinancialRegressionChart from './components/FinancialRegressionChart';
import PricingConfusionMatrix from './components/PricingConfusionMatrix';
import DatabaseSanitizationStatus from './components/DatabaseSanitizationStatus';
import SmartRecommendations from './components/SmartRecommendations';
import BigDataHeader from './components/BigDataHeader';
import BigDataFilters from './components/BigDataFilters';
import BigDataTools from './components/BigDataTools';
import BigDataMetrics from './components/BigDataMetrics';
import BigDataGlossary from './components/BigDataGlossary';
import { 
  Activity, 
  Settings, 
  Database, 
  Calendar, 
  Filter, 
  Layers,
  Search,
  Zap,
  ShieldAlert,
  BarChart3,
  Terminal,
  Database as DatabaseIcon,
  Palette,
  Eye,
  Maximize2,
  Box,
  Check,
  X,
  HelpCircle,
  BookOpen,
  Users,
  ChevronDown,
  Target
} from 'lucide-react';


const BigDataVisualizer = ({ managerId = null }) => {
    const [errorDismissed, setErrorDismissed] = useState(false);
    const [zScale, setZScale] = useState(1.0);
    const [barWidth, setBarWidth] = useState(0.2);
    const [hMult, setHMult] = useState(1.5);
    const [opacity, setOpacity] = useState(1.0);
    const [buildingShape, setBuildingShape] = useState('cube'); 
    const [isWireframe, setIsWireframe] = useState(false);
    
    const [customColor, setCustomColor] = useState('#111111'); // MOVIDO AQUÍ ARRIBA

    // PALETAS DE COLORES RESTAURADAS
    const [colorPalette, setColorPalette] = useState('monochrome'); // monochrome, thermal, industrial, cyber
    const palettes = {
        monochrome: [[0, '#000000'], [1, '#666666']],
        thermal: [[0, '#000033'], [0.5, '#ffff00'], [1, '#ff0000']],
        industrial: [[0, '#1a1a1a'], [1, '#cccccc']],
        cyber: [[0, '#000000'], [1, '#ffffff']],
        custom: [[0, '#000000'], [1, customColor]]
    };

    // 1.5 NUEVOS ESTADOS DE VISUALIZACIÓN AVANZADA
    const [chartType, setChartType] = useState('3D_BAR'); // 3D_BAR, 3D_SCATTER, 2D_PIE
    const [colorMode, setColorMode] = useState('palette'); // 'palette' (continuo), 'solid' (fijo por categoría)
    const [markerSize, setMarkerSize] = useState(12);

    const solidColors = [
        '#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', 
        '#f95d6a', '#ff7c43', '#ffa600', '#488f31', '#de425b'
    ];

    // 2. FILTROS ESTRUCTURADOS + NUEVOS FILTROS TÁCTICOS
    const [selectedTable, setSelectedTable] = useState('tickets');
    const [eventsList, setEventsList] = useState([]);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        category: '',
        role: '',
        payment_method: '',
        hour_range: '',
        status: '',
        min_price: '',
        max_price: '',
        event_id: '',
        k_clusters: 4
    });
    
    const [data3D, setData3D] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
    const [engineStatus, setEngineStatus] = useState('IDLE'); // IDLE, STARTING, READY, ERROR

    // 2.5 NUEVOS ESTADOS PARA MACHINE LEARNING Y CLASE KDD
    const [analysisMode, setAnalysisMode] = useState('3D_EXPLORATION'); // 3D_EXPLORATION, ML_REGRESSION, ML_DECISION_TREE, CLASS_KDD
    const [mlData, setMlData] = useState(null);
    const [mlLoading, setMlLoading] = useState(false);
    
    useEffect(() => {
        setMlData(null);
    }, [analysisMode]);
    
    // Estados para el laboratorio de clase KDD
    const [descriptiveStats, setDescriptiveStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [kddCleanResult, setKddCleanResult] = useState(null);
    const [cleanLoading, setCleanLoading] = useState(false);
    const [kddStep, setKddStep] = useState(1);
    const [simpleView, setSimpleView] = useState(true);
    const [showGlossary, setShowGlossary] = useState(false);

    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [helpModalTitle, setHelpModalTitle] = useState('');
    const [helpModalContent, setHelpModalContent] = useState(null);

    const openHelp = (mode) => {
        if (mode === 'ML_REGRESSION') {
            setHelpModalTitle('Ayuda - Predicción de Ingresos');
            setHelpModalContent(
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Esta herramienta calcula <b>cuánto dinero recaudará cada uno de tus eventos al finalizar</b> basándose en las ventas actuales y el historial. Compara varios métodos para darte la proyección más exacta.
                    </p>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 2px 0' }}>¿Qué es la precisión (Score R²)?</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Es un porcentaje (de 0 a 100%) que indica qué tan confiable es el cálculo. Si la precisión es del 90%, significa que la predicción final de ingresos es altamente confiable y tiene un margen de error histórico de solo el 10%.
                    </p>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 2px 0' }}>¿Cómo usar esta información?</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Te sirve para planificar pagos a proveedores antes del evento, o bien para lanzar campañas publicitarias si ves que el <b>Estimado Final</b> proyectado está muy por debajo de la ganancia máxima posible.
                    </p>
                </div>
            );
        } else if (mode === 'ML_DECISION_TREE') {
            setHelpModalTitle('Ayuda - Estrategia de Precios');
            setHelpModalContent(
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        La Inteligencia Artificial evalúa de forma automática la cantidad de boletos que se han vendido (ocupación) y te recomienda acciones comerciales al instante para que no tengas que hacer cálculos manuales.
                    </p>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 2px 0' }}>Las sugerencias automáticas del sistema son:</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        • <b>Tarifa Dinámica (Ocupación mayor al 60%):</b> El evento tiene alta demanda. Se recomienda subir los precios un 15% para maximizar tus ingresos en las últimas entradas.<br/>
                        • <b>Estrategia de Promoción (Ocupación menor al 30%):</b> El evento se vende lento. Se recomienda lanzar 2x1 o cupones de descuento para motivar las compras y llenar el lugar.<br/>
                        • <b>Precio Estable (Ocupación entre 30% y 60%):</b> El ritmo de venta es saludable. Se sugiere mantener los precios normales.
                    </p>
                </div>
            );
        } else if (mode === 'CLASS_KDD') {
            setHelpModalTitle('Ayuda - Pasos y Estadísticas');
            setHelpModalContent(
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        Muestra de forma transparente cómo se procesan y analizan los datos de tu club. Además, ofrece herramientas de mantenimiento y métricas básicas de tus finanzas.
                    </p>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 2px 0' }}>¿Cómo te ayuda este apartado?</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                        • <b>Limpieza de Datos (Paso 2):</b> Presiona el botón para eliminar registros repetidos o vacíos, asegurando que tus reportes sean 100% correctos.<br/>
                        • <b>Métricas de Control (Abajo):</b> Te muestra tu promedio de ventas, el ingreso medio y la estabilidad de tu flujo de efectivo (si tus eventos ganan montos parecidos o si varían drásticamente).
                    </p>
                </div>
            );
        }
        setHelpModalOpen(true);
    };

    const [openFiltersPanel, setOpenFiltersPanel] = useState(false);
    const [openColorPanel, setOpenColorPanel] = useState(false);
    const [openMetricsPanel, setOpenMetricsPanel] = useState(false);
    const [openLogPanel, setOpenLogPanel] = useState(false);

    const theme = {
        bg: '#FFFFFF',
        text: '#000000',
        border: '#000000',
        grid: '#F8F8F8',
        card: '#FFFFFF',
        shadow: '0 4px 30px rgba(0, 0, 0, 0.05)'
    };

    // 3. LÓGICA DE DATOS (PROTECCIÓN CONTRA NULOS / SIN CLASIFICAR)
    const canonicalData = useMemo(() => {
        if (!Array.isArray(data3D)) return [];
        return data3D
            .map(d => ({
                ...d,
                producto: d.producto || d.name || 'SIN_CLASIFICAR', 
                val_num: d.ingreso_total || d.z_ingreso || d.y_volumen || d.cantidad_total || 0
            }))
            .sort((a, b) => b.val_num - a.val_num);
    }, [data3D]);

    const executeAnalysis = async (retries = 3) => {
        setLoading(true);
        setError(null);
        setEngineStatus('STARTING');
        try {
            const queryFilters = { ...filters };
            if (managerId) {
                queryFilters.manager_id = managerId;
            }
            Object.keys(queryFilters).forEach(k => !queryFilters[k] && delete queryFilters[k]);
            
            const response = await analyticsAPI.getMapReduceStats3D(selectedTable, queryFilters);
            const finalData = response.data || response || [];
            setData3D(Array.isArray(finalData) ? finalData : []);
            setLastSync(new Date().toLocaleTimeString());
            setEngineStatus('READY');
        } catch (err) {
            const statusCode = err?.response?.status;
            if ((statusCode === 500) && retries > 0) {
                // Spark aún está calentando, reintentar
                setEngineStatus('STARTING');
                setError(`MOTOR DE SPARK INICIANDO... Reintentando (${4 - retries}/3)`);
                await new Promise(res => setTimeout(res, 800)); // REINTENTO MÁS RÁPIDO 🚀
                return executeAnalysis(retries - 1);
            }
            setEngineStatus('ERROR');
            setError('ERROR DE CONEXIÓN: MOTOR DE ANALÍTICA OFFLINE');
        } finally { setLoading(false); }
    };

    const executeMLAnalysis = async (mode) => {
        setMlLoading(true);
        try {
            let data;
            const activeFilters = { ...filters };
            Object.keys(activeFilters).forEach(k => !activeFilters[k] && delete activeFilters[k]);
            
            if (mode === 'ML_REGRESSION') {
                data = await analyticsAPI.getRegressionML(managerId, activeFilters);
            } else if (mode === 'ML_DECISION_TREE') {
                data = await analyticsAPI.getDecisionTreeML(managerId, activeFilters);
            } else if (mode === 'ML_PCA') {
                const k = activeFilters.k_clusters ? parseInt(activeFilters.k_clusters, 10) : 3;
                data = await analyticsAPI.getPCAML(k);
            } else if (mode === 'ML_MARKET_GAPS') {
                data = await analyticsAPI.getMarketGapsML(managerId);
            } else if (mode === 'ML_RECOMMENDATIONS') {
                let features = [100, 50, 5000]; // Default proxy si no hay evento seleccionado
                if (activeFilters.event_id) {
                    const eventObj = eventsList.find(e => e.id.toString() === activeFilters.event_id.toString());
                    if (eventObj) {
                        const price = Number(eventObj.price) || 50;
                        const capacity = Number(eventObj.total_tickets) || 100;
                        features = [capacity, price, capacity * price];
                    }
                }
                data = await analyticsAPI.getEventTargetAudience(features, 1);
            } else if (mode === 'ML_ELBOW') {
                data = await analyticsAPI.getElbowML(8);
            } else if (mode === 'ML_ANOMALY') {
                data = await analyticsAPI.getAnomalyML(managerId);
            }
            setMlData(data);
        } catch (err) {
            console.error(`Error in ML Analysis (${mode}):`, err);
            const errorMessage = err.response?.data?.detail || err.message || 'Error desconocido';
            setError(`FALLO EN EL MOTOR DE MACHINE LEARNING: ${errorMessage}`);
        } finally {
            setMlLoading(false);
        }
    };

    const fetchDescriptiveStats = async (table) => {
        setStatsLoading(true);
        try {
            const res = await analyticsAPI.getDescriptiveStats(table, managerId, filters.event_id);
            setDescriptiveStats(res);
        } catch (err) {
            console.error("Error fetching descriptive stats", err);
            setError('FALLO EN EL CÁLCULO ESTADÍSTICO DE CLASE');
        } finally {
            setStatsLoading(false);
        }
    };

    const runKddCleaning = async () => {
        setCleanLoading(true);
        try {
            const res = await analyticsAPI.runCleanAction(selectedTable);
            setKddCleanResult(res.data || res);
        } catch (err) {
            console.error("Error running KDD cleaning", err);
            setError('FALLO EN LA OPERACIÓN DE LIMPIEZA KDD');
        } finally {
            setCleanLoading(false);
        }
    };

    useEffect(() => {
        const loadEvents = async () => {
            try {
                let res;
                if (managerId) {
                    res = await eventAPI.getMyEvents();
                } else {
                    res = await eventAPI.getAll();
                }
                const list = res.data || res || [];
                setEventsList(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("Error loading events for filter:", err);
            }
        };
        loadEvents();
    }, [managerId]);

    useEffect(() => {
        setErrorDismissed(false);
    }, [error]);
    useEffect(() => {
        if (!error || errorDismissed) return;
        const timer = setTimeout(() => setErrorDismissed(true), 8000);
        return () => clearTimeout(timer);
    }, [error, errorDismissed]);
    useEffect(() => { 
        // Solo limpiamos los datos para que quede en espera ("standby")
        // El usuario debe presionar "Ejecutar" para cargar los datos
        setData3D([]);
        setMlData(null);
        setDescriptiveStats(null);
        setKddCleanResult(null);
    }, [selectedTable, analysisMode, managerId, filters.event_id]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleExportExcel = () => {
        if (!canonicalData || canonicalData.length === 0) return;
        const headers = ["Producto / Categoria", "Ingreso / Valor"];
        const rows = canonicalData.map(d => [`"${d.producto}"`, d.val_num]);
        const csvContent = "data:text/csv;charset=utf-8,\ufeff" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_BigData_${selectedTable.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // 4. RENDERIZADO 3D (INDUSTRIAL + TOOLS)
    const render3DPlot = () => {
        const plotData = [];
        const w = barWidth;
        const gridWidth = Math.ceil(Math.sqrt(canonicalData.length || 1));

        const meshCommon = (x, y, z, i, j, k, name, zVal, index) => ({
            type: 'mesh3d', x, y, z, i, j, k,
            intensity: z.map(v => v),
            colorscale: colorMode === 'solid' 
                ? [[0, solidColors[index % solidColors.length]], [1, solidColors[index % solidColors.length]]] 
                : palettes[colorPalette],
            showscale: false,
            opacity: isWireframe ? 0.3 : opacity,
            flatshading: true,
            name: name,
            hoverinfo: 'text',
            text: `<b>${name}</b><br>VALOR: \${zVal.toLocaleString()}`
        });

        const makeBox = (xPos, yPos, zVal, nz, name, index) => {
            const x = [xPos-w, xPos+w, xPos+w, xPos-w, xPos-w, xPos+w, xPos+w, xPos-w];
            const y = [yPos-w, yPos-w, yPos+w, yPos+w, yPos-w, yPos-w, yPos+w, yPos+w];
            const z = [0, 0, 0, 0, nz, nz, nz, nz];
            const i = [0, 0, 4, 4, 0, 0, 1, 1, 2, 2, 3, 3];
            const j = [1, 2, 5, 6, 1, 5, 2, 6, 3, 7, 0, 4];
            const k = [2, 3, 6, 7, 5, 4, 6, 5, 7, 6, 4, 7];
            return meshCommon(x, y, z, i, j, k, name, zVal, index);
        };

        const makePyramid = (xPos, yPos, zVal, nz, name, index) => {
            const x = [xPos-w, xPos+w, xPos+w, xPos-w, xPos];
            const y = [yPos-w, yPos-w, yPos+w, yPos+w, yPos];
            const z = [0, 0, 0, 0, nz];
            const i = [0, 0, 0, 1, 2, 3];
            const j = [1, 2, 1, 2, 3, 0];
            const k = [2, 3, 4, 4, 4, 4];
            return meshCommon(x, y, z, i, j, k, name, zVal, index);
        };

        const maxDataValue = Math.max(...canonicalData.map(d => d.val_num || 1), 1);
        const visualMaxH = 3.0;

        // 🟢 NUEVA LÓGICA DE ENRUTAMIENTO POR TIPO DE GRÁFICO
        if (chartType === '2D_PIE') {
            plotData.push({
                type: 'pie',
                labels: canonicalData.map(d => d.producto),
                values: canonicalData.map(d => d.val_num),
                textinfo: 'label+percent',
                hole: 0.4,
                marker: { 
                    colors: canonicalData.map((_, index) => solidColors[index % solidColors.length]) 
                }
            });
        } else if (chartType === '3D_SCATTER' || buildingShape === 'points') {
            const x = [], y = [], z = [], text = [], colors = [];
            canonicalData.forEach((d, i) => {
                const normalizedZ = (d.val_num / maxDataValue) * visualMaxH * zScale * hMult;
                x.push((i % gridWidth) * 0.7);
                y.push(Math.floor(i / gridWidth) * 0.7);
                z.push(normalizedZ);
                text.push(`<b>${d.producto}</b><br>VALOR: \${d.val_num.toLocaleString()}`);
                colors.push(colorMode === 'solid' ? solidColors[i % solidColors.length] : normalizedZ);
            });
            plotData.push({
                type: 'scatter3d',
                mode: 'markers',
                x, y, z,
                marker: {
                    size: markerSize,
                    color: colorMode === 'solid' ? null : z,
                    colors: colorMode === 'solid' ? colors : null,
                    colorscale: colorMode === 'solid' ? null : palettes[colorPalette],
                    color: colorMode === 'solid' ? colors : z,
                    opacity: opacity,
                    symbol: 'circle'
                },
                text: text,
                hoverinfo: 'text'
            });
        } else {
            // Predeterminado: 3D_BAR (Barras)
            canonicalData.forEach((d, i) => {
                const normalizedZ = (d.val_num / maxDataValue) * visualMaxH * zScale * hMult; 
                const gx = (i % gridWidth) * 0.7;
                const gy = Math.floor(i / gridWidth) * 0.7;
                const shapeFunc = buildingShape === 'pyramid' ? makePyramid : makeBox;
                plotData.push(shapeFunc(gx, gy, d.val_num, normalizedZ, d.producto, i));
            });
        }
        return plotData;
    }

    if (loading && (!canonicalData || canonicalData.length === 0)) {
        return (
            <div className="analytics-premium" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '1.5rem 2rem', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
                
                {/* CABECERA PREMIUM MOCK (Espejo de header real) */}
                <header style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '1.2rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Skeleton style={{ height: '48px', width: '48px', borderRadius: '16px' }} animate />
                        <div>
                            <Skeleton style={{ height: '22px', width: '180px', marginBottom: '6px' }} animate />
                            <Skeleton style={{ height: '12px', width: '250px' }} animate />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Mock de los 3 botones de modo */}
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <Skeleton style={{ height: '30px', width: '120px', borderRadius: '12px' }} animate />
                            <Skeleton style={{ height: '30px', width: '100px', borderRadius: '12px' }} animate />
                            <Skeleton style={{ height: '30px', width: '140px', borderRadius: '12px' }} animate />
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)' }}></div>
                        <div>
                            <Skeleton style={{ height: '10px', width: '80px', marginBottom: '4px' }} animate />
                            <Skeleton style={{ height: '35px', width: '160px', borderRadius: '12px' }} animate />
                        </div>
                        <Skeleton style={{ height: '38px', width: '120px', borderRadius: '12px' }} animate />
                    </div>
                </header>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: analysisMode === '3D_EXPLORATION' 
                        ? 'minmax(280px, 300px) 1fr minmax(260px, 280px)' 
                        : '1fr', 
                    gap: '1.5rem' 
                }}>
                    
                    {/* PANEL IZQUIERDO MOCK (Filtros exactos) */}
                    {analysisMode === '3D_EXPLORATION' && (
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Skeleton style={{ height: '16px', width: '16px', borderRadius: '3px' }} animate />
                                    <Skeleton style={{ height: '14px', width: '120px' }} animate />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {[2, 1, 1, 1, 1, 2, 1].map((items, i) => (
                                        <div key={i}>
                                            <Skeleton style={{ height: '8px', width: '40%', marginBottom: '6px' }} animate />
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[...Array(items)].map((_, j) => (
                                                    <Skeleton key={j} style={{ height: '35px', flex: 1, borderRadius: '12px' }} animate />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <Skeleton style={{ height: '38px', width: '100%', borderRadius: '12px', marginTop: '0.5rem' }} animate />
                                    <Skeleton style={{ height: '38px', width: '100%', borderRadius: '12px', background: '#e2f5e9' }} animate />
                                </div>
                            </Card>
                        </aside>
                    )}

                    {/* PANEL CENTRAL MOCK (Gráfico 3D Simulado) */}
                    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <Card style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                            <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Skeleton style={{ height: '16px', width: '16px', borderRadius: '4px' }} animate />
                                    <Skeleton style={{ height: '14px', width: '180px' }} animate />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Skeleton style={{ height: '12px', width: '100px' }} animate />
                                    <Skeleton style={{ height: '12px', width: '80px' }} animate />
                                </div>
                            </div>
                            <div style={{ height: '416px', background: '#f8fafc', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', padding: '32px' }}>
                                {/* Simulación de barritas 3D con Skeleton */}
                                {[80, 140, 220, 180, 260, 190, 310, 240, 160, 110, 80].map((h, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <Skeleton style={{ height: `${h}px`, width: '100%', borderRadius: '8px 8px 4px 4px', background: 'linear-gradient(to top, rgba(0,0,0,0.03), rgba(0,0,0,0.12))' }} animate />
                                        <Skeleton style={{ height: '6px', width: '60%', marginTop: '8px' }} animate />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Métricas inferiores Mock */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
                            <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: '150px' }}>
                                <Skeleton style={{ height: '10px', width: '120px', marginBottom: '12px' }} animate />
                                <Skeleton style={{ height: '28px', width: '80%', marginBottom: '12px' }} animate />
                                <Skeleton style={{ height: '12px', width: '100%', marginBottom: '8px' }} animate />
                                <Skeleton style={{ height: '12px', width: '60%' }} animate />
                            </Card>
                            <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', height: '150px' }}>
                                <Skeleton style={{ height: '10px', width: '140px', marginBottom: '12px' }} animate />
                                <Skeleton style={{ height: '42px', width: '60%', marginBottom: '16px' }} animate />
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                                    <Skeleton style={{ height: '12px', width: '120px' }} animate />
                                    <Skeleton style={{ height: '14px', width: '60px', borderRadius: '6px' }} animate />
                                </div>
                            </Card>
                        </div>
                    </main>

                    {/* PANEL DERECHO MOCK (Slidres y log exactos) */}
                    {analysisMode === '3D_EXPLORATION' && (
                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Skeleton style={{ height: '16px', width: '16px', borderRadius: '4px' }} animate />
                                    <Skeleton style={{ height: '14px', width: '130px' }} animate />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <Skeleton style={{ height: '8px', width: '50%' }} animate />
                                                <Skeleton style={{ height: '8px', width: '20px' }} animate />
                                            </div>
                                            <Skeleton style={{ height: '6px', width: '100%', borderRadius: '3px' }} animate />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card style={{ padding: 0, borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ padding: '1.2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Skeleton style={{ height: '14px', width: '14px', borderRadius: '3px' }} animate />
                                    <Skeleton style={{ height: '12px', width: '150px' }} animate />
                                </div>
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <Skeleton style={{ height: '12px', width: '18px' }} animate />
                                            <Skeleton style={{ height: '12px', flex: 1 }} animate />
                                            <Skeleton style={{ height: '12px', width: '50px' }} animate />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </aside>
                    )}

                </div>
            </div>
        );
    }

    return (
        <div className="analytics-premium" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '1.5rem 2rem', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            <BigDataHeader 
                managerId={managerId}
                analysisMode={analysisMode}
                setAnalysisMode={setAnalysisMode}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                showGlossary={showGlossary}
                setShowGlossary={setShowGlossary}
                executeAnalysis={executeAnalysis}
                executeMLAnalysis={executeMLAnalysis}
                fetchDescriptiveStats={fetchDescriptiveStats}
            />

            <BigDataGlossary 
                showGlossary={showGlossary} 
                setShowGlossary={setShowGlossary} 
            />

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: analysisMode === '3D_EXPLORATION' 
                    ? 'minmax(280px, 300px) 1fr minmax(260px, 280px)' 
                    : (analysisMode === 'ML_REGRESSION' || analysisMode === 'ML_DECISION_TREE')
                        ? 'minmax(280px, 300px) 1fr'
                        : '1fr', 
                gap: '1.5rem' 
            }}>
                
                {/* PANEL IZQUIERDO: FILTROS */}
                {(analysisMode === '3D_EXPLORATION' || analysisMode === 'ML_REGRESSION' || analysisMode === 'ML_DECISION_TREE') && (
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <BigDataFilters 
                        openFiltersPanel={openFiltersPanel}
                        setOpenFiltersPanel={setOpenFiltersPanel}
                        eventsList={eventsList}
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        chartType={chartType}
                        setChartType={setChartType}
                        colorMode={colorMode}
                        setColorMode={setColorMode}
                        executeAnalysis={executeAnalysis}
                        executeMLAnalysis={executeMLAnalysis}
                        analysisMode={analysisMode}
                        handleExportExcel={handleExportExcel}
                    />
                </aside>
                )}

                {/* PANEL CENTRAL: MONITOR 3D Y MÉTRICAS */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#000000', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}><BarChart3 size={16}/></div>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>RENDER SKYLINE <span style={{ color: '#94a3b8', fontWeight: 500 }}>v8.2</span></span>
                            </div>
                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <div className="tool-hint-premium"><Maximize2 size={12}/> Zoom Habilitado</div>
                                <div className="tool-hint-premium"><Box size={12}/> {buildingShape.charAt(0).toUpperCase() + buildingShape.slice(1)}</div>
                            </div>
                        </div>
                        
                        <div style={{ minHeight: '416px', height: (analysisMode === 'CLASS_KDD' || analysisMode === 'B2B_PROSPECTING' || analysisMode === 'ML_USER_DEMAND' || analysisMode === 'MERCH_INSIGHTS') ? 'auto' : '416px', background: '#f8fafc', position: 'relative', overflowY: 'auto' }}>
                            {/* CAJA DE LEYENDA PARA LOS CUADRADITOS DE COLORES */}
                            {colorMode === 'solid' && analysisMode === '3D_EXPLORATION' && (
                                <div style={{ 
                                    position: 'absolute', top: '15px', right: '15px', 
                                    background: 'rgba(255,255,255,0.95)', padding: '10px 15px', 
                                    borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                                    border: '1px solid #E2E8F0', zIndex: 10,
                                    maxHeight: '250px', overflowY: 'auto'
                                }}>
                                    <h4 style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#475569', borderBottom: '1px solid #EDF2F7', paddingBottom: '4px' }}>Leyenda</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {canonicalData.slice(0, 15).map((d, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: solidColors[index % solidColors.length] }}></div>
                                                <span style={{ color: '#1E293B' }}>{d.producto}</span>
                                            </div>
                                        ))}
                                        {canonicalData.length > 15 && <div style={{ fontSize: '0.65rem', color: '#64748B', fontStyle: 'italic' }}>Y {canonicalData.length - 15} más...</div>}
                                    </div>
                                </div>
                            )}

                            {(loading || mlLoading) && (
                                <div className="loader-overlay-premium">
                                    <div className="spinner"></div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '1px' }}>PROCESANDO DATOS...</span>
                                </div>
                            )}
                            
                            <div key="active-panel-wrapper" style={{ width: '100%', height: '100%' }}>
                                {analysisMode === '3D_EXPLORATION' ? (
                                <div key="plot-container-3d" style={{ width: '100%' }}>
                                    <Plot 
                                        data={render3DPlot()}
                                        layout={{
                                            autosize: true, height: 416, margin: { l: 0, r: 0, b: 0, t: 0 },
                                            paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                                            scene: {
                                                xaxis: { showgrid: true, gridcolor: '#D1D5DB', gridwidth: 1, zeroline: false, showticklabels: false, title: '' },
                                                yaxis: { showgrid: true, gridcolor: '#D1D5DB', gridwidth: 1, zeroline: false, showticklabels: false, title: '' },
                                                zaxis: { showgrid: true, gridcolor: '#D1D5DB', gridwidth: 1, zeroline: false, title: '' },
                                                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
                                                aspectratio: { x: 1, y: 1, z: 0.7 }
                                            },
                                            showlegend: false
                                        }}
                                        style={{ width: '100%', opacity: (loading || mlLoading) ? 0.3 : 1, transition: 'opacity 0.3s' }}
                                        config={{ responsive: true, displaylogo: false }}
                                    />
                                </div>
                            ) : (analysisMode === 'ML_PCA' || analysisMode === 'ML_RECOMMENDATIONS' || analysisMode === 'ML_ELBOW' || analysisMode === 'ML_ANOMALY' || analysisMode === 'ML_MARKET_GAPS') ? (
                                <div key="smart-recs-container" className="b2b-scrollable-container" style={{ padding: '1.8rem', background: '#ffffff', borderRadius: '24px', maxHeight: '650px', overflowY: 'auto' }}>
                                    <SmartRecommendations analysisMode={analysisMode} mlData={mlData} />
                                </div>
                            ) : analysisMode === 'ML_REGRESSION' ? (
                                <FinancialRegressionChart mlData={mlData} mlLoading={mlLoading} eventsList={eventsList} onRefresh={() => executeMLAnalysis('ML_REGRESSION')} />
                            ) : analysisMode === 'ML_DECISION_TREE' ? (
                                <InteractiveDecisionWizard managerId={managerId} eventsList={eventsList} />
                            ) : analysisMode === 'B2B_PROSPECTING' ? (
                                <div 
                                    key="b2b-prospecting-container" 
                                    className="b2b-scrollable-container" 
                                    style={{ 
                                        padding: '1.8rem', 
                                        background: '#ffffff', 
                                        borderRadius: '24px', 
                                        maxHeight: '650px', 
                                        overflowY: 'auto' 
                                    }}
                                >
                                    <B2BProspecting />
                                </div>
                            ) : analysisMode === 'ML_USER_DEMAND' ? (
                                <div 
                                    key="ml-user-demand-container" 
                                    className="b2b-scrollable-container" 
                                    style={{ 
                                        padding: '1.8rem', 
                                        background: '#ffffff', 
                                        borderRadius: '24px', 
                                        maxHeight: '650px', 
                                        overflowY: 'auto' 
                                    }}
                                >
                                    <UserDemandAnalytics managerId={managerId} />
                                </div>
                            ) : analysisMode === 'MERCH_INSIGHTS' ? (
                                <div
                                    key="merch-insights-container"
                                    className="b2b-scrollable-container"
                                    style={{
                                        padding: '1.8rem',
                                        background: '#ffffff',
                                        borderRadius: '24px',
                                        maxHeight: '700px',
                                        overflowY: 'auto'
                                    }}
                                >
                                    <MerchandiseSalesInsights />
                                </div>
                            ) : (
                                <div key="class-kdd-container" className="kdd-panel-content" style={{ padding: '1.8rem', color: '#1e293b', background: '#ffffff' }}>
                                    <DatabaseSanitizationStatus mlData={mlData} />
                                </div>
                            )}
                            </div>
                        </div>
                    </Card>

                    {/* MÉTRICAS INFERIORES PREMIUM */}
                    {(analysisMode === '3D_EXPLORATION' || analysisMode === 'CLASS_KDD') && (
                        <BigDataMetrics 
                            selectedTable={selectedTable}
                            canonicalData={canonicalData}
                        />
                    )}
                </main>

                {/* PANEL DERECHO: HERRAMIENTAS Y LOG */}
                {analysisMode === '3D_EXPLORATION' && (
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <BigDataTools 
                        openColorPanel={openColorPanel}
                        setOpenColorPanel={setOpenColorPanel}
                        colorPalette={colorPalette}
                        setColorPalette={setColorPalette}
                        palettes={palettes}
                        openMetricsPanel={openMetricsPanel}
                        setOpenMetricsPanel={setOpenMetricsPanel}
                        hMult={hMult} setHMult={setHMult}
                        barWidth={barWidth} setBarWidth={setBarWidth}
                        markerSize={markerSize} setMarkerSize={setMarkerSize}
                        customColor={customColor} setCustomColor={setCustomColor}
                        opacity={opacity} setOpacity={setOpacity}
                        buildingShape={buildingShape} setBuildingShape={setBuildingShape}
                        isWireframe={isWireframe} setIsWireframe={setIsWireframe}
                        openLogPanel={openLogPanel} setOpenLogPanel={setOpenLogPanel}
                        canonicalData={canonicalData}
                    />
                </aside>
                )}
            </div>

            {error && !errorDismissed && (
        <div className="error-banner-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ShieldAlert size={20} />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: '2px' }}>ALERTA DE SISTEMA</div>
                        <div style={{ opacity: 0.9, fontSize: '0.7rem' }}>{error}</div>
                    </div>
                    <button
                        onClick={() => setErrorDismissed(true)}
                        style={{
                            marginLeft: '0.55rem',
                            border: 'none',
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            width: '22px',
                            height: '22px',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Cerrar alerta"
                    >
                        <X size={13} />
                    </button>
                </div>
            )}

            <Modal
                isOpen={helpModalOpen}
                onClose={() => setHelpModalOpen(false)}
                title={helpModalTitle}
                size="medium"
            >
                {helpModalContent}
            </Modal>

            <style>{`
                .btn-primary { background: linear-gradient(135deg, #000000, #000000); color: white; border: none; padding: 0.7rem 1.4rem; border-radius: 12px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; display: flex; alignItems: center; gap: 6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3); }
                .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.7rem; border-radius: 12px; font-weight: 600; font-size: 0.75rem; cursor: pointer; transition: 0.2s; width: 100%; display: flex; justify-content: center; gap: 6px; }
                .btn-secondary:hover { background: #e2e8f0; color: #0f172a; }
                .mode-btn-premium { background: transparent; border: none; padding: 0.6rem 1rem; border-radius: 12px; font-weight: 600; font-size: 0.7rem; color: #64748b; cursor: pointer; transition: 0.2s; display: flex; alignItems: center; gap: 6px; }
                .mode-btn-premium.active { background: #000000; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.22); }
                .mode-btn-premium:hover:not(.active) { color: #334155; background: rgba(255,255,255,0.3); }
                
                .filter-group { display: flex; flex-direction: column; gap: 6px; }
                .filter-group label { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700; color: #64748b; }
                .input-premium, .select-premium { width: 100%; background: #ffffff; border: 1px solid #e2e8f0; padding: 0.6rem 0.8rem; border-radius: 12px; font-family: inherit; font-size: 0.8rem; color: #334155; outline: none; transition: 0.2s; }
                .input-premium:focus, .select-premium:focus { border-color: #000000; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
                
                .palette-btn-premium { background: #ffffff; border: 1px solid #e2e8f0; padding: 0.6rem; border-radius: 10px; font-weight: 600; font-size: 0.7rem; color: #64748b; cursor: pointer; transition: 0.2s; }
                .palette-btn-premium.active { background: #18181B; border-color: #000000; color: #000000; box-shadow: inset 0 0 0 1px #000000; }
                .palette-btn-premium:hover:not(.active) { background: #f1f5f9; }
                
                .slider-group { display: flex; flex-direction: column; gap: 8px; }
                .slider-header { display: flex; justify-content: space-between; align-items: center; }
                .slider-header label { font-size: 0.7rem; font-weight: 600; color: #475569; }
                .slider-val { font-size: 0.7rem; font-weight: 700; color: #000000; background: #000000; padding: 2px 8px; border-radius: 10px; }
                .slider-premium { width: 100%; accent-color: #000000; height: 6px; border-radius: 3px; background: #e2e8f0; appearance: none; outline: none; }
                .slider-premium::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #000000; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                
                .btn-wireframe { background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; border-radius: 12px; padding: 8px; font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 4px; }
                .btn-wireframe.active { background: #000000; color: #fff; border-color: #000000; }
                
                .tool-hint-premium { color: #64748b; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 10px; border-radius: 12px; }
                
                .log-container-premium { padding: 0.5rem 1.2rem 1.2rem; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; flex-grow: 1; }
                .log-row-premium { display: flex; align-items: center; padding: 0.6rem 0.5rem; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; border-radius: 8px; }
                .log-row-premium:hover { background: #18181B; cursor: default; }
                .log-rank { font-size: 0.6rem; font-weight: 800; color: #cbd5e1; width: 20px; font-variant-numeric: tabular-nums; }
                .log-name { font-size: 0.75rem; font-weight: 600; color: #334155; flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px; }
                .log-val { font-size: 0.75rem; font-weight: 800; color: #0f172a; }
                
                .ml-panel-content { padding: 2.5rem; height: 100%; box-sizing: border-box; overflow-y: auto; }
                .ml-placeholder { background: rgba(0,0,0,0.05); border: 2px dashed rgba(0,0,0,0.05); color: #000000; padding: 3rem; text-align: center; border-radius: 20px; font-weight: 600; font-size: 1rem; }
                
                .b2b-scrollable-container::-webkit-scrollbar { width: 6px; }
                .b2b-scrollable-container::-webkit-scrollbar-track { background: transparent; }
                .b2b-scrollable-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .b2b-scrollable-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                .loader-overlay-premium { position: absolute; inset: 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(4px); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
                .spinner { width: 40px; height: 40px; border: 3px solid rgba(0,0,0,0.05); border-radius: 50%; border-top-color: #000000; animation: spin 1s infinite linear; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                .error-banner-premium { position: fixed; top: 4.5rem; right: 1rem; background: rgba(239, 68, 68, 0.86); backdrop-filter: blur(8px) saturate(1.1); -webkit-backdrop-filter: blur(8px) saturate(1.1); border: 1px solid rgba(255,255,255,0.22); color: white; padding: 0.72rem 0.9rem; border-radius: 12px; box-shadow: 0 8px 18px rgba(239, 68, 68, 0.2); z-index: 1000; display: flex; align-items: flex-start; gap: 0.65rem; max-width: 300px; animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default BigDataVisualizer;

