/**
 * Utilidad compartida de resolución de permisos (Single Source of Truth).
 * Respeta revocaciones explícitas desde BD (`false`) y aplica defaults del rol
 * únicamente cuando la llave no existe aún en cuentas legacy (`undefined`).
 */

export const DEFAULT_ROLE_PERMISSIONS = {
  usuario: [
    'canLogin',
    'canViewEvents',
    'canViewAchievements',
    'canRequestRefunds',
    'canPurchaseTickets',
    'canTransferTickets',
    'canUseVipServices',
    'canManageMyProfile',
    'canAccessCart',
    'canViewMyHistory',
    'canViewMyTickets',
  ],
  gestor: [
    'canViewUsers',
    'canViewEventAnalytics',
    'canViewStats',
    'canManageVenues',
    'canManageMerch',
    'canManageAds',
    'canCreateEvents',
    'canEditEvents',
  ],
  operador: [
    'canValidateTickets',
    'canSellTickets',
    'canViewTickets',
    'canOverrideValidation',
    'canScanMultipleEvents',
    'canViewRealTimeAttendance',
    'canViewEvents',
    'canViewStats',
    'canManageMyProfile',
  ],
};

export function parsePermissions(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof raw === 'object' ? raw : {};
}

export function extractPermissionsFromResponse(data) {
  if (!data) return {};
  const raw =
    data.permissions ??
    data.user?.permissions ??
    data.data?.permissions ??
    data.data?.user?.permissions;
  return parsePermissions(raw);
}

export function resolveRolePermission(perms, role, permission) {
  if (role === 'admin' || perms?.all === true) return true;

  // Si el servidor definió explícitamente true o false, se respeta estrictamente
  if (perms && Object.prototype.hasOwnProperty.call(perms, permission) && perms[permission] !== undefined) {
    return Boolean(perms[permission]);
  }

  // Fallback seguro a los permisos por defecto del rol cuando la llave no existe (cuentas legacy)
  const roleDefaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
  return roleDefaults.includes(permission);
}

