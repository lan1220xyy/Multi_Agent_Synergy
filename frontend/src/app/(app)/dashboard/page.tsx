"use client";

import { SquareCheck, Bot, MessageSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateBadge } from "@/components/state-badge";
import { TODO_STATE_META, AGENT_STATUS_META } from "@/lib/state";

/**
 * 普通用户工作台（骨架）
 * 对应 frontend-design.md §4.2 + 附录 D.2 线框
 * 三栏：My Todos / Agent Status / Chat
 * 后续接入 TanStack Query + WebSocket 实时数据
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">工作台</h1>
        <p className="text-sm text-muted-foreground">你的待办与 Agent 实时状态</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* My Todos */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <SquareCheck className="h-4 w-4 text-muted-foreground" />
              My Todos
              <span className="rounded-full bg-state-progress px-1.5 py-0.5 text-[10px] font-medium text-white">
                3
              </span>
            </CardTitle>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              全部
            </button>
          </CardHeader>
          <CardContent className="space-y-1">
            <TodoRow title="解决合并冲突" scope="BMC" />
            <TodoRow title="验证 PA 报告" scope="TOOLS" />
            <TodoRow title="补充测试用例" scope="UEFI" />
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-muted-foreground" />
              Agent Status
            </CardTitle>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              filter
            </button>
          </CardHeader>
          <CardContent className="space-y-1">
            <AgentRow name="dev-agent-bmc" action="analyzing" status="busy" />
            <AgentRow name="test-agent" action="idle" status="idle" />
            <AgentRow name="git-operator" action="done · PR #42" status="idle" />
          </CardContent>
        </Card>
      </div>

      {/* Chat 占位 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Chat with dev-agent-bmc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Chat 组件待实现（流式回包）
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TodoRow({ title, scope }: { title: string; scope: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/60">
      <StateBadge meta={TODO_STATE_META.pending} />
      <span className="flex-1 text-sm">{title}</span>
      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        {scope}
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

function AgentRow({
  name,
  action,
  status,
}: {
  name: string;
  action: string;
  status: "busy" | "idle";
}) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/60">
      <StateBadge
        meta={AGENT_STATUS_META[status]}
        pulse={status === "busy"}
      />
      <span className="flex-1 text-sm font-mono">{name}</span>
      <span className="text-xs text-muted-foreground">{action}</span>
    </div>
  );
}
