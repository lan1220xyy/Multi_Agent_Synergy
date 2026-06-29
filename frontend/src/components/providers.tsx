"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useHydrated } from "@/lib/use-hydrated";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // next-themes 需要 mounted 守卫避免 hydration mismatch
  const hydrated = useHydrated();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {hydrated ? children : null}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--popover)",
              border: "1px solid var(--border)",
              color: "var(--popover-foreground)",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
