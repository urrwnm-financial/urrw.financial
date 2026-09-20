import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, AlertCircle, User, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error ?? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  return (
    <div
      className="animate-gradient-bg flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: "linear-gradient(120deg, var(--brand-gradient-stops))",
      }}
    >
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-accent/25 bg-card p-6 shadow-2xl shadow-black/30">
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center">
              <img
                src="/logo.png"
                alt="logo"
                className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(15,23,42,0.35)]"
              />
            </div>
            <div className="space-y-1">
              <h1
                className="animate-gradient-text bg-clip-text text-4xl font-semibold tracking-tight text-transparent"
                style={{
                  fontFamily: "'Blern', sans-serif",
                  backgroundImage: "linear-gradient(90deg, var(--brand-gradient-stops))",
                }}
              >
                Financial
              </h1>
              <p className="text-sm text-muted-foreground">
                ระบบติดตามจัดเก็บเอกสารแผนปฏิบัติการและงบประมาณ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                className="peer h-12 rounded-xl border-input bg-secondary/70 pl-10 pt-3 shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:bg-card focus-visible:shadow-[0_0_0_3px_hsl(var(--accent)/0.25)] focus-visible:ring-0"
                required
              />
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-all duration-300 peer-focus:-translate-y-[15px] peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:-translate-y-[15px] peer-[:not(:placeholder-shown)]:opacity-0" />
              <Label
                htmlFor="username"
                className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 px-1 text-sm text-muted-foreground transition-all duration-300 peer-focus:left-3 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-card peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:text-xs"
              >
                ชื่อผู้ใช้
              </Label>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer h-12 rounded-xl border-input bg-secondary/70 pl-10 pr-10 pt-3 shadow-inner transition-all duration-300 focus-visible:border-accent focus-visible:bg-card focus-visible:shadow-[0_0_0_3px_hsl(var(--accent)/0.25)] focus-visible:ring-0"
                required
              />
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-all duration-300 peer-focus:-translate-y-[15px] peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:-translate-y-[15px] peer-[:not(:placeholder-shown)]:opacity-0" />
              <Label
                htmlFor="password"
                className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 px-1 text-sm text-muted-foreground transition-all duration-300 peer-focus:left-3 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-card peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:text-xs"
              >
                รหัสผ่าน
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
