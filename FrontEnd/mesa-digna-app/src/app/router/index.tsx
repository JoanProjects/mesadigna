import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense, type ComponentType } from 'react';
import { RouteErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { MainLayout } from '@/app/layouts/MainLayout';
import { ROLES } from '@/constants/roles';
import { Loader } from '@/components/ui/Loader';

function lazyPage(factory: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<Loader message="Cargando..." />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: lazyPage(() => import('@/features/auth/pages/LoginPage')),
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: 'dashboard',
            element: lazyPage(() => import('@/features/dashboard/pages/DashboardPage')),
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER]} />,
            children: [
              { path: 'beneficiarios', element: lazyPage(() => import('@/features/beneficiaries/pages/BeneficiaryListPage')) },
              { path: 'beneficiarios/:id', element: lazyPage(() => import('@/features/beneficiaries/pages/BeneficiaryDetailPage')) },
            ],
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN, ROLES.RECEPTIONIST]} />,
            children: [
              { path: 'beneficiarios/nuevo', element: lazyPage(() => import('@/features/beneficiaries/pages/BeneficiaryFormPage')) },
              { path: 'beneficiarios/:id/editar', element: lazyPage(() => import('@/features/beneficiaries/pages/BeneficiaryFormPage')) },
              { path: 'beneficiarios/:id/salud', element: lazyPage(() => import('@/features/health-profiles/pages/HealthProfileFormPage')) },
            ],
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER]} />,
            children: [
              {
                path: 'asistencia',
                element: lazyPage(() => import('@/features/attendances/pages/AttendanceShellPage')),
                children: [
                  { index: true, element: <Navigate to="check-in" replace /> },
                  { path: 'check-in', element: lazyPage(() => import('@/features/attendances/pages/CheckInPage')) },
                  { path: 'historial', element: lazyPage(() => import('@/features/attendances/pages/AttendanceListPage')) },
                ],
              },
            ],
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN, ROLES.COOK]} />,
            children: [
              { path: 'cocina', element: lazyPage(() => import('@/features/kitchen/pages/KitchenDailySummaryPage')) },
              { path: 'cocina/dietario', element: lazyPage(() => import('@/features/kitchen/pages/KitchenDietarySummaryPage')) },
              { path: 'cocina/operacional', element: lazyPage(() => import('@/features/kitchen/pages/KitchenOperationalSummaryPage')) },
              { path: 'ingredientes', element: lazyPage(() => import('@/features/ingredients/pages/IngredientListPage')) },
              { path: 'ingredientes/nuevo', element: lazyPage(() => import('@/features/ingredients/pages/IngredientFormPage')) },
              { path: 'ingredientes/:id/editar', element: lazyPage(() => import('@/features/ingredients/pages/IngredientFormPage')) },
              { path: 'comidas', element: lazyPage(() => import('@/features/meals/pages/MealListPage')) },
              { path: 'comidas/nueva', element: lazyPage(() => import('@/features/meals/pages/MealFormPage')) },
              { path: 'comidas/:id', element: lazyPage(() => import('@/features/meals/pages/MealDetailPage')) },
              { path: 'comidas/:id/editar', element: lazyPage(() => import('@/features/meals/pages/MealFormPage')) },
            ],
          },
          {
            element: <RoleRoute roles={[ROLES.ADMIN]} />,
            children: [
              { path: 'predicciones', element: lazyPage(() => import('@/features/predictions/pages/PredictionsPage')) },
              { path: 'usuarios', element: lazyPage(() => import('@/features/users/pages/UserListPage')) },
              { path: 'usuarios/nuevo', element: lazyPage(() => import('@/features/users/pages/UserFormPage')) },
              { path: 'usuarios/:id/editar', element: lazyPage(() => import('@/features/users/pages/UserFormPage')) },
            ],
          },
          {
            path: 'mi-perfil',
            element: lazyPage(() => import('@/features/profile/pages/ProfilePage')),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
