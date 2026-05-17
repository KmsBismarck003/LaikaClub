import os
import re

for root, _, files in os.walk(os.path.abspath('src')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(r'from\s+[\'\"]\.\./Icons[\'\"]', r"from '../Icons/Icons'", content)
            new_content = re.sub(r'from\s+[\'\"]\./Icons[\'\"]', r"from './Icons/Icons'", new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Fixed in:', file_path)
