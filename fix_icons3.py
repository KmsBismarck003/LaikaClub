import os
import re

for root, _, files in os.walk(os.path.abspath('src/components')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # This matches '../Icons' or '../../Icons' etc and adds '/Icons'
            def replacer(m):
                return f"from '{m.group(1)}Icons/Icons'"
                
            new_content = re.sub(r"from\s+['\"]((\.\./)+)Icons['\"]", replacer, content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Fixed Icons in:', file_path)
