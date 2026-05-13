import os

path = r'c:\Users\Pc\Music\laika_club_version_actual_3.0\src\pages\admin\Logs\Logs.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '{new Date(val).toLocaleTimeString()}'
replacement = "{new Date(val).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}"

if target in content:
    new_content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement successful.")
else:
    # Try with slightly different spacing just in case
    print("Target not found exactly, trying search...")
    import re
    new_content, count = re.subn(r'\{new Date\(val\)\.toLocaleTimeString\(\)\}', replacement, content)
    if count > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Replacement successful via regex ({count} occurrences).")
    else:
        print("Replacement failed: Target string not found.")
