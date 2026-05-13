import React from 'react';
import { BarChart3, Maximize2, Box, Activity, Check, Terminal, Database as DatabaseIcon } from 'lucide-react';
import Plot from 'react-plotly.js';
import Card from '../../../../components/Card/Card';
import ScrapingHubDisplay from './ScrapingHubDisplay';
import NeuralBrain3D from './NeuralBrain3D';


const VisualizationDisplay = ({ 
    analysisMode, 
    loading, 
    mlLoading, 
    renderPlot, 
    mlData, 
    canonicalData, 
    colorMode, 
    solidColors, 
    selectedTable,
    buildingShape,
    executeMLAnalysis,
    executeCustomScraping,
    mlParams,
    setMlParams
}) => {
    // Handlers para interactividad
    const handleAlgoChange = (algo) => {
        const newParams = { ...mlParams, algorithm: algo };
        setMlParams(newParams);
        executeMLAnalysis('ML_REGRESSION', newParams);
    };

    const handleDepthChange = (delta) => {
        const newDepth = Math.max(1, Math.min(20, mlParams.maxDepth + delta));
        const newParams = { ...mlParams, maxDepth: newDepth };
        setMlParams(newParams);
        executeMLAnalysis('ML_DECISION_TREE', newParams);
    };

    const handlePcaKChange = (delta) => {
        const newK = Math.max(2, Math.min(10, mlParams.pcaK + delta));
        const newParams = { ...mlParams, pcaK: newK };
        setMlParams(newParams);
        executeMLAnalysis('ML_PCA', newParams);
    };

    const handleEpochsChange = (delta) => {
        const newEpochs = Math.max(10, Math.min(200, mlParams.nnEpochs + delta));
        const newParams = { ...mlParams, nnEpochs: newEpochs };
        setMlParams(newParams);
        executeMLAnalysis('ML_NEURAL_NETWORK', newParams);
    };
    return (
        <main style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr', 
            gap: '1.5rem',
            alignItems: 'start'
        }}>
            <Card style={{ 
                padding: 0, 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '32px', 
                overflow: 'hidden', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                position: 'relative',
                minHeight: (analysisMode === '2D_EXPLORATION') ? '460px' : '630px',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div style={{ 
                    padding: '1.2rem 1.5rem', 
                    borderBottom: '1px solid rgba(0,0,0,0.05)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'var(--bg-primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#000', padding: '6px', borderRadius: '10px', color: '#FFFFFF' }}>
                            <BarChart3 size={16}/>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            RENDERIZADO SKYLINE <span style={{ color: '#94a3b8', fontWeight: 500 }}>v8.5</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem' }}>
                        <div className="tool-hint-premium"><Maximize2 size={12}/> Zoom Habilitado</div>
                        <div className="tool-hint-premium">
                            <Box size={12}/> 
                            {buildingShape ? (buildingShape.charAt(0).toUpperCase() + buildingShape.slice(1)) : 'Cubo'}
                        </div>
                    </div>
                </div>
                
                <div style={{ 
                    height: (analysisMode === '2D_EXPLORATION') ? '415px' : '575px', 
                    background: 'transparent', 
                    position: 'relative',
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                }}>
                    {/* LEYENDA PREMIUM (Consolidada) */}
                    {colorMode === 'solid' && canonicalData.length > 0 && (
                        <div style={{ 
                            position: 'absolute', 
                            top: '20px', 
                            right: '20px', 
                            background: 'rgba(255, 255, 255, 0.7)', 
                            backdropFilter: 'blur(12px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                            padding: '12px 18px', 
                            borderRadius: '16px', 
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
                            border: '1px solid rgba(255,255,255,0.3)', 
                            zIndex: 100,
                            maxWidth: '450px',
                            maxHeight: '320px', 
                            overflowY: 'auto',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '6px' }}>
                                <h4 style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1a1a1a', margin: 0 }}>Distribución Clave</h4>
                                <span style={{ fontSize: '0.6rem', background: '#000', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>{canonicalData.length} CAT</span>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: canonicalData.length > 16 ? 'repeat(3, 1fr)' : canonicalData.length > 8 ? 'repeat(2, 1fr)' : '1fr',
                                gap: '10px 15px' 
                            }}>
                                {(canonicalData || []).slice(0, 48).map((d, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
                                        <div style={{ 
                                            minWidth: '10px', 
                                            height: '10px', 
                                            borderRadius: '2px', 
                                            background: solidColors[index % solidColors.length],
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}></div>
                                        <span style={{ 
                                            color: '#1a1a1a', 
                                            fontSize: '0.68rem', 
                                            fontWeight: 700, 
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis',
                                            textTransform: 'uppercase'
                                        }}>
                                            {d.producto}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {canonicalData.length > 48 && (
                                <div style={{ fontSize: '0.6rem', color: '#64748B', fontStyle: 'italic', marginTop: '10px', textAlign: 'center', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '6px' }}>
                                    + {canonicalData.length - 48} categorías adicionales en el modelo
                                </div>
                            )}
                        </div>
                    )}

                    {(loading || mlLoading) && (
                        <div className="loader-overlay-premium" style={{ borderRadius: '0', background: 'rgba(255,255,255,0.4)' }}>
                            <div className="spinner"></div>
                            <span style={{ fontWeight: 800, color: '#000', letterSpacing: '2px', fontSize: '0.7rem' }}>SINCRONIZANDO NÚCLEO...</span>
                        </div>
                    )}
                    
                    {analysisMode === '2D_EXPLORATION' ? (
                        <Plot 
                            data={renderPlot()}
                            layout={{
                                autosize: true, height: 380, margin: { l: 80, r: 40, b: 80, t: 40 },
                                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                                xaxis: { 
                                    showgrid: false, 
                                    title: { text: 'Categorías / Productos', font: { size: 10, weight: 700 } },
                                    tickangle: 90,
                                    automargin: true
                                },
                                yaxis: { 
                                    showgrid: true, 
                                    gridcolor: 'rgba(0,0,0,0.04)',
                                    zeroline: false,
                                    title: { text: 'Valor ($)', font: { size: 10, weight: 700 } }
                                },
                                showlegend: false,
                                hovermode: 'closest',
                                hoverlabel: {
                                    bgcolor: '#000000',
                                    bordercolor: '#000000',
                                    font: { color: '#ffffff', family: 'Inter', size: 12 },
                                    align: 'left'
                                },
                                transition: {
                                    duration: 500,
                                    easing: 'cubic-in-out'
                                },
                                frame: { duration: 500 }
                            }}
                            style={{ width: '100%', opacity: (loading || mlLoading) ? 0.3 : 1, transition: 'opacity 0.3s' }}
                            config={{ responsive: true, displaylogo: false }}
                        />
                    ) : analysisMode === 'ML_REGRESSION' ? (
                        <div className="ml-panel-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Activity size={18} color="#000000"/> COMPARATIVA DE MODELOS (R²)
                                </h2>
                                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                                    {['Linear', 'Ridge', 'Lasso', 'Polynomial'].map(algo => (
                                        <button
                                            key={algo}
                                            onClick={() => handleAlgoChange(algo)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                background: mlParams.algorithm === algo ? '#000' : 'transparent',
                                                color: mlParams.algorithm === algo ? '#fff' : '#64748b',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {algo.toUpperCase()}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleAlgoChange(null)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            background: mlParams.algorithm === null ? '#000' : 'transparent',
                                            color: mlParams.algorithm === null ? '#fff' : '#64748b',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        AUTO
                                    </button>
                                </div>
                            </div>
                            {mlData?.model_comparison ? (
                                <>
                                    {(mlData.data || mlData.points) && (
                                        <Plot 
                                            data={[
                                                {
                                                    x: (mlData.data || mlData.points).map(d => d.x),
                                                    y: (mlData.data || mlData.points).map(d => d.y),
                                                    mode: 'markers',
                                                    name: 'Datos Reales',
                                                    marker: { color: 'rgba(0,0,0,0.3)', size: 8 }
                                                },
                                                {
                                                    x: mlData.data ? mlData.data.map(d => d.x) : mlData.points.map(d => d.x),
                                                    y: mlData.data 
                                                        ? mlData.data.map(d => d.y_pred) 
                                                        : mlData.points.map(d => mlData.coefficients.m * d.x + mlData.coefficients.b),
                                                    mode: 'lines',
                                                    name: 'Predicción',
                                                    line: { color: '#000', width: 3 }
                                                }
                                            ]}
                                            layout={{
                                                autosize: true, height: 190, margin: { l: 40, r: 20, b: 40, t: 10 },
                                                paper_bgcolor: 'transparent',
                                                xaxis: { title: 'X (Cantidad)', gridcolor: '#f1f5f9' },
                                                yaxis: { title: 'Y (Ingreso)', gridcolor: '#f1f5f9' },
                                                showlegend: false
                                            }}
                                            style={{ width: '100%', marginBottom: '1.5rem' }}
                                            config={{ responsive: true, displaylogo: false }}
                                        />
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
                                        {Object.entries(mlData.model_comparison).map(([name, r2]) => (
                                            <div 
                                                key={name} 
                                                style={{ 
                                                    background: name === mlData.best_model ? 'linear-gradient(135deg, #000, #333)' : '#fff', 
                                                    color: name === mlData.best_model ? '#fff' : '#1e293b', 
                                                    padding: '1.2rem', 
                                                    borderRadius: '20px', 
                                                    boxShadow: name === mlData.best_model ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.03)', 
                                                    border: name === mlData.best_model ? 'none' : '1px solid rgba(0,0,0,0.05)', 
                                                }}
                                            >
                                                <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.8, marginBottom: '6px' }}>ALGORITMO</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.8rem' }}>{name}</div>
                                                <div style={{ padding: '8px', background: name === mlData.best_model ? 'rgba(255,255,255,0.1)' : '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Score R²</span>
                                                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{r2}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {mlData.best_model && (
                                            <div style={{ gridColumn: 'span 2', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1rem', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                <Check size={16} /> EL MEJOR MODELO ES <b>{mlData.best_model}</b>
                                            </div>
                                        )}
                                    </div>
                                    {mlData.insights && (
                                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '2px' }}>INSIGHTS DE IA DEEP-CORE</div>
                                            {mlData.insights.map((insight, i) => (
                                                <div key={i} style={{ background: '#f1f5f9', padding: '10px 15px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#475569', borderLeft: '4px solid #000' }}>
                                                    {insight}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : <div className="ml-placeholder">Esperando datos del motor de inferencia...</div>}
                        </div>
                    ) : analysisMode === 'ML_DECISION_TREE' ? (
                        <div className="ml-panel-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Terminal size={18} color="#000000"/> ÁRBOL DE DECISIÓN GENERADO
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#000', padding: '6px 12px', borderRadius: '12px', color: '#fff' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px' }}>PROFUNDIDAD:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleDepthChange(-1)}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}
                                        >-</button>
                                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{mlParams.maxDepth}</span>
                                        <button 
                                            onClick={() => handleDepthChange(1)}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ 
                                background: '#000000', 
                                color: '#ffffff', 
                                padding: '1.5rem', 
                                borderRadius: '16px', 
                                fontFamily: '"Fira Code", monospace', 
                                fontSize: '0.85rem', 
                                whiteSpace: 'pre-wrap', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                overflowY: 'auto', 
                                maxHeight: '300px', 
                                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' 
                            }}>
                                {mlData?.tree_structure || 'Generando nodos, espere...'}
                            </div>
                            <div style={{ 
                                marginTop: '1rem', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                background: '#fff', 
                                padding: '1rem 1.5rem', 
                                borderRadius: '16px', 
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                                border: '1px solid rgba(0,0,0,0.05)' 
                            }}>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', opacity: 0.8 }}>
                                    Precisión: <span style={{ color: '#000', fontWeight: 800, fontSize: '1.4rem', marginLeft: '8px' }}>{Math.round(mlData?.accuracy * 100) || 0}%</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px' }}>
                                    {mlData?.summary || 'N/A'}
                                </div>
                            </div>
                            {mlData?.insights && (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {mlData.insights.map((insight, i) => (
                                        <div key={i} style={{ background: '#000', color: '#fff', padding: '10px 15px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>
                                             {insight}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : analysisMode === 'ML_PCA' ? (
                        <div style={{ height: '400px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 110, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', padding: '8px 15px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#000' }}>COMPONENTES (K):</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => handlePcaKChange(-1)} style={{ background: '#000', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                                    <span style={{ fontWeight: 800 }}>{mlParams.pcaK}</span>
                                    <button onClick={() => handlePcaKChange(1)} style={{ background: '#000', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                </div>
                            </div>
                            {mlData?.data ? (
                                <Plot 
                                    data={[{
                                        x: mlData.data.map(d => d.pca[0]),
                                        y: mlData.data.map(d => d.pca[1]),
                                        mode: 'markers',
                                        type: 'scatter',
                                        marker: {
                                            size: 10,
                                            color: mlData.data.map(d => d.cluster),
                                            colorscale: 'Viridis',
                                            opacity: 0.8,
                                            line: { color: '#000', width: 1 }
                                        },
                                        text: mlData.data.map(d => `Cluster ${d.cluster} | Info: ${d.metrics?.producto || 'Registro'}`)
                                    }]}
                                    layout={{
                                        autosize: true, height: 400, margin: { l: 60, r: 40, b: 60, t: 40 },
                                        paper_bgcolor: 'transparent',
                                        plot_bgcolor: 'transparent',
                                        xaxis: { title: 'Firma de Datos 1 (PCA)', showgrid: true, gridcolor: '#e2e8f0' },
                                        yaxis: { title: 'Firma de Datos 2 (PCA)', showgrid: true, gridcolor: '#e2e8f0' },
                                        showlegend: false
                                    }}
                                    style={{ width: '100%' }}
                                    config={{ responsive: true, displaylogo: false }}
                                />
                            ) : <div className="ml-placeholder">Procesando reducción de dimensiones...</div>}
                        </div>
                    ) : analysisMode === 'SCRAPING_HUB' ? (
                        <ScrapingHubDisplay 
                            mlData={mlData} 
                            mlLoading={mlLoading} 
                            executeMLAnalysis={executeMLAnalysis} 
                            executeCustomScraping={executeCustomScraping}
                        />
                    ) : (
                          <div className="ml-panel-content">
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                 <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                     <Activity size={18} color="#000000"/> ENTRENAMIENTO DE RED NEURONAL (DEEP LEARNING)
                                 </h2>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '12px' }}>
                                     <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>ÉPOCAS:</span>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                         <button onClick={() => handleEpochsChange(-10)} style={{ background: '#e2e8f0', border: 'none', color: '#000', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }}>-</button>
                                         <span style={{ fontWeight: 800, minWidth: '30px', textAlign: 'center' }}>{mlParams.nnEpochs}</span>
                                         <button onClick={() => handleEpochsChange(10)} style={{ background: '#e2e8f0', border: 'none', color: '#000', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }}>+</button>
                                     </div>
                                 </div>
                             </div>
                             <div style={{ position: 'relative', height: '100%', minHeight: '575px', background: '#000', borderRadius: '32px', overflow: 'hidden' }}>
                                 {/* 1. EL CEREBRO 3D (Siempre visible y central) */}
                                 <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                     <NeuralBrain3D isReasoning={mlLoading || loading || !!mlData?.loss_history} />
                                 </div>

                                 {/* 2. OVERLAY HUD: GRÁFICA DE ENTRENAMIENTO (Si hay datos) */}
                                 {mlData?.loss_history && (
                                     <div style={{ 
                                         position: 'absolute', 
                                         bottom: '20px', 
                                         left: '20px', 
                                         zIndex: 10, 
                                         width: '200px', 
                                         background: 'rgba(0,0,0,0.6)', 
                                         backdropFilter: 'blur(10px)',
                                         padding: '10px',
                                         borderRadius: '16px',
                                         border: '1px solid rgba(255,255,255,0.1)',
                                         boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                         pointerEvents: 'none'
                                     }}>
                                         <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#fff', marginBottom: '8px', letterSpacing: '2px', opacity: 0.8 }}>CURVA DE PÉRDIDA (LOSS)</div>
                                         <Plot 
                                             data={[{
                                                 x: mlData.loss_history.map(h => h.epoch),
                                                 y: mlData.loss_history.map(h => h.loss),
                                                 type: 'scatter',
                                                 mode: 'lines',
                                                 line: { color: '#fff', width: 2, shape: 'spline' }
                                             }]}
                                             layout={{
                                                 autosize: true, height: 80, margin: { l: 0, r: 0, b: 0, t: 0 },
                                                 paper_bgcolor: 'transparent',
                                                 plot_bgcolor: 'transparent',
                                                 xaxis: { visible: false },
                                                 yaxis: { visible: false }
                                             }}
                                             style={{ width: '100%' }}
                                             config={{ responsive: true, displaylogo: false, staticPlot: true }}
                                         />
                                         <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>EP: {mlData.loss_history.length}</span>
                                            <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 800 }}>IA_CORE_ACTIVE</span>
                                         </div>
                                     </div>
                                 )}

                                 {/* 3. OVERLAY HUD: RESUMEN DE PENSAMIENTO (Si hay datos) */}
                                 {mlData?.summary && (
                                     <div style={{ 
                                         position: 'absolute', 
                                         top: '20px', 
                                         right: '20px', 
                                         zIndex: 10, 
                                         maxWidth: '160px', 
                                         background: 'rgba(255,255,255,0.03)', 
                                         backdropFilter: 'blur(12px)',
                                         padding: '10px',
                                         borderRadius: '12px',
                                         border: '1px solid rgba(255,255,255,0.1)',
                                         color: '#fff'
                                     }}>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                             <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff' }}></div>
                                             <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '1px' }}>LAIKA_BRAIN_V3</span>
                                         </div>
                                         <div style={{ fontSize: '0.65rem', lineHeight: '1.3', opacity: 0.8, fontWeight: 500 }}>
                                             {mlData.summary}
                                         </div>
                                     </div>
                                 )}

                                 {/* 4. OVERLAY: MENSAJE DE ESTADO (Fallback) */}
                                 {(!mlData?.loss_history && (mlLoading || loading)) && (
                                     <div style={{ 
                                         position: 'absolute', 
                                         bottom: '40px', 
                                         textAlign: 'center', 
                                         width: '100%', 
                                         zIndex: 15,
                                         pointerEvents: 'none'
                                     }}>
                                         <div style={{ 
                                             display: 'inline-block',
                                             padding: '10px 25px',
                                             background: 'rgba(255,255,255,0.1)',
                                             backdropFilter: 'blur(20px)',
                                             borderRadius: '50px',
                                             color: '#fff',
                                             fontSize: '0.7rem',
                                             fontWeight: 800,
                                             letterSpacing: '4px',
                                             border: '1px solid rgba(255,255,255,0.2)'
                                         }}>
                                             SINCRONIZANDO SINAPSIS DIGITALES...
                                         </div>
                                     </div>
                                 )}
                             </div>
                         </div>
                    )}
                </div>
            </Card>

        </main>
    );
};

export default VisualizationDisplay;
