import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

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
        backgroundImage: "linear-gradient(120deg, #7a1f2b, #d4212c, #d4af37, #d4212c, #7a1f2b)",
      }}
    >
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-accent/25 bg-card p-6 shadow-2xl shadow-black/30">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-24 w-24 items-center justify-center">
              <img
                src="/logo.png"
                alt="logo"
                className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(15,23,42,0.35)]"
              />
            </div>
            <div className="space-y-1">
              <h1
                className="animate-gradient-text bg-clip-text text-5xl font-semibold tracking-tight text-transparent"
                style={{
                  fontFamily: "'Blern', sans-serif",
                  backgroundImage: "linear-gradient(90deg, #7a1f2b, #d4212c, #d4af37, #d4212c, #7a1f2b)",
                }}
              >
                Financial
              </h1>
              <p className="text-sm text-muted-foreground">
                ระบบติดตามแผนปฏิบัติการ
                <br className="sm:hidden" />
                และงบประมาณราชกัญญาฯ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้"
                className="rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
