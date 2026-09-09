import os
import re
import shutil
from pathlib import Path

MONOLITH_DIR = Path('c:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/src')
TARGET_DIR = Path('c:/Users/redja/Music/entorno laika/PruebaJava/LaikaClub/laika-operador/src')

# Directories or files to start with
ENTRYPOINTS = [
    'pages/staff',
    'pages/Login',
    'layouts/DashboardLayout.jsx',
    'layouts/DashboardLayout.css',
    'layouts/AuthLayout.jsx',
    'layouts/AuthLayout.css',
    'App.jsx',
    'index.js',
]

def copy_file_or_dir(src_rel_path, target_rel_path=None):
    if target_rel_path is None:
        target_rel_path = src_rel_path
        
    src_path = MONOLITH_DIR / src_rel_path
    target_path = TARGET_DIR / target_rel_path
    
    if not src_path.exists():
        print(f"Warning: {src_path} does not exist")
        return False
        
    target_path.parent.mkdir(parents=True, exist_ok=True)
    
    if src_path.is_dir():
        if target_path.exists():
            shutil.rmtree(target_path)
        shutil.copytree(src_path, target_path)
        print(f"Copied directory {src_path} to {target_path}")
    else:
        shutil.copy2(src_path, target_path)
        print(f"Copied file {src_path} to {target_path}")
    return True

# 1. Copy Entrypoints
for entry in ENTRYPOINTS:
    copy_file_or_dir(entry)

# 2. Extract dependencies recursively
# We will look for imports in JS/JSX files
IMPORT_REGEX = re.compile(r'''import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]''')

def get_js_files(directory):
    files = []
    for ext in ['*.js', '*.jsx', '*.css']:
        files.extend(list(directory.rglob(ext)))
    return files

visited_files = set()

def resolve_import(current_file, import_path):
    # Handle aliases or absolute paths if any, mostly they are relative
    if not import_path.startswith('.'):
        return None # likely an npm package or alias not pointing to local file
        
    resolved_path = (current_file.parent / import_path).resolve()
    
    # Check if it's inside TARGET_DIR
    try:
        resolved_path.relative_to(TARGET_DIR)
        
        # It's inside TARGET_DIR, we need to map it back to MONOLITH_DIR to find the source
        rel_to_target = resolved_path.relative_to(TARGET_DIR)
        monolith_path = MONOLITH_DIR / rel_to_target
        
        # Extensions to try
        if monolith_path.exists() and monolith_path.is_file():
            return monolith_path
        elif monolith_path.is_dir() and (monolith_path / 'index.js').exists():
            return monolith_path / 'index.js'
        elif monolith_path.is_dir() and (monolith_path / 'index.jsx').exists():
            return monolith_path / 'index.jsx'
        
        for ext in ['.js', '.jsx', '.css', '.png', '.svg', '.jpg']:
            if monolith_path.with_suffix(ext).exists():
                return monolith_path.with_suffix(ext)
                
        return None
    except ValueError:
        return None

def process_file(file_path):
    if file_path in visited_files:
        return
    visited_files.add(file_path)
    
    if not file_path.exists():
        return
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return # Skip non-text files
        
    imports = IMPORT_REGEX.findall(content)
    # Also handle require
    require_imports = re.findall(r'''require\(['"]([^'"]+)['"]\)''', content)
    imports.extend(require_imports)
    
    for imp in imports:
        source_path = resolve_import(file_path, imp)
        if source_path and source_path.exists():
            rel_path = source_path.relative_to(MONOLITH_DIR)
            target_path = TARGET_DIR / rel_path
            
            if not target_path.exists():
                target_path.parent.mkdir(parents=True, exist_ok=True)
                if source_path.is_dir():
                    pass
                else:
                    shutil.copy2(source_path, target_path)
                    print(f"Copied dependency {source_path} to {target_path}")
                    process_file(target_path)
                    
            if target_path.exists():
                process_file(target_path)

# Start recursive dependency extraction
files = get_js_files(TARGET_DIR)
for file in files:
    process_file(file)

# Copy all assets just in case
if (MONOLITH_DIR / 'assets').exists():
    if not (TARGET_DIR / 'assets').exists():
        shutil.copytree(MONOLITH_DIR / 'assets', TARGET_DIR / 'assets')

# Additional shared folders that are often needed entirely
for shared_dir in ['components', 'context', 'hooks', 'services', 'utils', 'styles', 'routes']:
    src_dir = MONOLITH_DIR / shared_dir
    tgt_dir = TARGET_DIR / shared_dir
    if src_dir.exists() and not tgt_dir.exists():
        shutil.copytree(src_dir, tgt_dir)
        print(f"Copied shared directory {src_dir} to {tgt_dir}")

print("Migration script completed.")
