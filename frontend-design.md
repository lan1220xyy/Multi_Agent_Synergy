# 多 Agent 管理平台 · 前端页面设计

> **版本**：v1.0（2026-06-26）
> **定位**：前端页面主体设计 + 组件清单 + 路由跳转逻辑 + 依赖清单，作为后续前端开发的基线
> **依据**：[requirements-and-design.md](requirements-and-design.md) 第 8/15 章 + 附录 D 线框图
> **风格**：克制而精致（参照 Linear / Vercel）—— 高信息密度 + 细腻动效 + 色彩克制 + 8pt grid + 全 token 化

---

## 1. 设计原则与技术栈

### 1.1 设计原则（来自附录 D）
- **克制而精致**：高信息密度，不堆砌视觉元素；动效细腻（150–250ms ease-out），不浮夸
- **全 token 化色彩**：所有颜色走 CSS 变量 / Tailwind token，不硬编码 hex
- **8pt grid 栅格**：间距、尺寸均为 8 的倍数（4pt 用于微调）
- **状态色系统统一**：全局一套状态色，所有组件复用（见 §6.2）
- **角色差异化视图**：同一套组件，按 admin/pm/user 角色显示不同信息密度与操作

### 1.2 技术栈（来自第 8.2 / 16 章）
| 层 | 选型 |
|----|------|
| 框架 | Next.js 14+（App Router）+ React 18 + TypeScript |
| 数据请求 | TanStack Query（React Query v5）—— 服务端状态 |
| 客户端状态 | Zustand —— UI 状态 / 实时事件 / 认证 |
| UI 组件 | shadcn/ui（基于 Radix UI）+ Tailwind CSS |
| 实时通信 | 原生 WebSocket（FastAPI WS）+ 自封装 Hub 客户端 |
| 图表 | Tremor（与 shadcn 风格一致）或 Recharts |
| 表单 | react-hook-form + zod |
| 图标 | lucide-react |
| 主题 | next-themes（深色优先） |

---

## 2. 全局布局与导航

### 2.1 AppShell（应用外壳）
所有登录后页面共享的外壳，三段式：

```
┌──────────────────────────────────────────────────────────────┐
│  TopBar：[workspace ▼]   全局搜索 ⌘K   [WS状态]  [🔔]  [头像▼] │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │              主内容区（路由出口）                 │
│  导航       │                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

**TopBar 组件**：
- `WorkspaceSwitcher`：左上角下拉切换 workspace（多租户预留，首期 default）
- `CommandPalette`：⌘K 唤起全局命令面板（搜索 Team / Todo / Agent / 跳转页面，Linear 风格）
- `WsStatusIndicator`：WebSocket 连接状态小圆点（绿=已连接 / 橙=重连中 / 红=断开）
- `NotificationBell`：未读 Todo / Team 失败等通知
- `UserMenu`：头像下拉（个人设置、切换主题、登出）

**Sidebar 组件**（按角色动态渲染导航项）：
- 普通用户：`工作台` / `我的 Todo` / `Agent 状态` / `我的 Team`
- PM：+ `项目导入` / `Teams 总览` / `指标` / `Trace`
- Admin：+ `用户管理` / `系统健康`
- 底部：当前 workspace 信息 + 折叠按钮

### 2.2 角色视图差异
| 区域 | user | pm | admin |
|------|------|----|-------|
| 项目导入 | ✗ | ✓ | ✓ |
| Teams 总览 | 仅参与的 | 全部 | 全部 |
| Agent 状态 | ✓（只读） | ✓ | ✓ |
| 处理 Todo | 仅派给自己的 | 全部 | 全部 |
| Metrics / Trace | ✗ | ✓ | ✓ |
| 用户管理 | ✗ | ✗ | ✓ |
| 取消 Team | ✗ | 自己导入的 | 任意 |
| 与 agent Chat | ✓（参与 Team 内） | ✓ | ✓ |

---

## 3. 路由与页面跳转逻辑

### 3.1 路由表
```
公开路由
  /login                      登录页

登录后（AppShell 内）
  /                           → 按 role 重定向（user→/dashboard, pm/admin→/overview）
  /dashboard                  普通用户工作台（user 主页）
  /overview                   PM/Admin 总览（pm/admin 主页）

  /projects                   项目列表 + CSV 导入（pm/admin）
  /projects/[id]              项目详情（含其 Team 跳转）

  /teams                      Teams 总览（pm/admin）/ 我的 Team（user）
  /teams/[id]                 Team 详情（状态机 / 成员 / bug 进度 / trace）

  /todos                      Todo 收件箱（按角色过滤）
  /todos/[id]                 Todo 详情 + 处理面板

  /agents                     Agent 状态总览
  /agents/[name]              Agent 详情 + 能力卡 + Chat

  /metrics                    指标看板（pm/admin）
  /trace                      Trace Explorer（pm/admin）

  /admin/users                用户管理（admin）
  /admin/system               系统健康监控（admin）

  /settings                   个人设置
