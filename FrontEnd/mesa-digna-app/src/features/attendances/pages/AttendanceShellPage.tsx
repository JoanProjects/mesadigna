import { Outlet, NavLink } from 'react-router';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AttendanceShellPage() {
  usePageTitle('Asistencia');

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Asistencia</h1>
      </div>
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        <NavLink
          to="check-in"
          className={({ isActive }) =>
            `px-4 py-2.5 text-sm font-medium transition-colors no-underline -mb-px ${
              isActive
                ? 'text-accent-500 border-b-2 border-accent-400 font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`
          }
        >
          Check-in
        </NavLink>
        <NavLink
          to="historial"
          className={({ isActive }) =>
            `px-4 py-2.5 text-sm font-medium transition-colors no-underline -mb-px ${
              isActive
                ? 'text-accent-500 border-b-2 border-accent-400 font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`
          }
        >
          Historial
        </NavLink>
      </div>
      <Outlet />
    </>
  );
}
