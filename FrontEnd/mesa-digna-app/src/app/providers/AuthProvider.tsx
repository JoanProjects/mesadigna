import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserResponse, LoginRequest, LoginResponse, UpdateProfileRequest, ChangePasswordRequest } from '@/features/auth/types/auth.types';
import { httpPost, httpGet, httpPut } from '@/services/http/client';
import { ROLES } from '@/constants/roles';

const TOKEN_KEY = 'mesa_digna_token';
const USER_KEY = 'mesa_digna_user';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  role: string | null;
  isAdmin: boolean;
  isCook: boolean;
  isReceptionist: boolean;
  isVolunteer: boolean;
  canManageUsers: boolean;
  canManageKitchen: boolean;
  canViewKitchen: boolean;
  canManageBeneficiaries: boolean;
  canViewBeneficiaries: boolean;
  canCheckIn: boolean;
  canAccessPredictions: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loadCurrentUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(getStoredUser);

  const isAuthenticated = !!user && !!localStorage.getItem(TOKEN_KEY);
  const role = user?.role ?? null;
  const isAdmin = role === ROLES.ADMIN;
  const isCook = role === ROLES.COOK;
  const isReceptionist = role === ROLES.RECEPTIONIST;
  const isVolunteer = role === ROLES.VOLUNTEER;

  const canManageUsers = isAdmin;
  const canManageKitchen = isAdmin || isCook;
  const canViewKitchen = isAdmin || isCook;
  const canManageBeneficiaries = isAdmin || isReceptionist;
  const canViewBeneficiaries = isAdmin || isReceptionist || isVolunteer;
  const canCheckIn = isAdmin || isReceptionist || isVolunteer;
  const canAccessPredictions = isAdmin;

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await httpPost<LoginResponse>('/auth/login', credentials);
    if (res.success && res.data) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      const res = await httpGet<UserResponse>('/auth/me');
      if (res.success && res.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch {
      // Token invalid, silent fail
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const res = await httpPut<UserResponse>('/auth/me', data);
    if (res.success && res.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      setUser(res.data);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    await httpPost('/auth/change-password', data);
  }, []);

  const hasRoleFn = useCallback((r: string) => role === r, [role]);
  const hasAnyRoleFn = useCallback((roles: string[]) => !!role && roles.includes(role), [role]);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY) && !user) {
      loadCurrentUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, role,
      isAdmin, isCook, isReceptionist, isVolunteer,
      canManageUsers, canManageKitchen, canViewKitchen,
      canManageBeneficiaries, canViewBeneficiaries, canCheckIn, canAccessPredictions,
      login, logout, loadCurrentUser, updateProfile, changePassword,
      hasRole: hasRoleFn, hasAnyRole: hasAnyRoleFn,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
