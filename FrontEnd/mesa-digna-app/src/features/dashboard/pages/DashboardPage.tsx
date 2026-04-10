import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUserCheck, faNotesMedical, faTriangleExclamation,
  faUserPlus, faClockRotateLeft, faUtensils, faEgg, faBurger,
  faWandMagicSparkles, faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/providers/AuthProvider';
import { usePageTitle } from '@/hooks/usePageTitle';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, Loader } from '@/components/ui';
import { beneficiaryService } from '@/features/beneficiaries/services/beneficiary.service';
import { attendanceService } from '@/features/attendances/services/attendance.service';
import { kitchenService } from '@/features/kitchen/services/kitchen.service';
import { todayISO } from '@/utils/formatDate';
import { ROLES } from '@/constants/roles';

interface QuickAction {
  path: string;
  label: string;
  icon: IconDefinition;
  iconColor: string;
  hoverClass: string;
  roles: string[];
}

const quickActions: QuickAction[] = [
  { path: '/asistencia/check-in', label: 'Registrar asistencia', icon: faUserCheck, iconColor: 'text-accent-400', hoverClass: 'hover:border-accent-300 hover:bg-accent-50', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER] },
  { path: '/beneficiarios/nuevo', label: 'Nuevo beneficiario', icon: faUserPlus, iconColor: 'text-primary-400', hoverClass: 'hover:border-primary-300 hover:bg-primary-50', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/beneficiarios', label: 'Ver beneficiarios', icon: faUsers, iconColor: 'text-primary-400', hoverClass: 'hover:border-primary-300 hover:bg-primary-50', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER] },
  { path: '/asistencia/historial', label: 'Historial asistencia', icon: faClockRotateLeft, iconColor: 'text-accent-400', hoverClass: 'hover:border-accent-300 hover:bg-accent-50', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER] },
  { path: '/cocina', label: 'Resumen de cocina', icon: faUtensils, iconColor: 'text-accent-400', hoverClass: 'hover:border-accent-300 hover:bg-accent-50', roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/ingredientes', label: 'Ver ingredientes', icon: faEgg, iconColor: 'text-primary-400', hoverClass: 'hover:border-primary-300 hover:bg-primary-50', roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/comidas', label: 'Gestionar comidas', icon: faBurger, iconColor: 'text-accent-400', hoverClass: 'hover:border-accent-300 hover:bg-accent-50', roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/predicciones', label: 'Predicciones IA', icon: faWandMagicSparkles, iconColor: 'text-primary-400', hoverClass: 'hover:border-primary-300 hover:bg-primary-50', roles: [ROLES.ADMIN] },
  { path: '/usuarios', label: 'Gestionar usuarios', icon: faUserGear, iconColor: 'text-primary-400', hoverClass: 'hover:border-primary-300 hover:bg-primary-50', roles: [ROLES.ADMIN] },
];

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { canViewBeneficiaries, canManageKitchen, hasAnyRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [todayAttendees, setTodayAttendees] = useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const filteredActions = quickActions.filter(a => hasAnyRole(a.roles));

  useEffect(() => {
    const loads: Promise<void>[] = [];

    if (canViewBeneficiaries) {
      loads.push(
        beneficiaryService.getAll({ page: 1, pageSize: 1 }).then(res => {
          if (res.success && res.data) setTotalBeneficiaries(res.data.totalCount);
        }).catch(() => {}),
        attendanceService.getDailySummary(todayISO()).then(res => {
          if (res.success && res.data) setTodayAttendees(res.data.totalAttendees);
        }).catch(() => {}),
      );
    }

    if (canManageKitchen) {
      loads.push(
        kitchenService.getIngredientsSummary().then(res => {
          if (res.success && res.data) setLowStockCount(res.data.lowStockCount);
        }).catch(() => {}),
        kitchenService.getDietarySummary({ page: 1, pageSize: 1 }).then(res => {
          if (res.success && res.data) setDietaryRestrictions(res.data.totalBeneficiariesWithRestrictions);
        }).catch(() => {}),
      );
    }

    if (loads.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(loads).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loader message="Cargando resumen..." />;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Resumen general de operaciones &mdash; {todayISO()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {canViewBeneficiaries && (
          <>
            <StatsCard icon={faUsers} value={totalBeneficiaries} label="Beneficiarios registrados" color="bg-primary-50 text-primary-500" />
            <StatsCard icon={faUserCheck} value={todayAttendees} label="Asistentes hoy" color="bg-accent-50 text-accent-400" />
          </>
        )}
        {canManageKitchen && (
          <>
            <StatsCard icon={faNotesMedical} value={dietaryRestrictions} label="Con restricciones alimentarias" color="bg-primary-50 text-primary-400" />
            <StatsCard icon={faTriangleExclamation} value={lowStockCount} label="Ingredientes con stock bajo" color="bg-danger-50 text-danger-500" />
          </>
        )}
      </div>

      <Card title="Acceso rápido">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredActions.map(action => (
            <Link
              key={action.path}
              to={action.path}
              className={`flex items-center gap-3 p-4 rounded-lg border border-gray-100 text-text-primary no-underline transition-all ${action.hoverClass}`}
            >
              <FontAwesomeIcon icon={action.icon} className={action.iconColor} />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}