import os
import re
import json

def get_external_imports(directory):
    external_imports = set()
    # Match imports like: import { ... } from 'package'; or import package from 'package';
    # Also handle dynamic imports: import('package')
    import_re = re.compile(r"import\s+.*?\s+from\s+['\"]([^./][^'\"]*)['\"]|import\(['\"]([^./][^'\"]*)['\"]\)")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = import_re.findall(content)
                        for m in matches:
                            pkg = m[0] or m[1]
                            # Get the base package name (e.g., @react-oauth/google -> @react-oauth/google, axios/lib -> axios)
                            if pkg.startswith('@'):
                                pkg = '/'.join(pkg.split('/')[:2])
                            else:
                                pkg = pkg.split('/')[0]
                            external_imports.add(pkg)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return external_imports

src_dir = r'c:\Users\redja\Music\LaikaClub\src'
imports = get_external_imports(src_dir)

package_json_path = r'c:\Users\redja\Music\LaikaClub\package.json'
with open(package_json_path, 'r') as f:
    package_data = json.load(f)

dependencies = package_data.get('dependencies', {})
devDependencies = package_data.get('devDependencies', {})
all_deps = set(dependencies.keys()) | set(devDependencies.keys())

missing = imports - all_deps - {'react', 'react-dom', 'path', 'fs', 'os', 'util', 'crypto'} # exclude built-ins and react which are usually there

print("External imports found in src:")
print(sorted(list(imports)))
print("\nDependencies in package.json:")
print(sorted(list(all_deps)))
print("\nPotentially missing dependencies:")
print(sorted(list(missing)))
