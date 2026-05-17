import os
import re

def resolve_path(base_dir, relative_path):
    path = os.path.normpath(os.path.join(base_dir, relative_path))
    if os.path.isfile(path) or os.path.isfile(path + '.js') or os.path.isfile(path + '.jsx') or os.path.isfile(path + '.css'): return True
    if os.path.isdir(path):
        if os.path.isfile(os.path.join(path, 'index.js')) or os.path.isfile(os.path.join(path, 'index.jsx')): return True
        base_name = os.path.basename(path)
        if os.path.isfile(os.path.join(path, base_name + '.jsx')) or os.path.isfile(os.path.join(path, base_name + '.js')): return True
    return False

broken = []
for root, _, files in os.walk(os.path.abspath('src')):
    for file in files:
        if not file.endswith(('.jsx', '.js')): continue
        fp = os.path.join(root, file)
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        imports = re.findall(r'from\s+[\'\"](\.[^\'\"]*)[\'\"]', content)
        imports += re.findall(r'import\s+[\'\"](\.[^\'\"]*)[\'\"]', content)
        for imp in imports:
            if not resolve_path(root, imp):
                broken.append(f'{fp} -> {imp}')

for b in broken: print(b)
