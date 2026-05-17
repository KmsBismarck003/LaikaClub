import os
import re

for root, _, files in os.walk(os.path.abspath('src')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # This looks for any string ending with 'components/Icons' and replaces it with 'components/Icons/Icons'
            new_content = re.sub(r'components/Icons([\'\"])', r'components/Icons/Icons\1', content)
            # Also fix PremiumGuard in MerchandiseManager or others
            new_content = re.sub(r'components/PremiumGuard([\'\"])', r'components/Guards/PremiumGuard/PremiumGuard\1', new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print("Fixed Icons/PremiumGuard import in:", file_path)
