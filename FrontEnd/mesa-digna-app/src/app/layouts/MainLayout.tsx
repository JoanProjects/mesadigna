import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faUsers, faUserCheck, faUtensils, faEgg,
  faBurger, faWandMagicSparkles, faUserGear, faBars, faRightFromBracket, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/providers/AuthProvider';
import { NotificationToast } from '@/components/feedback/NotificationToast';
import { ROLES } from '@/constants/roles';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface NavItem {
  path: string;
  label: string;
  icon: IconDefinition;
  roles?: string[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: faChartLine },
  { path: '/beneficiarios', label: 'Beneficiarios', icon: faUsers, roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER] },
  { path: '/asistencia', label: 'Asistencia', icon: faUserCheck, roles: [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.VOLUNTEER] },
  { path: '/cocina', label: 'Cocina', icon: faUtensils, roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/ingredientes', label: 'Ingredientes', icon: faEgg, roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/comidas', label: 'Comidas', icon: faBurger, roles: [ROLES.ADMIN, ROLES.COOK] },
  { path: '/predicciones', label: 'Predicciones IA', icon: faWandMagicSparkles, roles: [ROLES.ADMIN] },
  { path: '/usuarios', label: 'Usuarios', icon: faUserGear, roles: [ROLES.ADMIN] },
];

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(item => !item.roles || hasAnyRole(item.roles));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-sidebar text-white flex flex-col transition-all duration-300 z-30 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-accent-400 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">MD</span>
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight">Mesa Digna</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {filteredNav.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors no-underline ${
                      isActive ? 'bg-sidebar-active text-white font-semibold' : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                    }`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className="w-5 text-center shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => navigate('/mi-perfil')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer bg-transparent border-0 text-white/80 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-xs text-white" />
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-white/50 truncate">{user?.role}</p>
              </div>
            )}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer bg-transparent border-0 text-white/60 hover:text-white text-sm"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 text-center" />
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-transparent border-0 text-text-secondary"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <NotificationToast />
    </div>
  );
}
