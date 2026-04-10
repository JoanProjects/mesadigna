export const ROLES = {
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepcionista',
  VOLUNTEER: 'Voluntario',
  COOK: 'Cocinero',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
