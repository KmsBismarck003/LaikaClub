import React, { useState, useEffect, useMemo } from 'react';
import { analyticsAPI } from '../../../services/miscService';
import { eventAPI } from '../../../services/eventService';
import { Card } from '../../../components';
import Skeleton from '../../../components/Skeleton/Skeleton';
import Plot from 'react-plotly.js';
import B2BProspecting from './components/B2BProspecting';
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
  BookOpen
  ,ChevronDown
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
        event_id: ''
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
    
    // Estados para el laboratorio de clase KDD
    const [descriptiveStats, setDescriptiveStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [kddCleanResult, setKddCleanResult] = useState(null);
    const [cleanLoading, setCleanLoading] = useState(false);
    const [kddStep, setKddStep] = useState(1);
    const [simpleView, setSimpleView] = useState(true);
    const [showGlossary, setShowGlossary] = useState(false);
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
                val_num: d.ingreso_total || d.z_ingreso || 0
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
            if (mode === 'ML_REGRESSION') {
                data = await analyticsAPI.getRegressionML(managerId);
            } else if (mode === 'ML_DECISION_TREE') {
                data = await analyticsAPI.getDecisionTreeML(managerId);
            }
            setMlData(data);
        } catch (err) {
            setError('FALLO EN EL MOTOR DE MACHINE LEARNING');
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
        if (analysisMode === '3D_EXPLORATION') {
            executeAnalysis(); 
        } else if (analysisMode === 'CLASS_KDD') {
            fetchDescriptiveStats(selectedTable);
            setKddCleanResult(null);
        } else {
            executeMLAnalysis(analysisMode);
        }
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
                plotData.push(shapeFunc(gx, gx, d.val_num, normalizedZ, d.producto, i));
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

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr minmax(260px, 280px)', gap: '1.5rem' }}>
                    
                    {/* PANEL IZQUIERDO MOCK (Filtros exactos) */}
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

                </div>
            </div>
        );
    }

    return (
        <div className="analytics-premium" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '1.5rem 2rem', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* CABECERA PREMIUM */}
            <header style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backdropFilter: 'blur(20px)', borderRadius: '18px', padding: '0.85rem 1.15rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ background: '#000000', padding: '9px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <DatabaseIcon size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.06rem', letterSpacing: '-0.01em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            SALA DE ANÁLISIS {managerId ? 'DE MIS EVENTOS' : ''}
                            <span style={{ fontSize: '0.58rem', background: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>v8.5_ML</span>
                        </div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-primary)', opacity: 0.8, marginTop: '1px', fontWeight: 500 }}>
                            {managerId ? 'Filtrado por tus eventos • Modo: ' : 'Motor Distribuido: Spark ML • Modo: '}
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{analysisMode.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid #E5E7EB', padding: '4px', display: 'flex', gap: '3px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        {[
                            { id: '3D_EXPLORATION', label: 'EXPLORACIÓN 3D', icon: <Layers size={14} /> },
                            { id: 'ML_REGRESSION', label: 'REGRESIÓN ML', icon: <Activity size={14} /> },
                            { id: 'ML_DECISION_TREE', label: 'ÁRBOL DE DECISIÓN', icon: <Terminal size={14} /> },
                            { id: 'CLASS_KDD', label: 'ESTADÍSTICA & KDD', icon: <DatabaseIcon size={14} /> },
                            { id: 'B2B_PROSPECTING', label: 'PROSPECCIÓN B2B', icon: <Search size={14} /> }
                        ].map(mode => (
                            <button 
                                key={mode.id}
                                onClick={() => setAnalysisMode(mode.id)} 
                                className={`mode-btn-premium ${analysisMode === mode.id ? 'active' : ''}`}
                            >
                                {mode.icon} {mode.label}
                            </button>
                        ))}
                    </div>
                    
                    <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.06)', margin: '0 4px' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label style={{ fontSize: '0.56rem', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.8 }}>FUENTE DE DATOS</label>
                        <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="select-premium">
                            <option value="tickets">Tickets Principales</option>
                            <option value="users">Logs de Usuarios</option>
                            <option value="payments">Bóveda de Pagos</option>
                            <option value="events">Distribución de Eventos</option>
                        </select>
                    </div>
                    <button 
                        onClick={() => setShowGlossary(!showGlossary)} 
                        className="btn-secondary" 
                        style={{ 
                            background: showGlossary ? 'rgba(79, 70, 229, 0.08)' : '#f1f5f9',
            color: showGlossary ? '#111827' : '#334155',
            border: showGlossary ? '1.5px solid #111827' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '0.5rem 0.8rem',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <BookOpen size={12} /> {showGlossary ? 'Cerrar Guía' : '¿Entender Valores?'}
                    </button>
                    <button onClick={() => analysisMode === '3D_EXPLORATION' ? executeAnalysis() : executeMLAnalysis(analysisMode)} className="btn-primary" style={{ background: "#000000", color: "#FFFFFF", border: "1px solid #000000" }}>
                        <Zap size={12} /> EJECUTAR
                    </button>
                </div>
            </header>

            {showGlossary && (
                <div className="glossary-card-fadein" style={{ 
                    padding: '1.8rem', 
                    background: '#ffffff', 
                    border: '1.5px solid rgba(79, 70, 229, 0.3)', 
                    borderRadius: '24px', 
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.08)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <HelpCircle style={{ color: '#111827' }} size={20} /> Guía de Conceptos y Métricas de Big Data
                        </h3>
                        <button 
                            onClick={() => setShowGlossary(false)} 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Score R² (Precisión de Predicción)</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                Mide de 0 a 1 qué tan exacta es la estimación. <b>0.88 equivale a un 88% de precisión histórica.</b> Entre más alto, más confiable es la proyección.
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Algoritmos de Regresión</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                <b>• Lineal Simple:</b> Asume crecimiento constante.
                                <br /><b>• Polinomial (deg 2):</b> Se adapta a curvas de venta rápida o lenta.
                                <br /><b>• Ridge / Lasso:</b> Eliminan anomalías y picos extraños para evitar proyecciones irreales.
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Árbol de Decisión & Accuracy</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                <b>Accuracy (Exactitud):</b> Porcentaje de acierto para predecir éxito o fracaso de eventos.
                                <br /><b>Estructura:</b> Conjunto de preguntas automáticas (ej. ¿Venta &gt; 30?) para clasificar.
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Medidas Estadísticas (Media, Mediana, Moda)</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                <b>• Media (Promedio):</b> Suma de ingresos dividida entre el total de eventos.
                                <br /><b>• Mediana:</b> El valor central exacto de tus eventos (el punto del 50%).
                                <br /><b>• Moda:</b> El precio de boleto o tipo de ticket más vendido.
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Desviación Estándar (σ)</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                Muestra qué tanto varían tus ingresos. Una desviación alta indica gran diferencia entre eventos hiper-exitosos y eventos con poca venta; una baja indica estabilidad.
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>Las 4 Preguntas Analíticas</h4>
                            <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                                <b>• Descriptiva:</b> ¿Qué pasó?
                                <br /><b>• Diagnóstica:</b> ¿Por qué pasó?
                                <br /><b>• Predictiva:</b> ¿Qué pasará?
                                <br /><b>• Prescriptiva:</b> ¿Cómo actuar para ganar más?
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr minmax(260px, 280px)', gap: '1.5rem' }}>
                
                {/* PANEL IZQUIERDO: FILTROS */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: openFiltersPanel ? '1rem' : '0.45rem 0.75rem', height: openFiltersPanel ? 'auto' : '44px', maxHeight: openFiltersPanel ? 'none' : '44px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', backdropFilter: 'blur(20px)', borderRadius: '16px', transition: 'all 0.18s ease', flexGrow: 0 }}>
                        <button onClick={() => setOpenFiltersPanel(v => !v)} style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: openFiltersPanel ? '0.75rem' : '0', padding: 0, paddingBottom: openFiltersPanel ? '0.5rem' : 0, borderBottom: openFiltersPanel ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} color="#000000" />
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>CENTRO DE FILTROS</h3>
                          </div>
                          <ChevronDown size={16} color="#64748b" style={{ transform: openFiltersPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                        </button>
                        {openFiltersPanel && (<div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '170px', overflowY: 'auto', paddingRight: '12px' }}>
                            <div className="filter-group">
                                <label>FILTRAR POR EVENTO</label>
                                <select 
                                    name="event_id" 
                                    value={filters.event_id} 
                                    onChange={handleFilterChange} 
                                    className="select-premium"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Todos los eventos</option>
                                    {eventsList.map(ev => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.name} ({ev.venue || 'Ubicación General'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>RANGO TEMPORAL</label>
                                <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="input-premium" />
                                <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="input-premium" style={{ marginTop: '6px' }} />
                            </div>
                            <div className="filter-group">
                                <label>RANGO HORARIO (HORAS PICO)</label>
                                <select name="hour_range" value={filters.hour_range} onChange={handleFilterChange} className="select-premium" style={{ width: '100%' }}>
                                    <option value="">Todo el día</option>
                                    <option value="morning">Mañana (06:00 - 12:00)</option>
                                    <option value="afternoon">Tarde (12:00 - 18:00)</option>
                                    <option value="night">Noche (18:00 - 00:00)</option>
                                    <option value="late_night">Madrugada (00:00 - 06:00)</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>TIPO DE GRÁFICO</label>
                                <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="select-premium" style={{ width: '100%' }}>
                                    <option value="3D_BAR">3D Barras Extruidas</option>
                                    <option value="3D_SCATTER">3D Puntos de Dispersión</option>
                                    <option value="2D_PIE">2D Gráfica de Pastel</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>MODO DE COLOR</label>
                                <select value={colorMode} onChange={(e) => setColorMode(e.target.value)} className="select-premium" style={{ width: '100%' }}>
                                    <option value="palette">Continuo (Degradado Térmico)</option>
                                    <option value="solid">Sólido (Por Categoría)</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>MÉTODO DE PAGO</label>
                                <select name="payment_method" value={filters.payment_method} onChange={handleFilterChange} className="select-premium" style={{ width: '100%' }}>
                                    <option value="">Todos los métodos</option>
                                    <option value="Card">Tarjeta</option>
                                    <option value="Credits">Créditos</option>
                                    <option value="Cash">Efectivo</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>RANGO DE PRECIOS</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input type="number" name="min_price" placeholder="Mínimo" value={filters.min_price} onChange={handleFilterChange} className="input-premium" />
                                    <input type="number" name="max_price" placeholder="Máximo" value={filters.max_price} onChange={handleFilterChange} className="input-premium" />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label>ESTADO DEL TICKET</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="select-premium" style={{ width: '100%' }}>
                                    <option value="">Todos los estados</option>
                                    <option value="active">Activo</option>
                                    <option value="cancelled">Cancelado</option>
                                    <option value="pending">Pendiente</option>
                                </select>
                            </div>
                            <button onClick={executeAnalysis} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
                                APLICAR FILTROS
                            </button>
                            <button onClick={handleExportExcel} className="btn-primary" style={{ marginTop: '0.5rem', background: '#27ae60', borderColor: '#27ae60' }}>
                                EXPORTAR A EXCEL
                            </button>
                        </div>)}
                    </Card>

                    <Card style={{ padding: openColorPanel ? '1rem' : '0.45rem 0.75rem', height: openColorPanel ? 'auto' : '44px', maxHeight: openColorPanel ? 'none' : '44px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', backdropFilter: 'blur(20px)', borderRadius: '16px', transition: 'all 0.18s ease', flexGrow: 0 }}>
                        <button onClick={() => setOpenColorPanel(v => !v)} style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: openColorPanel ? '0.6rem' : '0', padding: 0, cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Palette size={16} color="#000000" />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.8, margin: 0 }}>ESQUEMA DE COLOR</h3>
                          </div>
                          <ChevronDown size={16} color="#64748b" style={{ transform: openColorPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                        </button>
                        {openColorPanel && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '110px', overflowY: 'auto', paddingRight: '6px' }}>
                            {Object.keys(palettes).map(p => (
                                <button 
                                    key={p} 
                                    onClick={()=>setColorPalette(p)} 
                                    className={`palette-btn-premium ${colorPalette === p ? 'active' : ''}`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>)}
                    </Card>
                </aside>

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
                        
                        <div style={{ minHeight: '416px', height: analysisMode === 'CLASS_KDD' ? 'auto' : '416px', background: '#f8fafc', position: 'relative' }}>
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
                            
                            {analysisMode === '3D_EXPLORATION' ? (
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
                            ) : analysisMode === 'ML_REGRESSION' ? (
                                <div className="ml-panel-content" style={{ maxHeight: '416px', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={18} color="#000000"/> 
                                            {simpleView ? 'Evaluación de Modelos de Predicción' : 'COMPARATIVA DE MODELOS (R²)'}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                                            <button 
                                                onClick={() => setSimpleView(true)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: simpleView ? '#ffffff' : 'transparent',
                                                    color: simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Vista General
                                            </button>
                                            <button 
                                                onClick={() => setSimpleView(false)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: !simpleView ? '#ffffff' : 'transparent',
                                                    color: !simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: !simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Detalle Técnico
                                            </button>
                                        </div>
                                    </div>
                                    {mlData?.model_comparison ? (
                                        simpleView ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>¿Cómo funciona esta proyección?</h3>
                                                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                                                        El sistema analiza de forma automática el histórico de entradas vendidas y los ingresos reales de tus eventos. A través de este análisis, compara diferentes métodos de cálculo para seleccionar el que proporcione el estimado más exacto.
                                                    </p>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
                                                 <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                     <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                         <HelpCircle size={16} style={{ color: '#111827' }} /> ¿Qué es el Score R²?
                                                     </div>
                                                     <p style={{ margin: 0, lineHeight: '1.4' }}>
                                                         Es el <b>Coeficiente de Determinación</b>. Mide de 0.00 a 1.00 qué tan preciso es el modelo para estimar tus ingresos según las entradas vendidas. Por ejemplo, <b>0.88 representa un 88% de precisión histórica</b>. Entre más cercano a 1.00, más confiable es la predicción.
                                                     </p>
                                                 </div>
                                                 <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                     <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                         <HelpCircle size={16} style={{ color: '#111827' }} /> ¿Qué es el Score R²?
                                                     </div>
                                                     <p style={{ margin: 0, lineHeight: '1.4' }}>
                                                         Es el <b>Coeficiente de Determinación</b>. Mide de 0.00 a 1.00 qué tan preciso es el modelo para estimar tus ingresos según las entradas vendidas. Por ejemplo, <b>0.88 representa un 88% de precisión histórica</b>. Entre más cercano a 1.00, más confiable es la predicción.
                                                     </p>
                                                 </div>
                                                 <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                     <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                         <HelpCircle size={16} style={{ color: '#111827' }} /> ¿Qué es el Score R²?
                                                     </div>
                                                     <p style={{ margin: 0, lineHeight: '1.4' }}>
                                                         Es el <b>Coeficiente de Determinación</b>. Mide de 0.00 a 1.00 qué tan preciso es el modelo para estimar tus ingresos según las entradas vendidas. Por ejemplo, <b>0.88 representa un 88% de precisión histórica</b>. Entre más cercano a 1.00, más confiable es la predicción.
                                                     </p>
                                                 </div>
                                                 <div style={{ gridColumn: 'span 2', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                     <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                         <HelpCircle size={16} style={{ color: '#111827' }} /> ¿Qué es el Score R²?
                                                     </div>
                                                     <p style={{ margin: 0, lineHeight: '1.4' }}>
                                                         Es el <b>Coeficiente de Determinación</b>. Mide de 0.00 a 1.00 qué tan preciso es el modelo para estimar tus ingresos según las entradas vendidas. Por ejemplo, <b>0.88 representa un 88% de precisión histórica</b>. Entre más cercano a 1.00, más confiable es la predicción.
                                                     </p>
                                                 </div>
                                                    <div style={{ background: mlData.best_model === 'Lineal Simple' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Proyección Directa (Lineal Simple)</div>
                                                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                                            Estima los ingresos finales proyectando las ventas actuales a un ritmo constante.
                                                        </p>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>Precisión: {Math.round((mlData.model_comparison["Lineal Simple"] || 0.85) * 100)}%</div>
                                                    </div>
                                                    <div style={{ background: mlData.best_model === 'Polinomial (deg 2)' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Proyección Avanzada (Curva Polinomial)</div>
                                                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                                            Ideal para eventos grandes, ya que detecta si el ritmo de venta se acelera o desacelera.
                                                        </p>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>Precisión: {Math.round((mlData.model_comparison["Polinomial (deg 2)"] || 0.88) * 100)}%</div>
                                                    </div>
                                                    <div style={{ background: mlData.best_model === 'Ridge' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Proyección Estabilizada (Ridge)</div>
                                                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                                            Reduce el impacto de ventas inusuales o anomalías en los precios.
                                                        </p>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>Precisión: {Math.round((mlData.model_comparison["Ridge"] || 0.84) * 100)}%</div>
                                                    </div>
                                                    <div style={{ background: mlData.best_model === 'Lasso' ? 'rgba(79, 70, 229, 0.05)' : '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Proyección Simplificada (Lasso)</div>
                                                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                                            Descarta factores de menor relevancia para centrarse en los datos más sólidos.
                                                        </p>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#111827' }}>Precisión: {Math.round((mlData.model_comparison["Lasso"] || 0.84) * 100)}%</div>
                                                    </div>

                                                    <div style={{ gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1.2rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                        El método más confiable para tus eventos actuales es <b>{mlData.best_model === 'Lineal Simple' ? 'Proyección Directa' : mlData.best_model === 'Polinomial (deg 2)' ? 'Proyección Avanzada' : mlData.best_model === 'Ridge' ? 'Proyección Estabilizada' : 'Proyección Simplificada'}</b>. Sus estimaciones de ingresos tienen la mayor precisión histórica.
                                                    </div>
                                                </div>

                                                {mlData?.predictions && mlData.predictions.length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Layers size={16} style={{ color: '#111827' }} />
                                                            Proyección de Ingresos Estimada
                                                        </h3>
                                                        
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1rem', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b' }}>
                                                            <div><b>Boletos:</b> Cantidad vendida / Total disponible.</div>
                                                            <div><b>Ganado Hoy:</b> Dinero ingresado por ventas actuales.</div>
                                                            <div><b>Estimado Final:</b> Dinero que se calcula recaudar al finalizar.</div>
                                                            <div><b>Ganancia Máxima:</b> Recaudación si se agotan las localidades.</div>
                                                        </div>

                                                        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Evento</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Lugar</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Boletos Vendidos</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Ganado Hoy</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Estimado Final</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Ganancia Máxima</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Ritmo de Ventas</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {mlData.predictions.map((p, idx) => (
                                                                        <tr key={idx} style={{ borderBottom: idx === mlData.predictions.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>{p.name}</td>
                                                                            <td style={{ padding: '12px 14px', color: '#475569' }}>
                                                                                <div style={{ fontWeight: 600 }}>{p.venue}</div>
                                                                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{p.location}</div>
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                                                                                {p.tickets_sold} / {p.total_tickets}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                                                ${p.actual_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                                                                                ${p.predicted_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                                                ${p.potential_max_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                                                <span style={{ 
                                                                                    fontSize: '0.6rem', 
                                                                                    fontWeight: 700, 
                                                                                    padding: '3px 6px', 
                                                                                    borderRadius: '20px',
                                                                                    background: p.classification === 'Venta Alta' ? '#dcfce7' : '#fee2e2',
                                                                                    color: p.classification === 'Venta Alta' ? '#15803d' : '#b91c1c'
                                                                                }}>
                                                                                    {p.classification}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
                                                {Object.entries(mlData.model_comparison).map(([name, r2]) => (
                                                    <div key={name} style={{ background: name === mlData.best_model ? 'linear-gradient(135deg, #000000, #1f2937)' : '#fff', color: name === mlData.best_model ? '#fff' : '#1e293b', padding: '1.5rem', borderRadius: '20px', boxShadow: name === mlData.best_model ? '0 10px 25px rgba(0, 0, 0, 0.28)' : '0 4px 15px rgba(0,0,0,0.03)', border: name === mlData.best_model ? 'none' : '1px solid rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8, marginBottom: '6px' }}>ALGORITMO</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{name}</div>
                                                         <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: '0 0 1rem 0', lineHeight: '1.4', minHeight: '38px' }}>
                                                             {name === "Lineal Simple" ? "Proyecta ingresos asumiendo un crecimiento lineal constante según la venta de boletos." :
                                                              name === "Polinomial (deg 2)" ? "Se adapta a curvas, ideal si el ritmo de ventas acelera o desacelera al final." :
                                                              name === "Ridge" ? "Estabiliza la proyección ignorando ventas inusuales (picos atípicos) para evitar errores." :
                                                              "Simplifica el cálculo descartando variables repetitivas y concentrándose en los datos más firmes."}
                                                         </p>

                                                        <div style={{ padding: '10px', background: name === mlData.best_model ? 'rgba(0,0,0,0.1)' : '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Score R² (Precisión)</span>
                                                            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{r2} ({Math.round(r2 * 100)}%)</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={{ gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1.2rem', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                    <Check size={16} /> EL MEJOR MODELO PARA PREDICCIÓN ES <b>{mlData.best_model} ({mlData.best_model === 'Lineal Simple' ? 'Proyección Directa' : mlData.best_model === 'Polinomial (deg 2)' ? 'Proyección Avanzada' : mlData.best_model === 'Ridge' ? 'Proyección Estabilizada' : 'Proyección Simplificada'})</b>
                                                </div>
                                                
                                                {mlData?.predictions && mlData.predictions.length > 0 && (
                                                    <div style={{ gridColumn: 'span 2', marginTop: '1.5rem' }}>
                                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Layers size={16} style={{ color: '#111827' }} />
                                                            PROYECCIÓN DE INGRESOS Y PREDICCIÓN POR EVENTO
                                                        </h3>
                                                        <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Evento</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Recinto / Ubicación</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Ventas</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Ingreso Real</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Predicción</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Ingreso Potencial (Max)</th>
                                                                        <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Clasificación</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {mlData.predictions.map((p, idx) => (
                                                                        <tr key={idx} style={{ borderBottom: idx === mlData.predictions.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>{p.name}</td>
                                                                            <td style={{ padding: '12px 14px', color: '#475569' }}>
                                                                                <div style={{ fontWeight: 600 }}>{p.venue}</div>
                                                                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{p.location}</div>
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                                                                                {p.tickets_sold} / {p.total_tickets}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                                                ${p.actual_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                                                                                ${p.predicted_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                                                                ${p.potential_max_income.toLocaleString()}
                                                                            </td>
                                                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                                                <span style={{ 
                                                                                    fontSize: '0.6rem', 
                                                                                    fontWeight: 700, 
                                                                                    padding: '3px 6px', 
                                                                                    borderRadius: '20px',
                                                                                    background: p.classification === 'Venta Alta' ? '#dcfce7' : '#fee2e2',
                                                                                    color: p.classification === 'Venta Alta' ? '#15803d' : '#b91c1c'
                                                                                }}>
                                                                                    {p.classification}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ) : <div className="ml-placeholder">Esperando datos del motor de inferencia...</div>}
                                </div>
                            ) : analysisMode === 'ML_DECISION_TREE' ? (
                                <div className="ml-panel-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Terminal size={18} color="#000000"/> 
                                            {simpleView ? 'Reglas de Clasificación de Eventos' : 'ÁRBOL DE DECISIÓN GENERADO'}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                                            <button 
                                                onClick={() => setSimpleView(true)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: simpleView ? '#ffffff' : 'transparent',
                                                    color: simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Vista General
                                            </button>
                                            <button 
                                                onClick={() => setSimpleView(false)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: !simpleView ? '#ffffff' : 'transparent',
                                                    color: !simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: !simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Detalle Técnico
                                            </button>
                                        </div>
                                    </div>
                                    {simpleView ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>¿Cómo optimiza la IA las tarifas y promociones de tus eventos?</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                                                    El modelo de Árbol de Decisión analiza el porcentaje de aforo vendido (ocupación) y la elasticidad de los precios base. Con base en el ritmo de ventas históricas, determina si es momento de subir precios para maximizar ingresos o lanzar promociones para evitar asientos vacíos.
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                                                    <div style={{ background: '#f8fafc', padding: '10px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                                                        Reglas de Clasificación Activas del Modelo
                                                    </div>
                                                    <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>A</div>
                                                            <div>
                                                                 <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Estrategia de Promoción (Baja Demanda):</div>
                                                                 <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>Ocupación menor al <b>30%</b> y precio base > $30 USD. Se recomienda activar promociones (2x1, cupones) para incentivar la demanda.</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ height: '1px', background: '#e2e8f0' }}></div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ background: '#fef3c7', color: '#d97706', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>B</div>
                                                            <div>
                                                                 <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Precio Estable / Óptimo:</div>
                                                                 <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>Ocupación entre <b>30% y 60%</b>. Venta saludable y ritmo constante. Se recomienda mantener el precio base establecido.</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ height: '1px', background: '#e2e8f0' }}></div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            <div style={{ background: '#dcfce7', color: '#15803d', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>C</div>
                                                            <div>
                                                                 <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Tarifa Dinámica (Alta Demanda):</div>
                                                                 <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>Ocupación mayor al <b>60%</b> y precio base > $30 USD. Alta demanda. Se recomienda un recargo dinámico del 15% en los boletos restantes.</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Confiabilidad del Diagnóstico</div>
                                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{Math.round(mlData?.accuracy * 100) || 95}%</div>
                                                        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '4px 0 0 0' }}>Porcentaje de exactitud del árbol de decisión validado contra datos de prueba.</p>
                                                    </div>
                                                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.2rem', borderRadius: '16px' }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Criterio de Optimización</div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>Ocupación y Elasticidad de Precios</div>
                                                        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '6px 0 0 0' }}>Variables evaluadas para maximizar las ganancias y minimizar el aforo vacío.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {mlData?.predictions && mlData.predictions.length > 0 && (
                                                <div style={{ marginTop: '1.2rem', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                                                    <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>RECOMENDACIONES DE OPTIMIZACIÓN IA POR EVENTO</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '20px' }}>
                                                            Ganancia Extra Proyectada: +${mlData.predictions.reduce((acc, curr) => acc + (curr.extra_revenue || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                                        </span>
                                                    </div>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                                                            <thead>
                                                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Evento</th>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Precio Base</th>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Ocupación</th>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'center' }}>Estado IA</th>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600 }}>Recomendación de Optimización</th>
                                                                    <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Ingreso Extra Est.</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {mlData.predictions.map((p, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: idx === mlData.predictions.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>{p.name}</td>
                                                                        <td style={{ padding: '12px 14px', color: '#475569' }}>${p.price?.toFixed(2)} USD</td>
                                                                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <div style={{ width: '50px', background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                                                    <div style={{ width: `${Math.min(100, p.ocupacion_pct)}%`, background: p.ocupacion_pct > 60 ? '#10b981' : p.ocupacion_pct < 30 ? '#ef4444' : '#f59e0b', height: '100%' }}></div>
                                                                                </div>
                                                                                <span>{p.ocupacion_pct}% ({p.cantidad_vendida}/{p.total_tickets})</span>
                                                                            </div>
                                                                        </td>
                                                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                                            <span style={{
                                                                                fontSize: '0.65rem',
                                                                                fontWeight: 700,
                                                                                padding: '3px 8px',
                                                                                borderRadius: '20px',
                                                                                background: p.classification === 'Tarifa Dinámica' ? '#dcfce7' : p.classification === 'Promoción' ? '#fee2e2' : '#fef3c7',
                                                                                color: p.classification === 'Tarifa Dinámica' ? '#15803d' : p.classification === 'Promoción' ? '#b91c1c' : '#b45309'
                                                                            }}>
                                                                                {p.classification}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 14px', fontWeight: 500, color: '#0f172a' }}>{p.recommendation}</td>
                                                                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: p.extra_revenue > 0 ? '#16a34a' : '#64748b' }}>
                                                                            {p.extra_revenue > 0 ? `+$${p.extra_revenue.toFixed(2)} USD` : '0.00 USD'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                                                 <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                     <HelpCircle size={16} style={{ color: '#111827' }} /> ¿Cómo interpretar este árbol de decisión?
                                                 </div>
                                                 <p style={{ margin: 0, lineHeight: '1.4' }}>
                                                     El árbol muestra la lógica que sigue el motor de Spark para clasificar tus eventos:
                                                     <br />• <b>total_tickets</b> representa el aforo o capacidad máxima de boletos del recinto.
                                                     <br />• <b>price</b> representa el precio unitario base de la entrada.
                                                     <br />• <b>ocupacion_pct</b> representa la relación porcentual entre boletos vendidos y aforo total.
                                                     <br />• <b>Predict: 1.0</b> significa que el evento califica para <b>Tarifa Dinámica</b> (se sugiere aumentar el precio 15%).
                                                     <br />• <b>Predict: 0.0</b> significa que el evento califica para <b>Precio Estable o Promoción</b>.
                                                 </p>
                                             </div>
                                             <div style={{ background: '#0f172a', color: 'var(--text-primary)', padding: '1.5rem', borderRadius: '16px', fontFamily: '"Fira Code", monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', border: '1px solid #1e293b', overflowY: 'auto', maxHeight: '300px', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' }}>
                                                {mlData?.tree_structure || 'Generando nodos, espere...'}
                                             </div>
                                             <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                 <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8 }}>Precisión del Modelo: <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.4rem', marginLeft: '8px' }}>{Math.round(mlData?.accuracy * 100) || 0}%</span></div>
                                                 <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px' }}>{mlData?.summary || 'N/A'}</div>
                                             </div>
                                         </>
                                     )}
                                 </div>
                             ) : analysisMode === 'B2B_PROSPECTING' ? (
                                <div style={{ padding: '1.8rem', background: '#ffffff', borderRadius: '24px' }}>
                                    <B2BProspecting />
                                </div>
                            ) : (
                                <div className="kdd-panel-content" style={{ padding: '1.8rem', color: '#1e293b', background: '#ffffff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DatabaseIcon size={22} style={{ color: '#111827' }} /> 
                                            {simpleView ? 'Descubrimiento de Información y Estadísticas' : 'PROCESO DE DESCUBRIMIENTO KDD & ESTADÍSTICA DE CLASE'}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                                            <button 
                                                onClick={() => setSimpleView(true)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: simpleView ? '#ffffff' : 'transparent',
                                                    color: simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Vista General
                                            </button>
                                            <button 
                                                onClick={() => setSimpleView(false)} 
                                                style={{
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: !simpleView ? '#ffffff' : 'transparent',
                                                    color: !simpleView ? '#0f172a' : '#64748b',
                                                    boxShadow: !simpleView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Detalle Técnico
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* PASOS DE LA METODOLOGÍA KDD */}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.8rem', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                                        {(simpleView ? [
                                            { step: 1, label: "1. Selección", desc: "Reunir información" },
                                            { step: 2, label: "2. Limpieza", desc: "Corregir errores" },
                                            { step: 3, label: "3. Formato", desc: "Organizar datos" },
                                            { step: 4, label: "4. Análisis", desc: "Aplicar fórmulas" },
                                            { step: 5, label: "5. Utilidad", desc: "Tomar decisiones" }
                                        ] : [
                                            { step: 1, label: "1. Selección", desc: "Datos relevantes" },
                                            { step: 2, label: "2. Limpieza", desc: "Pre-procesar" },
                                            { step: 3, label: "3. Transformación", desc: "Formato evaluable" },
                                            { step: 4, label: "4. Minería", desc: "Algoritmos ML" },
                                            { step: 5, label: "5. Evaluación", desc: "Interpretación" }
                                        ]).map(item => (
                                            <button 
                                                key={item.step}
                                                onClick={() => setKddStep(item.step)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 6px',
                                                    border: 'none',
                                                    background: kddStep === item.step ? 'linear-gradient(135deg, #000000, #1f2937)' : 'transparent',
                                                    color: kddStep === item.step ? '#ffffff' : '#64748b',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: '0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    boxShadow: kddStep === item.step ? '0 4px 12px rgba(0, 0, 0, 0.24)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{item.label}</span>
                                                <span style={{ fontSize: '0.65rem', opacity: kddStep === item.step ? 0.9 : 0.7, marginTop: '2px', textAlign: 'center' }}>{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* CONTENIDO DEL PASO KDD SELECCIONADO */}
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', marginBottom: '1.8rem', minHeight: '180px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
                                        {kddStep === 1 && (
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                                                    {simpleView ? 'Paso 1: Reunir la información de ventas' : 'Paso 1: Selección de Datos (Fuentes de Información)'}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                    {simpleView 
                                                        ? `En esta fase inicial, el sistema junta toda la información guardada sobre tus ${selectedTable === 'tickets' ? 'ventas de boletos' : selectedTable === 'users' ? 'usuarios registrados' : selectedTable === 'payments' ? 'pagos recibidos' : 'eventos creados'} para poder analizarla de forma global.`
                                                        : `En esta fase extraemos las muestras de datos desde la base de datos relacional MySQL (${selectedTable.toUpperCase()}) hacia nuestro motor analítico Spark.`
                                                    }
                                                </p>
                                                <div style={{ marginTop: '14px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', color: '#334155' }}>
                                                    <b>{simpleView ? 'Datos seleccionados:' : 'Dataset Jalado:'}</b> {simpleView ? `Tabla de ${selectedTable}` : `laika_club.${selectedTable}`} <br/>
                                                    <b>{simpleView ? 'Cantidad de registros encontrados:' : 'Registros Muestreados:'}</b> {canonicalData.length} registros en total.<br/>
                                                    {!simpleView && descriptiveStats && <span><b>Esquema detectado:</b> {descriptiveStats.numeric_field} (Numérico) | {descriptiveStats.categorical_field} (Categoría)</span>}
                                                </div>
                                            </div>
                                        )}
                                        {kddStep === 2 && (
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                                                    {simpleView ? 'Paso 2: Corrección y Limpieza de Errores' : 'Paso 2: Pre-Procesamiento y Preparación (Limpieza & Eliminar Duplicados)'}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', marginBottom: '14px' }}>
                                                    {simpleView
                                                        ? 'Revisamos que no haya datos incompletos o registros duplicados en el sistema que puedan alterar el resultado final de las predicciones.'
                                                        : 'Corregimos valores nulos (imputación con defaults o medias) y removemos filas redundantes para garantizar que no afecten los cálculos de los modelos ML.'
                                                    }
                                                </p>
                                                
                                                <button 
                                                    onClick={runKddCleaning}
                                                    disabled={cleanLoading}
                                                    style={{ background: '#111827', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.22)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#111827'}
                                                >
                                                    {cleanLoading ? (simpleView ? 'Corrigiendo errores en los datos...' : 'Procesando Limpieza en Spark...') : (simpleView ? 'Ejecutar Limpieza de Datos' : 'Ejecutar Limpieza KDD')}
                                                </button>

                                                {kddCleanResult && (
                                                    <div style={{ marginTop: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                                        <div style={{ fontWeight: 800, marginBottom: '6px', color: '#14532d' }}>{simpleView ? 'Resultado de la limpieza:' : 'Resultado del Pre-Procesamiento Spark:'}</div>
                                                        • {simpleView ? 'Registros antes de limpiar:' : 'Registros iniciales:'} {kddCleanResult.total_records_before} <br/>
                                                        • {simpleView ? 'Registros repetidos borrados:' : 'Duplicados eliminados:'} {kddCleanResult.duplicates_removed} <br/>
                                                        • {simpleView ? 'Datos vacíos corregidos:' : 'Nulos corregidos e imputados:'} {kddCleanResult.nulls_imputed} <br/>
                                                        • {simpleView ? 'Registros listos para el análisis:' : 'Registros limpios en memoria Spark:'} {kddCleanResult.total_records_after}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {kddStep === 3 && (
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                                                    {simpleView ? 'Paso 3: Organización de los Datos' : 'Paso 3: Transformación de Datos'}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                    {simpleView
                                                        ? 'Convertimos la información agrupándola por categorías y ordenándola de una forma estructurada para que las fórmulas matemáticas puedan interpretarla correctamente.'
                                                        : 'Convertimos los datos estructurados en formatos numéricos indexados aptos para algoritmos. Aplicamos MapReduce distribuido con Spark para agrupar variables y estructurar vectores de características (VectorAssembler) para alimentar la regresión.'
                                                    }
                                                </p>
                                                {!simpleView && (
                                                    <div style={{ marginTop: '14px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#334155' }}>
                                                        <b>Operación Spark:</b> df.groupBy("{descriptiveStats?.categorical_field}").agg(avg("{descriptiveStats?.numeric_field}"))<br/>
                                                        <b>Vectorización:</b> VectorAssembler(inputCols=["{descriptiveStats?.numeric_field}"], outputCol="features")
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {kddStep === 4 && (
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                                                    {simpleView ? 'Paso 4: Aplicación de Fórmulas Matemáticas' : 'Paso 4: Minería de Datos (Modelado / Algoritmos)'}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                    {simpleView
                                                        ? 'El sistema ejecuta los modelos predictivos para encontrar patrones históricos de venta. Esto nos permite simular estimaciones y medir qué tan exitosos serán los eventos antes de que se realicen.'
                                                        : 'Es el núcleo donde se corren los algoritmos matemáticos. El sistema tiene integrados modelos de Regresión Lineal/Polinomial/Ridge/Lasso (para proyectar montos) y Árboles de Decisión (para clasificar éxito de venta).'
                                                    }
                                                </p>
                                                <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setAnalysisMode('ML_REGRESSION')} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{simpleView ? 'Ver Proyecciones de Ingresos' : 'Ver Regresiones ML'}</button>
                                                    <button onClick={() => setAnalysisMode('ML_DECISION_TREE')} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>{simpleView ? 'Ver Reglas de Éxito' : 'Ver Árbol de Decisión'}</button>
                                                </div>
                                            </div>
                                        )}
                                        {kddStep === 5 && (
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>
                                                    {simpleView ? 'Paso 5: Tomar decisiones informadas' : 'Paso 5: Interpretación y Evaluación (Conocimiento)'}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                    {simpleView
                                                        ? 'Usamos el nivel de acierto de los modelos para tomar decisiones de negocio, como ajustar el precio de los boletos, seleccionar mejores recintos o enfocar la publicidad en zonas estratégicas.'
                                                        : 'Analizamos los indicadores de precisión (R² Score, Accuracy). Estos números determinan la utilidad real del modelo antes de mandarlo a producción para la Toma de Decisiones comerciales en LaikaClub.'
                                                    }
                                                </p>
                                                <div style={{ marginTop: '14px', background: '#ecfdf5', color: '#047857', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {simpleView 
                                                        ? 'Consejo práctico: Las proyecciones son guías de apoyo estadístico basadas en datos anteriores, no garantías absolutas. Deben combinarse con la experiencia del gestor.'
                                                        : 'Nota de clase: "El análisis predictivo requiere datos de calidad, no garantiza exactitud." Por eso evaluamos el R² de forma continua.'
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* METRICAS ESTADISTICAS DESCRIPTIVAS */}
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                                        {simpleView ? `Métricas Estadísticas Simples (${selectedTable.toUpperCase()})` : `Métricas Estadísticas Generales (${selectedTable.toUpperCase()})`}
                                    </h3>
                                    {statsLoading ? (
                                        <div style={{ padding: '1rem', textAlign: 'center' }}>{simpleView ? 'Calculando estadísticas...' : 'Calculando medidas estadísticas en Spark...'}</div>
                                    ) : descriptiveStats ? (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{simpleView ? 'Promedio General' : 'Media (Promedio)'}</span>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                                                        {selectedTable === 'users' ? descriptiveStats.mean : `$${descriptiveStats.mean.toLocaleString()}`}
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                                                        {simpleView 
                                                            ? 'El valor que resulta al sumar todos los registros y dividirlos entre la cantidad total.'
                                                            : 'Suma de todos los valores dividido entre N.'
                                                        }
                                                    </p>
                                                </div>
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{simpleView ? 'Punto Medio' : 'Mediana (Valor Medio)'}</span>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                                                        {selectedTable === 'users' ? descriptiveStats.median : `$${descriptiveStats.median.toLocaleString()}`}
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                                                        {simpleView
                                                            ? 'El dato que se encuentra exactamente en medio al ordenar todos los valores de menor a mayor.'
                                                            : 'Valor en la posición central (50% superior/inferior).'
                                                        }
                                                    </p>
                                                </div>
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '16px' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{simpleView ? 'Lo más repetido' : 'Moda (Más Repetido)'}</span>
                                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {descriptiveStats.mode}
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                                                        {simpleView
                                                            ? `El valor o categoría que se registra con mayor frecuencia (${descriptiveStats.mode_frequency} veces).`
                                                            : `Frecuencia: ${descriptiveStats.mode_frequency} veces.`
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
                                                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '16px' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309' }}>{simpleView ? 'Constancia o Variabilidad de Ventas' : 'Dispersión y Desviación Estándar (σ)'}</span>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '6px' }}>
                                                        {simpleView 
                                                            ? `Desviación: $${descriptiveStats.dispersion.standard_deviation.toLocaleString()}`
                                                            : `σ = ${descriptiveStats.dispersion.standard_deviation.toLocaleString()}`
                                                        }
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#b45309', opacity: 0.95, marginTop: '6px', lineHeight: '1.4' }}>
                                                        {!simpleView && <span>Varianza (σ²): {descriptiveStats.dispersion.variance.toLocaleString()}<br/></span>}
                                                        Rango de precios: {descriptiveStats.dispersion.range ? `$${descriptiveStats.dispersion.range}` : 'N/A'}<br/>
                                                        Mínimo: ${descriptiveStats.dispersion.min} | Máximo: ${descriptiveStats.dispersion.max}
                                                    </div>
                                                    <p style={{ fontSize: '0.7rem', color: '#b45309', opacity: 0.8, margin: '8px 0 0 0', lineHeight: '1.4' }}>
                                                        {simpleView
                                                            ? 'Mide qué tan parecidas son las ventas entre sí. Si este número es bajo, casi todos los eventos generan ingresos similares; si es alto, hay eventos con ganancias muy altas y otros muy bajas.'
                                                            : 'Mide la dispersión en la que los puntos de datos individuales difieren de la media.'
                                                        }
                                                    </p>
                                                </div>

                                                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '1rem', borderRadius: '16px' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>{simpleView ? 'Variables e Impacto Relacionados' : 'Análisis de Variables (Impacto de Clase)'}</span>
                                                    <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '6px', lineHeight: '1.5' }}>
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <b>{simpleView ? 'Causa principal analizada:' : 'Variable Independiente (X):'}</b> <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>{descriptiveStats.variables.independent}</code>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '2px' }}>{descriptiveStats.variables.independent_description}</div>
                                                        </div>
                                                        <div>
                                                            <b>{simpleView ? 'Efecto o resultado medido:' : 'Variable Dependiente (Y):'}</b> <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '4px' }}>{descriptiveStats.variables.dependent}</code>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '2px' }}>{descriptiveStats.variables.dependent_description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1rem', textAlign: 'center' }}>No se cargaron las estadísticas descriptivas.</div>
                                    )}

                                    {/* LOS 4 CUESTIONAMIENTOS */}
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem', marginTop: '1.2rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '10px' }}>
                                            {simpleView ? 'Preguntas Clave del Negocio (Tipos de Análisis)' : 'Preguntas Clave del Negocio (Tipos de Analítica)'}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                            {[
                                                { title: "¿Qué ocurrió?", type: simpleView ? "Registro Histórico" : "Descriptiva", answer: simpleView ? "Revisión simple de lo recaudado por la venta de boletos." : "Suma y MapReduce del histórico de tickets.", col: '#f0f9ff', txt: '#0369a1', border: '#e0f2fe' },
                                                { title: "¿Por qué ocurrió?", type: simpleView ? "Explicación de Causas" : "Diagnóstica", answer: simpleView ? "Entender por qué unos eventos venden más que otros según precio y lugar." : "Filtros de correlación y análisis de dispersión.", col: '#fffbeb', txt: '#b45309', border: '#fef3c7' },
                                                { title: "¿Qué podría pasar?", type: simpleView ? "Predicción de Ventas" : "Predictiva", answer: simpleView ? "Estimación de ingresos finales al ritmo actual de compra." : "Regresiones y Árbol de decisión para el éxito.", col: '#f8fafc', txt: '#111827', border: '#e5e7eb' },
                                                { title: "¿Qué podemos hacer?", type: simpleView ? "Estrategia Recomendada" : "Prescriptiva", answer: simpleView ? "Tomar decisiones de precios y recintos para asegurar la ganancia." : "Imputación inteligente y toma de decisiones VIP.", col: '#f0fdf4', txt: '#166534', border: '#dcfce7' }
                                            ].map((q, idx) => (
                                                <div key={idx} style={{ background: q.col, color: q.txt, border: `1px solid ${q.border}`, padding: '12px', borderRadius: '14px', fontSize: '0.75rem' }}>
                                                    <div style={{ fontWeight: 800 }}>{q.title}</div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', margin: '2px 0' }}>{q.type}</div>
                                                    <p style={{ margin: '6px 0 0 0', fontSize: '0.7rem', lineHeight: '1.4', opacity: 0.95 }}>{q.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* MÉTRICAS INFERIORES PREMIUM */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '1.5rem' }}>
                        <Card style={{ padding: '1.32rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: 'linear-gradient(to bottom, #000000, #000000)' }}></div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '1px' }}>INTELIGENCIA DE NEGOCIO</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.8rem' }}>Mapeo de Solidez Geográfica</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.8, lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                Renderizado inmersivo de <b>{selectedTable}</b>. La altimetría refleja el volumen financiero captado y normalizado para los análisis tácticos que has filtrado.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', background: '#f1f5f9', padding: '8px 12px', borderRadius: '12px', width: 'fit-content' }}>
                                <DatabaseIcon size={14} color="#000000" /> {canonicalData.length} Registros Activos
                            </div>
                        </Card>

                        <Card style={{ padding: '1.59rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8, marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Ingreso Consolidado (Filtro Actual)</div>
                            <div style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                ${canonicalData.reduce((acc, d) => acc + d.val_num, 0).toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)', opacity: 0.8, fontWeight: 500 }}>USD</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.8 }}>
                                    Pico Máximo: <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{canonicalData[0]?.producto?.substring(0, 20) || '---'}</strong>
                                </div>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={10} strokeWidth={3}/> VALIDADO
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>

                {/* PANEL DERECHO: HERRAMIENTAS Y LOG */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: openMetricsPanel ? '1rem' : '0.45rem 0.75rem', height: openMetricsPanel ? 'auto' : '44px', maxHeight: openMetricsPanel ? 'none' : '44px', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', transition: 'all 0.18s ease', flexGrow: 0 }}>
                        <button onClick={() => setOpenMetricsPanel(v => !v)} style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: openMetricsPanel ? '0.75rem' : '0', padding: 0, paddingBottom: openMetricsPanel ? '0.5rem' : 0, borderBottom: openMetricsPanel ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={16} color="#475569" />
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>METRÍAS PROYECCIÓN</h3>
                          </div>
                          <ChevronDown size={16} color="#64748b" style={{ transform: openMetricsPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                        </button>
                        {openMetricsPanel && (<div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '155px', overflowY: 'auto', paddingRight: '8px' }}>
                            <div className="slider-group">
                                <div className="slider-header">
                                    <label>Multiplicador de Altura</label>
                                    <span className="slider-val">{hMult}x</span>
                                </div>
                                <input type="range" min="0.5" max="5" step="0.1" value={hMult} onChange={(e)=>setHMult(parseFloat(e.target.value))} className="slider-premium" />
                            </div>
                            <div className="slider-group">
                                <div className="slider-header">
                                    <label>Grosor de Celda</label>
                                    <span className="slider-val">{barWidth}</span>
                                </div>
                                <input type="range" min="0.05" max="0.5" step="0.01" value={barWidth} onChange={(e)=>setBarWidth(parseFloat(e.target.value))} className="slider-premium" />
                            </div>
                            <div className="slider-group">
                                <div className="slider-header">
                                    <label>Grosor de Puntos (Scatter)</label>
                                    <span className="slider-val">{markerSize}px</span>
                                </div>
                                <input type="range" min="4" max="24" step="1" value={markerSize} onChange={(e)=>setMarkerSize(parseInt(e.target.value))} className="slider-premium" />
                            </div>
                            <div className="slider-group">
                                <div className="slider-header">
                                    <label>Color Personalizado (Paleta Custom)</label>
                                    <input type="color" value={customColor} onChange={(e)=>setCustomColor(e.target.value)} style={{ padding: 0, border: 'none', width: '30px', height: '18px', cursor: 'pointer', background: 'transparent' }} />
                                </div>
                            </div>
                            <div className="slider-group">
                                <div className="slider-header">
                                    <label>Opacidad Base</label>
                                    <span className="slider-val">{Math.round(opacity*100)}%</span>
                                </div>
                                <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e)=>setOpacity(parseFloat(e.target.value))} className="slider-premium" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '8px', marginTop: '0.5rem' }}>
                                <select 
                                    className="select-premium" 
                                    value={buildingShape} 
                                    onChange={(e) => setBuildingShape(e.target.value)}
                                    style={{ padding: '8px' }}
                                >
                                    <option value="cube">Cubos</option>
                                    <option value="pyramid">Pirámides</option>
                                    <option value="points">Puntos</option>
                                </select>
                                <button 
                                    onClick={()=>setIsWireframe(!isWireframe)} 
                                    className={`btn-wireframe ${isWireframe ? 'active' : ''}`}
                                >
                                    <Eye size={12}/> {isWireframe ? 'Boceto' : 'Sólido'}
                                </button>
                            </div>
                        </div>)}
                    </Card>

                    <Card style={{ padding: openLogPanel ? '0' : '0.45rem 0.75rem', height: openLogPanel ? 'auto' : '44px', maxHeight: openLogPanel ? '190px' : '44px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(20px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', flexGrow: 0, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', transition: 'all 0.18s ease' }}>
                        <button onClick={() => setOpenLogPanel(v => !v)} style={{ width: '100%', background: 'transparent', border: 'none', padding: openLogPanel ? '1rem 1.2rem' : '0', borderBottom: openLogPanel ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DatabaseIcon size={14} color="#64748b" />
                            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>LOG DE CAUDA TECTÓNICO</h3>
                          </div>
                          <ChevronDown size={16} color="#64748b" style={{ transform: openLogPanel ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                        </button>
                        {openLogPanel && (<div className="log-container-premium" style={{ maxHeight: '105px', overflowY: 'auto' }}>
                            {canonicalData.slice(0, 20).map((d, i) => (
                                <div key={i} className="log-row-premium">
                                    <span className="log-rank">{(i+1).toString().padStart(2, '0')}</span>
                                    <span className="log-name" title={d.producto}>{d.producto}</span>
                                    <span className="log-val">${d.val_num.toLocaleString()}</span>
                                </div>
                            ))}
                            {canonicalData.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>Sin datos coincidentes</div>
                            )}
                        </div>)}
                    </Card>
                </aside>
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

