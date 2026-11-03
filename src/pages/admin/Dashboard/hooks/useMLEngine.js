import { useState, useCallback } from 'react';
import { analyticsAPI } from '../../../../services/misc.service';

/**
 * useMLEngine — Hook para el motor de Machine Learning (Predicciones).
 */
export function useMLEngine(setError) {
  const [mlData, setMlData] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('2D_EXPLORATION');
  
  // Parámetros dinámicos para ML
  const [mlParams, setMlParams] = useState({
    algorithm: null, // null = automático
    maxDepth: 5,
    pcaK: 3,
    nnEpochs: 50
  });

  const executeMLAnalysis = useCallback(async (mode, customParams = null) => {
    if (mode === '2D_EXPLORATION') return;
    setMlLoading(true);
    
    // Priorizar parámetros pasados directamente (para clics rápidos), de lo contrario usar estado
    const params = customParams || mlParams;

    try {
      let response;
      if (mode === 'ML_REGRESSION') {
        response = await analyticsAPI.getRegressionML(null, params.algorithm);
      } else if (mode === 'ML_DECISION_TREE') {
        response = await analyticsAPI.getDecisionTreeML(null, params.maxDepth);
      } else if (mode === 'ML_PCA') {
        response = await analyticsAPI.getPCAML(params.pcaK); 
      } else if (mode === 'ML_NEURAL_NETWORK') {
        response = await analyticsAPI.getNeuralNetworkML(params.nnEpochs); 
      } else if (mode === 'ML_ELBOW') {
        response = await analyticsAPI.getElbowML(8);
      } else if (mode === 'ML_ANOMALY') {
        response = await analyticsAPI.getAnomalyML();
      } else if (mode === 'SCRAPING_HUB') {
        response = await analyticsAPI.scrapeFootballData("SP1");
      }
      
      const finalData = response?.data || response;
      setMlData(finalData);
    } catch (err) {
      console.error(`Fallo en el motor de Machine Learning (${mode}):`, err);
      setMlData(null);
      if (setError) setError('FALLO EN EL MOTOR DE MACHINE LEARNING: ' + (err.response?.data?.detail || err.message));
    } finally {
      setMlLoading(false);
    }
  }, [setError, mlParams]);

  const executeCustomScraping = useCallback(async (url) => {
    if (!url) return;
    setMlLoading(true);
    try {
      const data = await analyticsAPI.scrapeCustomURL(url);
      setMlData(data);
    } catch (err) {
      if (setError) setError('FALLO SCRAPING DINÁMICO: ' + (err.response?.data?.detail || err.message));
    } finally {
      setMlLoading(false);
    }
  }, [setError]);

  return { 
    mlData, 
    mlLoading, 
    analysisMode, 
    setAnalysisMode, 
    executeMLAnalysis, 
    executeCustomScraping,
    mlParams,
    setMlParams
  };
}
