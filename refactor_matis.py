import os
import re

directory = r"c:\Users\redja\Music\entorno laika\PruebaJava\LaikaClub\src\matis\pages"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Add JSDoc to the top if not present and if it's a valid jsx file
    if "import React" in content and "/**" not in content[:500]:
        doc_string = """/**
 * Módulo MATIS - Analytics Platform
 * Esta vista interactúa con la API para extraer datos reales del negocio.
 * SE HA ELIMINADO EL USO DE MOCKS (DATOS FALSOS) PARA ASEGURAR INTEGRIDAD ANALÍTICA.
 * Si la API no retorna datos, las gráficas se renderizarán vacías,
 * respetando el principio fundamental de no mostrar información falsa.
 */
"""
        content = doc_string + content

    # Remove multi-line mock definitions: const defaultX = [ ... ] or const defaultX = { ... }
    # This regex looks for `const default[A-Z]\w* = [\[\{][\s\S]*?[\]\}]` but we have to be careful with nested brackets.
    # It's safer to remove specific named defaults based on `default[A-Z]\w*` up to the next blank line or `const` definition.
    content = re.sub(r'(\s+)const default\w+\s*=\s*\[[\s\S]*?(?=\n\s+const|\n\s+if|\n\s+return)', '', content)
    content = re.sub(r'(\s+)const default\w+\s*=\s*\{[\s\S]*?(?=\n\s+const|\n\s+if|\n\s+return)', '', content)

    # Sometimes they might end with a blank line instead of `const` or `return`
    # Let's clean up assignments
    content = re.sub(r'const (\w+) = (\w+\.\w+)\.length > 0 \? \2 : default\w+', r'const \1 = \2 || []', content)
    content = re.sub(r'const (\w+) = Object\.keys\((.*?)\)\.length > 0 \? \2 : default\w+', r'const \1 = \2 || {}', content)
    content = re.sub(r'const (\w+) = (.*?)\.length > 0 \? \2 : default\w+', r'const \1 = \2 || []', content)
    content = re.sub(r'const (\w+) = (.*?)\.models \|\| default\w+\.models', r'const \1 = \2.models || []', content)
    content = re.sub(r'const (\w+) = (.*?) \|\| default\w+', r'const \1 = \2 || []', content)

    # Some variables like `defaultDetails` might still be there, let's remove any remaining `const default\w+ = ...`
    content = re.sub(r'const default\w+\s*=\s*\[.*\]', '', content)
    
    # Write back if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored {os.path.basename(filepath)}")

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        process_file(os.path.join(directory, filename))
