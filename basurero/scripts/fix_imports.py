"""
fix_imports.py
Corrige los imports absolutos 'from src.X' a imports relativos correctos
en todos los archivos de la carpeta microservices/*/src/

FÓRMULA CORRECTA:
  Para microservices.admin.src.infrastructure.repositories.file
  -> Para llegar a 'src', subir depth=2 niveles
  -> dots = '.' * (depth+1) = '...' (3 puntos)
  -> 'from ...domain.X' = 'from microservices.admin.src.domain.X' ✓
"""
import os
import re

MICROSERVICES_DIR = os.path.join(os.path.dirname(__file__), "..", "microservices")

def compute_relative_prefix(filepath):
    parts = filepath.replace("\\", "/").split("/")
    try:
        src_idx = None
        for i, p in enumerate(parts):
            if p == "src" and i > 0:
                src_idx = i
        if src_idx is None:
            return None

        # depth = número de subdirectorios dentro de src (excluye el propio archivo)
        # src/X/Y/file.py -> depth=2 -> dots='...' (3 puntos)
        depth = len(parts) - src_idx - 2
        dots = "." * (depth + 1)
        return dots
    except:
        return None

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    dots = compute_relative_prefix(filepath)
    if dots is None:
        print(f"  [SKIP] No se pudo determinar la ruta relativa para: {filepath}")
        return

    # Reemplazar 'from src.X.Y.Z import ...' -> 'from {dots}X.Y.Z import ...'
    content = re.sub(
        r'from src\.([\w.]+) import',
        lambda m: f'from {dots}{m.group(1)} import',
        content
    )

    # También corregir 'import src.X.Y' si existe
    content = re.sub(
        r'import src\.([\w.]+)',
        lambda m: f'import {dots}{m.group(1)}',
        content
    )

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [FIXED] {filepath}")
    else:
        print(f"  [OK]    {filepath}")

def main():
    print("=" * 60)
    print("  LAIKA CLUB - Fix Absolute Imports en src/")
    print("=" * 60)

    total = 0

    for service in os.listdir(MICROSERVICES_DIR):
        service_path = os.path.join(MICROSERVICES_DIR, service)
        if not os.path.isdir(service_path):
            continue

        src_path = os.path.join(service_path, "src")
        if not os.path.isdir(src_path):
            continue

        print(f"\n[SERVICE] {service}")

        for root, dirs, files in os.walk(src_path):
            dirs[:] = [d for d in dirs if d != "__pycache__"]
            for file in files:
                if not file.endswith(".py"):
                    continue
                filepath = os.path.join(root, file)
                total += 1
                fix_file(filepath)

    print("\n" + "=" * 60)
    print(f"  Procesados: {total} archivos")
    print("  Revisa los [FIXED] arriba para ver que cambio.")
    print("=" * 60)

if __name__ == "__main__":
    main()
