import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import LoginPage from "@/pages/LoginPage";
import PersonnelPage from "@/pages/PersonnelPage";
import ScanPage from "@/pages/ScanPage";
import RecentScansPage from "@/pages/RecentScansPage";
import { Toaster } from "@/components/ui/toaster";

function Shell() {
  const { user } = useAuth();
  const [view, setView] = useState<"scan" | "scanList" | "personnel">("scan");

  if (!user) return <LoginPage />;
  if (view === "personnel") return <PersonnelPage onBack={() => setView("scan")} />;
  if (view === "scanList")
    return (
      <RecentScansPage onBack={() => setView("scan")} onOpenPersonnel={() => setView("personnel")} />
    );
  return (
    <ScanPage
      onOpenPersonnel={() => setView("personnel")}
      onOpenRecentScans={() => setView("scanList")}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
