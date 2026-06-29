import type { NavItem } from "@/lib/types";

/**
 * 侧边栏导航配置（frontend-design.md §2.1）
 * 按角色动态渲染，roles 字段控制可见性
 */
export const NAV_ITEMS: NavItem[] = [
  // 普通用户
  { title: "工作台", href: "/dashboard", icon: "LayoutDashboard", roles: ["user"] },
  { title: "我的 Todo", href: "/todos", icon: "SquareCheck", roles: ["user", "pm", "admin"] },
  { title: "Agent 状态", href: "/agents", icon: "Bot", roles: ["user", "pm", "admin"] },
  { title: "我的 Team", href: "/teams", icon: "Users", roles: ["user"] },

  // PM / Admin
  { title: "总览", href: "/overview", icon: "LayoutDashboard", roles: ["pm", "admin"] },
  { title: "项目导入", href: "/projects", icon: "FolderPlus", roles: ["pm", "admin"] },
  { title: "Teams 总览", href: "/teams", icon: "Users", roles: ["pm", "admin"] },
  { title: "指标", href: "/metrics", icon: "ChartColumn", roles: ["pm", "admin"] },
  { title: "Trace", href: "/trace", icon: "Activity", roles: ["pm", "admin"] },

  // Admin
  { title: "用户管理", href: "/admin/users", icon: "UserCog", roles: ["admin"] },
  { title: "系统健康", href: "/admin/system", icon: "HeartPulse", roles: ["admin"] },

  // 通用
  { title: "设置", href: "/settings", icon: "Settings", roles: ["user", "pm", "admin"] },
];
