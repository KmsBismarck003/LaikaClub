
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add microservices path to sys.path
base_path = Path("c:/Users/Pc/Music/laika_club_version_actual_3.0")
sys.path.append(str(base_path / "microservices" / "analytics_bigdata"))

from engine import AnalyticsEngine

def test_engine():
    print("Iniciando motor...")
    engine = AnalyticsEngine()
    
    # Simular que Spark no está listo para probar resiliencia si es necesario
    # O esperar un poco si queremos probar Spark
    print(f"Modo resiliencia: {engine.resilience_mode}")
    
    print("Probando run_analysis (mapreduce) para tickets...")
    data = engine.run_analysis(table_name="tickets", mode="mapreduce")
    print(f"Resultado mapreduce (tickets): {len(data)} filas.")
    if len(data) > 0:
        print(f"Primera fila: {data[0]}")
    else:
        print("¡ALERTA! Mapreduce devolvió 0 filas.")

    print("\nProbando run_3d_analysis para tickets...")
    data_3d = engine.run_3d_analysis(table_name="tickets")
    print(f"Resultado 3D (tickets): {len(data_3d)} filas.")
    if len(data_3d) > 0:
        print(f"Primera fila 3D: {data_3d[0]}")

if __name__ == "__main__":
    test_engine()
