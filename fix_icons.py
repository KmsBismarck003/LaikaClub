import os
import re

files = [
    'src/components/Notifications/NotificationPanel.jsx',
    'src/components/Notifications/NotificationDetailModal.jsx',
    'src/components/Notifications/NotificationBell.jsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        content = re.sub(r"from\s+['\"].\./Icons['\"]", "from '../Icons/Icons'", content)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
