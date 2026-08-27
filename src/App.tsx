import { useState } from "react";
import { Landing } from "./components/Landing";
import { ApplicationForm } from "./components/ApplicationForm";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { useAuthSession } from "./hooks/useAuthSession";
import { useContributorAccess } from "./hooks/useContributorAccess";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const session = useAuthSession();
  const access = useContributorAccess(session ?? null);
  const [showLogin, setShowLogin] = useState(false);

  if (session === undefined) {
    return <div className="app-shell" />;
  }

  if (session) {
    if (access.status === "loading") {
      return (
        <div className="app-shell">
          <p className="section-sub" style={{ padding: "40px 0", textAlign: "center" }}>
            Checking access…
          </p>
        </div>
      );
    }

    if (access.status === "denied") {
      return (
        <div className="app-shell">
          <div className="no-access">
            <span className="eyebrow">Verso Network</span>
            <h1>Dashboard access pending</h1>
            <p className="section-sub">
              Signed in as {session.user.email}. This dashboard is only available to approved
              contributors — you'll get access once your application is reviewed.
            </p>
            <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
              Sign Out
            </button>
          </div>
        </div>
      );
    }

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
