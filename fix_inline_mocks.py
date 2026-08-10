import os
import re

directory = r"c:\Users\redja\Music\entorno laika\PruebaJava\LaikaClub\src\matis\pages"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Regex to find `|| '...'` or `|| 123` inside JSX curly braces.
    # We want to replace `|| '184,250'` with `|| '0'` or just remove it, but `|| 0` is better for numerical KPIs, or `'N/A'`.
    # Let's replace `|| '.*?'` with `|| '0'` and `|| \d+` with `|| 0` when it's a KPI value fallback.
    content = re.sub(r"\|\|\s*'[\d,\.\%]+'", "|| '0'", content)
    content = re.sub(r"\|\|\s*\"\d[\d,\.\%]*\"", "|| '0'", content)
    
    # Let's also look at specific cases: `|| 8`, `|| 4600` etc.
    # It's safer to just replace `|| [number]` with `|| 0`.
    content = re.sub(r"\|\|\s*\d+", "|| 0", content)

    # Some variables like `data.kpis?.active_users?.toLocaleString() || '1,420'`
    # We just replaced `'1,420'` with `'0'`.
    # That satisfies "sin mocks". 0 is not a mock, it's a fallback for empty state.
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed inline mocks in {os.path.basename(filepath)}")

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        process_file(os.path.join(directory, filename))
