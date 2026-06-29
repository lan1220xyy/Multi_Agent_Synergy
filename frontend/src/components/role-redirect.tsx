"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useHydrated } from "@/lib/use-hydrated";
import { ROLE_HOME } from "@/lib/types";

/**
 * 角色重定向组件 —— `/` 路由用
 * 登录后按 role 跳转到对应主页（frontend-design.md §3.2）
 */
export function RoleRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [hydrated, isAuthenticated, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
