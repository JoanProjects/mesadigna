import { ROLES } from '@/constants/roles';

export function hasRole(userRole: string | null, role: string): boolean {
  return userRole === role;
}

export function hasAnyRole(userRole: string | null, roles: string[]): boolean {
  return !!userRole && roles.includes(userRole);
}

export function canManageUsers(role: string | null): boolean {
  return role === ROLES.ADMIN;
}

export function canManageKitchen(role: string | null): boolean {
  return hasAnyRole(role, [ROLES.ADMIN, ROLES.COOK]);
}

export function canManageBeneficiaries(role: string | null): boolean {
  return hasAnyRole(role, [ROLES.ADMIN, ROLES.RECEPTIONIST]);
}

export function canViewBeneficiaries(role: string | null): boolean {
  return hasAnyRole(role, [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER]);
}

export function canCheckIn(role: string | null): boolean {
  return hasAnyRole(role, [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER]);
}

export function canAccessPredictions(role: string | null): boolean {
  return role === ROLES.ADMIN;
}
