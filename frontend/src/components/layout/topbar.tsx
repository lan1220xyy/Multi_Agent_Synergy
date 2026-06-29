"use client";

import { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

/** WebSocket 连接状态指示器（占位，后续接 wsStore） */
function WsStatusIndicator() {
  // TODO: 接入 wsStore，根据连接状态显示绿/橙/红
  const connected = true;
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        connected ? "bg-state-done" : "bg-state-error"
      )}
      title={connected ? "已连接" : "已断开"}
    />
  );
}

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      {/* 左：workspace 切换 */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
          <span className="font-medium text-foreground">{user.workspaceId}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 中：全局搜索 ⌘K */}
      <button className="flex h-8 w-64 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground hover:bg-secondary">
        <Search className="h-3.5 w-3.5" />
        <span>搜索…</span>
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* 右：WS 状态 + 通知 + 用户菜单 */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground">
          <WsStatusIndicator />
          <span className="hidden sm:inline">实时</span>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-state-progress" />
        </Button>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-secondary"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-popover p-1 shadow-md animate-fade-in">
                <div className="border-b border-border px-2 py-1.5">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary">
                    {user.role}
                  </div>
                </div>
                <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary">
                  <UserIcon className="h-3.5 w-3.5" />
                  个人设置
                </button>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-state-error hover:bg-state-error/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
