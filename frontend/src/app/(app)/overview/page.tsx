"use client";

import { Users, ChartColumn, Activity, FolderPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StateBadge } from "@/components/state-badge";
import { TEAM_STATE_META } from "@/lib/state";
import type { TeamState } from "@/lib/state";

/**
 * PM/Admin 总览（骨架）
 * 对应 frontend-design.md §4.3 + 附录 D.3 线框
 */
export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">总览</h1>
          <p className="text-sm text-muted-foreground">跨 Team 效能与实时活动</p>
        </div>
        <Button size="sm">
          <FolderPlus className="h-4 w-4" />
          导入项目
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 指标卡 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Teams
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">3</div>
            <p className="text-xs text-muted-foreground">1 idle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Bugs Resolved (24h)
            </CardTitle>
            <ChartColumn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">47</div>
            <p className="text-xs text-state-done">+12 vs 昨日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Fix Time
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">8m 32s</div>
            <p className="text-xs text-muted-foreground">p95: 14m 02s</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Teams Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <TeamRow name="team-sustaining-26.3" bug="BUG-999" step="fixing" state="working" />
          <TeamRow name="team-sustaining-26.4" bug="—" step="待触发" state="idle" />
        </CardContent>
      </Card>
    </div>
  );
}

function TeamRow({
  name,
  bug,
  step,
  state,
}: {
  name: string;
  bug: string;
  step: string;
  state: TeamState;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-secondary/60">
      <StateBadge meta={TEAM_STATE_META[state]} pulse={state === "working"} />
      <span className="flex-1 font-mono text-sm">{name}</span>
      <span className="text-xs text-muted-foreground">bug: {bug}</span>
      <span className="text-xs text-muted-foreground">step: {step}</span>
    </div>
  );
}
