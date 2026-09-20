import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "./types";
import { login as loginApi } from "./personnel-api";

interface Credentials {
  username: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  credentials: Credentials | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const result = await loginApi(username, password);
      if (!result) {
        return { ok: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }
      setUser(result);
      setCredentials({ username, password });
      return { ok: true };
    } catch (err) {
      console.error("login failed", err);
      const code = (err as { code?: string } | null)?.code;
      if (code) {
        // Postgres/PostgREST rejected the call itself (e.g. bad credentials
        // raised by the `login` RPC) — a real server round-trip happened.
        return { ok: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }
      // No error code means the request never reached the server (network/DNS/CORS).
      return { ok: false, error: "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่" };
    }
  };

  const logout = () => {
    setUser(null);
    setCredentials(null);
  };

  return (
    <AuthContext.Provider value={{ user, credentials, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