```

### 3.2 跳转逻辑
- **登录后**：JWT 解析 role，`/` 重定向到角色主页
- **CSV 导入成功**：`/projects` → toast 提示 → 列表新项目卡片 → 点卡片跳 `/projects/[id]` → 显示"Team 已创建"状态 + 跳 `/teams/[id]`
- **Jira webhook 触发**：WS 推送 `team.state_changed` → `/teams/[id]` 实时高亮 + `/overview` Teams 卡片状态变橙
- **Todo 创建**：WS 推送 `todo.created` → `/todos` 红点 + `/dashboard` 列表新增 + 通知铃
- **点 Todo**：`/todos` → `/todos/[id]` → 处理后 resolve → WS 推 `todo.resolved` → Team 恢复 → 跳回 `/teams/[id]` 看进度
- **点 Team 卡片**：→ `/teams/[id]`
- **点 Agent**：`/agents` → `/agents/[name]` → Chat
- **Trace 下钻**：`/teams/[id]` 点某次 bug 运行的 trace_id → `/trace?trace_id=xxx`
- **权限拦截**：user 访问 `/metrics` → 重定向 `/dashboard` + toast

---

## 4. 各页面详细设计

### 4.1 登录页 `/login`
**布局**：居中卡片，左上角 logo，深色背景。
**组件**：
- `LoginForm`：email + password，react-hook-form + zod 校验
- 提交 → POST `/api/auth/login` → 拿 JWT → 存 Zustand + localStorage → 重定向角色主页
**渲染内容**：标题"多 Agent 管理平台"、副标题、表单、登录按钮、错误提示。

---

### 4.2 普通用户工作台 `/dashboard`（user 主页）
> 对应附录 D.2 线框。三栏布局，信息密度高。

```
┌──────────────────────────────────────────────────────────────┐
│  工作台                              [workspace ▼]  [头像]      │
├───────────────────────────┬──────────────────────────────────┤
│  📋 My Todos (3)          │  Agent Status (filter ▼)         │
│  🟠 解决合并冲突   BMC    │  🟠 dev-agent-bmc  analyzing      │
│  🔵 验证 PA 报告   TOOLS  │  ⚪ test-agent     idle           │
│  ⚪ 补充测试用例   UEFI   │  🔵 git-operator   done · PR #42  │
│  📜 History               │                                   │
├───────────────────────────┴──────────────────────────────────┤
│  💬 Chat with dev-agent-bmc                                   │
│  [消息流...]                                                  │
│  [输入框________________________________________] [发送]       │
└──────────────────────────────────────────────────────────────┘
```

**左栏 `MyTodosPanel`**：
- `TodoList`：当前用户的 Todo，按状态分组（待处理 / 进行中 / 已完成）
- `TodoItem`：状态色圆点 + 标题 + component 标签 + 关联 bug + 时间；点击 → `/todos/[id]`
- `HistoryAccordion`：折叠的历史已完成 Todo
- WS 事件 `todo.created` / `todo.resolved` 实时更新

**右栏 `AgentStatusPanel`**：
- `AgentStatusFilter`：按 component / type 过滤
- `AgentStatusList`：每个 agent 一行 —— 状态色圆点 + name + 当前动作（analyzing / idle / done · PR #42）
- 点击 → `/agents/[name]`
- WS 事件 `agent.status_changed` 实时更新

**底栏 `AgentChat`**：
- `ChatMessageList`：消息流（用户 / agent 区分左右气泡）
- `ChatInput`：输入框 + 发送；流式回包（SSE / WS stream）
- 顶部下拉选择要聊的 agent（仅参与 Team 内的）

---

### 4.3 PM/Admin 总览 `/overview`（pm/admin 主页）
> 对应附录 D.3 线框。左栏指标 + 入口，右栏 Teams + 活动流。

```
┌──────────────────────────────────────────────────────────────┐
│  总览 [PM]                    [workspace ▼]   [PM avatar]     │
├───────────────────────────┬──────────────────────────────────┤
│  📋 Todos (5) 📥 Import   │  Teams Overview                  │
│  📊 Metrics               │  team-sustaining-26.3  🟠 working │
│   Teams: 3 active/1 idle  │    bug: BUG-999 · step: fixing    │
│   Bugs resolved: 47 (24h) │  team-sustaining-26.4  ⚪ idle    │
│   Avg fix: 8m32s          │  Recent Activity (跨 Team 时间线) │
│  🔍 Trace Explorer        │   [dev-bmc] analyzing BUG-999 1m  │
└───────────────────────────┴──────────────────────────────────┘
```

**左栏**：
- `TodoSummaryCard`：未处理 Todo 计数 + `Import` 按钮（→ `/projects`）
- `MetricsSummaryCard`：关键指标卡片网格 —— active teams / bugs resolved(24h) / avg fix time / token usage；点击 → `/metrics`
- `TraceExplorerEntry`：输入 trace_id 直达 → `/trace?trace_id=xxx`

**右栏**：
- `TeamsOverview`：`TeamCard` 列表，每张卡显示 team name + 状态色 + 当前 bug + 当前 step；点击 → `/teams/[id]`
- `ActivityFeed`：跨 Team 时间线（dev-bmc analyzing BUG-999 1m 前），WS 实时追加

---

### 4.4 项目列表与导入 `/projects`（pm/admin）
**组件**：
- `ProjectList`：项目表格/卡片网格（name / scope 标签 / schedule / status / 关联 team）
- `CsvImportDialog`：弹窗 —— 拖拽/选择 CSV → 预览解析结果（name/schedule/scope）→ 校验 → 提交 POST `/api/projects/import` → 202 → toast → 列表刷新
- 点击项目 → `/projects/[id]`

**`/projects/[id]` 详情**：项目元信息 + scope + 关联 Team 卡片（→ `/teams/[id]`）+ 该项目下的 bug_tasks 列表。

---

### 4.5 Team 详情 `/teams/[id]`（核心页面）
**布局**：顶部 Team 头部 + 三栏（状态机 / 成员 / bug 进度）+ 底部 trace。

**`TeamHeader`**：team name + 状态徽章（8 态之一）+ 项目跳转 + `CancelTeamButton`（admin/pm，带确认弹窗）。

**左栏 `TeamStateMachineViewer`**：
- 可视化 8 态状态机（created/members_assigned/idle/triggered/working/awaiting_human/completed/failed）
- 当前状态高亮，历史转换路径用箭头标出
- WS `team.state_changed` 实时高亮跳转

**中栏 `TeamMembersList`**：
- PM Agent 卡片 + Worker Agent 卡片网格
- 每个 `AgentCard`：name + type + 状态色 + scope_affinity 标签 + 当前动作；点击 → `/agents/[name]`

**右栏 `BugTaskProgress`**：
- 当前 bug 的子状态机进度条（received→analyzing→fixing→testing→pr_opened→completed）
- `BugTaskCard`：jira_bug_id + title + severity + current_step + current_agent + pr_url（可点）
- 阻塞时显示关联 Todo 链接

**底栏 `TeamTraceList`**：该 Team 近期运行的 trace 列表，点击 → `/trace?trace_id=xxx`。

---

### 4.6 Todo 收件箱 `/todos` 与详情 `/todos/[id]`
**`/todos` 列表**：
- `TodoFilterBar`：按状态 / component / team 过滤
- `TodoList`：表格行 —— 状态色 + 标题 + 派给人 + component + bug + 创建时间
- user 只看到派给自己的；pm/admin 看全部

**`/todos/[id]` 详情**：
- `TodoDetail`：标题 / 描述 / 关联资源（PR url / 文件路径）/ 创建 agent / 历史
- `TodoResolvePanel`：处理表单（输入处理说明 / 标记完成）→ POST `/api/todos/{id}/resolve` → WS 推 `todo.resolved` → Team 恢复 → 提示跳回 `/teams/[id]` 看进度
- `TodoHistoryTimeline`：该 Todo 的生命周期事件

---

### 4.7 Agent 状态总览 `/agents` 与详情 `/agents/[name]`
**`/agents`**：
- `AgentGrid`：所有 agent 卡片网格 —— name + type + 状态色 + scope_affinity + capabilities 标签
- `AgentFilterBar`：按 type / status / scope 过滤
- 系统级 agent（Super Admin / Jira-Monitor / PA-Tester）单独分组

**`/agents/[name]` 详情**：
- `AgentCapabilityCard`：Agent Card 全字段（name/type/capabilities/scope_affinity/input-output schema/status/description/is_system）
- `AgentStatusHistory`：状态变化时间线
- `AgentChat`：与该 agent 的 Chat（流式），同 dashboard 底栏
- `AgentInvocations`：近期被调用记录（from_agent / topic / trace_id 跳转）

---

### 4.8 指标看板 `/metrics`（pm/admin）
**组件**（Tremor 图表）：
- `MetricsGrid`：KPI 卡片 —— active_teams / agent_invocations_total / a2a_messages_total / bugs_resolved_total / token_usage_total
- `TeamStateDistribution`：Team 8 态分布饼图
- `AgentPerformanceChart`：各 agent 调用次数 / 平均耗时柱状图
- `A2ATrafficChart`：A2A 消息量时序折线
- `BugResolutionTrend`：bug 修复趋势
- 时间范围选择器（1h / 24h / 7d）

---

### 4.9 Trace Explorer `/trace`（pm/admin）
**组件**：
- `TraceSearchBar`：按 trace_id / team / agent / time 检索
- `TraceSpanTree`：选中 trace 的 span 树状图（agent.invoke / a2a.request / team.transition / tool.execute / webhook.handle / todo.lifecycle）
- `SpanDetail`：点 span 显示详情（duration / payload / status）
- `LogJumpLink`：从 span 跳 Jaeger / Loki（外链）

---

### 4.10 用户管理 `/admin/users`（admin）
- `UserTable`：用户列表（name / email / role / jira_user_id / workspace）
- `UserCreateDialog` / `UserEditDialog`：增删改 + 角色分配
- `RoleBadge`：角色徽章

### 4.11 系统健康 `/admin/system`（admin）
- `SystemHealthCard`：事件循环延迟 / 并发 Team 数 / 并发 agent 调用数 / p95 延迟
- `FailedTeamsList`：failed 状态 Team + 复盘 Todo 入口
- `IdleTooLongAlert`：idle 过长的 Team 告警

### 4.12 个人设置 `/settings`
- 个人信息 / 主题切换 / 通知偏好 / API token

---

## 5. 共享组件库

### 5.1 布局组件
| 组件 | 职责 |
|------|------|
| `AppShell` | 三段式外壳（TopBar + Sidebar + content） |
| `Sidebar` | 角色化导航 |
| `TopBar` | workspace / 搜索 / WS 状态 / 通知 / 用户菜单 |
| `PageHeader` | 页面标题 + 面包屑 + 操作区 |
| `EmptyState` | 空状态插画 + 文案 + CTA |
| `LoadingSkeleton` | 骨架屏 |

### 5.2 业务展示组件
| 组件 | 职责 |
|------|------|
| `TeamCard` | Team 摘要卡（name + 状态 + bug + step） |
| `TeamStateMachineViewer` | 8 态状态机可视化 |
| `BugTaskProgress` | bug 子状态机进度条 |
| `TodoItem` / `TodoList` | Todo 行 / 列表 |
| `AgentStatusCard` / `AgentStatusList` | agent 状态行 / 列表 |
| `AgentCapabilityCard` | Agent Card 全字段展示 |
| `AgentCard` | agent 摘要卡 |
| `ActivityFeed` | 跨 Team 时间线 |
| `MetricsCard` / `MetricsChart` | 指标卡 / 图表 |
| `TraceSpanTree` / `SpanDetail` | trace 树 / span 详情 |
| `StateBadge` | 通用状态徽章（带状态色） |
| `ScopeTag` / `CapabilityTag` | scope / capability 标签 |

### 5.3 交互组件
| 组件 | 职责 |
|------|------|
| `CsvImportDialog` | CSV 拖拽 + 预览 + 校验 + 提交 |
| `TodoResolvePanel` | Todo 处理表单 |
| `AgentChat` | 流式 Chat（消息流 + 输入） |
| `CancelTeamDialog` | 取消 Team 确认 |
| `UserCreateDialog` / `UserEditDialog` | 用户增改 |
| `TraceSearchBar` | trace 检索 |
| `CommandPalette` | ⌘K 全局命令面板 |
| `WorkspaceSwitcher` | workspace 切换 |

### 5.4 反馈组件
| 组件 | 职责 |
|------|------|
| `Toast`（sonner） | 操作反馈 |
| `WsStatusIndicator` | WS 连接状态 |
| `NotificationBell` | 通知铃 + 下拉 |
| `ConfirmDialog` | 危险操作确认 |

---

## 6. 实时数据与状态管理

### 6.1 WebSocket 事件流
连接 `/ws?workspace=xxx&token=xxx`，按房间订阅（`team:{id}` / `user:{id}` / `global`）。

| 事件 | 触发 | 前端响应 |
|------|------|---------|
| `team.state_changed` | Team 状态转换 | TeamCard 状态色变 + StateMachineViewer 高亮 |
| `bug.progress` | bug 子状态推进 | BugTaskProgress 推进 + ActivityFeed 追加 |
| `todo.created` | agent 创建 Todo | TodoList 新增 + 通知铃 + 红点 |
| `todo.resolved` | 用户 resolve Todo | TodoList 移除 + Team 恢复提示 |
| `agent.status_changed` | agent 状态变化 | AgentStatusList 更新 |
| `bug.completed` | bug 修复完成 | toast + TeamCard 变蓝 + PR 链接 |
| `chat.stream` | agent 流式回包 | ChatMessageList 追加 token |

### 6.2 状态色系统（附录 D.1，全局统一）
| 颜色 | 状态 | 含义 |
|------|------|------|
| 🟠 橙 | In Progress | agent 工作中 / todo 待处理 |
| 🔵 蓝 | Done | 任务完成 |
| 🟣 紫 | In Review | PR 已提交待审核 |
| ⚪ 灰 | Idle | agent 空闲 / Team 待触发 |
| 🔴 红 | Error | 失败 / 阻塞 |

### 6.3 状态管理分层
- **Zustand**：`authStore`（JWT/user/role）、`wsStore`（连接/订阅/事件队列）、`uiStore`（sidebar 折叠/主题/过滤）
- **TanStack Query**：服务端状态（projects/teams/todos/agents/metrics/traces），WS 事件触发 `queryClient.invalidateQueries` 刷新
- **React state**：组件内局部状态

---

## 7. 需要安装的工具与依赖

### 7.1 初始化项目
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
cd frontend
```

