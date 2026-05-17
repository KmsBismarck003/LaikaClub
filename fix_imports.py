import os
import re

moves = {
    'src/components/Icons/Icons.jsx': 1,
    'src/components/Pagination/Pagination.jsx': 1,
    'src/components/ThemeToggle/ThemeToggle.jsx': 1,
    'src/components/ScrollToTop/ScrollToTop.jsx': 1,
    'src/components/ErrorBoundary/ErrorBoundary.jsx': 1,
    'src/components/Modals/ChangePasswordModal.jsx': 1,
    'src/components/Modals/ConfirmationModal.jsx': 1,
    'src/components/Modals/UserEditModal.jsx': 1,
    'src/components/Modals/UserFormModal.jsx': 1,
    'src/components/Modals/VenueFormModal.jsx': 1,
    'src/components/Modals/UserPermissionsModal/UserPermissionsModal.jsx': 2,
    'src/components/Modals/UserPreviewModal/UserPreviewModal.jsx': 2,
    'src/components/Overlays/LockoutOverlay/LockoutOverlay.jsx': 2,
    'src/components/Overlays/WelcomeOverlay/WelcomeOverlay.jsx': 2,
    'src/components/Admin/DatabaseMonitor/DatabaseMonitor.jsx': 2,
    'src/components/Admin/AutomaticBackupConfig/AutomaticBackupConfig.jsx': 2,
    'src/components/AdCarousel/AdCarousel.jsx': 1,
    'src/components/Notifications/NotificationContainer/NotificationContainer.jsx': 2,
    'src/components/VenueMapSVG/VenueMapSVG_standalone_old.jsx': 1,
}

for file_path, depth in moves.items():
    if not os.path.exists(file_path):
        print('Missing:', file_path)
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    prefix = '../' * depth
    
    # 1. Fix imports pointing to outside components (like ../context -> ../../context)
    content = re.sub(r'from\s+[\'\"]\.\.\/(context|services|utils|hooks|routes)[\'\"]', r'from \'' + prefix + r'../\1\'', content)
    
    # 2. Fix imports pointing to same directory (like ./ -> ../)
    content = re.sub(r'from\s+[\'\"]\.\/[\'\"]', r'from \'' + prefix[:-1] + r'\'', content)
    content = re.sub(r'from\s+[\'\"]\.\/index[\'\"]', r'from \'' + prefix + r'index\'', content)
    
    # Fix specific imports like from './Alert/Alert' -> from '../Alert/Alert'
    content = re.sub(r'from\s+[\'\"]\.\/([A-Z][a-zA-Z0-9_]+\/?[a-zA-Z0-9_]*)[\'\"]', r'from \'' + prefix + r'\1\'', content)

    # Specific fix for Icons which was exported from './Icons'
    content = re.sub(r'from\s+[\'\"]\.\/Icons[\'\"]', r'from \'' + prefix + r'Icons/Icons\'', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated:', file_path)
