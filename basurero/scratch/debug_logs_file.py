import os

path = r'c:\Users\Pc\Music\laika_club_version_actual_3.0\src\pages\admin\Logs\Logs.jsx'
try:
    with open(path, 'rb') as f:
        lines = f.readlines()
        if len(lines) >= 39:
            line39 = lines[38]
            print(f"Line 39 Hex: {line39.hex()}")
            print(f"Line 39 Decoded: {line39.decode('utf-8', errors='ignore')}")
        else:
            print(f"File has only {len(lines)} lines")
except Exception as e:
    print(f"Error: {e}")