### 7.2 UI 与样式
```bash
# shadcn/ui 初始化（会带 Radix UI + Tailwind + lucide-react + class-variance-authority + tailwind-merge）
npx shadcn-ui@latest init

# 常用 shadcn 组件（按需加）
npx shadcn-ui@latest add button card dialog dropdown-menu input label select \
  table tabs toast badge avatar separator skeleton tooltip command popover \
  sheet sonner alert-dialog form scroll-area
```

### 7.3 状态与数据
```bash
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
```

### 7.4 实时通信
```bash
# 原生 WebSocket 即可，封装一个 Hub 客户端；如需重连/心跳可加：
npm install reconnecting-websocket
```

### 7.5 图表
```bash
# Tremor（与 shadcn 风格一致，推荐）
npm install @tremor/react
# 或 Recharts（更灵活）
# npm install recharts
```

### 7.6 工具库
```bash
npm install date-fns          # 日期
npm install jwt-decode        # 解析 JWT
npm install next-themes       # 深色模式
npm install cmdk              # 命令面板（shadcn command 依赖）
npm install lucide-react      # 图标（shadcn 已带）
```

### 7.7 开发与测试
```bash
npm install -D prettier prettier-plugin-tailwindcss
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test          # E2E
npm install -D @types/node
```

### 7.8 依赖清单汇总
| 类别 | 包 |
|------|----|
| 框架 | next, react, react-dom, typescript |
| UI | shadcn/ui, tailwindcss, @radix-ui/*, lucide-react, class-variance-authority, tailwind-merge, clsx |
| 数据 | @tanstack/react-query, zustand |
| 表单 | react-hook-form, @hookform/resolvers, zod |
| 实时 | reconnecting-websocket |
| 图表 | @tremor/react |
| 工具 | date-fns, jwt-decode, next-themes, cmdk, sonner |
| 测试 | vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @playwright/test |
| 开发 | prettier, prettier-plugin-tailwindcss, @types/node |

---

## 8. 后续开发建议顺序
1. **脚手架**：Next.js + shadcn + Tailwind token + 主题 + AppShell 骨架
2. **认证**：登录页 + JWT + 路由守卫 + 角色重定向
3. **数据层**：TanStack Query 封装 + WebSocket Hub 客户端 + Zustand stores
4. **普通用户视图**：dashboard 三栏（Todo / AgentStatus / Chat）—— 跑通实时推送
5. **PM 视图**：overview + projects 导入 + teams 总览
6. **Team 详情**：状态机可视化 + bug 进度（核心页）
7. **Todo 详情 + 处理回路**：跑通人机协作闭环
8. **Agent 详情 + Chat**：流式回包
9. **Metrics + Trace**：图表 + trace 树
10. **Admin 页**：用户管理 + 系统健康
11. **打磨**：动效、空状态、骨架屏、命令面板
