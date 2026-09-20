export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="app-shell">
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Verso Network</span>
            <h1>Privacy Policy</h1>
            <p className="section-sub">Last updated September 2026</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back to Verso Network
          </button>
        </div>

        <div className="form-section">
          <p className="section-sub">
            This is a plain-language description of what Verso Network actually collects and how
            it's actually used — not boilerplate. It's a working draft and hasn't been reviewed by
            a lawyer; treat it as an honest description of current practice, not a final legal
            document.
          </p>
        </div>

        <div className="form-section">
          <h2 style={{ fontSize: 20 }}>What we collect</h2>
          <p className="section-sub">
            When you apply: your name, email, and LinkedIn URL, plus the role, expertise areas,
            availability, compensation expectations, and industries you tell us about.
          </p>
          <p className="section-sub">
            When you create an account: your email and password (handled by our authentication
            provider, Supabase — we never see or store your password ourselves).
          </p>
          <p className="section-sub">
            When you fill out your profile: whatever you choose to share — bio, profession, years
            of experience, location, time zone, languages, portfolio links, and the skills,
            occupations, and industries you tag yourself with.
          </p>
          <p className="section-sub">
            If you take the AI literacy assessment: your answers, your score, and — only if you
            pass and choose to claim the reward — a PayPal email address to send the $5 to.
          </p>
        </div>

        <div className="form-section">
          <h2 style={{ fontSize: 20 }}>What we don't do</h2>
          <p className="section-sub">
            Creating an account or filling out a profile never means your data is used to train or
            evaluate AI models. That would only ever happen for a specific project you individually
            submit work for, with its own separate, explicit agreement at that time — and no such
            project-submission feature exists in Verso Network yet.
          </p>
          <p className="section-sub">
            We don't share your profile with companies you're matched to, and we don't email you
            about opportunities, unless you turn those on yourself. Both are off by default.
          </p>
        </div>

        <div className="form-section">
          <h2 style={{ fontSize: 20 }}>Your controls</h2>
          <p className="section-sub">
            The Profile tab on your dashboard has two toggles — sharing your profile with matched
            companies, and opportunity emails — that you can turn on or off at any time. Every
            change is recorded with a timestamp, so there's a real record of what you agreed to and
            when, not just whatever the current setting happens to be.
          </p>
        </div>

        <div className="form-section">
          <h2 style={{ fontSize: 20 }}>Who else sees it</h2>
          <p className="section-sub">
            Your data is stored with Supabase (database and authentication) and hosted on Vercel.
            Transactional email (like sign-in-related messages) goes through Resend. If you pass the
            assessment and provide a PayPal email, that's used solely to send your $5 reward via
            PayPal. We don't sell data, and we don't share it with any other third party beyond what's
            described above.
          </p>
        </div>

        <div className="form-section">
          <h2 style={{ fontSize: 20 }}>Questions or requests</h2>
          <p className="section-sub">
            To ask a question, or to request that your data be corrected or deleted, email{" "}
            <a href="mailto:melissa@melwrites.com">melissa@melwrites.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
