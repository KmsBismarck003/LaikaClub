import time
import sys
import os
from datetime import datetime

# Asegurar que el directorio raíz del proyecto esté en sys.path para importaciones de paquetes
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from microservices.analytics_bigdata.engine import AnalyticsEngine
except Exception as e:
    print(f"[ERROR] No se pudo cargar el motor: {e}")
    sys.exit(1)

def benchmark_feature(name, func, *args, **kwargs):
    print(f"\n[*] Ejecutando: {name}...")
    start_time = time.time()
    try:
        result = func(*args, **kwargs)
        elapsed = time.time() - start_time
        status = "✅ EXITOSA" if (isinstance(result, list) or (isinstance(result, dict) and result.get("status") == "success")) else "❌ FALLIDA"
        print(f"   - Estatus: {status}")
        print(f"   - Tiempo: {elapsed:.2f} segundos")
        
        if isinstance(result, dict):
            if "accuracy" in result: print(f"   - Métrica (Accuracy): {result['accuracy']}")
            if "r2" in result: print(f"   - Métrica (R2): {result['r2']}")
            if "model_comparison" in result: print(f"   - Comparativa: {result['model_comparison']}")
            if "data" in result and isinstance(result["data"], list): 
                print(f"   - Volumen de salida: {len(result['data'])} registros")
        elif isinstance(result, list):
            print(f"   - Volumen de salida: {len(result)} agregaciones")
            
        return elapsed, status
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"   - 🚨 ERROR: {e}")
        return elapsed, "🚨 ERROR"

def run_stress_suite():
    print("="*60)
    print("🚀 LAIKA BIG DATA BENCHMARK - 100,000 REGISTROS")
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    engine = AnalyticsEngine()
    print(f"[*] Modo de Operación: {'RESILIENCIA (SQL)' if engine.resilience_mode else 'SPARK (Distribuido)'}")
    
    stats = {}
    
    # 1. EXPLORACIÓN 2D
    stats["EXPLORACIÓN 2D"] = benchmark_feature("EXPLORACIÓN 2D (MapReduce)", engine.run_analysis, table_name="tickets", mode="mapreduce")
    
    # 2. REGRESIÓN ML
    stats["REGRESIÓN ML"] = benchmark_feature("REGRESIÓN ML (Múltiples Modelos)", engine.predict_regression)
    
    # 3. ÁRBOL DE DECISIÓN
    stats["ÁRBOL DE DECISIÓN"] = benchmark_feature("ÁRBOL DE DECISIÓN (Clasificación)", engine.predict_classification)
    
    # 4. PCA CLUSTERING
    stats["PCA CLUSTERING"] = benchmark_feature("PCA CLUSTERING (Reducción Dimensional)", engine.run_pca_analysis, k=3)
    
    # 5. RED NEURONAL
    stats["RED NEURONAL"] = benchmark_feature("RED NEURONAL (PyTorch - 50 Epochs)", engine.run_neural_network_analysis, epochs=50)
    
    print("\n" + "="*60)
    print("📊 RESUMEN FINAL DE RENDIMIENTO")
    print("="*60)
    print(f"{'Algoritmo':<30} | {'Tiempo':<10} | {'Estatus'}")
    print("-" * 60)
    for name, (t, s) in stats.items():
        print(f"{name:<30} | {t:>8.2f}s | {s}")
    print("="*60)

if __name__ == "__main__":
    run_stress_suite()
