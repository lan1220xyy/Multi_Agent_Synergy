"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { useAuthStore } from "@/lib/auth-store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * 应用外壳 —— 登录后所有页面共享的三段式布局
 * 含路由守卫：未登录跳转 /login
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useHydrated();

  // 等待 zustand persist hydration 完成后再判断认证状态
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
