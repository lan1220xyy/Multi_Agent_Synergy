"use client";

import { cn } from "@/lib/utils";
import type { StateMeta } from "@/lib/state";

/** 状态色圆点 —— 全局统一的状态指示器 */
export function StateDot({
  meta,
  className,
  pulse = false,
}: {
  meta: StateMeta;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        meta.dotClass,
        pulse && "animate-pulse-dot",
        className
      )}
    />
  );
}

/** 状态徽章 —— 圆点 + 文字标签，低饱和背景 */
export function StateBadge({
  meta,
  className,
  pulse = false,
}: {
  meta: StateMeta;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        meta.badgeClass,
        className
      )}
    >
      <StateDot meta={meta} pulse={pulse} />
      {meta.label}
    </span>
  );
}
