import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

export function LoginForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="login-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {status === "sent" ? (
          <>
            <h3>Check your email</h3>
            <p>We sent a sign-in link to {email}. Click it to log in to your dashboard.</p>
          </>
        ) : (
          <>
            <h3>Log In</h3>
            <p>Enter the email you applied with — we'll send you a one-click sign-in link.</p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {status === "error" && error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send Sign-In Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
