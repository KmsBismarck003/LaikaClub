import os
import re

for root, _, files in os.walk(os.path.abspath('src')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace("components/ThemeToggle'", "components/ThemeToggle/ThemeToggle'")
            new_content = new_content.replace('components/ThemeToggle"', 'components/ThemeToggle/ThemeToggle"')
            
            # While we are at it, let's fix Pagination, ErrorBoundary, ScrollToTop
            new_content = new_content.replace("components/Pagination'", "components/Pagination/Pagination'")
            new_content = new_content.replace("components/ScrollToTop'", "components/ScrollToTop/ScrollToTop'")
            new_content = new_content.replace("components/ErrorBoundary'", "components/ErrorBoundary/ErrorBoundary'")
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Fixed in:', file_path)
