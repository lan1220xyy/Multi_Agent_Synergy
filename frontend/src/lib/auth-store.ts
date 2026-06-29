"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (...roles: User["role"][]) => boolean;
}

/**
 * 认证 store —— 持久化到 localStorage
 * JWT + user 信息，路由守卫与角色重定向依赖此 store
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
      hasRole: (...roles) => {
        const r = get().user?.role;
        return !!r && roles.includes(r);
      },
    }),
    {
      name: "agent-platform-auth",
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
