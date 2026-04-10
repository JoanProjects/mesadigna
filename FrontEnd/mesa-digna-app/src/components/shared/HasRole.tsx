import { useAuth } from '@/app/providers/AuthProvider';
import type { ReactNode } from 'react';

interface HasRoleProps {
  roles: string | string[];
  children: ReactNode;
}

export function HasRole({ roles, children }: HasRoleProps) {
  const { hasAnyRole } = useAuth();
  const roleArray = typeof roles === 'string' ? [roles] : roles;
  if (!hasAnyRole(roleArray)) return null;
  return <>{children}</>;
}
