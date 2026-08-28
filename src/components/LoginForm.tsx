import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type Mode = "login" | "signup";

export function LoginForm({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setStatus("idle");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setError("Password must be at least 6 characters.");
      return;
    }

    setStatus("sending");
    setError(null);

    const { data, error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });

    if (authError) {
      setStatus("error");
      setError(authError.message);
      return;
    }

    if (!data.session) {
      // No error, but also no session: Supabase is waiting on email
      // confirmation before it'll issue one. Say so explicitly instead of
      // silently closing the modal with nothing having changed.
      setStatus("error");
      setError(
        mode === "signup"
          ? "Account created, but email confirmation is still required on this project — ask the admin to turn off 'Confirm email' under Authentication settings, then try again."
          : "Signed in, but this account still needs email confirmation. Ask the admin to confirm it or turn off 'Confirm email' in Authentication settings."
      );
      return;
    }

    // A successful sign-in/sign-up triggers onAuthStateChange in useAuthSession,
    // which swaps the whole app over to the Dashboard — nothing else to do here.
    onClose();
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="login-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h3>{mode === "login" ? "Log In" : "Create Account"}</h3>
        <p>
          {mode === "login"
            ? "Enter the email and password you signed up with."
            : "Use the email you applied with to create your dashboard login."}
        </p>

        <div className="login-mode-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {status === "error" && error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
            {status === "sending"
              ? "Please wait…"
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
