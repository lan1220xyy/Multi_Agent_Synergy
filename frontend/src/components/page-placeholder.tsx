import { Card, CardContent } from "@/components/ui/card";

/**
 * 页面占位 —— 未实现的页面用此组件，避免跳转 404
 * 后续逐步替换为真实页面
 */
export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Card>
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          待实现
        </CardContent>
      </Card>
    </div>
  );
}
