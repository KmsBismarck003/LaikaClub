import sys
import os

# Asegurar que el directorio raíz del proyecto esté en sys.path para importaciones de paquetes
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from microservices.analytics_bigdata.engine import AnalyticsEngine
    print("[TEST] Importación de AnalyticsEngine (absoluta): EXITOSA")
except Exception as e:
    print(f"[TEST] Error al importar AnalyticsEngine: {e}")
    sys.exit(1)

def test_features():
    print("\n--- INICIANDO VERIFICACIÓN DE FUNCIONALIDADES MODULARES ---\n")
    
    try:
        engine = AnalyticsEngine()
        print("[1] Inicialización del motor: OK")
    except Exception as e:
        print(f"[1] Error al inicializar el motor: {e}")
        return

    # 1. EXPLORACIÓN 2D (MapReduce)
    print("\n[2] Verificando EXPLORACIÓN 2D...")
    try:
        res_2d = engine.run_analysis(table_name="tickets", mode="mapreduce")
        print(f"   - Estatus: {'OK' if res_2d else 'Vacio/Error'}")
        print(f"   - Muestra: {res_2d[:1] if isinstance(res_2d, list) else res_2d}")
    except Exception as e:
        print(f"   - Error: {e}")

    # 2. REGRESIÓN ML
    print("\n[3] Verificando REGRESIÓN ML...")
    try:
        res_reg = engine.predict_regression()
        print(f"   - Estatus: {res_reg.get('status', 'Error')}")
        if "model_comparison" in res_reg:
            print(f"   - Modelos: {res_reg['model_comparison']}")
    except Exception as e:
        print(f"   - Error: {e}")

    # 3. ÁRBOL DE DECISIÓN
    print("\n[4] Verificando ÁRBOL DE DECISIÓN...")
    try:
        res_class = engine.predict_classification()
        print(f"   - Estatus: {res_class.get('status', 'Error')}")
        if "accuracy" in res_class:
            print(f"   - Accuracy: {res_class['accuracy']}")
    except Exception as e:
        print(f"   - Error: {e}")

    # 4. PCA CLUSTERING
    print("\n[5] Verificando PCA CLUSTERING...")
    try:
        res_pca = engine.run_pca_analysis()
        print(f"   - Estatus: {res_pca.get('status', 'Error')}")
        if "varianza_explicada" in res_pca:
            print(f"   - Varianza: {res_pca['varianza_explicada']}")
    except Exception as e:
        print(f"   - Error: {e}")

    # 5. RED NEURONAL
    print("\n[6] Verificando RED NEURONAL...")
    try:
        # Usamos pocos epochs para el test rápido
        res_nn = engine.run_neural_network_analysis(epochs=5)
        print(f"   - Estatus: {res_nn.get('status', 'Error')}")
        if "loss_history" in res_nn:
            print(f"   - Historia Loss (último): {res_nn['loss_history'][-1] if res_nn['loss_history'] else 'N/A'}")
    except Exception as e:
        print(f"   - Error: {e}")

    print("\n--- FIN DE LA VERIFICACIÓN ---")

if __name__ == "__main__":
    test_features()
