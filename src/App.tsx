import { useState } from "react";
import { Landing } from "./components/Landing";
import { ApplicationForm } from "./components/ApplicationForm";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { useAuthSession } from "./hooks/useAuthSession";

export default function App() {
  const session = useAuthSession();
  const [showLogin, setShowLogin] = useState(false);

  if (session === undefined) {
    return <div className="app-shell" />;
  }

  if (session) {
    return (
      <div className="app-shell">
        <Dashboard session={session} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Landing onLoginClick={() => setShowLogin(true)} />
      <div id="apply">
        <ApplicationForm />
      </div>
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}
