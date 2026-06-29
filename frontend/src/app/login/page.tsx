"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Bot, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_HOME } from "@/lib/types";
import type { Role } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * 演示用快捷登录 —— 后端未就绪时用 mock 账号直接进入
 * 对应需求文档 §4.1 三角色 RBAC
 */
const DEMO_ACCOUNTS: { email: string; role: Role; name: string }[] = [
  { email: "admin@demo.io", role: "admin", name: "管理员" },
  { email: "pm@demo.io", role: "pm", name: "项目经理" },
  { email: "user@demo.io", role: "user", name: "工程师" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      // TODO: 接入真实后端 POST /api/auth/login
      // const res = await fetch("/api/auth/login", { ... })
      // 暂用 mock：按邮箱前缀判定角色
      await new Promise((r) => setTimeout(r, 600));

      const demo = DEMO_ACCOUNTS.find((a) => a.email === data.email);
      const role: Role = demo?.role ?? "user";
      const name = demo?.name ?? data.email.split("@")[0];

      setAuth("mock-jwt-" + crypto.randomUUID(), {
        id: "u_" + role,
        name,
        email: data.email,
        role,
        workspaceId: "default",
      });

      toast.success("登录成功");
      router.replace(ROLE_HOME[role]);
    } catch {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(email: string) {
    setValue("email", email);
    setValue("password", "demo123");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo + 标题 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">多 Agent 管理平台</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            登录以管理你的 Agent 团队
          </p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-state-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                忘记密码？
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-state-error">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {loading ? "登录中…" : "登录"}
          </Button>
        </form>

        {/* 演示账号快捷入口 */}
        <div className="mt-4 rounded-lg border border-dashed border-border p-3">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            演示账号（点击快速填充）
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => quickFill(acc.email)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
