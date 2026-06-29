"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  SquareCheck,
  Bot,
  Users,
  FolderPlus,
  ChartColumn,
  Activity,
  UserCog,
  HeartPulse,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { NAV_ITEMS } from "./nav-config";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  SquareCheck,
  Bot,
  Users,
  FolderPlus,
  ChartColumn,
  Activity,
  UserCog,
  HeartPulse,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      {/* Logo 区 */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">多 Agent 平台</span>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.title}</span>
              {item.badge ? (
                <span className="rounded-full bg-state-progress px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* 底部 workspace 信息 */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-state-done" />
          <span className="truncate">{user.workspaceId}</span>
        </div>
      </div>
    </aside>
  );
}
