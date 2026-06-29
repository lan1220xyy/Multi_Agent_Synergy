/**
 * 全局类型定义（对齐需求文档数据模型 §12 + 附录 A）
 */

export type Role = "admin" | "pm" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  jiraUserId?: string;
  gitUserId?: string;
  workspaceId: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

/* ============ 侧边栏导航项 ============ */
export interface NavItem {
  title: string;
  href: string;
  icon: string; // lucide 图标名
  roles: Role[];
  badge?: number; // 角标计数（如未读 Todo）
}

/* ============ 角色主页路由（frontend-design.md §3.1） ============ */
export const ROLE_HOME: Record<Role, string> = {
  user: "/dashboard",
  pm: "/overview",
  admin: "/overview",
};
