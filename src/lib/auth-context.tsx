import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "./types";
import { login as loginApi } from "./personnel-api";

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const result = await loginApi(username, password);
      if (!result) {
        return { ok: false, error: "Username หรือ Password ไม่ถูกต้อง" };
      }
      setUser(result);
      return { ok: true };
    } catch {
      return { ok: false, error: "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่" };
    }
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
