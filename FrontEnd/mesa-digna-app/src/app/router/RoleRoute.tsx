import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';

interface RoleRouteProps {
  roles: string[];
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { hasAnyRole } = useAuth();
  if (!hasAnyRole(roles)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
