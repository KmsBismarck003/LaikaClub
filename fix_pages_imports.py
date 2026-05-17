import os

replacements = {
    # Pages fixing
    'components/AutomaticBackupConfig': 'components/Admin/AutomaticBackupConfig/AutomaticBackupConfig',
    'components/UserPermissionsModal': 'components/Modals/UserPermissionsModal/UserPermissionsModal',
    'components/UserFormModal': 'components/Modals/UserFormModal',
    'components/UserEditModal': 'components/Modals/UserEditModal',
    'components/UserPreviewModal': 'components/Modals/UserPreviewModal/UserPreviewModal',
    'components/ConfirmationModal': 'components/Modals/ConfirmationModal',
    'components/VenueFormModal': 'components/Modals/VenueFormModal',
    'components/PremiumGuard': 'components/Guards/PremiumGuard/PremiumGuard',
    'components/LockoutOverlay': 'components/Overlays/LockoutOverlay/LockoutOverlay',
    'components/WelcomeOverlay': 'components/Overlays/WelcomeOverlay/WelcomeOverlay',
    
    # Internal component fixing
    '../utils/imageUtils': '../../utils/imageUtils',
    '../services/api': '../../services/api',
    '../context/AuthContext': '../../context/AuthContext',
    '../context/NotificationContext': '../../context/NotificationContext',
    '../context/ThemeContext': '../../context/ThemeContext',
    '../context/CartContext': '../../context/CartContext',
    '../hooks/useUserPermissions': '../../hooks/useUserPermissions',
    './Skeleton/Skeleton.jsx': '../Skeleton/Skeleton.jsx',
    './index': '../index',
    './Icons': '../Icons/Icons',
    
    # Components that imported 'components' instead of '.'
    '../components': '../../components',
}

# The ones under "Internal component fixing" should ONLY be applied to the components that were moved to depth 2!
depth_2_files = [
    'src/components/AdCarousel/AdCarousel.jsx',
    'src/components/Admin/AutomaticBackupConfig/AutomaticBackupConfig.jsx',
    'src/components/Admin/DatabaseMonitor/DatabaseMonitor.jsx',
    'src/components/Guards/PremiumGuard/PremiumGuard.jsx',
    'src/components/Modals/UserPermissionsModal/UserPermissionsModal.jsx',
    'src/components/Modals/UserPreviewModal/UserPreviewModal.jsx',
    'src/components/Navbar/Navbar.jsx',
    'src/components/Notifications/NotificationContainer/NotificationContainer.jsx',
    'src/components/Overlays/WelcomeOverlay/WelcomeOverlay.jsx',
    'src/components/ThemeToggle/ThemeToggle.jsx',
    'src/components/Modals/UserEditModal.jsx',
    'src/components/Modals/VenueFormModal.jsx',
]

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Fix pages imports (these are safe to replace globally)
    for k, v in replacements.items():
        if 'components/' in k:
            content = content.replace(k, v)
            
    # Fix depth imports only for depth 2 files
    path_norm = path.replace('\\', '/')
    if any(df in path_norm for df in depth_2_files):
        for k, v in replacements.items():
            if k.startswith('.'):
                # Only replace in import statements to be safe
                content = content.replace(f"from '{k}'", f"from '{v}'")
                content = content.replace(f'from "{k}"', f'from "{v}"')
                content = content.replace(f"import '{k}'", f"import '{v}'")
                
                # Special cases
                content = content.replace("from '../components'", "from '../../components'")
                
    if content != original_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed:", path)

for root, _, files in os.walk(os.path.abspath('src')):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            fix_file(os.path.join(root, file))
