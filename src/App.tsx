import { AuthProvider, useAuth } from "@/lib/auth-context";
import LoginPage from "@/pages/LoginPage";
import PersonnelPage from "@/pages/PersonnelPage";

function Shell() {
  const { user } = useAuth();
  return user ? <PersonnelPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
