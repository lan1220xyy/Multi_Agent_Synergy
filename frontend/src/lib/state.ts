/**
 * 状态色系统映射（见 frontend-design.md §6.2 + 附录 D.1）
 * 把业务状态统一映射到 5 种状态色 token，所有组件复用。
 */

export type StateColor = "progress" | "done" | "review" | "idle" | "error";

export interface StateMeta {
  color: StateColor;
  /** 状态色圆点用的 Tailwind 类（背景色） */
  dotClass: string;
  /** 文字色类 */
  textClass: string;
  /** 徽章背景 + 边框（低饱和） */
  badgeClass: string;
  /** 中文标签 */
  label: string;
}

const META: Record<StateColor, Omit<StateMeta, "label">> = {
  progress: {
    color: "progress",
    dotClass: "bg-state-progress",
    textClass: "text-state-progress",
    badgeClass: "bg-state-progress/10 text-state-progress border-state-progress/30",
  },
  done: {
    color: "done",
    dotClass: "bg-state-done",
    textClass: "text-state-done",
    badgeClass: "bg-state-done/10 text-state-done border-state-done/30",
  },
  review: {
    color: "review",
    dotClass: "bg-state-review",
    textClass: "text-state-review",
    badgeClass: "bg-state-review/10 text-state-review border-state-review/30",
  },
  idle: {
    color: "idle",
    dotClass: "bg-state-idle",
    textClass: "text-state-idle",
    badgeClass: "bg-state-idle/10 text-state-idle border-state-idle/30",
  },
  error: {
    color: "error",
    dotClass: "bg-state-error",
    textClass: "text-state-error",
    badgeClass: "bg-state-error/10 text-state-error border-state-error/30",
  },
};

/* ============ Team 8 态状态机（需求文档 §11.2） ============ */
export type TeamState =
  | "created"
  | "members_assigned"
  | "idle"
  | "triggered"
  | "working"
  | "awaiting_human"
  | "completed"
  | "failed";

export const TEAM_STATE_META: Record<TeamState, StateMeta> = {
  created: { ...META.idle, label: "已创建" },
  members_assigned: { ...META.idle, label: "成员已分配" },
  idle: { ...META.idle, label: "待命" },
  triggered: { ...META.progress, label: "已触发" },
  working: { ...META.progress, label: "工作中" },
  awaiting_human: { ...META.review, label: "等待人工" },
  completed: { ...META.done, label: "已完成" },
  failed: { ...META.error, label: "失败" },
};

/* ============ Bug Task 子状态机（需求文档 §11.4） ============ */
export type BugState =
  | "received"
  | "analyzing"
  | "fixing"
  | "testing"
  | "pr_opened"
  | "blocked"
  | "completed"
  | "failed";

export const BUG_STATE_META: Record<BugState, StateMeta> = {
  received: { ...META.idle, label: "已接收" },
  analyzing: { ...META.progress, label: "分析中" },
  fixing: { ...META.progress, label: "修复中" },
  testing: { ...META.progress, label: "测试中" },
  pr_opened: { ...META.review, label: "PR 已提交" },
  blocked: { ...META.error, label: "已阻塞" },
  completed: { ...META.done, label: "已完成" },
  failed: { ...META.error, label: "失败" },
};

/* ============ Todo 状态 ============ */
export type TodoState = "pending" | "in_progress" | "done";

export const TODO_STATE_META: Record<TodoState, StateMeta> = {
  pending: { ...META.progress, label: "待处理" },
  in_progress: { ...META.progress, label: "处理中" },
  done: { ...META.done, label: "已完成" },
};

/* ============ Agent 状态（附录 A AgentCard.status） ============ */
export type AgentStatus = "idle" | "busy" | "offline" | "error";

export const AGENT_STATUS_META: Record<AgentStatus, StateMeta> = {
  idle: { ...META.idle, label: "空闲" },
  busy: { ...META.progress, label: "工作中" },
  offline: { ...META.idle, label: "离线" },
  error: { ...META.error, label: "异常" },
};

/** 通用状态色圆点组件用 */
export function stateDot(color: StateColor): string {
  return META[color].dotClass;
}
