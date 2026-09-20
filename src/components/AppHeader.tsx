import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export function AppHeader({ roleLabel, navSlot }: { roleLabel: string; navSlot?: ReactNode }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-background/80 shadow-[0_1px_0_hsl(var(--accent)/0.25)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
          <img
            src="/logo.png"
            alt="logo"
            className="h-9 w-9 shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(15,23,42,0.35)] sm:h-10 sm:w-10"
          />
          <div className="min-w-0 leading-tight">
            <p
              className="animate-gradient-text truncate bg-clip-text text-xl font-extrabold tracking-tight text-transparent"
              style={{
                fontFamily: "'Blern', sans-serif",
                backgroundImage: "linear-gradient(90deg, var(--brand-gradient-stops))",
              }}
            >
              Financial
            </p>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              ระบบติดตามจัดเก็บเอกสารแผนปฏิบัติการและงบประมาณ
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">ระบบพร้อมใช้งาน</span>
          </div>
          {navSlot}
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground md:flex">
              {roleLabel}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
